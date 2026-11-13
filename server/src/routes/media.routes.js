import { Router } from 'express';
import * as mediaController from '../controllers/media.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';

const router = Router();

router.post('/upload', authenticate, upload.single('file'), mediaController.uploadMedia);
router.post('/upload-multiple', authenticate, upload.array('files', 10), mediaController.uploadMedia);
router.delete('/:mediaId', authenticate, mediaController.deleteMedia);

export default router;
