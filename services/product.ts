import { QEUERY_KEYS } from '@/lib/constants';
import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';

export class SkuService {
  /**
   * Generate a SKU based on product details
   * @param category - Product category
   * @param productName - Name of the product
   * @param subcategory - Product subcategory
   * @param attributeCode - Optional attribute code (color, size, etc)
   * @param sequenceNumber - Optional unique sequence number
   * @returns Generated SKU
   */
  static generateSku(
    category: string,
    productName: string,
    subcategory: string,
    attributeCode?: string,
    sequenceNumber?: number
  ): string {
    // Convert inputs to uppercase and clean them
    const cleanText = (text: string) =>
      text
        .replace(/[^a-zA-Z0-9]/g, '') // Remove special chars
        .toUpperCase();

    // Get category code (first 3 letters)
    const catCode = cleanText(category).substring(0, 3) || 'PRD';

    // Get subcategory code (first 3 letters)
    const subCatCode = cleanText(subcategory).substring(0, 3) || 'GEN';

    // Get product name code (first 3 letters)
    const nameCode = cleanText(productName).substring(0, 3) || 'ITM';

    // Format attribute code if provided
    const attrStr = attributeCode ? `-${cleanText(attributeCode)}` : '';

    // Generate unique sequence based on timestamp if not provided
    const seq = sequenceNumber ?? Math.floor(Date.now() % 100000);
    const seqStr = `-${String(seq).padStart(4, '0')}`;

    // Final SKU format: CAT-SUB-PROD-ATTR-SEQ
    return `${catCode}-${subCatCode}-${nameCode}${attrStr}${seqStr}`;
  }

  /**
   * Validates if a SKU follows the correct format
   * @param sku - SKU to validate
   * @returns boolean indicating if SKU is valid
   */
  static isValidSku(sku: string): boolean {
    const skuRegex =
      /^([A-Z0-9]{1,3})-([A-Z0-9]{1,3})-([A-Z0-9]{1,3})(?:-([A-Z0-9]{1,5}))?(?:-(\d{1,6}))?$/;
    return skuRegex.test(sku);
  }

  /**
   * Suggests a SKU based on product information
   * @param category - Product category
   * @param productName - Product name
   * @param subcategory - Product subcategory
   * @returns A suggested SKU
   */
  static suggestSku(
    category: string,
    productName: string,
    subcategory: string
  ): string {
    // Make sure we have values to work with
    if (!category || !productName || !subcategory) {
      throw new Error(
        'Category, product name, and subcategory are all required for SKU generation'
      );
    }

    // Generate a random number between 1000-9999 for better uniqueness
    const randomNum = Math.floor(1000 + Math.random() * 9000);

    return this.generateSku(
      category,
      productName,
      subcategory,
      undefined,
      randomNum
    );
  }

  /**
   * Sanitizes a SKU string to ensure it follows SKU format rules
   * @param sku - SKU string to sanitize
   * @returns Sanitized SKU string
   */
  static sanitizeSku(sku: string): string {
    if (!sku) return '';

    return sku
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9\-]/g, '');
  }
}

export function useCreateProduct() {
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await axios.post(
        '/api/dashboard/vendor/add-product',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return res.data;
    },
  });
}

export function useProductCategories() {
  return useQuery({
    queryKey: [QEUERY_KEYS.PRODUCT_CATEGORIES],
    queryFn: async () => {
      const response = await axios.get(`/api/dashboard/admin/product-category`);
      return response.data;
    },
  });
}
