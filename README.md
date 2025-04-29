# API de Gestion de Licences Multi-tenant

Une API REST moderne pour gérer des licences clients dans le cloud avec architecture microservices et multi-tenant.

## Architecture

Cette API est conçue avec une architecture microservices et multi-tenant, utilisant:

- Node.js avec Express et TypeScript
- PostgreSQL comme base de données principale
- Redis pour le cache
- Docker pour la conteneurisation
- Authentication par API Keys

## Configuration requise

- Node.js 18+
- Docker et Docker Compose
- PostgreSQL 15+
- Redis 7+

## Installation

### Avec Docker (recommandé)

```bash
# Cloner le dépôt
git clone https://github.com/votre-organisation/licence-api.git
cd licence-api

# Démarrer avec Docker Compose
docker-compose up -d
```

### Installation manuelle

```bash
# Cloner le dépôt
git clone https://github.com/votre-organisation/licence-api.git
cd licence-api

# Installer les dépendances
npm install

# Compiler le code TypeScript
npm run build

# Démarrer le serveur
npm start
```

## Variables d'environnement

Créez un fichier `.env` à la racine du projet avec les variables suivantes:

```
# Configuration du serveur
PORT=3000
NODE_ENV=development

# Configuration de la base de données PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=licence_db
DB_USER=postgres
DB_PASSWORD=password

# Configuration Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Configuration de sécurité
API_KEY_SECRET=your_secret_key_here
ADMIN_API_KEY=your_admin_key_here
```

## Endpoints API

### Gestion des Tenants

- `GET /tenants` - Liste tous les tenants (admin)
- `POST /tenants` - Crée un nouveau tenant (admin)
- `DELETE /tenants/:id` - Supprime un tenant (admin)

## Sécurité

L'API utilise un système d'authentification basé sur des API keys:

- Pour les opérations administratives: Utilisez l'en-tête `x-admin-key`
- Pour les opérations spécifiques aux tenants: Utilisez l'en-tête `x-api-key`

## Déploiement en Production

### Build de l'image Docker

```bash
# Construire l'image Docker
docker build -t votre-organisation/licence-api:latest .

# Pousser l'image vers Docker Hub
docker push votre-organisation/licence-api:latest
```

### Déploiement Cloud

L'API peut être déployée sur AWS, Azure ou GCP à l'aide des services de conteneurs (ECS, AKS, GKE).

Assurez-vous de configurer:
- Une base de données PostgreSQL managée
- Un service Redis managé
- Un load balancer avec terminaison SSL

## Développement

```bash
# Démarrer en mode développement
npm run dev

# Lancer les tests
npm test

# Vérifier le linting
npm run lint
```

## Architecture détaillée

```
src/
  ├── config/          # Configuration (database, redis, etc.)
  ├── controllers/     # Contrôleurs HTTP
  ├── middleware/      # Middlewares Express
  ├── models/          # Modèles de données
  ├── repositories/    # Couche d'accès aux données
  ├── routes/          # Définition des routes
  ├── services/        # Logique métier
  └── utils/           # Utilitaires
```

## Licence

MIT 