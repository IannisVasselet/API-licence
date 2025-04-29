import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { initDatabase } from './config/database';
import tenantRoutes from './routes/tenantRoutes';

// Chargement des variables d'environnement
dotenv.config();

// Création de l'application Express
const app: Express = express();
const port = process.env.PORT || 3000;

/**
 * Configuration des middlewares
 */
// Protection contre les vulnérabilités web courantes
app.use(helmet());

// Activation CORS pour permettre les requêtes cross-origin
app.use(cors());

// Parsing des requêtes JSON
app.use(express.json());

// Logging des requêtes en développement
if (process.env.NODE_ENV === 'development') {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
}

/**
 * Configuration des routes
 */
app.use('/tenants', tenantRoutes);

// Route de base pour vérifier que l'API est en ligne
app.get('/', (_req, res) => {
  res.json({
    message: 'API de gestion de licences opérationnelle',
    version: '1.0.0',
    environment: process.env.NODE_ENV,
  });
});

/**
 * Gestionnaire pour les routes non trouvées
 */
app.use((_req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

/**
 * Démarrage du serveur
 */
const startServer = async (): Promise<void> => {
  try {
    // Initialisation de la base de données
    await initDatabase();
    
    // Démarrage du serveur HTTP
    app.listen(port, () => {
      console.log(`[SERVER] Serveur démarré sur le port ${port} en mode ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('[SERVER] Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
};

// Démarrage de l'application
startServer(); 