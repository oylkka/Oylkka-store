import { describe, expect, it } from 'bun:test';
import { SkuService } from '@/services/sku-service';

describe('SkuService.isValidSku', () => {
  it('accepts valid 4-4-3 pattern', () => {
    expect(SkuService.isValidSku('ELEC-ADAP001')).toBe(true);
  });

  it('accepts valid 2-2-3 pattern', () => {
    expect(SkuService.isValidSku('EL-AD001')).toBe(true);
  });

  it('accepts valid 1-1-3 pattern', () => {
    expect(SkuService.isValidSku('E-A001')).toBe(true);
  });

  it('rejects sku without digits suffix', () => {
    expect(SkuService.isValidSku('ELEC-ADAP')).toBe(false);
  });

  it('rejects empty string', () => {
    expect(SkuService.isValidSku('')).toBe(false);
  });

  it('rejects sku with lowercase letters', () => {
    expect(SkuService.isValidSku('elec-adap001')).toBe(false);
  });

  it('rejects sku without hyphen', () => {
    expect(SkuService.isValidSku('ELECADAP001')).toBe(false);
  });

  it('rejects sku with special characters', () => {
    expect(SkuService.isValidSku('ELEC-AD@P001')).toBe(false);
  });

  it('rejects sku with too many prefix chars', () => {
    expect(SkuService.isValidSku('ABCDE-ADAP001')).toBe(false);
  });

  it('rejects sku with only letters in suffix', () => {
    expect(SkuService.isValidSku('ELEC-ABCD')).toBe(false);
  });
});

describe('SkuService.suggestSku', () => {
  it('generates sku from single-word category', () => {
    expect(SkuService.suggestSku('Electronics', 'Adapter')).toBe('E-ADA001');
  });

  it('handles multi-word category (uses first char of each word)', () => {
    expect(SkuService.suggestSku('Home & Garden', 'Plant Pot')).toBe(
      'HG-PLA001',
    );
  });

  it('handles hyphenated category', () => {
    expect(SkuService.suggestSku('Home-Garden', 'Watering Can')).toBe(
      'HG-WAT001',
    );
  });

  it('truncates prefix to 4 chars', () => {
    expect(SkuService.suggestSku('ABCDEF GHIJ KLM', 'Test')).toBe('AGK-TES001');
  });

  it('strips special chars from product name', () => {
    expect(SkuService.suggestSku('Tools', 'Hammer!@#')).toBe('T-HAM001');
  });

  it('truncates suffix to 3 chars', () => {
    expect(SkuService.suggestSku('Test', 'ABCDEFGHIJ')).toBe('T-ABC001');
  });

  it('handles empty category', () => {
    expect(SkuService.suggestSku('', 'Product')).toBe('GEN-PRO001');
  });

  it('handles empty product name', () => {
    expect(SkuService.suggestSku('Category', '')).toBe('C-PRD001');
  });
});

describe('SkuService.sanitizeSku', () => {
  it('converts to uppercase', () => {
    expect(SkuService.sanitizeSku('elec-adap001')).toBe('ELEC-ADAP001');
  });

  it('removes invalid characters', () => {
    expect(SkuService.sanitizeSku('ELEC-AD@P#001')).toBe('ELEC-ADP001');
  });

  it('truncates to 20 chars', () => {
    expect(SkuService.sanitizeSku('ABCDEFGHIJKLMNOPQRSTUVWXYZ')).toBe(
      'ABCDEFGHIJKLMNOPQRST',
    );
  });

  it('preserves valid format', () => {
    expect(SkuService.sanitizeSku('ELEC-ADAP001')).toBe('ELEC-ADAP001');
  });

  it('handles empty string', () => {
    expect(SkuService.sanitizeSku('')).toBe('');
  });

  it('removes spaces', () => {
    expect(SkuService.sanitizeSku('ELEC ADAP 001')).toBe('ELECADAP001');
  });
});
