import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { validateBatch } from '../services/validation.service.js';
import { postBatchToSap } from '../services/sap.service.js';
import { logInbound, logResult } from '../services/log.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function postFromSample(req, res, next) {
  try {
    // örnek veriyi oku
    const p = path.join(__dirname, '..', 'data', 'sample_receipts.json');
    const batch = JSON.parse(fs.readFileSync(p, 'utf8'));

    await logInbound(batch); // geleni logla
    const { value, error } = validateBatch(batch);
    if (error) return res.status(400).json({ status: 'VALIDATION_ERROR', error: error.message });

    const result = await postBatchToSap(value);
    await logResult(value.meta.batchId, result);

    res.json(result);
  } catch (err) { next(err); }
}

export async function postFromBody(req, res, next) {
  try {
    const batch = req.body;
    await logInbound(batch);

    const { value, error } = validateBatch(batch);
    if (error) return res.status(400).json({ status: 'VALIDATION_ERROR', error: error.message });

    const result = await postBatchToSap(value);
    await logResult(value.meta.batchId, result);

    res.json(result);
  } catch (err) { next(err); }
}

export async function validateReceiptBatch(req, res, next) {
  try {
    const { value, error } = validateBatch(req.body);
    if (error) return res.status(400).json({ status: 'VALIDATION_ERROR', error: error.message });
    res.json({ status: 'OK', normalized: value });
  } catch (err) { next(err); }
}
