import { createGenerator } from 'ts-json-schema-generator';
import ts from 'typescript';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
const output = path.resolve('src/generated/invocation.ts');
const imports = new Map();
const methods = [];
for (const [filename, interfaceName] of [
  ['../src/app/domain/contracts/citizen-operations.ts', 'CitizenDetailOperations'],
  ['../src/app/domain/contracts/automation-operations.ts', 'AutomationOperations'],
  ['../src/app/domain/contracts/backend-api.ts', 'BackendApi'],
]) {
  const source = ts.createSourceFile(
    filename,
    await readFile(filename, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
  );
  source.forEachChild((node) => {
    if (
      ts.isImportDeclaration(node) &&
      node.importClause?.namedBindings &&
      ts.isNamedImports(node.importClause.namedBindings)
    ) {
      let relative = path
        .relative(
          path.dirname(output),
          path.resolve(path.dirname(filename), node.moduleSpecifier.text),
        )
        .replaceAll('\\', '/');
      if (!relative.startsWith('.')) relative = `./${relative}`;
      if (!imports.has(relative)) imports.set(relative, new Set());
      for (const item of node.importClause.namedBindings.elements)
        imports.get(relative).add(item.name.text);
    }
    if (ts.isInterfaceDeclaration(node) && node.name.text === interfaceName) {
      for (const method of node.members)
        if (ts.isMethodSignature(method))
          methods.push({
            name: method.name.getText(source),
            parameters: method.parameters
              .map(
                (parameter) =>
                  `${parameter.name.getText(source)}${parameter.questionToken ? '?' : ''}: ${parameter.type.getText(source)}`,
              )
              .join(', '),
          });
    }
  });
}
await mkdir(path.dirname(output), { recursive: true });
await writeFile(
  output,
  '// Gerado de BackendApi e seus contratos. Não editar manualmente.\n' +
    [...imports]
      .map(([module, names]) => `import type { ${[...names].join(', ')} } from '${module}';`)
      .join('\n') +
    '\nexport type ConcreteInvocation =\n' +
    methods
      .map(
        ({ name, parameters }) =>
          `  | { readonly operation: '${name}'; readonly requestId: string; readonly args: [${parameters}] }`,
      )
      .join('\n') +
    ';\n',
);
const schema = createGenerator({
  path: output,
  tsconfig: 'tsconfig.json',
  type: 'ConcreteInvocation',
  expose: 'all',
  skipTypeCheck: true,
  additionalProperties: false,
}).createSchema('ConcreteInvocation');
if (!schema.definitions?.ConcreteInvocation?.anyOf?.length)
  throw new Error('O contrato precisa conter a união fechada das operações.');
await writeFile('src/generated/api.schema.json', JSON.stringify(schema, null, 2) + '\n');
