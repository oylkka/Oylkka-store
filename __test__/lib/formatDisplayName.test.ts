
import { formatDisplayName } from '@/lib/utils';

describe('formatDisplayName', () => {
  it('should return the name if it exists', () => {
    const user = { name: 'John Doe', username: 'johndoe' };
    expect(formatDisplayName(user)).toBe('John Doe');
  });

  it('should return the username if the name does not exist', () => {
    const user = { name: null, username: 'johndoe' };
    expect(formatDisplayName(user)).toBe('johndoe');
  });

  it('should return "Unknown User" if both name and username are null', () => {
    const user = { name: null, username: null };
    expect(formatDisplayName(user)).toBe('Unknown User');
  });

  it('should return "Unknown User" if the user object is null', () => {
    expect(formatDisplayName(null)).toBe('Unknown User');
  });

    it('should return "Unknown User" if the user object is undefined', () => {
    expect(formatDisplayName(undefined)).toBe('Unknown User');
    });
});
