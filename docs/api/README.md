# API orientada às telas e ações

Contrato **1.0.0-draft.3**, planejamento **v0.14**, 16/11/2026. Este documento substitui a modelagem fragmentada da draft.2. O projeto ainda contém somente planejamento; as rotas não estão implementadas.

A regra é: **uma confirmação do usuário salva o conjunto preenchido em uma chamada de negócio**. O backend resolve normalização, associações, referências locais, protocolo, permissões, concorrência e auditoria. A API não acompanha uma tabela por endpoint.

- [Referência offline por tela e ação](index.html)
- [OpenAPI YAML](openapi.yaml) e [JSON equivalente](openapi.json)
- [26 cenários completos com ordem das chamadas](cenarios.md) e [manifesto verificável](cenarios.json)
- [Fluxos com payloads](fluxos.md), [cliente HTTP](exemplos.http) e [referência Markdown completa](referencia.md)
- [Cobertura por tela](cobertura.md), [regras de negócio](regras-negocio.md), [mudanças](mudancas.md) e [validação documental](validacao.md)
- [Integrações técnicas separadas](integracoes.md) e [direção para MCP](mcp.md)

O contrato do frontend contém **88 operações em 79 caminhos**: 32 GET, 36 POST, 16 PATCH e 4 DELETE. Toda operação identifica `x-tela`, `x-acao-frontend`, `x-consumidor`, permissões e finalidade. Saúde e webhook não entram nessa contagem; possuem outro contrato, com dois consumidores técnicos identificados.

## O que cada chamada deve resolver

| Intenção da tela | Contrato |
| --- | --- |
| Montar novo cadastro | `GET /municipes/formulario`: valores iniciais, opções, limites e contexto autorizado. |
| Salvar pessoa completa | `POST /municipes`: pessoa, contatos, endereços, documentos, classificações, indicação e fotos em uma transação. |
| Abrir/editar ficha | `GET /municipes/{id}` entrega formulário e referências prontas; um `PATCH` salva todos os blocos alterados e já devolve a ficha. |
| Criar pedido completo | `POST /atendimentos`: solicitante existente ou novo inline, pedido, serviços, pendências, notas, anexos e mensagens relacionadas. |
| Concluir pedido | Um `PATCH /atendimentos/{id}` com situação, resultado e itens alterados. |
| Conferir autocadastro | Um GET devolve declaração, candidatos e ficha comparada; um POST de conferência integra pessoa e participação. |
| Imprimir etiquetas | Preparar editor, enviar seleção/layout/formato em um POST de prévia; conferir e imprimir o mesmo PDF gerado. |
| Abrir caixa/conversa | Respostas trazem linhas/workspace prontos; nenhum GET por mensagem, responsável ou protocolo. |

Montagem, seleção em autocomplete, envio de bytes, paginação e decisão de conflito são ações próprias. Não é uma promessa de uma única requisição HTTP durante toda a utilização de uma tela. É a eliminação de sequências artificiais como “criar pessoa → criar cada contato → criar cada endereço → vincular classificações → cadastrar cada foto”.

## Base, formatos e métodos

Base proposta: `/api/v1`, mesma origem do frontend. UUIDs identificam registros; protocolo é legível e gerado no servidor. JSON usa UTF-8 e camelCase; instantes usam UTC com offset e datas civis usam `AAAA-MM-DD`. A interface apresenta instantes no fuso autorizado/configurado.

GET consulta sem alterar negócio. POST cria agregado ou executa comando identificado. As pesquisas complexas e a comparação de fusão usam POST **sem efeitos**, explicitadas no contrato e sem chave de idempotência. PATCH salva alterações do formulário. DELETE corresponde somente a ações reais de arquivamento/cancelamento/revogação; não recebe corpo. Não há PUT porque nenhuma tela definida precisa de substituição integral adicional.

## Sessão e início da aplicação

Proposta para o navegador: sessão opaca em cookie `crm_sessao`, `HttpOnly`, `Secure`, `SameSite=Strict`, `Path=/api/v1`. Não devolver segredo de sessão no JSON. HTTPS e verificação de origem/CSRF são exigências da implementação.

`POST /auth/login` já retorna `App`: conta, `etagConta`, `csrfToken`, permissões, menu, limites e alertas iniciais. Ao recarregar com sessão ativa, `GET /app` retoma esse contexto. Não é preciso login → token → usuário → permissões → preferências → menu. Logout revoga a sessão e expira o cookie. Login precisa validar origem e limitar tentativas; não exige um token CSRF de sessão ainda inexistente.

Toda chamada autenticada não GET, inclusive POST de pesquisa, envia `X-CSRF-Token`. O cookie é enviado pelo navegador; img, player, download e EventSource podem usar a mesma sessão na origem proposta. Recursos e SSE revalidam o acesso atual. Expiração retorna 401 e a UI preserva o formulário local, sem afirmar que ele foi salvo.

Esta revisão substitui a proposta anterior de tokens administrados pela UI. Não há cliente implantado a migrar. O futuro MCP terá autenticação própria conforme sua arquitetura; não motivou rotas adicionais de token no contrato do frontend.

## Cadastro e edição de agregados

`POST /municipes` exige somente nome; dados complementares são opcionais. Documentos não são chave primária. Contatos informados inline são normalizados/reutilizados pelo backend sem vincular automaticamente outra pessoa. Uma mesma família pode compartilhar telefone/e-mail/endereço.

No PATCH:

- Campo/bloco ausente mantém seu valor. `null` limpa apenas campos explicitamente anuláveis.
- Coleção presente representa o conjunto final **integralmente editável**. `[]` remove seus vínculos editáveis, sujeito a regras e auditoria. Não apaga automaticamente um telefone global usado por outra pessoa.
- A UI só pode reenviar/substituir uma coleção quando recebeu e pode controlar todo esse conjunto. Itens ocultos por permissão não podem ser removidos por omissão; se o usuário não controla o conjunto, o campo é omitido e o backend impede substituição destrutiva.
- `chave` é identificador local estável de item do editor. `id` identifica item existente do mesmo agregado. Na criação, IDs de filhos de outros registros são rejeitados. Chaves repetidas, IDs de terceiros ou `execucaoChave` inexistente são 422/404 conforme o acesso.
- Campos proibidos provocam 403 antes de qualquer gravação. Não ignorar silenciosamente partes do formulário. Permissões condicionais incluem cadastro de pessoa inline, indicação, anotação manual, correção de solicitante e modos automáticos da IA.

O salvamento valida tudo antes de publicar os efeitos internos em uma transação, incluindo auditoria. A resposta já traz a ficha e seu ETag atual. Não há GET posterior obrigatório para reconstruí-la.

## Concorrência e repetição

Cada ficha/linha editável inclui `etag`; leituras/salvamentos de agregados também podem devolvê-lo no header `ETag`. Enviar o valor literalmente em `If-Match` na operação indicada. `versao` é informativa; o frontend não monta ETags nem soma versões dos filhos. Comparações de temporários/fusão já fornecem as versões de todos os alvos na mesma tela.

Sem versão obrigatória: 428. Versão desatualizada: 412, sem mudanças parciais. Preservar rascunho, recarregar/comparar e pedir decisão quando necessário. Não repetir automaticamente com o ETag mais novo.

Gravações de negócio exigem `Idempotency-Key` por intenção. Repetir a mesma identidade, rota, chave e corpo devolve o mesmo resultado sem duplicar efeito. Chave com corpo diferente resulta em 409. Mudou o formulário após erro ou tomou outra decisão: nova chave. Retenção mínima proposta: 24 horas, configurável e anunciada na implementação; retries de mensagens continuam reconciliando o estado durável mesmo após a janela da chave. Não confiar só na memória do processo.

Login, logout, troca de senha e consultas não exigem essa chave. Endpoint público aceita chave aleatória para reenvio da mesma declaração; não a usa para pesquisar/expor cadastros internos. Cancelamentos DELETE usam `X-Motivo`.

## Duplicidade no próprio Salvar

O backend sempre reavalia duplicidade na gravação, inclusive em pessoa inline. Um 409 de duplicidade interno já traz `candidatos`, motivos e `revisaoDuplicidadeToken`. Nenhuma entidade fica pela metade. Usuário pode abrir existente, revisar uma fusão separada ou confirmar pessoa distinta com `decisaoDuplicidade` no reenvio do mesmo formulário.

O token é curto, vinculado à identidade/dados revisados, e não dispensa nova validação. Homônimo ou telefone familiar não provoca fusão automática. Documento ou declaração isolada não comprovam identidade. Respostas públicas nunca incluem candidatos, presença na base, IDs ou links internos.

## Arquivos e áudio sem cadastro prévio

O frontend gera `rascunhoId` local. `POST /uploads` recebe vários arquivos multipart e um manifesto `{rascunhoId, arquivos:[{chave,indice,uso}]}` em **uma chamada por lote**. O retorno mapeia cada chave a um `uploadToken` pronto. O Salvar do agregado consome os tokens e publica os vínculos na transação. Não existe obrigação de criar munícipe ou atendimento vazio para conseguir anexar.

Bytes ficam em armazenamento privado temporário do usuário/rascunho. Validar formato real, tamanho, finalidade e integridade antes de emitir token pronto. A transação de banco reivindica referências aos bytes já persistidos; não é uma transação distribuída fictícia com o armazenamento. Falha do Salvar preserva temporários para retry/expiração, sem cadastro parcial. Limpeza remove órfãos expirados. IDs/URLs não concedem autorização por si.

`POST /observacoes/transcricoes` recebe o áudio e inicia a tarefa diretamente, também em rascunho novo. O usuário revisa o resultado e o mescla **no editor local**, preservando texto já digitado. O Salvar normal envia `observacoes` final e a origem em `transcricoesUtilizadas`. O servidor não acrescenta o trecho outra vez. Sem etapa extra de aplicar nem salvamento prévio do texto existente.

## Leituras prontas, listas e datas

Ficha entrega nomes das referências, opções iniciais, formulários, ações, URLs e resumos autorizados. Listas entregam pessoa/responsável/protocolo/trechos necessários para cada linha. `/opcoes` serve apenas a buscas reais em seletores maiores; itens já selecionados não exigem lookup. O backend deve evitar N+1 também no banco, a verificar quando implementado.

Listas usam cursor opaco, limite padrão 25 e máximo 100. Cursor é vinculado à consulta/identidade; alterar filtros reinicia paginação. Total é opcional e autorizado. Históricos longos usam paginação sob demanda, sem obrigar carregar a vida inteira da pessoa ao abrir a ficha. Coleções ativas editáveis têm limite explícito proposto de 100 itens por bloco; ultrapassá-lo precisa gerar validação clara, nunca truncamento silencioso do conjunto a substituir. Limites efetivos vêm em App/contexto.

`POST /municipes/pesquisa` atende à lista e ao relatório. Combina busca normalizada sem acentos, sexo, datas, localização, documentos/contatos autorizados, classificações e critérios dos atendimentos. Mesma pessoa aparece uma vez, com origem/trecho da coincidência. Critérios de pedido combinados devem existir no mesmo pedido. Grupos de filtros usam E, seleções múltiplas usam OU salvo classificaçãoModo=todas. Não incluir valores antigos de auditoria, conteúdo oculto ou anotação restrita de voto na busca geral.

Toda pesquisa temporal usa `FiltroData`: componentes dia/mês/ano isolados ou combinados, intervalo inclusivo aberto/fechado, ou ausência. Ex.: `{"modo":"componentes","mes":11}`. Em GET, o parâmetro `data` é esse JSON codificado na URL; em POST é objeto no campo semântico (`nascimento`, `conclusao` etc.). Validar combinação civil, início ≤ fim e fuso IANA. Em timestamps, o dia final é o dia inteiro no fuso escolhido; em datas civis não converter fuso. A descrição da rota informa qual evento/data está sendo filtrado.

## Tarefas e atualizações

202 de tarefa devolve `Operacao`, com tipo, estado, possibilidade de cancelar e ID. `GET /eventos` transmite SSE autenticado e tipado (`EventoTela`) com DTO pronto de mensagem, conversa, operação, estado do canal ou notificação. Evita GET por mensagem recebida. `Last-Event-ID` retoma dentro da retenção; fora dela, evento `ressincronizar` pede recarregar a tela pelo endpoint normal. Revogação encerra acesso; dados restritos e QR não entram nesse stream.

`GET /operacoes/{id}` é acompanhamento compartilhado de fallback/retomada, não polling obrigatório quando o stream entregou o resultado. 202 nunca equivale a mensagem entregue, transcrição aprovada, conexão restaurada ou notificação exibida. Worker precisa deduplicar e reconciliar efeitos externos incertos. Cancelar só funciona enquanto o estado permitir.

## Erros

Envelope `application/problem+json`: `type`, `title`, `status`, `detail`, `codigo`, `requestId` e campos específicos quando cabíveis. Validação aponta caminhos do formulário, inclusive `servicos[servico-1].resultado`. Nenhum segredo ou stack trace. O schema público é separado e não contém candidatos nem identificadores internos.

| Status | O frontend deve fazer |
| --- | --- |
| 400 / 422 | Mostrar erro geral/campos; preservar rascunho; nenhum salvamento parcial. |
| 401 / 403 | Retomar acesso ou informar falta de permissão; não contornar campos proibidos. |
| 404 | Recurso ausente ou inacessível, sem revelar sua existência. |
| 409 | Exibir conflito de negócio, duplicidade, dependência ou estado com decisão orientada. |
| 410 | Informar expiração/revogação e permitir repetir a preparação válida. |
| 412 / 428 | Comparar versão ou enviar ETag da tela, sem sobrescrita silenciosa. |
| 413 / 415 | Corrigir quantidade, tamanho ou tipo de arquivo. |
| 429 / 503 | Respeitar Retry-After quando fornecido e retentar com a mesma chave/corpo. |
| 500 | Informar falha com requestId; verificar resultado/repetir com idempotência antes de nova intenção. |

## Edição e geração dos documentos

Fontes editáveis: [contrato por ações](../../scripts/api_contrato.py), [renderização e cenários](../../scripts/api_render.py), documentos humanos nesta pasta e [gerador](../../scripts/gerar_documentacao_api.py). YAML, JSON, explorador, referência, cenários e cobertura são gerados juntos. Nunca editar só o YAML gerado.

```sh
python3 -m venv /tmp/gabinete-api-docs-venv
/tmp/gabinete-api-docs-venv/bin/pip install -r docs/api/requirements-docs.txt
/tmp/gabinete-api-docs-venv/bin/python scripts/gerar_documentacao_api.py
/tmp/gabinete-api-docs-venv/bin/python scripts/validar_documentacao_api.py
```

A validação confere contrato, exemplos, referências, cenários e documentos; não demonstra regras transacionais, segurança, comportamento de um conector ou desempenho de um backend inexistente.
