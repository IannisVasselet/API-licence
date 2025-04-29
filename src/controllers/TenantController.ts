import { Request, Response } from 'express';
import { TenantService } from '../services/TenantService';
import { body, param, validationResult } from 'express-validator';

/**
 * Contrôleur pour gérer les opérations CRUD sur les tenants
 */
export class TenantController {
  private service: TenantService;

  /**
   * Initialise le contrôleur avec le service
   */
  constructor() {
    this.service = new TenantService();
  }

  /**
   * Middleware de validation pour la création d'un tenant
   */
  validateCreateTenant = [
    body('name')
      .notEmpty()
      .withMessage('Le nom du tenant est requis')
      .isString()
      .withMessage('Le nom doit être une chaîne de caractères')
      .isLength({ min: 3, max: 100 })
      .withMessage('Le nom doit contenir entre 3 et 100 caractères'),
  ];

  /**
   * Middleware de validation pour la suppression d'un tenant
   */
  validateDeleteTenant = [
    param('id')
      .notEmpty()
      .withMessage('L\'ID du tenant est requis')
      .isUUID()
      .withMessage('L\'ID doit être un UUID valide'),
  ];

  /**
   * Handler pour récupérer tous les tenants
   * @param req - Requête Express
   * @param res - Réponse Express
   */
  getAllTenants = async (_req: Request, res: Response): Promise<void> => {
    try {
      const tenants = await this.service.getAllTenants();
      
      // Ne pas renvoyer les API keys dans la réponse pour des raisons de sécurité
      const safeTenants = tenants.map(({ id, name, active, createdAt, updatedAt }) => ({
        id,
        name,
        active,
        createdAt,
        updatedAt,
      }));
      
      res.status(200).json(safeTenants);
    } catch (error) {
      console.error('[CONTROLLER] Erreur lors de la récupération des tenants:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des tenants' });
    }
  };

  /**
   * Handler pour créer un nouveau tenant
   * @param req - Requête Express
   * @param res - Réponse Express
   */
  createTenant = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validation des données
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const tenant = await this.service.createTenant(req.body);
      
      // Renvoyer l'API key uniquement lors de la création
      res.status(201).json({
        id: tenant.id,
        name: tenant.name,
        apiKey: tenant.apiKey, // Important: ne sera renvoyé qu'une fois
        active: tenant.active,
        createdAt: tenant.createdAt,
      });
    } catch (error) {
      console.error('[CONTROLLER] Erreur lors de la création du tenant:', error);
      
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Erreur lors de la création du tenant' });
      }
    }
  };

  /**
   * Handler pour supprimer un tenant
   * @param req - Requête Express
   * @param res - Réponse Express
   */
  deleteTenant = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validation des données
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { id } = req.params;
      await this.service.deleteTenant(id);
      
      res.status(204).send();
    } catch (error) {
      console.error(`[CONTROLLER] Erreur lors de la suppression du tenant:`, error);
      
      if (error instanceof Error) {
        if (error.message.includes('non trouvé')) {
          res.status(404).json({ error: error.message });
        } else {
          res.status(400).json({ error: error.message });
        }
      } else {
        res.status(500).json({ error: 'Erreur lors de la suppression du tenant' });
      }
    }
  };
} 