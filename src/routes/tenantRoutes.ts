import { Router } from 'express';
import { TenantController } from '../controllers/TenantController';
import { authenticateAdmin } from '../middleware/authMiddleware';

const router = Router();
const controller = new TenantController();

/**
 * @route   GET /tenants
 * @desc    Récupère tous les tenants
 * @access  Admin
 */
router.get('/', authenticateAdmin, controller.getAllTenants);

/**
 * @route   POST /tenants
 * @desc    Crée un nouveau tenant
 * @access  Admin
 */
router.post(
  '/',
  authenticateAdmin,
  controller.validateCreateTenant,
  controller.createTenant
);

/**
 * @route   DELETE /tenants/:id
 * @desc    Supprime un tenant
 * @access  Admin
 */
router.delete(
  '/:id',
  authenticateAdmin,
  controller.validateDeleteTenant,
  controller.deleteTenant
);

export default router; 