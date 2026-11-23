# Gabinete CRM

Publicação automática: [guia do GitHub Pages](frontend/docs/deploy-github-pages.md).

Nome provisório do projeto. Planejamento **v0.16**, atualizado em **17/11/2026**, no fuso America/Sao_Paulo.

Esta pasta reúne o planejamento de um CRM próprio para cadastro de munícipes, atendimentos e serviços realizados pelo gabinete. Como a maioria dos atendimentos chega pelo WhatsApp, a caixa de conversas integrada passa a ser o principal espaço de trabalho da equipe. A home em Angular 22 está em `frontend/`, com oito acessos quadrados e busca global de munícipes. O protótipo de conversas foi preservado para a quarta etapa. Os dados continuam fictícios. O backend e as integrações reais ainda não foram implementados.

## Como consultar

A [home em Angular 22](frontend/README.md) pode ser visualizada em **http://127.0.0.1:4300**, com o servidor local aberto por `npm start` na pasta `frontend`. É uma prévia da home de módulos, com busca de munícipes fictícios e dois botões por linha no celular.

O [design system 1.0](docs/design-system/README.md) reúne a marca Sérgio Camargo reconstruída conforme os prints, a identidade azul/amarela dos quatro prints e os estilos compartilhados da aplicação. [Abrir o guia visual local](http://127.0.0.1:4300/design-system/index.html).

Abra [`index.html`](index.html) diretamente no navegador. O documento é local e não exige instalação, servidor, conta ou conexão com serviços externos para leitura. Os links de referência exigem internet.

## Arquivos

| Arquivo | Conteúdo |
| --- | --- |
| [`frontend/README.md`](frontend/README.md) | Executar a home em Angular 22, dados mockados e configuração MCP. |
| [`docs/design-system/README.md`](docs/design-system/README.md) | Marca, referências, tokens, tipografia, componentes, contraste e regras para novas telas. |
| [`index.html`](index.html) | Apresentação navegável de todo o planejamento. |
| [`docs/planejamento.md`](docs/planejamento.md) | Registro em Markdown das decisões, propostas, pendências e fontes. |
| [`docs/api/index.html`](docs/api/index.html) | Referência navegável e offline da API, por tela e ação, com busca por rota, método e módulo. |
| [`docs/api/openapi.yaml`](docs/api/openapi.yaml) | Contrato OpenAPI 3.1.1, com schemas de entrada/saída e exemplos; JSON equivalente ao lado. |
| [`docs/api/README.md`](docs/api/README.md) | Convenções, autenticação, métodos, filtros, erros, concorrência e idempotência. |
| [`docs/api/fluxos.md`](docs/api/fluxos.md) | Sequências de integração e requisições ilustrativas; exemplos.http contém chamadas para cliente HTTP. |
| [`docs/api/cenarios.md`](docs/api/cenarios.md) | 26 cenários completos e orçamento das chamadas por ação. |
| [`docs/api/integracoes.md`](docs/api/integracoes.md) | Saúde e webhook em contrato técnico separado. |
| [`docs/api/validacao.md`](docs/api/validacao.md) | Verificações documentais efetivamente realizadas, sem alegar testes de um backend. |

## Direção do projeto

- Desenvolver nosso próprio CRM, com escopo enxuto; usar o EspoCRM como referência funcional.
- Documentar a API conforme telas e ações: um Salvar recebe o agregado completo; o backend resolve filhos e vínculos, sem CRUD antecipado por tabela.
- Usar ferramentas sem mensalidade, mantendo o custo de VPS e domínio.
- Identificar munícipes por ID interno, com documentos opcionais e contatos compartilháveis.
- Priorizar recuperação de falhas conhecidas e administração pela equipe.
- Incluir a recepção de mensagens do WhatsApp, a triagem por IA e a resposta pelos atendentes no núcleo da primeira versão.
- Relacionar mensagens a uma solicitação existente ou criar uma nova quando o contexto estiver claro; encaminhar dúvidas para revisão humana.
- Permitir que a equipe assuma e responda às conversas no CRM. A proposta inicial mantém o munícipe no WhatsApp, recebendo a resposta pelo mesmo canal.
- Receber autocadastros por link público, como listas de presença de eventos, sem busca ou exposição de pessoas da base interna.
- Conferir os cadastros temporários em tela interna, criando novos munícipes ou incorporando campos escolhidos aos existentes, com origem e participação preservadas.
- Mostrar fotos opcionais do munícipe em carrossel no cabeçalho da ficha, para reconhecimento pela equipe, com controles para ocultar e mostrar.
- Permitir várias fotos, documentos e outros anexos por atendimento, vinculados ao protocolo e consultáveis no histórico, com controle de acesso.
- Manter histórico das atividades com data/hora e responsável, valores anteriores/posteriores e reversão auditada, com permissões, resolução de conflitos e tratamento dos efeitos externos.
- Gerenciar a conexão do WhatsApp em tela própria, avisar pelo Chrome em caso de queda e permitir reconexão pela equipe autorizada.
- Imprimir etiquetas com modelo inicial de nome/endereço, edição de campos e novos templates, escolhendo um formato Pimaco ou medidas personalizadas.
- Consultar relatório de munícipes com filtros combináveis, sexo, nascimento e classificações cadastráveis; usar dia, mês, ano e intervalos em todas as pesquisas por datas.
- Registrar observações extensas e buscar pelos campos da pessoa e pelos atendimentos vinculados, respeitando permissões e mostrando a origem da correspondência.
- Receber áudio para transcrever, revisar e acrescentar às observações do munícipe, com histórico e sem sobrescrever o conteúdo existente automaticamente.

As tecnologias e etapas apresentadas são propostas de implementação. Metas de desempenho, volume, regras de acesso, distribuição das conversas, critérios da triagem e conector do WhatsApp ainda precisam de definição. Conversa do canal e solicitação com protocolo são registros distintos.

O HTML documenta o produto planejado; não constitui uma aplicação de atendimento em produção.

A v0.3 acrescenta o fluxo de cadastro público e conferência. Sua prioridade de entrega, campos mínimos e permissões ainda precisam de definição. O formulário público é separado do futuro portal de consulta por protocolo.

A v0.4 acrescenta o carrossel de fotos no cabeçalho da ficha. O desenho propõe foto principal, navegação manual e preferência de mostrar/ocultar por usuário. As funcionalidades continuam em planejamento.

A v0.5 explicita fotos, documentos e outros anexos dos atendimentos, com área própria, prévia quando suportada e download autorizado. Formatos, limites e regras de retenção/remoção permanecem a definir.

A v0.6 amplia o histórico de atividades e detalha a reversão. Desfazer gera uma nova operação auditada, preservando a original. Alterações internas, exclusões recuperáveis e fusões precisam de caminhos de reversão; efeitos externos já consumados e dados definitivamente eliminados têm limites explícitos. Permissões e prazos de recuperação ainda precisam de definição; as funcionalidades não foram implementadas.

A v0.7 detalha a tela de conexão do WhatsApp, monitoramento no servidor, alerta pelo Chrome e reconexão, junto da entrega da caixa WhatsApp. Notificações dependem de permissão do navegador; Web Push é a proposta para avisar com a aba fechada. O procedimento de autenticação depende do conector escolhido. O HTML apenas documenta esse fluxo e não conecta o WhatsApp nem solicita notificações.

A v0.8 acrescenta a tela de etiquetas, templates editáveis e formatos Pimaco/personalizados, com prévia e proposta de PDF para impressão. Catálogo inicial, permissões, limites e calibração ainda precisam de definição. O documento continua sendo planejamento; não gera etiquetas reais.

A v0.9 detalha o relatório de munícipes, catálogo de classificações, observações extensas, busca geral no cadastro/atendimentos e a regra comum de filtros por dia, mês, ano e intervalos. Opções, permissões e desempenho precisam de validação; funcionalidades ainda não implementadas.

A v0.10 inclui áudio para preencher observações: enviar/gravar, transcrever, revisar e salvar o texto. O texto salvo integra a busca. Serviço de transcrição, custo, limites e retenção ainda precisam de definição; o documento não grava nem transcreve áudio.

A v0.11 propõe indicadores de frequência/volume e tempo desde o contato, com lista Entrar em contato para retornos vencidos, primeiro contato e retomada. Tentativas sem resposta e alterações internas não renovam contato efetivo. Faixas, prazos, responsáveis e prioridade permanecem a validar; não há disparo automático implementado ou autorizado.

No histórico do planejamento, a v0.12 acrescentou o contrato documental **1.0.0-draft.1** da API, com 291 operações em 186 caminhos, schemas, exemplos e finalidade por endpoint. GET, POST, PATCH, PUT e DELETE são usados conforme cada fluxo; recursos futuros estão marcados. A documentação abre offline e o OpenAPI pode ser importado em ferramentas compatíveis. Não existe backend implantado por este trabalho. Fonte de edição e comandos de geração/validação estão no guia da API.

A v0.13 acrescenta indicações entre pessoas: zero/um indicador e vários indicados, relatório de raízes e navegação por níveis, com prevenção de ciclos. Inclui anotação manual restrita “Voto garantido”, com autor/data, sem inferência/verificação de voto ou automação de mensagens. O contrato da API passa a **1.0.0-draft.2**; funcionalidades continuam não implementadas.

A **v0.14** refaz a API conforme as ações do frontend: contrato **1.0.0-draft.3**, com **88 operações em 79 caminhos** e **26 cenários completos**. Cadastro/edição de pessoa e pedido completo usam uma gravação por confirmação; leituras devolvem a tela pronta. Upload em lote por rascunho, áudio antes do cadastro, conferência atômica e um PDF para prévia/impressão evitam sequências artificiais. Integrações técnicas têm contrato separado; recursos futuros ficam sem rotas antecipadas. A modelagem fragmentada das drafts anteriores foi substituída. [Abrir a documentação atual](docs/api/index.html).

A **v0.15**, em 17/11/2026, inicia o frontend com somente a home mockada, conforme pedido do usuário. Caixa de atendimento responsiva, filtros, conversa, editor de resposta/nota, contexto do munícipe, resumo do pedido e ações simuladas em memória. Angular 22, HTML separado e MCP oficial do CLI configurado/testado com as instruções oficiais de IA. Os outros módulos e a API continuam planejados; nenhuma integração real foi ativada.

A **v0.16** simplifica a home com acessos a Munícipes, Kanban, Solicitações, Conversas, Projetos de lei, Leis, Configurações e Relatórios, nessa ordem de implementação. Busca de munícipes no cabeçalho compartilhado, disponível para as futuras telas. A caixa de conversas foi [guardada com código, imagens e testes](docs/prototipos/README.md). Nesta etapa, somente a home foi alterada; os módulos continuam para próximas entregas.
