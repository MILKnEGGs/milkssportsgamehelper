// PlayStyles as listed in EA's FC 27 "What are PlayStyles" article (Sept 2026). Each has a PlayStyle+
// (stronger) version. Descriptions are short paraphrases of EA's text.

export type PlayStyleGroup = 'Finishing' | 'Passing' | 'Ball Control' | 'Defending' | 'Physical' | 'Goalkeeper';

export interface PlayStyle {
  name: string;
  group: PlayStyleGroup;
  effect: string;
}

const g = (group: PlayStyleGroup, list: [string, string][]): PlayStyle[] =>
  list.map(([name, effect]) => ({ name, group, effect }));

export const PLAYSTYLES: PlayStyle[] = [
  ...g('Finishing', [
    ['Acrobatic', 'More accurate volleys and acrobatic volley animations.'],
    ['Chip Shot', 'Faster, more accurate chip shots.'],
    ['Dead Ball', 'Set pieces with more speed, curve and accuracy, plus a longer aim line.'],
    ['Finesse Shot', 'Finesse shots are faster, curl more and are more accurate.'],
    ['Gamechanger', 'Fancy and Trivela shots are more accurate.'],
    ['Low Driven Shot', 'Low driven shots are more accurate, faster and quicker to hit.'],
    ['Precision Header', 'Headers with more accuracy and power.'],
  ]),
  ...g('Passing', [
    ['Incisive Pass', 'More accurate through balls, more swerve, faster precision passes.'],
    ['Inventive', 'Fancy and Trivela passes are more accurate.'],
    ['Long Ball Pass', 'Lobbed and lofted through balls are more accurate, faster and harder to intercept.'],
    ['Pinged Pass', 'Faster ground passes without making them harder to control.'],
    ['Tiki Taka', 'Accurate first-time and short ground passes.'],
    ['Whipped Pass', 'Crosses are more accurate, faster and curl more.'],
  ]),
  ...g('Ball Control', [
    ['First Touch', 'Cleaner traps and a quicker move into dribbling.'],
    ['Press Proven', 'Close control at jog speed and better shielding against stronger players.'],
    ['Rapid', 'Faster sprinting with the ball and fewer errors when knocking it on.'],
    ['Technical', 'Faster controlled sprint and tighter wide turns.'],
    ['Trickster', 'Unlocks unique flick skill moves.'],
  ]),
  ...g('Defending', [
    ['Aerial Fortress', 'Jumps higher and wins more defensive headers.'],
    ['Anticipate', 'Better standing tackles that keep the ball at their feet.'],
    ['Block', 'More reach and success when blocking.'],
    ['Intercept', 'More reach on interceptions and keeps the ball more often.'],
    ['Jockey', 'Faster sprint jockey and switch from jockey to sprint.'],
    ['Slide Tackle', 'Slide tackles that keep the ball at their feet.'],
  ]),
  ...g('Physical', [
    ['Bruiser', 'Stronger physical tackles.'],
    ['Enforcer', 'Better shoulder challenges and shielding while dribbling.'],
    ['Long Throw', 'Longer, more powerful throw-ins.'],
    ['Quick Step', 'Faster acceleration on explosive sprints.'],
    ['Relentless', 'Tires slower and recovers more at half-time.'],
  ]),
  ...g('Goalkeeper', [
    ['1v1 Close Down', 'Rushes off the line better and reads close shots.'],
    ['Cross Claimer', 'Comes for high balls, punches harder and distributes faster.'],
    ['Deflector', 'Parries into safer areas with more power.'],
    ['Far Reach', 'Better at saving long shots with long dives.'],
    ['Far Throw', 'Longer goalkeeper throws.'],
    ['Footwork', 'Better foot saves against low shots.'],
  ]),
];

export const PLAYSTYLE_GROUPS: PlayStyleGroup[] = ['Finishing', 'Passing', 'Ball Control', 'Defending', 'Physical', 'Goalkeeper'];

export const playStyle = (name: string) => PLAYSTYLES.find((p) => p.name === name);
