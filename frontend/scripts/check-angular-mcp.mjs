import { Client } from '@modelcontextprotocol/client';
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const workspace = fileURLToPath(new URL('../', import.meta.url));
const client = new Client(
  { name: 'gabinete-workspace-check', version: '0.1.0' },
  {
    versionNegotiation: { mode: { pin: '2026-07-28' }, probe: { timeoutMs: 10000 } },
    capabilities: { roots: { listChanged: false } },
  },
);
client.setRequestHandler('roots/list', async () => ({
  roots: [{ uri: pathToFileURL(workspace).href, name: 'Gabinete frontend' }],
}));
const transport = new StdioClientTransport({
  command: process.execPath,
  args: [
    path.join(workspace, 'node_modules/@angular/cli/bin/ng.js'),
    'mcp',
    '--read-only',
    '--local-only',
  ],
  cwd: workspace,
  env: { ...process.env, NG_CLI_ANALYTICS: 'false', NG_FORCE_TTY: 'false' },
  stderr: 'pipe',
});
transport.stderr?.on('data', (data) => process.stderr.write(data));
client.onerror = (error) => console.error('MCP:', error.message);
try {
  await client.connect(transport);
  const tools = await client.listTools();
  const projects = await client.callTool({ name: 'list_projects', arguments: {} });
  const practices = await client.callTool({
    name: 'get_best_practices',
    arguments: { workspacePath: path.join(workspace, 'angular.json') },
  });
  if (projects.isError || practices.isError)
    throw new Error(JSON.stringify({ projects, practices }));
  const guide = practices.content
    .filter((item) => item.type === 'text')
    .map((item) => item.text)
    .join('\n');
  const discovery = client.getDiscoverResult();
  await mkdir(path.join(workspace, '.angular'), { recursive: true });
  await writeFile(path.join(workspace, '.angular/angular-best-practices.md'), guide);
  const result = {
    era: discovery ? 'modern' : 'legacy',
    server: client.getServerVersion(),
    tools: tools.tools.map((tool) => tool.name),
    projects,
    guide: '.angular/angular-best-practices.md',
  };
  await writeFile(path.join(workspace, '.angular/mcp-check.json'), JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
} finally {
  await client.close();
}
