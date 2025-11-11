/**
 * SAP OData Adapter
 * On-prem SAP Gateway ile Basic Authentication üzerinden
 * metadata sorgusu ve örnek FB60 / MIRO post işlemlerini yapar.
 */

import axios from "axios";

// ---------------------------------------------------------------------------
// Ortak yapılandırma okuma
// ---------------------------------------------------------------------------
function cfg() {
  return {
    MODE: process.env.MODE || "BASIC",
    S4_HOST: process.env.S4_HOST,
    S4_BASE_PATH: process.env.S4_BASE_PATH,
    SAP_ODATA_USER: process.env.SAP_ODATA_USER,
    SAP_ODATA_PASS: process.env.SAP_ODATA_PASS,
  };
}

// ---------------------------------------------------------------------------
// Basic Auth header üretici
// ---------------------------------------------------------------------------
function basicAuthHeader() {
  const { SAP_ODATA_USER, SAP_ODATA_PASS } = cfg();
  const token = Buffer.from(`${SAP_ODATA_USER}:${SAP_ODATA_PASS}`).toString("base64");
  return `Basic ${token}`;
}

// ---------------------------------------------------------------------------
// $metadata çağrısı
// ---------------------------------------------------------------------------
export async function getMetadata() {
  const { MODE, S4_HOST, S4_BASE_PATH, SAP_ODATA_USER, SAP_ODATA_PASS } = cfg();
  const url = `${S4_HOST}${S4_BASE_PATH}/$metadata`;

  console.log("==> Fetching SAP $metadata from:", url);

  try {
    if (MODE !== "BASIC") {
      throw new Error("Unsupported MODE. Use BASIC for on-prem SAP.");
    }

    const res = await axios.get(url, {
      auth: { username: SAP_ODATA_USER, password: SAP_ODATA_PASS },
      headers: { Accept: "application/xml" },
      timeout: 20000,
      validateStatus: () => true,
    });

    if (res.status >= 400) {
      throw new Error(`SAP responded with ${res.status} ${res.statusText}`);
    }

    console.log("[SAP] Metadata OK:", res.status);
    return { status: res.status, data: res.data };
  } catch (err) {
    console.error("[SAP] getMetadata error:", err.message);
    if (err.response)
      console.error("Response:", err.response.status, err.response.statusText);
    throw err;
  }
}

// ---------------------------------------------------------------------------
// FB60 (Fatura Girişi) örnek POST
// ---------------------------------------------------------------------------
export async function postFB60(mapped) {
  const { S4_HOST, S4_BASE_PATH } = cfg();
  const url = `${S4_HOST}${S4_BASE_PATH}/FB60Set`;

  const body = {
    Header: {
      CompanyCode: mapped.sap.companyCode,
      DocumentDate: mapped.header.date,
      Currency: mapped.header.currency || "TRY",
      VendorId: mapped.sap.vendorId || "0001234567",
    },
    Items: mapped.items.map((it, idx) => ({
      ItemNo: idx + 1,
      Text: it.materialText,
      Amount: it.net,
      TaxCode: it.vatCode,
      GlAccount: it.glAccount,
    })),
    Audit: mapped.audit,
  };

  console.log("==> Posting FB60 to:", url);

  const res = await axios.post(url, body, {
    headers: {
      "Content-Type": "application/json",
      Authorization: basicAuthHeader(),
    },
    validateStatus: () => true,
  });

  if (res.status >= 400) {
    throw new Error(`OData FB60 error: ${res.status} ${res.statusText}`);
  }

  return {
    mode: "ODATA",
    target: "FB60",
    sapDocument: res.data.DocumentNo,
    messages: res.data.Messages || [],
  };
}

// ---------------------------------------------------------------------------
// MIRO (Mal / Hizmet Faturası) örnek POST
// ---------------------------------------------------------------------------
export async function postMIRO(mapped) {
  const { S4_HOST, S4_BASE_PATH } = cfg();
  const url = `${S4_HOST}${S4_BASE_PATH}/MIROSet`;

  const body = {
    Header: {
      CompanyCode: mapped.sap.companyCode,
      DocumentDate: mapped.header.date,
      Currency: mapped.header.currency || "TRY",
      GrossAmount: mapped.totals.grandTotal,
      PoNumber: mapped.sap.purchaseOrderRef || null,
    },
    Items: mapped.items.map((it, idx) => ({
      ItemNo: idx + 1,
      Amount: it.net,
      TaxCode: it.vatCode,
      PoItem: null,
    })),
    Audit: mapped.audit,
  };

  console.log("==> Posting MIRO to:", url);

  const res = await axios.post(url, body, {
    headers: {
      "Content-Type": "application/json",
      Authorization: basicAuthHeader(),
    },
    validateStatus: () => true,
  });

  if (res.status >= 400) {
    throw new Error(`OData MIRO error: ${res.status} ${res.statusText}`);
  }

  return {
    mode: "ODATA",
    target: "MIRO",
    sapDocument: res.data.DocumentNo,
    messages: res.data.Messages || [],
  };
}

// ---------------------------------------------------------------------------
// Basit log helper
// ---------------------------------------------------------------------------
export const log = (...args) => console.log("[SAP]", ...args);
