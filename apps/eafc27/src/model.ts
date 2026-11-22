// The save format. One Career is one document: everything for that save lives inside it, so a
// backup or a share code is just the career object. Only name/title fields are required; the rest
// is optional so a quick note never needs a full form.

import { uid } from '@milk/core/util';
import { FORMATIONS, defaultOrder, formationById, type TacticPreset } from './data/formations';
import type { Pos } from './data/positions';
import type { Focus } from './data/roles';

export const APP = 'milks-eafc27';
export const FORMAT = 1;
export const SHARE_PREFIX = 'FC27';

export type Priority = 'critical' | 'high' | 'medium' | 'low';
export const PRIORITIES: Priority[] = ['critical', 'high', 'medium', 'low'];
export const PRIORITY_LABEL: Record<Priority, string> = { critical: 'Critical', high: 'High', medium: 'Medium', low: 'Low' };

export type PlayerStatus = 'watching' | 'target' | 'negotiating' | 'signed' | 'passed';
export const PLAYER_STATUS: { id: PlayerStatus; label: string }[] = [
  { id: 'watching', label: 'Watchlist' },
  { id: 'target', label: 'Signing target' },
  { id: 'negotiating', label: 'Negotiating' },
  { id: 'signed', label: 'Signed' },
  { id: 'passed', label: 'Passed on' },
];
/** Statuses that count as "signing targets" for the Targets and Priorities views. */
export const TARGET_STATUSES: PlayerStatus[] = ['target', 'negotiating'];

export interface Player {
  id: string;
  name: string;
  pos: Pos;
  /** Other positions they can play. */
  altPos?: Pos[];
  status: PlayerStatus;
  priority?: Priority;
  /** Shared ordering with goals, inside a priority level. Lower comes first. */
  rank: number;
  club?: string;
  age?: number;
  ovr?: number;
  potMin?: number;
  potMax?: number;
  value?: number;
  wage?: number;
  /** Free text, e.g. "2028" or "Jun 2027". */
  contract?: string;
  nation?: string;
  skillMoves?: number;
  weakFoot?: number;
  /** PlayStyle name → 1 (PlayStyle) or 2 (PlayStyle+). */
  playstyles?: Record<string, 1 | 2>;
  stats?: Record<string, number>;
  notes?: string;
  added: string;
}

export type GoalKind = 'board' | 'personal';
export type GoalCategory = 'domestic' | 'continental' | 'financial' | 'youth' | 'brand' | 'other';
export const GOAL_CATEGORIES: { id: GoalCategory; label: string }[] = [
  { id: 'domestic', label: 'Domestic success' },
  { id: 'continental', label: 'Continental success' },
  { id: 'financial', label: 'Financial' },
  { id: 'youth', label: 'Youth development' },
  { id: 'brand', label: 'Brand exposure' },
  { id: 'other', label: 'Other' },
];
export type GoalStatus = 'open' | 'done' | 'failed';

export interface Goal {
  id: string;
  title: string;
  kind: GoalKind;
  category?: GoalCategory;
  priority?: Priority;
  rank: number;
  status: GoalStatus;
  /** Season label, e.g. "2026/27". Blank = no particular season (a long-term goal). */
  season?: string;
  progress?: string;
  notes?: string;
  added: string;
}

export interface YouthPlayer {
  id: string;
  name: string;
  pos?: Pos;
  age?: number;
  ovr?: number;
  potMin?: number;
  potMax?: number;
  nation?: string;
  /** Where the scout found them / which scout. */
  scout?: string;
  notes?: string;
  added: string;
}

export interface SlotPlan {
  role?: string;
  focus?: Focus;
  budget?: number;
  notes?: string;
  /** Linked players, best fit first. */
  players: string[];
}

export interface FormationPlan {
  /** Slot indexes, most important first. Missing = the app's default order. */
  order?: number[];
  slots: Record<number, SlotPlan>;
  tactics?: TacticPreset & { instructions?: string };
}

export interface Career {
  id: string;
  name: string;
  club?: string;
  season?: string;
  currency: string;
  transferBudget?: number;
  wageBudget?: number;
  /** Personal save rules, e.g. "Homegrown only". */
  rules?: string;
  formation?: string;
  plans: Record<string, FormationPlan>;
  players: Player[];
  goals: Goal[];
  youth: YouthPlayer[];
  created: string;
  updated: string;
}

const now = () => new Date().toISOString();

export function newCareer(name: string, club?: string, season?: string): Career {
  const t = now();
  return {
    id: uid(),
    name: name.trim() || club?.trim() || 'New career',
    club: club?.trim() || undefined,
    season: season?.trim() || undefined,
    currency: '$',
    formation: FORMATIONS.find((f) => f.name === '4-2-3-1')?.id,
    plans: {},
    players: [],
    goals: [],
    youth: [],
    created: t,
    updated: t,
  };
}

/** Next rank: after everything else (goals and players share one ranking). */
export function nextRank(c: Career): number {
  const all = [...c.players.map((p) => p.rank), ...c.goals.map((g) => g.rank)];
  return all.length ? Math.max(...all) + 1 : 1;
}

export function newPlayer(c: Career, name: string, pos: Pos, extra: Partial<Player> = {}): Player {
  return { id: uid(), name: name.trim(), pos, status: 'watching', rank: nextRank(c), added: now(), ...extra };
}

export function newGoal(c: Career, title: string, extra: Partial<Goal> = {}): Goal {
  return { id: uid(), title: title.trim(), kind: 'board', status: 'open', rank: nextRank(c), season: c.season, added: now(), ...extra };
}

export function newYouth(name: string, extra: Partial<YouthPlayer> = {}): YouthPlayer {
  return { id: uid(), name: name.trim(), added: now(), ...extra };
}

// ---- Priorities (the combined view) -------------------------------------------------------------

export type PriorityItem = { kind: 'goal'; item: Goal } | { kind: 'player'; item: Player };

const pIndex = (p: Priority | undefined) => PRIORITIES.indexOf(p ?? 'medium');

export function byPriority(a: { priority?: Priority; rank: number }, b: { priority?: Priority; rank: number }): number {
  return pIndex(a.priority) - pIndex(b.priority) || a.rank - b.rank;
}

/** Open goals and live signing targets, most important first. */
export function priorityList(c: Career): PriorityItem[] {
  const items: PriorityItem[] = [
    ...c.goals.filter((g) => g.status === 'open').map((item) => ({ kind: 'goal' as const, item })),
    ...c.players.filter((p) => TARGET_STATUSES.includes(p.status)).map((item) => ({ kind: 'player' as const, item })),
  ];
  return items.sort((a, b) => byPriority(a.item, b.item));
}

/**
 * Moves an item up or down within the given list (only past items of the same priority) by
 * swapping ranks. The list is whatever the user is looking at, so the combined and separate views
 * both reorder the same shared ranking.
 */
export function nudge(list: { priority?: Priority; rank: number }[], index: number, dir: -1 | 1): void {
  const a = list[index];
  const b = list[index + dir];
  if (!a || !b || (a.priority ?? 'medium') !== (b.priority ?? 'medium')) return;
  if (a.rank === b.rank) a.rank = b.rank + dir * 0.5;
  else [a.rank, b.rank] = [b.rank, a.rank];
}

// ---- Formation plans ----------------------------------------------------------------------------

export function planFor(c: Career, formationId: string): FormationPlan {
  return (c.plans[formationId] ??= { slots: {} });
}

export function slotPlan(c: Career, formationId: string, i: number): SlotPlan {
  return (planFor(c, formationId).slots[i] ??= { players: [] });
}

/** Slot order for a career's plan, repaired if it's missing or doesn't match the formation. */
export function slotOrder(c: Career, formationId: string): number[] {
  const f = formationById(formationId);
  if (!f) return [];
  const saved = c.plans[formationId]?.order;
  const ok = saved && saved.length === f.slots.length && f.slots.every((s) => saved.includes(s.i));
  return ok ? saved : defaultOrder(f);
}

export function tacticsFor(c: Career, formationId: string): TacticPreset & { instructions?: string } {
  const f = formationById(formationId);
  return c.plans[formationId]?.tactics ?? { ...(f?.tactics ?? { buildUp: 'Balanced', defence: 'Balanced', notes: '' }) };
}

/** Every slot (formation + index) a player is linked to. */
export function slotsOf(c: Career, playerId: string): { formation: string; slot: number }[] {
  const out: { formation: string; slot: number }[] = [];
  for (const [fid, plan] of Object.entries(c.plans))
    for (const [i, s] of Object.entries(plan.slots)) if (s.players.includes(playerId)) out.push({ formation: fid, slot: +i });
  return out;
}

export function removePlayer(c: Career, playerId: string): void {
  c.players = c.players.filter((p) => p.id !== playerId);
  for (const plan of Object.values(c.plans)) for (const s of Object.values(plan.slots)) s.players = s.players.filter((id) => id !== playerId);
}

// ---- Import --------------------------------------------------------------------------------------

/** Fills anything an older or hand-edited save is missing, so the app never trips over it. */
export function normalize(raw: Partial<Career>): Career {
  const t = now();
  const c: Career = {
    ...newCareer(raw.name ?? 'Imported career'),
    ...raw,
    id: raw.id || uid(),
    currency: raw.currency || '$',
    plans: raw.plans ?? {},
    players: (raw.players ?? []).filter((p) => p && p.name),
    goals: (raw.goals ?? []).filter((g) => g && g.title),
    youth: (raw.youth ?? []).filter((y) => y && y.name),
    created: raw.created || t,
    updated: raw.updated || t,
  };
  c.players.forEach((p, k) => {
    p.id ||= uid();
    p.status ||= 'watching';
    p.rank ??= k + 1;
    p.added ||= t;
  });
  c.goals.forEach((g, k) => {
    g.id ||= uid();
    g.kind ||= 'board';
    g.status ||= 'open';
    g.rank ??= 1000 + k;
    g.added ||= t;
  });
  c.youth.forEach((y) => {
    y.id ||= uid();
    y.added ||= t;
  });
  for (const plan of Object.values(c.plans)) {
    plan.slots ??= {};
    for (const s of Object.values(plan.slots)) s.players = (s.players ?? []).filter((id) => c.players.some((p) => p.id === id));
  }
  return c;
}

/** A copy with a new id, for "keep both" when an imported career is already here. */
export function asCopy(c: Career): Career {
  return { ...(JSON.parse(JSON.stringify(c)) as Career), id: uid(), name: `${c.name} (copy)`, updated: now() };
}

export function potential(p: { potMin?: number; potMax?: number }): string {
  if (p.potMin && p.potMax && p.potMin !== p.potMax) return `${p.potMin}–${p.potMax}`;
  return String(p.potMax ?? p.potMin ?? '');
}

/** "Next season" label: 2026/27 → 2027/28, 2026 → 2027; anything else is left alone. */
export function nextSeason(season: string | undefined): string | undefined {
  if (!season) return season;
  const m = season.match(/^(\d{4})(\s*[/-]\s*)(\d{2}|\d{4})$/);
  if (m) {
    const a = +m[1] + 1;
    const b = m[3].length === 2 ? String((+m[3] + 1) % 100).padStart(2, '0') : String(+m[3] + 1);
    return `${a}${m[2]}${b}`;
  }
  return /^\d{4}$/.test(season) ? String(+season + 1) : season;
}
