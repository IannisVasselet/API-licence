import Redis from 'ioredis';
import dotenv from 'dotenv';

// Chargement des variables d'environnement
dotenv.config();

/**
 * Options de configuration pour Redis
 */
const redisOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  retryStrategy: (times: number): number => {
    // Stratégie de reconnexion exponentielle jusqu'à 30 secondes
    const delay = Math.min(times * 100, 30000);
    console.log(`[REDIS] Tentative de reconnexion dans ${delay}ms...`);
    return delay;
  },
};

/**
 * Instance Redis pour le cache
 */
const redisClient = new Redis(redisOptions);

// Écouteurs d'événements
redisClient.on('connect', () => {
  console.log('[REDIS] Connexion établie avec succès.');
});

redisClient.on('error', (err) => {
  console.error('[REDIS] Erreur de connexion:', err);
});

/**
 * Met en cache une valeur avec une clé et une durée d'expiration
 * @param key - Clé de cache
 * @param value - Valeur à mettre en cache (sera sérialisée en JSON)
 * @param ttlSeconds - Durée de vie en secondes (par défaut 3600s = 1h)
 */
export const setCache = async <T>(key: string, value: T, ttlSeconds = 3600): Promise<void> => {
  try {
    await redisClient.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    console.log(`[REDIS] Cache mis à jour pour la clé: ${key}`);
  } catch (error) {
    console.error(`[REDIS] Erreur lors de la mise en cache de la clé ${key}:`, error);
  }
};

/**
 * Récupère une valeur du cache
 * @param key - Clé de cache
 * @returns Valeur désérialisée ou null si non trouvée
 */
export const getCache = async <T>(key: string): Promise<T | null> => {
  try {
    const data = await redisClient.get(key);
    if (data) {
      console.log(`[REDIS] Cache trouvé pour la clé: ${key}`);
      return JSON.parse(data) as T;
    }
    console.log(`[REDIS] Cache non trouvé pour la clé: ${key}`);
    return null;
  } catch (error) {
    console.error(`[REDIS] Erreur lors de la récupération du cache pour la clé ${key}:`, error);
    return null;
  }
};

/**
 * Supprime une valeur du cache
 * @param key - Clé de cache à supprimer
 */
export const deleteCache = async (key: string): Promise<void> => {
  try {
    await redisClient.del(key);
    console.log(`[REDIS] Cache supprimé pour la clé: ${key}`);
  } catch (error) {
    console.error(`[REDIS] Erreur lors de la suppression du cache pour la clé ${key}:`, error);
  }
};

/**
 * Supprime toutes les valeurs de cache liées à un tenant
 * @param tenantId - ID du tenant
 */
export const clearTenantCache = async (tenantId: string): Promise<void> => {
  try {
    const pattern = `tenant:${tenantId}:*`;
    const keys = await redisClient.keys(pattern);
    
    if (keys.length > 0) {
      await redisClient.del(...keys);
      console.log(`[REDIS] Cache supprimé pour ${keys.length} clés du tenant ${tenantId}`);
    }
  } catch (error) {
    console.error(`[REDIS] Erreur lors de la suppression du cache pour le tenant ${tenantId}:`, error);
  }
};

export default redisClient; 