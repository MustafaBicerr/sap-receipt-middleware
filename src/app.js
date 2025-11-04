import express from 'express';
import cors from 'cors';
import { requestLogger } from './middlewares/requestLogger.js';
import { errorHandler } from './middlewares/errorHandler.js';
import healthRoutes from './routes/health.routes.js';
import receiptRoutes from './routes/receipts.routes.js';
import './models/db.js'; // init + migrations komutu destekler

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' })); // JSON body
app.use(requestLogger);

// routes
app.use('/api/health', healthRoutes);
app.use('/api/receipts', receiptRoutes);

// error handler en sonda
app.use(errorHandler);

export default app;
