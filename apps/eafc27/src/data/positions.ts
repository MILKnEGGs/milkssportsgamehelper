// The positions a formation slot can be, with a short "what is this" for the reference card.

export type Pos =
  | 'GK'
  | 'RB'
  | 'CB'
  | 'LB'
  | 'RWB'
  | 'LWB'
  | 'CDM'
  | 'CM'
  | 'CAM'
  | 'RM'
  | 'LM'
  | 'RW'
  | 'LW'
  | 'CF'
  | 'ST';

/** Role lists are shared by positions that play the same job on either side. */
export type RoleGroup = 'GK' | 'CB' | 'FB' | 'CDM' | 'CM' | 'CAM' | 'WM' | 'W' | 'CF' | 'ST';

export interface PositionInfo {
  pos: Pos;
  name: string;
  group: RoleGroup;
  line: 'Goalkeeper' | 'Defence' | 'Midfield' | 'Attack';
  about: string;
}

export const POSITIONS: Record<Pos, PositionInfo> = {
  GK: {
    pos: 'GK',
    name: 'Goalkeeper',
    group: 'GK',
    line: 'Goalkeeper',
    about: 'Last line of defence. Shot-stopping first; distribution matters more the more you build from the back.',
  },
  CB: {
    pos: 'CB',
    name: 'Centre-Back',
    group: 'CB',
    line: 'Defence',
    about: 'Holds the defensive line, wins duels and headers, and (in a back three) often covers the wide channels.',
  },
  RB: {
    pos: 'RB',
    name: 'Right-Back',
    group: 'FB',
    line: 'Defence',
    about: 'Wide defender in a back four. Defends the flank first; how far forward they go depends on the role.',
  },
  LB: {
    pos: 'LB',
    name: 'Left-Back',
    group: 'FB',
    line: 'Defence',
    about: 'Wide defender in a back four. Defends the flank first; how far forward they go depends on the role.',
  },
  RWB: {
    pos: 'RWB',
    name: 'Right Wing-Back',
    group: 'FB',
    line: 'Defence',
    about: 'Covers the whole right flank on their own. In a back three or five they are often the only width you have.',
  },
  LWB: {
    pos: 'LWB',
    name: 'Left Wing-Back',
    group: 'FB',
    line: 'Defence',
    about: 'Covers the whole left flank on their own. In a back three or five they are often the only width you have.',
  },
  CDM: {
    pos: 'CDM',
    name: 'Defensive Midfielder',
    group: 'CDM',
    line: 'Midfield',
    about: 'Screens the back line, breaks up attacks and recycles the ball. The shield in front of your centre-backs.',
  },
  CM: {
    pos: 'CM',
    name: 'Central Midfielder',
    group: 'CM',
    line: 'Midfield',
    about: 'The engine: links defence to attack, covers ground both ways and keeps possession moving.',
  },
  CAM: {
    pos: 'CAM',
    name: 'Attacking Midfielder',
    group: 'CAM',
    line: 'Midfield',
    about: 'Plays between the lines behind the strikers, creating chances and arriving late in the box.',
  },
  RM: {
    pos: 'RM',
    name: 'Right Midfielder',
    group: 'WM',
    line: 'Midfield',
    about: 'Wide midfielder who gives width in attack and tracks back to help the full-back.',
  },
  LM: {
    pos: 'LM',
    name: 'Left Midfielder',
    group: 'WM',
    line: 'Midfield',
    about: 'Wide midfielder who gives width in attack and tracks back to help the full-back.',
  },
  RW: {
    pos: 'RW',
    name: 'Right Winger',
    group: 'W',
    line: 'Attack',
    about: 'Wide forward who stretches the defence, beats players one-on-one and creates or scores from the flank.',
  },
  LW: {
    pos: 'LW',
    name: 'Left Winger',
    group: 'W',
    line: 'Attack',
    about: 'Wide forward who stretches the defence, beats players one-on-one and creates or scores from the flank.',
  },
  CF: {
    pos: 'CF',
    name: 'Centre-Forward',
    group: 'CF',
    line: 'Attack',
    about: 'Forward just behind or beside the striker: links play, drops into pockets and still gets into scoring spots.',
  },
  ST: {
    pos: 'ST',
    name: 'Striker',
    group: 'ST',
    line: 'Attack',
    about: 'Your main goal threat. Finishes chances, pins the centre-backs and leads the press.',
  },
};

export const POSITION_ORDER: Pos[] = ['GK', 'RB', 'RWB', 'CB', 'LB', 'LWB', 'CDM', 'CM', 'CAM', 'RM', 'LM', 'RW', 'LW', 'CF', 'ST'];
