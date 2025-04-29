import { Model, DataTypes, Sequelize } from 'sequelize';

/**
 * Modèle Tenant représentant un tenant dans le système multi-tenant
 * @class Tenant
 * @extends Model
 */
export class Tenant extends Model {
  public id!: string;
  public name!: string;
  public apiKey!: string;
  public active!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

/**
 * Initialise le modèle Tenant avec la connexion Sequelize
 * @param sequelize - Instance de connexion Sequelize
 * @returns Modèle Tenant initialisé
 */
export const initTenantModel = (sequelize: Sequelize): typeof Tenant => {
  Tenant.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      apiKey: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      sequelize,
      tableName: 'tenants',
      timestamps: true,
    },
  );

  return Tenant;
}; 