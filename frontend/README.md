# Gabinete — munícipes e acompanhamento em Angular 22

Publicação automática pelo GitHub Actions: [configuração do GitHub Pages](docs/deploy-github-pages.md).

Prévia atualizada em **18/11/2026**, planejamento **v0.16**. A home apresenta oito módulos em botões quadrados: duas colunas no celular e quatro no desktop. A caixa de conversas anterior ficou [preservada para retomada](../docs/prototipos/README.md).

Identidade visual **1.0** aplicada à home a partir dos quatro prints do usuário: azul, amarelo, Inter Variable e marca Sérgio Camargo reconstruída conforme os prints em SVG. [Abrir o guia visual](http://127.0.0.1:4300/design-system/index.html) ou consultar a [documentação do design system](../docs/design-system/README.md). Tokens e componentes compartilhados ficam em `public/design-system/`; logos e fontes locais em `public/brand/`.

Controles atualizados para o **design system 1.1**: [padrão obrigatório de botões com ícone](public/design-system/README.md), aplicado à busca, menu do munícipe, filtros, fotos, WhatsApp, diálogos e botão flutuante. A base visual fica exclusivamente em `public/design-system/`; não redefinir o desenho desses controles nos SCSS das telas. A regra para agentes está em [AGENTS.md](AGENTS.md).

**Prévia com home, listagem de munícipes, Kanban de tarefas, fichas e detalhes dos registros.** A busca global abre o detalhe em uma rota própria. Os cadastros e interações são fictícios; não há backend, controle de permissões, login, integração WhatsApp/IA do CRM ou chamadas de API de negócio. As fotos de exemplo carregam por links do Unsplash e os atalhos de WhatsApp abrem `wa.me`. A autenticação e autorização foram explicitamente adiadas pelo usuário.

O texto da interação rápida possui microfone para ditado em pt-BR usando a Web Speech API do navegador, sem biblioteca ou backend de transcrição. A base é reutilizável em outros campos longos: [guia de uso e limitações](docs/ditado-por-voz.md). O suporte varia conforme o navegador e o áudio pode ser processado por um serviço online do fornecedor. Essa funcionalidade aguarda validação do usuário; não foram executados testes/build para adicioná-la.

## Abrir a prévia

```sh
cd /home/vini/Projects/gabinete-crm/frontend
nvm use
npm start
```

Acessar **http://127.0.0.1:4300**. O projeto já está instalado nesta máquina. Em um checkout novo, executar `npm ci` antes de `npm start`. O `.nvmrc` indica Node 22.23.2; o lockfile mantém Angular 22.2.6 e CLI 22.2.7.

No modo de desenvolvimento, o servidor verifica alterações nos arquivos a cada segundo (`poll: 1000` em `angular.json`). Ao salvar, ele recompila e atualiza a página aberta. Se o terminal deixar de responder ou recompilar, interromper com Ctrl+C e executar `npm start` novamente.

## Home e ordem das próximas etapas

O planejamento dos objetos foi consolidado em **18/11/2026** no [modelo de domínio](docs/modelo-dominio.md). A referência define os sete objetos principais, incorpora Conversa em Interação e trata Comentário como estrutura própria com respostas encadeadas. Consultar esse documento antes de desenhar a próxima tela. É planejamento; o protótipo e o contrato de API anterior ainda não foram migrados para esse modelo.

A home exibe uma frase variável no lugar de “O que você precisa fazer hoje?”. A coleção contém 465 frases curtas de inspiração cristã e serenidade, incluindo 100 novas paráfrases inspiradas em temas e passagens bíblicas, sem atribuição a uma tradução específica. A coleção fica em `src/app/mocks/data/home-messages.mock.ts`, incorporado ao carregamento da home sem API ou dependências adicionais. Cada F5 ou novo carregamento da aplicação escolhe a frase com `Date.now() % messages.length`, usando o instante atual em milissegundos. A frase permanece durante a sessão. Carregamentos podem repetir uma frase.

1. Munícipes
2. Kanban
3. Solicitações
4. Conversas
5. Projetos de lei
6. Leis
7. Configurações
8. Relatórios

O cartão Munícipes abre a listagem em `/municipes` e Kanban abre o quadro de tarefas em `/kanban`. Os demais módulos preservam seus ícones e o aviso “Em breve”. A ficha continua disponível pela busca global, pela listagem e por link direto; os demais módulos aguardam novo pedido. Planejamento anterior em [roadmap-frontend.md](../.agents/roadmap-frontend.md); o escopo atual está registrado em [AGENTS.md](AGENTS.md).

## Busca de munícipes no cabeçalho

O cabeçalho substitui o breadcrumb por busca de nome ou telefone. Ele fica no componente raiz, fora das rotas, para permanecer disponível nas próximas telas. No celular, o cabeçalho acompanha a rolagem.

Até 600 px, a busca aparece como uma lupa. Ao tocar, o campo se expande horizontalmente pela área útil do cabeçalho e recebe foco no próprio toque; ao reabrir, o texto anterior fica selecionado. A seta fecha a busca, assim como Escape ou um toque fora. A consulta é preservada. No desktop, o campo continua aberto.

A expansão usa os 220 ms do design system e respeita movimento reduzido. Campo e resultados acompanham os dois paddings do cabeçalho, inclusive com barra de rolagem; a largura usa porcentagem da área disponível em vez de `100vw`.

Experimente “Mariana”, “joao” ou “11900000004”. A busca aceita nomes sem acentos e telefones sem máscara. Com dois caracteres, mostra sugestões fictícias; selecionar uma pessoa abre sua ficha em `/municipes/:id`. Os resultados são links que também podem ser abertos em outra aba.

Ctrl/⌘ K foca a busca; setas, Tab, Enter e Escape permitem usar os resultados pelo teclado. Não há busca pela API nesta entrega.

## Ficha do munícipe — mock

Exemplo: **http://127.0.0.1:4300/municipes/cid-mariana**. Cada um dos oito cadastros da busca tem rota direta, endereço, dados pessoais, múltiplos telefones/e-mails e histórico mock. O ícone de compartilhar copia a URL da ficha; um identificador desconhecido apresenta um estado de cadastro não encontrado. O cabeçalho global permanece disponível para trocar de munícipe. Não há breadcrumb; o nome usa o estilo azul compacto e as observações aparecem no mesmo card, em fundo amarelo, sem título ou ícone.

O mosaico é destinado às fotos do próprio munícipe, com ampliação em diálogo e navegação entre imagens. Nesta prévia, usa links de retratos do Unsplash com recortes de exemplo, definidos em `src/app/mocks/data/citizen-details.mock.ts`; as imagens não identificam os nomes fictícios. Fotos reais e upload ficam para a etapa de cadastro e integração.

A linha do tempo vem imediatamente abaixo do card do nome, antes dos dados cadastrais no celular. No desktop, os dados ficam à direita. Mostra os contatos do mais recente para o mais antigo, agrupados por mês, com data, título, descrição, secretaria, responsável e protocolo quando houver. Inclui solicitação, conversa, atendimento, visita ao gabinete, encontro pessoalmente, comunicado e ligação. A seta verde indica iniciativa do gabinete; a vermelha, do munícipe, com rótulos acessíveis e sem texto visível de ativo/passivo.

O card do nome tem atalho de WhatsApp e ícones para Instagram, Facebook e LinkedIn. O modelo admite vários telefones e e-mails; cada telefone pode ter atalho de WhatsApp próprio, além de ligação por `tel:`, e os e-mails usam `mailto:`. Os números são fictícios e os links sociais do mock apontam à página inicial de cada rede, a substituir pelas URLs dos perfis reais.

O botão flutuante “+” abre o cadastro rápido de interação, com canal por ícones (Conversa pessoalmente por padrão) e texto da conversa, incluindo ditado por voz. Data/hora, autoria, setor e iniciativa usam os padrões do mock; o título é derivado do canal. O “+” ao lado do filtro abre o formulário dos demais contatos. Os registros são adicionados pelo serviço/repositório mock à linha do tempo e persistem apenas na memória da sessão, inclusive ao navegar entre páginas, desaparecendo no F5. Nenhuma mensagem é enviada ou atendimento real é criado. Filtro e “+” permanecem acessíveis com o acordeão fechado.

A observação no card do nome é um botão de edição: abre diálogo com rascunho, Salvar e Cancelar. Abaixo, as categorias aparecem em etiquetas pequenas e sem negrito. Clicar em uma etiqueta abre a confirmação de remoção; “Sim, remover” desfaz apenas o vínculo com o munícipe, preservando o catálogo e os demais cadastros. Cancelar, Escape ou fechar não remove. O botão “+” ao lado abre uma busca digitável de categorias, com sugestões filtradas sem diferenciar acentos e indicação das já adicionadas. Digitar um nome sem correspondência exata oferece “Cadastrar” com o texto informado. Setas, Tab e Enter permitem selecionar pelo teclado; clicar na categoria ou na opção de cadastrar vincula imediatamente e fecha a caixa. O seletor não tem cabeçalho/rodapé; o botão de fechar fica na linha do rótulo Categoria. O catálogo do mock é compartilhado entre fichas, com reutilização de nomes equivalentes para evitar duplicação. Observações e categorias alteradas ficam em memória e são removidas no F5. Cancelar ou fechar o diálogo não salva o rascunho.

A busca no histórico filtra título, descrição, secretaria, responsável e protocolo, ignorando acentos. O ícone de filtros abre período (inclusive), secretaria e tipo, combinados com o texto. Limpar restaura o histórico; trocar de munícipe reinicia os filtros. As datas dos exemplos são fixas em outubro/novembro de 2026.

Fluxo: componente → `CitizenDetailService` → `CitizenDetailRepository` → `MockCitizenDetailRepository`. Não há implementação HTTP ou guard de permissão nesta etapa. **Permissão futura deve ser validada no backend**, inclusive no acesso por link direto; um guard no frontend será apenas parte da navegação.

## Detalhes de interações, solicitações, conversas e agendamentos

Escopo autorizado em **18/11/2026**: cada registro tem uma rota por ID, acessível diretamente ou pelos links dos resumos e da linha do tempo do munícipe. Interações, conversas e agendamentos usam uma página compartilhada; solicitações têm uma página específica. O layout base é compartilhado e as páginas são carregadas sob demanda:

| Tipo        | Rota                | Exemplo                                                                               | Conteúdo                                                                                      |
| ----------- | ------------------- | ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Interação   | `/interacoes/:id`   | [Ligação de retorno](http://127.0.0.1:4300/interacoes/cid-joao-interaction-09)        | Relato, data/hora, canal, autoria, iniciativa e solicitação relacionada.                      |
| Solicitação | `/solicitacoes/:id` | [Manutenção da iluminação](http://127.0.0.1:4300/solicitacoes/cid-joao-request-0148)  | Protocolo, situação, prioridade, secretaria, prazo, andamento e contatos relacionados.        |
| Conversa    | `/conversas/:id`    | [Conversa sobre o andamento](http://127.0.0.1:4300/conversas/cid-joao-interaction-08) | Resumo, canal, responsável, situação, mensagens recebidas/enviadas e solicitação relacionada. |
| Agendamento | `/agendamentos/:id` | [Retorno no gabinete](http://127.0.0.1:4300/agendamentos/cid-joao-appointment-01)     | Data, início/fim, situação, local, descrição e participantes.                                 |

Todas incluem link para a ficha da pessoa, compartilhamento por ícone, foco no título ao navegar e estado de registro não encontrado para IDs desconhecidos. Os exemplos predefinidos podem ser recarregados e abertos em outra aba; contatos criados pelo formulário dependem da memória da sessão e deixam de existir ao atualizar.

Conversa é uma Interação com histórico de mensagens, preservando o modelo de domínio. A nova página é uma visualização do detalhe mock; não restaura a caixa de entrada arquivada e não envia mensagens. A captura rápida da conversa pelo “+” continua sendo um relato de interação, sem inventar mensagens ou abrir uma conversa de chat automaticamente. O contador de conversas identifica os registros com histórico de mensagens; essas conversas também pertencem ao conjunto de interações.

Fluxo dos detalhes: `ActivityDetailComponent` → `ActivityDetailService` → `CitizenDetailRepository.loadActivityDetail` → `MockCitizenDetailRepository`. A ação retorna o agregado completo do tipo solicitado. Solicitações e agendamentos usam os mesmos objetos apresentados nos resumos da ficha; os links usam IDs explícitos, sem fabricar cadastros quando o ID não existe. A autenticação/autorização e os eventos para automações continuam para implementação futura. Não há chamadas HTTP, novos módulos de listagem ou formulários de edição nessas páginas.

## Listagem de munícipes

A [lista de munícipes](http://127.0.0.1:4300/municipes) abre pelo cartão Munícipes da home e usa os oito cadastros existentes. Mostra retrato em miniatura, nome, bairro, telefone, CRA, categorias, contadores de solicitações pendentes/finalizadas e última interação. Toda a linha é um link à ficha; o mesmo HTML se reorganiza em blocos no celular, sem duplicar imagens ou criar uma segunda lista.

A busca aceita nome, telefone (incluindo alternativos), CRA, bairro, todas as classificações/categorias vinculadas e o texto completo das observações, ignorando acentos e formatação numérica. Inclusões e remoções de categorias na ficha atualizam a busca, incluindo aquelas não visíveis nas duas primeiras pills da lista. Observações salvas na ficha são consideradas imediatamente na busca da listagem; não é necessário exibir o texto como coluna para encontrá-lo. A barra lateral reúne busca, ordenação, bairro, inclusão/exclusão de categorias, idade, aniversário e filtros de solicitações/departamentos; a ordenação permite nome A–Z, Z–A ou interação mais recente. Há contagem de resultados e estado vazio com limpeza de critérios. O estado fica em `CitizenListService` e é preservado ao abrir uma ficha e voltar, independentemente da busca do cabeçalho.

Os filtros permitem adicionar várias categorias em **Incluir categorias** e **Excluir categorias**, com busca sem acentos no catálogo compartilhado e pills para remover cada critério. Por padrão, a pessoa precisa ter todas as incluídas; com múltiplas seleções, é possível optar por pelo menos uma. Qualquer categoria excluída elimina a pessoa do resultado, mesmo que ela satisfaça a inclusão. Ao escolher a mesma categoria no outro grupo, ela é movida para evitar critérios contraditórios. Limpar filtros esvazia os dois grupos e mantém a busca textual e a ordenação. Essas escolhas apenas filtram a lista: não alteram o cadastro de categorias nem os vínculos das pessoas.

**Idade e aniversário:** faixa etária em 16–24, 25–39, 40–59 ou 60+, calculada em anos completos pela data de nascimento e pelo calendário de São Paulo. Dia (1–31) e mês do aniversário funcionam separados ou juntos e combinam com os demais critérios. Datas de nascimento ausentes, inválidas ou futuras não satisfazem esses filtros; combinações impossíveis de dia/mês mostram erro, mantendo 29 de fevereiro disponível. A mesma data do mock alimenta a ficha e o campo ISO `birthDate` da consulta; a idade é recalculada quando muda o dia, sem requisições de rede.

**Departamentos das solicitações:** duas seleções digitáveis permitem incluir e excluir vários departamentos do catálogo. A inclusão aceita quem tiver pelo menos uma solicitação em qualquer departamento escolhido, respeitando a situação selecionada no mesmo pedido. A exclusão elimina quem tiver qualquer solicitação nos departamentos excluídos, em qualquer situação. Uma pessoa vinculada apenas para ciência não é tratada como solicitante. Os departamentos usam IDs estáveis e acompanham as alterações do repositório. `FilterSelectionComponent`, em `shared/components/filter-selection`, é o mesmo seletor de categorias e departamentos, com opções `{value, label}`; não foram criados novos cadastros de departamentos ou componentes de seleção concorrentes. Limpar filtros esvazia todos esses critérios, mantendo texto e ordenação.

Fluxo atualizado em 19/11/2026: `CitizenListComponent` → `CitizenListService` → `CitizenDetailRepository.loadCitizenList(query)` → consulta mock dos mesmos cadastros. Busca textual, filtros combinados, idade no calendário de São Paulo, escopo de departamentos e ordenação são executados em `src/app/mocks/repositories/mock-citizen-list-query.ts`. O contrato retorna uma Promise com os resultados completos ordenados, total de cadastros e catálogos de bairros/categorias/departamentos independentes da busca. A página recebe apenas os campos de exibição, sem observações, telefones alternativos, nascimento, solicitações individuais ou históricos usados para filtrar. A store guarda critérios, resposta, carregamento, erro e seleção acumulada; o serviço coordena a consulta, descarta respostas antigas e consulta novamente quando o mock muda ou o dia vira. Durante uma consulta, selecionar ou imprimir todos os resultados aguarda a nova resposta; a impressão dos selecionados permanece disponível. Retratos usam URLs pequenas e `NgOptimizedImage`, com iniciais caso a imagem não carregue. Alterações de categorias e novos contatos da ficha refletem na lista. A última interação considera contatos, sem usar comentários ou edições; destinatários de ciência não somam pedidos ao contador. Cadastro de novos munícipes e integração continuam para uma etapa posterior.

Cada munícipe na listagem também tem um botão de ações circular, no mesmo padrão da ficha, que abre WhatsApp, redes sociais e compartilhamento. A caixa de seleção e o botão ficam dentro de `person-identity`, no canto direito, com a caixa acima do botão; os dados abaixo aproveitam toda a largura no celular. Os controles ficam fora do link da ficha, portanto usá-los não abre a ficha nem muda a seleção indevidamente. Compartilhar copia a URL daquela pessoa; se a área de transferência não estiver disponível, o próprio link aparece selecionável. Os dados vêm da projeção da listagem, sem uma consulta de ficha por pessoa. O botão permanece acessível no celular, com painel posicionado na área útil e fechamento por Escape ou clique fora.

## Barra lateral e impressão de etiquetas

A busca, a ordenação e todos os filtros ficam na barra lateral aberta pelo ícone de filtro no cabeçalho. O atalho textual Buscar e filtrar/Ajustar filtros foi removido; no canto direito da contagem de resultados ficam Selecionar resultados/Selecionar todos e, abaixo, o contador e Limpar seleção, alinhados à direita com gap zerado. Os grupos Perfil e aniversário, Categorias e Solicitações e departamentos organizam os campos; a lista permanece focada nos resultados. O diálogo lateral tem rolagem própria, Escape e retorno do foco ao controle de abertura, inclusive no celular.

As caixas dos munícipes começam ocultas: **Selecionar resultados** revela os controles sem marcar pessoas e passa a mostrar **Selecionar todos**, que acrescenta toda a busca atual à seleção. As caixas acumulam uma seleção entre pesquisas, filtros, ordenações e navegação, com total selecionado e quantidade fora da busca atual; Limpar seleção esvazia tudo, oculta as caixas e encerra esse modo, mesmo com zero marcados. Não há ação Desmarcar resultados. O ícone de impressão permite escolher **Selecionados**, incluindo pesquisas anteriores, ou **Todos os resultados**, com o conjunto completo da busca atual e na sua ordenação, sem alterar a seleção acumulada. O ícone pode ser usado sem marcar caixas quando houver resultados. A preparação usa todos os IDs filtrados, sem depender de uma página visível; o mock atual ainda exibe a lista inteira, e uma futura paginação deve preservar esse conjunto completo. A ficha também tem um atalho para uma etiqueta individual. `/etiquetas?municipes=cid-joao` abre o editor com modelo Nome e endereço, campos editáveis, fonte/alinhamento, modelos salvos e formato Pimaco ou personalizado. São 156 códigos/variações de tabelas oficiais em JSON minificado de cerca de 19 KB, carregado somente na rota. A biblioteca PDF também é carregada sob demanda.

No modelo de etiqueta, cada campo a partir do segundo pode usar **Na mesma linha do anterior**, com separador ` - `, como `Bairro - Cidade / UF`. A amostra e o PDF usam a mesma composição, preservam negrito por campo e omitem campos vazios sem separadores sobrando. A opção fica salva no modelo.

A geração valida texto, endereço e geometria; mostra a mesma prévia PDF que será baixada/impressa, com cópias por pessoa, posição inicial na folha e deslocamentos de calibração. Configurações alteradas invalidam a prévia anterior. Dados, fontes, limites e atualização do catálogo estão em [docs/etiquetas.md](docs/etiquetas.md). As regras e configurações ficam no mock durante a navegação; não foi adicionada API, impressão remota ou auditoria real.

## Kanban de tarefas

O [Kanban](http://127.0.0.1:4300/kanban) tem duas visualizações dos mesmos cartões: **Por status**, com A fazer, Andamento, Aguardando e Concluída, e **Colunas personalizadas**, criadas pelo botão “Criar nova coluna” na última coluna dessa visualização, após Sem coluna. Todo cartão possui status obrigatório e visível; a coluna personalizada é independente. Mover por status preserva a coluna, e mover na personalizada preserva status e conclusão. **Sem coluna** reúne os não classificados, mantendo todos os registros visíveis nas duas visões, com os mesmos filtros. Criar/editar/mover reflete também nas tarefas da solicitação sem encerrar a demanda. O card inteiro permite arrastar entre colunas e para cima/baixo na mesma coluna, com linha de inserção e rolagem automática nas quatro bordas: laterais movem o quadro, topo/rodapé movem a página. No desktop, o mouse usa captura do ponteiro após 6 px de deslocamento, mantendo o acompanhamento até as bordas. No celular, segurar o card por 350 ms inicia o arraste com prévia acompanhando o dedo; deslizar antes disso mantém a rolagem normal. Manter o mouse/dedo na borda continua rolando e atualiza o alvo de inserção sem precisar movimentá-lo. A ordem manual é preservada separadamente em cada visualização, inclusive ao filtrar ou navegar; cartões ocultos não são removidos. O menu de movimentação tem Subir/Descer e acesso ao editor de Status/Coluna personalizada como alternativa por toque e teclado. Cada tarefa tem vários responsáveis, selecionados no Kanban ou no cadastro pela solicitação; todos aparecem por avatar no card e pelo nome na solicitação. O filtro por responsável encontra qualquer card que inclua a pessoa escolhida. Os cartões mostram responsável, prioridade, prazo, contexto e comentários; os filtros laterais reúnem busca, responsável, departamento, prioridade e prazo vencido. O detalhe do cartão usa descrição, anexos e comentários com respostas encadeadas, em duas colunas no desktop e uma no celular. `@` sugere usuários; ao salvar, menções novas geram notificações internas no sino do cabeçalho, consultáveis por destinatário fictício. Colar links internos exibe os títulos clicáveis de solicitações, conversas e demais registros conhecidos; links externos não são consultados. O cartão tem URL `/kanban?tarefa=ID`, prazo opcional, capa pela primeira foto e contadores de anexos/comentários. Os registros relacionados permanecem os mesmos da solicitação. O quadro rola horizontalmente no celular e os campos longos reutilizam o ditado. O vínculo à solicitação é opcional na criação e fixo na edição. Não há backend ou nova biblioteca. Uso, arquitetura e limitações em [docs/kanban.md](docs/kanban.md); não foram executados testes ou build manual.

As tarefas aceitam várias **etiquetas coloridas**, selecionadas no editor do Kanban e no cadastro pela solicitação. O ícone de etiqueta no quadro abre `/kanban/etiquetas`, com busca e CRUD de nome/cor. O mock valida os vínculos e bloqueia exclusão de etiquetas em uso; renomear ou mudar a cor atualiza os cartões. O nome fica visível e o texto usa contraste automático. Guia e arquitetura em [docs/etiquetas-tarefas.md](docs/etiquetas-tarefas.md).

## Gestão de padrões de solicitação

Em `/solicitacoes/padroes`, pelo ícone de etiqueta na lista de Solicitações, é possível buscar, cadastrar, editar e excluir padrões com nome e departamento sugerido. O mock executa busca, ordenação e validações, rejeita nomes duplicados e bloqueia exclusão de padrões vinculados a solicitações. O catálogo é compartilhado com o formulário e o detalhe; mudar a sugestão não altera solicitações existentes. No formulário, o botão “Usar departamento sugerido” aplica a sugestão explicitamente. Contratos assíncronos, regras e limites estão em [docs/padroes-solicitacao.md](docs/padroes-solicitacao.md).

## Solicitação: munícipe, classificação, tarefas e histórico

A solicitação pode existir sem solicitante: [acessibilidade na Praça da Vila Nova](http://127.0.0.1:4300/solicitacoes/request-praca-acessivel) é uma demanda identificada pela equipe do gabinete. O cabeçalho mostra “Sem munícipe solicitante”, mantendo tarefas, comentários, anexos e contatos utilizáveis. Seus contatos têm rota própria de interação e não recebem um munícipe fictício para preencher o vínculo.

Todas as solicitações possuem **Ciências**, acima da linha do tempo: munícipes vinculados para receber ciência da propositura, com contador, link à ficha, busca por nome/telefone e remoção com confirmação. Solicitante e pessoas já vinculadas ficam fora dos resultados. O exemplo da praça já inclui João e Luciana. Vincular não registra envio ou recebimento de comunicado. Cada inclusão/remoção entra no histórico da solicitação; a ficha do destinatário projeta somente o vínculo e o link à propositura, sem contar o pedido como feito por ele. O vínculo guarda apenas ID da pessoa, autoria e data; seus dados são consultados no cadastro existente. A busca tem estado local para preservar a consulta do cabeçalho. As inclusões são gatilhos para automações futuras, sem execução no protótipo.

A [solicitação de iluminação](http://127.0.0.1:4300/solicitacoes/cid-joao-request-0148) possui cabeçalho com foto pequena, nome com link para a ficha, endereço, CRA e observação em uma linha; clicar expande o texto. Departamento e padrão aparecem como pills acima da descrição; quando não houver padrão, aparece Solicitação livre. Os seletores e o cadastro de departamento ficam reservados ao cadastro da solicitação, sem edição de classificação na tela de detalhes. `RequestClassificationComponent` está preservado; o cadastro atual usa `/solicitacoes/nova` e a edição usa `/solicitacoes/:id/editar`. O padrão pode sugerir departamento, com aplicação explícita pelo usuário. O catálogo de departamentos é compartilhado, e nomes equivalentes são reutilizados.

A solicitação não tem responsável próprio; a responsabilidade é atribuída em cada tarefa. Tarefas mostram responsável, prazo, descrição e situação. É possível criar, concluir/reabrir e comentar tarefas, além de publicar comentários avulsos e respostas encadeadas na solicitação. Comentários e respostas aparecem somente na linha do tempo, sem card separado ou listas repetidas nas tarefas. Clicar no título de um comentário no histórico abre a resposta ao original, preservando o contexto da tarefa quando houver. Os cards da linha do tempo da solicitação não mostram o rodapé de metadados. O editor de comentário reutiliza o ditado por voz. Nada disso envia mensagem ao munícipe ou executa automação.

`CitizenTimelineComponent` é compartilhado entre ficha e solicitação, com projeção `TimelineEntry` e filtros de data, departamento, tipo e texto. Contatos, tarefas, comentários/respostas e mudanças de classificação aparecem em ordem cronológica; comentários de tarefa indicam sua origem e levam à respectiva âncora. Os comentários são guardados somente no contexto original. Conclusão/reabertura de tarefas preserva o histórico e não encerra a solicitação. A contagem de interações da ficha continua contando contatos, enquanto a linha do tempo passa a reunir também os demais acontecimentos.

Fluxo da solicitação: `RequestDetailComponent` → `RequestDetailService` → ações completas em `CitizenDetailRepository` → `MockCitizenDetailRepository`. Os contatos lançados no “+” do histórico são vinculados à solicitação. Os dados em memória são os mesmos exibidos ao voltar à ficha, sem backend. A criação de qualquer objeto segue documentada como gatilho para automações futuras; não há motor implementado.

A seção **Anexos** apresenta fotos no mesmo mosaico da ficha do munícipe, com contador e ampliação ao clicar. Ambas as telas reutilizam `shared/components/photo-gallery`: Anterior/Próxima e setas do teclado percorrem todas as fotos, incluindo as que não aparecem no mosaico. A prévia tem recorte; o diálogo mostra a foto inteira. Na solicitação, o nome do arquivo fica apenas no rótulo acessível, sem legenda visível. Documentos continuam em lista com links para abrir e baixar. Áudios podem ser anexados tanto na solicitação quanto nos cartões do Kanban, com player nativo na própria tela e download; a base para todas as próximas telas está em [docs/anexos.md](docs/anexos.md). O “+” permite selecionar vários arquivos (fotos, áudios, PDF, texto, planilhas e apresentações; até 20 MB por arquivo). A inclusão aparece no histórico da solicitação e da pessoa. Há uma foto ilustrativa do Unsplash e um PDF fictício local de exemplo. Arquivos selecionados permanecem no navegador por URLs `blob:`, sem upload ou base64, e são liberados ao destruir a aplicação; navegar entre páginas preserva os anexos da sessão, e F5 os remove. `NgOptimizedImage` é usado para a foto estática; prévias locais usam `src`, pois a diretiva Angular rejeita URLs `blob:`. Não há testes de upload, gravação em servidor ou nova integração nesta etapa.

## Conversas guardadas

A fonte de conversas permanece em `src/app/features/inbox`, com seus modelos e mocks. A [cópia completa v0.15](../docs/prototipos/caixa-de-conversas-v0.15.tar.gz) preserva a antiga home, o antigo cabeçalho, estilos, imagens e testes. Os cenários de navegador originais estão também em `tests/archives/conversations-v0.15.ts`, fora da suíte atual.

Na quarta etapa, adaptar a página antiga ao novo layout compartilhado; ela ainda possui cabeçalho e atalho de busca próprios. Não restaurar a cópia sobre a home atual.

## Organização da home

```text
src/app/
  app.html                             # Cabeçalho compartilhado + router-outlet
  layout/app-header/                   # Marca, busca global e perfil fictício
  shared/components/citizen-search/     # Campo e links para as fichas
  features/home/pages/home-page/        # Grade dos oito módulos
  features/citizens/                    # Ficha, galeria, linha do tempo e repositório mock
  features/activities/                  # Detalhes por ID de interação, solicitação, conversa e agendamento
  features/requests/                    # Solicitação, resumo do munícipe, classificação, tarefas e comentários
  features/kanban/                      # Quadro de tarefas, filtros, cartões e editor compartilhando os registros
  core/
    models/citizen-summary.ts
    repositories/citizen-search-repository.ts
    services/citizen-search.ts
  features/inbox/                      # Protótipo preservado, fora da home
```

HTML/SCSS separados, defaults standalone/OnPush/zoneless do Angular 22, signals, `@Service`, `inject()` e Signal Forms. Ícones SVG e fonte Inter são locais.

## Arquitetura para novas implementações

Os dados fictícios, os repositórios mock e os arquivos estáticos da demonstração ficam em `src/app/mocks/`. Para substituir a prévia pelo backend, troque os provedores em `app.config.ts`, retire a entrada de assets mock em `angular.json` e adapte os testes que usam esses provedores. Os contratos usados pelos services permanecem fora da pasta.

O [mapa dos dados do frontend](docs/mapa-de-dados.md) identifica os services, stores e repositórios usados por cada fluxo.

O componente dispara ações pelo serviço e lê o estado pela store. Apenas o serviço chama o repositório por seu contrato e atualiza a store com os resultados. A store expõe o estado e as informações derivadas para leitura pelos componentes.

Todo mock de dados da aplicação passa pela implementação mock do repositório, que usa o mesmo contrato previsto para o backend e simula o comportamento das operações. Registros, catálogos, totais, identidades e outras informações de negócio devem vir desse fluxo, inclusive em protótipos. Componentes, templates, serviços e stores não importam fixtures nem definem dados de negócio fixos. Textos estáticos de interface e estado local de apresentação, como a abertura de um diálogo, podem ficar na tela.

Esse padrão vale para as próximas implementações e para os fluxos de dados que forem alterados. As descrições das telas existentes registram a implementação atual. Consulte a [regra de arquitetura em AGENTS.md](AGENTS.md#arquitetura-para-novas-implementações). `mockEnabled` continua `true`, inclusive em produção desta prévia.

## MCP e instruções do Angular

Foram utilizados o [servidor MCP oficial do Angular CLI](https://angular.dev/ai/mcp) e as [instruções oficiais para IA](https://angular.dev/ai/develop-with-ai#custom-prompts-and-system-instructions), consultadas em 17/11/2026. O [link indicado sobre MCP](https://modelcontextprotocol.io/docs/2026-07-28/getting-started/intro) descreve o protocolo; a implementação usada como ferramenta de desenvolvimento é a que acompanha o Angular CLI.

O CLI gerou [AGENTS.md](AGENTS.md), complementado pelas preferências do projeto, incluindo templates HTML externos. Essa preferência prevalece sobre a sugestão oficial de templates inline pequenos.

Configurações prontas:

- **Codex:** [`.codex/config.toml`](../.codex/config.toml) na raiz do projeto, com Node 22 e diretório do frontend explícitos.
- **VS Code:** [`.vscode/mcp.json`](.vscode/mcp.json), abrindo a pasta `frontend`.
- **Terminal:** `npm run mcp` inicia o servidor stdio. O processo fica aguardando um cliente MCP; não é uma página web.

O servidor `angular-cli` também foi registrado pelo CLI no Codex desta máquina, restrito à pasta frontend por `--root`, preservando os demais servidores. Reabrir o projeto no cliente/editor permite carregar a nova configuração. Os caminhos de Node nas configurações correspondem a esta máquina; ajustar ao mover o projeto.

```sh
npm run mcp:check
```

A verificação usa o cliente oficial SDK v2 para o protocolo **2026-07-28**, descobre o projeto com `list_projects` e chama `get_best_practices` para o Angular instalado. Guia retornado e metadados ficam em `.angular/`, ignorados pelo Git. O cliente MCP é dependência apenas de desenvolvimento e não entra no bundle do navegador.

A comunicação com o subprocesso MCP foi validada fora do sandbox restrito desta sessão; dentro dele, o subprocesso era encerrado. Isso não exige permissão especial no terminal normal do usuário.

Este MCP ajuda a desenvolver Angular. O agente de atendimento e o futuro MCP de negócio do gabinete continuam fora desta entrega.

## Verificações

Por preferência explícita do usuário, não executar testes, inspeções de navegador ou builds de validação sem solicitação ou autorização prévia com justificativa. Os comandos abaixo são referência para execução solicitada. Na investigação de lentidão de 17/11/2026, o usuário autorizou testes e build especificamente para o diagnóstico: a correção e as medições estão em [validacao.md](validacao.md#investigação-de-montagem-da-ficha--17112026). Essa autorização não muda a preferência para tarefas futuras. Os cenários antigos de resumo em modal ainda precisam ser adaptados à navegação para a ficha quando o usuário solicitar trabalho nos testes.

```sh
npm run build
npm test -- --watch=false
```

O build está em `dist/gabinete-web/browser`. Para verificar a interface com o servidor local já aberto:

```sh
npm run test:ui
```

O Playwright usa o Chrome já instalado em `/opt/google/chrome/chrome`, sem baixar outro navegador. Em outra máquina, informar o caminho com `CHROME_PATH=/caminho/do/chrome npm run test:ui`. `PREVIEW_URL` permite usar outra porta/origem local.

Os cenários atuais cobrem ordem dos módulos, botões quadrados em duas/quatro colunas, busca global, teclado, resumo do munícipe, cabeçalho durante rolagem, sete larguras entre 320 e 1536 px e axe em desktop/celular/resultados/modal. Os testes de repositório/serviço verificam bloqueios de responsabilidade, contato e estado do protocolo. Não são testes de API, banco ou integração real.

Prévia desktop e celular: `artifacts/`. Relatórios Playwright: `playwright-report/` e `test-results/`, todos ignorados pelo Git. Detalhes do resultado em [validacao.md](validacao.md).

## Histórico dos cards e relatório diário de horas

O detalhe do card apresenta o histórico de alterações ao final, com autoria, data e valores anteriores/novos. O relatório em `/relatorios/horas-trabalhadas`, acessível pela home e pelo Kanban, mostra uma linha do tempo com horas no eixo horizontal, funcionários nas linhas e tijolinhos proporcionais a cada período em Andamento; sobreposições usam transparência, contorno tracejado e deslocamento parcial para manter os cards acessíveis; filtros de dia e funcionário, com Toda a equipe como padrão. Cada responsável recebe o tempo integral do intervalo, conforme confirmado pelo usuário; mudanças de equipe preservam o passado e intervalos são recortados por dia em São Paulo. O cálculo mede permanência no status, incluindo sobreposições. A tela mantém filtros de dia e funcionário e a linha do tempo; texto explicativo, indicadores globais, legenda e lista de períodos foram removidos a pedido do usuário. A página começa no último dia encerrado; os exemplos têm atividade em 18/11/2026 e as alterações seguintes usam o instante real. Arquitetura, cálculo, limitações e referências externas em [docs/relatorio-horas.md](docs/relatorio-horas.md). Sem testes ou build manual nesta entrega.
