import { copyFile, stat, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const output = resolve('dist/gabinete-web/browser');

// O Pages serve 404.html para rotas sem um arquivo físico. O Angular lê a URL
// original e abre a tela correspondente, inclusive com query string e fragmento.
await stat(resolve(output, 'index.html'));
await copyFile(resolve(output, 'index.html'), resolve(output, '404.html'));
await writeFile(resolve(output, '.nojekyll'), '');

console.log(`Artefato do GitHub Pages preparado em ${output}`);
