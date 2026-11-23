# Mapa dos dados do frontend

As telas acionam o service. O service chama o contrato do repositório e alimenta a store. Os dados fictícios, as implementações mock e os arquivos de demonstração ficam em `src/app/mocks/`. A configuração da aplicação registra os provedores desse diretório. O catálogo de formatos Pimaco permanece no módulo de etiquetas porque contém medidas oficiais. [Regra do projeto](../AGENTS.md#arquitetura-para-novas-implementações)

| Fluxo | Service e estado | Fonte |
| --- | --- | --- |
| Home | `HomeMessageService` e `HomeMessageStore` | `HomeMessageRepository` escolhe a frase a partir do catálogo de exemplo. |
| Cabeçalho, perfil, equipe, notificações e menções | `TeamCollaborationService` e `TeamStore`. `TextReferencesService` fornece referências por uma store de leitura. | `TeamRepository` fornece o perfil e a equipe. O repositório de munícipes resolve referências para registros. |
| Busca global, seleção do solicitante e vínculo de ciência | `CitizenSearchComponent` usa um único `CitizenSearchService`, com uma `CitizenSearchStore` para o cabeçalho e outras independentes para os seletores. | `CitizenSearchRepository` fornece os resultados. |
| Munícipes | `CitizenListService` e `CitizenListStore`. `CitizenDetailService` fornece stores de leitura para ficha, linha do tempo e categorias. | `CitizenDetailRepository.loadCitizenList(query)` devolve os resultados já buscados, filtrados e ordenados pelo mock, com total e catálogos; a consulta é assíncrona e a store mantém critérios, resposta, carregamento, erro e seleção. Ficha, interações, categorias e operações de edição usam o mesmo repositório. |
| Listagem de solicitações | `RequestListService` e `RequestListStore` | `CitizenDetailRepository.loadRequestList` consulta a mesma coleção usada na ficha, no detalhe e no Kanban. O mock busca no texto de todos os comentários, filtra e ordena antes de devolver os resultados e o total. A resposta da listagem não inclui comentários. |
| Padrões de solicitação | `RequestPatternManagementService` e `RequestPatternManagementStore` | `CitizenDetailRepository` oferece consulta, salvamento e exclusão assíncronos. Busca, ordenação, validações e proteção dos vínculos ficam no mock; a mesma coleção alimenta o formulário e o detalhe da solicitação. Ver [padrões](padroes-solicitacao.md). |
| Solicitações, interações, conversas e agenda | `RequestDetailService` e `ActivityDetailService` fornecem stores de leitura para os detalhes. O service de solicitações fornece o catálogo e processa as edições. | `CitizenDetailRepository` fornece detalhes, catálogos e operações. |
| Kanban | `KanbanService` e `KanbanStore`. Comentários, anexos e histórico consomem projeções do cartão. | `CitizenDetailRepository` fornece o quadro, o histórico e as operações dos cartões. |
| Etiquetas das tarefas | `TaskLabelManagementService` e `TaskLabelManagementStore`; os seletores recebem catálogo pelo service de cada tela. | `CitizenDetailRepository` fornece consulta e CRUD assíncronos. O mock mantém a coleção única, valida IDs nas tarefas e protege exclusão em uso. `KanbanWorkspace.labels` e `listTaskLabels()` atendem às projeções legadas. Ver [etiquetas das tarefas](etiquetas-tarefas.md). |
| Relatório de horas | `WorkHours` lê o quadro e alimenta a projeção do relatório. `WorkHoursStore` guarda os filtros. | `CitizenDetailRepository` fornece o mesmo histórico usado pelo Kanban. |
| Etiquetas | `LabelPrintService` fornece stores de leitura para destinatários e configuração. Rascunho e opções de impressão ficam no editor. | `CitizenDetailRepository` fornece destinatários. `LabelPrintRepository` fornece formatos, modelos e valores iniciais do editor. |
| Caixa de entrada da prévia | `InboxService` e `InboxStore` | `InboxRepository` fornece a fila, o perfil e a equipe da caixa de entrada. |

## Integração futura

A consulta de munícipes e a gestão de padrões de solicitação e etiquetas de tarefas passaram a usar contratos assíncronos em 19/11/2026; os demais contratos legados ainda mantêm leituras síncronas no mock em memória. As stores de leitura recebem projeções reativas dos services, o que preserva atualizações entre telas quando o repositório muda. A adaptação a uma API assíncrona deve acontecer no service e no repositório, com carregamento, erros e atualização da store de acordo com o contrato da API.

Rotas, rótulos, tipos de interação e estado visual local continuam no frontend. Registros de exemplo, catálogos do domínio, participantes, autoria e valores iniciais de negócio vêm da camada de dados.

## Origem dos registros relacionados

As solicitações usam o [catálogo de secretarias e departamentos de São José dos Campos](catalogo-departamentos-sjc.md). Ao filtrar por uma unidade, o repositório inclui suas subordinadas.

- **Solicitação:** a listagem e o “+” da linha do tempo da ficha abrem `/solicitacoes/nova`. O detalhe abre `/solicitacoes/:id/editar`. O `RequestEditorService` lê os dados e catálogos do `CitizenDetailRepository` e envia a gravação ao mesmo repositório. O cadastro aceita um munícipe opcional. Na edição, o vínculo original é preservado e as mudanças aparecem na linha do tempo. A ficha, a listagem, o detalhe e as referências do Kanban consultam a mesma coleção.
- **Interação e conversa:** uma conversa registrada no cadastro rápido é uma interação com dados de conversa. Os atalhos de conversa, o detalhe e as referências leem o mesmo registro. Um contato vinculado a uma solicitação usa o ID da solicitação existente. O formulário de contatos no detalhe de uma solicitação oferece os tipos de contato daquele contexto.
- **Agenda:** o atalho da ficha, as referências e o detalhe de agendamento leem os agendamentos do mesmo repositório de munícipes.
- **Caixa de entrada:** o protótipo da fila tem snapshots próprios de conversa, pessoa e caso em `InboxRepository`. A página da fila ainda não está conectada ao roteamento. Ao publicar essa tela, os vínculos com pessoas e solicitações devem ser resolvidos por ID pelos repositórios de origem.
