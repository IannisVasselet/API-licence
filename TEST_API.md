# Guide de Test de l'API de Gestion de Licences

Ce document explique comment tester l'API de gestion de licences multi-tenant, y compris les exemples de requêtes et les réponses attendues pour chaque endpoint.

## Table des matières
1. [Outils requis](#outils-requis)
2. [Configuration préalable](#configuration-préalable)
3. [Test de l'état de l'API](#test-de-létat-de-lapi)
4. [Test des endpoints admin](#test-des-endpoints-admin)
5. [Test des endpoints tenant](#test-des-endpoints-tenant)
6. [Collection Postman](#collection-postman)
7. [Tests automatisés](#tests-automatisés)

## Outils requis

Pour tester l'API, vous pouvez utiliser l'un des outils suivants :
- [curl](https://curl.se/) : Outil en ligne de commande pour les requêtes HTTP
- [Postman](https://www.postman.com/) : Application graphique pour tester les API
- [Insomnia](https://insomnia.rest/) : Alternative à Postman
- [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) : Extension VS Code

Les exemples dans ce guide utiliseront principalement `curl` pour sa disponibilité universelle.

## Configuration préalable

Avant de commencer les tests, assurez-vous que :
1. L'API est en cours d'exécution (voir [INSTALLATION.md](INSTALLATION.md))
2. Vous avez accès aux informations d'authentification admin

Pour faciliter les tests, définissez les variables d'environnement suivantes :

```bash
# URL de base de l'API
export API_URL=http://localhost:3000

# Clé admin pour les opérations administratives
export ADMIN_KEY=votre_clé_admin
```

## Test de l'état de l'API

Commencez par vérifier que l'API est en cours d'exécution :

```bash
curl $API_URL
```

Réponse attendue :
```json
{
  "message": "API de gestion de licences opérationnelle",
  "version": "1.0.0",
  "environment": "development"
}
```

## Test des endpoints admin

### Création d'un tenant

```bash
curl -X POST $API_URL/tenants \
  -H "Content-Type: application/json" \
  -H "x-admin-key: $ADMIN_KEY" \
  -d '{
    "name": "Tenant Test"
  }'
```

Réponse attendue :
```json
{
  "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "name": "Tenant Test",
  "apiKey": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
  "active": true,
  "createdAt": "2023-06-15T14:30:00.000Z"
}
```

**Important :** Conservez l'`id` et l'`apiKey` retournés pour les tests suivants.

```bash
# Assignez les valeurs retournées à des variables pour une utilisation ultérieure
export TENANT_ID=f47ac10b-58cc-4372-a567-0e02b2c3d479
export TENANT_API_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
```

### Liste des tenants

```bash
curl -X GET $API_URL/tenants \
  -H "x-admin-key: $ADMIN_KEY"
```

Réponse attendue :
```json
[
  {
    "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "name": "Tenant Test",
    "active": true,
    "createdAt": "2023-06-15T14:30:00.000Z",
    "updatedAt": "2023-06-15T14:30:00.000Z"
  }
]
```

### Suppression d'un tenant

```bash
curl -X DELETE $API_URL/tenants/$TENANT_ID \
  -H "x-admin-key: $ADMIN_KEY"
```

Réponse attendue : Code 204 (No Content)

Vérifiez que le tenant a été supprimé :
```bash
curl -X GET $API_URL/tenants \
  -H "x-admin-key: $ADMIN_KEY"
```

Réponse attendue : Un tableau vide ou sans le tenant supprimé.

## Test des endpoints tenant

Pour tester les endpoints spécifiques aux tenants, vous devez d'abord créer un nouveau tenant :

```bash
curl -X POST $API_URL/tenants \
  -H "Content-Type: application/json" \
  -H "x-admin-key: $ADMIN_KEY" \
  -d '{
    "name": "Tenant Test"
  }'
```

Enregistrez l'`id` et l'`apiKey` retournés :
```bash
export TENANT_ID=nouveau_tenant_id
export TENANT_API_KEY=nouvelle_api_key
```

### Création de nouvelles licences

Cette fonctionnalité pourrait être implémentée dans une future version de l'API. La requête ressemblerait à ceci :

```bash
curl -X POST $API_URL/licenses \
  -H "Content-Type: application/json" \
  -H "x-api-key: $TENANT_API_KEY" \
  -d '{
    "customerId": "client123",
    "productId": "produit456",
    "startDate": "2023-06-15T00:00:00.000Z",
    "endDate": "2024-06-14T23:59:59.999Z"
  }'
```

### Test avec une clé invalide

Testez le comportement de l'API avec une clé API invalide :

```bash
curl -X GET $API_URL/tenants \
  -H "x-admin-key: clé_invalide"
```

Réponse attendue :
```json
{
  "error": "Non autorisé"
}
```

## Collection Postman

Pour faciliter le test, une collection Postman est disponible. Suivez ces étapes pour l'utiliser :

1. Téléchargez [Postman](https://www.postman.com/downloads/)
2. Importez la collection depuis le fichier `licence-api-collection.json`
3. Créez un environnement avec les variables suivantes :
   - `apiUrl` : URL de base de l'API (par exemple, `http://localhost:3000`)
   - `adminKey` : Votre clé d'administrateur
   - `tenantApiKey` : API key du tenant (sera remplie automatiquement après création)
   - `tenantId` : ID du tenant (sera rempli automatiquement après création)

## Tests automatisés

Le projet inclut des tests automatisés que vous pouvez exécuter pour vérifier l'intégrité de l'API :

```bash
# Exécuter tous les tests
npm test

# Exécuter uniquement les tests d'intégration
npm run test:integration

# Exécuter uniquement les tests unitaires
npm run test:unit
```

Les tests automatisés vérifient :
- La validation des entrées
- L'authentification et l'autorisation
- Les opérations CRUD
- La gestion des erreurs
- Les performances (tests de charge optionnels)

## Exemple de flux de test complet

Voici un script shell qui teste le flux complet des opérations principales :

```bash
#!/bin/bash
set -e

# Variables
API_URL="http://localhost:3000"
ADMIN_KEY="votre_clé_admin"

echo "1. Vérification de l'état de l'API"
curl -s $API_URL

echo -e "\n\n2. Création d'un tenant"
TENANT_RESPONSE=$(curl -s -X POST $API_URL/tenants \
  -H "Content-Type: application/json" \
  -H "x-admin-key: $ADMIN_KEY" \
  -d '{ "name": "Tenant de Test" }')

echo $TENANT_RESPONSE

# Extraction des informations du tenant
TENANT_ID=$(echo $TENANT_RESPONSE | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
TENANT_API_KEY=$(echo $TENANT_RESPONSE | grep -o '"apiKey":"[^"]*"' | cut -d'"' -f4)

echo -e "\n\n3. Liste des tenants"
curl -s -X GET $API_URL/tenants \
  -H "x-admin-key: $ADMIN_KEY"

echo -e "\n\n4. Suppression du tenant"
curl -s -X DELETE $API_URL/tenants/$TENANT_ID \
  -H "x-admin-key: $ADMIN_KEY" -w "\nCode de statut : %{http_code}\n"

echo -e "\n\n5. Vérification que le tenant a été supprimé"
curl -s -X GET $API_URL/tenants \
  -H "x-admin-key: $ADMIN_KEY"

echo -e "\n\nTests terminés avec succès!"
```

Enregistrez ce script dans un fichier `test_api.sh`, rendez-le exécutable (`chmod +x test_api.sh`), puis exécutez-le.

## Génération d'un rapport de test

Pour générer un rapport de test complet, exécutez :

```bash
npm run test:report
```

Le rapport sera disponible dans le dossier `coverage/`. 