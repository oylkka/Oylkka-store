import { getInitials } from '@/lib/utils';

describe('getInitials', () => {
  it('returns empty string for null input', () => {
    expect(getInitials(null)).toBe('');
  });

  it('returns empty string for undefined input', () => {
    expect(getInitials(undefined)).toBe('');
  });

  it('returns empty string for empty string input', () => {
    expect(getInitials('')).toBe('');
  });

  it('returns uppercase initial for single-word name', () => {
    expect(getInitials('alice')).toBe('A');
    expect(getInitials(' Bob ')).toBe('B');
  });

  it('returns initials for multi-word name', () => {
    expect(getInitials('John Doe')).toBe('JD');
    expect(getInitials('   Jane Ann Smith   ')).toBe('JS');
    expect(getInitials('elon musk')).toBe('EM');
  });

  it('handles names with extra spaces correctly', () => {
    expect(getInitials('  Elon   Reeve   Musk  ')).toBe('EM');
  });

  it('handles names with numbers or symbols', () => {
    expect(getInitials('123 456')).toBe('14');
    expect(getInitials('@John #Doe')).toBe('@#');
  });

  it('returns correct initials for long names', () => {
    expect(getInitials('Firstname Middlename Lastname')).toBe('FL');
    expect(getInitials('Very Long Complex Name Example')).toBe('VE');
  });
});
