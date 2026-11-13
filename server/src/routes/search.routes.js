import { Router } from 'express';
import * as searchController from '../controllers/search.controller.js';

const router = Router();

router.get('/', searchController.search);
router.get('/suggestions', searchController.getSuggestions);

export default router;
