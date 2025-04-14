// services/sku-service.ts

export class SkuService {
  /**
   * Generate a SKU based on product details
   * @param categoryCode - Code for product category (1-3 chars)
   * @param subcategoryCode - Code for product subcategory (1-3 chars)
   * @param productName - Name of the product
   * @param attributeCode - Optional attribute code (color, size, etc)
   * @param sequenceNumber - Optional unique sequence number
   * @returns Generated SKU
   */
  static generateSku(
    categoryCode: string,
    subcategoryCode: string,
    productName: string,
    attributeCode?: string,
    sequenceNumber?: number
  ): string {
    // Convert category and subcategory codes to uppercase
    const catCode = categoryCode.toUpperCase().substring(0, 3);
    const subCatCode = subcategoryCode.toUpperCase().substring(0, 3);

    // Extract first 3 letters from product name, uppercase
    const nameCode = productName
      .replace(/[^a-zA-Z0-9]/g, '') // Remove special chars
      .substring(0, 3)
      .toUpperCase();

    // Format attribute code if provided
    const attrStr = attributeCode ? `-${attributeCode.toUpperCase()}` : '';

    // Format sequence number with leading zeros if provided
    const seqStr = sequenceNumber
      ? `-${String(sequenceNumber).padStart(4, '0')}`
      : '';

    // Final SKU format: CAT-SUB-PROD-ATTR-SEQ
    return `${catCode}-${subCatCode}-${nameCode}${attrStr}${seqStr}`;
  }

  static isValidSku(sku: string): boolean {
    // Adjusted regex to allow new format: CAT-SUB-PROD-ATTR-SEQ
    const skuRegex =
      /^[A-Z0-9]{2,3}-[A-Z0-9]{2,3}-[A-Z0-9]{2,3}(-[A-Z0-9]{1,5})?(-\d{1,6})?$/;
    return skuRegex.test(sku);
  }

  static suggestSku(
    category: string,
    subcategory: string,
    productName: string
  ): string {
    const catCode = category ? category.substring(0, 3).toUpperCase() : 'PRD';
    const subCatCode = subcategory
      ? subcategory.substring(0, 3).toUpperCase()
      : 'GEN';
    const timestamp = Date.now() % 10000;
    return this.generateSku(
      catCode,
      subCatCode,
      productName,
      undefined,
      timestamp
    );
  }

  static sanitizeSku(sku: string): string {
    return sku
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9\-]/g, '');
  }
}
