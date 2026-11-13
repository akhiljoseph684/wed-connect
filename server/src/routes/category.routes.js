import { Router } from 'express';
import * as categoryController from '../controllers/category.controller.js';
import { authenticate, requireRole } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', categoryController.getCategories);
router.get('/:slug', categoryController.getCategoryBySlug);

// Admin category management
router.post('/', authenticate, requireRole('admin', 'moderator'), categoryController.createCategory);
router.patch('/:categoryId', authenticate, requireRole('admin', 'moderator'), categoryController.updateCategory);
router.delete('/:categoryId', authenticate, requireRole('admin'), categoryController.deleteCategory);

export default router;
