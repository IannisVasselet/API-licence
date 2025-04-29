import { Request, Response, NextFunction } from 'express';
import { Tenant } from '../models/Tenant';
import { getCache, setCache } from '../config/redis';

/**
 * Interface pour étendre la Request d'Express avec l'information du tenant
 */
export interface AuthenticatedRequest extends Request {
  tenant?: Tenant;
}

/**
 * Middleware qui vérifie l'API key dans les headers et authentifie le tenant
 * @param req - Requête Express
 * @param res - Réponse Express
 * @param next - Fonction next d'Express
 */
export const authenticateApiKey = async (
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    const apiKey = req.headers['x-api-key'] as string;

    // Vérification de la présence de l'API key
    if (!apiKey) {
      console.log('[AUTH] Requête sans API key');
      res.status(401).json({ error: 'API key requise' });
      return;
    }

    // Tentative de récupération depuis le cache
    const cacheKey = `apikey:${apiKey}`;
    const cachedTenant = await getCache<Tenant>(cacheKey);

    if (cachedTenant) {
      // Vérification que le tenant est actif
      if (!cachedTenant.active) {
        console.log(`[AUTH] Tentative d'utilisation d'un tenant inactif: ${cachedTenant.name}`);
        res.status(403).json({ error: 'Tenant inactif' });
        return;
      }

      // Ajout du tenant à la requête
      req.tenant = cachedTenant;
      console.log(`[AUTH] Tenant authentifié depuis le cache: ${cachedTenant.name}`);
      next();
      return;
    }

    // Récupération depuis la base de données
    const tenant = await Tenant.findOne({ where: { apiKey } });

    if (!tenant) {
      console.log(`[AUTH] API key invalide: ${apiKey}`);
      res.status(401).json({ error: 'API key invalide' });
      return;
    }

    if (!tenant.active) {
      console.log(`[AUTH] Tentative d'utilisation d'un tenant inactif: ${tenant.name}`);
      res.status(403).json({ error: 'Tenant inactif' });
      return;
    }

    // Mise en cache du tenant pour les requêtes futures
    await setCache(cacheKey, tenant, 3600); // Cache pour 1 heure

    // Ajout du tenant à la requête
    req.tenant = tenant;
    console.log(`[AUTH] Tenant authentifié: ${tenant.name}`);
    next();
  } catch (error) {
    console.error('[AUTH] Erreur lors de l\'authentification:', error);
    res.status(500).json({ error: 'Erreur d\'authentification' });
  }
};

/**
 * Middleware qui vérifie si un utilisateur est administrateur système
 * Dans un environnement réel, cette vérification serait plus complexe
 * @param req - Requête Express
 * @param res - Réponse Express
 * @param next - Fonction next d'Express
 */
export const authenticateAdmin = (
  req: Request, 
  res: Response, 
  next: NextFunction
): void => {
  const adminKey = req.headers['x-admin-key'];
  
  if (adminKey !== process.env.ADMIN_API_KEY) {
    console.log('[AUTH] Tentative d\'accès admin non autorisée');
    res.status(403).json({ error: 'Non autorisé' });
    return;
  }
  
  console.log('[AUTH] Administrateur authentifié');
  next();
}; 