# Manutenção do design system

Leia `README.md` desta pasta antes de alterar os controles. O padrão vigente de botões com ícone é a versão 1.1.

- `tokens.css` é a única fonte dos tokens; `components.css` é a única implementação visual dos controles.
- Para separar elementos irmãos, preferir `gap` no contêiner flex/grid em vez de margens nos filhos. Usar tokens existentes; `.layout-stack` é a base vertical com 12 px. Margens de centralização e ajustes pontuais continuam permitidas.
- Para o mesmo papel, manter o mesmo tamanho, raio, ícone, fundo e estados em `button`, `a` e `summary`, no desktop e no celular.
- Não acrescentar variantes por preferência estética. Uma necessidade nova deve ter função distinta, documentação e exemplo em `index.html`.
- Alterações na base devem atualizar o guia que importa esta mesma base; não simular o novo estilo só em `guide.css`.
- Não substituir o foco por sombra clara nem alterar a marca nesta tarefa.
- Não executar testes ou builds sem solicitação do usuário. Esta regra é herdada do `AGENTS.md` do frontend.
