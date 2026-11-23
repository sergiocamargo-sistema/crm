# Cenários completos do frontend — 1.0.0-draft.3

Confirmação grava agregado em uma chamada. Montagem, bytes, lookup opcional, revisão humana e acompanhamento são distinguidos.

Uma montagem + um Salvar são duas requisições com finalidades distintas. Upload é lote até o limite de App. Autocomplete, paginação e revisão de conflitos correspondem a ações reais. SSE é compartilhado; polling só quando necessário.

## Cadastrar pessoa completa

Sem documento obrigatório. Pessoa, contatos compartilháveis, endereços, documentos, classificações, indicação e fotos são salvos em uma transação. Sem arquivos: uma montagem + uma gravação. O resultado já é a ficha atual.

| Quando | Papel | Chamada |
| --- | --- | --- |
| Abrir tela ou selecionar registro | carregamento | `GET /municipes/formulario` |
| Se escolher arquivos: lote de bytes ligado ao rascunho local | preparacao_opcional | `POST /uploads` |
| Confirmar ação principal | confirmacao | `POST /municipes` |

**Confirmação principal: uma gravação de negócio**, com validação e auditoria do conjunto.

## Editar ficha e reorganizar fotos

A ficha já entrega ETag, nomes dos selecionados, URLs e coleções editáveis completas. Salvar devolve a ficha atual; não exige GET posterior.

| Quando | Papel | Chamada |
| --- | --- | --- |
| Abrir tela ou selecionar registro | carregamento | `GET /municipes/{id}` |
| Somente se incluir novas fotos | preparacao_opcional | `POST /uploads` |
| Confirmar ação principal | confirmacao | `PATCH /municipes/{id}` |

**Confirmação principal: uma gravação de negócio**, com validação e auditoria do conjunto.

## Criar pedido, inclusive com solicitante novo

Pessoa nova recebe cadastro completo inline. Uma transação cria pedido, serviços, pendências, notas, anexos e vínculos com mensagens. Chaves locais resolvem o vínculo de anexo ao serviço ainda sem ID.

| Quando | Papel | Chamada |
| --- | --- | --- |
| Abrir tela ou selecionar registro | carregamento | `GET /atendimentos/formulario` |
| Se houver documentos/fotos | preparacao_opcional | `POST /uploads` |
| Confirmar ação principal | confirmacao | `POST /atendimentos` |

**Confirmação principal: uma gravação de negócio**, com validação e auditoria do conjunto.

## Editar ou concluir atendimento com seus itens

Um botão pode editar dados, concluir pedido e registrar resultados de serviços e pendências. Qualquer falha aborta o conjunto. Sem PATCH obrigatório de cada filho.

| Quando | Papel | Chamada |
| --- | --- | --- |
| Abrir tela ou selecionar registro | carregamento | `GET /atendimentos/{id}` |
| Confirmar ação principal | confirmacao | `PATCH /atendimentos/{id}` |

**Confirmação principal: uma gravação de negócio**, com validação e auditoria do conjunto.

## Encontrar retorno e registrar resultado

Lista já inclui pessoa, protocolo, ações e ETag. Uma gravação conclui/reagenda, registra tentativa ou interação efetiva, preferência e próximo retorno. Sem resposta não renova último contato efetivo.

| Quando | Papel | Chamada |
| --- | --- | --- |
| Abrir tela ou selecionar registro | carregamento | `GET /agenda` |
| Confirmar ação principal | confirmacao | `PATCH /agenda/{id}` |

**Confirmação principal: uma gravação de negócio**, com validação e auditoria do conjunto.

## Selecionar e assumir conversa

Antes de selecionar, GET /caixa desenha a fila com linhas prontas. Selecionar carrega workspace completo. Assumir é ação humana distinta e devolve o workspace atual, sem GET posterior.

| Quando | Papel | Chamada |
| --- | --- | --- |
| Abrir tela ou selecionar registro | carregamento | `GET /conversas/{id}` |
| Confirmar ação principal | confirmacao | `POST /conversas/{id}/assumir` |

**Confirmação principal: uma gravação de negócio**, com validação e auditoria do conjunto.

## Enviar texto ou mídia

202 devolve a linha pendente com chaveCliente. SSE atualiza entrega. Texto não exige upload; mídias usam um lote. Falha incerta tem um botão Tentar novamente cujo backend reconcilia antes de reenviar.

| Quando | Papel | Chamada |
| --- | --- | --- |
| Somente para mídia | preparacao_opcional | `POST /uploads` |
| Confirmar ação principal | confirmacao | `POST /conversas/{id}/mensagens` |

**Confirmação principal: uma gravação de negócio**, com validação e auditoria do conjunto.

## Corrigir pessoa, vínculos de mensagens ou modo IA

Um modal, uma gravação. Novo pedido usa POST /atendimentos com contextoConversa; nova pessoa usa POST /municipes com contextoConversa. Não exige criar e depois vincular.

| Quando | Papel | Chamada |
| --- | --- | --- |
| Confirmar ação principal | confirmacao | `PATCH /conversas/{id}/contexto` |

**Confirmação principal: uma gravação de negócio**, com validação e auditoria do conjunto.

## Receber aviso e reconectar WhatsApp

Uma leitura traz estado, tentativa ativa, instruções/QR permitido e incidentes. Uma chamada inicia recuperação/renovação apropriada. SSE informa estado; QR novo é consultado na tela autorizada.

| Quando | Papel | Chamada |
| --- | --- | --- |
| Abrir tela ou selecionar registro | carregamento | `GET /whatsapp` |
| Confirmar ação principal | confirmacao | `POST /whatsapp/{id}/reconectar` |

**Confirmação principal: uma gravação de negócio**, com validação e auditoria do conjunto.

## Ativar alertas do Chrome

Antes da chamada, o próprio navegador solicita consentimento e cria PushSubscription. API salva inscrição do usuário/dispositivo; não concede permissão do Chrome. Testar é outro botão explícito.

| Quando | Papel | Chamada |
| --- | --- | --- |
| Confirmar ação principal | confirmacao | `POST /notificacoes/inscricoes` |

**Confirmação principal: uma gravação de negócio**, com validação e auditoria do conjunto.

## Criar evento e link já aberto

Evento novo inline, configuração, janela e estado de coleta são uma transação. Sem criar evento, formulário e abrir link em três gravações.

| Quando | Papel | Chamada |
| --- | --- | --- |
| Abrir tela ou selecionar registro | carregamento | `GET /formularios/editor` |
| Confirmar ação principal | confirmacao | `POST /formularios` |

**Confirmação principal: uma gravação de negócio**, com validação e auditoria do conjunto.

## Autocadastro sem consulta à base

A configuração já traz opções públicas. Recebe declaração completa e confirma recibo igual para novo/existente, sem IDs internos ou candidatos.

| Quando | Papel | Chamada |
| --- | --- | --- |
| Abrir tela ou selecionar registro | carregamento | `GET /publico/formularios/{token}` |
| Confirmar ação principal | confirmacao | `POST /publico/formularios/{token}/envios` |

**Confirmação principal: uma gravação de negócio**, com validação e auditoria do conjunto.

## Integrar temporário em pessoa nova ou existente

A fila usa GET /cadastros-recebidos. O detalhe inclui declaração, candidatos, ficha comparada e contexto de cadastro novo. Confirmar salva pessoa, escolhas explícitas, participação, decisão e temporário juntos. Sem cadastro prévio de pessoa.

| Quando | Papel | Chamada |
| --- | --- | --- |
| Abrir tela ou selecionar registro | carregamento | `GET /cadastros-recebidos/{id}` |
| Confirmar ação principal | confirmacao | `POST /cadastros-recebidos/{id}/conferencia` |

**Confirmação principal: uma gravação de negócio**, com validação e auditoria do conjunto.

## Incluir participante novo e presença

Solicitante novo pode vir completo inline; pessoa e participação são atômicas. Correção posterior usa PATCH da participação, com ETag já na linha. Não duplica pessoa/evento nem cria atendimento automaticamente.

| Quando | Papel | Chamada |
| --- | --- | --- |
| Abrir tela ou selecionar registro | carregamento | `GET /formularios/{id}/participantes` |
| Confirmar ação principal | confirmacao | `POST /formularios/{id}/participantes` |

**Confirmação principal: uma gravação de negócio**, com validação e auditoria do conjunto.

## Gerar PDF para conferir e imprimir

Envia IDs ou consulta, modelo salvo/rascunho e formato salvo/personalizado. Um comando materializa, valida e gera um PDF imutável. Abrir GET /arquivos/{id}/conteudo é leitura de bytes para a prévia e impressão do MESMO PDF. Nenhum POST prévio de seleção/template/formato é obrigatório. Salvar biblioteca é outra intenção opcional.

| Quando | Papel | Chamada |
| --- | --- | --- |
| Abrir tela ou selecionar registro | carregamento | `GET /etiquetas/preparacao` |
| Confirmar ação principal | confirmacao | `POST /etiquetas/previas` |

**Confirmação principal: uma gravação de negócio**, com validação e auditoria do conjunto.

## Comparar duplicados e confirmar valores finais

Preparar é consulta sem efeitos, apesar de POST. Retorna duas fichas, diferenças, dependências e token. Confirmar grava formulário final, relações e rastreamento em uma transação.

| Quando | Papel | Chamada |
| --- | --- | --- |
| Abrir tela ou selecionar registro | carregamento | `POST /municipes/fusoes/preparar` |
| Confirmar ação principal | confirmacao | `POST /municipes/fusoes` |

**Confirmação principal: uma gravação de negócio**, com validação e auditoria do conjunto.

## Revisar impacto e reverter atividade

Detalhe já inclui diferenças, impacto e token. Dois passos humanos reais, sem endpoint extra de prévia. Confirmação revalida dependências e preserva original; efeito externo consumado tem limite explícito.

| Quando | Papel | Chamada |
| --- | --- | --- |
| Abrir tela ou selecionar registro | carregamento | `GET /historico/{id}` |
| Confirmar ação principal | confirmacao | `POST /historico/{id}/reverter` |

**Confirmação principal: uma gravação de negócio**, com validação e auditoria do conjunto.

## Cadastrar usuário com perfis e equipes

Uma leitura traz usuários paginados, perfis/equipes completos e permissões. Um salvar grava usuário e associações. Edição/desativação usa PATCH com ETag da linha, sem GET individual.

| Quando | Papel | Chamada |
| --- | --- | --- |
| Abrir tela ou selecionar registro | carregamento | `GET /administracao/acessos` |
| Confirmar ação principal | confirmacao | `POST /administracao/usuarios` |

**Confirmação principal: uma gravação de negócio**, com validação e auditoria do conjunto.

## Salvar configurações do gabinete

Uma versão e uma gravação para os blocos alterados do formulário autorizado; sem CRUD por chave de configuração.

| Quando | Papel | Chamada |
| --- | --- | --- |
| Abrir tela ou selecionar registro | carregamento | `GET /administracao/configuracoes` |
| Confirmar ação principal | confirmacao | `PATCH /administracao/configuracoes` |

**Confirmação principal: uma gravação de negócio**, com validação e auditoria do conjunto.

## Entrar ou retomar a aplicação

Login já entrega App, conta, menu e CSRF. GET /app é alternativa ao recarregar com sessão ativa, não etapa obrigatória após login. SSE é conexão compartilhada.

| Quando | Papel | Chamada |
| --- | --- | --- |
| Entrar | confirmacao | `POST /auth/login` |
| Alternativa: sessão ativa após reload | alternativa | `GET /app` |
| Aplicação aberta | acompanhamento | `GET /eventos` |

## Ditar observações antes ou depois do cadastro

Um multipart envia áudio e inicia tarefa, inclusive sem munícipe salvo. SSE entrega resultado; polling só no fallback. Usuário revisa e mescla LOCALMENTE com texto ainda não salvo. Último passo é POST /municipes OU PATCH da ficha, nunca ambos. Não exige salvar o texto antes nem aplicar a transcrição depois.

| Quando | Papel | Chamada |
| --- | --- | --- |
| Enviar/gravar e transcrever | preparacao_opcional | `POST /observacoes/transcricoes` |
| Fallback de progresso/retomada | acompanhamento | `GET /operacoes/{id}` |
| Se nova pessoa | alternativa | `POST /municipes` |
| Se pessoa existente | alternativa | `PATCH /municipes/{id}` |

## Revisar conflito do próprio salvar

409 já retorna candidatos/motivos/token. Se decidir pessoa distinta, reenviar formulário com decisão e nova chave de idempotência. Só há segunda gravação após decisão humana real; nenhum endpoint de checagem prévia é obrigatório.

| Quando | Papel | Chamada |
| --- | --- | --- |
| Salvar e eventualmente receber 409 | confirmacao | `POST /municipes` |
| Se 409: confirmar pessoa distinta | decisao | `POST /municipes` |

## Lista, relatório e busca geral

Uma pessoa por linha com nomes, contadores e origem da coincidência. A mesma consulta atende à lista e relatório. Uma chamada por alteração de filtros/página, independente do número de linhas.

| Quando | Papel | Chamada |
| --- | --- | --- |
| Pesquisar/filtrar/paginar | navegacao | `POST /municipes/pesquisa` |

## Raízes, filhos, folha e retorno por níveis

Um GET por nível; sem indicadorId abre raízes, com ele abre filhos diretos e caminho para voltar. Alterar indicação é parte do Salvar pessoa, sem outro endpoint de vínculo.

| Quando | Papel | Chamada |
| --- | --- | --- |
| Abrir/descer/voltar um nível | navegacao | `GET /relatorios/indicacoes` |

## Históricos longos sob demanda

São abas/páginas explícitas, não pré-requisitos para montar ou salvar o editor. A ficha já contém resumo e itens recentes.

| Quando | Papel | Chamada |
| --- | --- | --- |
| Aba Anexos | alternativa | `GET /municipes/{id}/anexos` |
| Aba Participações | alternativa | `GET /municipes/{id}/participacoes` |
| Histórico do alvo | alternativa | `GET /historico` |
| Mais mensagens além da primeira página do pedido | alternativa | `GET /atendimentos/{id}/mensagens` |

## Criar classificação dentro do editor

Criar item do catálogo é outra intenção explícita, só se faltar opção. O modal devolve objeto selecionável; vínculo com pessoa é criado somente no salvar agregado. Selecionar classificação existente nunca exige POST de associação.

| Quando | Papel | Chamada |
| --- | --- | --- |
| Se faltar opção: cadastrar no modal | decisao | `POST /administracao/catalogos/{catalogo}` |
| Salvar pessoa com classificacaoIds | confirmacao | `PATCH /municipes/{id}` |
