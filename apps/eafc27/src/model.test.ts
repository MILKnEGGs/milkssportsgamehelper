import { describe, expect, it } from 'vitest';
import { envelope, readShared, toShareCode } from '@milk/core/share';
import {
  APP,
  FORMAT,
  SHARE_PREFIX,
  newCareer,
  newGoal,
  newPlayer,
  nextSeason,
  normalize,
  nudge,
  priorityList,
  removePlayer,
  slotOrder,
  slotPlan,
} from './model';

describe('priorities', () => {
  it('mixes open goals and live targets, by priority then rank', () => {
    const c = newCareer('Test');
    c.goals.push(newGoal(c, 'Win the league', { priority: 'high' }));
    c.players.push(newPlayer(c, 'Striker A', 'ST', { status: 'target', priority: 'critical' }));
    c.players.push(newPlayer(c, 'Just watching', 'CB'));
    c.goals.push(newGoal(c, 'Done already', { priority: 'critical', status: 'done' }));
    c.goals.push(newGoal(c, 'Sell deadwood'));
    const names = priorityList(c).map((x) => (x.kind === 'goal' ? x.item.title : x.item.name));
    expect(names).toEqual(['Striker A', 'Win the league', 'Sell deadwood']);
  });

  it('nudges only within the same priority', () => {
    const c = newCareer('Test');
    c.goals.push(newGoal(c, 'A', { priority: 'high' }), newGoal(c, 'B', { priority: 'high' }), newGoal(c, 'C', { priority: 'low' }));
    let list = priorityList(c).map((x) => x.item);
    nudge(list, 1, -1);
    list = priorityList(c).map((x) => x.item);
    expect(list.map((g) => (g as { title: string }).title)).toEqual(['B', 'A', 'C']);
    nudge(list, 1, 1); // A (high) can't pass C (low)
    expect(priorityList(c).map((x) => (x.item as { title: string }).title)).toEqual(['B', 'A', 'C']);
  });
});

describe('plans', () => {
  it('unlinks a deleted player from every slot', () => {
    const c = newCareer('Test');
    const p = newPlayer(c, 'CB guy', 'CB');
    c.players.push(p);
    slotPlan(c, '4-4-2', 2).players.push(p.id);
    removePlayer(c, p.id);
    expect(c.plans['4-4-2'].slots[2].players).toEqual([]);
  });

  it('repairs a bad saved order', () => {
    const c = newCareer('Test');
    c.plans['4-4-2'] = { slots: {}, order: [0, 1] };
    expect(slotOrder(c, '4-4-2')).toHaveLength(11);
  });
});

describe('import', () => {
  it('round-trips a career through a share code', async () => {
    const c = newCareer('Wrexham', 'Wrexham', '2026/27');
    c.players.push(newPlayer(c, 'Quick note', 'LW'));
    const code = await toShareCode(SHARE_PREFIX, envelope(APP, FORMAT, [c]));
    const back = await readShared<typeof c>(SHARE_PREFIX, APP, code);
    expect(normalize(back.items[0])).toEqual(c);
  });

  it('fills gaps in partial saves', () => {
    const c = normalize({ name: 'Bare', players: [{ name: 'X', pos: 'ST' } as never] });
    expect(c.players[0].status).toBe('watching');
    expect(c.goals).toEqual([]);
    expect(c.currency).toBe('$');
  });
});

describe('nextSeason', () => {
  it('rolls common formats', () => {
    expect(nextSeason('2026/27')).toBe('2027/28');
    expect(nextSeason('2099/00')).toBe('2100/01');
    expect(nextSeason('2026-2027')).toBe('2027-2028');
    expect(nextSeason('2027')).toBe('2028');
    expect(nextSeason('Year 3')).toBe('Year 3');
  });
});
