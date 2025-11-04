export async function postFB60(mapped) {
  // Buraya ileride SAP RFC/BAPI çağrısı (BAPI_ACC_DOCUMENT_POST) eklenecek.
  return { mode: 'RFC_STUB', target: 'FB60', sapDocument: '5100000001', messages: [] };
}
export async function postMIRO(mapped) {
  // Buraya BAPI_INCOMINGINVOICE_CREATE entegrasyonu eklenecek.
  return { mode: 'RFC_STUB', target: 'MIRO', sapDocument: '5200000001', messages: [] };
}
