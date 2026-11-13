import { Router } from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { authenticate, requireRole } from '../middlewares/auth.middleware.js';

const router = Router();

// Protect all admin routes with authentication and role check
router.use(authenticate, requireRole('admin', 'moderator'));

router.get('/dashboard', adminController.getDashboardStats);
router.get('/users', adminController.getUsers);
router.patch('/users/:id/status', requireRole('admin'), adminController.updateUserStatus);
router.get('/vendors', adminController.getVendors);
router.patch('/verifications/:businessId', adminController.updateVerification);
router.get('/audit-logs', requireRole('admin'), adminController.getAuditLogs);
router.get('/reports', adminController.getReports);
router.patch('/reports/:id/resolve', adminController.resolveReport);

export default router;
