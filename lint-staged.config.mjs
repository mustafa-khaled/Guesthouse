import { existsSync } from 'node:fs';
import path from 'node:path';

const webEslint = path.resolve('apps/web/node_modules/.bin/eslint');

function chunk(files, size) {
  const commands = [];
  for (let i = 0; i < files.length; i += size) {
    commands.push(files.slice(i, i + size));
  }
  return commands;
}

export default {
  '*.{ts,tsx,js,jsx,mjs,cjs,json,md,yml,yaml}': (files) =>
    chunk(files, 40).map(
      (group) => `prettier --write ${group.map((file) => JSON.stringify(file)).join(' ')}`,
    ),
  'apps/web/**/*.{ts,tsx}': (files) => {
    if (!existsSync(webEslint)) {
      return [];
    }

    return chunk(files, 40).map(
      (group) =>
        `pnpm --filter guesthouse-frontend exec eslint --fix ${group.map((file) => JSON.stringify(file)).join(' ')}`,
    );
  },
};
