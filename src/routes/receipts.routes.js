import { Router } from 'express';
import * as controller from '../controllers/receipts.controller.js';

const router = Router();

// Örnek: sample JSON’dan SAP'ye gönder (lokal test)
router.post('/post-from-sample', controller.postFromSample);

// İleride Flutter JSON gönderecek: doğrudan body'den al
router.post('/post', controller.postFromBody);

// Sadece doğrulama (SAP'ye göndermeden)
router.post('/validate', controller.validateReceiptBatch);

export default router;
