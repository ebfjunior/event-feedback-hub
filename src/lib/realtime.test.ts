import { describe, it, expect } from 'vitest';
import { isValidRoom } from './realtime';

describe('isValidRoom', () => {
  it('accepts global room', () => {
    expect(isValidRoom('feedbacks')).toBe(true);
  });

  it('accepts event rooms with valid uuid', () => {
    expect(isValidRoom('event:123e4567-e89b-12d3-a456-426614174000')).toBe(true);
  });

  it('rejects non-matching prefixes', () => {
    expect(isValidRoom('events:123e4567-e89b-12d3-a456-426614174000')).toBe(false);
  });

  it('rejects invalid uuid', () => {
    expect(isValidRoom('event:not-a-uuid')).toBe(false);
  });
});


