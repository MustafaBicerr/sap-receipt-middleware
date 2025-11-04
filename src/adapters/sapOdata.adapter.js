import fetch from 'node-fetch';

/** Gerçek OData çağrılarının yapılacağı yer. Şimdilik iskelet. */
const base = process.env.SAP_ODATA_BASE_URL;

function basicAuth() {
  const u = process.env.SAP_ODATA_USER;
  const p = process.env.SAP_ODATA_PASS;
  return 'Basic ' + Buffer.from(`${u}:${p}`).toString('base64');
}

export async function postFB60(mapped) {
  // Örnek payload iskeleti — gerçek OData entity set adları SAP Gateway’de tanımladığın servise göre değişir.
  const body = {
    Header: {
      CompanyCode: mapped.sap.companyCode,
      DocumentDate: mapped.header.date,
      Currency: mapped.header.currency || 'TRY',
      VendorId: mapped.sap.vendorId || '0001234567' // mappingten gelebilir
    },
    Items: mapped.items.map((it, idx) => ({
      ItemNo: idx + 1,
      Text: it.materialText,
      Amount: it.net,
      TaxCode: it.vatCode,
      GlAccount: it.glAccount
    })),
    Audit: mapped.audit
  };

  const r = await fetch(`${base}/FB60Set`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': basicAuth() },
    body: JSON.stringify(body)
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`OData FB60 error: ${r.status} ${t}`);
  }
  const data = await r.json();
  return { mode: 'ODATA', target: 'FB60', sapDocument: data.DocumentNo, messages: data.Messages || [] };
}

export async function postMIRO(mapped) {
  const body = {
    Header: {
      CompanyCode: mapped.sap.companyCode,
      DocumentDate: mapped.header.date,
      Currency: mapped.header.currency || 'TRY',
      GrossAmount: mapped.totals.grandTotal,
      PoNumber: mapped.sap.purchaseOrderRef || null
    },
    Items: mapped.items.map((it, idx) => ({
      ItemNo: idx + 1,
      Amount: it.net,
      TaxCode: it.vatCode,
      PoItem: null // gerçek senaryoda PO eşleşmesi yapılır
    })),
    Audit: mapped.audit
  };

  const r = await fetch(`${base}/MIROSet`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': basicAuth() },
    body: JSON.stringify(body)
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`OData MIRO error: ${r.status} ${t}`);
  }
  const data = await r.json();
  return { mode: 'ODATA', target: 'MIRO', sapDocument: data.DocumentNo, messages: data.Messages || [] };
}
