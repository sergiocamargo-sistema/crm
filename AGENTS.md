# Gabinete CRM

Leia `/home/vini/.agents/INSTRUCTIONS.md` e siga as instruções relevantes. Antes de alterar o frontend, leia também `frontend/AGENTS.md`.

## Estado atual — 17/11/2026

- Planejamento v0.16: home em Angular 22 com oito acessos quadrados e busca compartilhada de munícipes, na pasta `frontend/`, com dados fictícios.
- Pedido atual: alterar somente a home. Dois botões por linha no celular; ordem confirmada: Munícipes, Kanban, Solicitações, Conversas, Projetos de lei, Leis, Configurações, Relatórios. Cabeçalho com busca de munícipes em todas as futuras telas. Não implementar os módulos ou backend sem novo pedido.
- Caixa de conversas preservada em `frontend/src/app/features/inbox` e em `docs/prototipos/caixa-de-conversas-v0.15.tar.gz`; retomar na quarta etapa. Decisões atuais em `.agents/roadmap-frontend.md`.
- `index.html` na raiz é o documento de planejamento, não a aplicação Angular.
- Contrato de API continua em `docs/api/`, draft.3, elaborado na v0.14. As 88 operações são propostas; a home não chama nenhuma API.
- A direção da API é por telas/ações e agregados completos, sem CRUD por tabela. Consulte `docs/api/README.md` e `docs/api/cenarios.md` ao implementar integração futura.
- Instruções de execução, arquitetura mock e MCP: `frontend/README.md`.
- Design system 1.0 aplicado em 17/11/2026: azul/amarelo extraídos e adaptados dos quatro prints, marca Sérgio Camargo fiel à composição original e guia em `docs/design-system/README.md`. Correção explícita: não inventar monograma; manter VEREADOR acima do nome e a bandeira na letra o. Novas telas devem reutilizar `frontend/public/design-system/tokens.css` e `components.css`.
- MCP instalado aqui é o servidor de ferramentas de desenvolvimento do Angular CLI. Não é o futuro MCP de negócio do CRM.
- Preservar as configurações globais do usuário. A pedido explícito de instalar MCP, o CLI registrou somente o servidor `angular-cli` no Codex desta máquina, com `--root` apontando ao frontend. As configurações reproduzíveis do projeto estão em `.codex/config.toml` e `frontend/.vscode/mcp.json`. Não remover ou alterar outros servidores.
