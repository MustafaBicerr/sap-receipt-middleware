import express from 'express';
import cors from 'cors';
import { requestLogger } from './middlewares/requestLogger.js';
import { errorHandler } from './middlewares/errorHandler.js';
import healthRoutes from './routes/health.routes.js';
import receiptRoutes from './routes/receipts.routes.js';
import sapRoutes from "./routes/sap.routes.js";

import './models/db.js'; // init + migrations komutu destekler

const app = express();
app.use(cors({origin: true}));
app.use(express.json({ limit: '5mb' })); // JSON body
app.use(requestLogger);

// routes
app.use('/api/health', healthRoutes);
app.use('/api/receipts', receiptRoutes);
console.log("[index] starting app");
app.use("/api/sap", sapRoutes);
console.log("[index] sap routes mounted");

// src/index.js veya src/app.js içinde, route tanımlamalarından sonra ekle:
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

app.get('/__routes', (req, res) => {
  const routes = [];
  app._router.stack.forEach((m) => {
    if (m.route && m.route.path) {
      const methods = Object.keys(m.route.methods).join(',').toUpperCase();
      routes.push(`${methods} ${m.route.path}`);
    } else if (m.name === 'router' && m.handle.stack) {
      m.handle.stack.forEach((h) => {
        const route = h.route;
        if (route) {
          const methods = Object.keys(route.methods).join(',').toUpperCase();
          routes.push(`${methods} ${(m.regexp?.source || '')}${route.path}`);
        }
      });
    }
  });
  res.json(routes);
});


// error handler en sonda
app.use(errorHandler);

export default app;
