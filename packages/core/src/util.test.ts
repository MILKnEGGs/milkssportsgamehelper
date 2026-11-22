import { describe, expect, it } from 'vitest';
import { formatMoney, move, parseMoney } from './util';

describe('parseMoney', () => {
  it('reads shorthand and symbols', () => {
    expect(parseMoney('12.5m')).toBe(12_500_000);
    expect(parseMoney('750K')).toBe(750_000);
    expect(parseMoney('$1,200,000')).toBe(1_200_000);
    expect(parseMoney('€ 2 bn')).toBe(2_000_000_000);
    expect(parseMoney('900')).toBe(900);
  });
  it('gives undefined for blanks and junk', () => {
    expect(parseMoney('')).toBeUndefined();
    expect(parseMoney('lots')).toBeUndefined();
    expect(parseMoney(undefined)).toBeUndefined();
  });
});

describe('formatMoney', () => {
  it('shortens', () => {
    expect(formatMoney(12_500_000, '€')).toBe('€12.5M');
    expect(formatMoney(750_000)).toBe('$750K');
    expect(formatMoney(undefined)).toBe('');
  });
});

describe('move', () => {
  it('moves within bounds only', () => {
    const a = [1, 2, 3];
    move(a, 0, 2);
    expect(a).toEqual([2, 3, 1]);
    move(a, 0, 5);
    expect(a).toEqual([2, 3, 1]);
  });
});
