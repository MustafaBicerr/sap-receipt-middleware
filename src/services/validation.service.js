import Joi from 'joi';

/** Batch = bir gönderide 1..N fiş ve log bilgileri */
const itemSchema = Joi.object({
  lineNo: Joi.number().integer().min(1).required(),
  materialText: Joi.string().max(200).required(),
  qty: Joi.number().positive().required(),
  uom: Joi.string().default('EA'),
  gross: Joi.number().precision(2).required(), // satır brüt
  discount: Joi.number().precision(2).default(0),
  vatRate: Joi.number().valid(1, 8, 10, 18).required(),
  vatCode: Joi.string().optional(), // mapping ile de doldurulabilir
  net: Joi.number().precision(2).required()
});

const receiptSchema = Joi.object({
  receiptId: Joi.string().guid({ version: 'uuidv4' }).required(),
  source: Joi.object({
    channel: Joi.string().valid('camera', 'gallery', 'import').required(),
    imagePath: Joi.string().allow(null, ''),
    ocrEngine: Joi.string().allow(null, ''),
    deviceTime: Joi.string()
  }),
  header: Joi.object({
    vendorName: Joi.string().required(),
    vendorTaxNo: Joi.string().allow('', null),
    branchCode: Joi.string().allow('', null),
    taxOffice: Joi.string().allow('', null),
    date: Joi.string().isoDate().required(),
    time: Joi.string().allow('', null),
    docNo: Joi.string().allow('', null),
    eArchive: Joi.boolean().default(true),
    currency: Joi.string().default('TRY')
  }).required(),
  items: Joi.array().items(itemSchema).min(1).required(),
  totals: Joi.object({
    subtotal: Joi.number().precision(2).required(),
    vatSummary: Joi.array().items(Joi.object({
      rate: Joi.number().valid(1,8,10,18).required(),
      base: Joi.number().precision(2).required(),
      vat: Joi.number().precision(2).required()
    })).required(),
    grandTotal: Joi.number().precision(2).required(),
    payment: Joi.object({
      type: Joi.string().valid('CASH','CARD','MIX').required(),
      posRef: Joi.string().allow('', null)
    })
  }).required(),
  sap: Joi.object({
    target: Joi.string().valid('FB60','MIRO').required(),
    companyCode: Joi.string().required(),
    purchaseOrderRef: Joi.string().allow(null, ''),
    mappingProfile: Joi.string().default('TR_RETAIL_V1')
  }).required(),
  audit: Joi.object({
    submittedBy: Joi.object({
      userId: Joi.string().required(),
      name: Joi.string().required(),
      email: Joi.string().email().allow('')
    }).required(),
    submittedAt: Joi.string().isoDate().required(),
    clientMeta: Joi.object({
      appVersion: Joi.string().allow(''),
      deviceId: Joi.string().allow('')
    })
  }).required(),
  status: Joi.string().valid('draft','validated','sent','posted','error').default('validated')
});

const batchSchema = Joi.object({
  meta: Joi.object({
    batchId: Joi.string().guid({ version: 'uuidv4' }).required(),
    source: Joi.string().valid('mobile','import','test').required()
  }).required(),
  receipts: Joi.array().items(receiptSchema).min(1).required()
});

export function validateBatch(batch) {
  const res = batchSchema.validate(batch, { abortEarly: false, stripUnknown: true });
  if (res.error) {
    const msg = res.error.details.map(d => d.message).join('; ');
    return { error: new Error(msg) };
  }
  return { value: res.value };
}
