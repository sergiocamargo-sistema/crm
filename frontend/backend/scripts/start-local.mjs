import { build } from 'esbuild';
import { spawn } from 'node:child_process';
await build({
  entryPoints: ['src/local.ts'],
  outfile: 'lib/local.cjs',
  platform: 'node',
  target: 'node22',
  format: 'cjs',
  bundle: true,
  packages: 'external',
});
const child = spawn(process.execPath, ['lib/local.cjs'], { stdio: 'inherit' });
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
child.on('exit', (code) => {
  process.exitCode = code ?? 1;
});
