# Histórico dos cards e relatório de horas

Pedido de 19/11/2026: mostrar o histórico de alterações na parte inferior do detalhe dos cards e criar um relatório diário por funcionário com tijolinhos dos cards e o tempo em Andamento. O usuário confirmou: **contar o tempo integral para cada responsável**, sem dividir.

## Uso

Acesso pela home em Relatórios, pelo ícone de gráfico no Kanban ou diretamente em `/relatorios/horas-trabalhadas`. `/relatorios` redireciona para essa página. A rota é lazy e mantém o cabeçalho global.

O relatório começa no último dia encerrado. A faixa compacta coloca anterior/data/próximo e o atalho Hoje (ícone de calendário com confirmação) à esquerda, e o funcionário à direita. Não há card externo nem rótulos visuais em outra linha; labels acessíveis e foco permanecem. No celular, os grupos ficam empilhados. Os botões com ícone reutilizam o padrão circular de 30 px, sem overrides locais. O select de funcionário foi restaurado por novo pedido do usuário, ao lado da data e com Toda a equipe como padrão. Dia e funcionário permanecem ao abrir um card e voltar. A busca continua removida, sem critérios de texto ocultos. Datas inválidas/futuras não geram resultados.

A visualização foi ajustada pela referência enviada pelo usuário em 19/11/2026: horas no eixo horizontal, funcionários nas linhas e tijolos proporcionais aos períodos em Andamento. Cada tijolo abre o mesmo detalhe em `/kanban?tarefa=ID` e informa título, início, fim e duração. Um card que saiu e voltou a Andamento tem tijolos separados, preservando o intervalo entre eles.

## Linha do tempo e sobreposições

`WorkTimelineComponent` apresenta a projeção de `work-timeline.ts`, sem alterar os dados nem o cálculo de horas. Todas as linhas usam a mesma escala. A faixa começa em 08:00–18:00 e é ampliada automaticamente para incluir quaisquer períodos anteriores/posteriores, até os limites do dia. Não há corte de atividade fora do expediente. O mínimo visual é de 88 px por hora e a área rola horizontalmente quando necessário, inclusive no celular; a identificação dos funcionários permanece fixa à esquerda.

Cada bloco tem posição e largura calculadas diretamente pelos instantes de início/fim. Por exemplo, 08:00–09:30 ocupa exatamente uma hora e meia do eixo. Não impor largura mínima ou padding externo que alongue períodos curtos. Retomadas do mesmo card não são unidas através de uma pausa.

Uma varredura dos intervalos identifica simultaneidade por funcionário. Períodos que apenas encostam no horário de saída/entrada não são sobreposição. Os tijolos envolvidos recebem fundo translúcido e contorno tracejado, conservando o texto com contraste e sem aplicar opacidade ao link inteiro. São deslocados verticalmente em 20 px dentro da mesma linha, deixando partes expostas para que um card não esconda inteiramente outro; a linha cresce conforme a concorrência. Foco/hover trazem o tijolo à frente. Cores são estáveis por ID de tarefa e usam a paleta existente, sem representar status.

Ao lado de cada funcionário aparece o tempo de simultaneidade entre os resultados visíveis: a união dos trechos com pelo menos dois cards ativos. Três cards simultâneos não triplicam esse indicador, e filtros limitam quais períodos entram na visualização. Essa informação não altera os créditos integrais solicitados pelo usuário e não bloqueia movimentações do Kanban.

Os links têm descrição completa e dica com horários, duração e presença de sobreposição. O contorno tracejado comunica sobreposição além da cor; a navegação usa links e controles nativos, sem simular uma grade ARIA que exigiria outro modelo de teclado. Em novo ajuste de 19/11/2026, o usuário solicitou remover a lista expansível de períodos, o texto explicativo, os quatro indicadores globais e a legenda. A página mantém filtros de dia e funcionário e a linha do tempo; as regras de cálculo permanecem nesta documentação.

No detalhe do card, abaixo dos dados, anexos e comentários, o histórico mostra criação e alterações, da mais recente à mais antiga, com autor, data/hora e valores anteriores/novos. Registra título, descrição, responsáveis, status, coluna personalizada, prazo e prioridade. Salvar sem mudança não registra edição; reorganizar na mesma coluna continua alterando somente a ordem. Comentários e arquivos preservam suas seções e autoria próprias.

## Origem e cálculo

`core/models/task-history.ts` define `TaskHistoryEvent`, registro de apoio da Tarefa. Guarda status e IDs dos responsáveis naquele instante, mudanças de campos, autoria e horário. Não é um novo objeto principal ou outra cópia do card. O repositório mock central mantém a sequência; `KanbanWorkspace.history` e `TaskCollaboration.history` são projeções dos mesmos eventos.

Criar/editar pelo Kanban, arrastar para outro status/coluna e concluir/reabrir pela solicitação passam pelo mesmo registro. Novas tarefas pela solicitação também geram criação. Os eventos anteriores da linha do tempo da solicitação permanecem compatíveis. A autoria de edição é independente dos responsáveis. Novos eventos continuam sendo pontos disponíveis para automações futuras; nenhum motor ou envio foi implementado.

`WorkHours` carrega o agregado completo do repositório; não usa os filtros do Kanban nem os cards renderizados. `employeeWork` reconstrói intervalos pelos eventos ordenados e recorta sua interseção com o dia escolhido em `America/Sao_Paulo`. Os limites da data são calculados com `Intl`, sem depender do fuso configurado no computador.

- Cada entrada no status `in-progress` começa um período; saída para outro status encerra o período. Voltar a Andamento inicia outro. Todos os períodos no dia são somados.
- Mudanças de responsáveis dividem os períodos, preservando o tempo de quem estava atribuído antes e depois. Cada integrante recebe o tempo integral do intervalo em que estava responsável. IDs repetidos não duplicam crédito.
- Edições de texto, prazo, prioridade ou coluna personalizada não pausam o status. Períodos adjacentes do mesmo funcionário são unidos na apresentação.
- Um card criado diretamente em Andamento começa a contar na criação. Uma coluna personalizada chamada Andamento não substitui o status fixo.
- Intervalos atravessando meia-noite são repartidos pelo recorte diário. A saída no limite do dia aparece como 24:00. O cálculo não exclui noites, fins de semana ou horários de expediente.
- Intervalos abertos terminam no instante atual para hoje; dias anteriores terminam no limite daquele dia. Eventos futuros são ignorados. O relatório atualiza a referência de tempo a cada 30 segundos e remove o timer ao sair da página.
- O total de equipe soma o tempo atribuído a cada funcionário. Cards com vários responsáveis podem aparecer em várias seções; o contador geral de cards permanece único. Cards simultâneos somam suas durações, conforme a regra solicitada. Portanto, o indicador mede permanência no status e não comprova dedicação exclusiva ou jornada de ponto; a definição permanece nesta documentação.

O relatório não usa a diferença entre criação e conclusão nem o campo de prazo para estimar trabalho. Tarefas sem intervalos positivos em Andamento naquele recorte não aparecem. A conclusão é identificada por uma transição para Concluída no dia, entre os cards com tempo no resultado.

## Dados fictícios e limites

`features/kanban/data/task-history.mock.ts` fornece transições fictícias explícitas para os cards existentes, incluindo pausas e retomadas no dia **18/11/2026**. Os cards já concluídos preservam suas datas anteriores. O estado final das transições corresponde ao cadastro atual do card. Após inicializar, mudanças são registradas com o horário real. Esses exemplos demonstram a tela; não são medições históricas de funcionários reais.

O histórico permanece no mesmo mock em memória durante a navegação. Não há backend, ponto eletrônico, calendário de expediente, autorização real, exportação ou persistência remota nesta etapa. Não foram executados testes, build manual ou inspeção de navegador, conforme preferência do usuário.

## Referências consultadas em 19/11/2026

- [Clockify — Detailed report](https://clockify.me/help/reports/detailed-report): organização de entradas por usuário, tarefa, início, fim e duração; filtros por período e equipe. Aplicado ao agrupamento por funcionário e detalhamento dos períodos de cada tijolinho.
- [Clockify — Filter reports](https://clockify.me/help/reports/filtering-reports): combinação de data e filtros. Aplicado aos controles por dia, funcionário e busca.
- [Jira — View and understand the control chart](https://support.atlassian.com/jira-software-cloud/docs/view-and-understand-the-control-chart/): cálculo de tempo baseado em transições dos status selecionados. Adaptado aqui ao status fixo Andamento, com recorte diário e responsáveis históricos.

As referências orientaram a estrutura; a contagem integral por responsável é uma decisão do usuário, e a apresentação em tijolinhos é própria deste protótipo.
