import { Tenant } from '../models/Tenant';
import { v4 as uuidv4 } from 'uuid';
import { 
  getCache, 
  setCache, 
  deleteCache, 
  clearTenantCache 
} from '../config/redis';
import crypto from 'crypto';

/**
 * Interface pour la création d'un nouveau tenant
 */
export interface CreateTenantDto {
  name: string;
}

/**
 * Classe Repository pour gérer les opérations sur les tenants
 */
export class TenantRepository {
  /**
   * Génère une API key cryptographiquement sécurisée
   * @returns API key générée
   */
  private generateApiKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Récupère tous les tenants depuis la base de données
   * Utilise le cache si disponible
   * @returns Liste des tenants
   */
  async findAll(): Promise<Tenant[]> {
    try {
      // Tentative de récupération depuis le cache
      const cacheKey = 'tenants:all';
      const cachedTenants = await getCache<Tenant[]>(cacheKey);

      if (cachedTenants) {
        console.log('[TENANT] Tenants récupérés depuis le cache');
        return cachedTenants;
      }

      // Récupération depuis la base de données
      const tenants = await Tenant.findAll();
      
      // Mise en cache pour les requêtes futures
      await setCache(cacheKey, tenants, 3600); // Cache pour 1 heure
      
      console.log(`[TENANT] ${tenants.length} tenants récupérés de la base de données`);
      return tenants;
    } catch (error) {
      console.error('[TENANT] Erreur lors de la récupération des tenants:', error);
      throw error;
    }
  }

  /**
   * Récupère un tenant par son ID
   * @param id - ID du tenant
   * @returns Le tenant trouvé ou null
   */
  async findById(id: string): Promise<Tenant | null> {
    try {
      // Tentative de récupération depuis le cache
      const cacheKey = `tenant:${id}`;
      const cachedTenant = await getCache<Tenant>(cacheKey);

      if (cachedTenant) {
        console.log(`[TENANT] Tenant ${id} récupéré depuis le cache`);
        return cachedTenant;
      }

      // Récupération depuis la base de données
      const tenant = await Tenant.findByPk(id);
      
      if (tenant) {
        // Mise en cache pour les requêtes futures
        await setCache(cacheKey, tenant, 3600); // Cache pour 1 heure
        console.log(`[TENANT] Tenant ${id} récupéré de la base de données`);
      } else {
        console.log(`[TENANT] Tenant ${id} non trouvé`);
      }
      
      return tenant;
    } catch (error) {
      console.error(`[TENANT] Erreur lors de la récupération du tenant ${id}:`, error);
      throw error;
    }
  }

  /**
   * Crée un nouveau tenant
   * @param data - Données du tenant à créer
   * @returns Le tenant créé
   */
  async create(data: CreateTenantDto): Promise<Tenant> {
    try {
      // Génération d'une API key unique
      const apiKey = this.generateApiKey();
      
      // Création du tenant
      const tenant = await Tenant.create({
        id: uuidv4(),
        name: data.name,
        apiKey,
        active: true,
      });

      // Invalidation du cache de la liste des tenants
      await deleteCache('tenants:all');
      
      console.log(`[TENANT] Nouveau tenant créé: ${tenant.name}`);
      return tenant;
    } catch (error) {
      console.error('[TENANT] Erreur lors de la création du tenant:', error);
      throw error;
    }
  }

  /**
   * Supprime un tenant par son ID
   * @param id - ID du tenant à supprimer
   * @returns true si supprimé, false sinon
   */
  async delete(id: string): Promise<boolean> {
    try {
      // Vérification que le tenant existe
      const tenant = await this.findById(id);
      
      if (!tenant) {
        console.log(`[TENANT] Tentative de suppression d'un tenant inexistant: ${id}`);
        return false;
      }
      
      // Suppression du tenant
      await tenant.destroy();
      
      // Suppression des caches
      await deleteCache(`tenant:${id}`);
      await deleteCache('tenants:all');
      await clearTenantCache(id);
      
      console.log(`[TENANT] Tenant supprimé: ${id}`);
      return true;
    } catch (error) {
      console.error(`[TENANT] Erreur lors de la suppression du tenant ${id}:`, error);
      throw error;
    }
  }
} 