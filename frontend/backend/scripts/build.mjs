import { build } from 'esbuild';
await build({
  entryPoints: ['src/index.ts'],
  outfile: 'lib/index.js',
  platform: 'node',
  target: 'node22',
  format: 'cjs',
  bundle: true,
  packages: 'external',
  sourcemap: true,
});

await build({
  entryPoints: ['src/backup-cli.ts'],
  outfile: 'lib/backup.cjs',
  platform: 'node',
  target: 'node22',
  format: 'cjs',
  bundle: true,
  packages: 'external',
});
