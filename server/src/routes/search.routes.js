import { Router } from 'express';
import * as searchController from '../controllers/search.controller.js';
import { optionalAuth } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', optionalAuth, searchController.search);
router.get('/suggestions', searchController.getSuggestions);

export default router;
