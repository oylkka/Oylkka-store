const SKU_PATTERN = /^[A-Z]{2,4}-\d{3,6}$/;

const isValidSku = (sku: string): boolean => {
  return SKU_PATTERN.test(sku);
};

const suggestSku = (categoryName: string, productName: string): string => {
  const prefix = categoryName
    .split(/[\s-]+/)
    .map((w) => w.charAt(0).toUpperCase())
    .join('')
    .slice(0, 4);

  const suffix = productName
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
    .slice(0, 3);

  return `${prefix}-${suffix}001`;
};

const sanitizeSku = (sku: string): string => {
  return sku
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, '')
    .slice(0, 20);
};

export const SkuService = {
  isValidSku,
  suggestSku,
  sanitizeSku,
};
