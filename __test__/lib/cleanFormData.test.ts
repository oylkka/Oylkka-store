import { cleanFormData } from '@/lib/utils';

describe('cleanFormData', () => {
  it('removes empty strings, null, and undefined', () => {
    const input = {
      name: 'Alice',
      email: '',
      phone: null,
      address: undefined,
    };

    const expected = {
      name: 'Alice',
    };

    expect(cleanFormData(input)).toEqual(expected);
  });

  it('retains valid strings, numbers, and booleans', () => {
    const input = {
      name: 'Bob',
      age: 30,
      active: true,
      notes: '   note here  ',
    };

    expect(cleanFormData(input)).toEqual(input);
  });

  it('keeps arrays even if they are empty', () => {
    const input = {
      tags: [],
      roles: ['admin', 'editor'],
    };

    expect(cleanFormData(input)).toEqual(input);
  });

  it('keeps Date and File objects', () => {
    const date = new Date();
    const file = new File(['sample'], 'sample.txt');

    const input = {
      createdAt: date,
      document: file,
      irrelevant: '',
    };

    expect(cleanFormData(input)).toEqual({
      createdAt: date,
      document: file,
    });
  });

  it('cleans nested objects recursively', () => {
    const input = {
      user: {
        name: '',
        email: 'user@example.com',
        profile: {
          bio: '',
          age: 25,
        },
      },
      meta: null,
    };

    const expected = {
      user: {
        email: 'user@example.com',
        profile: {
          age: 25,
        },
      },
    };

    expect(cleanFormData(input)).toEqual(expected);
  });

  it('removes keys with empty nested objects', () => {
    const input = {
      user: {
        name: '',
      },
      other: '',
    };

    const expected = {};

    expect(cleanFormData(input)).toEqual(expected);
  });
});
