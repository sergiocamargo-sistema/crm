# Planejamento do Gabinete CRM

Nome provisório. Planejamento **v0.16**, atualizado em **17/11/2026**, America/Sao_Paulo.

Estado: planejamento e pesquisa documental. A pasta `/home/vini/Projects/gabinete-crm` foi criada para reunir a documentação solicitada pelo usuário. O CRM, as integrações e a infraestrutura ainda não foram implementados ou instalados.

## 1. Objetivo e decisões confirmadas

- Decisão de 16/11/2026 (v0.14): a API deve seguir telas e ações reais do frontend. Um cadastro/edição completo salva o agregado em uma chamada; o backend resolve filhos e vínculos. Não criar CRUD por tabela, rotas futuras sem consumidor ou sequências técnicas artificiais para concluir um formulário.

Construir um CRM próprio para organizar munícipes, atendimentos e serviços realizados pelo gabinete, com uso simples e pouca dependência de chamados ao desenvolvedor. A maioria dos atendimentos chega pelo WhatsApp; a caixa de conversas integrada será o principal espaço de trabalho da equipe.

Decisões do usuário:

- Desenvolver um sistema próprio, com escopo enxuto. O EspoCRM serve como referência funcional.
- Usar ferramentas sem mensalidade; VPS e domínio podem ser pagos.
- Projetar recuperação automática de falhas conhecidas e administração pela própria equipe.
- Identificar o munícipe por ID interno. Documentos são opcionais; telefone e e-mail podem ser compartilhados por pessoas diferentes.
- Receber as conversas do WhatsApp no sistema e usar o agente de IA para identificar se a mensagem pertence a uma solicitação existente ou a uma nova solicitação.
- Permitir que os atendentes disponíveis assumam e respondam às conversas pelo CRM.
- Preservar o funcionamento do CRM durante falhas da IA ou da integração. O trabalho de pesquisa do conector pode ocorrer em paralelo, mas WhatsApp, caixa de entrada e triagem passam a fazer parte do núcleo da primeira versão.
- Oferecer também cadastro público por link, por exemplo para uma lista de presença de evento. O munícipe preenche seus dados completos sem consultar ou selecionar pessoas da base interna.
- Receber esses envios como cadastros temporários e disponibilizar uma tela interna para conferência: cadastrar pessoas novas ou incorporar os dados às pessoas já existentes.
- Permitir várias fotos do munícipe em um carrossel no cabeçalho de sua ficha, para ajudar a equipe no reconhecimento, com opção de ocultar.
- Permitir que cada atendimento tenha várias fotos, documentos e outros anexos vinculados ao seu protocolo.
- Manter o histórico de todas as atividades com data/hora e usuário responsável e permitir reverter ações realizadas. O desenho distingue reversão de alterações internas, resolução de dependências e correção de efeitos externos que não podem ser desfeitos.
- Ter uma tela para gerenciar a conexão do WhatsApp, notificar a equipe pelo Chrome quando a conexão cair e permitir que um usuário autorizado entre nessa tela para reconectar.
- Ter uma tela de impressão de etiquetas, com modelo inicial de nome e endereço, edição de campos e opção de salvar novos templates. Para criar a etiqueta, escolher um padrão Pimaco ou definir medidas personalizadas.
- Ter relatório de munícipes com vários filtros, incluindo sexo, nascimento e classificações cadastráveis, como grupo de jovens, igreja e futebol.
- Em qualquer pesquisa por datas, permitir dia, mês, ano, combinações desses componentes e intervalo de datas.
- Manter observação extensa sobre a pessoa e uma busca geral nos campos do cadastro e nos atendimentos vinculados, além da própria observação.
- Permitir receber áudio e transcrevê-lo para preencher as observações do munícipe, com revisão do texto pela equipe.
- Distinguir munícipes sem interação registrada, com muitas interações e que precisam de retomada por tempo sem contato. Indicadores, faixas e prazos abaixo são propostas para essa necessidade, ainda a validar.
- Registrar indicação recebida de outro munícipe ou de ninguém, sempre pessoa para pessoa, e navegar em relatório pelos indicados de cada pessoa até terminar cada ramo.
- Disponibilizar checkbox manual “Voto garantido” na ficha, com registro de autor/data, sem inferência, previsão ou verificação de voto real.

Direção de experiência proposta: o munícipe continua no WhatsApp e recebe a resposta no mesmo canal; o atendente trabalha no CRM. Levar também o munícipe para um chat do sistema exigiria um link e acesso ao portal, como alternativa futura a validar.

Leveza é uma meta a medir: o estudo não incluiu benchmark do EspoCRM nem comprovação de consumo do sistema próprio.

## 2. Escopo inicial proposto

| Módulo | Entrega proposta |
| --- | --- |
| Caixa de conversas | Receber mensagens do WhatsApp, visualizar histórico do canal e responder pelo CRM. |
| Triagem por IA | Identificar assunto e pessoa quando possível, buscar solicitações relacionadas e associar ou abrir solicitação conforme regras e contexto. |
| Distribuição | Fila de conversas, disponibilidade da equipe, assunção por um responsável e transferência rastreável. |
| Conexão do WhatsApp | Tela de situação do canal, alerta pelo Chrome em caso de queda e reconexão pela equipe autorizada; acompanha a entrega da caixa WhatsApp. |
| Munícipes | Cadastro, contatos, endereço, busca, revisão de possíveis duplicados e carrossel opcional de fotos no cabeçalho da ficha, com opção de ocultar. |
| Áudio nas observações | Receber áudio, transcrever, revisar e inserir o texto nas observações, preservando o conteúdo anterior; gravação no navegador como opção proposta. |
| Cadastro público e conferência | Link aberto por evento ou ação, recebimento de cadastros temporários e revisão interna para criar ou atualizar munícipes. Etapa de entrega a definir. |
| Solicitações / atendimentos | Protocolo, canal, descrição, responsável, situação, prazo e resultado; vínculo às mensagens pertinentes. |
| Serviços | Catálogo administrável e execuções vinculadas aos atendimentos. |
| Histórico e reversão | Atividades com data/hora, responsável e alterações; linha do tempo por registro e consulta global autorizada, com reversão auditada e tratamento de conflitos/efeitos externos. |
| Pendências | Próxima ação, responsável, vencimento e conclusão. |
| Anexos | Várias fotos, documentos e outros arquivos ligados ao atendimento ou serviço, com consulta no histórico e controle de acesso. |
| Equipe | Usuários, perfis e permissões aplicados pela API. |
| Gestão | Indicadores fixos e relatório de munícipes com filtros combináveis de sexo, nascimento, classificações e outros dados; busca geral no cadastro/atendimentos. |
| Etiquetas | Impressão com template inicial de nome/endereço, edição e novos templates; formato Pimaco ou personalizado obrigatório, prévia e seleção dos destinatários. Prioridade de entrega a definir. |
| Administração | Serviços, categorias, classificações de munícipes, usuários, responsáveis e dados institucionais. |

Evolução posterior: importação com prévia e validação, exportação autorizada, relatórios específicos, filtros pessoais, portal por protocolo, chat no portal e ampliação das ferramentas MCP. A prioridade de cada item depende da validação do fluxo real. A integração de WhatsApp e a caixa de entrada não ficam adiadas para essa evolução.

O cadastro público foi incluído no planejamento na v0.3. Sua prioridade de entrega permanece a definir. Ele é um formulário aberto de entrada de dados, separado da futura consulta autenticada por protocolo e da importação de arquivos.

Um criador genérico de entidades, editor visual de telas, fórmulas, motor BPM, módulos de vendas e campanhas ficam fora do escopo inicial proposto.

O editor de templates de etiquetas é específico para impressão e faz parte do requisito da v0.8; não amplia o escopo para um criador genérico de telas ou entidades.

## 3. Experiência de atendimento

Fluxo principal proposto:

**Receber mensagem do WhatsApp → persistir e reunir contexto → identificar pessoa e assunto → associar à solicitação existente ou abrir nova → colocar na fila → atendente assumir → responder no CRM → entregar resposta pelo WhatsApp → registrar serviços e próximos passos.**

A IA analisa o contexto recente, o assunto, referências a protocolos e as solicitações relacionadas, respeitando a identidade e as permissões. Quando o vínculo estiver claro, o sistema pode associar a mensagem ou criar a solicitação conforme a política configurada. Se houver múltiplos assuntos, identidade incerta ou dúvida sobre o vínculo, a conversa vai para revisão com os candidatos e os motivos da sugestão. Saudações e mensagens sucessivas da mesma demanda não devem gerar um protocolo por mensagem.

A caixa de entrada mostra conversas aguardando atendimento, atribuídas, em triagem e com falha de envio. Um atendente disponível assume a conversa e passa a ser o responsável pela resposta; a assunção precisa ser atômica para impedir que duas pessoas assumam ao mesmo tempo. Estar online não significa estar disponível: capacidade, equipe e horário precisam ser considerados. Distribuição automática ou escolha pela fila permanecem propostas a validar.

O atendente vê a conversa, a pessoa confirmada, a solicitação selecionada, o resumo e os próximos passos no mesmo contexto. Pode corrigir a classificação, abrir outra solicitação e transferir a conversa com histórico. Quando o humano assume, o agente não envia respostas concorrentes; pode continuar organizando e sugerindo informações em segundo plano.

A ficha do munícipe reúne resumo, contatos, atendimentos, serviços e anexos. A equipe pode abrir um atendimento ou incluir um serviço mantendo o contexto do registro atual. Formulários curtos, mensagens claras de validação, listas paginadas e histórico carregado conforme necessário ajudam a reduzir esforço e consumo.

Atendimento presencial ou por telefone mantém o fluxo manual: **buscar pessoa → selecionar ou cadastrar → abrir atendimento → registrar serviços/encaminhamentos → definir próxima ação → concluir com resultado**.

Filtros iniciais: nome, protocolo, bairro, serviço, situação, responsável e período; relatório de munícipes inclui sexo, nascimento e classificações, com busca geral conforme a seção 3.4. Todos os filtros de data seguem a regra comum de dia/mês/ano/intervalo dessa seção. Atalhos úteis: minhas pendências, vencidas e sem responsável.

Situações sugeridas: aberto, em andamento, aguardando informação, encaminhado, concluído e cancelado. Encaminhado não deve contar automaticamente como serviço concluído. Estados e transições ainda precisam ser validados com o gabinete.

### 3.1. Fotos no cabeçalho da ficha do munícipe

Requisito confirmado em 16/11/2026, na conversa: um munícipe pode ter várias fotos, apresentadas em carrossel já no cabeçalho da ficha, para auxiliar o reconhecimento pela equipe, com opção de ocultar.

Desenho proposto:

- Exibir o carrossel junto ao nome e ao ID da pessoa, antes das abas e do histórico. Fotos são opcionais; o cadastro e o atendimento funcionam normalmente quando não há imagem.
- Permitir escolher uma foto principal, ordenar as demais e navegar manualmente com controles de anterior/próxima e indicação da posição. Com uma única foto, exibir somente a imagem, sem controles desnecessários. Os controles devem funcionar pelo teclado e no celular.
- Disponibilizar **Ocultar fotos** e, quando recolhido, **Mostrar fotos**, mantendo o nome, o ID e as ações da ficha visíveis. Ocultar recolhe apenas a apresentação, sem excluir as imagens nem alterar a visualização de outros atendentes.
- Como preferência de interface proposta, lembrar a escolha de mostrar/ocultar por usuário nas próximas aberturas de fichas. A preferência visual não substitui a permissão de acesso às fotos.
- Permitir à equipe autorizada adicionar, ordenar, definir a principal e remover fotos. Registrar autor, data e alterações; consultar imagens e gerenciá-las exigem permissões aplicadas pela API, inclusive no acesso ao arquivo.
- Vincular as fotos diretamente ao munícipe, separadas dos anexos de atendimentos e das participações em eventos. O requisito não acrescenta envio de fotos ao formulário público.

Limites de quantidade, tamanho e formatos das imagens e prioridade de entrega permanecem a definir. O carrossel é um apoio visual ao atendente; não decide identidade nem correspondência entre cadastros.

### 3.2. Fotos, documentos e anexos do atendimento

Requisito confirmado em 16/11/2026, na conversa: os atendimentos podem ter fotos, documentos e outros anexos. Cada protocolo pode reunir vários arquivos ao longo do acompanhamento.

Desenho proposto:

- Disponibilizar a área **Fotos e documentos** no detalhe do atendimento, com inclusão de vários arquivos, descrição opcional e registro da inclusão na linha do tempo.
- Apresentar fotos em miniaturas e documentos/outros arquivos em lista, mostrando nome, tipo, tamanho, descrição, origem, responsável pela inclusão e data. Exemplos de documentos: PDF, texto e planilha; formatos e limites aceitos ainda precisam de definição.
- Permitir ampliar fotos e visualizar formatos suportados; oferecer download autorizado para os demais. Falha ou formato sem prévia não bloqueia o atendimento nem indica que o arquivo está indisponível para download.
- Vincular o arquivo ao protocolo correto e, quando aplicável, à execução de serviço relacionada. Arquivos recebidos pelo WhatsApp podem ser associados à solicitação pela equipe, preservando a mensagem de origem; o recebimento das mídias depende do conector escolhido.
- Manter os anexos do atendimento separados das fotos de reconhecimento do cabeçalho do munícipe. Anexar uma foto ao protocolo não a inclui automaticamente no carrossel da pessoa.
- Aplicar as permissões do atendimento na inclusão, visualização, download e remoção, inclusive no acesso direto ao arquivo; registrar alterações na auditoria. A ficha do munícipe permite consultar os anexos dos atendimentos que o usuário pode acessar, preservando o protocolo de origem.
- Mostrar progresso e falha de envio; apresentar o arquivo como disponível somente depois de armazená-lo e confirmar seu vínculo ao atendimento. Uma falha permite nova tentativa sem perder os dados já salvos do atendimento.

Limites de tamanho, quantidade, formatos e regras de retenção/remoção permanecem a definir. O requisito de anexos está confirmado; a prioridade exata de entrega continua pendente.

### 3.3. Impressão de etiquetas e templates

Requisito confirmado na conversa de 16/11/2026: tela para imprimir etiquetas, com uma etiqueta padrão de nome e endereço, opção de editar esse padrão e acrescentar campos, salvar novos templates e escolher um padrão Pimaco ou tamanho personalizado ao criar a etiqueta. O fluxo abaixo é proposto; a funcionalidade ainda não foi implementada.

**Selecionar munícipes → escolher formato Pimaco ou personalizado → selecionar/editar template → gerar PDF da prévia → conferir → imprimir o mesmo PDF.** Na revisão v0.14, um comando recebe seleção/layout/formato, inclusive rascunhos; não há geração definitiva separada nem salvamento obrigatório de seleção/template antes de imprimir.

#### Conteúdo da etiqueta

- Disponibilizar o template inicial **Nome e endereço**, com nome, logradouro, número, complemento quando houver, bairro, cidade/UF e CEP. Compor as linhas sem rótulos ou espaços desnecessários para campos opcionais vazios.
- Permitir incluir/remover campos autorizados, mudar a ordem, inserir texto fixo e ajustar fonte, tamanho, alinhamento e quebras de linha. Alterar a apresentação não altera o cadastro do munícipe. Usar campos estruturados, sem execução de código no template.
- Oferecer **Salvar alterações** para atualizar o template existente, inclusive o padrão, e **Salvar como novo template** para criar outro modelo com nome próprio, preservando o original. Guardar versões para auditoria e reversão e detectar edição concorrente.
- Separar o **template de conteúdo** do **formato físico** da folha/etiqueta. O template pode lembrar um formato preferido, mas a geração exige um formato selecionado e nova validação do conteúdo no espaço disponível.

#### Formato Pimaco ou personalizado

- Na opção **Pimaco**, escolher o código do produto e conferir medidas da etiqueta, tamanho da folha, margens, linhas, colunas e espaçamentos do gabarito. Usar dados verificados do fabricante; não presumir que só largura e altura determinam o alinhamento.
- Na opção **Personalizado**, informar medidas em milímetros: largura/altura da folha e da etiqueta, margens, número de linhas/colunas e espaçamento horizontal/vertical. Permitir folha com uma única etiqueta. Validar medidas positivas e encaixe completo da grade na folha.
- Permitir salvar o formato personalizado para reutilizar e fazer ajustes de deslocamento horizontal/vertical para calibrar a impressão, sem modificar silenciosamente o gabarito oficial. Versões de formatos preservam os parâmetros usados em cada geração.
- Referência consultada em 16/11/2026: [Pimaco — parâmetros de impressão](https://editor.pimaco.com.br/downloads/parametros), página do fabricante que disponibiliza medidas dos produtos. Os códigos que entrarão no catálogo inicial precisam ser escolhidos e seus gabaritos conferidos; nenhum código ou conjunto de medidas foi cadastrado nesta etapa.

#### Tela e preparação da impressão

- Permitir iniciar pela ficha de um munícipe ou selecionar várias pessoas na lista, com filtros e seleção explícita. Mostrar destinatários, endereço escolhido e quantidade na prévia antes de imprimir. Endereço principal inequívoco pode ser usado; em ambiguidade, devolver as alternativas autorizadas no erro da própria geração para escolha explícita, sem consultar uma ficha por destinatário. Definir ordem e quantidade de cópias por pessoa.
- Exibir prévia da etiqueta e da folha completa, quantidade de folhas e posição inicial. Permitir começar em uma célula escolhida para aproveitar folha parcialmente usada, deixando as anteriores vazias e continuando nas folhas seguintes.
- Mostrar dados faltantes e nomes/endereços longos na prévia, sinalizando conteúdo que exceda a área. Pedir ajuste ou exclusão explícita do item com problema; não cortar texto ou imprimir endereço incompleto silenciosamente. Campos opcionais vazios podem ser omitidos.
- Proposta de gerar PDF nas medidas físicas escolhidas para impressão em tamanho real, com instruções de escala 100%, papel correto e sem cabeçalhos/rodapés adicionais. Disponibilizar teste de alinhamento em folha comum e ajuste por impressora; validar medidas na impressora da equipe antes do uso real.
- Ao trocar formato ou editar template/destinatários, invalidar a prévia anterior e regenerar. Fixar a seleção, os dados autorizados e as versões de template/formato no momento da geração, para o arquivo corresponder à prévia confirmada.

#### Permissões, histórico e limites

- Separar permissões para imprimir dados, gerenciar templates, alterar o padrão e gerenciar formatos. Revalidar acesso aos munícipes e aos campos na geração e no download; um template não concede acesso a um campo restrito. Aplicar as regras pelo backend compartilhado com a API.
- Registrar autor, data/hora e alterações de templates/formatos; a geração registra destinatários autorizados, versões, quantidades e parâmetros. Proteger arquivos gerados e definir retenção. Usar o mecanismo de reversão para mudanças nos modelos e formatos.
- Distinguir **arquivo gerado** e **impressão solicitada** de impressão física concluída, que não é comprovada apenas ao abrir o diálogo de impressão. Reverter um template não recolhe folhas impressas ou arquivos já baixados.

Pendentes: prioridade de entrega, códigos Pimaco iniciais, permissões/compartilhamento de templates, campos adicionais permitidos, limites de lote, retenção dos arquivos e calibração nas impressoras disponíveis.

### 3.4. Relatório de munícipes, classificações, observações e busca geral

Requisitos confirmados na conversa de 16/11/2026: vários filtros no relatório de munícipes, incluindo sexo, nascimento e classificações cadastráveis; todas as pesquisas por datas devem aceitar dia, mês, ano e intervalos. Observações precisam comportar informações extensas sobre a pessoa; o campo de busca deve encontrar o munícipe pelos campos do cadastro e também pelos atendimentos. O detalhamento abaixo é proposto; funcionalidades ainda não implementadas.

#### Relatório e combinação de filtros

- Oferecer página **Relatório de munícipes**, com filtros visíveis, resumo dos critérios ativos, ação de limpar, ordenação, paginação e total de pessoas encontradas. Permitir abrir a ficha e selecionar os resultados autorizados para a impressão de etiquetas já prevista.
- Filtros iniciais: sexo, nascimento, classificações, nome/contatos/documentos, localização (logradouro, bairro, cidade, UF e CEP), data do cadastro e existência/características de atendimentos (protocolo, serviço, situação, responsável e datas). Permitir **não informado** para dados ausentes e **sem classificação**.
- Combinar filtros de grupos diferentes com **E**. Seleções múltiplas do mesmo filtro usam **OU**, com exceção das classificações, que oferecem explicitamente **qualquer uma** ou **todas as selecionadas**. O campo de busca geral também pode ser combinado com esses filtros.
- Mostrar cada munícipe uma única vez, mesmo se vários contatos, classificações ou atendimentos coincidirem. Os totais contam pessoas, não os registros relacionados. Filtros de serviço/situação/responsável/data destinados a um atendimento devem coincidir no mesmo atendimento; não misturar condições de pedidos diferentes silenciosamente.
- Sexo é informação opcional declarada no cadastro, com opções a validar e filtro de não informado; não inferir por nome ou foto.

#### Regra comum para qualquer filtro de datas

Aplicar o mesmo controle em nascimento, cadastro, atendimentos, serviços, histórico, eventos e demais telas com pesquisa temporal. Deixar explícito **qual data** está sendo filtrada, por exemplo nascimento, abertura ou conclusão do atendimento.

| Modo | Comportamento e exemplo |
| --- | --- |
| Dia | Dia do mês, sem exigir mês ou ano: dia 15 encontra registros no dia 15 de qualquer mês/ano. |
| Mês | Novembro encontra aniversariantes de novembro de qualquer ano, sem impor o ano atual. |
| Ano | 1990 encontra nascidos em qualquer dia/mês de 1990. |
| Combinação | Dia 15 + mês 11 encontra 15 de novembro de qualquer ano; mês 11 + ano 2026 restringe a novembro de 2026; todos os componentes formam uma data exata. |
| Intervalo | De 01/01/1990 até 31/12/2000 inclui as duas datas; permitir somente a partir de ou somente até. Validar início menor ou igual ao fim. |
| Não informado | Buscar ausência da data separadamente, sem tratá-la como coincidência com componentes ou intervalo. |

Os modos por componentes e por intervalo são alternativos no mesmo critério, com resumo claro do escolhido. Validar datas e combinações possíveis, incluindo 29 de fevereiro. Data de nascimento é uma data civil sem conversão de fuso; datas com horário são filtradas pelos dias no fuso da interface (inicialmente America/Sao_Paulo). Um período inclui o dia final inteiro, sem perder registros com segundos/frações ou na virada do dia. Intervalos completos podem cruzar meses e anos.

#### Classificações cadastráveis

- Disponibilizar catálogo de classificações na administração: criar, renomear e ativar/inativar, com nome e descrição opcional. **Grupo de jovens**, **igreja** e **futebol** são exemplos informados pelo usuário, não uma lista fechada.
- Proposta de permitir várias classificações por munícipe, pois a mesma pessoa pode participar de grupos diferentes. Usar vínculos por ID, sem repetir livremente o nome em cada cadastro; evitar nomes duplicados no catálogo por caixa/espaços/grafia equivalente.
- Inativar impede novas associações, preserva vínculos existentes e permite encontrá-los nos filtros quando incluídos explicitamente. Registrar alterações no catálogo e nos vínculos com data/usuário, versões e reversão.

#### Observação extensa e busca geral

- Oferecer campo **Observações do munícipe** de texto longo e várias linhas para registrar informações conhecidas, contexto e referências úteis ao atendimento, sem restringir a uma descrição curta. Permitir leitura completa, edição e histórico de autor/data/versões, sem truncamento silencioso. Limite operacional de tamanho a definir.
- O campo **Buscar munícipe** pesquisa os campos de negócio autorizados do cadastro, incluindo nome, documentos, contatos, endereço, sexo, datas, nomes das classificações e observação. Incluir também protocolo, descrição, observações/notas, encaminhamentos, resultados e serviços dos atendimentos vinculados que o usuário pode consultar.
- Mensagens vinculadas ao atendimento podem integrar o texto pesquisável quando disponíveis e autorizadas; um telefone compartilhado não autoriza pesquisar toda a conversa de outros familiares. Incluir nomes/descrições de anexos; pesquisa automática no conteúdo de arquivos em geral exige extração/OCR/transcrição, uma evolução separada. A transcrição de áudio escolhida para preencher observações passa a requisito específico na v0.10 (seção 3.5).
- Normalizar busca por caixa e acentos e os valores estruturados de telefone/documento/data, preservando os originais. Proposta inicial de encontrar todas as palavras informadas no conjunto dos dados autorizados da pessoa e dos atendimentos; correspondências podem estar em campos diferentes. Permitir frase exata como refinamento, com comportamento explicado na interface.
- Mostrar **onde encontrou** o termo, com trecho autorizado e acesso à ficha ou ao protocolo correspondente, para a equipe reconhecer a pessoa. Exemplo: buscar “futebol iluminação” pode encontrar classificação/observação de futebol e um atendimento de iluminação da mesma pessoa.
- Buscar no cadastro atual e no histórico operacional visível dos atendimentos. Versões substituídas/excluídas da auditoria não são incluídas automaticamente na busca comum; sua consulta continua no histórico autorizado. Adicionar um campo de negócio deve incluir sua regra de pesquisa e permissão, sem indexar credenciais ou dados técnicos internos.

#### Permissões e proposta técnica

Aplicar acesso antes de retornar nomes, trechos e totais, inclusive quando a correspondência vem apenas de um atendimento ou campo restrito. Contatos compartilhados não unem pessoas. Edições, inativações, arquivamentos e reversões precisam atualizar os resultados; revalidar acesso mesmo se a busca usar um índice preparado anteriormente. A pesquisa da equipe permanece interna e não é exposta no link público.

Proposta de usar PostgreSQL para filtros estruturados e pesquisa textual indexada, preservando paginação no servidor. Recursos candidatos: [pesquisa textual e índices](https://www.postgresql.org/docs/current/textsearch-indexes.html), [pg_trgm para correspondências parciais/semelhança](https://www.postgresql.org/docs/current/pgtrgm.html) e [componentes de datas](https://www.postgresql.org/docs/current/functions-datetime.html), consultados em 16/11/2026. A normalização sem acentos e os índices necessários devem ser implementados e medidos; não há benchmark ou motor de busca instalado.

Pendentes: opções do campo sexo, permissões do catálogo/classificações/observações, colunas iniciais do relatório, limites da observação, volumes e metas de desempenho, inclusão de mensagens e eventual extração do conteúdo de arquivos. O alcance da busca e dos filtros está confirmado; detalhes de interface e implementação permanecem propostas.

### 3.5. Áudio para preencher observações

Requisito confirmado na conversa de 16/11/2026: receber um áudio e transcrever para colocar no campo de observações. Fluxo proposto, ainda não implementado:

**Enviar ou gravar áudio → transcrever → ouvir e revisar o texto → inserir nas observações → salvar.**

- Ao lado de **Observações do munícipe**, oferecer **Enviar áudio** e, como opção proposta, **Gravar áudio**, com iniciar/parar, duração, reprodução e descarte antes do processamento. A gravação começa somente por ação do usuário e solicita permissão de microfone; produção em HTTPS. Sem permissão, permitir envio de arquivo e digitação. Base consultada em 16/11/2026: [MDN — getUserMedia](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia).
- Mostrar progresso e situações de envio, transcrição, texto pronto para revisão e falha. Validar formato/tamanho/duração no servidor e verificar o formato de gravação suportado pelo navegador, sem presumir um codec universal. Referência: [MDN — formatos do MediaRecorder](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder/isTypeSupported_static).
- Apresentar a transcrição em texto editável e permitir ouvir o áudio, corrigir nomes/endereço e descartar o rascunho. Propor transcrição fiel, sem completar informações que não foram ditas; trechos incertos precisam de conferência. Não gravar automaticamente como informação confirmada no cadastro.
- **Inserir nas observações** acrescenta o texto revisado, preservando o conteúdo existente e o rascunho que o atendente já digitou. Substituição exige escolha explícita e prévia. A observação só muda ao salvar; falha/cancelamento de transcrição não apaga conteúdo anterior e não impede digitação manual.
- Manter o vínculo da tarefa ao munícipe correto; navegar para outra ficha não aplica o resultado nela. Revalidar permissão e versão ao salvar, sem sobrescrever alteração de outro atendente. Repetição de inserção/confirmação não acrescenta o mesmo trecho duas vezes.
- Após salvar, o texto integra a busca geral já prevista. Rascunhos não confirmados ficam fora da busca comum. Registrar usuário, data/hora, origem por transcrição, versão anterior e texto aceito, usando o mecanismo de auditoria/reversão. Reverter recupera a observação, sem depender da permanência do áudio.
- Proteger áudio e transcrição pelas permissões do cadastro. Áudios do WhatsApp poderão ser selecionados se o conector permitir e o usuário tiver acesso, com preservação da origem; não transcrever automaticamente todas as conversas.
- Proposta de tarefa no worker, com repetição controlada e recuperação de falha, mantendo o CRM disponível. Serviço/modelo local ou externo, custo, formatos/limites, retenção do áudio e da transcrição de trabalho e prioridade de entrega permanecem a definir. A versão anterior da observação deve ser preservada para reversão; não prometer recuperar áudio eliminado.

### 3.6. Frequência de interações e retomada de contato

Necessidade apresentada na conversa de 16/11/2026: reconhecer pessoas sem interações, aquelas com bastante contato e quem precisa de retomada após longo período. A v0.11 registra a proposta abaixo; faixas e prazos não foram confirmados e a funcionalidade ainda não foi implementada.

Separar **frequência/volume** e **tempo desde o contato**. Uma pessoa pode ter histórico frequente e estar sem contato recente; não resumir essas duas dimensões em um único rótulo. As faixas são calculadas e distintas das classificações cadastráveis, como futebol ou igreja.

| Indicador na ficha e no relatório | Significado proposto |
| --- | --- |
| Primeira e última interação efetiva | Datas de contato real registrado com a pessoa, com canal e acesso à origem. |
| Dias sem contato | Dias desde a última interação efetiva; sem histórico, mostrar “sem interação registrada” em vez de um número inventado. |
| Frequência | Dias distintos com interação nos últimos N dias; janela e faixas configuráveis. Contar dias evita tratar várias mensagens seguidas como vários encontros. |
| Volume | Mensagens recebidas/enviadas e atendimentos separados, no período e no histórico disponível; quantidade de mensagens não substitui frequência. |
| Última tentativa e resultado | Quando a equipe tentou falar, mesmo sem resposta: pendente, enviada, falha, sem resposta ou contato realizado, conforme evidências disponíveis. |
| Próximo contato | Data, responsável, motivo e situação do retorno, inclusive agendado/vencido. |

Regras propostas para o cálculo:

- Interação efetiva inclui mensagem recebida de pessoa identificada, ligação atendida e conversa presencial registrada. A data é a do ocorrido, não a da digitação do registro; preservar ambas e o autor. Telefone compartilhado exige vínculo correto à pessoa.
- Tentativa de saída, mensagem automática, aceite/entrega do provedor ou ligação não atendida não comprovam resposta. Registrar a tentativa separadamente e atualizar o contato efetivo quando houver interação confirmada. Alterar cadastro, anexar arquivo, transcrever observação ou registrar serviço sem conversa não renova a data de contato.
- Vinte mensagens no mesmo dia contam como um dia com interação e mantêm o volume de mensagens separado. Eventos repetidos não duplicam contagens. Uma inscrição em evento ou cadastro importado não comprova conversa; o relato de uma conversa presencial pode ser registrado à parte.
- “Sem interação registrada” não comprova que a pessoa nunca falou com o gabinete. Mostrar cobertura do histórico quando a integração/importação não contém contatos anteriores. Métricas e origens respeitam permissões; quando a visão é parcial, indicar “no histórico acessível”, sem inferir ausência absoluta ou revelar contatos restritos.
- Correções de vínculo, registros retroativos, fusões e reversões recalculam os indicadores a partir das evidências válidas. Dias sem contato e janelas móveis atualizam com a passagem do tempo, mesmo sem novas atividades. Reaproveitar filtros por datas/dia/mês/ano/intervalo e adicionar faixas de quantidade/dias sem contato.

Proposta de lista **Entrar em contato**, com filtros e explicação do motivo por pessoa:

- **Aguardando retorno da equipe** e **retorno agendado vencido**, conforme as pendências e compromissos registrados.
- **Primeiro contato pendente**: sem interação conhecida e aguardando abordagem por decisão da equipe; considerar a data de cadastro separadamente.
- **Retomar contato**: última interação há mais que o prazo configurado; 30, 60 ou 90 dias são exemplos, não limites definidos. Pode incluir pessoas antes frequentes.
- **Tentativa recente sem resposta**: mostrar última tentativa e próxima data permitida, evitando repetir abordagens como se nada tivesse sido feito. Não remover da lista de inatividade só porque uma mensagem foi enviada.

A equipe poderá abrir o histórico, assumir/atribuir um próximo contato e registrar resultado (**falou**, **sem resposta**, **remarcar** ou **não deseja contato**), com data/usuário. Respeitar preferência de não contato e não criar tarefas repetidas para a mesma pendência. Uma preferência por não receber abordagens proativas não bloqueia responder a um novo pedido iniciado pela pessoa. A lista não envia mensagens automaticamente e o volume de contato não define prioridade do serviço solicitado.

Referência consultada em 16/11/2026: [HubSpot — propriedades de contatos](https://knowledge.hubspot.com/properties/hubspots-default-contact-properties), que distingue data de atividade e data de contato. A definição de interação efetiva, métricas e regras de retomada acima é uma proposta própria para este CRM.

Pendentes: janela de frequência e faixas, prazo de retomada, ordenação da fila, intervalo entre tentativas, responsáveis, cobertura do histórico, permissões e prioridade de entrega. Não há limites ou automação de abordagem aprovados.

### 3.7. Indicações entre munícipes e navegação por níveis

Requisito confirmado na conversa de 16/11/2026: um munícipe pode ter sido indicado por outro munícipe ou por ninguém; a relação é sempre pessoa com pessoa. No relatório, começar pelas pessoas que têm indicados e não são indicadas por ninguém; selecionar uma pessoa mostra seus indicados, repetindo a navegação até chegar ao fim. O termo “filhos” representa níveis da indicação, não parentesco familiar.

Desenho proposto:

- Cada munícipe tem **zero ou um indicador** e pode ter **vários indicados diretos**. A ficha oferece busca de outro munícipe autorizado e a opção **Ninguém**; não recebe nome livre, instituição ou usuário de login como substituto de pessoa cadastrada.
- A primeira lista mostra apenas quem possui pelo menos um indicado direto acessível e não possui indicador. Quem não tem indicador nem indicados fica fora dessa lista inicial. Se um pai está arquivado ou inacessível, não apresentar seu filho falsamente como raiz sem indicador.
- Ao selecionar uma pessoa, carregar **somente os indicados diretos** daquele nível, com nome e quantidade de indicações diretas acessíveis. Selecionar um deles repete o fluxo. Sem filhos, informar “Nenhuma indicação neste nível”. Paginar cada lista sem carregar toda a rede de uma vez.
- Exibir caminho de navegação e ações **Voltar um nível** e **Voltar ao início**, preservando contexto e filtros de acesso. Não criar limite funcional arbitrário de níveis; limites técnicos precisam ser explícitos, sem apresentar corte como fim verdadeiro do ramo.
- Impedir autoindicação e ciclos em qualquer profundidade: A não pode indicar B se B já está acima de A na cadeia. Validar e serializar alterações concorrentes, pois duas mudanças simultâneas não podem formar um ciclo. A consulta mantém proteção contra repetição de IDs caso haja dados antigos inconsistentes.
- Trocar/remover o indicador muda somente a relação recebida da pessoa selecionada. Seus próprios indicados continuam vinculados a ela. Arquivar pessoa preserva vínculos/histórico; incluir arquivados no relatório exige opção/permissão específica.
- Aplicar permissões de leitura/edição de indicações, além do acesso às pessoas. Contagens e possibilidade de expandir consideram somente filhos autorizados. Registrar antes/depois, motivo, usuário, data e versão; reversão precisa revalidar a rede atual. Fusão de pessoas deve prever efeitos e bloquear ciclos ou conflitos sem resolução explícita.

Exemplo ilustrativo:

```text
Ana (ninguém indicou Ana)
├── Bruno (indicado por Ana)
│   └── Carla (indicada por Bruno)
└── Daniel (indicado por Ana)
```

Primeira lista: Ana. Selecionar Ana: Bruno e Daniel. Selecionar Bruno: Carla. Selecionar Carla: fim do ramo. A navegação pode voltar a Ana para abrir Daniel.

#### Checkbox manual na ficha

Adicionar **Voto garantido** como anotação manual separada, com permissão própria de leitura/alteração, autor, data e histórico de reversão. Desmarcado significa **não marcado**, sem declarar voto contrário. A anotação não comprova nem garante voto real e não deve ser inferida por IA a partir de indicação, observação, classificação, mensagens ou outros dados.

O relatório de indicações usa exclusivamente os vínculos entre pessoas, sem depender desse checkbox. A anotação não é exposta no link público/portal, na busca geral ou em filtros/exportações de público e não dispara mensagens. Fusões não combinam marcações por “qualquer uma verdadeira”; conflitos exigem decisão humana autorizada. Reverter exige permissão atual da anotação e preserva o evento original.

Contrato atual em `docs/api/`: um GET de relatório serve às raízes e aos filhos diretos por indicadorId. Indicação e anotação manual autorizada integram o formulário e o único POST/PATCH de munícipe; não exigem gravações em rotas próprias. A revisão v0.14 substitui a fragmentação da v0.13. Prioridade de entrega, permissões finais e apresentação dos ramos arquivados permanecem a definir; nenhuma funcionalidade está implementada.

## 4. Modelo de dados proposto

Relação central: **Munícipe → Solicitações / atendimentos → Execuções de serviço**. O catálogo de tipos de serviço é separado das execuções. A conversa do WhatsApp é um registro do canal e pode dar origem a várias solicitações ao longo do tempo; as mensagens pertinentes são vinculadas ao protocolo correspondente.

| Entidade | Dados e relações principais |
| --- | --- |
| Munícipe | UUID, nome informado, versão normalizada para busca, sexo opcional declarado, nascimento opcional, documentos opcionais, endereço e observação de texto longo, com datas e versões de alteração. |
| Indicação entre munícipes | Pessoa indicada e indicador opcional, ambos munícipes, com vínculo único de origem, motivo, autor/data e versão. Sem autoindicação/ciclos; vários filhos diretos por pessoa. |
| Anotação manual de voto | Munícipe, checkbox, versões históricas e autor/data da última alteração; edição usa o ETag do agregado da pessoa. Desmarcado não significa voto contrário; anotação restrita sem previsão/verificação automática. |
| Classificação de munícipe | ID, nome, descrição opcional, situação ativa/inativa, versão, autor e datas; catálogo administrável, sem lista fixa. |
| Vínculo munícipe–classificação | Pessoa, classificação, autor e datas de inclusão/alteração; várias classificações por pessoa, sem duplicar o mesmo vínculo, com histórico e reversão. |
| Transcrição para observação | ID, munícipe, origem e referência protegida ao áudio enquanto retido, usuário/data, situação, texto de trabalho, texto revisado aceito, versão de destino e identificação da inserção; falha ou cancelamento preservam a observação. |
| Foto do munícipe | ID, munícipe, referência ao arquivo, ordem, indicação de principal, autor e data. Relação de uma pessoa para várias fotos, com acesso controlado. |
| Preferência de exibição | Usuário e opção de mostrar/ocultar fotos no cabeçalho, sem alterar as imagens ou a preferência de outra pessoa da equipe. |
| Template de etiqueta | ID, nome, indicação do padrão inicial, campos/textos e apresentação, formato preferido opcional, versão, autor e datas. Editar existente ou salvar cópia com novo nome. |
| Formato de etiqueta | ID, origem Pimaco/personalizado, código quando aplicável, fonte das medidas, dimensões da folha/etiqueta em mm, margens, linhas/colunas, espaçamentos, versão e ajustes de calibração separados. |
| Geração de etiquetas | Usuário, data/hora, destinatários/dados autorizados na geração, versões de template/formato, ordem, cópias, posição inicial, parâmetros, quantidade de folhas, referência protegida ao arquivo e resultado. |
| Meio de contato | Tipo, valor normalizado e vínculos a pessoas. Uma pessoa pode ter vários contatos; um contato pode pertencer a várias pessoas. |
| Vínculo pessoa–contato | Titularidade, parentesco ou observação, quando conhecidos. |
| Evento ou ação de origem | Nome, descrição pública, data e contexto da coleta. Não confundir com evento técnico de auditoria. |
| Formulário público | Origem, identificador não previsível do link, campos habilitados, versão, período de abertura e situação aberto/encerrado/revogado. |
| Cadastro temporário | ID, formulário e origem, dados declarados e versão do formulário, data de recebimento, situação da revisão, versão do registro e vínculo ao munícipe após integração. Não é um munícipe definitivo. |
| Participação | Vínculo da submissão ao evento/ação e, após conferência, ao munícipe. Distinguir inscrição de presença confirmada conforme a finalidade do formulário. |
| Decisão de conferência | Cadastro temporário, candidatos e motivos, destino escolhido, campos aceitos, valores anteriores, responsável e data. |
| Conversa | Canal, conta de origem, identificador externo, meio de contato, estado da triagem e responsável atual pela resposta. Pode conter mensagens relativas a solicitações diferentes. |
| Mensagem | Identificador do provedor, direção de entrada/saída, texto ou mídia, autor, datas e estado de envio/entrega quando disponível. Vínculo à solicitação após identificação do contexto. |
| Conexão do WhatsApp | Conta/canal, referência da sessão no conector, estado observado, data da última confirmação, incidente ativo e tentativa de reconexão. Credenciais ficam protegidas fora do histórico. |
| Incidente de conexão | Canal, início da queda, evidência, situação, tentativas e recuperação confirmada. Identificador agrupa alertas e impede repetição por checagem. |
| Destino de notificação | Usuário/dispositivo, assinatura Web Push, preferência de alerta e situação da entrega. Validar acesso ao canal e remover assinaturas inválidas ou desvinculadas. |
| Solicitação / atendimento | UUID, protocolo legível e único, pessoa solicitante, canal, descrição, responsável, situação, prazos e resultado. |
| Tipo de serviço | Catálogo com nome, descrição e situação ativo/inativo. Inativar preserva os registros anteriores. |
| Execução de serviço | Atendimento, tipo de serviço, responsável, data, situação, encaminhamento e resultado. |
| Pendência | Atendimento, próxima ação, responsável, vencimento e conclusão. |
| Interação com munícipe | Pessoa identificada, canal, direção, data do ocorrido e de registro, autor, origem/mensagem e resultado; distinguir interação efetiva de tentativa, com correções auditadas. |
| Próximo contato | Munícipe, atendimento/pendência quando aplicável, motivo, responsável, data prevista, situação e resultado; preferência de não contato proativo. |
| Resumo de contato | Indicadores derivados do histórico autorizado: primeira/última interação, dias sem contato, frequência/volume por período, última tentativa e próximo retorno; parâmetros e cobertura explícitos, sem substituir as evidências. |
| Anexo do atendimento | ID, atendimento, execução opcional do mesmo atendimento, referência ao arquivo, nome original, tipo, tamanho, categoria, descrição opcional, origem, autor e data. Um atendimento pode ter vários anexos; mensagem de origem quando aplicável. |
| Atividade e auditoria | ID da operação, registros afetados, ação, responsável identificado, origem, data/hora do servidor, resultado, valores anteriores/posteriores e versões quando houver alteração. Registro preservado após reversão. |
| Reversão | Operação original, escopo/campos/vínculos afetados, motivo, responsável, data/hora, versões esperadas e resultado; nova operação ligada à original, com controle de repetição. |

O número de serviços realizados é uma medida diferente do número de atendimentos. Uma conversa cuja identidade ainda não foi confirmada permanece associada ao contato antes de escolher ou criar um munícipe. A pessoa de uma solicitação não é inferida apenas pelo número do WhatsApp. A distribuição e as transferências da conversa registram autor, data e responsáveis anteriores para permitir retomada e auditoria.

## 5. Identidade, duplicidade e edição simultânea

- UUID é a identidade interna. Nome, nascimento, endereço, telefone e e-mail não são chaves únicas de pessoa.
- Normalizar informações para pesquisa preservando o dado informado quando necessário.
- No cadastro interno, buscar candidatos antes de cadastrar e reavaliar no salvamento. Dados ausentes não contam como coincidências. No link público, receber os dados sem revelar candidatos; a comparação acontece na conferência interna.
- Mostrar por que cada candidato apareceu: nome semelhante, nascimento, endereço ou contato coincidente.
- Permitir selecionar pessoa existente ou confirmar que se trata de pessoa distinta. Telefones compartilhados e homônimos não provocam fusão automática.
- Documento válido já informado em outro registro exige revisão.
- Aplicar as mesmas regras a cadastro manual, importação e integração.
- Para unir duplicados, comparar campos lado a lado, definir o registro mantido e preservar rastreabilidade de IDs, históricos e vínculos anteriores. Executar a alteração em transação, com permissão específica.
- Projetar e verificar a reversão de fusão, preservando versões e origem dos vínculos; resolver dependências de alterações posteriores antes de confirmar. O recurso faz parte do requisito de reversão da seção 6.1 e ainda precisa ser implementado.
- Usar versão de registro para detectar edição concorrente, evitando sobrescrita silenciosa por outro atendente ou integração.
- Distinguir duplicidade de cadastro, repetição da mesma mensagem e vínculo de uma conversa a uma solicitação. São verificações diferentes; mensagem repetida não cria outra solicitação.
- Em telefone compartilhado, confirmar a pessoa e evitar expor o histórico de outro familiar. A IA não deve unificar cadastros nem vincular toda a conversa à mesma pessoa automaticamente.

### 5.1. Cadastro público e conferência de cadastros temporários

Requisito confirmado em 16/11/2026, na conversa: além do cadastro pela equipe, permitir que o próprio munícipe preencha seus dados por um link aberto, como numa lista de presença de evento. Receber o formulário completo e decidir internamente se a pessoa é nova ou já está na base. O desenho abaixo é uma proposta para concretizar esse requisito.

**Equipe cria formulário e divulga link → munícipe preenche → envio entra como cadastro temporário → equipe confere correspondências e campos → cria novo munícipe ou incorpora dados ao existente → participação fica vinculada à pessoa.**

#### Formulário público

- Mostrar identificação do evento/ação e formulário adequado ao celular, sem exigir conta no CRM. Campos propostos: nome, nascimento, contatos, endereço e documentos opcionais. Campos mínimos e finalidade da coleta precisam ser definidos por formulário; “cadastro completo” não significa exigir todos os dados.
- O munícipe preenche seus próprios dados mesmo que já esteja cadastrado. Não oferecer busca, seleção de pessoas, preenchimento com dados internos nem aviso de que alguém já existe.
- A API pública permite consultar apenas a configuração pública do formulário e enviar dados. Não expor cadastros internos, lista de participantes, sugestões de correspondência ou dados de outros envios. A confirmação de recebimento deve ser a mesma para pessoas novas ou já cadastradas.
- Gravar o envio em área temporária antes de confirmar recebimento. A mensagem pública informa recebimento para conferência; não afirma que o cadastro definitivo já foi criado ou que a identidade foi comprovada.
- Permitir abrir, encerrar ou revogar o link. Validar campos e limites no servidor e prever limitação de envios; o identificador do link não autoriza acesso a dados pessoais.
- Guardar a origem e os dados declarados para rastrear a posterior integração, com acesso interno controlado e prazo de retenção a definir.

#### Tela interna “Cadastros recebidos”

Filtros propostos: evento/ação, formulário, período e situação. A lista mostra nome informado, origem, data, situação e indicação de possíveis correspondências. Ao abrir um item, mostrar os dados enviados ao lado dos candidatos internos e os motivos da sugestão. Correspondências não comprovam identidade; envios públicos são dados declarados, sujeitos à confirmação pela equipe.

| Ação | Resultado proposto |
| --- | --- |
| Criar novo munícipe | Reavaliar candidatos e, com confirmação da equipe, criar ID interno e contatos; vincular a origem e a participação. |
| Incorporar ao existente | Selecionar a pessoa, comparar campo a campo e escolher manter o atual, preencher ausente ou aceitar o informado. Preservar ID e histórico existentes. |
| Manter pendente | Aguardar esclarecimento quando não for possível distinguir homônimos ou confirmar a identidade. |
| Descartar | Registrar motivo para envio inválido, indevido ou repetido. Preservar a decisão conforme a retenção definida. |

Situações propostas: **pendente**, **em conferência**, **integrado como novo**, **integrado ao existente** e **descartado**. Registrar responsável e data de cada decisão. Itens em conferência precisam permitir retomada ou transferência, sem ficarem presos após desconexão.

#### Incorporação, participação e consistência

- O cadastro temporário não cria uma segunda pessoa definitiva antes da revisão. Incorporar ao existente atualiza campos escolhidos e vincula a origem, preservando o ID e o histórico. A fusão entre dois munícipes definitivos continua sendo uma operação separada, restrita a supervisor na proposta atual.
- Não sobrescrever silenciosamente nome, nascimento, documentos, endereço ou contatos com dados do link. Valor ausente não apaga dado atual. Novo contato pode ser acrescentado sem excluir o anterior; respeitar contatos compartilhados e a confirmação de titularidade.
- Não fundir automaticamente por nome, telefone ou endereço, nem tratar documento declarado no formulário como comprovação de identidade. Conflitos e dúvidas permanecem para revisão.
- Preservar todas as origens: uma pessoa pode participar de vários eventos. Reenvios do mesmo evento exigem revisão para evitar participação contada duas vezes; manter rastreabilidade dos envios. O formulário deve indicar se registra inscrição ou presença, pois uma inscrição antecipada não comprova comparecimento.
- Participação em evento não abre automaticamente solicitação nem registra execução de serviço. Essas ações seguem seus próprios fluxos.
- Integrar pessoa, contatos, participação, decisão e situação do temporário em uma transação. Repetir a confirmação do mesmo item não pode criar outro munícipe ou participação. Dois revisores não podem concluir o mesmo item simultaneamente; revalidar a versão do cadastro de destino antes de atualizar.
- Reavaliar candidatos ao confirmar um novo munícipe, inclusive quando outro envio já foi integrado. Serializar decisões de criação com candidatos sobrepostos e devolver para revisão quando houver nova correspondência; nome ou telefone não passam a ser chaves únicas. A estratégia de concorrência precisa ser definida e verificada na implementação.
- Permissões específicas para administrar links, consultar envios, criar munícipes, incorporar dados e descartar; aplicar na API e registrar decisões e alterações. Atribuição final dos perfis permanece pendente.

## 6. Permissões e autonomia

Perfis propostos: operador, supervisor e administrador. O acesso deve ser verificado na API, inclusive ao consultar registros e baixar anexos. Exportação, arquivamento e fusão precisam de permissões específicas.

A equipe administra serviços, categorias, responsáveis, usuários e dados institucionais pela interface. Mudanças estruturais e regras de negócio permanecem em código versionado. O histórico visível de atendimento e a auditoria técnica são registros com finalidades distintas.

A administração também inclui classificações de munícipes. Relatório, observações e busca geral respeitam permissões por registro/campo e pelos atendimentos relacionados, inclusive em totais e trechos de resultado.

Cadastros públicos recebidos ficam restritos à equipe autorizada. Gerenciar formulários, conferir e integrar são operações distintas; o visitante do link tem acesso somente ao formulário público e ao envio dos próprios dados, sem consulta à base.

Fotos do munícipe seguem o acesso à ficha e permissões de consulta e gerenciamento. Ocultar o carrossel é uma preferência visual, sem conceder ou retirar acesso aos arquivos.

Atendentes controlam sua disponibilidade; a equipe acompanha conversas aguardando assunção e transferências pendentes. A autorização para responder, assumir, transferir ou corrigir o vínculo a um protocolo é aplicada pela API. Uma interrupção breve de presença não transfere silenciosamente a conversa nem autoriza dois responsáveis a responder; a política de redistribuição precisa definir prazo e critério.

### 6.1. Histórico completo de atividades e reversão

Requisito confirmado na conversa de 16/11/2026: manter todos os históricos de atividades com data e usuário e poder reverter ações realizadas. A auditoria já era prevista; a v0.6 torna explícitos seu alcance transversal e o fluxo de reversão. As regras abaixo são o desenho proposto para cumprir esse objetivo com rastreabilidade.

#### O que registrar e como consultar

- Registrar atividades de cadastro, edição, arquivamento/exclusão lógica, restauração, contatos, atendimentos, situações, serviços, pendências, notas, fotos, anexos, assunção/transferência, vínculos de mensagens, fusão e conferência de temporários. Incluir configuração, usuários/permissões, ações da IA e integrações; registrar também acessos relevantes, como consultas a dados, downloads e exportações.
- Guardar ação, alvo(s), data e hora geradas no servidor, usuário/identidade responsável, origem e resultado. Alterações registram os valores anteriores e posteriores, versões e os vínculos necessários à reversão. Persistir a mudança interna e sua auditoria na mesma transação; uma mudança não deve ser confirmada sem seu histórico.
- Identificar a pessoa que executou a ação e, quando houver, o agente/integração que agiu em seu nome. Operações automáticas usam identidade de serviço. Envios públicos ficam identificados como origem pública não autenticada, sem atribuir um usuário interno ou identidade comprovada ao visitante.
- Manter datas consistentes no servidor e mostrar data/hora no fuso da interface, inicialmente America/Sao_Paulo. Preservar a identificação histórica do autor mesmo se sua conta for desativada.
- Oferecer linha do tempo na ficha/no atendimento e tela **Histórico de atividades**, com filtros por período, usuário, ação, registro e resultado. Abrir o detalhe mostra o que mudou e eventuais reversões. Respeitar as permissões dos dados relacionados, inclusive nos valores antigos.
- Preservar registros de auditoria sem edição/exclusão pela interface ou por operações comuns da API. Correções e reversões acrescentam novos eventos ligados aos anteriores; não removem a evidência do ocorrido. Não incluir senhas, tokens ou credenciais nos valores registrados.

#### Fluxo de reversão

**Abrir atividade → solicitar Reverter → comparar o estado atual com o anterior e mostrar efeitos/dependências → informar motivo e confirmar → aplicar uma nova operação → registrar quem reverteu, quando e qual ação foi revertida.**

- Cada ação de negócio deve definir seu histórico e seu caminho de reversão/correção junto da implementação. Para mudanças internas, executar a operação inversa sobre campos e vínculos afetados, preservando alterações posteriores independentes; não restaurar indiscriminadamente uma ficha inteira.
- Revalidar permissões atuais, versões e regras de negócio no servidor no momento da confirmação. Conflito no mesmo campo, vínculo alterado ou dependência exige resolução explícita; mostrar o motivo quando a reversão direta estiver bloqueada. Um usuário sem permissão não pode recuperar acesso revertendo uma mudança anterior.
- Oferecer prévia do impacto, incluindo registros relacionados. A reversão interna e a nova auditoria são transacionais; repetição da confirmação ou dois usuários revertendo a mesma operação não duplicam efeitos. A ação original permanece consultável, ligada à operação que a reverteu.
- Tratar remoções comuns como exclusão lógica/arquivamento e preservar versões dos arquivos durante o período de recuperação. Restaurar um anexo exige guardar os bytes e os metadados, não apenas seu nome no log. Eliminação definitiva após o prazo estabelecido não é reversível e deve ser explicitada antes de ocorrer.

| Ação original | Caminho de reversão/correção proposto |
| --- | --- |
| Editar campos, mudar situação/responsável ou concluir pendência | Recuperar os valores afetados e validar conflitos; reabrir quando necessário, preservando a atividade original e a reversão. |
| Criar um registro | Cancelar/arquivar a criação se permitido; se já há atendimentos ou outros vínculos dependentes, revisar o impacto antes de desativar, sem apagar o histórico relacionado. |
| Remover foto, anexo ou registro | Restaurar o vínculo/registro e o arquivo preservados dentro do prazo de recuperação, respeitando permissões atuais. |
| Incorporar temporário ou fundir munícipes | Preservar IDs, estados anteriores e origem de cada campo/vínculo para recompor os registros e relacionamentos. Alterações feitas depois exigem resolução específica; novos dados não podem ser distribuídos silenciosamente entre pessoas. |
| Transferir conversa ou vincular mensagem | Reavaliar a atribuição/vinculação atual e suas dependências antes de recuperar a anterior. A reversão não gera reenvio automático de mensagens. |
| Enfileirar ação externa | Cancelar antes da execução quando possível, coordenando cancelamento e worker. Se já foi executada ou está com resultado incerto, reconciliar o estado e tratar como efeito externo. |
| Enviar mensagem, exportar/baixar dados ou realizar serviço fora do sistema | Registrar o ocorrido e permitir correção/compensação quando aplicável. Reverter o registro interno não recolhe uma mensagem já entregue, um arquivo já baixado nem desfaz um serviço realizado. Consultas permanecem no histórico e não possuem alteração de dados a desfazer. |

Reversões com efeitos externos não são apresentadas como concluídas antes da confirmação aplicável: manter correção pendente, falha ou limitação visível. Registrar todas as etapas e impedir disparos externos duplicados. Restaurar um backup inteiro continua sendo recuperação de desastre, separado de desfazer uma atividade individual.

Definir as permissões de consultar histórico e reverter por operação; proposta inicial reserva fusão, incorporação e alterações de acesso à supervisão/administração autorizada. Retenção da auditoria, prazo de recuperação de arquivos e matriz final de permissões permanecem a definir. Não há garantia de reversão ilimitada depois da eliminação definitiva dos dados ou de efeitos externos já consumados.

## 7. Arquitetura candidata

| Parte | Proposta | Situação |
| --- | --- | --- |
| Sistema interno | Angular | Recomendação técnica. |
| Caixa de entrada ao vivo | Atualizações de mensagens, fila e atribuição pela API; SSE ou WebSocket a avaliar | Recomendação técnica, com reconexão e retomada do que ficou pendente. |
| Site institucional | Angular com páginas pré-renderizadas | Recomendação técnica. |
| Regras de negócio | Uma API modular com NestJS/TypeScript | Recomendação técnica. |
| Dados | PostgreSQL | Recomendação técnica. |
| Tarefas e integrações | Worker do mesmo projeto e fila pg-boss no PostgreSQL | Candidato para reduzir componentes; substitui a proposta inicial de Redis/BullMQ. |
| Operação | Coolify self-hosted em VPS | Preferência inicial; não instalado. Dokploy é alternativa pesquisada. |
| Distribuição | Containers e configuração versionada | Proposta de implantação reproduzível. |

Interface, worker e futuro MCP usam as mesmas regras e permissões do backend. A separação do worker permite retomar tarefas sem bloquear a interface; o núcleo permanece um aplicativo modular.

## 8. WhatsApp, agente e MCP

Fluxo proposto: **mensagem recebida → persistência durável → fila → triagem contextual → solicitação existente/nova ou revisão → fila de atendimento → humano no CRM → fila de saída → resposta pelo WhatsApp**.

### 8.1. Conversa e solicitação

Uma conversa é o histórico do canal com um contato; uma solicitação é uma demanda com protocolo, situação, responsável e resultado. Uma pessoa pode conversar sobre solicitações diferentes no mesmo número, e um telefone pode ser utilizado por mais de uma pessoa.

Encerrar o atendimento da conversa na caixa não conclui automaticamente a solicitação. A mensagem pode complementar uma demanda já concluída sem reabri-la automaticamente. O responsável atual pela conversa e o responsável pela solicitação são controles distintos.

O agente reúne mensagens próximas e consulta o contexto autorizado antes de classificar. Usa protocolo citado, assunto, respostas a mensagens anteriores e solicitações abertas como evidências. Afinidade de assunto ou uma estimativa de confiança da IA, isoladamente, não comprova identidade nem vínculo. Reabertura de uma solicitação encerrada segue regra própria a definir.

Saudação isolada pode ficar aguardando a demanda. Se uma mensagem tratar de vários assuntos, o sistema sugere separar ou revisar a vinculação. O atendente pode corrigir a decisão com registro da mudança, mantendo a mensagem original e os vínculos anteriores na auditoria.

### 8.2. Assunção e resposta humana

A proposta inicial é uma fila de conversas para atendentes disponíveis, com responsável único e assunção atômica. Ordenação, prioridade, distribuição automática e capacidade simultânea por atendente precisam ser validadas. Transferências preservam o contexto e deixam explícito quem está responsável. Caso ninguém esteja disponível, a conversa fica na fila; confirmação automática de recebimento depende da política do canal.

O munícipe permanece no WhatsApp. O atendente lê e responde pelo CRM, e a resposta é enviada pelo mesmo número integrado. O sistema distingue mensagem em fila, aceita pelo provedor, entregue e lida quando esses eventos existirem; aceite do provedor não comprova entrega. O agente evita resposta automática concorrente durante a atuação humana. Notas internas ficam separadas de mensagens enviadas ao munícipe.

Mover também o munícipe para um chat no portal é uma alternativa futura: enviar link, validar acesso e associar o histórico permitido. Isso não é necessário para a equipe deixar de responder pelo aplicativo do WhatsApp.

### 8.3. Confiabilidade e ferramentas do agente

O MCP expõe ações pequenas de negócio, como buscar munícipe, abrir atendimento, registrar serviço e consultar protocolo. O recebimento contínuo de mensagens e a execução das tarefas ficam no serviço de integração. O agente tem identidade e permissões próprias.

Registrar o identificador da mensagem e das tarefas para reconhecer repetições. Usar tentativas limitadas com espera progressiva, timeouts e registro de falha. Atualizar o CRM e criar a tarefa correspondente de forma transacional ou por outbox. A fila sozinha não garante ausência de mensagens externas duplicadas: os efeitos precisam tolerar repetição.

Salvar a resposta e a tarefa de envio de forma consistente; em caso de timeout com resultado incerto, reconciliar o estado antes de repetir cegamente. Tratar eventos repetidos ou fora de ordem e recuperar o histórico perdido durante uma queda de conexão da interface. A IA indisponível não impede a entrada da mensagem: o atendente recebe a conversa e classifica manualmente.

A disponibilidade de histórico anterior, mídias, respostas a mensagens, estados de entrega e sincronização com respostas feitas no aplicativo depende do conector escolhido e precisa ser verificada. O planejamento não presume acesso irrestrito ao histórico do aparelho ou transferência automática do usuário para outro canal.

O conector ainda não foi escolhido. WAHA foi pesquisado como candidato gratuito; a Business Platform oficial possui regras específicas para políticos e entidades governamentais, exigindo validação do enquadramento do gabinete. Uma falha temporária pode ser recuperável, enquanto sessão revogada, credencial inválida ou bloqueio pode exigir intervenção.

O CRM precisa continuar útil durante indisponibilidade do WhatsApp ou da IA. Uso de API de IA e da plataforma oficial do WhatsApp pode gerar custos próprios; não está automaticamente incluído no orçamento da VPS.

### 8.4. Tela de conexão, notificação pelo Chrome e reconexão

Requisito confirmado na conversa de 16/11/2026: disponibilizar uma tela de gerenciamento da conexão do WhatsApp; quando perder a conexão, avisar pelo Chrome e permitir que o usuário entre na tela para reconectar. Integra a entrega da caixa WhatsApp. O desenho abaixo é proposto; nenhum monitor, alerta ou conector foi implementado.

**Servidor identifica queda → registra incidente → envia alerta ao Chrome → usuário abre Conexão do WhatsApp → confere a situação atual e solicita reconexão → sistema confirma a sessão ativa e encerra o incidente.**

#### Tela “Conexão do WhatsApp”

- Mostrar conta/número integrado, estado atual, última verificação, início da indisponibilidade, motivo conhecido e tentativas de recuperação. Estados propostos: conectado, reconectando, aguardando autenticação, desconectado, falha e situação desconhecida/sem verificação recente.
- Disponibilizar **Verificar conexão**, **Reconectar WhatsApp**, **Ativar notificações** e **Testar notificação**. Se o conector exigir nova autenticação, mostrar o QR Code ou outro procedimento que ele suportar; renovar QR expirado. Não presumir que todos os conectores usam QR Code.
- Exibir instruções para concluir a autenticação pelo aparelho quando necessário. Abrir a tela não reinicia ou apaga a sessão automaticamente; o usuário aciona a reconexão. Recuperações transitórias podem ocorrer automaticamente em paralelo, conforme a política de tentativas.
- Mostrar andamento, sucesso confirmado ou falha com orientação de próximo passo. Só indicar conectado após confirmação recente do conector; QR exibido ou comando aceito não comprovam conexão. Antes de reconectar, reconsultar a situação, pois outro atendente ou a recuperação automática pode já ter resolvido.
- Garantir uma tentativa de reconexão ativa por canal, mesmo com cliques repetidos ou vários usuários. Não criar sessão concorrente nem trocar o número integrado silenciosamente. Não usar exclusão/reset da sessão como primeira tentativa; eventual ação destrutiva exige fluxo próprio com prévia do impacto.
- Separar permissão de visualizar situação, receber alertas e reconectar. Validar na API, registrar data/hora, usuário/serviço e resultado das tentativas. QR e credenciais ficam restritos aos autorizados e não aparecem em notificações ou logs.

#### Detecção e recuperação do canal

- Monitorar no servidor, independentemente de abas abertas, com eventos do conector e verificações periódicas. Registrar a última evidência e reconciliar eventos repetidos/antigos com o estado atual, evitando que uma desconexão atrasada reabra um incidente já resolvido.
- Distinguir sessão do WhatsApp desconectada, conector indisponível e navegador sem comunicação com o CRM. Sem resposta atual, mostrar situação desconhecida; perda de internet de um atendente não comprova que o WhatsApp caiu.
- Detectar perda confirmada e abrir um incidente por canal; emitir um alerta inicial por destinatário/dispositivo e agrupar repetições, sem notificação a cada checagem. Encerrar quando a recuperação estiver confirmada; nova queda gera novo incidente. Definir limiares e lembretes para evitar alertas oscilando.
- Tentar recuperação automática limitada de falhas transitórias; pedir intervenção quando houver nova autenticação, sessão revogada ou outro impedimento. A tela permite intervenção da equipe sem depender de chamado ao desenvolvedor para o fluxo normal suportado pelo conector.
- Durante a queda, manter o CRM utilizável e as saídas pendentes, sem afirmar entrega. Após reconectar, retomar a fila com reconciliação dos envios incertos e controle de repetição, preservando protocolos, mensagens e atribuições.

#### Notificação pelo Chrome

- Oferecer o botão **Ativar notificações** para solicitar a permissão do navegador a partir da ação do usuário. Notificações exigem permissão e contexto seguro em produção (HTTPS); se negadas, mostrar instrução para ajustar no Chrome e manter aviso persistente dentro do CRM. Base técnica consultada em 16/11/2026: [MDN — uso da Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API/Using_the_Notifications_API).
- Planejar **Web Push e service worker**, além das atualizações ao vivo da tela, para receber o alerta mesmo com a aba do CRM fechada. A detecção e o envio partem do servidor, sem depender do canal WhatsApp indisponível. Base: [web.dev — visão geral de push notifications](https://web.dev/articles/push-notifications-overview).
- O texto pode ser “WhatsApp desconectado. Abra o sistema para reconectar”, sem dados de munícipes ou credenciais. Ao clicar, abrir/focar a tela de conexão; exigir login se a sessão expirou e revalidar o acesso antes de mostrar a conexão. O clique não executa reconexão automaticamente.
- Associar inscrições de alerta a usuário e dispositivo, revalidar permissão de acesso ao canal antes de enviar e invalidar o vínculo no logout/revogação, removendo a inscrição local quando aplicável. Impedir novos envios ao usuário anterior de um computador compartilhado; notificações já em trânsito podem chegar, por isso o conteúdo é mínimo e abrir a tela sempre exige acesso atual e consulta da situação recente.
- Manter o incidente visível no sistema, mesmo sem confirmação da notificação. Aceite pelo serviço push não comprova que a pessoa viu o alerta. Computador desligado/offline, notificações bloqueadas ou navegador totalmente encerrado podem impedir o aviso; verificar o comportamento nos ambientes da equipe. Base: [web.dev — limites com navegador fechado](https://web.dev/articles/push-notifications-faq).
- A queda completa da VPS continua dependendo do monitor externo já previsto; o servidor indisponível não consegue gerar seu próprio alerta Web Push. Essa situação é distinta de uma sessão do WhatsApp desconectada com o CRM funcionando.

Pendências específicas: conector e procedimento real de reconexão, usuários que recebem/gerenciam alertas, limites de tentativas, tempo para declarar queda, lembretes, suporte em segundo plano nos computadores da equipe e serviço de entrega Web Push. As referências sustentam o mecanismo do navegador; os estados, controles e política de incidentes são propostas para o CRM.

## 9. Recuperação e operação

| Falha | Resposta planejada |
| --- | --- |
| Processo cai ou trava | Verificação de saúde e reinício supervisionado com limites. Healthcheck apenas detecta; é necessário configurar o mecanismo de recuperação. |
| Worker é interrompido | Retomar tarefas persistidas e impedir repetição indevida das ações. |
| IA indisponível | Receber a mensagem na caixa de entrada e permitir classificação e resposta humana. |
| Integração de canal indisponível | Manter o CRM operando e preservar fila de saída; registrar incidente, alertar pelo Chrome conforme permissão e permitir reconexão na tela de conexão. Retomar sem afirmar entrega indevida. |
| Atendente desconecta | Preservar a atribuição durante o prazo definido e permitir transferência controlada, sem respostas concorrentes. |
| Implantação falha | Verificar a versão nova antes de liberar; manter/retornar à anterior quando seguro. Migrações precisam preservar compatibilidade. |
| Disco ou memória aproximam-se do limite | Monitorar capacidade, limitar consumo e rotacionar logs. |
| Dados são apagados ou corrompidos | Recuperação supervisionada por backup testado; não restaurar automaticamente sobre dados válidos. |
| VPS inteira fica indisponível | Detectar externamente e reconstruir/restaurar. Continuidade automática exige outra infraestrutura disponível. |

Backups incluem banco, anexos e configuração, com cópias fora da VPS e testes de restauração. Backup recupera dados; réplica com failover trata disponibilidade. Monitoramento externo precisa continuar funcionando quando a VPS cair.

A meta é reduzir chamados e recuperar falhas conhecidas. Atualizações de segurança, bugs e mudanças dos fornecedores continuam exigindo acompanhamento técnico. Tempo de recuperação, perda aceitável de dados e metas de desempenho ainda precisam ser definidos.

## 10. Ferramentas gratuitas pesquisadas

Pesquisa discutida na conversa em 16/11/2026. Valores, recursos e limites de planos podem mudar; a contratação/configuração exige nova conferência. Nenhuma ferramenta abaixo foi instalada por este planejamento.

| Ferramenta | Uso e condição |
| --- | --- |
| [Coolify](https://coolify.io/docs/usage) | Painel self-hosted gratuito; servidor, atualizações, backups e operação ficam sob nossa responsabilidade. |
| [Dokploy](https://docs.dokploy.com/docs/core/differences) | Alternativa com núcleo self-hosted gratuito. Recursos empresariais específicos são pagos. |
| [pg-boss](https://github.com/timgit/pg-boss) | Fila no PostgreSQL para o backend próprio; evita Redis inicialmente. |
| [UptimeRobot](https://help.uptimerobot.com/en/articles/11604710-who-should-use-uptimerobot-s-free-plan) | Plano gratuito permite uso comercial; 50 monitores e intervalo de cinco minutos na consulta realizada. Detecta/avisa, sem recuperar o servidor sozinho. |
| [Uptime Kuma](https://github.com/louislam/uptime-kuma) | Monitoramento self-hosted. Se estiver na mesma VPS, cai com ela; complemento opcional. |
| [pgBackRest](https://pgbackrest.org/user-guide.html) | Backups e recuperação do PostgreSQL. Requer armazenamento externo e testes. |
| [restic](https://restic.net/) | Cópias criptografadas de anexos e configurações; usar backup próprio para consistência do banco em execução. |
| [Cloudflare R2](https://developers.cloudflare.com/r2/pricing/) | Possível destino externo com franquia Standard de 10 GB-mês e limites de operações. Excedentes são cobrados. |
| [WAHA](https://waha.devlike.pro/blog/waha-2026-6/) | Candidato para WhatsApp; o anúncio consultado informa disponibilização gratuita dos antigos recursos Plus. Conector ainda pendente. |
| [Chatwoot Community](https://www.chatwoot.com/pricing/self-hosted-plans) | Caixa de atendimento pesquisada, com edição gratuita e recursos pagos separados. A proposta atual é implementar a caixa no nosso CRM; pode servir de referência de experiência. |

Avaliações registradas na pesquisa: [Coolify no Product Hunt](https://www.producthunt.com/products/coolify), 5/5 em 41 avaliações; [Dokploy no Product Hunt](https://www.producthunt.com/products/dokploy), 5/5 em 10; [EspoCRM no G2](https://www.g2.com/products/espocrm/reviews), 4,5/5 em 29; [Chatwoot no G2](https://www.g2.com/products/chatwoot/reviews), 4,5/5 em 16. Amostras pequenas não demonstram, sozinhas, confiabilidade operacional. A decisão de construir o próprio CRM permanece confirmada.

## 11. O que aproveitar do EspoCRM

As fontes abaixo são referências de produto e engenharia. As aplicações descritas são propostas nossas.

| Referência oficial | Ideia para implementar |
| --- | --- |
| [Interface](https://www.espocrm.com/user-interface/) e [layouts](https://docs.espocrm.com/administration/layout-manager/) | Ficha integrada, registros relacionados e criação contextual. |
| [Cases](https://docs.espocrm.com/user-guide/case-management/) | Atendimento separado da pessoa, com situação e responsável. |
| [Stream](https://docs.espocrm.com/user-guide/stream/) | Linha do tempo de observações e eventos. |
| [Atividades](https://docs.espocrm.com/user-guide/activities-and-calendar/) | Próxima ação, prazos e lembretes. |
| [Busca](https://docs.espocrm.com/user-guide/search-in-lists/) | Filtros úteis e atalhos frequentes. |
| [Duplicidade](https://docs.espocrm.com/development/duplicate-check/) e [fusão](https://docs.espocrm.com/user-guide/merging-records/) | Sugestões e comparação antes de unir registros. |
| [Permissões](https://docs.espocrm.com/administration/roles-management/) e [campos](https://docs.espocrm.com/administration/fields/) | Acesso por operação/registro e auditoria. |
| [Edição concorrente](https://docs.espocrm.com/user-guide/optimistic-concurrency-control/) | Prevenir perda silenciosa de alterações. |
| [API](https://docs.espocrm.com/development/api/), [jobs](https://docs.espocrm.com/administration/jobs/) e [MCP](https://www.espocrm.com/extensions/mcp/) | Centralizar regras e executar integrações em segundo plano. |

## 12. Ordem proposta de implementação

1. Validar o fluxo principal pelo WhatsApp, a caixa de entrada, os conceitos de conversa/solicitação, os estados e a distribuição entre atendentes. Pesquisar e verificar o conector em paralelo.
2. Implementar dados, autenticação/permissões, cadastro com duplicidade assistida e recepção durável de mensagens.
3. Entregar o ciclo humano completo: fila, assunção, conversa no CRM, envio pelo WhatsApp, vínculo ao protocolo, transferência, tela de conexão, alerta pelo Chrome e reconexão pela equipe.
4. Adicionar triagem por IA para classificar contexto e associar/criar solicitações segundo a política; manter revisão e funcionamento manual. Expor ferramentas MCP quando úteis ao agente.
5. Completar serviços, pendências, anexos e histórico; implementar e verificar auditoria, reversão e edição concorrente junto de cada operação, incluindo fusão/incorporação e recuperação de arquivos.
6. Configurar operação e comprovar recuperação de processo, tarefa interrompida, integração indisponível e restauração de backup antes do uso em produção.
7. Evoluir importação, relatórios e portal conforme as prioridades confirmadas.

Frente adicionada na v0.3, com posição no cronograma a definir: entregar juntos o formulário público, o armazenamento temporário e a tela de conferência, com criação/incorporação, vínculo ao evento e auditoria. Não disponibilizar a coleta sem um caminho interno de tratamento dos envios.

As etapas não têm prazos ou percentuais de conclusão definidos. Nenhuma implantação está pronta.

## 13. Critérios de verificação

- Cadastrar familiares com o mesmo telefone e endereço mantendo pessoas e históricos distintos.
- Cadastrar homônimos e pessoas sem documento, nascimento ou telefone.
- Apresentar possível duplicidade por grafia com motivos e revisão humana.
- Registrar vários serviços em um atendimento sem duplicar a contagem de atendimentos.
- Impedir sobrescrita silenciosa quando duas pessoas editam o mesmo registro.
- Aplicar permissões ao consultar dados, baixar anexos, exportar e unir cadastros.
- Retomar tarefa após reinício sem repetir indevidamente o efeito externo.
- Manter atendimento manual funcionando quando a integração falha.
- Detectar falha total da VPS por monitor externo e demonstrar restauração dos dados.
- Associar uma resposta sobre uma demanda existente ao protocolo correto, sem criar nova solicitação a cada mensagem.
- Criar uma nova solicitação quando um assunto novo estiver identificado; saudações e mensagens sucessivas não geram protocolos indevidos.
- Encaminhar identidade incerta, múltiplas solicitações candidatas e vários assuntos para revisão, com evidências da sugestão.
- Impedir que dois atendentes assumam simultaneamente a mesma conversa, inclusive em requisições concorrentes.
- Manter o munícipe no WhatsApp e demonstrar envio da resposta produzida no CRM, com estados de saída coerentes com o provedor.
- Suspender respostas automáticas concorrentes após assunção humana e separar notas internas de mensagens externas.
- Tratar desconexão de atendente, ausência de equipe disponível e transferência sem perder atribuição ou contexto.
- Receber e exibir mensagens mesmo com IA indisponível; retomar atualizações após reconexão da interface.
- Enviar o formulário como pessoa nova ou existente e receber a mesma confirmação, sem pesquisa pública, preenchimento com dados internos ou exposição de cadastros/participantes pela API.
- Criar um munícipe a partir de um temporário e incorporar outro ao existente, escolhendo campos e preservando ID, contatos anteriores, histórico e origem.
- Manter homônimos e familiares separados na conferência; identidade incerta permanece pendente. Campo vazio não apaga informação existente.
- Preservar participações em eventos diferentes; tratar reenvio do mesmo evento sem duplicar a contagem e sem confundir inscrição com presença.
- Repetir confirmação e simular dois revisores no mesmo item sem duplicar efeitos; detectar mudança concorrente no destino e reavaliar candidatos entre envios distintos.
- Encerrar/revogar um formulário impede novos envios; usuários internos sem permissão não consultam ou integram temporários. Participação não cria atendimento ou serviço automaticamente.
- Abrir a ficha com nenhuma, uma ou várias fotos; manter o cabeçalho utilizável e navegar na ordem definida, começando pela principal, pelo teclado e no celular.
- Ocultar e mostrar o carrossel sem apagar fotos ou esconder nome, ID e ações; lembrar a preferência do usuário sem afetar outro atendente.
- Impedir consulta e gerenciamento de fotos sem permissão, inclusive pelo acesso direto aos arquivos; registrar alterações da galeria.
- Incluir várias fotos, documentos e outros anexos no mesmo atendimento; conferir protocolo, metadados e evento da inclusão no histórico.
- Ampliar fotos, visualizar formatos suportados e baixar arquivos sem prévia, sempre respeitando as permissões do atendimento, inclusive no acesso direto.
- Manter fotos anexadas ao protocolo separadas do carrossel do munícipe; quando houver origem WhatsApp, preservar a mensagem e associar à solicitação correta.
- Simular falha de upload sem perder os dados do atendimento ou apresentar arquivo incompleto como disponível; permitir nova tentativa.
- Verificar histórico com data/hora, responsável, origem, alvo, resultado e antes/depois em operações representativas de todos os módulos; distinguir usuário, serviço, IA e envio público não autenticado.
- Reverter edição, situação, conclusão, remoção recuperável e criação sem dependências, preservando a atividade original, a justificativa e a identificação de quem reverteu.
- Reverter fusão e incorporação com seus campos e vínculos; detectar dependências posteriores e impedir perda ou atribuição silenciosa de novos dados.
- Detectar conflito com alteração posterior e preservar campos independentes; repetir a confirmação e disputar reversão em paralelo sem duplicar efeitos.
- Impedir reversão sem permissão atual, alteração do log e exposição de valores antigos sem acesso; restaurar foto/anexo somente com arquivo preservado dentro do prazo.
- Mostrar limites de eliminação definitiva, download/exportação e mensagem entregue; coordenar cancelamento antes da execução externa e registrar correção pendente/falha quando aplicável, sem falsa indicação de que o efeito externo foi desfeito.
- Simular queda da sessão com CRM funcionando: servidor detecta, registra um incidente e alerta pelo Chrome os destinatários habilitados, sem repetir o aviso a cada verificação; confirmar recuperação e identificar nova queda como outro incidente.
- Testar notificação permitida/negada, aba fechada, navegador encerrado, computador offline, logout e revogação de acesso; manter aviso interno e não prometer entrega quando o dispositivo não puder receber.
- Abrir o alerta leva à tela de conexão com login/permissão revalidados; conferir estado atual, fluxo de autenticação suportado e QR expirado quando aplicável, sem reiniciar ao apenas abrir a tela.
- Disputar reconexão entre usuários ou repetir cliques mantém uma tentativa por canal; histórico registra autor, data/hora e resultado sem QR ou credenciais. Confirmar sucesso pelo conector, não apenas pelo comando aceito.
- Diferenciar falha de internet do atendente de queda do WhatsApp; preservar fila e reconciliar saídas incertas ao recuperar, sem duplicar mensagens. Monitoramento externo cobre separadamente indisponibilidade total do CRM.
- Gerar etiquetas a partir da ficha ou seleção de munícipes, exigindo formato Pimaco ou personalizado e iniciando com template de nome/endereço.
- Editar o padrão, incluir campos e salvar novo template sem substituir o anterior; reverter alterações e detectar edição concorrente.
- Conferir grade/margens/espaçamentos de um gabarito Pimaco verificado e de um personalizado; impedir medidas/grade inválidas, testar impressão em tamanho real e calibração.
- Validar campos vazios, endereço incompleto, nomes longos, cópias, mudança de formato e início em folha parcialmente usada, incluindo continuação correta nas próximas folhas.
- Impedir geração/download de dados ou campos sem acesso; conferir arquivo versus prévia e versões e registrar autor/data/quantidade sem declarar impressão física concluída sem confirmação.
- Combinar sexo, nascimento, classificação e busca geral; testar qualquer/todas as classificações, sem classificação, dados ausentes e vínculos inativos sem duplicar pessoas/totais.
- Reutilizar dia/mês/ano/composição/intervalo nos filtros de todas as telas; testar aniversariantes sem ano, ano isolado, data exata, 29/02, limites inclusivos, período aberto, virada do ano/fuso e datas inválidas.
- Cadastrar, renomear e inativar classificação preservando vínculos; alterar e reverter observações extensas sem corte e com autor/data.
- Encontrar pessoa por campo do cadastro, observação e texto existente apenas no atendimento autorizado; mostrar motivo/protocolo, normalizar acentos/caixa/contatos e devolver um resultado por pessoa.
- Impedir vazamento por atendimento, campo, mensagem familiar, trecho ou contagem sem acesso; filtros de características de um atendimento devem coincidir no mesmo pedido.
- Atualizar resultados após edição, arquivamento ou reversão; manter a seleção autorizada do relatório consistente ao gerar etiquetas.
- Enviar/gravar áudio, transcrever, reproduzir, revisar e acrescentar às observações sem apagar conteúdo existente; salvar com autor/data/origem, buscar pelo texto aceito e reverter a alteração.
- Negar microfone, cancelar, falhar no envio/processamento ou enviar formato inválido mantém digitação e conteúdo anterior; rascunhos não confirmados não entram na busca.
- Testar troca de ficha durante o processamento, edição concorrente, repetição de confirmação e perda de acesso, impedindo aplicação à pessoa errada, sobrescrita de alterações e inserção duplicada.
- Diferenciar ausência de histórico, contato recente/frequente e pessoa antes frequente sem contato; várias mensagens no dia não inflam frequência e eventos repetidos não inflam volume.
- Editar cadastro, registrar serviço sem conversa ou enviar mensagem sem resposta não renova contato efetivo. Ligação atendida, conversa presencial e mensagem recebida identificada atualizam conforme data do ocorrido.
- Atualizar janelas/dias com passagem do tempo e recalcular após vínculo corrigido, fusão ou reversão; indicar histórico incompleto/acesso parcial sem expor registros restritos.
- Listar retornos vencidos, primeiro contato e retomada com motivo; registrar tentativas sem resposta, evitar tarefa duplicada e respeitar preferência de não contato sem disparo automático.
- Listar como raízes apenas pessoas sem indicador e com indicados acessíveis; navegar paginado por filhos diretos, voltar pelos níveis e identificar o fim de cada ramo sem carregar a rede inteira.
- Bloquear indicação para si, pessoa inexistente, instituição/usuário de login e ciclos diretos/indiretos, inclusive sob mudanças concorrentes. Trocar/remover pai preserva os filhos da pessoa; fusão/reversão revalida a rede.
- Ocultar relações/contagens sem acesso e não tratar pai inacessível/arquivado como ausência. Marcação manual tem permissão própria, autor/data e reversão, sem inferência ou exposição pública.

## 14. Pendências

- Nome definitivo e identidade visual do produto.
- Volume de usuários simultâneos, registros e anexos; características da VPS.
- Catálogo de serviços, fluxo real, situações e prazos operacionais.
- Regras de acesso de cada integrante da equipe.
- Prioridade de anexos, importação, exportação e portal no primeiro lançamento.
- Metas mensuráveis de desempenho, memória, recuperação e perda aceitável de dados.
- Destino, retenção e capacidade dos backups externos dentro do orçamento.
- Conector WhatsApp, enquadramento da conta, alcance do agente e modelo de IA/custo.
- Compatibilidade do conector com histórico, mídia, estados de envio/entrega e respostas feitas fora do CRM.
- Critérios de nova solicitação, continuidade, múltiplos assuntos e reabertura; limites da classificação automática.
- Disponibilidade, horário, capacidade e política de distribuição/transferência dos atendentes.
- Conteúdo e regras de confirmação automática quando a equipe estiver ausente.
- Necessidade posterior de levar também o munícipe ao chat do portal, com link e acesso autenticado.
- Contratação e responsabilidades de operação, atualização e incidentes excepcionais.
- Prioridade de entrega do cadastro público, campos mínimos por formulário e finalidade de cada lista: inscrição ou presença.
- Quem pode administrar links, conferir, incorporar dados e descartar; critérios de confirmação de identidade, retenção de temporários e tratamento de envios indevidos.
- Fotos do munícipe: prioridade de entrega, permissões de gerenciamento e limites de quantidade, tamanho e formatos.
- Anexos dos atendimentos: limites de tamanho e quantidade, formatos permitidos/prévias e regras de retenção e remoção.
- Histórico e reversão: retenção de auditoria, prazo de recuperação de registros/arquivos, matriz de permissões, regras de dependências e caminhos de compensação de cada integração.
- Conexão do WhatsApp: destinatários/permissões, procedimento do conector, limiares de queda/recuperação, limites de tentativas e lembretes, serviço Web Push e validação dos computadores/navegadores da equipe.
- Etiquetas: prioridade de entrega, códigos Pimaco e gabaritos iniciais, permissões/compartilhamento de templates, campos adicionais, limites de lote, retenção dos arquivos e impressoras/calibração.
- Relatório e busca de munícipes: opções de sexo, permissões de classificações/observações, colunas iniciais, tamanho da observação, volumes/metas de busca, alcance das mensagens e extração de conteúdo de arquivos.
- Áudio para observações: serviço/modelo local ou externo e custo, formatos/tamanho/duração, retenção de áudio/rascunhos, suporte a gravação nos dispositivos e prioridade de entrega.
- Interações e retomada: janela/faixas de frequência, prazo de inatividade, ordem da fila, intervalo entre tentativas, responsáveis, cobertura histórica, permissões e prioridade. Valores sugeridos são exemplos, não regras aprovadas.
- Indicações e anotação manual: prioridade de entrega, matriz de permissões e apresentação de ramos arquivados. Controles de ciclo e de acesso integram o contrato, mas precisam de implementação e testes de domínio.

Fonte de contexto: conversa de planejamento e estudo local registrado em `/home/vini/.agents/projects/gabinete-crm.md`. Este documento passa a manter o planejamento junto ao projeto.

## 15. Contrato documental da API

Revisão confirmada na conversa de 16/11/2026: refazer a documentação a partir das telas e ações do frontend, somente com rotas necessárias e payloads completos. Planejamento **v0.14**, contrato **1.0.0-draft.3**, proposto e não implementado. A documentação ativa substitui a draft.2 fragmentada em CRUDs; versões anteriores são histórico do planejamento, sem backend/clientes implantados.

- [Referência offline por tela e ação](api/index.html): **88 operações em 79 caminhos**, com finalidade, parâmetros, entrada, saída, exemplos e permissões.
- [OpenAPI YAML](api/openapi.yaml) e [JSON equivalente](api/openapi.json): contrato exclusivo do frontend interno/público, OpenAPI 3.1.1.
- [26 cenários completos](api/cenarios.md) e [manifesto verificável](api/cenarios.json): montagem, preparação opcional, confirmação e acompanhamento com orçamento explícito de chamadas.
- [Cobertura por tela](api/cobertura.md), [fluxos e payloads](api/fluxos.md), [requisições HTTP](api/exemplos.http), [regras](api/regras-negocio.md), [convenções](api/README.md) e [referência Markdown](api/referencia.md).
- [Integrações técnicas](api/integracoes.md): saúde e webhook do adaptador em outro contrato, com dois consumidores técnicos reais. Não entram na contagem do frontend.
- [Mudanças da revisão](api/mudancas.md), [direção MCP](api/mcp.md) e [validação documental](api/validacao.md).

**Confirmações completas:** POST /municipes recebe pessoa e todos os blocos preenchidos; PATCH salva os blocos alterados. Um POST /atendimentos recebe pedido, serviços, pendências, notas, anexos, vínculos de mensagens e pessoa nova completa inline quando necessário. Identidade incerta permanece a_identificar com contato/conversa. Um comando de conferência cria/incorpora pessoa, participação e decisão. Não há POST obrigatório de cada filho/associação.

**Leituras prontas:** uma ficha entrega formulário, ETag, referências com nomes, contexto, ações, URLs e resumos. Listas já trazem os dados para desenhar cada linha. Salvamento retorna a ficha atual, sem GET obrigatório depois. Histórico extenso e autocomplete grande são consultas por interação real, sem multiplicar GET por mensagem/linha.

**Bytes e tarefas:** upload em lote por rascunho local, sem entidade vazia antecipada; o Salvar publica referências a bytes já persistidos. Áudio é enviado e transcrito em uma chamada, mesmo antes de existir pessoa, revisado e mesclado localmente e enviado no Salvar normal, sem concatenação duplicada. Etiquetas usam um comando com seleção e layout/formato salvo ou em rascunho, gerando um PDF imutável para prévia e impressão; salvar biblioteca é opcional.

**Convenções propostas:** base /api/v1, JSON camelCase, sessão same-origin em cookie HttpOnly/Secure/SameSite com CSRF, login já devolvendo App e GET /app para retomada. Esta proposta substitui o fluxo anterior de tokens na UI. ETag opaco por agregado/item já presente nas fichas/linhas, idempotência por intenção, erros Problem Details e exclusão lógica. Campos restritos são validados antes da transação; coleções só são substituídas com acesso ao conjunto inteiro. SSE entrega DTOs tipados e GET /operacoes/{id} é fallback compartilhado de progresso.

Indicação e anotação manual restrita fazem parte do Salvar da pessoa, sob permissões específicas, sem endpoint de vínculo separado. Relatório de indicações usa um GET: sem indicadorId abre raízes; com ele abre filhos diretos e caminho. As regras de acesso, prevenção concorrente de ciclos e ausência de inferência/automação da anotação continuam válidas.

Importação, exportação, filtros pessoais, portal e relatórios personalizados permanecem no planejamento futuro, **sem rotas publicadas**. MCP compartilha serviços de aplicação e autorização; não recebe SQL livre nem gera endpoints preventivos sem consumidor. Conector, autenticação final de integrações, limites, retenção, metas e política de IA continuam pendências de implementação.

Fontes editáveis: scripts/api_contrato.py (schemas e ações explícitas), scripts/api_render.py (referência/cenários), scripts/gerar_documentacao_api.py e guias humanos. scripts/validar_documentacao_api.py verifica ambos os contratos, exemplos, vínculos de cenários, HTML/JS e links. Isso não comprova implementação, atomicidade de banco, permissões reais ou WhatsApp funcionando.

Referências normativas já consultadas na elaboração anterior: [OpenAPI 3.1.1](https://spec.openapis.org/oas/v3.1.1.html) e [RFC 9457 — Problem Details](https://www.rfc-editor.org/rfc/rfc9457.html). Não é alegação de versão mais recente ou de nova pesquisa nesta revisão.

## 16. Primeira home do frontend — v0.15

Pedido confirmado em 17/11/2026: iniciar somente a home em Angular 22 com tudo mockado para avaliação visual, seguindo as instruções oficiais de IA e configurando MCP. Não implementar os outros módulos ou backend nesta etapa.

Implementado em `frontend/`: caixa de atendimento com navegação, indicadores, filtros/busca, seleção de conversa, mensagens, resposta/nota interna, anexos simulados e contexto do munícipe/pedido. Assunção, transferência, encerramento/reabertura, disponibilidade e queda/reconexão do canal são simulações em memória. Interface desktop e celular; formulários de cadastro e telas dos outros módulos não foram implementados.

Dados fictícios e restaurados ao recarregar; anexos mantêm apenas metadados, sugestões são textos prontos e notificações são locais da interface. Não há login, upload, backend, IA, conexão WhatsApp ou envio de mensagens real. A home usa componentes → serviço → repositório mock, com mockEnabled=true inclusive no build de produção.

Instruções de execução em [frontend/README.md](../frontend/README.md), em http://127.0.0.1:4300 com npm start. O documento index.html da raiz continua sendo planejamento. O contrato draft.3 originado na v0.14 permanece proposto e sem implementação de API.

MCP: servidor oficial do Angular CLI 22.2.7 instalado com o projeto; cliente SDK v2 confirmou protocolo 2026-07-28, list_projects e get_best_practices para o framework 22.2.6. Configurações locais do projeto para Codex e VS Code. Guia oficial gerado em frontend/AGENTS.md e complementado com templates externos, sinais/Signal Forms, @Service e defaults standalone/OnPush/zoneless. Esse é MCP de desenvolvimento Angular; não implementa o MCP de negócio do CRM.

Fontes consultadas: [introdução MCP indicada](https://modelcontextprotocol.io/docs/2026-07-28/getting-started/intro), [prompts e instruções do Angular](https://angular.dev/ai/develop-with-ai#custom-prompts-and-system-instructions), [MCP do Angular CLI](https://angular.dev/ai/mcp) e [cliente MCP SDK v2](https://ts.sdk.modelcontextprotocol.io/v2/clients/connect). Resultado das verificações em [frontend/validacao.md](../frontend/validacao.md).

## 17. Home simplificada e ordem do frontend — v0.16

Pedido confirmado em 17/11/2026: guardar o bloco de conversas para depois e alterar somente a home para uma grade clara, com botões quadrados, dois por linha no celular, cada um com ícone e nome. Ordem de implementação confirmada: **Munícipes → Kanban → Solicitações → Conversas → Projetos de lei → Leis → Configurações → Relatórios**. Novos módulos legislativos e Kanban ficam registrados para desenho posterior; nenhum endpoint ou tela desses módulos foi criado nesta etapa.

No lugar do breadcrumb do cabeçalho, busca de munícipes disponível em todas as futuras telas. Implementada no layout raiz fora do router-outlet, com busca fictícia por nome/telefone e resumo, sem cadastro de munícipes ou API. Desktop com quatro colunas; celular com duas. Os botões informam Em breve enquanto o módulo não é implementado.

O protótipo de conversas permanece em frontend/src/app/features/inbox. [Cópia completa com manifesto de integridade](prototipos/README.md) guarda código, estilos, configuração, imagens e testes da v0.15, para reutilização na quarta etapa. Os cenários de navegador antigos foram preservados fora da suíte atual. A caixa deixa de ser a home; ao retomar, adaptar ao novo cabeçalho compartilhado.

Decisão duradoura e próximos passos em [.agents/roadmap-frontend.md](../.agents/roadmap-frontend.md). Build e verificações desta entrega em [frontend/validacao.md](../frontend/validacao.md).
