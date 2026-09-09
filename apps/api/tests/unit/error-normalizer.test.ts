import { describe, it, expect } from 'vitest';
import { normalizeApiError } from '../../../../apps/web/src/lib/error-normalizer';


describe('Error Normalizer Unit Tests', () => {
  it('normalizes 401 unauthorized to polite session message', () => {
    const res = normalizeApiError({ status: 401, message: 'jwt expired' });
    expect(res.title).toBe('Session expired');
    expect(res.code).toBe('UNAUTHORIZED');
  });

  it('normalizes 403 forbidden', () => {
    const res = normalizeApiError({ status: 403 });
    expect(res.title).toBe('Access restricted');
    expect(res.code).toBe('FORBIDDEN');
  });

  it('normalizes 400 validation error with field details', () => {
    const res = normalizeApiError({
      status: 400,
      details: [
        { field: 'title', message: 'Required' },
        { field: 'price', message: 'Must be positive' },
      ],
    });
    expect(res.title).toBe('Check your details');
    expect(res.message).toContain('title: Required');
    expect(res.message).toContain('price: Must be positive');
  });

  it('normalizes network disconnect errors without technical jargon', () => {
    const res = normalizeApiError(new Error('Failed to fetch'));
    expect(res.title).toBe('Connection interrupted');
    expect(res.code).toBe('NETWORK_ERROR');
  });

  it('sanitizes mongo / db errors', () => {
    const res = normalizeApiError(new Error('E11000 duplicate key error collection'));
    expect(res.title).toBe('Unable to complete request');
    expect(res.code).toBe('DB_ERROR');
    expect(res.message).not.toContain('E11000');
  });
});
