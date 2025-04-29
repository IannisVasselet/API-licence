# Guide d'Installation de l'API de Gestion de Licences

Ce document détaille les étapes nécessaires pour installer et configurer l'API de gestion de licences multi-tenant.

## Table des matières
1. [Prérequis](#prérequis)
2. [Installation avec Docker (recommandée)](#installation-avec-docker-recommandée)
3. [Installation manuelle](#installation-manuelle)
4. [Configuration](#configuration)
5. [Déploiement en production](#déploiement-en-production)
6. [Dépannage](#dépannage)

## Prérequis

Avant de commencer l'installation, assurez-vous d'avoir les éléments suivants :

### Pour l'installation avec Docker
- Docker Engine (version 19.03 ou supérieure)
- Docker Compose (version 1.27 ou supérieure)
- Git

### Pour l'installation manuelle
- Node.js (version 18.x ou supérieure)
- npm (version 7.x ou supérieure)
- PostgreSQL (version 15.x ou supérieure)
- Redis (version 7.x ou supérieure)
- Git

## Installation avec Docker (recommandée)

L'installation avec Docker est la méthode la plus simple et garantit un environnement cohérent.

### Étape 1 : Cloner le dépôt

```bash
git clone https://github.com/votre-organisation/licence-api.git
cd licence-api
```

### Étape 2 : Configurer les variables d'environnement

Créez un fichier `.env` à la racine du projet :

```bash
cp .env.example .env
```

Modifiez le fichier `.env` selon vos besoins. Pour un environnement de développement, les valeurs par défaut sont généralement suffisantes.

### Étape 3 : Démarrer les conteneurs

```bash
docker-compose up -d
```

Cette commande télécharge les images nécessaires, construit l'application et démarre trois conteneurs :
- `app` : L'API Node.js
- `postgres` : La base de données PostgreSQL
- `redis` : Le cache Redis

### Étape 4 : Vérifier l'installation

```bash
curl http://localhost:3000
```

Vous devriez recevoir une réponse JSON confirmant que l'API est opérationnelle.

## Installation manuelle

Si vous préférez installer l'application sans Docker, suivez ces étapes.

### Étape 1 : Cloner le dépôt

```bash
git clone https://github.com/votre-organisation/licence-api.git
cd licence-api
```

### Étape 2 : Installer les dépendances

```bash
npm install
```

### Étape 3 : Configurer PostgreSQL

Installez PostgreSQL sur votre système, puis créez une base de données :

```bash
psql -U postgres
CREATE DATABASE licence_db;
\q
```

### Étape 4 : Configurer Redis

Installez et démarrez Redis sur votre système.

### Étape 5 : Configurer les variables d'environnement

Créez un fichier `.env` à la racine du projet :

```bash
cp .env.example .env
```

Modifiez le fichier `.env` pour correspondre à votre configuration locale :

```
# Configuration du serveur
PORT=3000
NODE_ENV=development

# Configuration de la base de données PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=licence_db
DB_USER=postgres
DB_PASSWORD=votre_mot_de_passe

# Configuration Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Configuration de sécurité
API_KEY_SECRET=votre_clé_secrète
ADMIN_API_KEY=votre_clé_admin
```

### Étape 6 : Compiler et démarrer l'application

```bash
# Compiler le code TypeScript
npm run build

# Démarrer l'application
npm start

# Ou en mode développement
npm run dev
```

## Configuration

### Variables d'environnement essentielles

| Variable | Description | Valeur par défaut |
|----------|-------------|-------------------|
| PORT | Port sur lequel l'API écoute | 3000 |
| NODE_ENV | Environnement (development, production) | development |
| DB_HOST | Hôte de la base de données | localhost |
| DB_PORT | Port de la base de données | 5432 |
| DB_NAME | Nom de la base de données | licence_db |
| DB_USER | Utilisateur de la base de données | postgres |
| DB_PASSWORD | Mot de passe de la base de données | password |
| REDIS_HOST | Hôte du serveur Redis | localhost |
| REDIS_PORT | Port du serveur Redis | 6379 |
| API_KEY_SECRET | Clé secrète pour signer les API keys | - |
| ADMIN_API_KEY | Clé pour accéder aux endpoints administratifs | - |

### Configuration de sécurité

Pour la production, assurez-vous de :
1. Générer des clés aléatoires fortes pour `API_KEY_SECRET` et `ADMIN_API_KEY`
2. Utiliser des mots de passe robustes pour les bases de données
3. Configurer HTTPS avec un certificat valide

## Déploiement en production

### Préparation de l'image Docker

```bash
# Construire l'image Docker
docker build -t votre-organisation/licence-api:latest .

# Pousser l'image vers Docker Hub
docker push votre-organisation/licence-api:latest
```

### Configuration cloud recommandée

- **AWS** : Utilisez ECS pour les conteneurs, RDS pour PostgreSQL et ElastiCache pour Redis
- **Azure** : Utilisez AKS pour les conteneurs, Azure Database pour PostgreSQL et Azure Cache pour Redis
- **GCP** : Utilisez GKE pour les conteneurs, Cloud SQL pour PostgreSQL et Memorystore pour Redis

## Dépannage

### Problèmes courants

#### L'API ne démarre pas

Vérifiez les logs :
```bash
# Avec Docker
docker-compose logs app

# Sans Docker
npm run dev
```

#### Erreurs de connexion à la base de données

1. Vérifiez que PostgreSQL est en cours d'exécution
2. Vérifiez que les informations de connexion dans `.env` sont correctes
3. Assurez-vous que la base de données existe

#### Erreurs de connexion Redis

1. Vérifiez que Redis est en cours d'exécution
2. Vérifiez les paramètres de connexion dans `.env`

### Obtenir de l'aide

Si vous rencontrez des problèmes persistants, veuillez :
1. Consulter les issues GitHub du projet
2. Ouvrir une nouvelle issue avec une description détaillée du problème
3. Inclure les logs pertinents et les étapes pour reproduire le problème 