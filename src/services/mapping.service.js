/** Şirket koduna/ülkeye göre parametrik eşleştirmeler burada yönetilir. */

export function mapVatRateToTaxCode(rate, companyCode = '100') {
  // örnek sözlük
  const dict = {
    '100': { 1: 'V1', 8: 'V8', 10: 'V10', 18: 'V18' }
  };
  return dict[companyCode]?.[rate] ?? 'V1';
}

export function defaultGlAccount(category = 'grocery', companyCode = '100') {
  const dict = {
    '100': {
      grocery: '760000',
      bakery: '760010',
      beverage: '760020'
    }
  };
  return dict[companyCode]?.[category] ?? '760000';
}
