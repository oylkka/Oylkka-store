import { formatDisplayName, getInitials } from '@/lib/utils';

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
it('returns correct initials for name with multiple middle names', () => {
  expect(getInitials('Ada Lovelace Byron King')).toBe('AK');
});

describe('formatDisplayName', () => {
  it('returns name if name is provided', () => {
    const user = { name: 'John Doe', username: 'johnd' };
    expect(formatDisplayName(user)).toBe('John Doe');
  });

  it('returns username if name is not provided', () => {
    const user = { name: null, username: 'johnd' };
    expect(formatDisplayName(user)).toBe('johnd');
  });

  it('returns "Unknown User" if name and username are not provided', () => {
    const user = { name: null, username: null };
    expect(formatDisplayName(user)).toBe('Unknown User');
  });

  it('returns "Unknown User" if user is undefined', () => {
    expect(formatDisplayName(undefined)).toBe('Unknown User');
  });

  it('returns "Unknown User" if user is null', () => {
    expect(formatDisplayName(null)).toBe('Unknown User');
  });
});
