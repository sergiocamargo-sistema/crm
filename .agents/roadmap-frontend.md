# Frontend — decisões de 17/11/2026

Decisão explícita do usuário: a home é um menu simples com botões quadrados, ícone e nome do módulo. No celular, dois botões por linha; no desktop, quatro. A caixa de conversas deixa de ser a home e fica preservada para retomada posterior.

## Ordem confirmada de implementação

1. Munícipes
2. Kanban
3. Solicitações
4. Conversas
5. Projetos de lei
6. Leis
7. Configurações
8. Relatórios

Esta é a ordem das próximas etapas do frontend. Os módulos continuam para implementação posterior. O próximo módulo será Munícipes, quando o usuário pedir a próxima etapa. Durante a edição local da home, o usuário colocou Relatórios antes de Configurações; essa ordem de exibição foi preservada na revisão visual.

## Busca permanente

O cabeçalho contém busca de munícipes no lugar do breadcrumb “Espaço de trabalho > Atendimento”. Cabeçalho e busca ficam no componente raiz, fora do router-outlet, para serem compartilhados pelas futuras telas. No celular, a busca continua visível, inclusive ao rolar a home.

Atualização do usuário em 17/11/2026: até 600 px, mostrar a lupa e expandir o campo pela largura do cabeçalho ao tocar, com animação e foco imediato para digitar. Fechar pela seta, Escape ou toque externo; preservar consulta e selecionar o texto ao reabrir. Campo e resultados devem respeitar as margens do cabeçalho nos dois lados. Evitar `100vw`, que inclui espaço de scrollbar. Desktop mantém o campo aberto. Movimento reduzido é respeitado.

A busca atual usa dados fictícios por nome/telefone e mostra resumo em modal, sem implementar a página de munícipes e sem chamadas HTTP. A integração real seguirá a API por ações/telas já documentada, sem CRUD por tabela.

## Conversas preservadas

- Fonte mantida em `frontend/src/app/features/inbox/`, com seus modelos, dados e repositórios de mock originais.
- Cópia completa anterior à alteração em `docs/prototipos/caixa-de-conversas-v0.15.tar.gz`, acompanhada de manifesto SHA-256.
- Código da antiga home, cabeçalho, estilos, imagens e testes estão na cópia. Não há node_modules ou credenciais.
- Cenários de navegador antigos também estão em `frontend/tests/archives/conversations-v0.15.ts`, fora da descoberta da suíte atual.
- Retomar na quarta etapa, adaptando a página antiga ao layout global: remover seu cabeçalho duplicado e adaptar o atalho antigo de busca de conversas. Não restaurar automaticamente a caixa como home.

O MCP oficial do Angular e as instruções oficiais continuam obrigatórios em cada nova tarefa, conforme `/home/vini/.agents/INSTRUCTIONS.md`.

## Identidade visual — design system 1.0

Pedido de 17/11/2026: usar os quatro prints mais recentes, criar o design system e redesenhar/aplicar o logo. Referências das 16:09:34, 16:09:43, 16:10:06 e 16:10:28, preservadas em `docs/design-system/referencias/`.

Identidade: Vereador Sérgio Camargo; azul #064EA0, amarelo #F5DF31, azul noturno e superfícies claras. SVGs em `frontend/public/brand/`, tokens e componentes em `frontend/public/design-system/`. Guia completo em `docs/design-system/README.md` e demonstração em `/design-system/index.html`. Usar essa base nas próximas telas.

Correção explícita do usuário: a primeira proposta de logo inventou um monograma C e foi rejeitada. A marca deve seguir os prints, com VEREADOR centralizado acima de SérgioCamargo e a bandeira integrada ao o. Os SVGs foram substituídos por curvas da reconstrução; o favicon vem da própria letra o. Não recriar outro símbolo ou trocar o lettering pela fonte da interface. Processo em `docs/design-system/marca/README.md`.

A home anterior à identidade está em `docs/prototipos/home-v0.16.tar.gz`. A revisão preserva os oito acessos, os dados fictícios e a busca compartilhada; não antecipa implementação dos módulos.
