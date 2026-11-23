# Etiquetas das tarefas

Implementação solicitada em 19/11/2026. Uma tarefa pode ter nenhuma, uma ou várias etiquetas. Este catálogo é próprio das tarefas; a rota de impressão de etiquetas de munícipes continua independente.

## Uso

- O ícone de etiqueta no cabeçalho do Kanban abre `/kanban/etiquetas`, com busca, listagem, criação, edição e exclusão confirmada.
- Cada etiqueta tem nome e uma cor escolhida pelo seletor nativo, com prévia. A listagem informa quantas tarefas a utilizam.
- O editor do cartão e o cadastro de tarefa na solicitação reutilizam `TaskLabelPickerComponent`. O seletor compacto “Adicionar etiqueta” abre a lista com busca por nome e rolagem própria. Cada etiqueta marcada aparece em um pill colorido abaixo do seletor, na ordem da seleção, e pode ser removida pelo ×. As caixas refletem o mesmo rascunho da tarefa, inclusive ao trocar a busca.
- Os cartões das duas visualizações do Kanban e as tarefas da solicitação apresentam as mesmas etiquetas. Nomes e cores alterados no catálogo se refletem nesses locais sem editar os vínculos individuais.
- A cor aparece na própria etiqueta. O nome permanece visível, inclusive com quebra de texto; várias cores podem aparecer juntas no cartão, sem alterar os indicadores de status, prioridade ou prazo vencido. `TaskLabelChipComponent` calcula preto ou branco pela maior razão de contraste WCAG. Para qualquer cor sRGB opaca válida, essa escolha alcança o mínimo AA para texto normal.

## Dados e regras do mock

`Task.labelIds`, `TaskDraft.labelIds` e `NewRequestTask.labelIds` são listas de IDs. O mock valida a existência das etiquetas, elimina IDs repetidos e aceita uma lista vazia. As tarefas relacionadas continuam na coleção original de `requestExtras`; as independentes usam sua coleção existente. Mover, ordenar, concluir e reabrir tarefas preserva suas etiquetas.

O nome é obrigatório, limitado a 60 caracteres e único sem distinguir acentos ou caixa. Espaços duplicados são normalizados. A cor é hexadecimal opaca no formato `#rrggbb`. IDs desconhecidos, cores inválidas e nomes duplicados são rejeitados no repositório. Validação do formulário complementa essas regras no frontend.

A exclusão é bloqueada se qualquer tarefa ainda usar a etiqueta, inclusive concluída. Para excluir, remover o vínculo nos cartões e confirmar a exclusão na gestão. A tela informa o bloqueio, e o repositório confere novamente antes de excluir. Excluir uma etiqueta sem vínculos não altera tarefas nem textos históricos.

Alterar os vínculos de uma tarefa registra antes/depois dos nomes em `TaskHistoryEvent`, com autoria e data. Trocar apenas a ordem dos IDs ou salvar sem alteração não cria evento. Renomear ou mudar a cor no catálogo não gera alterações artificiais em cada tarefa nem muda seu status, responsáveis, coluna, prazo ou histórico de horas. Os nomes já gravados no histórico são preservados como texto.

## Arquitetura

`TaskLabelManagementComponent` → `TaskLabelManagementService` → `CitizenDetailRepository` → `MockCitizenDetailRepository`.

- `loadTaskLabelManagement(query): Promise<TaskLabelManagementResult>` executa busca por nome sem acentos, combinação de termos, ordenação e contagem de tarefas no mock. Retorna os resultados, total de etiquetas e cor inicial do formulário.
- `saveTaskLabel(id, draft): Promise<TaskLabel>` cria ou altera o cadastro, preservando o ID na edição.
- `deleteTaskLabel(id): Promise<void>` valida os vínculos e exclui.
- O serviço coordena carregamento, erro, gravação e descarte de respostas antigas. `TaskLabelManagementStore` mantém a busca e a resposta, sem filtrar dados nem chamar repositórios.
- `listTaskLabels()` e `KanbanWorkspace.labels` alimentam as projeções síncronas legadas de Kanban e solicitação pela mesma coleção. Esses fluxos não têm um catálogo paralelo.
- Exemplos e cor inicial ficam em `src/app/mocks/data/task-labels.mock.ts`. Componentes, services e stores não importam fixtures ou definem etiquetas de negócio. A seleção de provedores existente continua em `app.config.ts`.

Os dados ficam na memória da sessão. O catálogo sobrevive à navegação e é reinicializado ao recarregar a aplicação. Essa limitação não é repetida nos formulários.

Criar uma etiqueta permanece um gatilho disponível para automações futuras, sem executar automações ou criar tarefas. Nenhum backend, integração, biblioteca ou autenticação foi implementado. Não foram executados testes, build manual ou inspeção de navegador; o servidor de desenvolvimento existente pode recompilar automaticamente.
