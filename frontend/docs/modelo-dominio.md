# Objetos do Gabinete CRM

Consolidação do planejamento em **18/11/2026**, a partir das decisões do usuário nesta conversa. Referência para desenhar as próximas telas, seus formulários e ações.

Este documento descreve o modelo de negócio. Não é um esquema de banco, contrato de API implementado ou autorização para iniciar novos módulos. Os campos apresentados orientam o planejamento; obrigatoriedade, estados e permissões detalhadas serão definidos nas respectivas telas.

## Decisões consolidadas

- Trabalhar com **sete objetos principais**: Pessoa/Munícipe, Interação, Solicitação, Tarefa, Documento, Usuário da equipe e Automação de tarefas.
- **Conversa faz parte de Interação**, como um de seus tipos. Não manter Registro e Conversa como dois objetos principais concorrentes.
- **Comentário tem estrutura própria e reutilizável**, com respostas que também podem receber respostas. É um objeto de apoio aos principais, sem exigir um módulo no menu.
- Mensagens, comentários, arquivos e execuções de automação podem ter registros próprios. A quantidade de objetos principais não determina a quantidade de tabelas ou classes técnicas.
- Linha do tempo, Kanban e relatórios são visões dos dados, sem duplicar os objetos que apresentam.
- **A criação de qualquer objeto é um gatilho disponível para automações futuras**, incluindo objetos principais e registros de apoio. As tarefas só serão geradas se houver uma automação habilitada e suas condições forem atendidas.
- A aplicação continua como protótipo com mocks. Autenticação, autorização e integrações reais ficam para etapas posteriores.

## Os sete objetos principais

| Objeto                   | Responsabilidade                                                      | Informações e relações de referência                                                                                                                                                  |
| ------------------------ | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pessoa / Munícipe**    | Cadastro de quem se relaciona com o gabinete.                         | Nome, dados pessoais, vários telefones, e-mails, endereços, fotos, redes sociais e observações. Participa de interações e pode estar ligado a várias solicitações.                    |
| **Interação**            | Relacionamento ou contato com pessoa ou sobre uma solicitação. Inclui conversas. | Tipo, participantes, data/hora, título, resumo, responsável, setor e iniciativa do contato. Cada tipo possui seus detalhes específicos. Pode existir sem solicitação.                 |
| **Solicitação**          | Demanda que precisa de acompanhamento e resultado.                    | Solicitante opcional, munícipes vinculados para ciência, protocolo, assunto, categoria, departamento relacionado, situação e resultado. Reúne interações, tarefas, documentos e comentários pertinentes. |
| **Tarefa**               | Trabalho a ser realizado por uma ou mais pessoas.                                  | Título, descrição, responsáveis (IDs de um ou mais usuários), prazo, prioridade, situação e dependências. Pode ser manual ou criada por automação, vinculada a uma solicitação/documento/interação ou independente. |
| **Documento**            | Documento com identificação e andamento próprios.                     | Tipo, título, número/ano quando aplicável, conteúdo, arquivos, situação e relações com pessoas, solicitações, tarefas e outros documentos.                                            |
| **Usuário da equipe**    | Identidade de acesso e atuação no sistema.                            | Conta, referência à pessoa quando aplicável, equipe, perfil/permissões e situação de acesso. Pode ser autor ou responsável por registros.                                             |
| **Automação de tarefas** | Configuração que cria tarefas após um acontecimento.                  | Nome, gatilho, condições, conjunto de tarefas-modelo, responsáveis, prazos relativos e dependências. Cada disparo gera uma execução rastreável.                                       |

### Pessoa, funcionário e usuário

**Listagem autorizada em 18/11/2026:** `/municipes` consulta os mesmos cadastros das fichas, com busca por nome/telefone/CRA/bairro, por todas as classificações/categorias vinculadas e pelo texto completo das observações, incluindo edições salvas na ficha, filtros por bairro/categoria/situação dos pedidos e ordenação por nome ou última interação. É uma projeção leve com identificação, contato, categorias e contadores; não representa um novo objeto de negócio nem exige transportar históricos completos. Última interação é derivada dos contatos, sem usar comentários, edições de notas ou vínculos de ciência como se fossem contatos efetivos. Contadores de solicitações mantêm a distinção entre solicitante e destinatário de ciência. A listagem não introduz cadastro, backend ou autenticação.

**Filtro por categorias — decisão de 18/11/2026:** a consulta de munícipes combina listas de categorias incluídas e excluídas. A inclusão exige todas por padrão, com opção de aceitar qualquer uma; a exclusão elimina quem possuir qualquer categoria do grupo e prevalece sobre a inclusão. Uma categoria não fica simultaneamente nos dois grupos: escolhê-la no outro move o critério. São critérios de consulta, não novos vínculos da pessoa nem cadastros de categoria; usam o catálogo existente, incluindo categorias sem pessoas vinculadas. As escolhas combinam com texto, bairro e situação dos pedidos.

**Filtros de nascimento — pedido de 18/11/2026:** Pessoa possui data de nascimento própria (`birthDate`, ISO `YYYY-MM-DD` ou ausente), preservando a apresentação legível na ficha. A consulta permite faixas etárias 16–24, 25–39, 40–59 e 60+, além de dia e mês do aniversário, isolados ou combinados. Idade é derivada em anos completos na data atual de São Paulo, sem guardar um número que fique desatualizado. Sem data válida, a pessoa permanece na consulta geral, mas não satisfaz esses filtros; combinações impossíveis são informadas, preservando aniversários de 29 de fevereiro.

**Filtros de departamentos de solicitações — pedido de 18/11/2026:** incluir pessoas com pelo menos uma solicitação em qualquer departamento selecionado e excluir quem tiver qualquer solicitação nos departamentos excluídos. Departamento e situação da inclusão precisam pertencer ao mesmo pedido; exclusões consideram qualquer situação. Usar os IDs do catálogo compartilhado e os vínculos de solicitante, sem confundir destinatários de ciência com quem fez o pedido. A projeção da lista contém somente departamento/situação dos pedidos para aplicar o filtro, sem carregar os respectivos históricos. Os critérios combinam com idade, aniversário, categorias e texto.

**CRA — campo definido pelo usuário em 18/11/2026:** identificador do munícipe na Secretaria de Saúde. É um campo próprio de Pessoa/Munícipe, exibido ao final de Dados pessoais na parte inferior da ficha. Preservar como texto, incluindo possíveis zeros à esquerda; quando ausente, apresentar “Não informado”. Os valores do protótipo são fictícios. Formato, máscara e regras de validação serão definidos posteriormente, sem integração com a Secretaria de Saúde nesta etapa.

Telefones, e-mails, endereços, fotos e redes sociais são coleções do cadastro, não um novo módulo para cada campo. Um meio de contato pode ser compartilhado por pessoas; o número de telefone não comprova sozinho a identidade de um munícipe.

Funcionário é um vínculo com a equipe; usuário é uma conta de acesso. O cadastro operacional pode referenciar a mesma Pessoa sem repetir dados pessoais. Uma pessoa sem login não deve ganhar uma conta apenas para aparecer como funcionário ou participante. A necessidade de um cadastro funcional separado, além das informações operacionais de equipe, permanece pendente; não introduzir um módulo de RH antecipadamente.

### Solicitação e atendimento

Usar **Solicitação** para o pedido com acompanhamento/protocolo. Usar **atendimento pontual** como tipo de Interação para uma orientação ou contato realizado.

Exemplo: uma pessoa pede manutenção da iluminação. Isso abre uma Solicitação; a ligação de retorno é uma Interação; preparar o ofício é uma Tarefa; o ofício é um Documento.

Encerrar uma conversa, concluir uma tarefa ou encaminhar um documento não significa automaticamente concluir a solicitação. Cada objeto preserva seu andamento.

### Tela de solicitação — decisões aprovadas em 18/11/2026

**Solicitante opcional e Ciências — decisão do usuário em 18/11/2026:** uma solicitação pode ser criada pelo gabinete sem ter sido feita por um munícipe específico. Não criar um cadastro de pessoa fictício para preencher essa ausência. O vínculo ao solicitante é opcional e independente dos destinatários de ciência. O exemplo `/solicitacoes/request-praca-acessivel` representa adequações de acessibilidade identificadas pela equipe em visita à praça.

**Ciências** são outros munícipes vinculados para receber ciência da propositura, em qualquer solicitação, com ou sem solicitante. É uma relação de apoio entre Solicitação e Pessoa, não um oitavo objeto principal. Cada vínculo mantém ID, referência ao munícipe, autoria e data de criação; nome e dados de contato continuam no cadastro da pessoa. Não duplicar o mesmo destinatário em uma solicitação nem acrescentar o próprio solicitante como destinatário adicional. Inclusão e remoção aparecem na linha do tempo da solicitação. Na ficha do destinatário, projetar o vínculo com link à propositura, preservando sua distinção de solicitante e os contadores de pedidos feitos por ele. Remover o vínculo preserva o acontecimento no histórico da solicitação.

No mock, a seção Ciências inclui busca digitável por nome ou telefone, inclusão ao selecionar e remoção com confirmação. O vínculo representa a intenção de dar ciência: não indica que houve envio, entrega, leitura ou confirmação. Comunicado efetivamente realizado será uma Interação com seu registro próprio; não enviar mensagens nesta etapa. A criação de um vínculo de ciência segue a regra geral de gatilho para automações futuras.

Contatos registrados dentro de uma solicitação sem solicitante ficam relacionados à solicitação, sem atribuição automática a todos os destinatários de ciência. Podem ser consultados pela rota própria de interação. Comentários, tarefas, anexos e seus históricos continuam disponíveis nesse cenário.

**Responsabilidade:** a solicitação não tem responsável próprio. A atribuição de responsável fica em cada tarefa relacionada. A autoria de comentários, anexos e acontecimentos históricos permanece registrada separadamente, sem representar responsabilidade pela solicitação.

- Quando houver solicitante, o cabeçalho apresenta um resumo do munícipe: foto pequena, nome com link para a ficha, endereço, CRA e uma linha de observações truncada com reticências. Clicar nessa observação expande ou recolhe o texto completo. Os dados vêm da ficha, sem copiar outro cadastro de pessoa para a solicitação. Sem solicitante, apresentar “Sem munícipe solicitante” e manter os demais dados da demanda.
- **Departamento** é um cadastro de apoio que pode representar secretaria, órgão ou setor. A solicitação tem um departamento relacionado. No cadastro da solicitação, usar busca digitável com opção de cadastrar e vincular quando não existir; reutilizar nomes equivalentes para evitar duplicação. Nos detalhes, departamento e padrão aparecem somente como pills acima da descrição, sem seletores ou card de Classificação. Essa separação foi confirmada pelo usuário em 18/11/2026.
- **Padrão de solicitação** é outro cadastro de apoio: poda de árvore, tapa-buraco, manutenção de iluminação, limpeza de praça etc. Solicitações livres continuam permitidas. O padrão pode sugerir departamento e orientar condições de automações futuras, sem ser a própria automação. Alterar o padrão não modifica tarefas existentes nem dispara um motor de automação no mock.
- **Tarefas** mantêm identificação, responsável, descrição, prazo e estado próprios, vinculados à solicitação. Concluir/reabrir uma tarefa preserva seu histórico e não encerra a solicitação automaticamente.
- A solicitação e o munícipe usam o mesmo componente de linha do tempo. Na solicitação, o histórico é limitado ao seu contexto; na ficha, aparecem os acontecimentos de suas solicitações e demais contatos. Ambos incluem comentários avulsos, respostas, comentários feitos nas tarefas, criação/conclusão/reabertura de tarefas, contatos e atualizações da solicitação.
- Comentários são armazenados uma única vez no contexto de origem, com referência à tarefa quando aplicável e ao comentário pai nas respostas. A projeção do histórico mostra autoria, data e origem, por exemplo “Comentário na tarefa — Preparar ofício”, com link para o trecho correspondente. Comentários internos não recebem a seta de contato ativo/passivo nem contam como nova interação com o munícipe.

**Apresentação confirmada em 18/11/2026:** na tela da solicitação, comentários e respostas aparecem somente na linha do tempo, inclusive os originados em tarefas. Não manter um card “Comentários da solicitação” nem repetir listas dentro dos detalhes das tarefas. Os botões Comentar preservam o contexto de criação; clicar no título de um comentário do histórico abre a resposta com referência ao original. Os cards do histórico da solicitação não exibem o rodapé de metadados. O vínculo à tarefa continua preservado e identificado no título do comentário.

Na implementação mock atual, a solicitação possui uma página própria em `/solicitacoes/:id`; tarefas são consultadas e comentadas dentro dela, com âncoras por ID. A linha do tempo continua começando fechada, com filtro e “+” sempre disponíveis. O “+” cadastra os demais contatos vinculados à solicitação e, quando houver, ao munícipe solicitante. Os novos cadastros e alterações ficam no repositório em memória, preservados ao navegar entre páginas; o catálogo de departamentos é compartilhado. Não há gravação em API, envio de mensagens, execução de automações ou integração com a Secretaria de Saúde.

## Interação, incluindo conversas

**Cadastro rápido na ficha — decisão de 18/11/2026:** o “+” flutuante sempre registra uma Interação. O formulário contém somente a seleção por ícones do canal/tipo de conversa e o texto do que foi conversado. **Conversa pessoalmente** vem selecionada; as demais opções são **WhatsApp, telefone, e-mail, Instagram, Facebook e outros**. São canais da Interação, sem criar novos objetos principais. O registro entra no histórico e atualiza o contador de interações.

No mock atual, data/hora são obtidas ao salvar; autoria vem da equipe fictícia; o título é derivado do canal escolhido. Setor e iniciativa mantêm os padrões do protótipo (Gabinete e ativo), sem pedir esses campos no cadastro rápido. Definir sua origem definitiva com a autenticação e as regras de negócio futuras. O canal é preservado no registro e exibido com seu ícone na linha do tempo.

O “+” ao lado do filtro, no cabeçalho da linha do tempo, abre o formulário dos demais tipos de contato (atendimento, visita, encontro, comunicado, ligação e o tipo visual de solicitação já existente no mock). Filtro e “+” permanecem visíveis e utilizáveis mesmo com o acordeão fechado. Não confundir esse lançamento visual de solicitação com o cadastro completo do objeto Solicitação, que continua para uma etapa posterior.

| Tipo                      | Detalhes próprios                                                             |
| ------------------------- | ----------------------------------------------------------------------------- |
| **Conversa**              | Canal, participantes, atendente, situação da conversa e mensagens vinculadas. |
| **Ligação**               | Número utilizado, resultado da tentativa/contato e resumo.                    |
| **Visita ao gabinete**    | Quem recebeu, assunto e encaminhamentos.                                      |
| **Encontro pessoalmente** | Local, participantes e resumo.                                                |
| **Comunicado**            | Conteúdo, canal, destinatários e evidências de envio quando disponíveis.      |
| **Atendimento pontual**   | Orientação prestada, resultado e possíveis encaminhamentos.                   |

A estrutura comum é compartilhada, mas os detalhes e regras pertencem ao respectivo tipo. Uma visita não precisa carregar campos de entrega/leitura de mensagens, por exemplo.

**Mensagens** são registros filhos da Interação do tipo Conversa. Preservam autor/origem, conteúdo, data, anexos e estado de envio quando aplicável. O histórico deve poder ser carregado em partes, sem devolver todas as mensagens para montar a ficha.

Uma conversa pode tratar de mais de uma solicitação, e uma solicitação pode reunir várias conversas. Vincular o contexto ou as mensagens pertinentes; não presumir que todo o conteúdo de uma conversa familiar pertence a cada pedido relacionado.

**Iniciativa do contato:** ativo = gabinete iniciou; passivo = munícipe iniciou. Na ficha, representar por seta verde/vermelha e rótulo acessível, conforme o padrão visual definido. Esse atributo não se aplica automaticamente a comentários internos ou edições cadastrais.

Contato efetivo, tentativa sem resposta e comunicado enviado têm resultados distintos. Uma nota interna ou alteração de cadastro não atualiza a data de último contato efetivo.

## Comentários e respostas

**Responsabilidade das tarefas — decisão de 18/11/2026:** um card/tarefa aceita vários responsáveis da equipe. A referência é uma lista de IDs de usuários, independente da autoria de criação (`createdBy`), preservada ao reatribuir ou movimentar. O mesmo registro é usado no Kanban e na solicitação, e o filtro por uma pessoa considera qualquer participação na lista. Atribuir não equivale a mencionar e não envia comunicação automaticamente.

**Detalhe do cartão — pedido de 18/11/2026:** tarefas no Kanban apresentam seus próprios comentários com respostas encadeadas e anexos. Comentários feitos no card de uma tarefa relacionada são os mesmos comentários dessa tarefa apresentados na linha do tempo da solicitação, sem duplicar. Arquivo anexado à tarefa mantém seu contexto e não vira Documento oficial automaticamente. Prazo é opcional no cartão. Menções `@` referenciam usuários e geram notificações internas após salvar; links colados de objetos do CRM são apresentados pelo título clicável, sem criar cópias desses objetos nem notificar pessoas por uma referência não pessoal. Notificação é registro de apoio por destinatário com origem e leitura, não novo objeto principal. Toda criação, inclusive comentário/resposta, arquivo e notificação, é gatilho disponível para automação futura. A implementação atual continua mock, sem autorização real ou envio externo; detalhes em [kanban.md](kanban.md).

Comentário é um **objeto de apoio próprio**, compartilhado por Pessoa/Munícipe, Interação, Solicitação, Tarefa e Documento. Não representa mensagem enviada ao munícipe.

Campos lógicos de referência:

| Campo                    | Finalidade                                                                     |
| ------------------------ | ------------------------------------------------------------------------------ |
| `id`                     | Identificar o comentário.                                                      |
| `autorId`                | Identificar quem escreveu.                                                     |
| `texto`                  | Conteúdo da anotação interna.                                                  |
| `criadoEm` / `editadoEm` | Registrar criação e eventual edição.                                           |
| `alvoTipo` / `alvoId`    | Identificar a ficha, tarefa, solicitação, interação ou documento da discussão. |
| `comentarioPaiId`        | Identificar o comentário respondido; vazio no comentário inicial.              |
| Indicação de remoção     | Preservar a estrutura quando o conteúdo for removido.                          |

```text
Ana: A secretaria já respondeu?
  Rafael: Pedi uma atualização hoje.
    Ana: Pode anexar o retorno quando chegar?
      Rafael: Sim, vou incluir aqui.
```

Todas as respostas usam o mesmo objeto Comentário. Não criar tipos separados para resposta, réplica ou resposta de resposta.

Regras para a implementação futura:

- Cada resposta pertence ao mesmo contexto da discussão do comentário pai. Impedir ciclos e referências a comentários de outro contexto.
- A interface pode limitar o recuo visual no celular, preservando a indicação de a quem cada resposta se dirige. O limite técnico de profundidade/paginação ainda será definido.
- Ao remover o conteúdo de um comentário, preservar as respostas e apresentar “Comentário removido”.
- Comentários continuam internos. Não enviar seu conteúdo por WhatsApp nem contá-los como uma nova interação com o munícipe.
- Leitura e escrita precisam respeitar as permissões do objeto relacionado; ter o ID de uma resposta não concede acesso à discussão.

## Documentos e arquivos

Começar com um objeto **Documento**, com os tipos **ofício, requerimento, projeto de lei e lei**. Campos comuns podem ser compartilhados, mantendo formulários, regras e situações específicos de cada tipo conforme necessário.

Um projeto de lei e a lei que ele originou são dois documentos relacionados. Preservar ambos, sem simplesmente transformar o registro do projeto em lei e perder seu histórico.

**Arquivo/anexo** representa os bytes de PDF, imagem ou outro conteúdo. O Documento representa o assunto, a identificação e o andamento. Uma foto de munícipe ou um PDF anexado a uma tarefa não exige, por isso só, um cadastro de Documento oficial. Identificações pessoais como CPF/RG também não se confundem com esses documentos de trabalho do gabinete.

**Anexos da solicitação — pedido de 18/11/2026:** a solicitação possui uma coleção de fotos, áudios e documentos, com ID, nome do arquivo, tipo/MIME, tamanho quando conhecido, referência ao conteúdo, autoria e data de inclusão. A tela mostra o mesmo mosaico de fotos da ficha do munícipe, com contador e visualização ampliada navegável por Anterior/Próxima ou setas do teclado, sem nome do arquivo visível. O componente compartilhado adapta o mosaico à quantidade de fotos e à tela, mantendo todas acessíveis no visualizador. Documentos têm links para abrir/baixar. Áudios possuem player nativo com controles e download, seguindo [anexos.md](anexos.md); a reprodução depende do codec suportado pelo navegador. A adição de um anexo aparece na linha do tempo da solicitação e do munícipe, por projeção do mesmo objeto, e é um gatilho para automações futuras como as demais criações. Anexar um arquivo não cria automaticamente um Documento oficial.

No mock, o botão “+” da seção Anexos permite selecionar vários arquivos. São aceitas fotos JPEG, PNG, WebP, AVIF, GIF e HEIC/HEIF, áudios nos formatos do catálogo compartilhado, PDF e documentos de texto, planilha e apresentação nos formatos definidos em `attachment-files.ts`, com limite de 20 MB por arquivo. A prévia de fotos depende dos formatos suportados pelo navegador; se indisponível, manter a opção de abrir o arquivo. Os arquivos selecionados são referenciados por URLs locais `blob:`, sem conversão para base64, upload, biblioteca de visualização ou persistência no servidor. Permanecem disponíveis ao navegar dentro da sessão e são descartados no F5; referências são liberadas ao destruir a aplicação. A foto de exemplo usa um link do Unsplash, e o PDF fictício fica em `src/app/mocks/assets/request-examples/`.

Um documento pode estar relacionado a várias solicitações, inclusive demandas coletivas. As regras de vinculação e acesso serão detalhadas na tela correspondente.

## Automação e conjunto de tarefas

**Regra geral definida pelo usuário em 18/11/2026:** toda criação de qualquer objeto é uma trigger (gatilho) para automação futura. A regra abrange também interações rápidas, comentários, respostas, mensagens e demais registros de apoio, não apenas solicitações. Disponibilizar o evento de criação após a gravação bem-sucedida, identificando objeto, contexto, autoria, data/hora e evento de origem. A execução depende de uma automação habilitada que aceite esse evento e satisfaça suas condições; criar o objeto não implica executar todas as automações.

Essa regra também se aplica aos objetos criados por automação. A implementação futura deverá rastrear a origem e impedir disparos duplicados ou ciclos de criação. Nesta etapa, documentar o comportamento; não implementar motor de automação, backend ou integrações no protótipo.

O conjunto de tarefas-modelo fica inicialmente dentro da **Automação de tarefas**, junto do gatilho e das condições. Gatilho e condição são configuração, não precisam de cadastros independentes.

Exemplo de planejamento:

> Nome: Acompanhar pedido de iluminação. Gatilho: solicitação criada. Condição: categoria = iluminação pública.

| Tarefa-modelo           | Responsável sugerido                      | Prazo/dependência sugerida        |
| ----------------------- | ----------------------------------------- | --------------------------------- |
| Preparar ofício         | Equipe administrativa                     | Um dia após a abertura.           |
| Encaminhar à secretaria | Responsável pela tarefa de encaminhamento | Após preparar o ofício.           |
| Cobrar retorno          | Responsável pela tarefa de acompanhamento | Cinco dias após o encaminhamento. |

Os responsáveis e prazos do exemplo não são uma política aprovada; servem para desenhar a configuração.

- O gatilho cria tarefas reais vinculadas ao contexto de origem. As dependentes podem nascer aguardando a etapa anterior.
- Criar uma tarefa para enviar uma mensagem não significa enviar a mensagem automaticamente. Execução autônoma de ações exige definição posterior.
- Cada disparo possui uma **Execução de automação**, registro de apoio para identificar o evento de origem, a versão da configuração, as tarefas criadas e o resultado.
- Reprocessar o mesmo disparo não pode duplicar tarefas. Detalhes de repetição, falhas e reexecução manual serão definidos na implementação.
- Alterar uma automação não modifica silenciosamente as tarefas já criadas.
- Extrair um **Modelo de tarefas** independente somente se surgir a necessidade de reutilizar o mesmo conjunto em várias automações.

## Relações e visões

| Relação                        | Direção do planejamento                                                                                               |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| Pessoa ↔ Solicitação           | Uma pessoa pode ter vários pedidos; uma demanda coletiva pode envolver várias pessoas, com seus papéis identificados. |
| Pessoa ↔ Interação             | Uma pessoa pode participar de várias interações; uma interação pode envolver mais de uma pessoa.                      |
| Interação ↔ Solicitação        | Vínculo opcional, podendo haver várias de cada lado.                                                                  |
| Solicitação → Tarefas          | Várias tarefas para uma solicitação; tarefas também podem existir sem solicitação.                                    |
| Documento ↔ demais objetos     | Referenciar documentos relacionados, preservando o registro original e as permissões.                                 |
| Comentário → objeto principal  | Cada discussão tem um contexto; respostas apontam ao comentário pai nesse contexto.                                   |
| Automação → Execução → Tarefas | Configuração, ocorrência do disparo e trabalho gerado são informações distintas.                                      |

**Linha do tempo:** composição cronológica das interações, solicitações, documentos e demais acontecimentos relevantes. Cada item aponta para sua origem. Não criar um segundo cadastro manual de cada acontecimento só para aparecer no histórico. Auditoria técnica e comentário interno não comprovam contato efetivo com a pessoa.

**Kanban — implementação e definição do usuário em 18/11/2026:** o quadro mostra tarefas, com duas visualizações dos mesmos cartões: por status fixos (A fazer, Andamento, Aguardando, Concluída) e por colunas criadas pelos usuários. Toda tarefa tem status obrigatório; o vínculo opcional à coluna personalizada é uma dimensão independente. Mover na visão por status muda só esse campo; mover na personalizada muda só a coluna, preservando status e conclusão. Sem coluna agrupa as não classificadas, mantendo o mesmo conjunto nas duas visões. A organização manual permite arrastar cartões para cima/baixo e escolher a posição em outra coluna; a ordem é uma preferência de layout independente por visualização, sem copiar objetos nem alterar dados de negócio ao reordenar na mesma coluna. Coluna personalizada é configuração de agrupamento, não outro objeto principal ou cópia de Tarefa; sua criação também é gatilho disponível para automação futura. O quadro projeta tarefas relacionadas e independentes, sem um cadastro genérico de cards. Criação, edição e movimentos refletem na solicitação e no histórico pertinente; concluir a tarefa não encerra a demanda. Vínculo à solicitação é opcional e escolhido na criação. Sem dependências, automações ou backend nesta etapa. Ver [kanban.md](kanban.md).

**Agenda e relatórios:** usar os objetos existentes quando bastarem. Um objeto Evento só deve ser introduzido se houver necessidade de gerenciar participantes, inscrições ou presença, além de registrar um encontro individual.

## Cadastros e registros de apoio

**Etiquetas de tarefas — implementação de 19/11/2026:** catálogo de apoio com ID, nome e cor. Uma tarefa pode vincular várias etiquetas por IDs, inclusive nenhuma; o cadastro é compartilhado entre Kanban e solicitação. CRUD e proteção da exclusão de etiquetas em uso ficam no mock. Cores e nomes são apresentação do mesmo cadastro, sem copiar tarefas ou alterar status, responsáveis e períodos de trabalho. A criação segue como gatilho futuro, sem automações executadas. Ver [etiquetas-tarefas.md](etiquetas-tarefas.md).

**Etiquetas — implementação mock autorizada em 18/11/2026:** a seleção explícita de pessoas na lista alimenta `/etiquetas`; há também acesso pela ficha. O modelo de conteúdo (campos, ordem, textos e tipografia) é separado do formato físico (papel, dimensões, margens, grade e vãos). São referências de apoio e uma geração de saída, sem novos objetos principais concorrentes de Pessoa ou Documento. A geração fixa destinatários/dados/modelo/formato e entrega um único PDF para prévia, download e impressão; editar os parâmetros invalida a prévia. Registrar geração ou abrir impressão não comprova impressão física. O mock preserva versões anteriores dos modelos/formatos em memória; auditoria, permissões e reversão com backend continuam para outra etapa. Criações de modelos e formatos seguem a regra de gatilho para automação futura. Ver [etiquetas.md](etiquetas.md).

- Secretarias/órgãos/setores, equipes, perfis de acesso, categorias e classificações são referências reutilizáveis.
- Contatos e endereços ficam nas coleções da pessoa, com tratamento apropriado para meios compartilhados.
- Comentários, mensagens, arquivos/anexos e execuções de automação têm responsabilidades próprias, sem exigir um módulo de menu para cada um.
- Não criar CRUD ou uma sequência de requisições por tabela. O contrato das telas continua orientado a ações completas do usuário, como salvar a ficha ou registrar uma interação com seus dados relacionados.

## Compatibilidade com o projeto e pendências

O [contrato de API draft.3](../../docs/api/README.md), de 16/11/2026, é uma proposta anterior, sem backend implementado. Ele usa `/atendimentos` para o pedido e apresenta conversas separadamente. **Esta consolidação atualiza a direção conceitual**, mas não altera automaticamente seus endpoints, payloads ou documentação gerada. Revisar o contrato quando a integração for solicitada, aproveitando suas regras de salvamento completo, autoria, permissões e prevenção de duplicação que continuarem aplicáveis.

O frontend atual contém uma ficha e registros mock. O tipo visual de solicitação na linha do tempo não transforma Solicitação em subtipo de Interação no modelo final. A caixa de conversas permanece preservada, fora da rota atual; não restaurá-la ou refatorá-la antecipadamente só por causa deste documento.

**Ampliação autorizada em 18/11/2026:** foram criadas páginas de detalhes mock por ID para Interação (`/interacoes/:id`), Solicitação (`/solicitacoes/:id`), Conversa (`/conversas/:id`) e Agendamento (`/agendamentos/:id`), com links na ficha e entre registros relacionados. Conversa continua sendo um tipo de Interação, com mensagens filhas; a página específica não cria um objeto principal concorrente. O registro rápido do que foi conversado não cria um histórico de mensagens automaticamente. Agendamento é um compromisso vinculado à pessoa, com horário/local/participantes; essa visualização não introduz um módulo de eventos ou inscrição. Novos tipos terão detalhes e rotas próprios quando seus escopos forem solicitados. A criação permanece um gatilho para automações futuras, sem motor implementado nesta etapa.

Permanecem para definição nas próximas etapas: tela seguinte e seu escopo, campos obrigatórios, estados/transições, permissões específicas, regras de edição/remoção de comentários, profundidade/paginação das discussões, detalhes da tramitação de documentos e políticas dos gatilhos/prazos das automações. Nenhuma dessas pendências autoriza implementar backend, autenticação, integrações ou módulos adicionais agora.

**Histórico e tempo da Tarefa — 19/11/2026:** `TaskHistoryEvent` é registro de apoio, com autoria/data, valores alterados e estado histórico de status e responsáveis. Serve ao histórico visível no rodapé do card e à projeção diária de tempo em Andamento por funcionário. Trocar responsáveis preserva os períodos anteriores. O usuário confirmou crédito integral do intervalo para cada responsável; totais podem somar simultaneidades, sem representar ponto ou dedicação exclusiva. Não criar outro objeto principal para relatórios nem copiar tarefas. Detalhes em [relatorio-horas.md](relatorio-horas.md).
