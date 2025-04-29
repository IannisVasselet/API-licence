import { Model, DataTypes, Sequelize } from 'sequelize';

/**
 * Modèle License représentant une licence client
 * @class License
 * @extends Model
 */
export class License extends Model {
  public id!: string;
  public tenantId!: string;
  public customerId!: string;
  public productId!: string;
  public licenseKey!: string;
  public startDate!: Date;
  public endDate!: Date;
  public status!: 'active' | 'expired' | 'revoked';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

/**
 * Initialise le modèle License avec la connexion Sequelize
 * @param sequelize - Instance de connexion Sequelize
 * @returns Modèle License initialisé
 */
export const initLicenseModel = (sequelize: Sequelize): typeof License => {
  License.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      tenantId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'tenants',
          key: 'id',
        },
      },
      customerId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      productId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      licenseKey: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      startDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('active', 'expired', 'revoked'),
        allowNull: false,
        defaultValue: 'active',
      },
    },
    {
      sequelize,
      tableName: 'licenses',
      timestamps: true,
      indexes: [
        {
          fields: ['tenantId'],
        },
        {
          fields: ['customerId'],
        },
        {
          fields: ['licenseKey'],
          unique: true,
        },
      ],
    },
  );

  return License;
}; 