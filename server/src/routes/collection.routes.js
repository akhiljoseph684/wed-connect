import { Router } from 'express';
import { body } from 'express-validator';
import * as collectionController from '../controllers/collection.controller.js';
import { authenticate, optionalAuth } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';

const router = Router();

router.get('/', authenticate, collectionController.getMyCollections);
router.post(
  '/',
  authenticate,
  [
    body('title').trim().notEmpty().withMessage('Collection title is required'),
    validate,
  ],
  collectionController.createCollection
);

router.get('/:collectionId', optionalAuth, collectionController.getCollectionById);
router.patch('/:collectionId', authenticate, collectionController.updateCollection);
router.delete('/:collectionId', authenticate, collectionController.deleteCollection);

router.put('/:collectionId/items/:postId', authenticate, collectionController.addItemToCollection);
router.delete('/:collectionId/items/:postId', authenticate, collectionController.removeItemFromCollection);

export default router;
