import { TenantRepository, CreateTenantDto } from '../repositories/TenantRepository';
import { Tenant } from '../models/Tenant';

/**
 * Service qui encapsule la logique métier pour les tenants
 */
export class TenantService {
  private repository: TenantRepository;

  /**
   * Initialise le service avec le repository
   */
  constructor() {
    this.repository = new TenantRepository();
  }

  /**
   * Récupère tous les tenants
   * @returns Liste des tenants
   */
  async getAllTenants(): Promise<Tenant[]> {
    try {
      console.log('[SERVICE] Récupération de tous les tenants');
      return await this.repository.findAll();
    } catch (error) {
      console.error('[SERVICE] Erreur lors de la récupération des tenants:', error);
      throw new Error('Erreur lors de la récupération des tenants');
    }
  }

  /**
   * Récupère un tenant par son ID
   * @param id - ID du tenant
   * @returns Le tenant trouvé
   * @throws Error si le tenant n'est pas trouvé
   */
  async getTenantById(id: string): Promise<Tenant> {
    try {
      console.log(`[SERVICE] Récupération du tenant ${id}`);
      const tenant = await this.repository.findById(id);
      
      if (!tenant) {
        throw new Error(`Tenant avec l'ID ${id} non trouvé`);
      }
      
      return tenant;
    } catch (error) {
      console.error(`[SERVICE] Erreur lors de la récupération du tenant ${id}:`, error);
      throw error;
    }
  }

  /**
   * Crée un nouveau tenant
   * @param data - Données du tenant à créer
   * @returns Le tenant créé
   */
  async createTenant(data: CreateTenantDto): Promise<Tenant> {
    try {
      // Validation des données
      if (!data.name || data.name.trim() === '') {
        throw new Error('Le nom du tenant est requis');
      }
      
      console.log(`[SERVICE] Création d'un nouveau tenant: ${data.name}`);
      return await this.repository.create(data);
    } catch (error) {
      console.error('[SERVICE] Erreur lors de la création du tenant:', error);
      throw error;
    }
  }

  /**
   * Supprime un tenant
   * @param id - ID du tenant à supprimer
   * @returns true si supprimé, false sinon
   * @throws Error si le tenant n'existe pas
   */
  async deleteTenant(id: string): Promise<boolean> {
    try {
      console.log(`[SERVICE] Suppression du tenant ${id}`);
      const result = await this.repository.delete(id);
      
      if (!result) {
        throw new Error(`Tenant avec l'ID ${id} non trouvé`);
      }
      
      return true;
    } catch (error) {
      console.error(`[SERVICE] Erreur lors de la suppression du tenant ${id}:`, error);
      throw error;
    }
  }
} 