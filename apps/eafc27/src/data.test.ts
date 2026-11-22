import { describe, expect, it } from 'vitest';
import { FORMATIONS, defaultOrder, roleFits } from './data/formations';
import { PLAYSTYLES } from './data/playstyles';
import { POSITIONS } from './data/positions';
import { GROUP_ROLES, ROLE_INFO } from './data/roles';

describe('formations', () => {
  it('has unique ids', () => {
    expect(new Set(FORMATIONS.map((f) => f.id)).size).toBe(FORMATIONS.length);
  });

  for (const f of FORMATIONS) {
    it(`${f.name} is a valid eleven`, () => {
      expect(f.slots).toHaveLength(11);
      expect(f.slots.filter((s) => s.pos === 'GK')).toHaveLength(1);
      // The shape in the name adds up to the outfield players.
      const outfield = f.name.split(' ')[0].split('-').reduce((a, n) => a + +n, 0);
      expect(outfield).toBe(10);
      expect(new Set(f.slots.map((s) => s.label)).size).toBe(11);
      for (const s of f.slots) {
        expect(roleFits(s.pos, s.role, s.focus), `${s.label}: ${s.role} (${s.focus})`).toBe(true);
        expect(s.x).toBeGreaterThanOrEqual(0);
        expect(s.x).toBeLessThanOrEqual(100);
      }
      for (const label of Object.keys(f.keys)) expect(f.slots.some((s) => s.label === label), `key slot ${label}`).toBe(true);
      expect(defaultOrder(f).sort((a, b) => a - b)).toEqual(f.slots.map((s) => s.i));
    });
  }
});

describe('roles', () => {
  it('every role offered has details', () => {
    for (const opts of Object.values(GROUP_ROLES)) for (const o of opts) expect(ROLE_INFO[o.role], o.role).toBeDefined();
  });

  it('suggested PlayStyles are real FC 27 PlayStyles', () => {
    const names = new Set(PLAYSTYLES.map((p) => p.name));
    for (const r of Object.values(ROLE_INFO)) for (const p of r.playstyles) expect(names.has(p), `${r.name}: ${p}`).toBe(true);
  });

  it('every position has a role group', () => {
    for (const p of Object.values(POSITIONS)) expect(GROUP_ROLES[p.group].length).toBeGreaterThan(0);
  });
});
