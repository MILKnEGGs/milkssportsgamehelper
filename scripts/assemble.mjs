// Each app builds itself into dist/<app>/. This adds the landing page that links to them,
// and the "See what it does" pages for each game (site/pitch/).
import { copyFileSync, cpSync, mkdirSync } from 'node:fs';

mkdirSync('dist', { recursive: true });
copyFileSync('site/index.html', 'dist/index.html');
copyFileSync('site/.nojekyll', 'dist/.nojekyll');
copyFileSync('site/icon.svg', 'dist/icon.svg');
cpSync('site/pitch', 'dist/pitch', { recursive: true });
console.log('Assembled dist/');
