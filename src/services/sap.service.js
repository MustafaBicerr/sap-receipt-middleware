import { v4 as uuidv4 } from 'uuid';
import { mapVatRateToTaxCode, defaultGlAccount } from './mapping.service.js';
import * as odata from '../adapters/sapOdata.adapter.js';
import * as rfc from '../adapters/sapRfc.adapter.js';

const DRY = (process.env.SAP_DRY_RUN || 'true') === 'true';
const TARGET = process.env.SAP_TARGET || 'FB60';

/** Batch içindeki her fişi hedefe post eder. */
export async function postBatchToSap(batch) {
  const results = [];
  for (const r of batch.receipts) {
    const mapped = mapReceipt(r);
    const res = await postSingle(mapped, r.sap.target || TARGET);
    results.push({ receiptId: r.receiptId, result: res });
  }
  return { status: 'DONE', count: results.length, results };
}

/** JSON → SAP-BAPI/OData istek gövdesi için normalize */
function mapReceipt(receipt) {
  const companyCode = receipt.sap.companyCode;

  // her satır için vergi kodu doldur
  const items = receipt.items.map(x => ({
    ...x,
    vatCode: x.vatCode || mapVatRateToTaxCode(x.vatRate, companyCode),
    glAccount: defaultGlAccount('grocery', companyCode) // örnek
  }));

  return { ...receipt, items };
}

/** Tek fiş gönderimi */
async function postSingle(mapped, target) {
  if (DRY) {
    // SAP'ye dokunmadan başarılı simülasyon döndür
    return {
      mode: 'DRY_RUN',
      target,
      sapDocument: `SIM-${uuidv4().slice(0,8)}`,
      messages: []
    };
  }

  if (target === 'FB60') {
    return odata.postFB60(mapped);      // veya rfc.postFB60(mapped)
  } else {
    return odata.postMIRO(mapped);      // veya rfc.postMIRO(mapped)
  }
}
