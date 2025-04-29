import { Sequelize } from 'sequelize';
import { initTenantModel } from '../models/Tenant';
import { initLicenseModel } from '../models/License';
import dotenv from 'dotenv';

// Chargement des variables d'environnement
dotenv.config();

/**
 * Crée et configure une instance de connexion Sequelize
 * @returns Instance de connexion Sequelize configurée
 */
export const createSequelizeInstance = (): Sequelize => {
  const sequelize = new Sequelize({
    dialect: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'licence_db',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    logging: process.env.NODE_ENV === 'development' 
      ? (msg: string): void => console.log(`[DATABASE] ${msg}`) 
      : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  });

  return sequelize;
};

/**
 * Initialise les modèles et leurs associations
 * @param sequelize - Instance de connexion Sequelize
 */
export const initModels = (sequelize: Sequelize): void => {
  const TenantModel = initTenantModel(sequelize);
  const LicenseModel = initLicenseModel(sequelize);

  // Définition des associations
  TenantModel.hasMany(LicenseModel, {
    foreignKey: 'tenantId',
    as: 'licenses',
  });

  LicenseModel.belongsTo(TenantModel, {
    foreignKey: 'tenantId',
    as: 'tenant',
  });
};

/**
 * Instance de connexion Sequelize principale
 */
const sequelize = createSequelizeInstance();

/**
 * Initialise la connexion à la base de données
 * @returns Promise résolu lorsque la connexion est établie
 */
export const initDatabase = async (): Promise<void> => {
  try {
    // Initialisation des modèles
    initModels(sequelize);

    // Test de la connexion
    await sequelize.authenticate();
    console.log('[DATABASE] Connexion établie avec succès.');

    // Synchronisation des modèles avec la base de données
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('[DATABASE] Modèles synchronisés avec la base de données.');
    }
  } catch (error) {
    console.error('[DATABASE] Erreur de connexion à la base de données:', error);
    throw error;
  }
};

export default sequelize; 