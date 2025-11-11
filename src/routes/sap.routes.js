// src/routes/sap.routes.js
import { Router } from "express";
import { sapMetadata, createInvoice } from "../controllers/receipts.controller.js";

console.log('[sap.routes] loaded');

const r = Router();
r.get("/metadata", sapMetadata);
r.post("/invoices", createInvoice);
r.get("/__ping", (req, res) => {
  res.json({ ok: true, from: "sap.routes" });
});

export default r;