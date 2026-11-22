// Formations, their slots, a starting role for every slot, how much each slot matters, and starting tactics.
//
// Source note: no site publishes FC 27's full formation list or the game's default role per slot.
// The list below is the long-standing FC formation set (unchanged in recent years), and the starting
// roles are this app's best match for each shape. Everything is editable per career in the app.

import { POSITIONS, type Pos } from './positions';
import { GROUP_ROLES, type Focus } from './roles';

export interface Slot {
  /** Index within the formation; slot data in a career is keyed by this. */
  i: number;
  pos: Pos;
  /** On-pitch label, e.g. LCB, RS. */
  label: string;
  /** 0 = left touchline, 100 = right. */
  x: number;
  /** 0 = own goal line, 100 = opponent's. */
  y: number;
  role: string;
  focus: Focus;
}

export interface TacticPreset {
  buildUp: string;
  defence: string;
  lineHeight?: number;
  notes: string;
}

export interface Formation {
  id: string;
  name: string;
  /** Back line size, for grouping the picker. */
  back: 3 | 4 | 5;
  style: string;
  strengths: string;
  weaknesses: string;
  slots: Slot[];
  /** Slot labels that carry the shape, with why. */
  keys: Record<string, string>;
  tactics: TacticPreset;
}

export const BUILD_UP_STYLES = ['Balanced', 'Short Passing', 'Counter', 'Long Ball'];
export const DEFENSIVE_APPROACHES = ['Balanced', 'Deep', 'High', 'Aggressive'];

const LEFT = new Set<Pos>(['LB', 'LWB', 'LM', 'LW']);
const RIGHT = new Set<Pos>(['RB', 'RWB', 'RM', 'RW']);

const LABELS: Partial<Record<Pos, string[][]>> = {
  // [count-1] → labels left to right
  CB: [['CB'], ['LCB', 'RCB'], ['LCB', 'CB', 'RCB']],
  CDM: [['CDM'], ['LDM', 'RDM'], ['LDM', 'CDM', 'RDM']],
  CM: [['CM'], ['LCM', 'RCM'], ['LCM', 'CM', 'RCM']],
  CAM: [['CAM'], ['LAM', 'RAM'], ['LAM', 'CAM', 'RAM']],
  CF: [['CF'], ['LF', 'RF']],
  ST: [['ST'], ['LS', 'RS']],
};

function centralXs(n: number, hasWide: boolean): number[] {
  const presets: Record<number, number[]> = hasWide
    ? { 1: [50], 2: [38, 62], 3: [30, 50, 70], 4: [26, 42, 58, 74] }
    : { 1: [50], 2: [36, 64], 3: [24, 50, 76], 4: [16, 38, 62, 84] };
  return presets[n] ?? Array.from({ length: n }, (_, k) => 15 + (70 * k) / Math.max(1, n - 1));
}

/** Starting role for a slot, from its position and the shape around it. */
function startingRole(pos: Pos, nth: number, count: number, all: Pos[]): [string, Focus] {
  const has = (p: Pos) => all.includes(p);
  switch (pos) {
    case 'GK':
      return ['Goalkeeper', 'Defend'];
    case 'CB':
      return ['Defender', 'Defend'];
    case 'LB':
    case 'RB':
      return ['Fullback', 'Balanced'];
    case 'LWB':
    case 'RWB':
      return ['Wingback', 'Balanced'];
    case 'CDM':
      return count >= 2 && nth === count - 1 ? ['Deep-Lying Playmaker', 'Defend'] : ['Holding', 'Defend'];
    case 'CM':
      if (count === 3 && nth === 1 && !has('CDM')) return ['Deep-Lying Playmaker', 'Defend'];
      if (count === 1 && !has('CAM')) return ['Playmaker', 'Attack'];
      return ['Box-to-Box', 'Balanced'];
    case 'CAM':
      if (count === 3 && nth !== 1) return ['Half-Winger', 'Balanced'];
      if (count === 2 && nth === 1) return ['Shadow Striker', 'Attack'];
      return ['Playmaker', 'Balanced'];
    case 'LM':
    case 'RM':
      return ['Winger', 'Balanced'];
    case 'LW':
    case 'RW':
      return ['Winger', 'Balanced'];
    case 'CF':
      return has('ST') ? ['Shadow Striker', 'Attack'] : ['False 9', 'Build-Up'];
    case 'ST':
      return count === 2 && nth === 1 ? ['Target Forward', 'Balanced'] : ['Advanced Forward', 'Attack'];
  }
}

function build(lines: string): Slot[] {
  const rows = lines.split('|').map((l) => l.trim().split(/\s+/) as Pos[]);
  const all = rows.flat();
  const seen: Partial<Record<Pos, number>> = {};
  const slots: Slot[] = [];
  rows.forEach((row, r) => {
    const y = r === 0 ? 6 : 20 + ((r - 1) * 70) / Math.max(1, rows.length - 2);
    const central = row.filter((p) => !LEFT.has(p) && !RIGHT.has(p));
    const xs = centralXs(central.length, central.length !== row.length);
    let c = 0;
    for (const pos of row) {
      const count = all.filter((p) => p === pos).length;
      const nth = (seen[pos] = (seen[pos] ?? -1) + 1);
      const label = LABELS[pos]?.[count - 1]?.[nth] ?? pos;
      const x = LEFT.has(pos) ? 10 : RIGHT.has(pos) ? 90 : xs[c++];
      const [role, focus] = startingRole(pos, nth, count, all);
      slots.push({ i: slots.length, pos, label, x, y: Math.round(y), role, focus });
    }
  });
  return slots;
}

type Def = Omit<Formation, 'id' | 'slots' | 'back'> & { lines: string };

const DEFS: Def[] = [
  {
    name: '3-1-4-2',
    lines: 'GK | CB CB CB | CDM | LM CM CM RM | ST ST',
    style: 'Three centre-backs with one holder and a flat four ahead, two strikers.',
    strengths: 'Lots of bodies in midfield and two up top.',
    weaknesses: 'Wide midfielders must track back or the flanks open up.',
    keys: { CDM: 'The lone holder protects three centre-backs on his own.', LM: 'All your width on the left.', RM: 'All your width on the right.' },
    tactics: { buildUp: 'Balanced', defence: 'Balanced', lineHeight: 50, notes: 'Wide mids on Wide Midfielder (Defend) if you keep getting hit on the break.' },
  },
  {
    name: '3-4-1-2',
    lines: 'GK | CB CB CB | LM CM CM RM | CAM | ST ST',
    style: 'Back three, flat midfield four, a number 10 behind two strikers.',
    strengths: 'Central overloads; the CAM links two strikers.',
    weaknesses: 'Thin out wide when the wide mids push on.',
    keys: { CAM: 'The link between midfield and two strikers.', LM: 'Only natural width on the left.', RM: 'Only natural width on the right.' },
    tactics: { buildUp: 'Short Passing', defence: 'Balanced', lineHeight: 55, notes: 'Box-to-Box plus Deep-Lying Playmaker in the middle two is a good balance.' },
  },
  {
    name: '3-4-2-1',
    lines: 'GK | CB CB CB | LM CM CM RM | CF CF | ST',
    style: 'Back three, flat midfield four, two forwards behind a lone striker.',
    strengths: 'Strong between the lines; great for quick one-twos centrally.',
    weaknesses: 'The lone striker can be isolated; wide areas rely on two players.',
    keys: { ST: 'Lone striker who must finish and hold the ball up.', LF: 'Arrives from deep to support the striker.', RF: 'Arrives from deep to support the striker.' },
    tactics: { buildUp: 'Short Passing', defence: 'Balanced', lineHeight: 55, notes: 'Shadow Striker in the CF spots gives the striker company in the box.' },
  },
  {
    name: '3-4-3',
    lines: 'GK | CB CB CB | LM CM CM RM | LW ST RW',
    style: 'Back three, flat four, three forwards.',
    strengths: 'Very attacking: five players can join attacks.',
    weaknesses: 'Two central midfielders get overrun against three.',
    keys: { LCM: 'One of only two central players; needs stamina and defending.', RCM: 'One of only two central players; needs stamina and defending.', ST: 'Focal point for a front three.' },
    tactics: { buildUp: 'Counter', defence: 'High', lineHeight: 60, notes: 'Press high so the thin midfield isn\'t exposed.' },
  },
  {
    name: '3-5-2',
    lines: 'GK | CB CB CB | CDM CDM | LM CAM RM | ST ST',
    style: 'Back three, two holders, a number 10 and two strikers.',
    strengths: 'Solid centrally with a real playmaker and a strike partnership.',
    weaknesses: 'Wide mids carry the flanks alone.',
    keys: { CAM: 'The creator of the whole shape.', LM: 'Only width on the left.', RM: 'Only width on the right.' },
    tactics: { buildUp: 'Balanced', defence: 'Balanced', lineHeight: 50, notes: 'Outer centre-backs as Wide Back cover the space behind the wide mids.' },
  },
  {
    name: '4-1-2-1-2',
    lines: 'GK | LB CB CB RB | CDM | LM RM | CAM | ST ST',
    style: 'Wide diamond: one holder, two wide mids, a 10 and two strikers.',
    strengths: 'Width plus a central creator and two strikers.',
    weaknesses: 'The lone CDM has a lot of ground to cover.',
    keys: { CDM: 'Alone in front of the back four.', CAM: 'Tip of the diamond and main creator.' },
    tactics: { buildUp: 'Balanced', defence: 'Balanced', lineHeight: 50, notes: 'Wide mids on Wide Midfielder (Support) help the lone CDM.' },
  },
  {
    name: '4-1-2-1-2 (2)',
    lines: 'GK | LB CB CB RB | CDM | CM CM | CAM | ST ST',
    style: 'Narrow diamond: holder, two shuttlers, a 10 and two strikers.',
    strengths: 'Dominates the middle; great for quick passing into two strikers. A meta favourite.',
    weaknesses: 'No natural width: full-backs must provide it.',
    keys: { CDM: 'Base of the diamond; protects against counters.', CAM: 'Tip of the diamond and main creator.', LB: 'Has to supply width on the left.', RB: 'Has to supply width on the right.' },
    tactics: { buildUp: 'Short Passing', defence: 'Balanced', lineHeight: 55, notes: 'Attacking Wingback on one side, Fullback (Defend) on the other keeps balance.' },
  },
  {
    name: '4-1-3-2',
    lines: 'GK | LB CB CB RB | CDM | LM CM RM | ST ST',
    style: 'One holder, a midfield three with width, two strikers.',
    strengths: 'Balanced width and a strike pair.',
    weaknesses: 'The single CM has to do a lot of linking.',
    keys: { CDM: 'Sole shield for the back four.', CM: 'The only central link to the strikers.' },
    tactics: { buildUp: 'Balanced', defence: 'Balanced', lineHeight: 50, notes: '' },
  },
  {
    name: '4-1-4-1',
    lines: 'GK | LB CB CB RB | CDM | LM CM CM RM | ST',
    style: 'Holder behind a flat four, lone striker.',
    strengths: 'Very compact; hard to play through.',
    weaknesses: 'The striker is often isolated.',
    keys: { CDM: 'Screens the back four and starts attacks.', ST: 'Lone striker; needs hold-up play or pace.' },
    tactics: { buildUp: 'Balanced', defence: 'Deep', lineHeight: 40, notes: 'Good for seeing out leads; one CM on Box-to-Box to support the striker.' },
  },
  {
    name: '4-2-1-3',
    lines: 'GK | LB CB CB RB | CDM CDM | CAM | LW ST RW',
    style: 'Double pivot, a 10 and a front three.',
    strengths: 'Very popular: solid base with five attackers.',
    weaknesses: 'Full-backs are exposed if the wingers don\'t track back.',
    keys: { CAM: 'Connects the pivot to the front three.', ST: 'Focal point of the front three.', LDM: 'Half of the pivot that protects the defence.', RDM: 'Half of the pivot that protects the defence.' },
    tactics: { buildUp: 'Balanced', defence: 'Balanced', lineHeight: 55, notes: 'Inside Forwards on the wings with Attacking Wingbacks overlapping.' },
  },
  {
    name: '4-2-2-2',
    lines: 'GK | LB CB CB RB | CDM CDM | CAM CAM | ST ST',
    style: 'Double pivot, two attacking mids, two strikers (the "magic square").',
    strengths: 'Lots of attackers through the middle.',
    weaknesses: 'Width comes only from full-backs.',
    keys: { LAM: 'Creates and drifts wide.', RAM: 'Creates and arrives in the box.', LB: 'Supplies width on the left.', RB: 'Supplies width on the right.' },
    tactics: { buildUp: 'Short Passing', defence: 'Balanced', lineHeight: 55, notes: '' },
  },
  {
    name: '4-2-3-1',
    lines: 'GK | LB CB CB RB | CDM CDM | CAM CAM CAM | ST',
    style: 'Double pivot, three attacking mids behind a lone striker (narrow).',
    strengths: 'Balanced, flexible and safe at the back.',
    weaknesses: 'The striker needs support or gets isolated.',
    keys: { CAM: 'Central 10: the hub of every attack.', ST: 'Lone striker; must convert.', LDM: 'Protects the defence.', RDM: 'Dictates from deep.' },
    tactics: { buildUp: 'Balanced', defence: 'Balanced', lineHeight: 50, notes: 'A strong all-round starting point.' },
  },
  {
    name: '4-2-3-1 (2)',
    lines: 'GK | LB CB CB RB | CDM CDM | LM CAM RM | ST',
    style: 'Double pivot with wide midfielders, a 10 and a lone striker (wide).',
    strengths: 'Width and solidity; good for protecting a lead.',
    weaknesses: 'Can be slow to support the striker.',
    keys: { CAM: 'Main creator behind the striker.', ST: 'Lone striker; must convert.' },
    tactics: { buildUp: 'Balanced', defence: 'Balanced', lineHeight: 50, notes: '' },
  },
  {
    name: '4-2-4',
    lines: 'GK | LB CB CB RB | CM CM | LW ST ST RW',
    style: 'Two central mids and four attackers.',
    strengths: 'All-out attack.',
    weaknesses: 'Easily overrun in midfield.',
    keys: { LCM: 'One of two holding the whole midfield.', RCM: 'One of two holding the whole midfield.' },
    tactics: { buildUp: 'Counter', defence: 'High', lineHeight: 60, notes: 'Use late in games when chasing a goal.' },
  },
  {
    name: '4-3-1-2',
    lines: 'GK | LB CB CB RB | CM CM CM | CAM | ST ST',
    style: 'Three central mids, a 10 and two strikers.',
    strengths: 'Central control with two strikers; a meta pick.',
    weaknesses: 'Narrow; relies on full-backs for width.',
    keys: { CAM: 'Feeds the two strikers.', CM: 'Holds the midfield three together.' },
    tactics: { buildUp: 'Short Passing', defence: 'Balanced', lineHeight: 55, notes: '' },
  },
  {
    name: '4-3-2-1',
    lines: 'GK | LB CB CB RB | CM CM CM | CF CF | ST',
    style: 'The "Christmas tree": three mids, two forwards behind one striker.',
    strengths: 'Packed centre and lots of attacking support.',
    weaknesses: 'No width at all except the full-backs.',
    keys: { ST: 'Tip of the tree; needs finishing.', LF: 'Arrives in the box behind the striker.', RF: 'Arrives in the box behind the striker.' },
    tactics: { buildUp: 'Short Passing', defence: 'Balanced', lineHeight: 50, notes: '' },
  },
  {
    name: '4-3-3',
    lines: 'GK | LB CB CB RB | CM CM CM | LW ST RW',
    style: 'Flat midfield three and a front three.',
    strengths: 'Balanced; wide threat with a stable midfield.',
    weaknesses: 'Midfield can be outnumbered by shapes with a 10.',
    keys: { CM: 'Sits in the middle and dictates.', ST: 'Focal point of the front three.' },
    tactics: { buildUp: 'Balanced', defence: 'Balanced', lineHeight: 55, notes: '' },
  },
  {
    name: '4-3-3 (2)',
    lines: 'GK | LB CB CB RB | CDM | CM CM | LW ST RW',
    style: 'One holder, two shuttlers and a front three.',
    strengths: 'Classic balance: shield, engines and attackers.',
    weaknesses: 'The holder can be bypassed by quick switches.',
    keys: { CDM: 'Single holder who protects the back four.', ST: 'Focal point of the front three.' },
    tactics: { buildUp: 'Balanced', defence: 'Balanced', lineHeight: 55, notes: '' },
  },
  {
    name: '4-3-3 (3)',
    lines: 'GK | LB CB CB RB | CDM CDM | CM | LW ST RW',
    style: 'Two holders, one central mid and a front three.',
    strengths: 'Very safe defensively while keeping three attackers.',
    weaknesses: 'Less creativity in the middle.',
    keys: { CM: 'Only forward-thinking central player.', ST: 'Focal point of the front three.' },
    tactics: { buildUp: 'Counter', defence: 'Deep', lineHeight: 40, notes: 'Good away from home.' },
  },
  {
    name: '4-3-3 (4)',
    lines: 'GK | LB CB CB RB | CM CM | CAM | LW ST RW',
    style: 'Two central mids, a 10 and a front three.',
    strengths: 'Very attacking with a creator behind the front three.',
    weaknesses: 'Only two players screen the defence.',
    keys: { CAM: 'Creator behind the front three.', LCM: 'Needs to defend as well as pass.', RCM: 'Needs to defend as well as pass.' },
    tactics: { buildUp: 'Short Passing', defence: 'High', lineHeight: 60, notes: '' },
  },
  {
    name: '4-3-3 (5)',
    lines: 'GK | LB CB CB RB | CDM | CM CM | LW CF RW',
    style: 'One holder, two shuttlers and a front three led by a false 9.',
    strengths: 'Fluid attack; the CF drops in to overload midfield.',
    weaknesses: 'No one stays on the last defender unless the wingers run.',
    keys: { CF: 'Drops off to link play; the shape depends on him.', LW: 'Must attack the space the CF leaves.', RW: 'Must attack the space the CF leaves.' },
    tactics: { buildUp: 'Short Passing', defence: 'Balanced', lineHeight: 55, notes: 'Inside Forward wingers suit a false 9.' },
  },
  {
    name: '4-4-1-1',
    lines: 'GK | LB CB CB RB | LM CM CM RM | CF | ST',
    style: 'Flat four with a forward behind the striker.',
    strengths: 'Simple, safe shape; one of the easiest to start with.',
    weaknesses: 'Can be predictable in attack.',
    keys: { CF: 'Links midfield and the striker.', ST: 'Main goal threat.' },
    tactics: { buildUp: 'Balanced', defence: 'Balanced', lineHeight: 50, notes: '' },
  },
  {
    name: '4-4-1-1 (2)',
    lines: 'GK | LB CB CB RB | LM CM CM RM | CAM | ST',
    style: 'Flat four with a 10 behind the striker.',
    strengths: 'Solid and still creative through the CAM.',
    weaknesses: 'The striker can be isolated if the CAM sits deep.',
    keys: { CAM: 'Creator behind the striker.', ST: 'Main goal threat.' },
    tactics: { buildUp: 'Balanced', defence: 'Balanced', lineHeight: 50, notes: '' },
  },
  {
    name: '4-4-2',
    lines: 'GK | LB CB CB RB | LM CM CM RM | ST ST',
    style: 'Flat 4-4-2 with two strikers.',
    strengths: 'The classic: balanced, easy to understand, two strikers.',
    weaknesses: 'Two central mids can be outnumbered.',
    keys: { LS: 'Half of the strike partnership.', RS: 'Half of the strike partnership.', LCM: 'Needs to cover ground both ways.', RCM: 'Needs to cover ground both ways.' },
    tactics: { buildUp: 'Balanced', defence: 'Balanced', lineHeight: 50, notes: 'Pair an Advanced Forward with a Target Forward.' },
  },
  {
    name: '4-4-2 (2)',
    lines: 'GK | LB CB CB RB | LM CDM CDM RM | ST ST',
    style: '4-4-2 with two holding mids.',
    strengths: 'Very solid centrally.',
    weaknesses: 'Less support for the strikers.',
    keys: { LDM: 'Protects the defence.', RDM: 'Protects the defence and starts attacks.' },
    tactics: { buildUp: 'Counter', defence: 'Deep', lineHeight: 40, notes: '' },
  },
  {
    name: '4-5-1',
    lines: 'GK | LB CB CB RB | LM CM RM | CAM CAM | ST',
    style: 'One central mid, two attacking mids, wide mids and a lone striker.',
    strengths: 'Lots of attacking midfielders supporting the striker.',
    weaknesses: 'A single CM screens the defence.',
    keys: { CM: 'The only central midfielder.', ST: 'Lone striker.' },
    tactics: { buildUp: 'Balanced', defence: 'Balanced', lineHeight: 50, notes: '' },
  },
  {
    name: '4-5-1 (2)',
    lines: 'GK | LB CB CB RB | LM CM CM CM RM | ST',
    style: 'Five across midfield and a lone striker.',
    strengths: 'Very hard to break down.',
    weaknesses: 'Few goals unless midfielders arrive in the box.',
    keys: { ST: 'Lone striker; must hold the ball up.', CM: 'Central anchor.' },
    tactics: { buildUp: 'Counter', defence: 'Deep', lineHeight: 35, notes: 'One CM on Box-to-Box to join the striker.' },
  },
  {
    name: '5-2-1-2',
    lines: 'GK | LWB CB CB CB RWB | CM CM | CAM | ST ST',
    style: 'Five at the back, two central mids, a 10 and two strikers.',
    strengths: 'Solid defence with a real attacking trio.',
    weaknesses: 'Wing-backs must cover the whole flank.',
    keys: { LWB: 'All the width on the left.', RWB: 'All the width on the right.', CAM: 'Creator for the strike pair.' },
    tactics: { buildUp: 'Balanced', defence: 'Balanced', lineHeight: 45, notes: '' },
  },
  {
    name: '5-2-3',
    lines: 'GK | LWB CB CB CB RWB | CM CM | LW ST RW',
    style: 'Five at the back, two mids and a front three.',
    strengths: 'Safe at the back with three attackers on the break.',
    weaknesses: 'Two mids against three can be overrun.',
    keys: { LWB: 'All the width on the left.', RWB: 'All the width on the right.', ST: 'Focal point of the front three.' },
    tactics: { buildUp: 'Counter', defence: 'Balanced', lineHeight: 45, notes: '' },
  },
  {
    name: '5-3-2',
    lines: 'GK | LWB CB CB CB RWB | CM CDM CM | ST ST',
    style: 'Five at the back, three mids and two strikers.',
    strengths: 'Very solid; good counter-attacking shape.',
    weaknesses: 'Width relies on the wing-backs.',
    keys: { LWB: 'All the width on the left.', RWB: 'All the width on the right.', CDM: 'Anchors the midfield three.' },
    tactics: { buildUp: 'Counter', defence: 'Deep', lineHeight: 40, notes: '' },
  },
  {
    name: '5-4-1',
    lines: 'GK | LWB CB CB CB RWB | LM CM CM RM | ST',
    style: 'Five at the back, a flat four and a lone striker.',
    strengths: 'The most defensive shape in the game.',
    weaknesses: 'Very few goals; the striker is isolated.',
    keys: { ST: 'Lone striker; must hold the ball up and finish.' },
    tactics: { buildUp: 'Counter', defence: 'Deep', lineHeight: 30, notes: 'Use to see out a lead.' },
  },
];


export const formationId = (name: string) => name.replace(/[()]/g, '').trim().replace(/\s+/g, '_');

export const FORMATIONS: Formation[] = DEFS.map(({ lines, ...d }) => {
  const slots = build(lines);
  const back = slots.filter((s) => POSITIONS[s.pos].line === 'Defence').length as 3 | 4 | 5;
  return { ...d, id: formationId(d.name), back, slots };
});

export const formationById = (id: string | undefined) => FORMATIONS.find((f) => f.id === id);

// ---- Importance ---------------------------------------------------------------------------------

const BASE: Record<Pos, number> = {
  GK: 6,
  CB: 7,
  LB: 5,
  RB: 5,
  LWB: 6.5,
  RWB: 6.5,
  CDM: 7,
  CM: 6,
  CAM: 7,
  LM: 5.5,
  RM: 5.5,
  LW: 6.5,
  RW: 6.5,
  CF: 6.5,
  ST: 8,
};

/** How much a slot carries its formation: a lone player in a role, and the formation's key slots, matter most. */
export function importance(f: Formation, s: Slot): number {
  const same = f.slots.filter((o) => POSITIONS[o.pos].group === POSITIONS[s.pos].group).length;
  // A wide pair (LB + RB) counts as two players doing one job, like two CBs.
  const lone = same === 1 ? 1.5 : same === 2 ? 0 : -0.5;
  return BASE[s.pos] + lone + (f.keys[s.label] ? 3 : 0);
}

/** Slot indexes, most important first (ties keep the back-to-front order). */
export function defaultOrder(f: Formation): number[] {
  return [...f.slots].sort((a, b) => importance(f, b) - importance(f, a) || a.i - b.i).map((s) => s.i);
}

/** True when the role (and focus) is one that position offers. */
export function roleFits(pos: Pos, role: string, focus?: string): boolean {
  const opt = GROUP_ROLES[POSITIONS[pos].group].find((o) => o.role === role);
  return !!opt && (focus === undefined || opt.focuses.includes(focus as Focus));
}
