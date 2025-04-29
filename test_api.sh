#!/bin/bash
set -e

# Variables
API_URL="http://localhost:3000"
ADMIN_KEY="dev_admin_key" # À remplacer par votre clé admin

echo "=== TEST DE L'API DE GESTION DE LICENCES ==="
echo "URL de l'API: $API_URL"
echo "-------------------------------------------"

echo -e "\n1. Vérification de l'état de l'API"
echo "-------------------------------------------"
curl -s $API_URL
echo -e "\n✓ API accessible\n"

echo -e "2. Création d'un tenant"
echo "-------------------------------------------"
TENANT_RESPONSE=$(curl -s -X POST $API_URL/tenants \
  -H "Content-Type: application/json" \
  -H "x-admin-key: $ADMIN_KEY" \
  -d '{ "name": "Tenant de Test" }')

echo $TENANT_RESPONSE

# Extraction des informations du tenant
if [[ $TENANT_RESPONSE == *"id"* ]]; then
  TENANT_ID=$(echo $TENANT_RESPONSE | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
  TENANT_API_KEY=$(echo $TENANT_RESPONSE | grep -o '"apiKey":"[^"]*"' | cut -d'"' -f4)
  echo -e "\n✓ Tenant créé avec succès"
  echo "ID du tenant: $TENANT_ID"
  echo "API Key: $TENANT_API_KEY"
else
  echo -e "\n❌ Échec de la création du tenant"
  echo "Vérifiez que votre clé admin est correcte et que l'API est en cours d'exécution."
  exit 1
fi

echo -e "\n3. Liste des tenants"
echo "-------------------------------------------"
TENANTS_RESPONSE=$(curl -s -X GET $API_URL/tenants \
  -H "x-admin-key: $ADMIN_KEY")
echo $TENANTS_RESPONSE

if [[ $TENANTS_RESPONSE == *"$TENANT_ID"* ]]; then
  echo -e "\n✓ Tenant listé avec succès"
else
  echo -e "\n❌ Le tenant créé n'apparaît pas dans la liste"
  exit 1
fi

echo -e "\n4. Suppression du tenant"
echo "-------------------------------------------"
DELETE_RESPONSE=$(curl -s -X DELETE $API_URL/tenants/$TENANT_ID \
  -H "x-admin-key: $ADMIN_KEY" -w "\nCode de statut : %{http_code}\n")
echo $DELETE_RESPONSE

if [[ $DELETE_RESPONSE == *"Code de statut : 204"* ]]; then
  echo -e "\n✓ Tenant supprimé avec succès"
else
  echo -e "\n❌ Échec de la suppression du tenant"
  exit 1
fi

echo -e "\n5. Vérification que le tenant a été supprimé"
echo "-------------------------------------------"
TENANTS_AFTER_DELETE=$(curl -s -X GET $API_URL/tenants \
  -H "x-admin-key: $ADMIN_KEY")
echo $TENANTS_AFTER_DELETE

if [[ $TENANTS_AFTER_DELETE != *"$TENANT_ID"* ]]; then
  echo -e "\n✓ Tenant bien supprimé de la liste"
else
  echo -e "\n❌ Le tenant supprimé apparaît toujours dans la liste"
  exit 1
fi

echo -e "\n6. Test avec une clé admin invalide"
echo "-------------------------------------------"
INVALID_RESPONSE=$(curl -s -X GET $API_URL/tenants \
  -H "x-admin-key: clé_invalide")
echo $INVALID_RESPONSE

if [[ $INVALID_RESPONSE == *"Non autorisé"* || $INVALID_RESPONSE == *"error"* ]]; then
  echo -e "\n✓ Authentification correctement vérifiée"
else
  echo -e "\n❌ L'API accepte des clés invalides"
  exit 1
fi

echo -e "\n=== RÉSUMÉ DES TESTS ==="
echo "✓ État de l'API vérifié"
echo "✓ Création de tenant testée"
echo "✓ Liste des tenants testée"
echo "✓ Suppression de tenant testée"
echo "✓ Vérification post-suppression testée"
echo "✓ Authentification testée"
echo -e "\n✅ TOUS LES TESTS ONT RÉUSSI !"
echo -e "==============================\n" 