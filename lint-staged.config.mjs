export default {
  '*.{ts,tsx,js,jsx,mjs,cjs,json,md,yml,yaml}': 'prettier --write',
  'frontend/**/*.{ts,tsx}': () => 'pnpm --filter ./frontend exec eslint --fix',
};
