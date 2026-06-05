import fs from 'fs';
import path from 'path';

const soundsDir = path.resolve(__dirname, '../assets/sounds');
if (!fs.existsSync(soundsDir)) {
  fs.mkdirSync(soundsDir, { recursive: true });
}
const files = [
  'button_click.wav',
  'puzzle_solve.wav',
  'puzzle_fail.wav',
  'hint_reveal.wav',
  'achievement.wav',
  'level_complete.wav',
];
for (const file of files) {
  const filePath = path.join(soundsDir, file);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, 'module.exports = 1;');
  }
}

if (typeof require !== 'undefined' && require.extensions) {
  require.extensions['.mp3'] = function (module: any) {
    module.exports = 1;
  };
  require.extensions['.wav'] = function (module: any) {
    module.exports = 1;
  };
}
