import { copyFile, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const output = resolve('dist/gabinete-web/browser');

const index = await readFile(resolve(output, 'index.html'), 'utf8');
if (
  !/<app-root(?:\s|>)/u.test(index) ||
  !/<base\s+href=["']\/crm\/["']\s*\/?\s*>/u.test(index)
) {
  throw new Error('Publicação interrompida: o artefato deve ser o frontend Angular com base /crm/.');
}

// O Pages serve 404.html para rotas sem um arquivo físico. O Angular lê a URL
// original e abre a tela correspondente, inclusive com query string e fragmento.
await copyFile(resolve(output, 'index.html'), resolve(output, '404.html'));
await writeFile(resolve(output, '.nojekyll'), '');

console.log(`Artefato do GitHub Pages preparado em ${output}`);
