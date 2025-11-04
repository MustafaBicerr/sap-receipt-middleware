import { v4 as uuidv4 } from 'uuid';
import { db } from '../models/db.js';
import winston from 'winston';
import 'winston-daily-rotate-file';

const transport = new (winston.transports.DailyRotateFile)({
  dirname: process.env.LOG_DIR || 'logs',
  filename: 'app-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: '10m',
  maxFiles: '30d'
});
export const logger = winston.createLogger({
  level: 'info',
  transports: [transport, new winston.transports.Console({ level: 'warn' })]
});

export async function logInbound(batch) {
  const id = batch.meta?.batchId || uuidv4();
  logger.info({ type: 'INBOUND', batchId: id, count: batch.receipts?.length });

  db.prepare(`
    INSERT INTO inbound_log (batch_id, source, payload, received_at)
    VALUES (?, ?, ?, datetime('now'))
  `).run(id, batch.meta?.source || 'unknown', JSON.stringify(batch));
}

export async function logResult(batchId, result) {
  logger.info({ type: 'RESULT', batchId, result });
  db.prepare(`
    INSERT INTO result_log (batch_id, result_json, created_at)
    VALUES (?, ?, datetime('now'))
  `).run(batchId, JSON.stringify(result));
}
