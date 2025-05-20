import { getColorName, isLightColor } from '@/utils/color-utils';

describe('getColorName', () => {
  it('returns correct name for known hex codes', () => {
    expect(getColorName('#000000')).toBe('Black');
    expect(getColorName('#ffffff')).toBe('White');
    expect(getColorName('#ff0000')).toBe('Red');
    expect(getColorName('#800080')).toBe('Purple');
  });

  it('returns original hex code for unknown colors', () => {
    expect(getColorName('#123456')).toBe('#123456');
    expect(getColorName('#abcdef')).toBe('#abcdef');
  });

  it('is case insensitive', () => {
    expect(getColorName('#Ff0000')).toBe('Red');
    expect(getColorName('#fFa500')).toBe('Orange');
  });
});

describe('isLightColor', () => {
  it('returns true for light colors', () => {
    expect(isLightColor('#FFFFFF')).toBe(true); // White
    expect(isLightColor('#FFFF00')).toBe(true); // Yellow
    expect(isLightColor('#C0C0C0')).toBe(true); // Silver
  });

  it('returns false for dark colors', () => {
    expect(isLightColor('#000000')).toBe(false); // Black
    expect(isLightColor('#000080')).toBe(false); // Navy
    expect(isLightColor('#800000')).toBe(false); // Maroon
  });

  it('handles lowercase hex codes', () => {
    expect(isLightColor('#ffffff')).toBe(true);
    expect(isLightColor('#000000')).toBe(false);
  });
});
