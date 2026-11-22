// Player Roles and Focuses for FC 27, grouped by position, from community guides (fifauteam.com,
// timesaver.gg, Nov 2026). EA doesn't publish "key stats" or "wanted PlayStyles" per role: those
// are this app's own guidance, written from how each role plays. Everything here is a reference
// only; the slot screen lets you pick any role and keep your own notes.

import type { RoleGroup } from './positions';

export type Focus =
  | 'Defend'
  | 'Balanced'
  | 'Attack'
  | 'Build-Up'
  | 'Roaming'
  | 'Versatile'
  | 'Support'
  | 'Aggressive'
  | 'Ball Winning'
  | 'Wide';

export const FOCUS_NOTES: Record<Focus, string> = {
  Defend: 'Stays deeper and prioritises defensive shape.',
  Balanced: 'An even split between attacking and defensive duties.',
  Attack: 'Pushes higher and makes more forward runs.',
  'Build-Up': 'Drops or tucks in to offer a passing option when you have the ball.',
  Roaming: 'Free to drift across the pitch to find space.',
  Versatile: 'Adapts runs to the situation: comes short, goes long or stays wide as needed.',
  Support: 'Stays close to the ball carrier to offer short options.',
  Aggressive: 'Steps out early to press and win the ball high.',
  'Ball Winning': 'Hunts the ball and presses more often.',
  Wide: 'Drifts out to the flanks rather than staying central.',
};

export interface RoleInfo {
  name: string;
  about: string;
  /** In-game attribute names, most important first. */
  keyStats: string[];
  playstyles: string[];
  tips?: string;
}

const R = (name: string, about: string, keyStats: string[], playstyles: string[], tips?: string): RoleInfo => ({
  name,
  about,
  keyStats,
  playstyles,
  tips,
});

/** Role details by role name (a role that appears at two positions shares one entry). */
export const ROLE_INFO: Record<string, RoleInfo> = Object.fromEntries(
  [
    // Goalkeepers
    R('Goalkeeper', 'Traditional shot-stopper who stays near the goal line.', ['GK Reflexes', 'GK Diving', 'GK Positioning', 'GK Handling', 'Reactions'], ['Far Reach', 'Footwork', 'Deflector', 'Cross Claimer'], 'Height helps on crosses; Reflexes and Diving matter most for saves.'),
    R('Sweeper Keeper', 'Comes off the line to cut out balls behind a high defensive line and offers a passing option.', ['GK Reflexes', 'GK Positioning', 'Sprint Speed', 'GK Kicking', 'Reactions'], ['1v1 Close Down', 'Far Reach', 'Far Throw', 'Footwork'], 'Pair with a high defensive line; a slow sweeper keeper is easy to lob.'),
    R('Ball-Playing Keeper', 'A safe passing option in possession; more conservative when defending.', ['GK Kicking', 'Short Passing', 'Long Passing', 'GK Reflexes', 'Composure'], ['Far Throw', 'Footwork', 'Far Reach'], 'Best when you build up short from goal kicks.'),

    // Centre-backs
    R('Defender', 'Traditional centre-back who holds the line and wins duels.', ['Def. Awareness', 'Standing Tackle', 'Strength', 'Heading Accuracy', 'Jumping', 'Sprint Speed'], ['Aerial Fortress', 'Anticipate', 'Block', 'Intercept'], 'Pace (Sprint Speed 70+) keeps a high line safe.'),
    R('Stopper', 'Steps out of the line to challenge attackers before they turn.', ['Standing Tackle', 'Aggression', 'Strength', 'Def. Awareness', 'Acceleration'], ['Anticipate', 'Bruiser', 'Intercept', 'Aerial Fortress'], 'Pair with a Defender who stays home to cover the space left behind.'),
    R('Ball-Playing Defender', 'Defends, then carries or passes the ball out from the back.', ['Short Passing', 'Long Passing', 'Def. Awareness', 'Composure', 'Standing Tackle', 'Vision'], ['Long Ball Pass', 'Pinged Pass', 'Anticipate', 'Intercept'], 'One per back line is usually enough.'),
    R('Wide Back', 'A centre-back who covers the flank when the full-back or wing-back goes forward.', ['Sprint Speed', 'Def. Awareness', 'Standing Tackle', 'Stamina', 'Strength'], ['Jockey', 'Anticipate', 'Intercept', 'Quick Step'], 'Natural fit for the outside spots of a back three.'),

    // Full-backs and wing-backs
    R('Fullback', 'Wide defender who prioritises staying back.', ['Def. Awareness', 'Standing Tackle', 'Sprint Speed', 'Stamina', 'Interceptions'], ['Jockey', 'Intercept', 'Anticipate', 'Relentless']),
    R('Falseback', 'Moves into central midfield when you have the ball.', ['Short Passing', 'Interceptions', 'Def. Awareness', 'Vision', 'Composure', 'Stamina'], ['Tiki Taka', 'Intercept', 'Press Proven', 'Pinged Pass'], 'Good when you want an extra body in midfield during build-up.'),
    R('Wingback', 'Runs up and down the flank in attack and defence.', ['Stamina', 'Sprint Speed', 'Crossing', 'Standing Tackle', 'Acceleration'], ['Relentless', 'Whipped Pass', 'Jockey', 'Quick Step']),
    R('Attacking Wingback', 'Pushes high to provide width and overlapping runs.', ['Sprint Speed', 'Crossing', 'Stamina', 'Dribbling', 'Acceleration'], ['Whipped Pass', 'Relentless', 'Rapid', 'Quick Step'], 'Needs cover behind: a Wide Back, Stopper or a deeper CDM.'),
    R('Inverted Wingback', 'Moves inside to support build-up through the middle.', ['Short Passing', 'Vision', 'Ball Control', 'Stamina', 'Interceptions'], ['Tiki Taka', 'Incisive Pass', 'Press Proven', 'Intercept']),

    // Defensive midfielders
    R('Holding', 'Shields the defence and breaks up play.', ['Interceptions', 'Def. Awareness', 'Standing Tackle', 'Strength', 'Stamina', 'Short Passing'], ['Intercept', 'Anticipate', 'Bruiser', 'Block'], 'The most important defensive job in a one-CDM shape.'),
    R('Centre-Half', 'Drops between the centre-backs to make a temporary back three.', ['Def. Awareness', 'Standing Tackle', 'Heading Accuracy', 'Strength', 'Short Passing'], ['Aerial Fortress', 'Anticipate', 'Intercept', 'Block']),
    R('Deep-Lying Playmaker', 'Builds play from deep in front of the defence.', ['Short Passing', 'Long Passing', 'Vision', 'Composure', 'Interceptions'], ['Long Ball Pass', 'Pinged Pass', 'Incisive Pass', 'Tiki Taka'], 'Pair with a more defensive partner if they lack tackling.'),
    R('Wide Half', 'Covers the sides, dropping into full-back areas when defending.', ['Stamina', 'Interceptions', 'Standing Tackle', 'Sprint Speed', 'Short Passing'], ['Intercept', 'Relentless', 'Jockey']),
    R('Box Crasher', 'Supports midfield, then makes late runs into the box.', ['Stamina', 'Att. Position', 'Finishing', 'Short Passing', 'Interceptions'], ['Relentless', 'Low Driven Shot', 'Intercept']),

    // Central midfielders
    R('Box-to-Box', 'Covers both penalty areas, helping in attack and defence.', ['Stamina', 'Short Passing', 'Interceptions', 'Standing Tackle', 'Long Shots', 'Strength'], ['Relentless', 'Intercept', 'Pinged Pass', 'Bruiser'], 'Stamina 80+ or they fade before the 70th minute.'),
    R('Playmaker', 'Finds space and creates chances for others.', ['Vision', 'Short Passing', 'Ball Control', 'Dribbling', 'Composure', 'Agility'], ['Incisive Pass', 'Tiki Taka', 'Technical', 'Press Proven']),
    R('Half-Winger', 'Moves into the half-spaces between the full-back and centre-back.', ['Dribbling', 'Short Passing', 'Vision', 'Agility', 'Long Shots'], ['Technical', 'Incisive Pass', 'Finesse Shot', 'Press Proven']),

    // Attacking midfielders
    R('Shadow Striker', 'Plays just behind the striker and times runs into the box.', ['Att. Position', 'Finishing', 'Acceleration', 'Composure', 'Shot Power'], ['Finesse Shot', 'Low Driven Shot', 'Quick Step', 'First Touch'], 'Think of them as a second striker; Finishing matters more than Vision.'),
    R('Classic 10', 'Traditional number 10: stays central and dictates the attack.', ['Vision', 'Short Passing', 'Ball Control', 'Composure', 'Long Shots'], ['Incisive Pass', 'Tiki Taka', 'Finesse Shot', 'Press Proven']),

    // Wide midfielders and wingers
    R('Winger', 'Stays close to the touchline to stretch the defence and cross.', ['Sprint Speed', 'Acceleration', 'Dribbling', 'Crossing', 'Agility'], ['Rapid', 'Whipped Pass', 'Quick Step', 'Technical']),
    R('Wide Midfielder', 'Keeps the width and gives defensive support to the full-back.', ['Stamina', 'Crossing', 'Short Passing', 'Interceptions', 'Sprint Speed'], ['Relentless', 'Whipped Pass', 'Intercept']),
    R('Wide Playmaker', 'Starts wide and moves inside to create.', ['Vision', 'Short Passing', 'Dribbling', 'Curve', 'Agility'], ['Incisive Pass', 'Technical', 'Inventive', 'Finesse Shot']),
    R('Inside Forward', 'Cuts inside onto the stronger foot to shoot or run behind.', ['Finishing', 'Dribbling', 'Acceleration', 'Att. Position', 'Curve'], ['Finesse Shot', 'Technical', 'Quick Step', 'Rapid'], 'Play them on the side opposite their stronger foot (a left-footer on the right).'),

    // Strikers
    R('Advanced Forward', 'Stays on the last defender and makes runs in behind.', ['Finishing', 'Sprint Speed', 'Acceleration', 'Att. Position', 'Composure', 'Shot Power'], ['Quick Step', 'Finesse Shot', 'Low Driven Shot', 'Rapid'], 'Pace is king; Acceleration 85+ makes through balls work.'),
    R('Target Forward', 'Physical striker who holds the ball up and wins headers.', ['Strength', 'Heading Accuracy', 'Jumping', 'Finishing', 'Ball Control'], ['Precision Header', 'Enforcer', 'Press Proven', 'Aerial Fortress'], 'Pair with runners who can feed off knock-downs.'),
    R('Poacher', 'Lives in the box and exploits space behind the defence.', ['Finishing', 'Att. Position', 'Reactions', 'Composure', 'Acceleration'], ['Finesse Shot', 'Acrobatic', 'Precision Header', 'Quick Step']),
    R('False 9', 'Drops into midfield to link play and pull centre-backs out.', ['Vision', 'Short Passing', 'Ball Control', 'Dribbling', 'Finishing'], ['Tiki Taka', 'Incisive Pass', 'Technical', 'Press Proven'], 'Works best with runners (wingers or a Shadow Striker) attacking the space they leave.'),
  ].map((r) => [r.name, r]),
);

export interface RoleOption {
  role: string;
  focuses: Focus[];
}

/** Which roles (and their focuses) each position group offers. */
export const GROUP_ROLES: Record<RoleGroup, RoleOption[]> = {
  GK: [
    { role: 'Goalkeeper', focuses: ['Defend', 'Balanced'] },
    { role: 'Sweeper Keeper', focuses: ['Balanced', 'Build-Up'] },
    { role: 'Ball-Playing Keeper', focuses: ['Build-Up'] },
  ],
  CB: [
    { role: 'Defender', focuses: ['Defend', 'Balanced'] },
    { role: 'Stopper', focuses: ['Defend', 'Balanced'] },
    { role: 'Ball-Playing Defender', focuses: ['Defend', 'Build-Up'] },
    { role: 'Wide Back', focuses: ['Defend', 'Aggressive', 'Support'] },
  ],
  FB: [
    { role: 'Fullback', focuses: ['Defend', 'Balanced', 'Versatile'] },
    { role: 'Falseback', focuses: ['Defend', 'Balanced'] },
    { role: 'Wingback', focuses: ['Balanced', 'Versatile'] },
    { role: 'Attacking Wingback', focuses: ['Support', 'Attack'] },
    { role: 'Inverted Wingback', focuses: ['Build-Up', 'Attack'] },
  ],
  CDM: [
    { role: 'Holding', focuses: ['Defend', 'Roaming'] },
    { role: 'Centre-Half', focuses: ['Defend'] },
    { role: 'Deep-Lying Playmaker', focuses: ['Defend', 'Roaming'] },
    { role: 'Wide Half', focuses: ['Build-Up', 'Defend'] },
    { role: 'Box Crasher', focuses: ['Balanced'] },
  ],
  CM: [
    { role: 'Box-to-Box', focuses: ['Balanced', 'Ball Winning'] },
    { role: 'Holding', focuses: ['Defend'] },
    { role: 'Deep-Lying Playmaker', focuses: ['Defend'] },
    { role: 'Playmaker', focuses: ['Attack', 'Roaming'] },
    { role: 'Half-Winger', focuses: ['Support', 'Balanced', 'Attack'] },
  ],
  CAM: [
    { role: 'Playmaker', focuses: ['Balanced', 'Roaming'] },
    { role: 'Shadow Striker', focuses: ['Attack'] },
    { role: 'Half-Winger', focuses: ['Roaming', 'Balanced', 'Attack'] },
    { role: 'Classic 10', focuses: ['Versatile', 'Wide', 'Attack'] },
  ],
  WM: [
    { role: 'Winger', focuses: ['Balanced', 'Attack'] },
    { role: 'Wide Midfielder', focuses: ['Defend', 'Support', 'Build-Up'] },
    { role: 'Wide Playmaker', focuses: ['Attack'] },
    { role: 'Inside Forward', focuses: ['Balanced', 'Attack'] },
  ],
  W: [
    { role: 'Winger', focuses: ['Balanced', 'Attack', 'Versatile'] },
    { role: 'Inside Forward', focuses: ['Balanced', 'Attack', 'Roaming'] },
    { role: 'Wide Playmaker', focuses: ['Attack'] },
  ],
  // Guides list no separate centre-forward roles; CF gets the striker roles plus Shadow Striker.
  CF: [
    { role: 'False 9', focuses: ['Build-Up', 'Attack'] },
    { role: 'Shadow Striker', focuses: ['Attack'] },
    { role: 'Advanced Forward', focuses: ['Attack', 'Versatile'] },
    { role: 'Target Forward', focuses: ['Balanced', 'Attack', 'Wide'] },
    { role: 'Poacher', focuses: ['Attack', 'Versatile'] },
  ],
  ST: [
    { role: 'Advanced Forward', focuses: ['Attack', 'Versatile'] },
    { role: 'Target Forward', focuses: ['Balanced', 'Attack', 'Wide'] },
    { role: 'Poacher', focuses: ['Attack', 'Versatile'] },
    { role: 'False 9', focuses: ['Build-Up', 'Attack'] },
  ],
};

/** Every in-game outfield and goalkeeper attribute, for the optional stat fields on a player. */
export const ALL_STATS = [
  'Acceleration',
  'Sprint Speed',
  'Att. Position',
  'Finishing',
  'Shot Power',
  'Long Shots',
  'Volleys',
  'Penalties',
  'Vision',
  'Crossing',
  'FK Accuracy',
  'Short Passing',
  'Long Passing',
  'Curve',
  'Dribbling',
  'Agility',
  'Balance',
  'Reactions',
  'Ball Control',
  'Composure',
  'Interceptions',
  'Heading Accuracy',
  'Def. Awareness',
  'Standing Tackle',
  'Sliding Tackle',
  'Jumping',
  'Stamina',
  'Strength',
  'Aggression',
  'GK Diving',
  'GK Handling',
  'GK Kicking',
  'GK Positioning',
  'GK Reflexes',
];
