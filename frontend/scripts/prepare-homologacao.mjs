import { execFileSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const branch =
  process.env.GITHUB_REF ??
  execFileSync('git', ['branch', '--show-current'], { encoding: 'utf8' }).trim();
if (!['homologacao', 'refs/heads/homologacao'].includes(branch)) {
  throw new Error('O deploy de homologação exige a branch homologacao.');
}
if (!process.argv.includes('--guard')) {
  const directory = resolve('dist/gabinete-web/browser');
  const index = await readFile(resolve(directory, 'index.html'), 'utf8');
  if (!/<app-root(?:\s|>)/u.test(index) || !/<base\s+href=["']\/["']\s*\/?\s*>/u.test(index)) {
    throw new Error('O artefato de homologação deve ser o frontend Angular com base /.');
  }
  await writeFile(
    resolve(directory, 'deployment.json'),
    JSON.stringify(
      {
        environment: 'homologacao',
        branch: 'homologacao',
        commit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
        builtAt: new Date().toISOString(),
      },
      null,
      2,
    ) + '\n',
  );
  console.log(`Frontend de homologação preparado em ${directory}`);
}
