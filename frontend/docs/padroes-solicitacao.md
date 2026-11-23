# Padrões de solicitação

Gestão implementada por pedido de 19/11/2026, acessível pelo ícone de etiqueta no cabeçalho de Solicitações e pela rota lazy `/solicitacoes/padroes`.

O padrão é um cadastro de apoio com ID estável, nome e departamento sugerido. A tela permite buscar por nome/departamento, listar, cadastrar, editar e excluir com confirmação. Exibe o caminho completo do departamento e a quantidade de solicitações vinculadas. A busca ignora acentos e caixa, combina todos os termos e ordena por nome; essas regras são executadas no repositório mock, que também devolve o total e o catálogo de departamentos independentemente da busca.

## Regras implementadas

- Nome obrigatório com até 120 caracteres, normalização de espaços e unicidade no catálogo, ignorando acentos e caixa. O departamento sugerido deve existir.
- Editar mantém o ID. Renomear atualiza o catálogo e o nome apresentado nas solicitações; textos históricos já gravados são preservados.
- Alterar o departamento sugerido não modifica o departamento, tarefas ou histórico das solicitações existentes. No cadastro/edição de solicitação, a sugestão pode ser aplicada explicitamente pelo botão “Usar departamento sugerido”. O departamento também pode ser escolhido manualmente.
- Excluir exige confirmação e só é permitido quando não há nenhuma solicitação vinculada, inclusive finalizada. A tela indica o bloqueio e o repositório confere os vínculos novamente antes da exclusão. Para excluir um padrão em uso, editar as solicitações para remover ou substituir o padrão.
- IDs desconhecidos são rejeitados. Criar/editar solicitações valida o padrão contra o catálogo atual, e atribuir um padrão usa a mesma fonte. Excluir um departamento continua bloqueado se houver um padrão que o use.
- Salvar sem alterações preserva o registro. Cadastrar um padrão continua sendo um gatilho disponível para automações futuras; não há motor de automação ou geração de tarefas implementados.

## Fluxo de dados

`RequestPatternManagementComponent` → `RequestPatternManagementService` → `CitizenDetailRepository` → `MockCitizenDetailRepository`.

- `loadRequestPatternManagement(query)` retorna `Promise<RequestPatternManagementResult>` com `items`, `total` e `departments`.
- `saveRequestPattern(id, draft)` cria ou altera o cadastro e retorna `Promise<RequestPattern>`.
- `deleteRequestPattern(id)` valida os vínculos e retorna `Promise<void>`.
- O serviço coordena carregamento, falhas, gravação e atualização da `RequestPatternManagementStore`; respostas de buscas antigas são descartadas. A store guarda a busca e a resposta, sem refiltrar dados ou chamar repositórios.
- A leitura legada `listRequestPatterns()` permanece síncrona e reativa para os consumidores existentes. Ela lê a mesma coleção mutável usada pela gestão, inicializada de `src/app/mocks/data/request-extras.mock.ts`, sem acervo paralelo no componente, serviço ou store.

Os diálogos usam Signal Forms, validação de campos, foco inicial/restauração, fechamento por Escape e bloqueio de reenvio durante gravação. A operação iniciada termina antes de permitir fechar o diálogo. As alterações ficam em memória ao navegar e são reiniciadas no recarregamento; essa limitação fica na documentação técnica, sem avisos repetidos nos formulários.

Sem backend, autenticação, integração ou nova biblioteca. Não foram executados testes, build ou inspeção de navegador, conforme preferência do usuário.
