# Referência da API — 1.0.0-draft.3

Contrato proposto: 88 operações em 79 caminhos. Base `/api/v1`. Nenhuma rota implementada.

[Convenções](README.md) · [Fluxos](fluxos.md) · [Cenários](cenarios.md) · [Integrações separadas](integracoes.md)

| Tela | Ação | Endpoint |
| --- | --- | --- |
| Entrar | Entrar no sistema | [POST /auth/login](#post_auth_login) |
| Inicialização | Restaurar sessão e montar a aplicação | [GET /app](#get_app) |
| Menu da conta | Sair e desvincular alertas da sessão | [POST /auth/logout](#post_auth_logout) |
| Preferências e disponibilidade | Salvar minhas preferências ou disponibilidade | [PATCH /conta](#patch_conta) |
| Alterar senha | Trocar minha senha | [POST /conta/senha](#post_conta_senha) |
| Autocomplete compartilhado | Pesquisar opções de um campo | [GET /opcoes](#get_opcoes) |
| Cadastrar munícipe | Montar o formulário de novo munícipe | [GET /municipes/formulario](#get_municipes_formulario) |
| Lista e relatório de munícipes | Pesquisar, filtrar e paginar munícipes | [POST /municipes/pesquisa](#post_municipes_pesquisa) |
| Cadastrar munícipe | Salvar munícipe completo | [POST /municipes](#post_municipes) |
| Ficha e edição do munícipe | Abrir ficha pronta para consultar e editar | [GET /municipes/{id}](#get_municipes_id) |
| Ficha e edição do munícipe | Salvar a edição completa do formulário | [PATCH /municipes/{id}](#patch_municipes_id) |
| Ficha e edição do munícipe | Arquivar munícipe | [DELETE /municipes/{id}](#delete_municipes_id) |
| Aba de anexos da pessoa | Carregar mais anexos dos atendimentos | [GET /municipes/{id}/anexos](#get_municipes_id_anexos) |
| Aba de participações da pessoa | Carregar participações em eventos | [GET /municipes/{id}/participacoes](#get_municipes_id_participacoes) |
| Comparar duplicados | Abrir comparação de duas pessoas | [POST /municipes/fusoes/preparar](#post_municipes_fusoes_preparar) |
| Comparar duplicados | Confirmar escolhas e fundir registros | [POST /municipes/fusoes](#post_municipes_fusoes) |
| Árvore de indicações | Abrir raízes ou filhos diretos de um nível | [GET /relatorios/indicacoes](#get_relatorios_indicacoes) |
| Arquivos de qualquer formulário | Enviar arquivos do rascunho em lote | [POST /uploads](#post_uploads) |
| Foto, player, prévia e download | Abrir arquivo ou variante autorizada | [GET /arquivos/{id}/conteudo](#get_arquivos_id_conteudo) |
| Observações por áudio | Enviar áudio e iniciar transcrição | [POST /observacoes/transcricoes](#post_observacoes_transcricoes) |
| Progresso de tarefa demorada | Acompanhar resultado por fallback de consulta | [GET /operacoes/{id}](#get_operacoes_id) |
| Progresso de tarefa demorada | Cancelar processamento ainda cancelável | [DELETE /operacoes/{id}](#delete_operacoes_id) |
| Novo atendimento | Montar formulário e contexto do pedido | [GET /atendimentos/formulario](#get_atendimentos_formulario) |
| Lista de atendimentos | Pesquisar pedidos com linhas prontas | [POST /atendimentos/pesquisa](#post_atendimentos_pesquisa) |
| Novo atendimento | Salvar atendimento completo e seus itens | [POST /atendimentos](#post_atendimentos) |
| Ficha de atendimento | Abrir pedido pronto para editar | [GET /atendimentos/{id}](#get_atendimentos_id) |
| Ficha de atendimento | Salvar edição ou conclusão com todos os itens | [PATCH /atendimentos/{id}](#patch_atendimentos_id) |
| Ficha de atendimento | Arquivar atendimento | [DELETE /atendimentos/{id}](#delete_atendimentos_id) |
| Minha agenda e entrar em contato | Carregar pendências, retornos e motivos | [GET /agenda](#get_agenda) |
| Agendar próximo contato | Criar retorno com pessoa e responsável | [POST /agenda/contatos](#post_agenda_contatos) |
| Agenda e entrar em contato | Registrar resultado, concluir ou reagendar | [PATCH /agenda/{id}](#patch_agenda_id) |
| Painel de gestão | Carregar indicadores fixos do painel | [GET /relatorios/resumo](#get_relatorios_resumo) |
| Caixa de atendimento | Carregar lista e contadores da caixa | [GET /caixa](#get_caixa) |
| Workspace da conversa | Abrir diálogo com todo o contexto | [GET /conversas/{id}](#get_conversas_id) |
| Rolagem e abas do diálogo | Carregar página anterior de mensagens ou notas | [GET /conversas/{id}/historico](#get_conversas_id_historico) |
| Workspace da conversa | Assumir conversa para mim | [POST /conversas/{id}/assumir](#post_conversas_id_assumir) |
| Transferir conversa | Transferir para atendente ou equipe | [POST /conversas/{id}/transferir](#post_conversas_id_transferir) |
| Identificação e protocolos da conversa | Salvar pessoa, vínculos e correção da triagem | [PATCH /conversas/{id}/contexto](#patch_conversas_id_contexto) |
| Workspace da conversa | Encerrar atendimento da conversa | [POST /conversas/{id}/encerrar](#post_conversas_id_encerrar) |
| Compositor de resposta | Enviar resposta ou mídia | [POST /conversas/{id}/mensagens](#post_conversas_id_mensagens) |
| Mensagem com falha ou estado incerto | Verificar e tentar novamente com segurança | [POST /mensagens/{id}/tentar-novamente](#post_mensagens_id_tentar_novamente) |
| Compositor de nota interna | Adicionar nota sem enviar ao munícipe | [POST /conversas/{id}/notas](#post_conversas_id_notas) |
| Nota interna do diálogo | Editar ou remover logicamente nota | [PATCH /conversas/{id}/notas/{notaId}](#patch_conversas_id_notas_notaId) |
| Leitura do diálogo | Atualizar marcador do usuário | [POST /conversas/{id}/leitura](#post_conversas_id_leitura) |
| Triagem indisponível ou corrigida | Pedir nova análise contextual | [POST /conversas/{id}/reanalisar](#post_conversas_id_reanalisar) |
| Aplicação aberta | Receber alterações SSE das telas autorizadas | [GET /eventos](#get_eventos) |
| Gerenciar conexão do WhatsApp | Abrir painel com estado, QR e histórico recente | [GET /whatsapp](#get_whatsapp) |
| Gerenciar conexão do WhatsApp | Reconectar ou renovar autenticação | [POST /whatsapp/{id}/reconectar](#post_whatsapp_id_reconectar) |
| Central de avisos | Carregar notificações com conteúdo e destino | [GET /notificacoes](#get_notificacoes) |
| Central de avisos | Marcar aviso próprio como lido | [PATCH /notificacoes/{id}](#patch_notificacoes_id) |
| Ativar notificações do Chrome | Vincular ou atualizar inscrição deste navegador | [POST /notificacoes/inscricoes](#post_notificacoes_inscricoes) |
| Desativar notificações deste navegador | Desvincular inscrição própria | [DELETE /notificacoes/inscricoes/{id}](#delete_notificacoes_inscricoes_id) |
| Testar notificações do Chrome | Enviar aviso de teste ao próprio dispositivo | [POST /notificacoes/teste](#post_notificacoes_teste) |
| Formulários e listas de presença | Listar formulários com evento, link e contadores | [GET /formularios](#get_formularios) |
| Editor de formulário e evento | Salvar evento e formulário, podendo abrir coleta | [POST /formularios](#post_formularios) |
| Editor de formulário e evento | Abrir editor novo ou existente com contexto completo | [GET /formularios/editor](#get_formularios_editor) |
| Editor de formulário e evento | Salvar edição, encerrar, revogar ou trocar link | [PATCH /formularios/{id}](#patch_formularios_id) |
| Autocadastro pelo link | Abrir formulário público com todos os campos/opções | [GET /publico/formularios/{token}](#get_publico_formularios_token) |
| Autocadastro pelo link | Enviar cadastro temporário completo | [POST /publico/formularios/{token}/envios](#post_publico_formularios_token_envios) |
| Participantes da ação | Listar inscrições e presenças prontas para conferência | [GET /formularios/{id}/participantes](#get_formularios_id_participantes) |
| Incluir participação pela equipe | Registrar participante existente ou novo completo | [POST /formularios/{id}/participantes](#post_formularios_id_participantes) |
| Participantes da ação | Confirmar presença ou corrigir participação | [PATCH /formularios/{id}/participantes/{participacaoId}](#patch_formularios_id_participantes_participacaoId) |
| Fila de cadastros temporários | Carregar fila com nome, origem e responsável | [GET /cadastros-recebidos](#get_cadastros_recebidos) |
| Conferir envio e comparar pessoa | Abrir conferência pronta para decidir | [GET /cadastros-recebidos/{id}](#get_cadastros_recebidos_id) |
| Conferir envio e comparar pessoa | Executar ação de conferência em uma chamada | [POST /cadastros-recebidos/{id}/conferencia](#post_cadastros_recebidos_id_conferencia) |
| Editor de etiquetas | Montar editor com modelo, formato e opções | [GET /etiquetas/preparacao](#get_etiquetas_preparacao) |
| Salvar modelo de etiqueta | Salvar como novo modelo | [POST /etiquetas/modelos](#post_etiquetas_modelos) |
| Salvar modelo de etiqueta | Salvar modelo existente e opção de padrão | [PATCH /etiquetas/modelos/{id}](#patch_etiquetas_modelos_id) |
| Salvar formato personalizado | Guardar medidas personalizadas para reutilizar | [POST /etiquetas/formatos](#post_etiquetas_formatos) |
| Salvar formato personalizado | Alterar ou inativar formato personalizado | [PATCH /etiquetas/formatos/{id}](#patch_etiquetas_formatos_id) |
| Prévia e impressão de etiquetas | Gerar PDF conferível e imprimível | [POST /etiquetas/previas](#post_etiquetas_previas) |
| Histórico global ou aba da ficha | Carregar atividades autorizadas | [GET /historico](#get_historico) |
| Detalhe e confirmação de reversão | Abrir diferenças e impacto de reverter | [GET /historico/{id}](#get_historico_id) |
| Detalhe e confirmação de reversão | Confirmar reversão revisada | [POST /historico/{id}/reverter](#post_historico_id_reverter) |
| Catálogo de classificações, serviços ou categorias | Abrir catálogo escolhido com ações e itens | [GET /administracao/catalogos/{catalogo}](#get_administracao_catalogos_catalogo) |
| Catálogo ou modal dentro de formulário | Cadastrar opção e já selecioná-la no editor | [POST /administracao/catalogos/{catalogo}](#post_administracao_catalogos_catalogo) |
| Catálogo de classificações, serviços ou categorias | Editar ou inativar item do catálogo | [PATCH /administracao/catalogos/{catalogo}/{id}](#patch_administracao_catalogos_catalogo_id) |
| Equipe, usuários e perfis | Montar administração de acessos | [GET /administracao/acessos](#get_administracao_acessos) |
| Formulário de usuário | Cadastrar usuário com perfis e equipes | [POST /administracao/usuarios](#post_administracao_usuarios) |
| Formulário de usuário | Salvar usuário, perfis, equipes ou desativação | [PATCH /administracao/usuarios/{id}](#patch_administracao_usuarios_id) |
| Recuperação de acesso pela equipe | Definir senha temporária por administrador | [POST /administracao/usuarios/{id}/senha](#post_administracao_usuarios_id_senha) |
| Equipe, usuários e perfis | Cadastrar perfil de acesso | [POST /administracao/perfis](#post_administracao_perfis) |
| Equipe, usuários e perfis | Salvar ou inativar perfil de acesso | [PATCH /administracao/perfis/{id}](#patch_administracao_perfis_id) |
| Equipe, usuários e perfis | Cadastrar equipe | [POST /administracao/equipes](#post_administracao_equipes) |
| Equipe, usuários e perfis | Salvar ou inativar equipe | [PATCH /administracao/equipes/{id}](#patch_administracao_equipes_id) |
| Configurações do gabinete | Carregar formulário de configurações autorizado | [GET /administracao/configuracoes](#get_administracao_configuracoes) |
| Configurações do gabinete | Salvar blocos alterados em uma ação | [PATCH /administracao/configuracoes](#patch_administracao_configuracoes) |
| Mensagens vinculadas ao pedido | Carregar mais mensagens do protocolo | [GET /atendimentos/{id}/mensagens](#get_atendimentos_id_mensagens) |

<a id="post_auth_login"></a>
## POST /auth/login

**Tela:** Entrar. **Ação:** Entrar no sistema.

Valida credenciais, cria sessão HttpOnly/Secure/SameSite e já retorna App com menu, permissões, preferências e CSRF. Sem GETs adicionais de me/permissões/capacidades após login.

Permissões: público.

Entrada obrigatória `application/json`: [Login](#schema-Login).

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| email | string (email) | sim | E-mail de acesso. |
| senha | string | sim | Segredo; não auditar em claro. · minLength=8; somente entrada; segredo não auditável em claro |

```json
{
  "email": "operador@example.invalid",
  "senha": "senha-apenas-exemplo"
}
```

**Resposta 200:** Dados prontos para a tela, no alcance autorizado.

`application/json` · [App](#schema-App)

```json
{
  "conta": {
    "id": "11111111-1111-4111-8111-111111111111",
    "versao": 1,
    "etag": "\"edicao-1\"",
    "nome": "Operador Exemplo",
    "email": "operador@example.invalid",
    "preferencias": {
      "ocultarFotosMunicipes": false,
      "fusoHorario": "America/Sao_Paulo",
      "receberAlertasWhatsapp": true
    },
    "disponibilidade": {
      "estado": "disponivel",
      "capacidade": 3
    }
  },
  "etagConta": "\"edicao-1\"",
  "csrfToken": "csrf-exemplo",
  "permissoes": [
    "municipes.editar"
  ],
  "menu": [
    "municipes"
  ],
  "limites": {
    "maxUploadBytes": 26214400,
    "maxArquivosPorLote": 10,
    "maxAudioSegundos": 600,
    "maxObservacaoCaracteres": 100000,
    "mimeTypes": [
      "application/pdf"
    ],
    "maxItensPorColecao": 100,
    "maxDestinatariosEtiquetas": 5000
  },
  "notificacoesNaoLidas": 1,
  "avisosWhatsapp": [
    "WhatsApp desconectado."
  ]
}
```

| Header retornado | Uso |
| --- | --- |
| Cache-Control | Sem cache público de dados pessoais/QR. |
| X-Request-Id | Correlação e cache. |
| Set-Cookie | crm_sessao=<opaque>; HttpOnly; Secure; SameSite=Strict; Path=/api/v1. Sessão enviada automaticamente por APIs, arquivos e SSE same-origin. |

Erros: `400`, `409`, `422`, `429`, `500`, `503`. Ver [envelope e comportamento](README.md#erros).

O backend resolve nesta ação: autenticar; criar sessão; montar bootstrap.

<a id="get_app"></a>
## GET /app

**Tela:** Inicialização. **Ação:** Restaurar sessão e montar a aplicação.

Uma chamada no reload monta identidade, menu, preferências, disponibilidade, limites e badges. Cookie de sessão enviado pelo navegador; devolve CSRF para gravações. Não retorna refresh/access token para o frontend administrar.

Permissões: sessão e acesso atual ao recurso.

**Resposta 200:** Dados prontos para a tela, no alcance autorizado.

`application/json` · [App](#schema-App)

```json
{
  "conta": {
    "id": "11111111-1111-4111-8111-111111111111",
    "versao": 1,
    "etag": "\"edicao-1\"",
    "nome": "Operador Exemplo",
    "email": "operador@example.invalid",
    "preferencias": {
      "ocultarFotosMunicipes": false,
      "fusoHorario": "America/Sao_Paulo",
      "receberAlertasWhatsapp": true
    },
    "disponibilidade": {
      "estado": "disponivel",
      "capacidade": 3
    }
  },
  "etagConta": "\"edicao-1\"",
  "csrfToken": "csrf-exemplo",
  "permissoes": [
    "municipes.editar"
  ],
  "menu": [
    "municipes"
  ],
  "limites": {
    "maxUploadBytes": 26214400,
    "maxArquivosPorLote": 10,
    "maxAudioSegundos": 600,
    "maxObservacaoCaracteres": 100000,
    "mimeTypes": [
      "application/pdf"
    ],
    "maxItensPorColecao": 100,
    "maxDestinatariosEtiquetas": 5000
  },
  "notificacoesNaoLidas": 1,
  "avisosWhatsapp": [
    "WhatsApp desconectado."
  ]
}
```

| Header retornado | Uso |
| --- | --- |
| Cache-Control | Sem cache público de dados pessoais/QR. |
| X-Request-Id | Correlação e cache. |

Erros: `400`, `401`, `403`, `422`, `429`, `500`, `503`. Ver [envelope e comportamento](README.md#erros).

<a id="post_auth_logout"></a>
## POST /auth/logout

**Tela:** Menu da conta. **Ação:** Sair e desvincular alertas da sessão.

Revoga sessão, invalida novos envios push vinculados e expira cookie. Notificações já em trânsito podem chegar com conteúdo mínimo.

Permissões: sessão e acesso atual ao recurso.

| Nome | Local | Obrigatório | Tipo | Uso |
| --- | --- | --- | --- | --- |
| X-CSRF-Token | header | sim | string | Obrigatório nas chamadas autenticadas não GET; cookie HttpOnly é enviado automaticamente pelo navegador. |

**Resposta 204:** Operação concluída, sem corpo.

| Header retornado | Uso |
| --- | --- |
| Cache-Control | Sem cache público de dados pessoais/QR. |
| X-Request-Id | Correlação e cache. |
| X-Activity-Id | Atividade do comando agregado, com seus detalhes por campo/vínculo. |
| Set-Cookie | Expira crm_sessao e revoga sessão no servidor. |

Erros: `400`, `401`, `403`, `409`, `422`, `429`, `500`, `503`. Ver [envelope e comportamento](README.md#erros).

<a id="patch_conta"></a>
## PATCH /conta

**Tela:** Preferências e disponibilidade. **Ação:** Salvar minhas preferências ou disponibilidade.

If-Match é etagConta do bootstrap/resultado. Um bloco omitido permanece; altera fotos ocultas, alertas e/ou disponibilidade em uma ação, sem afetar colegas.

Permissões: sessão e acesso atual ao recurso.

| Nome | Local | Obrigatório | Tipo | Uso |
| --- | --- | --- | --- | --- |
| X-CSRF-Token | header | sim | string | Obrigatório nas chamadas autenticadas não GET; cookie HttpOnly é enviado automaticamente pelo navegador. |
| Idempotency-Key | header | sim | string | Mesma identidade+rota+chave+corpo não repete efeitos. Corpo alterado usa nova chave. |
| If-Match | header | sim | string | Versão do agregado/item especificado. 428 ausente, 412 desatualizado; não aceitar *. |

Entrada obrigatória `application/json`: [ContaAlterar](#schema-ContaAlterar).

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| preferencias | Preferencias | não | Preferencias |
| disponibilidade | Disponibilidade | não | Disponibilidade |

```json
{
  "preferencias": {
    "ocultarFotosMunicipes": false,
    "fusoHorario": "America/Sao_Paulo",
    "receberAlertasWhatsapp": true
  },
  "disponibilidade": {
    "estado": "disponivel",
    "capacidade": 3
  }
}
```

**Resposta 200:** Dados prontos para a tela, no alcance autorizado.

`application/json` · [Conta](#schema-Conta)

```json
{
  "id": "11111111-1111-4111-8111-111111111111",
  "versao": 1,
  "etag": "\"edicao-1\"",
  "nome": "Operador Exemplo",
  "email": "operador@example.invalid",
  "preferencias": {
    "ocultarFotosMunicipes": false,
    "fusoHorario": "America/Sao_Paulo",
    "receberAlertasWhatsapp": true
  },
  "disponibilidade": {
    "estado": "disponivel",
    "capacidade": 3
  }
}
```

| Header retornado | Uso |
| --- | --- |
| Cache-Control | Sem cache público de dados pessoais/QR. |
| X-Request-Id | Correlação e cache. |
| ETag | Usar este ETag na edição do agregado indicado. |
| X-Activity-Id | Atividade do comando agregado, com seus detalhes por campo/vínculo. |

Erros: `400`, `401`, `403`, `409`, `412`, `422`, `428`, `429`, `500`, `503`. Ver [envelope e comportamento](README.md#erros).

<a id="post_conta_senha"></a>
## POST /conta/senha

**Tela:** Alterar senha. **Ação:** Trocar minha senha.

Valida senha atual, altera segredo e revoga outras sessões; auditoria registra evento sem valores de senhas. Não oferece reversão para recuperar senha antiga.

Permissões: sessão e acesso atual ao recurso.

| Nome | Local | Obrigatório | Tipo | Uso |
| --- | --- | --- | --- | --- |
| X-CSRF-Token | header | sim | string | Obrigatório nas chamadas autenticadas não GET; cookie HttpOnly é enviado automaticamente pelo navegador. |

Entrada obrigatória `application/json`: [SenhaAlterar](#schema-SenhaAlterar).

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| senhaAtual | string | sim | Senha atual. · somente entrada; segredo não auditável em claro |
| novaSenha | string | sim | Nova senha. · minLength=12; somente entrada; segredo não auditável em claro |

```json
{
  "senhaAtual": "senha-atual-exemplo",
  "novaSenha": "nova-senha-apenas-exemplo"
}
```

**Resposta 204:** Operação concluída, sem corpo.

| Header retornado | Uso |
| --- | --- |
| Cache-Control | Sem cache público de dados pessoais/QR. |
| X-Request-Id | Correlação e cache. |
| X-Activity-Id | Atividade do comando agregado, com seus detalhes por campo/vínculo. |

Erros: `400`, `401`, `403`, `409`, `422`, `429`, `500`, `503`. Ver [envelope e comportamento](README.md#erros).

<a id="get_opcoes"></a>
## GET /opcoes

**Tela:** Autocomplete compartilhado. **Ação:** Pesquisar opções de um campo.

Lookup somente dos tipos enumerados, retornando ID e rótulo prontos. O campo já selecionado vem na tela de origem; esta chamada só ocorre quando o usuário pesquisa mais opções. Não é consulta livre de tabelas.

Permissões: sessão e acesso atual ao recurso.

| Nome | Local | Obrigatório | Tipo | Uso |
| --- | --- | --- | --- | --- |
| limite | query | não | integer | Limite, máximo 100. |
| cursor | query | não | string | Retomar a página sem refazer consultas por item. |
| incluirTotal | query | não | boolean | Default false. |
| tipo | query | sim | enum: municipe, indicador, responsavel, equipe, classificacao, servico, categoria, evento, modelo_etiqueta, formato_etiqueta | Tipo obrigatório e validado por permissão. |
| q | query | não | string | Busca no campo permitido. |
| excluirMunicipeId | query | não | string (uuid) | Ao escolher indicador, excluir a própria pessoa; ciclos continuam validados ao salvar. |

**Resposta 200:** Dados prontos para a tela, no alcance autorizado.

`application/json` · [OpcoesBusca](#schema-OpcoesBusca)

```json
{
  "dados": [
    {
      "id": "11111111-1111-4111-8111-111111111111",
      "rotulo": "Ana Exemplo",
      "ativo": true
    }
  ],
  "paginacao": {
    "proximoCursor": null,
    "total": 1,
    "limite": 25
  }
}
```

| Header retornado | Uso |
| --- | --- |
| Cache-Control | Sem cache público de dados pessoais/QR. |
| X-Request-Id | Correlação e cache. |

Erros: `400`, `401`, `403`, `422`, `429`, `500`, `503`. Ver [envelope e comportamento](README.md#erros).

<a id="get_municipes_formulario"></a>
## GET /municipes/formulario

**Tela:** Cadastrar munícipe. **Ação:** Montar o formulário de novo munícipe.

Retorna valores iniciais permitidos, opções pequenas, limites e contexto da conversa, se houver. Não cria pessoa nem rascunho persistido. O frontend cria rascunhoId local para arquivos.

Permissões: `municipes.criar`.

| Nome | Local | Obrigatório | Tipo | Uso |
| --- | --- | --- | --- | --- |
| conversaId | query | não | string (uuid) | Prefill autorizado de contato, quando aberto pela caixa. |

**Resposta 200:** Dados prontos para a tela, no alcance autorizado.

`application/json` · [FormularioMunicipe](#schema-FormularioMunicipe)

```json
{
  "valoresIniciais": {
    "contatos": [],
    "enderecos": [],
    "documentos": [],
    "classificacaoIds": [],
    "fotos": [],
    "preferenciaContato": {
      "permitirProativo": true
    }
  },
  "contexto": {
    "sexos": [
      {
        "codigo": "nao_informado",
        "rotulo": "Não informado"
      }
    ],
    "tiposDocumento": [
      "cpf"
    ],
    "classificacoesIniciais": [
      {
        "id": "11111111-1111-4111-8111-111111111111",
        "rotulo": "Ana Exemplo",
        "ativo": true
      }
    ],
    "responsaveisIniciais": [
      {
        "id": "11111111-1111-4111-8111-111111111111",
        "rotulo": "Ana Exemplo",
        "ativo": true
      }
    ],
    "servicosIniciais": [
      {
        "id": "11111111-1111-4111-8111-111111111111",
        "rotulo": "Ana Exemplo",
        "ativo": true
      }
    ],
    "limites": {
      "maxUploadBytes": 26214400,
      "maxArquivosPorLote": 10,
      "maxAudioSegundos": 600,
      "maxObservacaoCaracteres": 100000,
      "mimeTypes": [
        "application/pdf"
      ],
      "maxItensPorColecao": 100,
      "maxDestinatariosEtiquetas": 5000
    },
    "permissoes": {
      "acoes": [
        "salvar"
      ],
      "camposEditaveis": [
        "contatos"
      ]
    }
  },
  "conversaOrigem": {
    "conversaId": "11111111-1111-4111-8111-111111111111",
    "etagConversa": "\"conversa-1\""
  }
}
```

| Header retornado | Uso |
| --- | --- |
| Cache-Control | Sem cache público de dados pessoais/QR. |
| X-Request-Id | Correlação e cache. |

Erros: `400`, `401`, `403`, `422`, `429`, `500`, `503`. Ver [envelope e comportamento](README.md#erros).

<a id="post_municipes_pesquisa"></a>
## POST /municipes/pesquisa

**Tela:** Lista e relatório de munícipes. **Ação:** Pesquisar, filtrar e paginar munícipes.

Mesma consulta usada pela lista, relatório e busca geral. Retorna nomes/referências/contadores/trechos autorizados prontos, uma pessoa por resultado. Sem GET duplicado de relatório ou um GET por pessoa.

Permissões: `municipes.ler`.

| Nome | Local | Obrigatório | Tipo | Uso |
| --- | --- | --- | --- | --- |
| X-CSRF-Token | header | sim | string | Obrigatório nas chamadas autenticadas não GET; cookie HttpOnly é enviado automaticamente pelo navegador. |

Entrada obrigatória `application/json`: [PesquisaMunicipes](#schema-PesquisaMunicipes).

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| q | string | não | Busca em dados atuais e atendimentos autorizados, com origem da coincidência. · maxLength=500 |
| filtros | FiltrosMunicipes | não | Grupos com E; múltiplos valores com OU, salvo classificações=todas. Sem filtro de anotação manual de voto. |
| cursor | string | não | Cursor retornado para esta consulta. |
| limite | integer | não | Default 25, máximo 100. · minimum=1; maximum=100 |
| incluirTotal | boolean | não | Solicitar total autorizado. |
| ordenarPor | enum: nome, nascimento, cadastradoEm, ultimaInteracaoEm, diasSemContato, diasComInteracao, quantidadeAtendimentos | não | Ordenação permitida desta lista/relatório, sem campos restritos. |
| direcao | enum: asc, desc | não | Sentido. |

```json
{
  "q": "futebol iluminação",
  "filtros": {
    "sexoCodigos": [
      "nao_informado"
    ],
    "nascimento": {
      "modo": "componentes",
      "dia": 15,
      "mes": 11,
      "ano": 1990
    },
    "cadastro": {
      "modo": "componentes",
      "dia": 15,
      "mes": 11,
      "ano": 1990
    },
    "classificacaoIds": [
      "11111111-1111-4111-8111-111111111111"
    ],
    "classificacaoModo": "qualquer",
    "semClassificacao": false,
    "incluirClassificacoesInativas": false,
    "bairro": "Centro",
    "cidade": "São Paulo",
    "uf": "SP",
    "cep": "01001000",
    "logradouro": "Rua Exemplo",
    "documento": "DOC-EXEMPLO",
    "contato": "+5511999990000",
    "atendimento": {
      "existe": true,
      "situacoes": [
        "aberto"
      ],
      "servicoIds": [
        "11111111-1111-4111-8111-111111111111"
      ],
      "responsavelIds": [
        "11111111-1111-4111-8111-111111111111"
      ],
      "abertura": {
        "modo": "componentes",
        "dia": 15,
        "mes": 11,
        "ano": 1990
      },
      "conclusao": {
        "modo": "componentes",
        "dia": 15,
        "mes": 11,
        "ano": 1990
      }
    },
    "semInteracaoRegistrada": false,
    "diasSemContatoMin": 90,
    "diasSemContatoMax": 180,
    "diasComInteracaoMin": 3,
    "ultimaInteracao": {
      "modo": "componentes",
      "dia": 15,
      "mes": 11,
      "ano": 1990
    },
    "proximoContato": {
      "modo": "componentes",
      "dia": 15,
      "mes": 11,
      "ano": 1990
    },
    "arquivado": false,
    "fusoHorario": "America/Sao_Paulo"
  },
  "cursor": "cursor-exemplo",
  "limite": 25,
  "incluirTotal": true,
  "ordenarPor": "nome",
  "direcao": "asc"
}
```

**Resposta 200:** Dados prontos para a tela, no alcance autorizado.

`application/json` · [ResultadoPesquisaMunicipes](#schema-ResultadoPesquisaMunicipes)

```json
{
  "dados": [
    {
      "pessoa": {
        "id": "11111111-1111-4111-8111-111111111111",
        "nome": "Ana Exemplo",
        "bairro": "Centro",
        "contatoPrincipal": "+5511999990000",
        "foto": {
          "id": "11111111-1111-4111-8111-111111111111",
          "nome": "foto-exemplo.jpg",
          "mimeType": "image/jpeg",
          "tamanhoBytes": 1024,
          "url": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo",
          "miniaturaUrl": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo?variante=miniatura"
        },
        "arquivado": false
      },
      "classificacoes": [
        {
          "id": "11111111-1111-4111-8111-111111111111",
          "rotulo": "Ana Exemplo",
          "ativo": true
        }
      ],
      "contato": {
        "ultimaInteracaoEm": "2026-11-16T17:00:00Z",
        "diasSemContato": 75,
        "janelaDias": 90,
        "diasComInteracao": 8,
        "mensagensRecebidas": 20,
        "mensagensEnviadas": 10,
        "atendimentos": 2,
        "ultimaTentativaEm": "2026-11-16T17:00:00Z",
        "cobertura": "disponivel"
      },
      "correspondencias": [
        {
          "campo": "atendimento.descricao",
          "trecho": "Pedido de iluminação.",
          "atendimentoId": "11111111-1111-4111-8111-111111111111"
        }
      ],
      "acoesPermitidas": [
        "abrir_ficha"
      ]
    }
  ],
  "paginacao": {
    "proximoCursor": null,
    "total": 1,
    "limite": 25
  },
  "resumoFiltros": [
    "Aniversariantes de novembro"
  ]
}
```

| Header retornado | Uso |
| --- | --- |
| Cache-Control | Sem cache público de dados pessoais/QR. |
| X-Request-Id | Correlação e cache. |

Erros: `400`, `401`, `403`, `422`, `429`, `500`, `503`. Ver [envelope e comportamento](README.md#erros).

<a id="post_municipes"></a>
## POST /municipes

**Tela:** Cadastrar munícipe. **Ação:** Salvar munícipe completo.

Um POST recebe o formulário inteiro e publica o agregado atomicamente. Contatos são normalizados/criados/reutilizados no backend; nenhum endereço/documento/vínculo exige POST prévio. Uploads em lote são a única preparação de bytes. Se houver duplicidade, 409 traz candidatos e token de revisão na mesma resposta; nada fica parcialmente cadastrado. Campos restritos exigem permissão específica, inclusive indicação e anotação manual.

Permissões: `municipes.criar`.

| Nome | Local | Obrigatório | Tipo | Uso |
| --- | --- | --- | --- | --- |
| X-CSRF-Token | header | sim | string | Obrigatório nas chamadas autenticadas não GET; cookie HttpOnly é enviado automaticamente pelo navegador. |
| Idempotency-Key | header | sim | string | Mesma identidade+rota+chave+corpo não repete efeitos. Corpo alterado usa nova chave. |

Entrada obrigatória `application/json`: [CadastroMunicipe](#schema-CadastroMunicipe).

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| nome | string | sim | Nome informado, sem documento obrigatório. · minLength=1; maxLength=200 |
| sexoCodigo | string \| null | não | Informação declarada opcional. |
| nascimento | string (date) \| null | não | Data civil no formato AAAA-MM-DD, sem conversão de fuso. |
| observacoes | string \| null | não | Texto final completo do editor, inclusive digitação ainda não salva e trecho transcrito revisado. |
| contatos | array<ContatoFormulario> | não | Lista de valores. · minItems=0; maxItems=100 |
| enderecos | array<EnderecoFormulario> | não | Lista de valores. · minItems=0; maxItems=100 |
| documentos | array<DocumentoFormulario> | não | Lista de valores. · minItems=0; maxItems=100 |
| classificacaoIds | array<string (uuid)> | não | Lista de valores. · minItems=0; maxItems=100 |
| indicadoPorMunicipeId | string (uuid) \| null | não | Outro munícipe existente ou null; valida ciclos sob concorrência. |
| votoGarantido | boolean | não | Anotação manual restrita. False é não marcado; sem inferência/verificação ou uso para comunicação. |
| preferenciaContato | PreferenciaContato | não | PreferenciaContato |
| fotos | array<FotoFormulario> | não | Lista de valores. · minItems=0; maxItems=100 |
| transcricoesUtilizadas | array<OrigemTranscricao> | não | Lista de valores. · minItems=0; maxItems=100 |
| rascunhoId | string (uuid) | não | Necessário se houver uploads/transcrições do formulário. |
| decisaoDuplicidade | DecisaoDuplicidade | não | DecisaoDuplicidade |
| contextoConversa | ContextoConversaSalvar | não | ContextoConversaSalvar |

```json
{
  "nome": "Ana Exemplo",
  "sexoCodigo": null,
  "nascimento": "1990-11-15",
  "observacoes": "Participa do futebol. Prefere contato à tarde.",
  "contatos": [
    {
      "chave": "telefone-1",
      "tipo": "telefone",
      "valor": "+5511999990000",
      "relacao": "Telefone da família.",
      "principal": true
    }
  ],
  "enderecos": [
    {
      "chave": "endereco-1",
      "logradouro": "Rua Exemplo",
      "numero": "100",
      "complemento": null,
      "bairro": "Centro",
      "cidade": "São Paulo",
      "uf": "SP",
      "cep": "01001000",
      "principal": true
    }
  ],
  "documentos": [
    {
      "chave": "documento-1",
      "tipo": "outro",
      "valor": "DOC-EXEMPLO",
      "orgaoEmissor": null
    }
  ],
  "classificacaoIds": [
    "33333333-3333-4333-8333-333333333333"
  ],
  "indicadoPorMunicipeId": "33333333-3333-4333-8333-333333333333",
  "preferenciaContato": {
    "permitirProativo": true
  },
  "fotos": [
    {
      "chave": "foto-1",
      "uploadToken": "upload-opaco-exemplo",
      "legenda": "Foto de reconhecimento.",
      "principal": true
    }
  ],
  "transcricoesUtilizadas": [
    {
      "transcricaoId": "11111111-1111-4111-8111-111111111111",
      "trechoAceito": "Prefere contato à tarde."
    }
  ],
  "rascunhoId": "11111111-1111-4111-8111-111111111111"
}
```

**Resposta 201:** Dados prontos para a tela, no alcance autorizado.

`application/json` · [FichaMunicipe](#schema-FichaMunicipe)

```json
{
  "id": "11111111-1111-4111-8111-111111111111",
  "versao": 1,
  "etag": "\"edicao-1\"",
  "pessoa": {
    "id": "11111111-1111-4111-8111-111111111111",
    "nome": "Ana Exemplo",
    "bairro": "Centro",
    "contatoPrincipal": "+5511999990000",
    "foto": {
      "id": "11111111-1111-4111-8111-111111111111",
      "nome": "foto-exemplo.jpg",
      "mimeType": "image/jpeg",
      "tamanhoBytes": 1024,
      "url": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo",
      "miniaturaUrl": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo?variante=miniatura"
    },
    "arquivado": false
  },
  "formulario": {
    "nome": "Ana Exemplo",
    "sexoCodigo": null,
    "nascimento": "1990-11-15",
    "observacoes": "Participa do futebol. Prefere contato à tarde.",
    "contatos": [
      {
        "chave": "telefone-1",
        "id": "11111111-1111-4111-8111-111111111111",
        "tipo": "telefone",
        "valor": "+5511999990000",
        "relacao": "Telefone da família.",
        "principal": true
      }
    ],
    "enderecos": [
      {
        "chave": "endereco-1",
        "id": "11111111-1111-4111-8111-111111111111",
        "logradouro": "Rua Exemplo",
        "numero": "100",
        "complemento": null,
        "bairro": "Centro",
        "cidade": "São Paulo",
        "uf": "SP",
        "cep": "01001000",
        "principal": true
      }
    ],
    "documentos": [
      {
        "chave": "documento-1",
        "id": "11111111-1111-4111-8111-111111111111",
        "tipo": "outro",
        "valor": "DOC-EXEMPLO",
        "orgaoEmissor": null
      }
    ],
    "classificacaoIds": [
      "33333333-3333-4333-8333-333333333333"
    ],
    "indicadoPorMunicipeId": "33333333-3333-4333-8333-333333333333",
    "preferenciaContato": {
      "permitirProativo": true
    },
    "fotos": [
      {
        "chave": "foto-1",
        "id": "11111111-1111-4111-8111-111111111111",
        "legenda": "Foto de reconhecimento.",
        "principal": true
      }
    ],
    "transcricoesUtilizadas": [
      {
        "transcricaoId": "11111111-1111-4111-8111-111111111111",
        "trechoAceito": "Prefere contato à tarde."
      }
    ]
  },
  "referencias": {
    "indicador": {
      "id": "11111111-1111-4111-8111-111111111111",
      "rotulo": "Ana Exemplo",
      "ativo": true
    },
    "classificacoes": [
      {
        "id": "11111111-1111-4111-8111-111111111111",
        "rotulo": "Ana Exemplo",
        "ativo": true
      }
    ]
  },
  "fotos": [
    {
      "id": "11111111-1111-4111-8111-111111111111",
      "nome": "foto-exemplo.jpg",
      "mimeType": "image/jpeg",
      "tamanhoBytes": 1024,
      "url": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo",
      "miniaturaUrl": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo?variante=miniatura"
    }
  ],
  "contextoEdicao": {
    "sexos": [
      {
        "codigo": "nao_informado",
        "rotulo": "Não informado"
      }
    ],
    "tiposDocumento": [
      "cpf"
    ],
    "classificacoesIniciais": [
      {
        "id": "11111111-1111-4111-8111-111111111111",
        "rotulo": "Ana Exemplo",
        "ativo": true
      }
    ],
    "responsaveisIniciais": [
      {
        "id": "11111111-1111-4111-8111-111111111111",
        "rotulo": "Ana Exemplo",
        "ativo": true
      }
    ],
    "servicosIniciais": [
      {
        "id": "11111111-1111-4111-8111-111111111111",
        "rotulo": "Ana Exemplo",
        "ativo": true
      }
    ],
    "limites": {
      "maxUploadBytes": 26214400,
      "maxArquivosPorLote": 10,
      "maxAudioSegundos": 600,
      "maxObservacaoCaracteres": 100000,
      "mimeTypes": [
        "application/pdf"
      ],
      "maxItensPorColecao": 100,
      "maxDestinatariosEtiquetas": 5000
    },
    "permissoes": {
      "acoes": [
        "salvar"
      ],
      "camposEditaveis": [
        "contatos"
      ]
    }
  },
  "resumoContato": {
    "ultimaInteracaoEm": "2026-11-16T17:00:00Z",
    "diasSemContato": 75,
    "janelaDias": 90,
    "diasComInteracao": 8,
    "mensagensRecebidas": 20,
    "mensagensEnviadas": 10,
    "atendimentos": 2,
    "ultimaTentativaEm": "2026-11-16T17:00:00Z",
    "cobertura": "disponivel"
  },
  "atendimentosRecentes": [
    {
      "id": "11111111-1111-4111-8111-111111111111",
      "protocolo": "2026-000001",
      "titulo": "Pedido de iluminação",
      "situacao": "aberto",
      "pessoa": {
        "id": "11111111-1111-4111-8111-111111111111",
        "rotulo": "Ana Exemplo",
        "ativo": true
      },
      "responsavel": {
        "id": "11111111-1111-4111-8111-111111111111",
        "rotulo": "Ana Exemplo",
        "ativo": true
      },
      "abertoEm": "2026-11-16T17:00:00Z",
      "prazo": "2026-11-16T17:00:00Z",
      "acoesPermitidas": [
        "abrir"
      ],
      "identidadePendente": false
    }
  ],
  "atividadesRecentes": [
    {
      "id": "11111111-1111-4111-8111-111111111111",
      "acao": "municipe.atualizado",
      "alvoTipo": "municipe",
      "alvoId": "11111111-1111-4111-8111-111111111111",
      "autor": {
        "tipo": "usuario",
        "usuarioId": "11111111-1111-4111-8111-111111111111",
        "nome": "Operador Exemplo"
      },
      "ocorridoEm": "2026-11-16T17:00:00Z",
      "resumo": "Ficha atualizada.",
      "podeReverter": true
    }
  ],
  "marcacaoVotoAtualizadaEm": "2026-11-16T17:00:00Z",
  "marcacaoVotoAtualizadaPor": {
    "id": "11111111-1111-4111-8111-111111111111",
    "rotulo": "Ana Exemplo",
    "ativo": true
  },
  "conversaAtualizada": {
    "id": "11111111-1111-4111-8111-111111111111",
    "etag": "\"conversa-1\"",
    "pessoa": {
      "id": "11111111-1111-4111-8111-111111111111",
      "nome": "Ana Exemplo",
      "bairro": "Centro",
      "contatoPrincipal": "+5511999990000",
      "foto": {
        "id": "11111111-1111-4111-8111-111111111111",
        "nome": "foto-exemplo.jpg",
        "mimeType": "image/jpeg",
        "tamanhoBytes": 1024,
        "url": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo",
        "miniaturaUrl": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo?variante=miniatura"
      },
      "arquivado": false
    },
    "contatoCanal": "+5511999990000",
    "estado": "aguardando",
    "responsavel": {
      "id": "11111111-1111-4111-8111-111111111111",
      "rotulo": "Ana Exemplo",
      "ativo": true
    },
    "equipe": {
      "id": "11111111-1111-4111-8111-111111111111",
      "rotulo": "Ana Exemplo",
      "ativo": true
    },
    "naoLidas": 1,
    "ultimaMensagem": "Gostaria de saber o andamento.",
    "ultimaMensagemEm": "2026-11-16T17:00:00Z"
  }
}
```

| Header retornado | Uso |
| --- | --- |
| Cache-Control | Sem cache público de dados pessoais/QR. |
| X-Request-Id | Correlação e cache. |
| ETag | Usar este ETag na edição do agregado indicado. |
| X-Activity-Id | Atividade do comando agregado, com seus detalhes por campo/vínculo. |

Erros: `400`, `401`, `403`, `409`, `422`, `429`, `500`, `503`. Ver [envelope e comportamento](README.md#erros).

O backend resolve nesta ação: validar formulário/permissões; reavaliar duplicidade; criar pessoa; resolver contatos compartilhados; salvar endereços/documentos/classificações/indicação/preferência; consumir uploads e registrar fotos; registrar origem de transcrição; vincular contexto da conversa se pedido; auditar e retornar ficha pronta.

<a id="get_municipes_id"></a>
## GET /municipes/{id}

**Tela:** Ficha e edição do munícipe. **Ação:** Abrir ficha pronta para consultar e editar.

Retorna formulário completo autorizado, nomes dos selecionados, fotos/URLs, resumo de contato, pedidos e atividades recentes e permissões. Nada de montar a ficha consultando contatos, documentos, indicador e classificações separadamente. Longos históricos ficam sob demanda.

Permissões: `municipes.ler`.

| Nome | Local | Obrigatório | Tipo | Uso |
| --- | --- | --- | --- | --- |
| id | path | sim | string (uuid) | Identificador interno UUID. |

**Resposta 200:** Dados prontos para a tela, no alcance autorizado.

`application/json` · [FichaMunicipe](#schema-FichaMunicipe)

```json
{
  "id": "11111111-1111-4111-8111-111111111111",
  "versao": 1,
  "etag": "\"edicao-1\"",
  "pessoa": {
    "id": "11111111-1111-4111-8111-111111111111",
    "nome": "Ana Exemplo",
    "bairro": "Centro",
    "contatoPrincipal": "+5511999990000",
    "foto": {
      "id": "11111111-1111-4111-8111-111111111111",
      "nome": "foto-exemplo.jpg",
      "mimeType": "image/jpeg",
      "tamanhoBytes": 1024,
      "url": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo",
      "miniaturaUrl": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo?variante=miniatura"
    },
    "arquivado": false
  },
  "formulario": {
    "nome": "Ana Exemplo",
    "sexoCodigo": null,
    "nascimento": "1990-11-15",
    "observacoes": "Participa do futebol. Prefere contato à tarde.",
    "contatos": [
      {
        "chave": "telefone-1",
        "id": "11111111-1111-4111-8111-111111111111",
        "tipo": "telefone",
        "valor": "+5511999990000",
        "relacao": "Telefone da família.",
        "principal": true
      }
    ],
    "enderecos": [
      {
        "chave": "endereco-1",
        "id": "11111111-1111-4111-8111-111111111111",
        "logradouro": "Rua Exemplo",
        "numero": "100",
        "complemento": null,
        "bairro": "Centro",
        "cidade": "São Paulo",
        "uf": "SP",
        "cep": "01001000",
        "principal": true
      }
    ],
    "documentos": [
      {
        "chave": "documento-1",
        "id": "11111111-1111-4111-8111-111111111111",
        "tipo": "outro",
        "valor": "DOC-EXEMPLO",
        "orgaoEmissor": null
      }
    ],
    "classificacaoIds": [
      "33333333-3333-4333-8333-333333333333"
    ],
    "indicadoPorMunicipeId": "33333333-3333-4333-8333-333333333333",
    "preferenciaContato": {
      "permitirProativo": true
    },
    "fotos": [
      {
        "chave": "foto-1",
        "id": "11111111-1111-4111-8111-111111111111",
        "legenda": "Foto de reconhecimento.",
        "principal": true
      }
    ],
    "transcricoesUtilizadas": [
      {
        "transcricaoId": "11111111-1111-4111-8111-111111111111",
        "trechoAceito": "Prefere contato à tarde."
      }
    ]
  },
  "referencias": {
    "indicador": {
      "id": "11111111-1111-4111-8111-111111111111",
      "rotulo": "Ana Exemplo",
      "ativo": true
    },
    "classificacoes": [
      {
        "id": "11111111-1111-4111-8111-111111111111",
        "rotulo": "Ana Exemplo",
        "ativo": true
      }
    ]
  },
  "fotos": [
    {
      "id": "11111111-1111-4111-8111-111111111111",
      "nome": "foto-exemplo.jpg",
      "mimeType": "image/jpeg",
      "tamanhoBytes": 1024,
      "url": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo",
      "miniaturaUrl": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo?variante=miniatura"
    }
  ],
  "contextoEdicao": {
    "sexos": [
      {
        "codigo": "nao_informado",
        "rotulo": "Não informado"
      }
    ],
    "tiposDocumento": [
      "cpf"
    ],
    "classificacoesIniciais": [
      {
        "id": "11111111-1111-4111-8111-111111111111",
        "rotulo": "Ana Exemplo",
        "ativo": true
      }
    ],
    "responsaveisIniciais": [
      {
        "id": "11111111-1111-4111-8111-111111111111",
        "rotulo": "Ana Exemplo",
        "ativo": true
      }
    ],
    "servicosIniciais": [
      {
        "id": "11111111-1111-4111-8111-111111111111",
        "rotulo": "Ana Exemplo",
        "ativo": true
      }
    ],
    "limites": {
      "maxUploadBytes": 26214400,
      "maxArquivosPorLote": 10,
      "maxAudioSegundos": 600,
      "maxObservacaoCaracteres": 100000,
      "mimeTypes": [
        "application/pdf"
      ],
      "maxItensPorColecao": 100,
      "maxDestinatariosEtiquetas": 5000
    },
    "permissoes": {
      "acoes": [
        "salvar"
      ],
      "camposEditaveis": [
        "contatos"
      ]
    }
  },
  "resumoContato": {
    "ultimaInteracaoEm": "2026-11-16T17:00:00Z",
    "diasSemContato": 75,
    "janelaDias": 90,
    "diasComInteracao": 8,
    "mensagensRecebidas": 20,
    "mensagensEnviadas": 10,
    "atendimentos": 2,
    "ultimaTentativaEm": "2026-11-16T17:00:00Z",
    "cobertura": "disponivel"
  },
  "atendimentosRecentes": [
    {
      "id": "11111111-1111-4111-8111-111111111111",
      "protocolo": "2026-000001",
      "titulo": "Pedido de iluminação",
      "situacao": "aberto",
      "pessoa": {
        "id": "11111111-1111-4111-8111-111111111111",
        "rotulo": "Ana Exemplo",
        "ativo": true
      },
      "responsavel": {
        "id": "11111111-1111-4111-8111-111111111111",
        "rotulo": "Ana Exemplo",
        "ativo": true
      },
      "abertoEm": "2026-11-16T17:00:00Z",
      "prazo": "2026-11-16T17:00:00Z",
      "acoesPermitidas": [
        "abrir"
      ],
      "identidadePendente": false
    }
  ],
  "atividadesRecentes": [
    {
      "id": "11111111-1111-4111-8111-111111111111",
      "acao": "municipe.atualizado",
      "alvoTipo": "municipe",
      "alvoId": "11111111-1111-4111-8111-111111111111",
      "autor": {
        "tipo": "usuario",
        "usuarioId": "11111111-1111-4111-8111-111111111111",
        "nome": "Operador Exemplo"
      },
      "ocorridoEm": "2026-11-16T17:00:00Z",
      "resumo": "Ficha atualizada.",
      "podeReverter": true
    }
  ],
  "marcacaoVotoAtualizadaEm": "2026-11-16T17:00:00Z",
  "marcacaoVotoAtualizadaPor": {
    "id": "11111111-1111-4111-8111-111111111111",
    "rotulo": "Ana Exemplo",
    "ativo": true
  },
  "conversaAtualizada": {
    "id": "11111111-1111-4111-8111-111111111111",
    "etag": "\"conversa-1\"",
    "pessoa": {
      "id": "11111111-1111-4111-8111-111111111111",
      "nome": "Ana Exemplo",
      "bairro": "Centro",
      "contatoPrincipal": "+5511999990000",
      "foto": {
        "id": "11111111-1111-4111-8111-111111111111",
        "nome": "foto-exemplo.jpg",
        "mimeType": "image/jpeg",
        "tamanhoBytes": 1024,
        "url": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo",
        "miniaturaUrl": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo?variante=miniatura"
      },
      "arquivado": false
    },
    "contatoCanal": "+5511999990000",
    "estado": "aguardando",
    "responsavel": {
      "id": "11111111-1111-4111-8111-111111111111",
      "rotulo": "Ana Exemplo",
      "ativo": true
    },
    "equipe": {
      "id": "11111111-1111-4111-8111-111111111111",
      "rotulo": "Ana Exemplo",
      "ativo": true
    },
    "naoLidas": 1,
    "ultimaMensagem": "Gostaria de saber o andamento.",
    "ultimaMensagemEm": "2026-11-16T17:00:00Z"
  }
}
```

| Header retornado | Uso |
| --- | --- |
| Cache-Control | Sem cache público de dados pessoais/QR. |
| X-Request-Id | Correlação e cache. |
| ETag | Usar este ETag na edição do agregado indicado. |

Erros: `400`, `401`, `403`, `404`, `422`, `429`, `500`, `503`. Ver [envelope e comportamento](README.md#erros).

<a id="patch_municipes_id"></a>
## PATCH /municipes/{id}

**Tela:** Ficha e edição do munícipe. **Ação:** Salvar a edição completa do formulário.

If-Match do agregado entregue pela ficha. Um PATCH grava todos os blocos alterados, incluindo vínculos, ordem/principal das fotos e campos manuais autorizados. Ausente mantém; lista presente é conjunto final editável. Se um item falha, nada do agregado é alterado; o erro aponta a chave do item. Não exige salvar observações antes de inserir transcrição revisada.

Permissões: `municipes.editar`.

| Nome | Local | Obrigatório | Tipo | Uso |
| --- | --- | --- | --- | --- |
| id | path | sim | string (uuid) | Identificador interno UUID. |
| X-CSRF-Token | header | sim | string | Obrigatório nas chamadas autenticadas não GET; cookie HttpOnly é enviado automaticamente pelo navegador. |
| Idempotency-Key | header | sim | string | Mesma identidade+rota+chave+corpo não repete efeitos. Corpo alterado usa nova chave. |
| If-Match | header | sim | string | Versão do agregado/item especificado. 428 ausente, 412 desatualizado; não aceitar *. |

Entrada obrigatória `application/json`: [EditarMunicipe](#schema-EditarMunicipe).

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| nome | string | não | Nome informado, sem documento obrigatório. · minLength=1; maxLength=200 |
| sexoCodigo | string \| null | não | Informação declarada opcional. |
| nascimento | string (date) \| null | não | Data civil no formato AAAA-MM-DD, sem conversão de fuso. |
| observacoes | string \| null | não | Texto final completo do editor, inclusive digitação ainda não salva e trecho transcrito revisado. |
| contatos | array<ContatoFormulario> | não | Lista de valores. · minItems=0; maxItems=100 |
| enderecos | array<EnderecoFormulario> | não | Lista de valores. · minItems=0; maxItems=100 |
| documentos | array<DocumentoFormulario> | não | Lista de valores. · minItems=0; maxItems=100 |
| classificacaoIds | array<string (uuid)> | não | Lista de valores. · minItems=0; maxItems=100 |
| indicadoPorMunicipeId | string (uuid) \| null | não | Outro munícipe existente ou null; valida ciclos sob concorrência. |
| votoGarantido | boolean | não | Anotação manual restrita. False é não marcado; sem inferência/verificação ou uso para comunicação. |
| preferenciaContato | PreferenciaContato | não | PreferenciaContato |
| fotos | array<FotoFormulario> | não | Lista de valores. · minItems=0; maxItems=100 |
| transcricoesUtilizadas | array<OrigemTranscricao> | não | Lista de valores. · minItems=0; maxItems=100 |
| rascunhoId | string (uuid) | não | Identificador interno UUID. |
| decisaoDuplicidade | DecisaoDuplicidade | não | DecisaoDuplicidade |
| motivoAlteracao | string | não | Justificativa quando necessária à ação. |

```json
{
  "observacoes": "Texto final inclui a digitação local e o trecho revisado.",
  "transcricoesUtilizadas": [
    {
      "transcricaoId": "11111111-1111-4111-8111-111111111111",
      "trechoAceito": "trecho revisado"
    }
  ]
}
```

**Resposta 200:** Dados prontos para a tela, no alcance autorizado.

`application/json` · [FichaMunicipe](#schema-FichaMunicipe)

```json
{
  "id": "11111111-1111-4111-8111-111111111111",
  "versao": 1,
  "etag": "\"edicao-1\"",
  "pessoa": {
    "id": "11111111-1111-4111-8111-111111111111",
    "nome": "Ana Exemplo",
    "bairro": "Centro",
    "contatoPrincipal": "+5511999990000",
    "foto": {
      "id": "11111111-1111-4111-8111-111111111111",
      "nome": "foto-exemplo.jpg",
      "mimeType": "image/jpeg",
      "tamanhoBytes": 1024,
      "url": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo",
      "miniaturaUrl": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo?variante=miniatura"
    },
    "arquivado": false
  },
  "formulario": {
    "nome": "Ana Exemplo",
    "sexoCodigo": null,
    "nascimento": "1990-11-15",
    "observacoes": "Participa do futebol. Prefere contato à tarde.",
    "contatos": [
      {
        "chave": "telefone-1",
        "id": "11111111-1111-4111-8111-111111111111",
        "tipo": "telefone",
        "valor": "+5511999990000",
        "relacao": "Telefone da família.",
        "principal": true
      }
    ],
    "enderecos": [
      {
        "chave": "endereco-1",
        "id": "11111111-1111-4111-8111-111111111111",
        "logradouro": "Rua Exemplo",
        "numero": "100",
        "complemento": null,
        "bairro": "Centro",
        "cidade": "São Paulo",
        "uf": "SP",
        "cep": "01001000",
        "principal": true
      }
    ],
    "documentos": [
      {
        "chave": "documento-1",
        "id": "11111111-1111-4111-8111-111111111111",
        "tipo": "outro",
        "valor": "DOC-EXEMPLO",
        "orgaoEmissor": null
      }
    ],
    "classificacaoIds": [
      "33333333-3333-4333-8333-333333333333"
    ],
    "indicadoPorMunicipeId": "33333333-3333-4333-8333-333333333333",
    "preferenciaContato": {
      "permitirProativo": true
    },
    "fotos": [
      {
        "chave": "foto-1",
        "id": "11111111-1111-4111-8111-111111111111",
        "legenda": "Foto de reconhecimento.",
        "principal": true
      }
    ],
    "transcricoesUtilizadas": [
      {
        "transcricaoId": "11111111-1111-4111-8111-111111111111",
        "trechoAceito": "Prefere contato à tarde."
      }
    ]
  },
  "referencias": {
    "indicador": {
      "id": "11111111-1111-4111-8111-111111111111",
      "rotulo": "Ana Exemplo",
      "ativo": true
    },
    "classificacoes": [
      {
        "id": "11111111-1111-4111-8111-111111111111",
        "rotulo": "Ana Exemplo",
        "ativo": true
      }
    ]
  },
  "fotos": [
    {
      "id": "11111111-1111-4111-8111-111111111111",
      "nome": "foto-exemplo.jpg",
      "mimeType": "image/jpeg",
      "tamanhoBytes": 1024,
      "url": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo",
      "miniaturaUrl": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo?variante=miniatura"
    }
  ],
  "contextoEdicao": {
    "sexos": [
      {
        "codigo": "nao_informado",
        "rotulo": "Não informado"
      }
    ],
    "tiposDocumento": [
      "cpf"
    ],
    "classificacoesIniciais": [
      {
        "id": "11111111-1111-4111-8111-111111111111",
        "rotulo": "Ana Exemplo",
        "ativo": true
      }
    ],
    "responsaveisIniciais": [
      {
        "id": "11111111-1111-4111-8111-111111111111",
        "rotulo": "Ana Exemplo",
        "ativo": true
      }
    ],
    "servicosIniciais": [
      {
        "id": "11111111-1111-4111-8111-111111111111",
        "rotulo": "Ana Exemplo",
        "ativo": true
      }
    ],
    "limites": {
      "maxUploadBytes": 26214400,
      "maxArquivosPorLote": 10,
      "maxAudioSegundos": 600,
      "maxObservacaoCaracteres": 100000,
      "mimeTypes": [
        "application/pdf"
      ],
      "maxItensPorColecao": 100,
      "maxDestinatariosEtiquetas": 5000
    },
    "permissoes": {
      "acoes": [
        "salvar"
      ],
      "camposEditaveis": [
        "contatos"
      ]
    }
  },
  "resumoContato": {
    "ultimaInteracaoEm": "2026-11-16T17:00:00Z",
    "diasSemContato": 75,
    "janelaDias": 90,
    "diasComInteracao": 8,
    "mensagensRecebidas": 20,
    "mensagensEnviadas": 10,
    "atendimentos": 2,
    "ultimaTentativaEm": "2026-11-16T17:00:00Z",
    "cobertura": "disponivel"
  },
  "atendimentosRecentes": [
    {
      "id": "11111111-1111-4111-8111-111111111111",
      "protocolo": "2026-000001",
      "titulo": "Pedido de iluminação",
      "situacao": "aberto",
      "pessoa": {
        "id": "11111111-1111-4111-8111-111111111111",
        "rotulo": "Ana Exemplo",
        "ativo": true
      },
      "responsavel": {
        "id": "11111111-1111-4111-8111-111111111111",
        "rotulo": "Ana Exemplo",
        "ativo": true
      },
      "abertoEm": "2026-11-16T17:00:00Z",
      "prazo": "2026-11-16T17:00:00Z",
      "acoesPermitidas": [
        "abrir"
      ],
      "identidadePendente": false
    }
  ],
  "atividadesRecentes": [
    {
      "id": "11111111-1111-4111-8111-111111111111",
      "acao": "municipe.atualizado",
      "alvoTipo": "municipe",
      "alvoId": "11111111-1111-4111-8111-111111111111",
      "autor": {
        "tipo": "usuario",
        "usuarioId": "11111111-1111-4111-8111-111111111111",
        "nome": "Operador Exemplo"
      },
      "ocorridoEm": "2026-11-16T17:00:00Z",
      "resumo": "Ficha atualizada.",
      "podeReverter": true
    }
  ],
  "marcacaoVotoAtualizadaEm": "2026-11-16T17:00:00Z",
  "marcacaoVotoAtualizadaPor": {
    "id": "11111111-1111-4111-8111-111111111111",
    "rotulo": "Ana Exemplo",
    "ativo": true
  },
  "conversaAtualizada": {
    "id": "11111111-1111-4111-8111-111111111111",
    "etag": "\"conversa-1\"",
    "pessoa": {
      "id": "11111111-1111-4111-8111-111111111111",
      "nome": "Ana Exemplo",
      "bairro": "Centro",
      "contatoPrincipal": "+5511999990000",
      "foto": {
        "id": "11111111-1111-4111-8111-111111111111",
        "nome": "foto-exemplo.jpg",
        "mimeType": "image/jpeg",
        "tamanhoBytes": 1024,
        "url": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo",
        "miniaturaUrl": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo?variante=miniatura"
      },
      "arquivado": false
    },
    "contatoCanal": "+5511999990000",
    "estado": "aguardando",
    "responsavel": {
      "id": "11111111-1111-4111-8111-111111111111",
      "rotulo": "Ana Exemplo",
      "ativo": true
    },
    "equipe": {
      "id": "11111111-1111-4111-8111-111111111111",
      "rotulo": "Ana Exemplo",
      "ativo": true
    },
    "naoLidas": 1,
    "ultimaMensagem": "Gostaria de saber o andamento.",
    "ultimaMensagemEm": "2026-11-16T17:00:00Z"
  }
}
```

| Header retornado | Uso |
| --- | --- |
| Cache-Control | Sem cache público de dados pessoais/QR. |
| X-Request-Id | Correlação e cache. |
| ETag | Usar este ETag na edição do agregado indicado. |
| X-Activity-Id | Atividade do comando agregado, com seus detalhes por campo/vínculo. |

Erros: `400`, `401`, `403`, `404`, `409`, `412`, `422`, `428`, `429`, `500`, `503`. Ver [envelope e comportamento](README.md#erros).

O backend resolve nesta ação: validar versão e todos os blocos; calcular diferenças de coleções; resolver meios de contato e preservar familiares; validar grafo e campos restritos; gravar tudo em transação; auditar e devolver ficha/ETag atuais.

<a id="delete_municipes_id"></a>
## DELETE /municipes/{id}

**Tela:** Ficha e edição do munícipe. **Ação:** Arquivar munícipe.

Botão Arquivar usa o ETag da ficha; remoção lógica com motivo e dependências verificadas. Não apaga histórico/indicados/arquivos definitivamente.

Permissões: `municipes.arquivar`.

| Nome | Local | Obrigatório | Tipo | Uso |
| --- | --- | --- | --- | --- |
| id | path | sim | string (uuid) | Identificador interno UUID. |
| X-CSRF-Token | header | sim | string | Obrigatório nas chamadas autenticadas não GET; cookie HttpOnly é enviado automaticamente pelo navegador. |
| Idempotency-Key | header | sim | string | Mesma identidade+rota+chave+corpo não repete efeitos. Corpo alterado usa nova chave. |
| If-Match | header | sim | string | Versão do agregado/item especificado. 428 ausente, 412 desatualizado; não aceitar *. |
| X-Motivo | header | sim | string | Motivo auditado; DELETE não recebe corpo. |

**Resposta 204:** Operação concluída, sem corpo.

| Header retornado | Uso |
| --- | --- |
| Cache-Control | Sem cache público de dados pessoais/QR. |
| X-Request-Id | Correlação e cache. |
| X-Activity-Id | Atividade do comando agregado, com seus detalhes por campo/vínculo. |

Erros: `400`, `401`, `403`, `404`, `409`, `412`, `422`, `428`, `429`, `500`, `503`. Ver [envelope e comportamento](README.md#erros).

<a id="get_municipes_id_anexos"></a>
## GET /municipes/{id}/anexos

**Tela:** Aba de anexos da pessoa. **Ação:** Carregar mais anexos dos atendimentos.

Uma página já contém arquivo/URL, protocolo, autor/data e descrição. Acesso validado por atendimento/arquivo, não só por pessoa.

Permissões: `atendimentos.ler`.

| Nome | Local | Obrigatório | Tipo | Uso |
| --- | --- | --- | --- | --- |
| id | path | sim | string (uuid) | Identificador interno UUID. |
| limite | query | não | integer | Limite, máximo 100. |
| cursor | query | não | string | Retomar a página sem refazer consultas por item. |
| incluirTotal | query | não | boolean | Default false. |

**Resposta 200:** Dados prontos para a tela, no alcance autorizado.

`application/json` · [AnexosPessoa](#schema-AnexosPessoa)

```json
{
  "dados": [
    {
      "id": "11111111-1111-4111-8111-111111111111",
      "atendimento": {
        "id": "11111111-1111-4111-8111-111111111111",
        "protocolo": "2026-000001",
        "titulo": "Pedido de iluminação",
        "situacao": "aberto",
        "pessoa": {
          "id": "11111111-1111-4111-8111-111111111111",
          "rotulo": "Ana Exemplo",
          "ativo": true
        },
        "responsavel": {
          "id": "11111111-1111-4111-8111-111111111111",
          "rotulo": "Ana Exemplo",
          "ativo": true
        },
        "abertoEm": "2026-11-16T17:00:00Z",
        "prazo": "2026-11-16T17:00:00Z",
        "acoesPermitidas": [
          "abrir"
        ],
        "identidadePendente": false
      },
      "arquivo": {
        "id": "11111111-1111-4111-8111-111111111111",
        "nome": "foto-exemplo.jpg",
        "mimeType": "image/jpeg",
        "tamanhoBytes": 1024,
        "url": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo",
        "miniaturaUrl": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo?variante=miniatura"
      },
      "descricao": "Documento apresentado.",
      "incluidoPor": {
        "id": "11111111-1111-4111-8111-111111111111",
        "rotulo": "Ana Exemplo",
        "ativo": true
      },
      "incluidoEm": "2026-11-16T17:00:00Z"
    }
  ],
  "paginacao": {
    "proximoCursor": null,
    "total": 1,
    "limite": 25
  }
}
```

| Header retornado | Uso |
| --- | --- |
| Cache-Control | Sem cache público de dados pessoais/QR. |
| X-Request-Id | Correlação e cache. |

Erros: `400`, `401`, `403`, `404`, `422`, `429`, `500`, `503`. Ver [envelope e comportamento](README.md#erros).

<a id="get_municipes_id_participacoes"></a>
## GET /municipes/{id}/participacoes

**Tela:** Aba de participações da pessoa. **Ação:** Carregar participações em eventos.

Retorna nomes da pessoa/evento e situação de inscrição/presença, sem consultar cada evento separadamente.

Permissões: `eventos.ler`.

| Nome | Local | Obrigatório | Tipo | Uso |
| --- | --- | --- | --- | --- |
| id | path | sim | string (uuid) | Identificador interno UUID. |
| limite | query | não | integer | Limite, máximo 100. |
| cursor | query | não | string | Retomar a página sem refazer consultas por item. |
| incluirTotal | query | não | boolean | Default false. |
| data | query | não | FiltroData | FiltroData codificado como JSON; a rota declara o campo temporal. |

**Resposta 200:** Dados prontos para a tela, no alcance autorizado.

`application/json` · [Participacoes](#schema-Participacoes)

```json
{
  "dados": [
    {
      "id": "11111111-1111-4111-8111-111111111111",
      "versao": 1,
      "etag": "\"edicao-1\"",
      "pessoa": {
        "id": "11111111-1111-4111-8111-111111111111",
        "nome": "Ana Exemplo",
        "bairro": "Centro",
        "contatoPrincipal": "+5511999990000",
        "foto": {
          "id": "11111111-1111-4111-8111-111111111111",
          "nome": "foto-exemplo.jpg",
          "mimeType": "image/jpeg",
          "tamanhoBytes": 1024,
          "url": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo",
          "miniaturaUrl": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo?variante=miniatura"
        },
        "arquivado": false
      },
      "evento": {
        "id": "11111111-1111-4111-8111-111111111111",
        "rotulo": "Ana Exemplo",
        "ativo": true
      },
      "situacao": "inscrito",
      "presencaEm": "2026-11-16T17:00:00Z",
      "observacao": "Presença conferida."
    }
  ],
  "paginacao": {
    "proximoCursor": null,
    "total": 1,
    "limite": 25
  }
}
```

| Header retornado | Uso |
| --- | --- |
| Cache-Control | Sem cache público de dados pessoais/QR. |
| X-Request-Id | Correlação e cache. |

Erros: `400`, `401`, `403`, `404`, `422`, `429`, `500`, `503`. Ver [envelope e comportamento](README.md#erros).

<a id="post_municipes_fusoes_preparar"></a>
## POST /municipes/fusoes/preparar

**Tela:** Comparar duplicados. **Ação:** Abrir comparação de duas pessoas.

Devolve as duas fichas autorizadas, diferenças, impactos/dependências e token de revisão em uma chamada. Comparação é um passo humano real, não pré-requisito obrigatório do cadastro normal.

Permissões: `municipes.fundir`.

| Nome | Local | Obrigatório | Tipo | Uso |
| --- | --- | --- | --- | --- |
| X-CSRF-Token | header | sim | string | Obrigatório nas chamadas autenticadas não GET; cookie HttpOnly é enviado automaticamente pelo navegador. |

Entrada obrigatória `application/json`: [FusaoPreparar](#schema-FusaoPreparar).

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| principalId | string (uuid) | sim | Identificador interno UUID. |
| duplicadoId | string (uuid) | sim | Pessoa diferente da principal. |

```json
{
  "principalId": "11111111-1111-4111-8111-111111111111",
  "duplicadoId": "33333333-3333-4333-8333-333333333333"
}
```

**Resposta 200:** Dados prontos para a tela, no alcance autorizado.

`application/json` · [FusaoComparacao](#schema-FusaoComparacao)

```json
{
  "principal": {
    "id": "11111111-1111-4111-8111-111111111111",
    "versao": 1,
    "etag": "\"edicao-1\"",
    "pessoa": {
      "id": "11111111-1111-4111-8111-111111111111",
      "nome": "Ana Exemplo",
      "bairro": "Centro",
      "contatoPrincipal": "+5511999990000",
      "foto": {
        "id": "11111111-1111-4111-8111-111111111111",
        "nome": "foto-exemplo.jpg",
        "mimeType": "image/jpeg",
        "tamanhoBytes": 1024,
        "url": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo",
        "miniaturaUrl": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo?variante=miniatura"
      },
      "arquivado": false
    },
    "formulario": {
      "nome": "Ana Exemplo",
      "sexoCodigo": null,
      "nascimento": "1990-11-15",
      "observacoes": "Participa do futebol. Prefere contato à tarde.",
      "contatos": [
        {
          "chave": "telefone-1",
          "id": "11111111-1111-4111-8111-111111111111",
          "tipo": "telefone",
          "valor": "+5511999990000",
          "relacao": "Telefone da família.",
          "principal": true
        }
      ],
      "enderecos": [
        {
          "chave": "endereco-1",
          "id": "11111111-1111-4111-8111-111111111111",
          "logradouro": "Rua Exemplo",
          "numero": "100",
          "complemento": null,
          "bairro": "Centro",
          "cidade": "São Paulo",
          "uf": "SP",
          "cep": "01001000",
          "principal": true
        }
      ],
      "documentos": [
        {
          "chave": "documento-1",
          "id": "11111111-1111-4111-8111-111111111111",
          "tipo": "outro",
          "valor": "DOC-EXEMPLO",
          "orgaoEmissor": null
        }
      ],
      "classificacaoIds": [
        "33333333-3333-4333-8333-333333333333"
      ],
      "indicadoPorMunicipeId": "33333333-3333-4333-8333-333333333333",
      "preferenciaContato": {
        "permitirProativo": true
      },
      "fotos": [
        {
          "chave": "foto-1",
          "id": "11111111-1111-4111-8111-111111111111",
          "legenda": "Foto de reconhecimento.",
          "principal": true
        }
      ],
      "transcricoesUtilizadas": [
        {
          "transcricaoId": "11111111-1111-4111-8111-111111111111",
          "trechoAceito": "Prefere contato à tarde."
        }
      ]
    },
    "referencias": {
      "indicador": {
        "id": "11111111-1111-4111-8111-111111111111",
        "rotulo": "Ana Exemplo",
        "ativo": true
      },
      "classificacoes": [
        {
          "id": "11111111-1111-4111-8111-111111111111",
          "rotulo": "Ana Exemplo",
          "ativo": true
        }
      ]
    },
    "fotos": [
      {
        "id": "11111111-1111-4111-8111-111111111111",
        "nome": "foto-exemplo.jpg",
        "mimeType": "image/jpeg",
        "tamanhoBytes": 1024,
        "url": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo",
        "miniaturaUrl": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo?variante=miniatura"
      }
    ],
    "contextoEdicao": {
      "sexos": [
        {
          "codigo": "nao_informado",
          "rotulo": "Não informado"
        }
      ],
      "tiposDocumento": [
        "cpf"
      ],
      "classificacoesIniciais": [
        {
          "id": "11111111-1111-4111-8111-111111111111",
          "rotulo": "Ana Exemplo",
          "ativo": true
        }
      ],
      "responsaveisIniciais": [
        {
          "id": "11111111-1111-4111-8111-111111111111",
          "rotulo": "Ana Exemplo",
          "ativo": true
        }
      ],
      "servicosIniciais": [
        {
          "id": "11111111-1111-4111-8111-111111111111",
          "rotulo": "Ana Exemplo",
          "ativo": true
        }
      ],
      "limites": {
        "maxUploadBytes": 26214400,
        "maxArquivosPorLote": 10,
        "maxAudioSegundos": 600,
        "maxObservacaoCaracteres": 100000,
        "mimeTypes": [
          "application/pdf"
        ],
        "maxItensPorColecao": 100,
        "maxDestinatariosEtiquetas": 5000
      },
      "permissoes": {
        "acoes": [
          "salvar"
        ],
        "camposEditaveis": [
          "contatos"
        ]
      }
    },
    "resumoContato": {
      "ultimaInteracaoEm": "2026-11-16T17:00:00Z",
      "diasSemContato": 75,
      "janelaDias": 90,
      "diasComInteracao": 8,
      "mensagensRecebidas": 20,
      "mensagensEnviadas": 10,
      "atendimentos": 2,
      "ultimaTentativaEm": "2026-11-16T17:00:00Z",
      "cobertura": "disponivel"
    },
    "atendimentosRecentes": [
      {
        "id": "11111111-1111-4111-8111-111111111111",
        "protocolo": "2026-000001",
        "titulo": "Pedido de iluminação",
        "situacao": "aberto",
        "pessoa": {
          "id": "11111111-1111-4111-8111-111111111111",
          "rotulo": "Ana Exemplo",
          "ativo": true
        },
        "responsavel": {
          "id": "11111111-1111-4111-8111-111111111111",
          "rotulo": "Ana Exemplo",
          "ativo": true
        },
        "abertoEm": "2026-11-16T17:00:00Z",
        "prazo": "2026-11-16T17:00:00Z",
        "acoesPermitidas": [
          "abrir"
        ],
        "identidadePendente": false
      }
    ],
    "atividadesRecentes": [
      {
        "id": "11111111-1111-4111-8111-111111111111",
        "acao": "municipe.atualizado",
        "alvoTipo": "municipe",
        "alvoId": "11111111-1111-4111-8111-111111111111",
        "autor": {
          "tipo": "usuario",
          "usuarioId": "11111111-1111-4111-8111-111111111111",
          "nome": "Operador Exemplo"
        },
        "ocorridoEm": "2026-11-16T17:00:00Z",
        "resumo": "Ficha atualizada.",
        "podeReverter": true
      }
    ],
    "marcacaoVotoAtualizadaEm": "2026-11-16T17:00:00Z",
    "marcacaoVotoAtualizadaPor": {
      "id": "11111111-1111-4111-8111-111111111111",
      "rotulo": "Ana Exemplo",
      "ativo": true
    },
    "conversaAtualizada": {
      "id": "11111111-1111-4111-8111-111111111111",
      "etag": "\"conversa-1\"",
      "pessoa": {
        "id": "11111111-1111-4111-8111-111111111111",
        "nome": "Ana Exemplo",
        "bairro": "Centro",
        "contatoPrincipal": "+5511999990000",
        "foto": {
          "id": "11111111-1111-4111-8111-111111111111",
          "nome": "foto-exemplo.jpg",
          "mimeType": "image/jpeg",
          "tamanhoBytes": 1024,
          "url": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo",
          "miniaturaUrl": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo?variante=miniatura"
        },
        "arquivado": false
      },
      "contatoCanal": "+5511999990000",
      "estado": "aguardando",
      "responsavel": {
        "id": "11111111-1111-4111-8111-111111111111",
        "rotulo": "Ana Exemplo",
        "ativo": true
      },
      "equipe": {
        "id": "11111111-1111-4111-8111-111111111111",
        "rotulo": "Ana Exemplo",
        "ativo": true
      },
      "naoLidas": 1,
      "ultimaMensagem": "Gostaria de saber o andamento.",
      "ultimaMensagemEm": "2026-11-16T17:00:00Z"
    }
  },
  "duplicado": {
    "id": "11111111-1111-4111-8111-111111111111",
    "versao": 1,
    "etag": "\"edicao-1\"",
    "pessoa": {
      "id": "11111111-1111-4111-8111-111111111111",
      "nome": "Ana Exemplo",
      "bairro": "Centro",
      "contatoPrincipal": "+5511999990000",
      "foto": {
        "id": "11111111-1111-4111-8111-111111111111",
        "nome": "foto-exemplo.jpg",
        "mimeType": "image/jpeg",
        "tamanhoBytes": 1024,
        "url": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo",
        "miniaturaUrl": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo?variante=miniatura"
      },
      "arquivado": false
    },
    "formulario": {
      "nome": "Ana Exemplo",
      "sexoCodigo": null,
      "nascimento": "1990-11-15",
      "observacoes": "Participa do futebol. Prefere contato à tarde.",
      "contatos": [
        {
          "chave": "telefone-1",
          "id": "11111111-1111-4111-8111-111111111111",
          "tipo": "telefone",
          "valor": "+5511999990000",
          "relacao": "Telefone da família.",
          "principal": true
        }
      ],
      "enderecos": [
        {
          "chave": "endereco-1",
          "id": "11111111-1111-4111-8111-111111111111",
          "logradouro": "Rua Exemplo",
          "numero": "100",
          "complemento": null,
          "bairro": "Centro",
          "cidade": "São Paulo",
          "uf": "SP",
          "cep": "01001000",
          "principal": true
        }
      ],
      "documentos": [
        {
          "chave": "documento-1",
          "id": "11111111-1111-4111-8111-111111111111",
          "tipo": "outro",
          "valor": "DOC-EXEMPLO",
          "orgaoEmissor": null
        }
      ],
      "classificacaoIds": [
        "33333333-3333-4333-8333-333333333333"
      ],
      "indicadoPorMunicipeId": "33333333-3333-4333-8333-333333333333",
      "preferenciaContato": {
        "permitirProativo": true
      },
      "fotos": [
        {
          "chave": "foto-1",
          "id": "11111111-1111-4111-8111-111111111111",
          "legenda": "Foto de reconhecimento.",
          "principal": true
        }
      ],
      "transcricoesUtilizadas": [
        {
          "transcricaoId": "11111111-1111-4111-8111-111111111111",
          "trechoAceito": "Prefere contato à tarde."
        }
      ]
    },
    "referencias": {
      "indicador": {
        "id": "11111111-1111-4111-8111-111111111111",
        "rotulo": "Ana Exemplo",
        "ativo": true
      },
      "classificacoes": [
        {
          "id": "11111111-1111-4111-8111-111111111111",
          "rotulo": "Ana Exemplo",
          "ativo": true
        }
      ]
    },
    "fotos": [
      {
        "id": "11111111-1111-4111-8111-111111111111",
        "nome": "foto-exemplo.jpg",
        "mimeType": "image/jpeg",
        "tamanhoBytes": 1024,
        "url": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo",
        "miniaturaUrl": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo?variante=miniatura"
      }
    ],
    "contextoEdicao": {
      "sexos": [
        {
          "codigo": "nao_informado",
          "rotulo": "Não informado"
        }
      ],
      "tiposDocumento": [
        "cpf"
      ],
      "classificacoesIniciais": [
        {
          "id": "11111111-1111-4111-8111-111111111111",
          "rotulo": "Ana Exemplo",
          "ativo": true
        }
      ],
      "responsaveisIniciais": [
        {
          "id": "11111111-1111-4111-8111-111111111111",
          "rotulo": "Ana Exemplo",
          "ativo": true
        }
      ],
      "servicosIniciais": [
        {
          "id": "11111111-1111-4111-8111-111111111111",
          "rotulo": "Ana Exemplo",
          "ativo": true
        }
      ],
      "limites": {
        "maxUploadBytes": 26214400,
        "maxArquivosPorLote": 10,
        "maxAudioSegundos": 600,
        "maxObservacaoCaracteres": 100000,
        "mimeTypes": [
          "application/pdf"
        ],
        "maxItensPorColecao": 100,
        "maxDestinatariosEtiquetas": 5000
      },
      "permissoes": {
        "acoes": [
          "salvar"
        ],
        "camposEditaveis": [
          "contatos"
        ]
      }
    },
    "resumoContato": {
      "ultimaInteracaoEm": "2026-11-16T17:00:00Z",
      "diasSemContato": 75,
      "janelaDias": 90,
      "diasComInteracao": 8,
      "mensagensRecebidas": 20,
      "mensagensEnviadas": 10,
      "atendimentos": 2,
      "ultimaTentativaEm": "2026-11-16T17:00:00Z",
      "cobertura": "disponivel"
    },
    "atendimentosRecentes": [
      {
        "id": "11111111-1111-4111-8111-111111111111",
        "protocolo": "2026-000001",
        "titulo": "Pedido de iluminação",
        "situacao": "aberto",
        "pessoa": {
          "id": "11111111-1111-4111-8111-111111111111",
          "rotulo": "Ana Exemplo",
          "ativo": true
        },
        "responsavel": {
          "id": "11111111-1111-4111-8111-111111111111",
          "rotulo": "Ana Exemplo",
          "ativo": true
        },
        "abertoEm": "2026-11-16T17:00:00Z",
        "prazo": "2026-11-16T17:00:00Z",
        "acoesPermitidas": [
          "abrir"
        ],
        "identidadePendente": false
      }
    ],
    "atividadesRecentes": [
      {
        "id": "11111111-1111-4111-8111-111111111111",
        "acao": "municipe.atualizado",
        "alvoTipo": "municipe",
        "alvoId": "11111111-1111-4111-8111-111111111111",
        "autor": {
          "tipo": "usuario",
          "usuarioId": "11111111-1111-4111-8111-111111111111",
          "nome": "Operador Exemplo"
        },
        "ocorridoEm": "2026-11-16T17:00:00Z",
        "resumo": "Ficha atualizada.",
        "podeReverter": true
      }
    ],
    "marcacaoVotoAtualizadaEm": "2026-11-16T17:00:00Z",
    "marcacaoVotoAtualizadaPor": {
      "id": "11111111-1111-4111-8111-111111111111",
      "rotulo": "Ana Exemplo",
      "ativo": true
    },
    "conversaAtualizada": {
      "id": "11111111-1111-4111-8111-111111111111",
      "etag": "\"conversa-1\"",
      "pessoa": {
        "id": "11111111-1111-4111-8111-111111111111",
        "nome": "Ana Exemplo",
        "bairro": "Centro",
        "contatoPrincipal": "+5511999990000",
        "foto": {
          "id": "11111111-1111-4111-8111-111111111111",
          "nome": "foto-exemplo.jpg",
          "mimeType": "image/jpeg",
          "tamanhoBytes": 1024,
          "url": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo",
          "miniaturaUrl": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo?variante=miniatura"
        },
        "arquivado": false
      },
      "contatoCanal": "+5511999990000",
      "estado": "aguardando",
      "responsavel": {
        "id": "11111111-1111-4111-8111-111111111111",
        "rotulo": "Ana Exemplo",
        "ativo": true
      },
      "equipe": {
        "id": "11111111-1111-4111-8111-111111111111",
        "rotulo": "Ana Exemplo",
        "ativo": true
      },
      "naoLidas": 1,
      "ultimaMensagem": "Gostaria de saber o andamento.",
      "ultimaMensagemEm": "2026-11-16T17:00:00Z"
    }
  },
  "revisao": {
    "token": "revisao-opaca-exemplo",
    "expiraEm": "2026-11-16T17:00:00Z",
    "permitida": true,
    "impactos": [
      "Recompor os vínculos afetados, preservando histórico."
    ],
    "conflitos": []
  },
  "camposComparados": [
    "nome"
  ]
}
```

| Header retornado | Uso |
| --- | --- |
| Cache-Control | Sem cache público de dados pessoais/QR. |
| X-Request-Id | Correlação e cache. |

Erros: `400`, `401`, `403`, `410`, `422`, `429`, `500`, `503`. Ver [envelope e comportamento](README.md#erros).

<a id="post_municipes_fusoes"></a>
## POST /municipes/fusoes

**Tela:** Comparar duplicados. **Ação:** Confirmar escolhas e fundir registros.

Revalida token/versões/cadeia de indicações e dependências; preservar IDs e origem de cada vínculo para reversão. Dados novos ou marcações divergentes exigem decisão explícita, sem OR/inferência. Retorna ficha final e atividade.

Permissões: `municipes.fundir`.

| Nome | Local | Obrigatório | Tipo | Uso |
| --- | --- | --- | --- | --- |
| X-CSRF-Token | header | sim | string | Obrigatório nas chamadas autenticadas não GET; cookie HttpOnly é enviado automaticamente pelo navegador. |
| Idempotency-Key | header | sim | string | Mesma identidade+rota+chave+corpo não repete efeitos. Corpo alterado usa nova chave. |

Entrada obrigatória `application/json`: [FusaoConfirmar](#schema-FusaoConfirmar).

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| revisaoToken | string | sim | Revisão de ambas as fichas e suas dependências. |
| formularioFinal | DadosMunicipe | sim | Valores finais escolhidos no comparador, inclusive coleções, indicação e campos manuais quando autorizados. IDs dos itens podem vir de qualquer uma das duas fichas revisadas; não admite IDs de terceiros. Blocos omitidos preservam o principal, sem união implícita de campos restritos. |
| motivo | string | sim | Justificativa da fusão. · minLength=3 |

```json
{
  "revisaoToken": "revisao-opaca-exemplo",
  "formularioFinal": {
    "nome": "Ana Exemplo",
    "sexoCodigo": null,
    "nascimento": "1990-11-15",
    "observacoes": "Participa do futebol. Prefere contato à tarde.",
    "contatos": [
      {
        "chave": "telefone-1",
        "id": "11111111-1111-4111-8111-111111111111",
        "tipo": "telefone",
        "valor": "+5511999990000",
        "relacao": "Telefone da família.",
        "principal": true
      }
    ],
    "enderecos": [
      {
        "chave": "endereco-1",
        "id": "11111111-1111-4111-8111-111111111111",
        "logradouro": "Rua Exemplo",
        "numero": "100",
        "complemento": null,
        "bairro": "Centro",
        "cidade": "São Paulo",
        "uf": "SP",
        "cep": "01001000",
        "principal": true
      }
    ],
    "documentos": [
      {
        "chave": "documento-1",
        "id": "11111111-1111-4111-8111-111111111111",
        "tipo": "outro",
        "valor": "DOC-EXEMPLO",
        "orgaoEmissor": null
      }
    ],
    "classificacaoIds": [
      "33333333-3333-4333-8333-333333333333"
    ],
    "indicadoPorMunicipeId": "33333333-3333-4333-8333-333333333333",
    "preferenciaContato": {
      "permitirProativo": true
    },
    "fotos": [
      {
        "chave": "foto-1",
        "id": "11111111-1111-4111-8111-111111111111",
        "legenda": "Foto de reconhecimento.",
        "principal": true
      }
    ],
    "transcricoesUtilizadas": [
      {
        "transcricaoId": "11111111-1111-4111-8111-111111111111",
        "trechoAceito": "Prefere contato à tarde."
      }
    ]
  },
  "motivo": "Duplicidade conferida pela supervisão."
}
```

**Resposta 201:** Dados prontos para a tela, no alcance autorizado.

`application/json` · [ResultadoFusao](#schema-ResultadoFusao)

```json
{
  "ficha": {
    "id": "11111111-1111-4111-8111-111111111111",
    "versao": 1,
    "etag": "\"edicao-1\"",
    "pessoa": {
      "id": "11111111-1111-4111-8111-111111111111",
      "nome": "Ana Exemplo",
      "bairro": "Centro",
      "contatoPrincipal": "+5511999990000",
      "foto": {
        "id": "11111111-1111-4111-8111-111111111111",
        "nome": "foto-exemplo.jpg",
        "mimeType": "image/jpeg",
        "tamanhoBytes": 1024,
        "url": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo",
        "miniaturaUrl": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo?variante=miniatura"
      },
      "arquivado": false
    },
    "formulario": {
      "nome": "Ana Exemplo",
      "sexoCodigo": null,
      "nascimento": "1990-11-15",
      "observacoes": "Participa do futebol. Prefere contato à tarde.",
      "contatos": [
        {
          "chave": "telefone-1",
          "id": "11111111-1111-4111-8111-111111111111",
          "tipo": "telefone",
          "valor": "+5511999990000",
          "relacao": "Telefone da família.",
          "principal": true
        }
      ],
      "enderecos": [
        {
          "chave": "endereco-1",
          "id": "11111111-1111-4111-8111-111111111111",
          "logradouro": "Rua Exemplo",
          "numero": "100",
          "complemento": null,
          "bairro": "Centro",
          "cidade": "São Paulo",
          "uf": "SP",
          "cep": "01001000",
          "principal": true
        }
      ],
      "documentos": [
        {
          "chave": "documento-1",
          "id": "11111111-1111-4111-8111-111111111111",
          "tipo": "outro",
          "valor": "DOC-EXEMPLO",
          "orgaoEmissor": null
        }
      ],
      "classificacaoIds": [
        "33333333-3333-4333-8333-333333333333"
      ],
      "indicadoPorMunicipeId": "33333333-3333-4333-8333-333333333333",
      "preferenciaContato": {
        "permitirProativo": true
      },
      "fotos": [
        {
          "chave": "foto-1",
          "id": "11111111-1111-4111-8111-111111111111",
          "legenda": "Foto de reconhecimento.",
          "principal": true
        }
      ],
      "transcricoesUtilizadas": [
        {
          "transcricaoId": "11111111-1111-4111-8111-111111111111",
          "trechoAceito": "Prefere contato à tarde."
        }
      ]
    },
    "referencias": {
      "indicador": {
        "id": "11111111-1111-4111-8111-111111111111",
        "rotulo": "Ana Exemplo",
        "ativo": true
      },
      "classificacoes": [
        {
          "id": "11111111-1111-4111-8111-111111111111",
          "rotulo": "Ana Exemplo",
          "ativo": true
        }
      ]
    },
    "fotos": [
      {
        "id": "11111111-1111-4111-8111-111111111111",
        "nome": "foto-exemplo.jpg",
        "mimeType": "image/jpeg",
        "tamanhoBytes": 1024,
        "url": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo",
        "miniaturaUrl": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo?variante=miniatura"
      }
    ],
    "contextoEdicao": {
      "sexos": [
        {
          "codigo": "nao_informado",
          "rotulo": "Não informado"
        }
      ],
      "tiposDocumento": [
        "cpf"
      ],
      "classificacoesIniciais": [
        {
          "id": "11111111-1111-4111-8111-111111111111",
          "rotulo": "Ana Exemplo",
          "ativo": true
        }
      ],
      "responsaveisIniciais": [
        {
          "id": "11111111-1111-4111-8111-111111111111",
          "rotulo": "Ana Exemplo",
          "ativo": true
        }
      ],
      "servicosIniciais": [
        {
          "id": "11111111-1111-4111-8111-111111111111",
          "rotulo": "Ana Exemplo",
          "ativo": true
        }
      ],
      "limites": {
        "maxUploadBytes": 26214400,
        "maxArquivosPorLote": 10,
        "maxAudioSegundos": 600,
        "maxObservacaoCaracteres": 100000,
        "mimeTypes": [
          "application/pdf"
        ],
        "maxItensPorColecao": 100,
        "maxDestinatariosEtiquetas": 5000
      },
      "permissoes": {
        "acoes": [
          "salvar"
        ],
        "camposEditaveis": [
          "contatos"
        ]
      }
    },
    "resumoContato": {
      "ultimaInteracaoEm": "2026-11-16T17:00:00Z",
      "diasSemContato": 75,
      "janelaDias": 90,
      "diasComInteracao": 8,
      "mensagensRecebidas": 20,
      "mensagensEnviadas": 10,
      "atendimentos": 2,
      "ultimaTentativaEm": "2026-11-16T17:00:00Z",
      "cobertura": "disponivel"
    },
    "atendimentosRecentes": [
      {
        "id": "11111111-1111-4111-8111-111111111111",
        "protocolo": "2026-000001",
        "titulo": "Pedido de iluminação",
        "situacao": "aberto",
        "pessoa": {
          "id": "11111111-1111-4111-8111-111111111111",
          "rotulo": "Ana Exemplo",
          "ativo": true
        },
        "responsavel": {
          "id": "11111111-1111-4111-8111-111111111111",
          "rotulo": "Ana Exemplo",
          "ativo": true
        },
        "abertoEm": "2026-11-16T17:00:00Z",
        "prazo": "2026-11-16T17:00:00Z",
        "acoesPermitidas": [
          "abrir"
        ],
        "identidadePendente": false
      }
    ],
    "atividadesRecentes": [
      {
        "id": "11111111-1111-4111-8111-111111111111",
        "acao": "municipe.atualizado",
        "alvoTipo": "municipe",
        "alvoId": "11111111-1111-4111-8111-111111111111",
        "autor": {
          "tipo": "usuario",
          "usuarioId": "11111111-1111-4111-8111-111111111111",
          "nome": "Operador Exemplo"
        },
        "ocorridoEm": "2026-11-16T17:00:00Z",
        "resumo": "Ficha atualizada.",
        "podeReverter": true
      }
    ],
    "marcacaoVotoAtualizadaEm": "2026-11-16T17:00:00Z",
    "marcacaoVotoAtualizadaPor": {
      "id": "11111111-1111-4111-8111-111111111111",
      "rotulo": "Ana Exemplo",
      "ativo": true
    },
    "conversaAtualizada": {
      "id": "11111111-1111-4111-8111-111111111111",
      "etag": "\"conversa-1\"",
      "pessoa": {
        "id": "11111111-1111-4111-8111-111111111111",
        "nome": "Ana Exemplo",
        "bairro": "Centro",
        "contatoPrincipal": "+5511999990000",
        "foto": {
          "id": "11111111-1111-4111-8111-111111111111",
          "nome": "foto-exemplo.jpg",
          "mimeType": "image/jpeg",
          "tamanhoBytes": 1024,
          "url": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo",
          "miniaturaUrl": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo?variante=miniatura"
        },
        "arquivado": false
      },
      "contatoCanal": "+5511999990000",
      "estado": "aguardando",
      "responsavel": {
        "id": "11111111-1111-4111-8111-111111111111",
        "rotulo": "Ana Exemplo",
        "ativo": true
      },
      "equipe": {
        "id": "11111111-1111-4111-8111-111111111111",
        "rotulo": "Ana Exemplo",
        "ativo": true
      },
      "naoLidas": 1,
      "ultimaMensagem": "Gostaria de saber o andamento.",
      "ultimaMensagemEm": "2026-11-16T17:00:00Z"
    }
  },
  "atividadeId": "11111111-1111-4111-8111-111111111111"
}
```

| Header retornado | Uso |
| --- | --- |
| Cache-Control | Sem cache público de dados pessoais/QR. |
| X-Request-Id | Correlação e cache. |
| X-Activity-Id | Atividade do comando agregado, com seus detalhes por campo/vínculo. |

Erros: `400`, `401`, `403`, `409`, `410`, `422`, `429`, `500`, `503`. Ver [envelope e comportamento](README.md#erros).

O backend resolve nesta ação: revalidar comparação; aplicar escolhas e recompor relações; preservar origem e histórico; retornar ficha mantida.

<a id="get_relatorios_indicacoes"></a>
## GET /relatorios/indicacoes

**Tela:** Árvore de indicações. **Ação:** Abrir raízes ou filhos diretos de um nível.

Sem indicadorId, lista pessoas sem indicador e com filhos acessíveis. Com indicadorId, lista só filhos diretos e já retorna caminho para voltar. Folha é lista vazia. Não tratar pai restrito/arquivado como inexistente; não usar anotação de voto para seleção/ordenação.

Permissões: `municipes.ler`, `indicacoes.ler`.

| Nome | Local | Obrigatório | Tipo | Uso |
| --- | --- | --- | --- | --- |
| limite | query | não | integer | Limite, máximo 100. |
| cursor | query | não | string | Retomar a página sem refazer consultas por item. |
| incluirTotal | query | não | boolean | Default false. |
| indicadorId | query | não | string (uuid) | Selecionar uma pessoa desce um nível; omitir retorna ao início. |
| incluirArquivados | query | não | boolean | Default false. |

**Resposta 200:** Dados prontos para a tela, no alcance autorizado.

`application/json` · [IndicacoesTela](#schema-IndicacoesTela)

```json
{
  "selecionado": {
    "id": "11111111-1111-4111-8111-111111111111",
    "nome": "Ana Exemplo",
    "bairro": "Centro",
    "contatoPrincipal": "+5511999990000",
    "foto": {
      "id": "11111111-1111-4111-8111-111111111111",
      "nome": "foto-exemplo.jpg",
      "mimeType": "image/jpeg",
      "tamanhoBytes": 1024,
      "url": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo",
      "miniaturaUrl": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo?variante=miniatura"
    },
    "arquivado": false
  },
  "caminho": [
    {
      "id": "11111111-1111-4111-8111-111111111111",
      "rotulo": "Ana Exemplo",
      "ativo": true
    }
  ],
  "dados": [
    {
      "pessoa": {
        "id": "11111111-1111-4111-8111-111111111111",
        "nome": "Ana Exemplo",
        "bairro": "Centro",
        "contatoPrincipal": "+5511999990000",
        "foto": {
          "id": "11111111-1111-4111-8111-111111111111",
          "nome": "foto-exemplo.jpg",
          "mimeType": "image/jpeg",
          "tamanhoBytes": 1024,
          "url": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo",
          "miniaturaUrl": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo?variante=miniatura"
        },
        "arquivado": false
      },
      "quantidadeIndicadosDiretos": 2,
      "podeExpandir": true
    }
  ],
  "paginacao": {
    "proximoCursor": null,
    "total": 1,
    "limite": 25
  },
  "modo": "raizes"
}
```

| Header retornado | Uso |
| --- | --- |
| Cache-Control | Sem cache público de dados pessoais/QR. |
| X-Request-Id | Correlação e cache. |

Erros: `400`, `401`, `403`, `422`, `429`, `500`, `503`. Ver [envelope e comportamento](README.md#erros).

<a id="post_uploads"></a>
## POST /uploads

**Tela:** Arquivos de qualquer formulário. **Ação:** Enviar arquivos do rascunho em lote.

Um multipart prepara todos os arquivos escolhidos, sem criar pessoa/atendimento antes. Metadados JSON mapeiam chave/índice/uso; bytes são persistidos em área temporária do usuário. Retorna tokens prontos para o único Salvar agregado. Se o salvar falha, temporários continuam privados até retry/expiração, sem entidade parcial.

Permissões: `arquivos.enviar`.

| Nome | Local | Obrigatório | Tipo | Uso |
| --- | --- | --- | --- | --- |
| X-CSRF-Token | header | sim | string | Obrigatório nas chamadas autenticadas não GET; cookie HttpOnly é enviado automaticamente pelo navegador. |
| Idempotency-Key | header | sim | string | Mesma identidade+rota+chave+corpo não repete efeitos. Corpo alterado usa nova chave. |

Entrada obrigatória `multipart/form-data`: [UploadLote](#schema-UploadLote).

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| metadados | ManifestoUpload | sim | ManifestoUpload |
| arquivos | array<string (binary)> | sim | Lista de valores. · minItems=1; maxItems=10 |

```json
{
  "metadados": {
    "rascunhoId": "11111111-1111-4111-8111-111111111111",
    "arquivos": [
      {
        "chave": "foto-1",
        "indice": 0,
        "uso": "foto_municipe"
      }
    ]
  },
  "arquivos": [
    "<bytes-do-arquivo>"
  ]
}
```

**Resposta 201:** Dados prontos para a tela, no alcance autorizado.

`application/json` · [UploadsProntos](#schema-UploadsProntos)

```json
{
  "rascunhoId": "11111111-1111-4111-8111-111111111111",
  "arquivos": [
    {
      "chave": "foto-1",
      "uploadToken": "upload-opaco-exemplo",
      "expiraEm": "2026-11-16T17:00:00Z",
      "arquivo": {
        "id": "11111111-1111-4111-8111-111111111111",
        "nome": "foto-exemplo.jpg",
        "mimeType": "image/jpeg",
        "tamanhoBytes": 1024,
        "url": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo",
        "miniaturaUrl": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo?variante=miniatura"
      }
    }
  ]
}
```

| Header retornado | Uso |
| --- | --- |
| Cache-Control | Sem cache público de dados pessoais/QR. |
| X-Request-Id | Correlação e cache. |
| X-Activity-Id | Atividade do comando agregado, com seus detalhes por campo/vínculo. |

Erros: `400`, `401`, `403`, `409`, `410`, `413`, `415`, `422`, `429`, `500`, `503`. Ver [envelope e comportamento](README.md#erros).

O backend resolve nesta ação: validar lote e formatos; persistir temporários privados; devolver tokens por chave local.

<a id="get_arquivos_id_conteudo"></a>
## GET /arquivos/{id}/conteudo

**Tela:** Foto, player, prévia e download. **Ação:** Abrir arquivo ou variante autorizada.

As telas já entregam URL/MIME/nome, sem GET extra de metadados. Cookie same-origin funciona com img/player/download. Revalidar acesso atual ao destino ou ao temporário próprio; 410 após expiração. Variante sem prévia pode falhar sem impedir download original.

Permissões: `arquivos.ler`.

| Nome | Local | Obrigatório | Tipo | Uso |
| --- | --- | --- | --- | --- |
| id | path | sim | string (uuid) | Identificador interno UUID. |
| variante | query | não | enum: original, miniatura, previa | Default original. |

**Resposta 200:** Dados prontos para a tela, no alcance autorizado.

`application/octet-stream` · `string (binary)`

| Header retornado | Uso |
| --- | --- |
| Cache-Control | Sem cache público de dados pessoais/QR. |
| X-Request-Id | Correlação e cache. |

Erros: `400`, `401`, `403`, `404`, `410`, `422`, `429`, `500`, `503`. Ver [envelope e comportamento](README.md#erros).

<a id="post_observacoes_transcricoes"></a>
## POST /observacoes/transcricoes

**Tela:** Observações por áudio. **Ação:** Enviar áudio e iniciar transcrição.

Gravação/upload do áudio e início da tarefa em uma chamada multipart. Funciona em novo rascunho sem pessoa salva. Resultado vai ao editor local: o usuário revisa e mescla com texto já digitado; somente o Salvar munícipe grava observacoes e transcricoesUtilizadas, sem etapa extra de aplicar.

Permissões: `municipes.transcrever`.

| Nome | Local | Obrigatório | Tipo | Uso |
| --- | --- | --- | --- | --- |
| X-CSRF-Token | header | sim | string | Obrigatório nas chamadas autenticadas não GET; cookie HttpOnly é enviado automaticamente pelo navegador. |
| Idempotency-Key | header | sim | string | Mesma identidade+rota+chave+corpo não repete efeitos. Corpo alterado usa nova chave. |

Entrada obrigatória `multipart/form-data`: [TranscreverAudio](#schema-TranscreverAudio).

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| rascunhoId | string (uuid) | sim | Rascunho ainda não salvo; não exige munícipe existente. |
| municipeId | string (uuid) | não | Somente ao editar pessoa existente autorizada. |
| audio | string (binary) | sim | Áudio enviado ou gravado; upload e início da transcrição na mesma chamada. |

```json
{
  "rascunhoId": "11111111-1111-4111-8111-111111111111",
  "municipeId": "11111111-1111-4111-8111-111111111111",
  "audio": "<bytes-do-arquivo>"
}
```

**Resposta 202:** Aceito para processamento; ainda não representa efeito externo concluído.

`application/json` · [Operacao](#schema-Operacao)

```json
{
  "id": "11111111-1111-4111-8111-111111111111",
  "tipo": "transcricao",
  "estado": "pendente",
  "progresso": 0,
  "podeCancelar": true,
  "resultado": null
}
```

| Header retornado | Uso |
| --- | --- |
| Cache-Control | Sem cache público de dados pessoais/QR. |
| X-Request-Id | Correlação e cache. |
| Location | URI de GET /operacoes/{id} para fallback de acompanhamento. |
| X-Activity-Id | Atividade do comando agregado, com seus detalhes por campo/vínculo. |

Erros: `400`, `401`, `403`, `409`, `413`, `415`, `422`, `429`, `500`, `503`. Ver [envelope e comportamento](README.md#erros).

<a id="get_operacoes_id"></a>
## GET /operacoes/{id}

**Tela:** Progresso de tarefa demorada. **Ação:** Acompanhar resultado por fallback de consulta.

Único contrato de polling para transcrição, PDF e recuperação de canal/envio. O POST já devolve id/estado; SSE entrega conclusão. Só usar este GET ao retomar/recarregar ou quando stream não estiver disponível, sem um polling separado por tipo.

Permissões: sessão e acesso atual ao recurso.

| Nome | Local | Obrigatório | Tipo | Uso |
| --- | --- | --- | --- | --- |
| id | path | sim | string (uuid) | Identificador interno UUID. |

**Resposta 200:** Dados prontos para a tela, no alcance autorizado.

`application/json` · [Operacao](#schema-Operacao)

```json
{
  "id": "11111111-1111-4111-8111-111111111111",
  "tipo": "transcricao",
  "estado": "pendente",
  "progresso": 0,
  "podeCancelar": true,
  "resultado": null
}
```

| Header retornado | Uso |
| --- | --- |
| Cache-Control | Sem cache público de dados pessoais/QR. |
| X-Request-Id | Correlação e cache. |

Erros: `400`, `401`, `403`, `404`, `410`, `422`, `429`, `500`, `503`. Ver [envelope e comportamento](README.md#erros).

<a id="delete_operacoes_id"></a>
## DELETE /operacoes/{id}

**Tela:** Progresso de tarefa demorada. **Ação:** Cancelar processamento ainda cancelável.

Botão Cancelar usa ID já recebido, sem GET prévio obrigatório. Coordenar worker e estado; não afirmar desfazer PDF baixado, mensagem entregue ou outro efeito consumado. 409 se já não é cancelável.

Permissões: sessão e acesso atual ao recurso.

| Nome | Local | Obrigatório | Tipo | Uso |
| --- | --- | --- | --- | --- |
| id | path | sim | string (uuid) | Identificador interno UUID. |
| X-CSRF-Token | header | sim | string | Obrigatório nas chamadas autenticadas não GET; cookie HttpOnly é enviado automaticamente pelo navegador. |
| Idempotency-Key | header | sim | string | Mesma identidade+rota+chave+corpo não repete efeitos. Corpo alterado usa nova chave. |
| X-Motivo | header | sim | string | Motivo auditado; DELETE não recebe corpo. |

**Resposta 204:** Operação concluída, sem corpo.

| Header retornado | Uso |
| --- | --- |
| Cache-Control | Sem cache público de dados pessoais/QR. |
| X-Request-Id | Correlação e cache. |
| X-Activity-Id | Atividade do comando agregado, com seus detalhes por campo/vínculo. |

Erros: `400`, `401`, `403`, `404`, `409`, `410`, `422`, `429`, `500`, `503`. Ver [envelope e comportamento](README.md#erros).

<a id="get_atendimentos_formulario"></a>
## GET /atendimentos/formulario

**Tela:** Novo atendimento. **Ação:** Montar formulário e contexto do pedido.

Uma chamada prepara opções, pessoa pré-selecionada da ficha ou contexto autorizado da conversa. Nova pessoa pode ser preenchida inline e salva pelo mesmo POST do atendimento.

Permissões: `atendimentos.criar`.

| Nome | Local | Obrigatório | Tipo | Uso |
| --- | --- | --- | --- | --- |
| municipeId | query | não | string (uuid) | Ao abrir pela ficha da pessoa. |
| conversaId | query | não | string (uuid) | Ao abrir pela caixa WhatsApp. |

**Resposta 200:** Dados prontos para a tela, no alcance autorizado.

`application/json` · [FormularioAtendimento](#schema-FormularioAtendimento)

```json
{
  "valoresIniciais": {
    "canal": "presencial",
    "servicos": [],
    "pendencias": [],
    "anexos": [],
    "notas": []
  },
  "solicitanteSelecionado": {
    "id": "11111111-1111-4111-8111-111111111111",
    "nome": "Ana Exemplo",
    "bairro": "Centro",
    "contatoPrincipal": "+5511999990000",
    "foto": {
      "id": "11111111-1111-4111-8111-111111111111",
      "nome": "foto-exemplo.jpg",
      "mimeType": "image/jpeg",
      "tamanhoBytes": 1024,
      "url": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo",
      "miniaturaUrl": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo?variante=miniatura"
    },
    "arquivado": false
  },
  "contextoConversa": {
    "conversaId": "11111111-1111-4111-8111-111111111111",
    "etagConversa": "\"conversa-1\"",
    "mensagemIds": [
      "11111111-1111-4111-8111-111111111111"
    ]
  },
  "contexto": {
    "sexos": [
      {
        "codigo": "nao_informado",
        "rotulo": "Não informado"
      }
    ],
    "tiposDocumento": [
      "cpf"
    ],
    "classificacoesIniciais": [
      {
        "id": "11111111-1111-4111-8111-111111111111",
        "rotulo": "Ana Exemplo",
        "ativo": true
      }
    ],
    "responsaveisIniciais": [
      {
        "id": "11111111-1111-4111-8111-111111111111",
        "rotulo": "Ana Exemplo",
        "ativo": true
      }
    ],
    "servicosIniciais": [
      {
        "id": "11111111-1111-4111-8111-111111111111",
        "rotulo": "Ana Exemplo",
        "ativo": true
      }
    ],
    "limites": {
      "maxUploadBytes": 26214400,
      "maxArquivosPorLote": 10,
      "maxAudioSegundos": 600,
      "maxObservacaoCaracteres": 100000,
      "mimeTypes": [
        "application/pdf"
      ],
      "maxItensPorColecao": 100,
      "maxDestinatariosEtiquetas": 5000
    },
    "permissoes": {
      "acoes": [
        "salvar"
      ],
      "camposEditaveis": [
        "contatos"
      ]
    }
  }
}
```

| Header retornado | Uso |
| --- | --- |
| Cache-Control | Sem cache público de dados pessoais/QR. |
| X-Request-Id | Correlação e cache. |

Erros: `400`, `401`, `403`, `422`, `429`, `500`, `503`. Ver [envelope e comportamento](README.md#erros).

<a id="post_atendimentos_pesquisa"></a>
## POST /atendimentos/pesquisa

**Tela:** Lista de atendimentos. **Ação:** Pesquisar pedidos com linhas prontas.

Dados da pessoa/responsável e ações já vêm na linha. Filtros temporais reutilizáveis; não confundir número de serviços com pedidos.

Permissões: `atendimentos.ler`.

| Nome | Local | Obrigatório | Tipo | Uso |
| --- | --- | --- | --- | --- |
| X-CSRF-Token | header | sim | string | Obrigatório nas chamadas autenticadas não GET; cookie HttpOnly é enviado automaticamente pelo navegador. |

Entrada obrigatória `application/json`: [PesquisaAtendimentos](#schema-PesquisaAtendimentos).

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| q | string | não | Nome/protocolo/texto autorizado. |
| municipeId | string (uuid) | não | Identificador interno UUID. |
| filtros | FiltroAtendimento | não | Todos os critérios coincidem no mesmo atendimento. |
| fusoHorario | string | não | Fuso das datas com horário. |
| cursor | string | não | Cursor retornado para esta consulta. |
| limite | integer | não | Default 25, máximo 100. · minimum=1; maximum=100 |
| incluirTotal | boolean | não | Solicitar total autorizado. |
| ordenarPor | enum: abertoEm, prazo, protocolo, titulo, situacao | não | Ordenação permitida da lista de pedidos. |
| direcao | enum: asc, desc | não | Sentido. |

```json
{
  "q": "iluminação",
  "municipeId": "11111111-1111-4111-8111-111111111111",
  "filtros": {
    "existe": true,
    "situacoes": [
      "aberto"
    ],
    "servicoIds": [
      "11111111-1111-4111-8111-111111111111"
    ],
    "responsavelIds": [
      "11111111-1111-4111-8111-111111111111"
    ],
    "abertura": {
      "modo": "componentes",
      "dia": 15,
      "mes": 11,
      "ano": 1990
    },
    "conclusao": {
      "modo": "componentes",
      "dia": 15,
      "mes": 11,
      "ano": 1990
    }
  },
  "fusoHorario": "America/Sao_Paulo",
  "cursor": "cursor-exemplo",
  "limite": 25,
  "incluirTotal": true,
  "ordenarPor": "abertoEm",
  "direcao": "asc"
}
```

**Resposta 200:** Dados prontos para a tela, no alcance autorizado.

`application/json` · [ResultadoAtendimentos](#schema-ResultadoAtendimentos)

```json
{
  "dados": [
    {
      "id": "11111111-1111-4111-8111-111111111111",
      "protocolo": "2026-000001",
      "titulo": "Pedido de iluminação",
      "situacao": "aberto",
      "pessoa": {
        "id": "11111111-1111-4111-8111-111111111111",
        "rotulo": "Ana Exemplo",
        "ativo": true
      },
      "responsavel": {
        "id": "11111111-1111-4111-8111-111111111111",
        "rotulo": "Ana Exemplo",
        "ativo": true
      },
      "abertoEm": "2026-11-16T17:00:00Z",
      "prazo": "2026-11-16T17:00:00Z",
      "acoesPermitidas": [
        "abrir"
      ],
      "identidadePendente": false
    }
  ],
  "paginacao": {
    "proximoCursor": null,
    "total": 1,
    "limite": 25
  },
  "situacoes": [
    "aberto"
  ]
}
```

| Header retornado | Uso |
| --- | --- |
| Cache-Control | Sem cache público de dados pessoais/QR. |
| X-Request-Id | Correlação e cache. |

Erros: `400`, `401`, `403`, `422`, `429`, `500`, `503`. Ver [envelope e comportamento](README.md#erros).

<a id="post_atendimentos"></a>
## POST /atendimentos

**Tela:** Novo atendimento. **Ação:** Salvar atendimento completo e seus itens.

Cria solicitante novo completo quando informado, protocolo, serviços, pendências, notas, anexos e vínculos de mensagens na mesma transação. Cliente não precisa salvar pessoa/serviço/pendência antes para obter IDs; chaves locais resolvem anexos de serviços novos. Retorna ficha e resumo atualizado da conversa quando aplicável.

Permissões: `atendimentos.criar`.

| Nome | Local | Obrigatório | Tipo | Uso |
| --- | --- | --- | --- | --- |
| X-CSRF-Token | header | sim | string | Obrigatório nas chamadas autenticadas não GET; cookie HttpOnly é enviado automaticamente pelo navegador. |
| Idempotency-Key | header | sim | string | Mesma identidade+rota+chave+corpo não repete efeitos. Corpo alterado usa nova chave. |

Entrada obrigatória `application/json`: [CriarAtendimento](#schema-CriarAtendimento).

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| titulo | string | sim | Resumo. · minLength=1 |
| descricao | string | sim | Demanda completa. · minLength=1 |
| canal | enum: presencial, telefone, whatsapp, email, outro | sim | Origem. |
| categoriaId | string (uuid) \| null | não | Identificador interno UUID. |
| responsavelId | string (uuid) \| null | não | Identificador interno UUID. |
| prazo | string (date-time) \| null | não | Instante em UTC; apresentação no fuso da interface. |
| situacao | enum: aberto, em_andamento, aguardando_informacao, encaminhado, concluido, cancelado | não | Concluir exige resultado; backend valida transições. |
| resultado | string \| null | não | Resultado do pedido. |
| servicos | array<ServicoFormulario> | não | Lista de valores. · minItems=0; maxItems=100 |
| pendencias | array<PendenciaFormulario> | não | Lista de valores. · minItems=0; maxItems=100 |
| anexos | array<AnexoFormulario> | não | Lista de valores. · minItems=0; maxItems=100 |
| notas | array<NotaFormulario> | não | Lista de valores. · minItems=0; maxItems=100 |
| solicitante | Solicitante | sim | Não obriga salvar pessoa antes; novo cadastro e pedido são transacionais. Identidade desconhecida permanece a identificar com contato/conversa, sem inventar pessoa. |
| rascunhoId | string (uuid) | não | Identificador interno UUID. |
| contextoConversa | ContextoPedidoConversa | não | ContextoPedidoConversa |

```json
{
  "titulo": "Pedido de iluminação",
  "descricao": "Solicita verificação da iluminação da rua.",
  "canal": "presencial",
  "situacao": "aberto",
  "servicos": [
    {
      "chave": "servico-1",
      "tipoServicoId": "33333333-3333-4333-8333-333333333333",
      "ocorridoEm": "2026-11-16T17:00:00Z",
      "situacao": "planejado"
    }
  ],
  "pendencias": [
    {
      "chave": "pendencia-1",
      "descricao": "Consultar retorno.",
      "situacao": "aberta"
    }
  ],
  "anexos": [
    {
      "chave": "anexo-1",
      "uploadToken": "upload-anexo-exemplo",
      "execucaoChave": "servico-1",
      "descricao": "Comprovante apresentado."
    }
  ],
  "notas": [
    {
      "chave": "nota-1",
      "texto": "Aguardar retorno do órgão."
    }
  ],
  "solicitante": {
    "tipo": "existente",
    "municipeId": "11111111-1111-4111-8111-111111111111"
  },
  "rascunhoId": "11111111-1111-4111-8111-111111111111"
}
```

**Resposta 201:** Dados prontos para a tela, no alcance autorizado.

`application/json` · [FichaAtendimento](#schema-FichaAtendimento)

```json
{
  "id": "11111111-1111-4111-8111-111111111111",
  "versao": 1,
  "etag": "\"edicao-1\"",
  "protocolo": "2026-000001",
  "pessoa": {
    "id": "11111111-1111-4111-8111-111111111111",
    "nome": "Ana Exemplo",
    "bairro": "Centro",
    "contatoPrincipal": "+5511999990000",
    "foto": {
      "id": "11111111-1111-4111-8111-111111111111",
      "nome": "foto-exemplo.jpg",
      "mimeType": "image/jpeg",
      "tamanhoBytes": 1024,
      "url": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo",
      "miniaturaUrl": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo?variante=miniatura"
    },
    "arquivado": false
  },
  "formulario": {
    "titulo": "Pedido de iluminação",
    "descricao": "Solicita verificação da iluminação da rua.",
    "canal": "presencial",
    "situacao": "aberto",
    "servicos": [
      {
        "chave": "servico-1",
        "id": "11111111-1111-4111-8111-111111111111",
        "tipoServicoId": "33333333-3333-4333-8333-333333333333",
        "ocorridoEm": "2026-11-16T17:00:00Z",
        "situacao": "planejado"
      }
    ],
    "pendencias": [
      {
        "chave": "pendencia-1",
        "id": "11111111-1111-4111-8111-111111111111",
        "descricao": "Consultar retorno.",
        "situacao": "aberta"
      }
    ],
    "anexos": [
      {
        "chave": "anexo-1",
        "id": "11111111-1111-4111-8111-111111111111",
        "execucaoChave": "servico-1",
        "descricao": "Comprovante apresentado."
      }
    ],
    "notas": [
      {
        "chave": "nota-1",
        "id": "11111111-1111-4111-8111-111111111111",
        "texto": "Aguardar retorno do órgão."
      }
    ]
  },
  "referencias": {
    "servicos": [
      {
        "id": "11111111-1111-4111-8111-111111111111",
        "rotulo": "Ana Exemplo",
        "ativo": true
      }
    ],
    "responsaveis": [
      {
        "id": "11111111-1111-4111-8111-111111111111",
        "rotulo": "Ana Exemplo",
        "ativo": true
      }
    ],
    "categoria": {
      "id": "11111111-1111-4111-8111-111111111111",
      "rotulo": "Ana Exemplo",
      "ativo": true
    }
  },
  "arquivos": [
    {
      "id": "11111111-1111-4111-8111-111111111111",
      "nome": "foto-exemplo.jpg",
      "mimeType": "image/jpeg",
      "tamanhoBytes": 1024,
      "url": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo",
      "miniaturaUrl": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo?variante=miniatura"
    }
  ],
  "mensagensVinculadas": {
    "dados": [
      {
        "id": "11111111-1111-4111-8111-111111111111",
        "chaveCliente": "msg-local-1",
        "direcao": "entrada",
        "texto": "Gostaria de saber o andamento.",
        "arquivos": [
          {
            "id": "11111111-1111-4111-8111-111111111111",
            "nome": "foto-exemplo.jpg",
            "mimeType": "image/jpeg",
            "tamanhoBytes": 1024,
            "url": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo",
            "miniaturaUrl": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo?variante=miniatura"
          }
        ],
        "ocorridoEm": "2026-11-16T17:00:00Z",
        "estadoEnvio": "recebida",
        "atendimentos": [
          {
            "id": "11111111-1111-4111-8111-111111111111",
            "rotulo": "Ana Exemplo",
            "ativo": true
          }
        ]
      }
    ],
    "paginacao": {
      "proximoCursor": null,
      "total": 1,
      "limite": 25
    }
  },
  "atividadesRecentes": [
    {
      "id": "11111111-1111-4111-8111-111111111111",
      "acao": "municipe.atualizado",
      "alvoTipo": "municipe",
      "alvoId": "11111111-1111-4111-8111-111111111111",
      "autor": {
        "tipo": "usuario",
        "usuarioId": "11111111-1111-4111-8111-111111111111",
        "nome": "Operador Exemplo"
      },
      "ocorridoEm": "2026-11-16T17:00:00Z",
      "resumo": "Ficha atualizada.",
      "podeReverter": true
    }
  ],
  "contextoEdicao": {
    "sexos": [
      {
        "codigo": "nao_informado",
        "rotulo": "Não informado"
      }
    ],
    "tiposDocumento": [
      "cpf"
    ],
    "classificacoesIniciais": [
      {
        "id": "11111111-1111-4111-8111-111111111111",
        "rotulo": "Ana Exemplo",
        "ativo": true
      }
    ],
    "responsaveisIniciais": [
      {
        "id": "11111111-1111-4111-8111-111111111111",
        "rotulo": "Ana Exemplo",
        "ativo": true
      }
    ],
    "servicosIniciais": [
      {
        "id": "11111111-1111-4111-8111-111111111111",
        "rotulo": "Ana Exemplo",
        "ativo": true
      }
    ],
    "limites": {
      "maxUploadBytes": 26214400,
      "maxArquivosPorLote": 10,
      "maxAudioSegundos": 600,
      "maxObservacaoCaracteres": 100000,
      "mimeTypes": [
        "application/pdf"
      ],
      "maxItensPorColecao": 100,
      "maxDestinatariosEtiquetas": 5000
    },
    "permissoes": {
      "acoes": [
        "salvar"
      ],
      "camposEditaveis": [
        "contatos"
      ]
    }
  },
  "conversaAtualizada": {
    "id": "11111111-1111-4111-8111-111111111111",
    "etag": "\"conversa-1\"",
    "pessoa": {
      "id": "11111111-1111-4111-8111-111111111111",
      "nome": "Ana Exemplo",
      "bairro": "Centro",
      "contatoPrincipal": "+5511999990000",
      "foto": {
        "id": "11111111-1111-4111-8111-111111111111",
        "nome": "foto-exemplo.jpg",
        "mimeType": "image/jpeg",
        "tamanhoBytes": 1024,
        "url": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo",
        "miniaturaUrl": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo?variante=miniatura"
      },
      "arquivado": false
    },
    "contatoCanal": "+5511999990000",
    "estado": "aguardando",
    "responsavel": {
      "id": "11111111-1111-4111-8111-111111111111",
      "rotulo": "Ana Exemplo",
      "ativo": true
    },
    "equipe": {
      "id": "11111111-1111-4111-8111-111111111111",
      "rotulo": "Ana Exemplo",
      "ativo": true
    },
    "naoLidas": 1,
    "ultimaMensagem": "Gostaria de saber o andamento.",
    "ultimaMensagemEm": "2026-11-16T17:00:00Z"
  },
  "solicitanteAtual": {
    "tipo": "existente",
    "municipeId": "11111111-1111-4111-8111-111111111111"
  }
}
```

| Header retornado | Uso |
| --- | --- |
| Cache-Control | Sem cache público de dados pessoais/QR. |
| X-Request-Id | Correlação e cache. |
| ETag | Usar este ETag na edição do agregado indicado. |
| X-Activity-Id | Atividade do comando agregado, com seus detalhes por campo/vínculo. |

Erros: `400`, `401`, `403`, `409`, `422`, `429`, `500`, `503`. Ver [envelope e comportamento](README.md#erros).

O backend resolve nesta ação: validar formulário e solicitante; cadastrar pessoa inline se necessário e autorizado; gerar protocolo; criar serviços e resolver chaves locais; criar pendências/notas e consumir anexos; vincular mensagens pertinentes; auditar tudo e devolver ficha/contexto.

<a id="get_atendimentos_id"></a>
## GET /atendimentos/{id}

**Tela:** Ficha de atendimento. **Ação:** Abrir pedido pronto para editar.

Um GET traz formulário completo, pessoa, referências selecionadas, serviços/pendências/notas, anexos com URLs, mensagens pertinentes e atividades recentes. Não há GET obrigatório por item do atendimento.

Permissões: `atendimentos.ler`.

| Nome | Local | Obrigatório | Tipo | Uso |
| --- | --- | --- | --- | --- |
| id | path | sim | string (uuid) | Identificador interno UUID. |

**Resposta 200:** Dados prontos para a tela, no alcance autorizado.

`application/json` · [FichaAtendimento](#schema-FichaAtendimento)

```json
{
  "id": "11111111-1111-4111-8111-111111111111",
  "versao": 1,
  "etag": "\"edicao-1\"",
  "protocolo": "2026-000001",
  "pessoa": {
    "id": "11111111-1111-4111-8111-111111111111",
    "nome": "Ana Exemplo",
    "bairro": "Centro",
    "contatoPrincipal": "+5511999990000",
    "foto": {
      "id": "11111111-1111-4111-8111-111111111111",
      "nome": "foto-exemplo.jpg",
      "mimeType": "image/jpeg",
      "tamanhoBytes": 1024,
      "url": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo",
      "miniaturaUrl": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo?variante=miniatura"
    },
    "arquivado": false
  },
  "formulario": {
    "titulo": "Pedido de iluminação",
    "descricao": "Solicita verificação da iluminação da rua.",
    "canal": "presencial",
    "situacao": "aberto",
    "servicos": [
      {
        "chave": "servico-1",
        "id": "11111111-1111-4111-8111-111111111111",
        "tipoServicoId": "33333333-3333-4333-8333-333333333333",
        "ocorridoEm": "2026-11-16T17:00:00Z",
        "situacao": "planejado"
      }
    ],
    "pendencias": [
      {
        "chave": "pendencia-1",
        "id": "11111111-1111-4111-8111-111111111111",
        "descricao": "Consultar retorno.",
        "situacao": "aberta"
      }
    ],
    "anexos": [
      {
        "chave": "anexo-1",
        "id": "11111111-1111-4111-8111-111111111111",
        "execucaoChave": "servico-1",
        "descricao": "Comprovante apresentado."
      }
    ],
    "notas": [
      {
        "chave": "nota-1",
        "id": "11111111-1111-4111-8111-111111111111",
        "texto": "Aguardar retorno do órgão."
      }
    ]
  },
  "referencias": {
    "servicos": [
      {
        "id": "11111111-1111-4111-8111-111111111111",
        "rotulo": "Ana Exemplo",
        "ativo": true
      }
    ],
    "responsaveis": [
      {
        "id": "11111111-1111-4111-8111-111111111111",
        "rotulo": "Ana Exemplo",
        "ativo": true
      }
    ],
    "categoria": {
      "id": "11111111-1111-4111-8111-111111111111",
      "rotulo": "Ana Exemplo",
      "ativo": true
    }
  },
  "arquivos": [
    {
      "id": "11111111-1111-4111-8111-111111111111",
      "nome": "foto-exemplo.jpg",
      "mimeType": "image/jpeg",
      "tamanhoBytes": 1024,
      "url": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo",
      "miniaturaUrl": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo?variante=miniatura"
    }
  ],
  "mensagensVinculadas": {
    "dados": [
      {
        "id": "11111111-1111-4111-8111-111111111111",
        "chaveCliente": "msg-local-1",
        "direcao": "entrada",
        "texto": "Gostaria de saber o andamento.",
        "arquivos": [
          {
            "id": "11111111-1111-4111-8111-111111111111",
            "nome": "foto-exemplo.jpg",
            "mimeType": "image/jpeg",
            "tamanhoBytes": 1024,
            "url": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo",
            "miniaturaUrl": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo?variante=miniatura"
          }
        ],
        "ocorridoEm": "2026-11-16T17:00:00Z",
        "estadoEnvio": "recebida",
        "atendimentos": [
          {
            "id": "11111111-1111-4111-8111-111111111111",
            "rotulo": "Ana Exemplo",
            "ativo": true
          }
        ]
      }
    ],
    "paginacao": {
      "proximoCursor": null,
      "total": 1,
      "limite": 25
    }
  },
  "atividadesRecentes": [
    {
      "id": "11111111-1111-4111-8111-111111111111",
      "acao": "municipe.atualizado",
      "alvoTipo": "municipe",
      "alvoId": "11111111-1111-4111-8111-111111111111",
      "autor": {
        "tipo": "usuario",
        "usuarioId": "11111111-1111-4111-8111-111111111111",
        "nome": "Operador Exemplo"
      },
      "ocorridoEm": "2026-11-16T17:00:00Z",
      "resumo": "Ficha atualizada.",
      "podeReverter": true
    }
  ],
  "contextoEdicao": {
    "sexos": [
      {
        "codigo": "nao_informado",
        "rotulo": "Não informado"
      }
    ],
    "tiposDocumento": [
      "cpf"
    ],
    "classificacoesIniciais": [
      {
        "id": "11111111-1111-4111-8111-111111111111",
        "rotulo": "Ana Exemplo",
        "ativo": true
      }
    ],
    "responsaveisIniciais": [
      {
        "id": "11111111-1111-4111-8111-111111111111",
        "rotulo": "Ana Exemplo",
        "ativo": true
      }
    ],
    "servicosIniciais": [
      {
        "id": "11111111-1111-4111-8111-111111111111",
        "rotulo": "Ana Exemplo",
        "ativo": true
      }
    ],
    "limites": {
      "maxUploadBytes": 26214400,
      "maxArquivosPorLote": 10,
      "maxAudioSegundos": 600,
      "maxObservacaoCaracteres": 100000,
      "mimeTypes": [
        "application/pdf"
      ],
      "maxItensPorColecao": 100,
      "maxDestinatariosEtiquetas": 5000
    },
    "permissoes": {
      "acoes": [
        "salvar"
      ],
      "camposEditaveis": [
        "contatos"
      ]
    }
  },
  "conversaAtualizada": {
    "id": "11111111-1111-4111-8111-111111111111",
    "etag": "\"conversa-1\"",
    "pessoa": {
      "id": "11111111-1111-4111-8111-111111111111",
      "nome": "Ana Exemplo",
      "bairro": "Centro",
      "contatoPrincipal": "+5511999990000",
      "foto": {
        "id": "11111111-1111-4111-8111-111111111111",
        "nome": "foto-exemplo.jpg",
        "mimeType": "image/jpeg",
        "tamanhoBytes": 1024,
        "url": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo",
        "miniaturaUrl": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo?variante=miniatura"
      },
      "arquivado": false
    },
    "contatoCanal": "+5511999990000",
    "estado": "aguardando",
    "responsavel": {
      "id": "11111111-1111-4111-8111-111111111111",
      "rotulo": "Ana Exemplo",
      "ativo": true
    },
    "equipe": {
      "id": "11111111-1111-4111-8111-111111111111",
      "rotulo": "Ana Exemplo",
      "ativo": true
    },
    "naoLidas": 1,
    "ultimaMensagem": "Gostaria de saber o andamento.",
    "ultimaMensagemEm": "2026-11-16T17:00:00Z"
  },
  "solicitanteAtual": {
    "tipo": "existente",
    "municipeId": "11111111-1111-4111-8111-111111111111"
  }
}
```

| Header retornado | Uso |
| --- | --- |
| Cache-Control | Sem cache público de dados pessoais/QR. |
| X-Request-Id | Correlação e cache. |
| ETag | Usar este ETag na edição do agregado indicado. |

Erros: `400`, `401`, `403`, `404`, `422`, `429`, `500`, `503`. Ver [envelope e comportamento](README.md#erros).

<a id="patch_atendimentos_id"></a>
## PATCH /atendimentos/{id}

**Tela:** Ficha de atendimento. **Ação:** Salvar edição ou conclusão com todos os itens.

Um Salvar/Concluir pode editar dados, serviços, pendências, notas e anexos e alterar situação/resultado. If-Match do agregado; qualquer falha aborta o conjunto. Corrigir solicitante exige permissão adicional e motivo; concluir/reabrir segue política. Estado de conversa permanece independente.

Permissões: `atendimentos.editar`.

| Nome | Local | Obrigatório | Tipo | Uso |
| --- | --- | --- | --- | --- |
| id | path | sim | string (uuid) | Identificador interno UUID. |
| X-CSRF-Token | header | sim | string | Obrigatório nas chamadas autenticadas não GET; cookie HttpOnly é enviado automaticamente pelo navegador. |
| Idempotency-Key | header | sim | string | Mesma identidade+rota+chave+corpo não repete efeitos. Corpo alterado usa nova chave. |
| If-Match | header | sim | string | Versão do agregado/item especificado. 428 ausente, 412 desatualizado; não aceitar *. |

Entrada obrigatória `application/json`: [EditarAtendimento](#schema-EditarAtendimento).

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| titulo | string | não | Resumo. · minLength=1 |
| descricao | string | não | Demanda completa. · minLength=1 |
| canal | enum: presencial, telefone, whatsapp, email, outro | não | Origem. |
| categoriaId | string (uuid) \| null | não | Identificador interno UUID. |
| responsavelId | string (uuid) \| null | não | Identificador interno UUID. |
| prazo | string (date-time) \| null | não | Instante em UTC; apresentação no fuso da interface. |
| situacao | enum: aberto, em_andamento, aguardando_informacao, encaminhado, concluido, cancelado | não | Concluir exige resultado; backend valida transições. |
| resultado | string \| null | não | Resultado do pedido. |
| servicos | array<ServicoFormulario> | não | Lista de valores. · minItems=0; maxItems=100 |
| pendencias | array<PendenciaFormulario> | não | Lista de valores. · minItems=0; maxItems=100 |
| anexos | array<AnexoFormulario> | não | Lista de valores. · minItems=0; maxItems=100 |
| notas | array<NotaFormulario> | não | Lista de valores. · minItems=0; maxItems=100 |
| corrigirSolicitante | object | não |  |
| rascunhoId | string (uuid) | não | Identificador interno UUID. |
| motivoAlteracao | string | não | Obrigatório ao concluir/reabrir/corrigir estado conforme a ação. · minLength=3 |

```json
{
  "situacao": "concluido",
  "resultado": "Orientação prestada.",
  "motivoAlteracao": "Retorno conferido pela equipe.",
  "pendencias": [
    {
      "chave": "pendencia-1",
      "id": "11111111-1111-4111-8111-111111111111",
      "descricao": "Consultar retorno.",
      "situacao": "concluida",
      "resultado": "Retorno consultado."
    }
  ]
}
```

**Resposta 200:** Dados prontos para a tela, no alcance autorizado.

`application/json` · [FichaAtendimento](#schema-FichaAtendimento)

```json
{
  "id": "11111111-1111-4111-8111-111111111111",
  "versao": 1,
  "etag": "\"edicao-1\"",
  "protocolo": "2026-000001",
  "pessoa": {
    "id": "11111111-1111-4111-8111-111111111111",
    "nome": "Ana Exemplo",
    "bairro": "Centro",
    "contatoPrincipal": "+5511999990000",
    "foto": {
      "id": "11111111-1111-4111-8111-111111111111",
      "nome": "foto-exemplo.jpg",
      "mimeType": "image/jpeg",
      "tamanhoBytes": 1024,
      "url": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo",
      "miniaturaUrl": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo?variante=miniatura"
    },
    "arquivado": false
  },
  "formulario": {
    "titulo": "Pedido de iluminação",
    "descricao": "Solicita verificação da iluminação da rua.",
    "canal": "presencial",
    "situacao": "aberto",
    "servicos": [
      {
        "chave": "servico-1",
        "id": "11111111-1111-4111-8111-111111111111",
        "tipoServicoId": "33333333-3333-4333-8333-333333333333",
        "ocorridoEm": "2026-11-16T17:00:00Z",
        "situacao": "planejado"
      }
    ],
    "pendencias": [
      {
        "chave": "pendencia-1",
        "id": "11111111-1111-4111-8111-111111111111",
        "descricao": "Consultar retorno.",
        "situacao": "aberta"
      }
    ],
    "anexos": [
      {
        "chave": "anexo-1",
        "id": "11111111-1111-4111-8111-111111111111",
        "execucaoChave": "servico-1",
        "descricao": "Comprovante apresentado."
      }
    ],
    "notas": [
      {
        "chave": "nota-1",
        "id": "11111111-1111-4111-8111-111111111111",
        "texto": "Aguardar retorno do órgão."
      }
    ]
  },
  "referencias": {
    "servicos": [
      {
        "id": "11111111-1111-4111-8111-111111111111",
        "rotulo": "Ana Exemplo",
        "ativo": true
      }
    ],
    "responsaveis": [
      {
        "id": "11111111-1111-4111-8111-111111111111",
        "rotulo": "Ana Exemplo",
        "ativo": true
      }
    ],
    "categoria": {
      "id": "11111111-1111-4111-8111-111111111111",
      "rotulo": "Ana Exemplo",
      "ativo": true
    }
  },
  "arquivos": [
    {
      "id": "11111111-1111-4111-8111-111111111111",
      "nome": "foto-exemplo.jpg",
      "mimeType": "image/jpeg",
      "tamanhoBytes": 1024,
      "url": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo",
      "miniaturaUrl": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo?variante=miniatura"
    }
  ],
  "mensagensVinculadas": {
    "dados": [
      {
        "id": "11111111-1111-4111-8111-111111111111",
        "chaveCliente": "msg-local-1",
        "direcao": "entrada",
        "texto": "Gostaria de saber o andamento.",
        "arquivos": [
          {
            "id": "11111111-1111-4111-8111-111111111111",
            "nome": "foto-exemplo.jpg",
            "mimeType": "image/jpeg",
            "tamanhoBytes": 1024,
            "url": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo",
            "miniaturaUrl": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo?variante=miniatura"
          }
        ],
        "ocorridoEm": "2026-11-16T17:00:00Z",
        "estadoEnvio": "recebida",
        "atendimentos": [
          {
            "id": "11111111-1111-4111-8111-111111111111",
            "rotulo": "Ana Exemplo",
            "ativo": true
          }
        ]
      }
    ],
    "paginacao": {
      "proximoCursor": null,
      "total": 1,
      "limite": 25
    }
  },
  "atividadesRecentes": [
    {
      "id": "11111111-1111-4111-8111-111111111111",
      "acao": "municipe.atualizado",
      "alvoTipo": "municipe",
      "alvoId": "11111111-1111-4111-8111-111111111111",
      "autor": {
        "tipo": "usuario",
        "usuarioId": "11111111-1111-4111-8111-111111111111",
        "nome": "Operador Exemplo"
      },
      "ocorridoEm": "2026-11-16T17:00:00Z",
      "resumo": "Ficha atualizada.",
      "podeReverter": true
    }
  ],
  "contextoEdicao": {
    "sexos": [
      {
        "codigo": "nao_informado",
        "rotulo": "Não informado"
      }
    ],
    "tiposDocumento": [
      "cpf"
    ],
    "classificacoesIniciais": [
      {
        "id": "11111111-1111-4111-8111-111111111111",
        "rotulo": "Ana Exemplo",
        "ativo": true
      }
    ],
    "responsaveisIniciais": [
      {
        "id": "11111111-1111-4111-8111-111111111111",
        "rotulo": "Ana Exemplo",
        "ativo": true
      }
    ],
    "servicosIniciais": [
      {
        "id": "11111111-1111-4111-8111-111111111111",
        "rotulo": "Ana Exemplo",
        "ativo": true
      }
    ],
    "limites": {
      "maxUploadBytes": 26214400,
      "maxArquivosPorLote": 10,
      "maxAudioSegundos": 600,
      "maxObservacaoCaracteres": 100000,
      "mimeTypes": [
        "application/pdf"
      ],
      "maxItensPorColecao": 100,
      "maxDestinatariosEtiquetas": 5000
    },
    "permissoes": {
      "acoes": [
        "salvar"
      ],
      "camposEditaveis": [
        "contatos"
      ]
    }
  },
  "conversaAtualizada": {
    "id": "11111111-1111-4111-8111-111111111111",
    "etag": "\"conversa-1\"",
    "pessoa": {
      "id": "11111111-1111-4111-8111-111111111111",
      "nome": "Ana Exemplo",
      "bairro": "Centro",
      "contatoPrincipal": "+5511999990000",
      "foto": {
        "id": "11111111-1111-4111-8111-111111111111",
        "nome": "foto-exemplo.jpg",
        "mimeType": "image/jpeg",
        "tamanhoBytes": 1024,
        "url": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo",
        "miniaturaUrl": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo?variante=miniatura"
      },
      "arquivado": false
    },
    "contatoCanal": "+5511999990000",
    "estado": "aguardando",
    "responsavel": {
      "id": "11111111-1111-4111-8111-111111111111",
      "rotulo": "Ana Exemplo",
      "ativo": true
    },
    "equipe": {
      "id": "11111111-1111-4111-8111-111111111111",
      "rotulo": "Ana Exemplo",
      "ativo": true
    },
    "naoLidas": 1,
    "ultimaMensagem": "Gostaria de saber o andamento.",
    "ultimaMensagemEm": "2026-11-16T17:00:00Z"
  },
  "solicitanteAtual": {
    "tipo": "existente",
    "municipeId": "11111111-1111-4111-8111-111111111111"
  }
}
```

| Header retornado | Uso |
| --- | --- |
| Cache-Control | Sem cache público de dados pessoais/QR. |
| X-Request-Id | Correlação e cache. |
| ETag | Usar este ETag na edição do agregado indicado. |
| X-Activity-Id | Atividade do comando agregado, com seus detalhes por campo/vínculo. |

Erros: `400`, `401`, `403`, `404`, `409`, `412`, `422`, `428`, `429`, `500`, `503`. Ver [envelope e comportamento](README.md#erros).

O backend resolve nesta ação: revalidar ETag e transição; validar coleções e referências locais; gravar diferenças em transação; auditar e retornar ficha atual.

<a id="delete_atendimentos_id"></a>
## DELETE /atendimentos/{id}

**Tela:** Ficha de atendimento. **Ação:** Arquivar atendimento.

Botão explícito com motivo e ETag da ficha. Preserva protocolos, vínculos e histórico; dependências incompatíveis impedem arquivar.

Permissões: `atendimentos.arquivar`.

| Nome | Local | Obrigatório | Tipo | Uso |
| --- | --- | --- | --- | --- |
| id | path | sim | string (uuid) | Identificador interno UUID. |
| X-CSRF-Token | header | sim | string | Obrigatório nas chamadas autenticadas não GET; cookie HttpOnly é enviado automaticamente pelo navegador. |
| Idempotency-Key | header | sim | string | Mesma identidade+rota+chave+corpo não repete efeitos. Corpo alterado usa nova chave. |
| If-Match | header | sim | string | Versão do agregado/item especificado. 428 ausente, 412 desatualizado; não aceitar *. |
| X-Motivo | header | sim | string | Motivo auditado; DELETE não recebe corpo. |

**Resposta 204:** Operação concluída, sem corpo.

| Header retornado | Uso |
| --- | --- |
| Cache-Control | Sem cache público de dados pessoais/QR. |
| X-Request-Id | Correlação e cache. |
| X-Activity-Id | Atividade do comando agregado, com seus detalhes por campo/vínculo. |

Erros: `400`, `401`, `403`, `404`, `409`, `412`, `422`, `428`, `429`, `500`, `503`. Ver [envelope e comportamento](README.md#erros).

<a id="get_agenda"></a>
## GET /agenda

**Tela:** Minha agenda e entrar em contato. **Ação:** Carregar pendências, retornos e motivos.

Lista já contém pessoa, pedido, responsável, ETag do item e ações. Data filtra previstoEm. Faixas de contato são configuráveis, não envios automáticos. Atividades internas ou tentativa sem resposta não renovam contato efetivo.

Permissões: `agenda.ler`.

| Nome | Local | Obrigatório | Tipo | Uso |
| --- | --- | --- | --- | --- |
| limite | query | não | integer | Limite, máximo 100. |
| cursor | query | não | string | Retomar a página sem refazer consultas por item. |
| incluirTotal | query | não | boolean | Default false. |
| data | query | não | FiltroData | FiltroData codificado como JSON; a rota declara o campo temporal. |
| motivo | query | não | enum: aguardando_equipe, retorno_vencido, primeiro_contato, inatividade, tentativa_sem_resposta | Filtrar lista. |
| responsavelId | query | não | string (uuid) | Escopo autorizado. |

**Resposta 200:** Dados prontos para a tela, no alcance autorizado.

`application/json` · [Agenda](#schema-Agenda)

```json
{
  "dados": [
    {
      "id": "11111111-1111-4111-8111-111111111111",
      "versao": 1,
      "etag": "\"edicao-1\"",
      "tipo": "pendencia_atendimento",
      "pessoa": {
        "id": "11111111-1111-4111-8111-111111111111",
        "nome": "Ana Exemplo",
        "bairro": "Centro",
        "contatoPrincipal": "+5511999990000",
        "foto": {
          "id": "11111111-1111-4111-8111-111111111111",
          "nome": "foto-exemplo.jpg",
          "mimeType": "image/jpeg",
          "tamanhoBytes": 1024,
          "url": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo",
          "miniaturaUrl": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo?variante=miniatura"
        },
        "arquivado": false
      },
      "atendimento": {
        "id": "11111111-1111-4111-8111-111111111111",
        "protocolo": "2026-000001",
        "titulo": "Pedido de iluminação",
        "situacao": "aberto",
        "pessoa": {
          "id": "11111111-1111-4111-8111-111111111111",
          "rotulo": "Ana Exemplo",
          "ativo": true
        },
        "responsavel": {
          "id": "11111111-1111-4111-8111-111111111111",
          "rotulo": "Ana Exemplo",
          "ativo": true
        },
        "abertoEm": "2026-11-16T17:00:00Z",
        "prazo": "2026-11-16T17:00:00Z",
        "acoesPermitidas": [
          "abrir"
        ],
        "identidadePendente": false
      },
      "descricao": "Consultar retorno.",
      "responsavel": {
        "id": "11111111-1111-4111-8111-111111111111",
        "rotulo": "Ana Exemplo",
        "ativo": true
      },
      "previstoEm": "2026-11-16T17:00:00Z",
      "situacao": "aberto",
      "motivosRetomada": [
        "aguardando_equipe"
      ],
      "ultimaTentativaEm": "2026-11-16T17:00:00Z",
      "acoesPermitidas": [
        "registrar_resultado"
      ]
    }
  ],
  "paginacao": {
    "proximoCursor": null,
    "total": 1,
    "limite": 25
  },
  "responsaveis": [
    {
      "id": "11111111-1111-4111-8111-111111111111",
      "rotulo": "Ana Exemplo",
      "ativo": true
    }
  ],
  "contadores": {
    "vencidos": 2,
    "hoje": 3
  }
}
```

| Header retornado | Uso |
| --- | --- |
| Cache-Control | Sem cache público de dados pessoais/QR. |
| X-Request-Id | Correlação e cache. |

Erros: `400`, `401`, `403`, `422`, `429`, `500`, `503`. Ver [envelope e comportamento](README.md#erros).

<a id="post_agenda_contatos"></a>
## POST /agenda/contatos

**Tela:** Agendar próximo contato. **Ação:** Criar retorno com pessoa e responsável.

Uma chamada agenda a próxima ação. Evitar duplicar a mesma intenção e respeitar preferência de não abordagem proativa. Não envia WhatsApp.

Permissões: `agenda.editar`.

| Nome | Local | Obrigatório | Tipo | Uso |
| --- | --- | --- | --- | --- |
| X-CSRF-Token | header | sim | string | Obrigatório nas chamadas autenticadas não GET; cookie HttpOnly é enviado automaticamente pelo navegador. |
| Idempotency-Key | header | sim | string | Mesma identidade+rota+chave+corpo não repete efeitos. Corpo alterado usa nova chave. |

Entrada obrigatória `application/json`: [AgendarContato](#schema-AgendarContato).

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| municipeId | string (uuid) | sim | Identificador interno UUID. |
| atendimentoId | string (uuid) | não | Opcional quando vinculado a pedido. |
| motivo | string | sim | Objetivo do retorno. · minLength=1 |
| responsavelId | string (uuid) | sim | Identificador interno UUID. |
| previstoEm | string (date-time) | sim | Instante em UTC; apresentação no fuso da interface. |

```json
{
  "municipeId": "11111111-1111-4111-8111-111111111111",
  "atendimentoId": "11111111-1111-4111-8111-111111111111",
  "motivo": "Consultar andamento do pedido.",
  "responsavelId": "11111111-1111-4111-8111-111111111111",
  "previstoEm": "2026-11-16T17:00:00Z"
}
```

**Resposta 201:** Dados prontos para a tela, no alcance autorizado.

`application/json` · [ItemAgenda](#schema-ItemAgenda)

```json
{
  "id": "11111111-1111-4111-8111-111111111111",
  "versao": 1,
  "etag": "\"edicao-1\"",
  "tipo": "pendencia_atendimento",
  "pessoa": {
    "id": "11111111-1111-4111-8111-111111111111",
    "nome": "Ana Exemplo",
    "bairro": "Centro",
    "contatoPrincipal": "+5511999990000",
    "foto": {
      "id": "11111111-1111-4111-8111-111111111111",
      "nome": "foto-exemplo.jpg",
      "mimeType": "image/jpeg",
      "tamanhoBytes": 1024,
      "url": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo",
      "miniaturaUrl": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo?variante=miniatura"
    },
    "arquivado": false
  },
  "atendimento": {
    "id": "11111111-1111-4111-8111-111111111111",
    "protocolo": "2026-000001",
    "titulo": "Pedido de iluminação",
    "situacao": "aberto",
    "pessoa": {
      "id": "11111111-1111-4111-8111-111111111111",
      "rotulo": "Ana Exemplo",
      "ativo": true
    },
    "responsavel": {
      "id": "11111111-1111-4111-8111-111111111111",
      "rotulo": "Ana Exemplo",
      "ativo": true
    },
    "abertoEm": "2026-11-16T17:00:00Z",
    "prazo": "2026-11-16T17:00:00Z",
    "acoesPermitidas": [
      "abrir"
    ],
    "identidadePendente": false
  },
  "descricao": "Consultar retorno.",
  "responsavel": {
    "id": "11111111-1111-4111-8111-111111111111",
    "rotulo": "Ana Exemplo",
    "ativo": true
  },
  "previstoEm": "2026-11-16T17:00:00Z",
  "situacao": "aberto",
  "motivosRetomada": [
    "aguardando_equipe"
  ],
  "ultimaTentativaEm": "2026-11-16T17:00:00Z",
  "acoesPermitidas": [
    "registrar_resultado"
  ]
}
```

| Header retornado | Uso |
| --- | --- |
| Cache-Control | Sem cache público de dados pessoais/QR. |
| X-Request-Id | Correlação e cache. |
| ETag | Usar este ETag na edição do agregado indicado. |
| X-Activity-Id | Atividade do comando agregado, com seus detalhes por campo/vínculo. |

Erros: `400`, `401`, `403`, `409`, `422`, `429`, `500`, `503`. Ver [envelope e comportamento](README.md#erros).

<a id="patch_agenda_id"></a>
## PATCH /agenda/{id}

**Tela:** Agenda e entrar em contato. **Ação:** Registrar resultado, concluir ou reagendar.

If-Match do item já entregue na lista. Um único clique pode registrar tentativa/conversa real, concluir compromisso, atualizar preferência e criar novo retorno. Não exige abrir pedido/pessoa e executar vários POSTs. Resultado sem resposta não vira contato efetivo.

Permissões: `agenda.editar`.

| Nome | Local | Obrigatório | Tipo | Uso |
| --- | --- | --- | --- | --- |
| id | path | sim | string (uuid) | Identificador interno UUID. |
| X-CSRF-Token | header | sim | string | Obrigatório nas chamadas autenticadas não GET; cookie HttpOnly é enviado automaticamente pelo navegador. |
| Idempotency-Key | header | sim | string | Mesma identidade+rota+chave+corpo não repete efeitos. Corpo alterado usa nova chave. |
| If-Match | header | sim | string | Versão do agregado/item especificado. 428 ausente, 412 desatualizado; não aceitar *. |

Entrada obrigatória `application/json`: [AgendaAlterar](#schema-AgendaAlterar).

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| descricao | string | não | Nova descrição. |
| responsavelId | string (uuid) \| null | não | Identificador interno UUID. |
| previstoEm | string (date-time) | não | Instante em UTC; apresentação no fuso da interface. |
| situacao | enum: aberto, concluido, cancelado | não | Alteração de estado do compromisso. |
| resultadoContato | enum: falou, sem_resposta, remarcar, nao_deseja_contato | não | Quando registra tentativa/conversa; backend cria evidência e calcula recência. |
| ocorridoEm | string (date-time) | não | Instante real da tentativa/conversa. |
| resumoResultado | string | não | Descrição auditada. |
| novoRetornoEm | string (date-time) | não | Pode registrar resultado e agendar a próxima tentativa na mesma chamada. |

```json
{
  "descricao": "Retornar ao solicitante.",
  "responsavelId": "11111111-1111-4111-8111-111111111111",
  "previstoEm": "2026-11-16T17:00:00Z",
  "situacao": "aberto",
  "resultadoContato": "falou",
  "ocorridoEm": "2026-11-16T17:00:00Z",
  "resumoResultado": "Ligação atendida e orientação prestada.",
  "novoRetornoEm": "2026-11-16T17:00:00Z"
}
```

**Resposta 200:** Dados prontos para a tela, no alcance autorizado.

`application/json` · [ResultadoAgenda](#schema-ResultadoAgenda)

```json
{
  "item": {
    "id": "11111111-1111-4111-8111-111111111111",
    "versao": 1,
    "etag": "\"edicao-1\"",
    "tipo": "pendencia_atendimento",
    "pessoa": {
      "id": "11111111-1111-4111-8111-111111111111",
      "nome": "Ana Exemplo",
      "bairro": "Centro",
      "contatoPrincipal": "+5511999990000",
      "foto": {
        "id": "11111111-1111-4111-8111-111111111111",
        "nome": "foto-exemplo.jpg",
        "mimeType": "image/jpeg",
        "tamanhoBytes": 1024,
        "url": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo",
        "miniaturaUrl": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo?variante=miniatura"
      },
      "arquivado": false
    },
    "atendimento": {
      "id": "11111111-1111-4111-8111-111111111111",
      "protocolo": "2026-000001",
      "titulo": "Pedido de iluminação",
      "situacao": "aberto",
      "pessoa": {
        "id": "11111111-1111-4111-8111-111111111111",
        "rotulo": "Ana Exemplo",
        "ativo": true
      },
      "responsavel": {
        "id": "11111111-1111-4111-8111-111111111111",
        "rotulo": "Ana Exemplo",
        "ativo": true
      },
      "abertoEm": "2026-11-16T17:00:00Z",
      "prazo": "2026-11-16T17:00:00Z",
      "acoesPermitidas": [
        "abrir"
      ],
      "identidadePendente": false
    },
    "descricao": "Consultar retorno.",
    "responsavel": {
      "id": "11111111-1111-4111-8111-111111111111",
      "rotulo": "Ana Exemplo",
      "ativo": true
    },
    "previstoEm": "2026-11-16T17:00:00Z",
    "situacao": "aberto",
    "motivosRetomada": [
      "aguardando_equipe"
    ],
    "ultimaTentativaEm": "2026-11-16T17:00:00Z",
    "acoesPermitidas": [
      "registrar_resultado"
    ]
  },
  "novoRetorno": {
    "id": "11111111-1111-4111-8111-111111111111",
    "versao": 1,
    "etag": "\"edicao-1\"",
    "tipo": "pendencia_atendimento",
    "pessoa": {
      "id": "11111111-1111-4111-8111-111111111111",
      "nome": "Ana Exemplo",
      "bairro": "Centro",
      "contatoPrincipal": "+5511999990000",
      "foto": {
        "id": "11111111-1111-4111-8111-111111111111",
        "nome": "foto-exemplo.jpg",
        "mimeType": "image/jpeg",
        "tamanhoBytes": 1024,
        "url": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo",
        "miniaturaUrl": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo?variante=miniatura"
      },
      "arquivado": false
    },
    "atendimento": {
      "id": "11111111-1111-4111-8111-111111111111",
      "protocolo": "2026-000001",
      "titulo": "Pedido de iluminação",
      "situacao": "aberto",
      "pessoa": {
        "id": "11111111-1111-4111-8111-111111111111",
        "rotulo": "Ana Exemplo",
        "ativo": true
      },
      "responsavel": {
        "id": "11111111-1111-4111-8111-111111111111",
        "rotulo": "Ana Exemplo",
        "ativo": true
      },
      "abertoEm": "2026-11-16T17:00:00Z",
      "prazo": "2026-11-16T17:00:00Z",
      "acoesPermitidas": [
        "abrir"
      ],
      "identidadePendente": false
    },
    "descricao": "Consultar retorno.",
    "responsavel": {
      "id": "11111111-1111-4111-8111-111111111111",
      "rotulo": "Ana Exemplo",
      "ativo": true
    },
    "previstoEm": "2026-11-16T17:00:00Z",
    "situacao": "aberto",
    "motivosRetomada": [
      "aguardando_equipe"
    ],
    "ultimaTentativaEm": "2026-11-16T17:00:00Z",
    "acoesPermitidas": [
      "registrar_resultado"
    ]
  },
  "contatoAtualizado": {
    "ultimaInteracaoEm": "2026-11-16T17:00:00Z",
    "diasSemContato": 75,
    "janelaDias": 90,
    "diasComInteracao": 8,
    "mensagensRecebidas": 20,
    "mensagensEnviadas": 10,
    "atendimentos": 2,
    "ultimaTentativaEm": "2026-11-16T17:00:00Z",
    "cobertura": "disponivel"
  }
}
```

| Header retornado | Uso |
| --- | --- |
| Cache-Control | Sem cache público de dados pessoais/QR. |
| X-Request-Id | Correlação e cache. |
| X-Activity-Id | Atividade do comando agregado, com seus detalhes por campo/vínculo. |

Erros: `400`, `401`, `403`, `404`, `409`, `412`, `422`, `428`, `429`, `500`, `503`. Ver [envelope e comportamento](README.md#erros).

O backend resolve nesta ação: validar item e preferência; registrar resultado/interação pela data real; concluir ou reagendar e evitar duplicidade; recalcular indicadores; retornar item e próximo compromisso.

<a id="get_relatorios_resumo"></a>
## GET /relatorios/resumo

**Tela:** Painel de gestão. **Ação:** Carregar indicadores fixos do painel.

Uma resposta contém totais autorizados de pedidos, serviços e retornos. Data se aplica a conclusão/execução no período; abertos/vencidos refletem o estado na consulta. Cada cartão tem significado explícito, sem contagem por junções duplicadas.

Permissões: `relatorios.ler`.

| Nome | Local | Obrigatório | Tipo | Uso |
| --- | --- | --- | --- | --- |
| data | query | não | FiltroData | FiltroData codificado como JSON; a rota declara o campo temporal. |

**Resposta 200:** Dados prontos para a tela, no alcance autorizado.

`application/json` · [ResumoGestao](#schema-ResumoGestao)

```json
{
  "abertos": 12,
  "vencidos": 3,
  "concluidos": 8,
  "servicosRealizados": 10,
  "retornosVencidos": 2,
  "semInteracaoRegistrada": 10,
  "calculadoEm": "2026-11-16T17:00:00Z"
}
```

| Header retornado | Uso |
| --- | --- |
| Cache-Control | Sem cache público de dados pessoais/QR. |
| X-Request-Id | Correlação e cache. |

Erros: `400`, `401`, `403`, `422`, `429`, `500`, `503`. Ver [envelope e comportamento](README.md#erros).

<a id="get_caixa"></a>
## GET /caixa

**Tela:** Caixa de atendimento. **Ação:** Carregar lista e contadores da caixa.

Linha já contém responsável/pessoa/trecho/badges e ETag de contexto. Não é necessário consultar cada conversa para desenhar a fila.

Permissões: `conversas.ler`.

| Nome | Local | Obrigatório | Tipo | Uso |
| --- | --- | --- | --- | --- |
| limite | query | não | integer | Limite, máximo 100. |
| cursor | query | não | string | Retomar a página sem refazer consultas por item. |
| incluirTotal | query | não | boolean | Default false. |
| situacao | query | não | enum: aguardando, em_triagem, em_atendimento, encerrada | Estado da conversa, não do protocolo. |
| responsavelId | query | não | string (uuid) | Responsável autorizado. |
| equipeId | query | não | string (uuid) | Equipe autorizada. |

**Resposta 200:** Dados prontos para a tela, no alcance autorizado.

`application/json` · [Caixa](#schema-Caixa)

```json
{
  "dados": [
    {
      "id": "11111111-1111-4111-8111-111111111111",
      "etag": "\"conversa-1\"",
      "pessoa": {
        "id": "11111111-1111-4111-8111-111111111111",
        "nome": "Ana Exemplo",
        "bairro": "Centro",
        "contatoPrincipal": "+5511999990000",
        "foto": {
          "id": "11111111-1111-4111-8111-111111111111",
          "nome": "foto-exemplo.jpg",
          "mimeType": "image/jpeg",
          "tamanhoBytes": 1024,
          "url": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo",
          "miniaturaUrl": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo?variante=miniatura"
        },
        "arquivado": false
      },
      "contatoCanal": "+5511999990000",
      "estado": "aguardando",
      "responsavel": {
        "id": "11111111-1111-4111-8111-111111111111",
        "rotulo": "Ana Exemplo",
        "ativo": true
      },
      "equipe": {
        "id": "11111111-1111-4111-8111-111111111111",
        "rotulo": "Ana Exemplo",
        "ativo": true
      },
      "naoLidas": 1,
      "ultimaMensagem": "Gostaria de saber o andamento.",
      "ultimaMensagemEm": "2026-11-16T17:00:00Z"
    }
  ],
  "paginacao": {
    "proximoCursor": null,
    "total": 1,
    "limite": 25
  },
  "contadores": {
    "aguardando": 3,
    "minhas": 2
  },
  "meuEstado": {
    "estado": "disponivel",
    "capacidade": 3
  },
  "equipes": [
    {
      "id": "11111111-1111-4111-8111-111111111111",
      "rotulo": "Ana Exemplo",
      "ativo": true
    }
  ]
}
```

| Header retornado | Uso |
| --- | --- |
| Cache-Control | Sem cache público de dados pessoais/QR. |
| X-Request-Id | Correlação e cache. |

Erros: `400`, `401`, `403`, `422`, `429`, `500`, `503`. Ver [envelope e comportamento](README.md#erros).

<a id="get_conversas_id"></a>
## GET /conversas/{id}

**Tela:** Workspace da conversa. **Ação:** Abrir diálogo com todo o contexto.

Entrega mensagens/notas iniciais, pessoa, pedidos, triagem, destinos de transferência e botões permitidos. ETag controla responsabilidade/contexto; mensagens novas não tornam a versão de envio obsoleta desnecessariamente.

Permissões: `conversas.ler`.

| Nome | Local | Obrigatório | Tipo | Uso |
| --- | --- | --- | --- | --- |
| id | path | sim | string (uuid) | Identificador interno UUID. |

**Resposta 200:** Dados prontos para a tela, no alcance autorizado.

`application/json` · [WorkspaceConversa](#schema-WorkspaceConversa)

```json
{
  "conversa": {
    "id": "11111111-1111-4111-8111-111111111111",
    "etag": "\"conversa-1\"",
    "pessoa": {
      "id": "11111111-1111-4111-8111-111111111111",
      "nome": "Ana Exemplo",
      "bairro": "Centro",
      "contatoPrincipal": "+5511999990000",
      "foto": {
        "id": "11111111-1111-4111-8111-111111111111",
        "nome": "foto-exemplo.jpg",
        "mimeType": "image/jpeg",
        "tamanhoBytes": 1024,
        "url": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo",
        "miniaturaUrl": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo?variante=miniatura"
      },
      "arquivado": false
    },
    "contatoCanal": "+5511999990000",
    "estado": "aguardando",
    "responsavel": {
      "id": "11111111-1111-4111-8111-111111111111",
      "rotulo": "Ana Exemplo",
      "ativo": true
    },
    "equipe": {
      "id": "11111111-1111-4111-8111-111111111111",
      "rotulo": "Ana Exemplo",
      "ativo": true
    },
    "naoLidas": 1,
    "ultimaMensagem": "Gostaria de saber o andamento.",
    "ultimaMensagemEm": "2026-11-16T17:00:00Z"
  },
  "historico": {
    "dados": [
      {
        "tipo": "mensagem",
        "ocorridoEm": "2026-11-16T17:00:00Z",
        "mensagem": {
          "id": "11111111-1111-4111-8111-111111111111",
          "chaveCliente": "msg-local-1",
          "direcao": "entrada",
          "texto": "Gostaria de saber o andamento.",
          "arquivos": [
            {
              "id": "11111111-1111-4111-8111-111111111111",
              "nome": "foto-exemplo.jpg",
              "mimeType": "image/jpeg",
              "tamanhoBytes": 1024,
              "url": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo",
              "miniaturaUrl": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo?variante=miniatura"
            }
          ],
          "ocorridoEm": "2026-11-16T17:00:00Z",
          "estadoEnvio": "recebida",
          "atendimentos": [
            {
              "id": "11111111-1111-4111-8111-111111111111",
              "rotulo": "Ana Exemplo",
              "ativo": true
            }
          ]
        }
      }
    ],
    "paginacao": {
      "proximoCursor": null,
      "total": 1,
      "limite": 25
    }
  },
  "pessoa": {
    "id": "11111111-1111-4111-8111-111111111111",
    "nome": "Ana Exemplo",
    "bairro": "Centro",
    "contatoPrincipal": "+5511999990000",
    "foto": {
      "id": "11111111-1111-4111-8111-111111111111",
      "nome": "foto-exemplo.jpg",
      "mimeType": "image/jpeg",
      "tamanhoBytes": 1024,
      "url": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo",
      "miniaturaUrl": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo?variante=miniatura"
    },
    "arquivado": false
  },
  "atendimentos": [
    {
      "id": "11111111-1111-4111-8111-111111111111",
      "protocolo": "2026-000001",
      "titulo": "Pedido de iluminação",
      "situacao": "aberto",
      "pessoa": {
        "id": "11111111-1111-4111-8111-111111111111",
        "rotulo": "Ana Exemplo",
        "ativo": true
      },
      "responsavel": {
        "id": "11111111-1111-4111-8111-111111111111",
        "rotulo": "Ana Exemplo",
        "ativo": true
      },
      "abertoEm": "2026-11-16T17:00:00Z",
      "prazo": "2026-11-16T17:00:00Z",
      "acoesPermitidas": [
        "abrir"
      ],
      "identidadePendente": false
    }
  ],
  "triagem": {
    "id": "11111111-1111-4111-8111-111111111111",
    "estado": "aguardando",
    "resumo": "Possível continuação do pedido.",
    "candidatos": [
      {
        "id": "11111111-1111-4111-8111-111111111111",
        "protocolo": "2026-000001",
        "titulo": "Pedido de iluminação",
        "situacao": "aberto",
        "pessoa": {
          "id": "11111111-1111-4111-8111-111111111111",
          "rotulo": "Ana Exemplo",
          "ativo": true
        },
        "responsavel": {
          "id": "11111111-1111-4111-8111-111111111111",
          "rotulo": "Ana Exemplo",
          "ativo": true
        },
        "abertoEm": "2026-11-16T17:00:00Z",
        "prazo": "2026-11-16T17:00:00Z",
        "acoesPermitidas": [
          "abrir"
        ],
        "identidadePendente": false
      }
    ],
    "motivos": [
      "Protocolo citado."
    ]
  },
  "destinosTransferencia": [
    {
      "id": "11111111-1111-4111-8111-111111111111",
      "rotulo": "Ana Exemplo",
      "ativo": true
    }
  ],
  "acoesPermitidas": [
    "assumir"
  ],
  "modoIa": "desativada"
}
```

| Header retornado | Uso |
| --- | --- |
| Cache-Control | Sem cache público de dados pessoais/QR. |
| X-Request-Id | Correlação e cache. |
| ETag | Usar este ETag na edição do agregado indicado. |

Erros: `400`, `401`, `403`, `404`, `422`, `429`, `500`, `503`. Ver [envelope e comportamento](README.md#erros).

<a id="get_conversas_id_historico"></a>
## GET /conversas/{id}/historico

**Tela:** Rolagem e abas do diálogo. **Ação:** Carregar página anterior de mensagens ou notas.

Só acontece ao rolar/abrir histórico longo. Itens tipados incluem mídia, autor e protocolos prontos; não exige GET por mensagem. Notas internas são visualmente distintas.

Permissões: `conversas.ler`.

| Nome | Local | Obrigatório | Tipo | Uso |
| --- | --- | --- | --- | --- |
| id | path | sim | string (uuid) | Identificador interno UUID. |
| limite | query | não | integer | Limite, máximo 100. |
| cursor | query | não | string | Retomar a página sem refazer consultas por item. |
| incluirTotal | query | não | boolean | Default false. |
| tipo | query | não | enum: todos, mensagem, nota, transferencia | Default todos. |
| data | query | não | FiltroData | FiltroData codificado como JSON; a rota declara o campo temporal. |

**Resposta 200:** Dados prontos para a tela, no alcance autorizado.

`application/json` · [HistoricoConversa](#schema-HistoricoConversa)

```json
{
  "dados": [
    {
      "tipo": "mensagem",
      "ocorridoEm": "2026-11-16T17:00:00Z",
      "mensagem": {
        "id": "11111111-1111-4111-8111-111111111111",
        "chaveCliente": "msg-local-1",
        "direcao": "entrada",
        "texto": "Gostaria de saber o andamento.",
        "arquivos": [
          {
            "id": "11111111-1111-4111-8111-111111111111",
            "nome": "foto-exemplo.jpg",
            "mimeType": "image/jpeg",
            "tamanhoBytes": 1024,
            "url": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo",
            "miniaturaUrl": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo?variante=miniatura"
          }
        ],
        "ocorridoEm": "2026-11-16T17:00:00Z",
        "estadoEnvio": "recebida",
        "atendimentos": [
          {
            "id": "11111111-1111-4111-8111-111111111111",
            "rotulo": "Ana Exemplo",
            "ativo": true
          }
        ]
      }
    }
  ],
  "paginacao": {
    "proximoCursor": null,
    "total": 1,
    "limite": 25
  }
}
```

| Header retornado | Uso |
| --- | --- |
| Cache-Control | Sem cache público de dados pessoais/QR. |
| X-Request-Id | Correlação e cache. |

Erros: `400`, `401`, `403`, `404`, `422`, `429`, `500`, `503`. Ver [envelope e comportamento](README.md#erros).

<a id="post_conversas_id_assumir"></a>
## POST /conversas/{id}/assumir

**Tela:** Workspace da conversa. **Ação:** Assumir conversa para mim.

Usuário vem da sessão, não do corpo. Assunção atômica verifica capacidade/equipe/horário e bloqueia saída automática concorrente. Pode reabrir caixa encerrada conforme política sem reabrir todos os pedidos. Retorna workspace já atualizado.

Permissões: `conversas.assumir`.

| Nome | Local | Obrigatório | Tipo | Uso |
| --- | --- | --- | --- | --- |
| id | path | sim | string (uuid) | Identificador interno UUID. |
| X-CSRF-Token | header | sim | string | Obrigatório nas chamadas autenticadas não GET; cookie HttpOnly é enviado automaticamente pelo navegador. |
| Idempotency-Key | header | sim | string | Mesma identidade+rota+chave+corpo não repete efeitos. Corpo alterado usa nova chave. |
| If-Match | header | sim | string | Versão do agregado/item especificado. 428 ausente, 412 desatualizado; não aceitar *. |

**Resposta 200:** Dados prontos para a tela, no alcance autorizado.

`application/json` · [WorkspaceConversa](#schema-WorkspaceConversa)

```json
{
  "conversa": {
    "id": "11111111-1111-4111-8111-111111111111",
    "etag": "\"conversa-1\"",
    "pessoa": {
      "id": "11111111-1111-4111-8111-111111111111",
      "nome": "Ana Exemplo",
      "bairro": "Centro",
      "contatoPrincipal": "+5511999990000",
      "foto": {
        "id": "11111111-1111-4111-8111-111111111111",
        "nome": "foto-exemplo.jpg",
        "mimeType": "image/jpeg",
        "tamanhoBytes": 1024,
        "url": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo",
        "miniaturaUrl": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo?variante=miniatura"
      },
      "arquivado": false
    },
    "contatoCanal": "+5511999990000",
    "estado": "aguardando",
    "responsavel": {
      "id": "11111111-1111-4111-8111-111111111111",
      "rotulo": "Ana Exemplo",
      "ativo": true
    },
    "equipe": {
      "id": "11111111-1111-4111-8111-111111111111",
      "rotulo": "Ana Exemplo",
      "ativo": true
    },
    "naoLidas": 1,
    "ultimaMensagem": "Gostaria de saber o andamento.",
    "ultimaMensagemEm": "2026-11-16T17:00:00Z"
  },
  "historico": {
    "dados": [
      {
        "tipo": "mensagem",
        "ocorridoEm": "2026-11-16T17:00:00Z",
        "mensagem": {
          "id": "11111111-1111-4111-8111-111111111111",
          "chaveCliente": "msg-local-1",
          "direcao": "entrada",
          "texto": "Gostaria de saber o andamento.",
          "arquivos": [
            {
              "id": "11111111-1111-4111-8111-111111111111",
              "nome": "foto-exemplo.jpg",
              "mimeType": "image/jpeg",
              "tamanhoBytes": 1024,
              "url": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo",
              "miniaturaUrl": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo?variante=miniatura"
            }
          ],
          "ocorridoEm": "2026-11-16T17:00:00Z",
          "estadoEnvio": "recebida",
          "atendimentos": [
            {
              "id": "11111111-1111-4111-8111-111111111111",
              "rotulo": "Ana Exemplo",
              "ativo": true
            }
          ]
        }
      }
    ],
    "paginacao": {
      "proximoCursor": null,
      "total": 1,
      "limite": 25
    }
  },
  "pessoa": {
    "id": "11111111-1111-4111-8111-111111111111",
    "nome": "Ana Exemplo",
    "bairro": "Centro",
    "contatoPrincipal": "+5511999990000",
    "foto": {
      "id": "11111111-1111-4111-8111-111111111111",
      "nome": "foto-exemplo.jpg",
      "mimeType": "image/jpeg",
      "tamanhoBytes": 1024,
      "url": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo",
      "miniaturaUrl": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo?variante=miniatura"
    },
    "arquivado": false
  },
  "atendimentos": [
    {
      "id": "11111111-1111-4111-8111-111111111111",
      "protocolo": "2026-000001",
      "titulo": "Pedido de iluminação",
      "situacao": "aberto",
      "pessoa": {
        "id": "11111111-1111-4111-8111-111111111111",
        "rotulo": "Ana Exemplo",
        "ativo": true
      },
      "responsavel": {
        "id": "11111111-1111-4111-8111-111111111111",
        "rotulo": "Ana Exemplo",
        "ativo": true
      },
      "abertoEm": "2026-11-16T17:00:00Z",
      "prazo": "2026-11-16T17:00:00Z",
      "acoesPermitidas": [
        "abrir"
      ],
      "identidadePendente": false
    }
  ],
  "triagem": {
    "id": "11111111-1111-4111-8111-111111111111",
    "estado": "aguardando",
    "resumo": "Possível continuação do pedido.",
    "candidatos": [
      {
        "id": "11111111-1111-4111-8111-111111111111",
        "protocolo": "2026-000001",
        "titulo": "Pedido de iluminação",
        "situacao": "aberto",
        "pessoa": {
          "id": "11111111-1111-4111-8111-111111111111",
          "rotulo": "Ana Exemplo",
          "ativo": true
        },
        "responsavel": {
          "id": "11111111-1111-4111-8111-111111111111",
          "rotulo": "Ana Exemplo",
          "ativo": true
        },
        "abertoEm": "2026-11-16T17:00:00Z",
        "prazo": "2026-11-16T17:00:00Z",
        "acoesPermitidas": [
          "abrir"
        ],
        "identidadePendente": false
      }
    ],
    "motivos": [
      "Protocolo citado."
    ]
  },
  "destinosTransferencia": [
    {
      "id": "11111111-1111-4111-8111-111111111111",
      "rotulo": "Ana Exemplo",
      "ativo": true
    }
  ],
  "acoesPermitidas": [
    "assumir"
  ],
  "modoIa": "desativada"
}
```

| Header retornado | Uso |
| --- | --- |
| Cache-Control | Sem cache público de dados pessoais/QR. |
| X-Request-Id | Correlação e cache. |
| ETag | Usar este ETag na edição do agregado indicado. |
| X-Activity-Id | Atividade do comando agregado, com seus detalhes por campo/vínculo. |

Erros: `400`, `401`, `403`, `404`, `409`, `412`, `422`, `428`, `429`, `500`, `503`. Ver [envelope e comportamento](README.md#erros).

<a id="post_conversas_id_transferir"></a>
## POST /conversas/{id}/transferir

**Tela:** Transferir conversa. **Ação:** Transferir para atendente ou equipe.

Uma ação preserva contexto/notas e atualiza responsabilidade. Se o executor perdeu acesso após transferir, resposta orienta retirar a conversa sem devolver conteúdo agora restrito. Versão já veio no workspace.

Permissões: `conversas.transferir`.

| Nome | Local | Obrigatório | Tipo | Uso |
| --- | --- | --- | --- | --- |
| id | path | sim | string (uuid) | Identificador interno UUID. |
| X-CSRF-Token | header | sim | string | Obrigatório nas chamadas autenticadas não GET; cookie HttpOnly é enviado automaticamente pelo navegador. |
| Idempotency-Key | header | sim | string | Mesma identidade+rota+chave+corpo não repete efeitos. Corpo alterado usa nova chave. |
| If-Match | header | sim | string | Versão do agregado/item especificado. 428 ausente, 412 desatualizado; não aceitar *. |

Entrada obrigatória `application/json`: [TransferirConversa](#schema-TransferirConversa).

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| destinoTipo | enum: usuario, equipe | sim | Pessoa ou fila de equipe. |
| destinoId | string (uuid) | sim | Identificador interno UUID. |
| motivo | string | sim | Motivo auditado. · minLength=3 |

```json
{
  "destinoTipo": "usuario",
  "destinoId": "11111111-1111-4111-8111-111111111111",
  "motivo": "Encaminhar à equipe responsável."
}
```

**Resposta 200:** Dados prontos para a tela, no alcance autorizado.

`application/json` · [ResultadoTransferencia](#schema-ResultadoTransferencia)

```json
{
  "conversaId": "11111111-1111-4111-8111-111111111111",
  "removidaDaMinhaCaixa": true,
  "conversa": {
    "id": "11111111-1111-4111-8111-111111111111",
    "etag": "\"conversa-1\"",
    "pessoa": {
      "id": "11111111-1111-4111-8111-111111111111",
      "nome": "Ana Exemplo",
      "bairro": "Centro",
      "contatoPrincipal": "+5511999990000",
      "foto": {
        "id": "11111111-1111-4111-8111-111111111111",
        "nome": "foto-exemplo.jpg",
        "mimeType": "image/jpeg",
        "tamanhoBytes": 1024,
        "url": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo",
        "miniaturaUrl": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo?variante=miniatura"
      },
      "arquivado": false
    },
    "contatoCanal": "+5511999990000",
    "estado": "aguardando",
    "responsavel": {
      "id": "11111111-1111-4111-8111-111111111111",
      "rotulo": "Ana Exemplo",
      "ativo": true
    },
    "equipe": {
      "id": "11111111-1111-4111-8111-111111111111",
      "rotulo": "Ana Exemplo",
      "ativo": true
    },
    "naoLidas": 1,
    "ultimaMensagem": "Gostaria de saber o andamento.",
    "ultimaMensagemEm": "2026-11-16T17:00:00Z"
  }
}
```

| Header retornado | Uso |
| --- | --- |
| Cache-Control | Sem cache público de dados pessoais/QR. |
| X-Request-Id | Correlação e cache. |
| X-Activity-Id | Atividade do comando agregado, com seus detalhes por campo/vínculo. |

Erros: `400`, `401`, `403`, `404`, `409`, `412`, `422`, `428`, `429`, `500`, `503`. Ver [envelope e comportamento](README.md#erros).

<a id="patch_conversas_id_contexto"></a>
## PATCH /conversas/{id}/contexto

**Tela:** Identificação e protocolos da conversa. **Ação:** Salvar pessoa, vínculos e correção da triagem.

Um modal salva identificação contextual, vínculos das mensagens envolvidas e/ou modo IA. Backend valida alvos e registra aceite/correção da triagem; não move histórico de familiares. Novo pedido usa o POST agregado de atendimento com contextoConversa, não uma sequência de criar e vincular.

Permissões: `conversas.editar`.

| Nome | Local | Obrigatório | Tipo | Uso |
| --- | --- | --- | --- | --- |
| id | path | sim | string (uuid) | Identificador interno UUID. |
| X-CSRF-Token | header | sim | string | Obrigatório nas chamadas autenticadas não GET; cookie HttpOnly é enviado automaticamente pelo navegador. |
| Idempotency-Key | header | sim | string | Mesma identidade+rota+chave+corpo não repete efeitos. Corpo alterado usa nova chave. |
| If-Match | header | sim | string | Versão do agregado/item especificado. 428 ausente, 412 desatualizado; não aceitar *. |

Entrada obrigatória `application/json`: [ContextoConversaAlterar](#schema-ContextoConversaAlterar).

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| municipeId | string (uuid) \| null | não | Identificação contextual; não move toda conversa familiar. |
| vinculosMensagens | array<VinculoMensagem> | não | Conjunto dos vínculos das mensagens explicitamente envolvidas; backend valida todos. · minItems=0; maxItems=100 |
| modoIa | enum: desativada, assistida, automatica_validada | não | Automático exige política/permissão adicional. |
| triagemId | string (uuid) | não | Se houve aceite/correção de sugestão. |
| motivo | string | sim | Justificativa. · minLength=3 |

```json
{
  "municipeId": "11111111-1111-4111-8111-111111111111",
  "vinculosMensagens": [
    {
      "mensagemId": "11111111-1111-4111-8111-111111111111",
      "atendimentoId": "33333333-3333-4333-8333-333333333333",
      "trecho": "andamento"
    }
  ],
  "motivo": "Identidade e protocolo conferidos."
}
```

**Resposta 200:** Dados prontos para a tela, no alcance autorizado.

`application/json` · [WorkspaceConversa](#schema-WorkspaceConversa)

```json
{
  "conversa": {
    "id": "11111111-1111-4111-8111-111111111111",
    "etag": "\"conversa-1\"",
    "pessoa": {
      "id": "11111111-1111-4111-8111-111111111111",
      "nome": "Ana Exemplo",
      "bairro": "Centro",
      "contatoPrincipal": "+5511999990000",
      "foto": {
        "id": "11111111-1111-4111-8111-111111111111",
        "nome": "foto-exemplo.jpg",
        "mimeType": "image/jpeg",
        "tamanhoBytes": 1024,
        "url": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo",
        "miniaturaUrl": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo?variante=miniatura"
      },
      "arquivado": false
    },
    "contatoCanal": "+5511999990000",
    "estado": "aguardando",
    "responsavel": {
      "id": "11111111-1111-4111-8111-111111111111",
      "rotulo": "Ana Exemplo",
      "ativo": true
    },
    "equipe": {
      "id": "11111111-1111-4111-8111-111111111111",
      "rotulo": "Ana Exemplo",
      "ativo": true
    },
    "naoLidas": 1,
    "ultimaMensagem": "Gostaria de saber o andamento.",
    "ultimaMensagemEm": "2026-11-16T17:00:00Z"
  },
  "historico": {
    "dados": [
      {
        "tipo": "mensagem",
        "ocorridoEm": "2026-11-16T17:00:00Z",
        "mensagem": {
          "id": "11111111-1111-4111-8111-111111111111",
          "chaveCliente": "msg-local-1",
          "direcao": "entrada",
          "texto": "Gostaria de saber o andamento.",
          "arquivos": [
            {
              "id": "11111111-1111-4111-8111-111111111111",
              "nome": "foto-exemplo.jpg",
              "mimeType": "image/jpeg",
              "tamanhoBytes": 1024,
              "url": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo",
              "miniaturaUrl": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo?variante=miniatura"
            }
          ],
          "ocorridoEm": "2026-11-16T17:00:00Z",
          "estadoEnvio": "recebida",
          "atendimentos": [
            {
              "id": "11111111-1111-4111-8111-111111111111",
              "rotulo": "Ana Exemplo",
              "ativo": true
            }
          ]
        }
      }
    ],
    "paginacao": {
      "proximoCursor": null,
      "total": 1,
      "limite": 25
    }
  },
  "pessoa": {
    "id": "11111111-1111-4111-8111-111111111111",
    "nome": "Ana Exemplo",
    "bairro": "Centro",
    "contatoPrincipal": "+5511999990000",
    "foto": {
      "id": "11111111-1111-4111-8111-111111111111",
      "nome": "foto-exemplo.jpg",
      "mimeType": "image/jpeg",
      "tamanhoBytes": 1024,
      "url": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo",
      "miniaturaUrl": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo?variante=miniatura"
    },
    "arquivado": false
  },
  "atendimentos": [
    {
      "id": "11111111-1111-4111-8111-111111111111",
      "protocolo": "2026-000001",
      "titulo": "Pedido de iluminação",
      "situacao": "aberto",
      "pessoa": {
        "id": "11111111-1111-4111-8111-111111111111",
        "rotulo": "Ana Exemplo",
        "ativo": true
      },
      "responsavel": {
        "id": "11111111-1111-4111-8111-111111111111",
        "rotulo": "Ana Exemplo",
        "ativo": true
      },
      "abertoEm": "2026-11-16T17:00:00Z",
      "prazo": "2026-11-16T17:00:00Z",
      "acoesPermitidas": [
        "abrir"
      ],
      "identidadePendente": false
    }
  ],
  "triagem": {
    "id": "11111111-1111-4111-8111-111111111111",
    "estado": "aguardando",
    "resumo": "Possível continuação do pedido.",
    "candidatos": [
      {
        "id": "11111111-1111-4111-8111-111111111111",
        "protocolo": "2026-000001",
        "titulo": "Pedido de iluminação",
        "situacao": "aberto",
        "pessoa": {
          "id": "11111111-1111-4111-8111-111111111111",
          "rotulo": "Ana Exemplo",
          "ativo": true
        },
        "responsavel": {
          "id": "11111111-1111-4111-8111-111111111111",
          "rotulo": "Ana Exemplo",
          "ativo": true
        },
        "abertoEm": "2026-11-16T17:00:00Z",
        "prazo": "2026-11-16T17:00:00Z",
        "acoesPermitidas": [
          "abrir"
        ],
        "identidadePendente": false
      }
    ],
    "motivos": [
      "Protocolo citado."
    ]
  },
  "destinosTransferencia": [
    {
      "id": "11111111-1111-4111-8111-111111111111",
      "rotulo": "Ana Exemplo",
      "ativo": true
    }
  ],
  "acoesPermitidas": [
    "assumir"
  ],
  "modoIa": "desativada"
}
```

| Header retornado | Uso |
| --- | --- |
| Cache-Control | Sem cache público de dados pessoais/QR. |
| X-Request-Id | Correlação e cache. |
| ETag | Usar este ETag na edição do agregado indicado. |
| X-Activity-Id | Atividade do comando agregado, com seus detalhes por campo/vínculo. |

Erros: `400`, `401`, `403`, `404`, `409`, `412`, `422`, `428`, `429`, `500`, `503`. Ver [envelope e comportamento](README.md#erros).

<a id="post_conversas_id_encerrar"></a>
## POST /conversas/{id}/encerrar

**Tela:** Workspace da conversa. **Ação:** Encerrar atendimento da conversa.

Ação com motivo, independente de concluir protocolos. Preserva contexto; retorna workspace ou estado autorizado para atualizar a caixa.

Permissões: `conversas.editar`.

| Nome | Local | Obrigatório | Tipo | Uso |
| --- | --- | --- | --- | --- |
| id | path | sim | string (uuid) | Identificador interno UUID. |
| X-CSRF-Token | header | sim | string | Obrigatório nas chamadas autenticadas não GET; cookie HttpOnly é enviado automaticamente pelo navegador. |
| Idempotency-Key | header | sim | string | Mesma identidade+rota+chave+corpo não repete efeitos. Corpo alterado usa nova chave. |
| If-Match | header | sim | string | Versão do agregado/item especificado. 428 ausente, 412 desatualizado; não aceitar *. |

Entrada obrigatória `application/json`: [Motivo](#schema-Motivo).

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| motivo | string | sim | Justificativa auditada. · minLength=3; maxLength=2000 |

```json
{
  "motivo": "Ação conferida pela equipe."
}
```

**Resposta 200:** Dados prontos para a tela, no alcance autorizado.

`application/json` · [WorkspaceConversa](#schema-WorkspaceConversa)

```json
{
  "conversa": {
    "id": "11111111-1111-4111-8111-111111111111",
    "etag": "\"conversa-1\"",
    "pessoa": {
      "id": "11111111-1111-4111-8111-111111111111",
      "nome": "Ana Exemplo",
      "bairro": "Centro",
      "contatoPrincipal": "+5511999990000",
      "foto": {
        "id": "11111111-1111-4111-8111-111111111111",
        "nome": "foto-exemplo.jpg",
        "mimeType": "image/jpeg",
        "tamanhoBytes": 1024,
        "url": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo",
        "miniaturaUrl": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo?variante=miniatura"
      },
      "arquivado": false
    },
    "contatoCanal": "+5511999990000",
    "estado": "aguardando",
    "responsavel": {
      "id": "11111111-1111-4111-8111-111111111111",
      "rotulo": "Ana Exemplo",
      "ativo": true
    },
    "equipe": {
      "id": "11111111-1111-4111-8111-111111111111",
      "rotulo": "Ana Exemplo",
      "ativo": true
    },
    "naoLidas": 1,
    "ultimaMensagem": "Gostaria de saber o andamento.",
    "ultimaMensagemEm": "2026-11-16T17:00:00Z"
  },
  "historico": {
    "dados": [
      {
        "tipo": "mensagem",
        "ocorridoEm": "2026-11-16T17:00:00Z",
        "mensagem": {
          "id": "11111111-1111-4111-8111-111111111111",
          "chaveCliente": "msg-local-1",
          "direcao": "entrada",
          "texto": "Gostaria de saber o andamento.",
          "arquivos": [
            {
              "id": "11111111-1111-4111-8111-111111111111",
              "nome": "foto-exemplo.jpg",
              "mimeType": "image/jpeg",
              "tamanhoBytes": 1024,
              "url": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo",
              "miniaturaUrl": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo?variante=miniatura"
            }
          ],
          "ocorridoEm": "2026-11-16T17:00:00Z",
          "estadoEnvio": "recebida",
          "atendimentos": [
            {
              "id": "11111111-1111-4111-8111-111111111111",
              "rotulo": "Ana Exemplo",
              "ativo": true
            }
          ]
        }
      }
    ],
    "paginacao": {
      "proximoCursor": null,
      "total": 1,
      "limite": 25
    }
  },
  "pessoa": {
    "id": "11111111-1111-4111-8111-111111111111",
    "nome": "Ana Exemplo",
    "bairro": "Centro",
    "contatoPrincipal": "+5511999990000",
    "foto": {
      "id": "11111111-1111-4111-8111-111111111111",
      "nome": "foto-exemplo.jpg",
      "mimeType": "image/jpeg",
      "tamanhoBytes": 1024,
      "url": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo",
      "miniaturaUrl": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo?variante=miniatura"
    },
    "arquivado": false
  },
  "atendimentos": [
    {
      "id": "11111111-1111-4111-8111-111111111111",
      "protocolo": "2026-000001",
      "titulo": "Pedido de iluminação",
      "situacao": "aberto",
      "pessoa": {
        "id": "11111111-1111-4111-8111-111111111111",
        "rotulo": "Ana Exemplo",
        "ativo": true
      },
      "responsavel": {
        "id": "11111111-1111-4111-8111-111111111111",
        "rotulo": "Ana Exemplo",
        "ativo": true
      },
      "abertoEm": "2026-11-16T17:00:00Z",
      "prazo": "2026-11-16T17:00:00Z",
      "acoesPermitidas": [
        "abrir"
      ],
      "identidadePendente": false
    }
  ],
  "triagem": {
    "id": "11111111-1111-4111-8111-111111111111",
    "estado": "aguardando",
    "resumo": "Possível continuação do pedido.",
    "candidatos": [
      {
        "id": "11111111-1111-4111-8111-111111111111",
        "protocolo": "2026-000001",
        "titulo": "Pedido de iluminação",
        "situacao": "aberto",
        "pessoa": {
          "id": "11111111-1111-4111-8111-111111111111",
          "rotulo": "Ana Exemplo",
          "ativo": true
        },
        "responsavel": {
          "id": "11111111-1111-4111-8111-111111111111",
          "rotulo": "Ana Exemplo",
          "ativo": true
        },
        "abertoEm": "2026-11-16T17:00:00Z",
        "prazo": "2026-11-16T17:00:00Z",
        "acoesPermitidas": [
          "abrir"
        ],
        "identidadePendente": false
      }
    ],
    "motivos": [
      "Protocolo citado."
    ]
  },
  "destinosTransferencia": [
    {
      "id": "11111111-1111-4111-8111-111111111111",
      "rotulo": "Ana Exemplo",
      "ativo": true
    }
  ],
  "acoesPermitidas": [
    "assumir"
  ],
  "modoIa": "desativada"
}
```

| Header retornado | Uso |
| --- | --- |
| Cache-Control | Sem cache público de dados pessoais/QR. |
| X-Request-Id | Correlação e cache. |
| ETag | Usar este ETag na edição do agregado indicado. |
| X-Activity-Id | Atividade do comando agregado, com seus detalhes por campo/vínculo. |

Erros: `400`, `401`, `403`, `404`, `409`, `412`, `422`, `428`, `429`, `500`, `503`. Ver [envelope e comportamento](README.md#erros).

<a id="post_conversas_id_mensagens"></a>
## POST /conversas/{id}/mensagens

**Tela:** Compositor de resposta. **Ação:** Enviar resposta ou mídia.

Uma chamada persiste mensagem e tarefa de saída; 202 é pendente, não entregue. Idempotência/chaveCliente permitem conciliar a linha otimista com o evento SSE. Revalidar responsabilidade/modo IA na execução do worker. Upload prévio em lote só para mídias, não para texto.

Permissões: `conversas.responder`.

| Nome | Local | Obrigatório | Tipo | Uso |
| --- | --- | --- | --- | --- |
| id | path | sim | string (uuid) | Identificador interno UUID. |
| X-CSRF-Token | header | sim | string | Obrigatório nas chamadas autenticadas não GET; cookie HttpOnly é enviado automaticamente pelo navegador. |
| Idempotency-Key | header | sim | string | Mesma identidade+rota+chave+corpo não repete efeitos. Corpo alterado usa nova chave. |
| If-Match | header | sim | string | Versão do agregado/item especificado. 428 ausente, 412 desatualizado; não aceitar *. |

Entrada obrigatória `application/json`: [EnviarMensagem](#schema-EnviarMensagem).

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| chaveCliente | string | sim | Chave local única do envio, retornada no resultado/evento. · minLength=1 |
| texto | string | não | Mensagem externa. · minLength=1 |
| uploadTokens | array<string> | não | Lista de valores. · minItems=1; maxItems=100 |
| respostaAMensagemId | string (uuid) | não | Identificador interno UUID. |

```json
{
  "chaveCliente": "msg-local-1",
  "texto": "Estamos acompanhando sua solicitação.",
  "uploadTokens": [
    "upload-midia-exemplo"
  ],
  "respostaAMensagemId": "11111111-1111-4111-8111-111111111111"
}
```

**Resposta 202:** Aceito para processamento; ainda não representa efeito externo concluído.

`application/json` · [MensagemResumo](#schema-MensagemResumo)

```json
{
  "id": "11111111-1111-4111-8111-111111111111",
  "chaveCliente": "msg-local-1",
  "direcao": "entrada",
  "texto": "Gostaria de saber o andamento.",
  "arquivos": [
    {
      "id": "11111111-1111-4111-8111-111111111111",
      "nome": "foto-exemplo.jpg",
      "mimeType": "image/jpeg",
      "tamanhoBytes": 1024,
      "url": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo",
      "miniaturaUrl": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo?variante=miniatura"
    }
  ],
  "ocorridoEm": "2026-11-16T17:00:00Z",
  "estadoEnvio": "recebida",
  "atendimentos": [
    {
      "id": "11111111-1111-4111-8111-111111111111",
      "rotulo": "Ana Exemplo",
      "ativo": true
    }
  ]
}
```

| Header retornado | Uso |
| --- | --- |
| Cache-Control | Sem cache público de dados pessoais/QR. |
| X-Request-Id | Correlação e cache. |
| X-Activity-Id | Atividade do comando agregado, com seus detalhes por campo/vínculo. |

Erros: `400`, `401`, `403`, `404`, `409`, `412`, `422`, `428`, `429`, `500`, `503`. Ver [envelope e comportamento](README.md#erros).

<a id="post_mensagens_id_tentar_novamente"></a>
## POST /mensagens/{id}/tentar-novamente

**Tela:** Mensagem com falha ou estado incerto. **Ação:** Verificar e tentar novamente com segurança.

O backend reconcilia resultado incerto antes de reenviar, sem exigir botão/endpoint de reconciliação seguido de outro de reenvio. Se já entregue, só atualiza o estado; se permanece incerto, não duplica. Uma operação ativa por mensagem.

Permissões: `conversas.responder`.

| Nome | Local | Obrigatório | Tipo | Uso |
| --- | --- | --- | --- | --- |
| id | path | sim | string (uuid) | Identificador interno UUID. |
| X-CSRF-Token | header | sim | string | Obrigatório nas chamadas autenticadas não GET; cookie HttpOnly é enviado automaticamente pelo navegador. |
| Idempotency-Key | header | sim | string | Mesma identidade+rota+chave+corpo não repete efeitos. Corpo alterado usa nova chave. |

Entrada obrigatória `application/json`: [Motivo](#schema-Motivo).

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| motivo | string | sim | Justificativa auditada. · minLength=3; maxLength=2000 |

```json
{
  "motivo": "Ação conferida pela equipe."
}
```

**Resposta 202:** Aceito para processamento; ainda não representa efeito externo concluído.

`application/json` · [Operacao](#schema-Operacao)

```json
{
  "id": "11111111-1111-4111-8111-111111111111",
  "tipo": "reenviar_mensagem",
  "estado": "pendente",
  "progresso": 0,
  "podeCancelar": true,
  "resultado": null
}
```

| Header retornado | Uso |
| --- | --- |
| Cache-Control | Sem cache público de dados pessoais/QR. |
| X-Request-Id | Correlação e cache. |
| Location | URI de GET /operacoes/{id} para fallback de acompanhamento. |
| X-Activity-Id | Atividade do comando agregado, com seus detalhes por campo/vínculo. |

Erros: `400`, `401`, `403`, `404`, `409`, `422`, `429`, `500`, `503`. Ver [envelope e comportamento](README.md#erros).

O backend resolve nesta ação: reconciliar com provedor; só reenviar falha comprovada e autorizada; atualizar linha e emitir evento.

<a id="post_conversas_id_notas"></a>
## POST /conversas/{id}/notas

**Tela:** Compositor de nota interna. **Ação:** Adicionar nota sem enviar ao munícipe.

Botão Nota interna tem rota distinta de resposta. Não altera protocolo nem dispara mensagem externa.

Permissões: `conversas.editar`.

| Nome | Local | Obrigatório | Tipo | Uso |
| --- | --- | --- | --- | --- |
| id | path | sim | string (uuid) | Identificador interno UUID. |
| X-CSRF-Token | header | sim | string | Obrigatório nas chamadas autenticadas não GET; cookie HttpOnly é enviado automaticamente pelo navegador. |
| Idempotency-Key | header | sim | string | Mesma identidade+rota+chave+corpo não repete efeitos. Corpo alterado usa nova chave. |

Entrada obrigatória `application/json`: [NotaCriar](#schema-NotaCriar).

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| texto | string | sim | Texto interno, nunca enviado ao munícipe. · minLength=1 |

```json
{
  "texto": "Aguardar retorno do órgão."
}
```

**Resposta 201:** Dados prontos para a tela, no alcance autorizado.

`application/json` · [NotaConversa](#schema-NotaConversa)

```json
{
  "id": "11111111-1111-4111-8111-111111111111",
  "versao": 1,
  "etag": "\"edicao-1\"",
  "texto": "Aguardar retorno do órgão.",
  "autor": {
    "id": "11111111-1111-4111-8111-111111111111",
    "rotulo": "Ana Exemplo",
    "ativo": true
  },
  "registradaEm": "2026-11-16T17:00:00Z",
  "removida": false
}
```

| Header retornado | Uso |
| --- | --- |
| Cache-Control | Sem cache público de dados pessoais/QR. |
| X-Request-Id | Correlação e cache. |
| ETag | Usar este ETag na edição do agregado indicado. |
| X-Activity-Id | Atividade do comando agregado, com seus detalhes por campo/vínculo. |

Erros: `400`, `401`, `403`, `404`, `409`, `422`, `429`, `500`, `503`. Ver [envelope e comportamento](README.md#erros).

<a id="patch_conversas_id_notas_notaId"></a>
## PATCH /conversas/{id}/notas/{notaId}

**Tela:** Nota interna do diálogo. **Ação:** Editar ou remover logicamente nota.

If-Match da nota, já entregue no histórico. Texto ou removida=true; manter autor e versões. Não há DELETE físico de evidência.

Permissões: `conversas.editar`.

| Nome | Local | Obrigatório | Tipo | Uso |
| --- | --- | --- | --- | --- |
| id | path | sim | string (uuid) | Identificador interno UUID. |
| notaId | path | sim | string (uuid) | Identificador interno UUID. |
| X-CSRF-Token | header | sim | string | Obrigatório nas chamadas autenticadas não GET; cookie HttpOnly é enviado automaticamente pelo navegador. |
| Idempotency-Key | header | sim | string | Mesma identidade+rota+chave+corpo não repete efeitos. Corpo alterado usa nova chave. |
| If-Match | header | sim | string | Versão do agregado/item especificado. 428 ausente, 412 desatualizado; não aceitar *. |

Entrada obrigatória `application/json`: [NotaSalvar](#schema-NotaSalvar).

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| texto | string | não | Texto interno. · minLength=1 |
| removida | boolean | não | true remove logicamente; preservar auditoria. |
| motivo | string | não | Motivo de remoção/correção quando aplicável. |

```json
{
  "texto": "Aguardar retorno do órgão."
}
```

**Resposta 200:** Dados prontos para a tela, no alcance autorizado.

`application/json` · [NotaConversa](#schema-NotaConversa)

```json
{
  "id": "11111111-1111-4111-8111-111111111111",
  "versao": 1,
  "etag": "\"edicao-1\"",
  "texto": "Aguardar retorno do órgão.",
  "autor": {
    "id": "11111111-1111-4111-8111-111111111111",
    "rotulo": "Ana Exemplo",
    "ativo": true
  },
  "registradaEm": "2026-11-16T17:00:00Z",
  "removida": false
}
```

| Header retornado | Uso |
| --- | --- |
| Cache-Control | Sem cache público de dados pessoais/QR. |
| X-Request-Id | Correlação e cache. |
| ETag | Usar este ETag na edição do agregado indicado. |
| X-Activity-Id | Atividade do comando agregado, com seus detalhes por campo/vínculo. |

Erros: `400`, `401`, `403`, `404`, `409`, `412`, `422`, `428`, `429`, `500`, `503`. Ver [envelope e comportamento](README.md#erros).

<a id="post_conversas_id_leitura"></a>
## POST /conversas/{id}/leitura

**Tela:** Leitura do diálogo. **Ação:** Atualizar marcador do usuário.

Marcador monotônico por sessão/usuário; não disputa a versão global da conversa nem exige GET prévio. Só marca até mensagem efetivamente exibida, sem prometer confirmação no WhatsApp.

Permissões: `conversas.ler`.

| Nome | Local | Obrigatório | Tipo | Uso |
| --- | --- | --- | --- | --- |
| id | path | sim | string (uuid) | Identificador interno UUID. |
| X-CSRF-Token | header | sim | string | Obrigatório nas chamadas autenticadas não GET; cookie HttpOnly é enviado automaticamente pelo navegador. |
| Idempotency-Key | header | sim | string | Mesma identidade+rota+chave+corpo não repete efeitos. Corpo alterado usa nova chave. |

Entrada obrigatória `application/json`: [LeituraConversa](#schema-LeituraConversa).

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| ateMensagemId | string (uuid) | sim | Última mensagem efetivamente exibida; marcador monotônico por usuário. |

```json
{
  "ateMensagemId": "11111111-1111-4111-8111-111111111111"
}
```

**Resposta 204:** Operação concluída, sem corpo.

| Header retornado | Uso |
| --- | --- |
| Cache-Control | Sem cache público de dados pessoais/QR. |
| X-Request-Id | Correlação e cache. |
| X-Activity-Id | Atividade do comando agregado, com seus detalhes por campo/vínculo. |

Erros: `400`, `401`, `403`, `404`, `409`, `422`, `429`, `500`, `503`. Ver [envelope e comportamento](README.md#erros).

<a id="post_conversas_id_reanalisar"></a>
## POST /conversas/{id}/reanalisar

**Tela:** Triagem indisponível ou corrigida. **Ação:** Pedir nova análise contextual.

A triagem normal nasce no backend ao receber mensagens. Este botão só é usado para reanálise/recuperação explícita, sem o frontend ter de disparar IA para cada mensagem.

Permissões: `conversas.reanalisar`.

| Nome | Local | Obrigatório | Tipo | Uso |
| --- | --- | --- | --- | --- |
| id | path | sim | string (uuid) | Identificador interno UUID. |
| X-CSRF-Token | header | sim | string | Obrigatório nas chamadas autenticadas não GET; cookie HttpOnly é enviado automaticamente pelo navegador. |
| Idempotency-Key | header | sim | string | Mesma identidade+rota+chave+corpo não repete efeitos. Corpo alterado usa nova chave. |

Entrada obrigatória `application/json`: [Motivo](#schema-Motivo).

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| motivo | string | sim | Justificativa auditada. · minLength=3; maxLength=2000 |

```json
{
  "motivo": "Ação conferida pela equipe."
}
```

**Resposta 202:** Aceito para processamento; ainda não representa efeito externo concluído.

`application/json` · [Operacao](#schema-Operacao)

```json
{
  "id": "11111111-1111-4111-8111-111111111111",
  "tipo": "reanalisar_conversa",
  "estado": "pendente",
  "progresso": 0,
  "podeCancelar": true,
  "resultado": null
}
```

| Header retornado | Uso |
| --- | --- |
| Cache-Control | Sem cache público de dados pessoais/QR. |
| X-Request-Id | Correlação e cache. |
| Location | URI de GET /operacoes/{id} para fallback de acompanhamento. |
| X-Activity-Id | Atividade do comando agregado, com seus detalhes por campo/vínculo. |

Erros: `400`, `401`, `403`, `404`, `409`, `422`, `429`, `500`, `503`. Ver [envelope e comportamento](README.md#erros).

<a id="get_eventos"></a>
## GET /eventos

**Tela:** Aplicação aberta. **Ação:** Receber alterações SSE das telas autorizadas.

EventSource same-origin com cookie de sessão. Eventos tipados trazem a linha/estado atualizado, evitando um GET por mensagem/notificação. Revogação encerra acesso; Last-Event-ID retoma. Evento ressincronizar indica recarregar a tela por seu endpoint normal. QR nunca aparece no stream.

Permissões: sessão e acesso atual ao recurso.

| Nome | Local | Obrigatório | Tipo | Uso |
| --- | --- | --- | --- | --- |
| Last-Event-ID | header | não | string | Retomada dentro da retenção. |

**Resposta 200:** Dados prontos para a tela, no alcance autorizado.

`text/event-stream` · `string`

```text
id: evento-tela-1
event: ressincronizar
data: {"id":"evento-tela-1","tipo":"ressincronizar","ocorridoEm":"2026-11-16T17:00:00Z"}


```

| Header retornado | Uso |
| --- | --- |
| Cache-Control | Sem cache público de dados pessoais/QR. |
| X-Request-Id | Correlação e cache. |

Erros: `400`, `401`, `403`, `422`, `429`, `500`, `503`. Ver [envelope e comportamento](README.md#erros).

<a id="get_whatsapp"></a>
## GET /whatsapp

**Tela:** Gerenciar conexão do WhatsApp. **Ação:** Abrir painel com estado, QR e histórico recente.

Uma resposta traz contas, estado recente, tentativa ativa, instruções/QR para quem tem permissão e incidentes recentes. Reabrir/atualizar consulta estado, não reinicia sessão. Sem GET de conta, incidente, tentativa e QR separados para montar a tela.

Permissões: `whatsapp.ler`.

**Resposta 200:** Dados prontos para a tela, no alcance autorizado.

`application/json` · [PainelWhatsapp](#schema-PainelWhatsapp)

```json
{
  "conexoes": [
    {
      "id": "11111111-1111-4111-8111-111111111111",
      "etag": "\"whatsapp-1\"",
      "nome": "Atendimento principal",
      "numero": "+5511999990000",
      "estado": "conectado",
      "ultimaVerificacaoEm": "2026-11-16T17:00:00Z",
      "motivo": "Sessão desconectada.",
      "operacaoAtivaId": "11111111-1111-4111-8111-111111111111",
      "acoesPermitidas": [
        "reconectar"
      ]
    }
  ],
  "autenticacoes": [
    {
      "conexaoId": "11111111-1111-4111-8111-111111111111",
      "metodo": "qr",
      "conteudo": "QR-OU-CODIGO-EXEMPLO-NAO-VALIDO",
      "expiraEm": "2026-11-16T17:00:00Z",
      "instrucoes": "Abra os aparelhos conectados no WhatsApp."
    }
  ],
  "incidentesRecentes": [
    {
      "id": "11111111-1111-4111-8111-111111111111",
      "conexao": {
        "id": "11111111-1111-4111-8111-111111111111",
        "rotulo": "Ana Exemplo",
        "ativo": true
      },
      "inicioEm": "2026-11-16T17:00:00Z",
      "recuperadoEm": "2026-11-16T17:00:00Z"
    }
  ],
  "podeAtivarNotificacoes": true
}
```

| Header retornado | Uso |
| --- | --- |
| Cache-Control | Sem cache público de dados pessoais/QR. |
| X-Request-Id | Correlação e cache. |

Erros: `400`, `401`, `403`, `422`, `429`, `500`, `503`. Ver [envelope e comportamento](README.md#erros).

<a id="post_whatsapp_id_reconectar"></a>
## POST /whatsapp/{id}/reconectar

**Tela:** Gerenciar conexão do WhatsApp. **Ação:** Reconectar ou renovar autenticação.

Botão decide a intenção; backend verifica estado, recupera sessão ou renova QR expirado conforme o conector. Uma tentativa por canal, sem reset destrutivo e sem exigir verificar+reconectar+renovar pelo frontend. ETag já veio no painel; SSE informa atualização e, se precisar exibir QR novo, atualiza o próprio painel.

Permissões: `whatsapp.reconectar`.

| Nome | Local | Obrigatório | Tipo | Uso |
| --- | --- | --- | --- | --- |
| id | path | sim | string (uuid) | Identificador interno UUID. |
| X-CSRF-Token | header | sim | string | Obrigatório nas chamadas autenticadas não GET; cookie HttpOnly é enviado automaticamente pelo navegador. |
| Idempotency-Key | header | sim | string | Mesma identidade+rota+chave+corpo não repete efeitos. Corpo alterado usa nova chave. |
| If-Match | header | sim | string | Versão do agregado/item especificado. 428 ausente, 412 desatualizado; não aceitar *. |

Entrada obrigatória `application/json`: [Motivo](#schema-Motivo).

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| motivo | string | sim | Justificativa auditada. · minLength=3; maxLength=2000 |

```json
{
  "motivo": "Ação conferida pela equipe."
}
```

**Resposta 202:** Aceito para processamento; ainda não representa efeito externo concluído.

`application/json` · [Operacao](#schema-Operacao)

```json
{
  "id": "11111111-1111-4111-8111-111111111111",
  "tipo": "reconectar_whatsapp",
  "estado": "pendente",
  "progresso": 0,
  "podeCancelar": true,
  "resultado": null
}
```

| Header retornado | Uso |
| --- | --- |
| Cache-Control | Sem cache público de dados pessoais/QR. |
| X-Request-Id | Correlação e cache. |
| Location | URI de GET /operacoes/{id} para fallback de acompanhamento. |
| X-Activity-Id | Atividade do comando agregado, com seus detalhes por campo/vínculo. |

Erros: `400`, `401`, `403`, `404`, `409`, `412`, `422`, `428`, `429`, `500`, `503`. Ver [envelope e comportamento](README.md#erros).

<a id="get_notificacoes"></a>
## GET /notificacoes

**Tela:** Central de avisos. **Ação:** Carregar notificações com conteúdo e destino.

Lista pronta para exibir; avisos internos persistem mesmo quando o Chrome não mostrou o push. Clique abre tela e revalida acesso, sem executar reconexão automaticamente.

Permissões: sessão e acesso atual ao recurso.

| Nome | Local | Obrigatório | Tipo | Uso |
| --- | --- | --- | --- | --- |
| limite | query | não | integer | Limite, máximo 100. |
| cursor | query | não | string | Retomar a página sem refazer consultas por item. |
| incluirTotal | query | não | boolean | Default false. |

**Resposta 200:** Dados prontos para a tela, no alcance autorizado.

`application/json` · [NotificacoesTela](#schema-NotificacoesTela)

```json
{
  "dados": [
    {
      "id": "11111111-1111-4111-8111-111111111111",
      "versao": 1,
      "etag": "\"edicao-1\"",
      "titulo": "WhatsApp desconectado",
      "mensagem": "Abra a tela de conexão para reconectar.",
      "destino": "/configuracoes/whatsapp",
      "lida": false,
      "criadaEm": "2026-11-16T17:00:00Z"
    }
  ],
  "paginacao": {
    "proximoCursor": null,
    "total": 1,
    "limite": 25
  },
  "naoLidas": 1
}
```

| Header retornado | Uso |
| --- | --- |
| Cache-Control | Sem cache público de dados pessoais/QR. |
| X-Request-Id | Correlação e cache. |

Erros: `400`, `401`, `403`, `422`, `429`, `500`, `503`. Ver [envelope e comportamento](README.md#erros).

<a id="patch_notificacoes_id"></a>
## PATCH /notificacoes/{id}

**Tela:** Central de avisos. **Ação:** Marcar aviso próprio como lido.

If-Match da linha já retornada; não exige abrir detalhe antes. Leitura interna não comprova exibição do push.

Permissões: sessão e acesso atual ao recurso.

| Nome | Local | Obrigatório | Tipo | Uso |
| --- | --- | --- | --- | --- |
| id | path | sim | string (uuid) | Identificador interno UUID. |
| X-CSRF-Token | header | sim | string | Obrigatório nas chamadas autenticadas não GET; cookie HttpOnly é enviado automaticamente pelo navegador. |
| Idempotency-Key | header | sim | string | Mesma identidade+rota+chave+corpo não repete efeitos. Corpo alterado usa nova chave. |
| If-Match | header | sim | string | Versão do agregado/item especificado. 428 ausente, 412 desatualizado; não aceitar *. |

Entrada obrigatória `application/json`: [NotificacaoAlterar](#schema-NotificacaoAlterar).

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| lida | boolean | sim | Estado de leitura do aviso próprio. |

```json
{
  "lida": true
}
```

**Resposta 200:** Dados prontos para a tela, no alcance autorizado.

`application/json` · [Notificacao](#schema-Notificacao)

```json
{
  "id": "11111111-1111-4111-8111-111111111111",
  "versao": 1,
  "etag": "\"edicao-1\"",
  "titulo": "WhatsApp desconectado",
  "mensagem": "Abra a tela de conexão para reconectar.",
  "destino": "/configuracoes/whatsapp",
  "lida": false,
  "criadaEm": "2026-11-16T17:00:00Z"
}
```

| Header retornado | Uso |
| --- | --- |
| Cache-Control | Sem cache público de dados pessoais/QR. |
| X-Request-Id | Correlação e cache. |
| ETag | Usar este ETag na edição do agregado indicado. |
| X-Activity-Id | Atividade do comando agregado, com seus detalhes por campo/vínculo. |

Erros: `400`, `401`, `403`, `404`, `409`, `412`, `422`, `428`, `429`, `500`, `503`. Ver [envelope e comportamento](README.md#erros).

<a id="post_notificacoes_inscricoes"></a>
## POST /notificacoes/inscricoes

**Tela:** Ativar notificações do Chrome. **Ação:** Vincular ou atualizar inscrição deste navegador.

A permissão é pedida no navegador. Esta chamada vincula/upserta endpoint e dispositivo ao usuário autenticado, com canais autorizados. Não retorna chaves secretas; logout/revogação impedem novos envios ao usuário anterior.

Permissões: sessão e acesso atual ao recurso.

| Nome | Local | Obrigatório | Tipo | Uso |
| --- | --- | --- | --- | --- |
| X-CSRF-Token | header | sim | string | Obrigatório nas chamadas autenticadas não GET; cookie HttpOnly é enviado automaticamente pelo navegador. |
| Idempotency-Key | header | sim | string | Mesma identidade+rota+chave+corpo não repete efeitos. Corpo alterado usa nova chave. |

Entrada obrigatória `application/json`: [InscreverPush](#schema-InscreverPush).

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| dispositivoChave | string (uuid) | sim | Identificador local do navegador; não concede identidade. |
| nomeDispositivo | string | sim | Nome amigável. |
| endpoint | string (uri) | sim | URL da inscrição Web Push validada contra abuso/SSRF. |
| p256dh | string | sim | Chave pública. |
| auth | string | sim | Segredo da inscrição; nunca auditar em claro. · somente entrada; segredo não auditável em claro |
| conexaoIds | array<string (uuid)> | sim | Lista de valores. · minItems=0; maxItems=100 |

```json
{
  "dispositivoChave": "11111111-1111-4111-8111-111111111111",
  "nomeDispositivo": "Chrome da recepção",
  "endpoint": "https://push.example.invalid/sub/exemplo",
  "p256dh": "chave-publica-exemplo",
  "auth": "auth-exemplo",
  "conexaoIds": [
    "11111111-1111-4111-8111-111111111111"
  ]
}
```

**Resposta 201:** Dados prontos para a tela, no alcance autorizado.

`application/json` · [InscricaoPush](#schema-InscricaoPush)

```json
{
  "id": "11111111-1111-4111-8111-111111111111",
  "ativa": true
}
```

| Header retornado | Uso |
| --- | --- |
| Cache-Control | Sem cache público de dados pessoais/QR. |
| X-Request-Id | Correlação e cache. |
| X-Activity-Id | Atividade do comando agregado, com seus detalhes por campo/vínculo. |

Erros: `400`, `401`, `403`, `409`, `422`, `429`, `500`, `503`. Ver [envelope e comportamento](README.md#erros).

<a id="delete_notificacoes_inscricoes_id"></a>
## DELETE /notificacoes/inscricoes/{id}

**Tela:** Desativar notificações deste navegador. **Ação:** Desvincular inscrição própria.

ID veio no registro local; não precisa listar dispositivos ou buscar ETag para cancelar seu vínculo. Não promete recolher alerta já em trânsito.

Permissões: sessão e acesso atual ao recurso.

| Nome | Local | Obrigatório | Tipo | Uso |
| --- | --- | --- | --- | --- |
| id | path | sim | string (uuid) | Identificador interno UUID. |
| X-CSRF-Token | header | sim | string | Obrigatório nas chamadas autenticadas não GET; cookie HttpOnly é enviado automaticamente pelo navegador. |
| Idempotency-Key | header | sim | string | Mesma identidade+rota+chave+corpo não repete efeitos. Corpo alterado usa nova chave. |
| X-Motivo | header | sim | string | Motivo auditado; DELETE não recebe corpo. |

**Resposta 204:** Operação concluída, sem corpo.

| Header retornado | Uso |
| --- | --- |
| Cache-Control | Sem cache público de dados pessoais/QR. |
| X-Request-Id | Correlação e cache. |
| X-Activity-Id | Atividade do comando agregado, com seus detalhes por campo/vínculo. |

Erros: `400`, `401`, `403`, `404`, `409`, `422`, `429`, `500`, `503`. Ver [envelope e comportamento](README.md#erros).

<a id="post_notificacoes_teste"></a>
## POST /notificacoes/teste

**Tela:** Testar notificações do Chrome. **Ação:** Enviar aviso de teste ao próprio dispositivo.

202 confirma enfileiramento, não exibição. Sem dados de munícipes ou QR; navegador offline/encerrado ou permissão negada pode impedir exibição.

Permissões: sessão e acesso atual ao recurso.

| Nome | Local | Obrigatório | Tipo | Uso |
| --- | --- | --- | --- | --- |
| X-CSRF-Token | header | sim | string | Obrigatório nas chamadas autenticadas não GET; cookie HttpOnly é enviado automaticamente pelo navegador. |
| Idempotency-Key | header | sim | string | Mesma identidade+rota+chave+corpo não repete efeitos. Corpo alterado usa nova chave. |

Entrada obrigatória `application/json`: [TesteNotificacao](#schema-TesteNotificacao).

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| inscricaoId | string (uuid) | sim | Inscrição do usuário/dispositivo atual. |

```json
{
  "inscricaoId": "11111111-1111-4111-8111-111111111111"
}
```

**Resposta 202:** Aceito para processamento; ainda não representa efeito externo concluído.

`application/json` · [AvisoAceito](#schema-AvisoAceito)

```json
{
  "aceito": true
}
```

| Header retornado | Uso |
| --- | --- |
| Cache-Control | Sem cache público de dados pessoais/QR. |
| X-Request-Id | Correlação e cache. |
| X-Activity-Id | Atividade do comando agregado, com seus detalhes por campo/vínculo. |

Erros: `400`, `401`, `403`, `409`, `422`, `429`, `500`, `503`. Ver [envelope e comportamento](README.md#erros).

<a id="get_formularios"></a>
## GET /formularios

**Tela:** Formulários e listas de presença. **Ação:** Listar formulários com evento, link e contadores.

Cada linha traz o necessário para identificar evento/estado/quantidades. Não exige consultar evento e formulário separadamente.

Permissões: `formularios.ler`.

| Nome | Local | Obrigatório | Tipo | Uso |
| --- | --- | --- | --- | --- |
| limite | query | não | integer | Limite, máximo 100. |
| cursor | query | não | string | Retomar a página sem refazer consultas por item. |
| incluirTotal | query | não | boolean | Default false. |
| data | query | não | FiltroData | FiltroData codificado como JSON; a rota declara o campo temporal. |

**Resposta 200:** Dados prontos para a tela, no alcance autorizado.

`application/json` · [FormularioLista](#schema-FormularioLista)

```json
{
  "dados": [
    {
      "id": "11111111-1111-4111-8111-111111111111",
      "versao": 1,
      "etag": "\"edicao-1\"",
      "formulario": {
        "titulo": "Lista de presença",
        "descricao": "Informe seus dados para conferência.",
        "evento": {
          "id": "11111111-1111-4111-8111-111111111111",
          "nome": "Encontro de atendimento",
          "descricao": "Atendimento à comunidade.",
          "inicioEm": "2026-11-16T17:00:00Z",
          "fimEm": "2026-11-16T17:00:00Z",
          "local": "Espaço comunitário",
          "versao": 1
        },
        "finalidade": "inscricao",
        "camposAtivos": [
          "nome"
        ],
        "camposObrigatorios": [
          "nome"
        ],
        "abreEm": "2026-11-16T17:00:00Z",
        "fechaEm": "2026-11-16T17:00:00Z",
        "situacao": "rascunho"
      },
      "linkPublico": "https://crm.example.invalid/f/identificador-publico-opaco",
      "quantidadeEnvios": 1,
      "quantidadeParticipantes": 1,
      "permissoes": {
        "acoes": [
          "salvar"
        ],
        "camposEditaveis": [
          "contatos"
        ]
      }
    }
  ],
  "paginacao": {
    "proximoCursor": null,
    "total": 1,
    "limite": 25
  }
}
```

| Header retornado | Uso |
| --- | --- |
| Cache-Control | Sem cache público de dados pessoais/QR. |
| X-Request-Id | Correlação e cache. |

Erros: `400`, `401`, `403`, `422`, `429`, `500`, `503`. Ver [envelope e comportamento](README.md#erros).

<a id="post_formularios"></a>
## POST /formularios

**Tela:** Editor de formulário e evento. **Ação:** Salvar evento e formulário, podendo abrir coleta.

Um Salvar e divulgar cria/reutiliza evento, grava configuração e abre coleta se solicitado, retornando link pronto. Não exige criar evento, formulário e depois abrir em três POSTs. Backend valida origem compartilhada e permissões/versão se existente.

Permissões: `formularios.criar`.

| Nome | Local | Obrigatório | Tipo | Uso |
| --- | --- | --- | --- | --- |
| X-CSRF-Token | header | sim | string | Obrigatório nas chamadas autenticadas não GET; cookie HttpOnly é enviado automaticamente pelo navegador. |
| Idempotency-Key | header | sim | string | Mesma identidade+rota+chave+corpo não repete efeitos. Corpo alterado usa nova chave. |

Entrada obrigatória `application/json`: [FormularioDados](#schema-FormularioDados).

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| titulo | string | sim | Título público. · minLength=1 |
| descricao | string | sim | Finalidade da coleta. |
| evento | EventoFormulario | sim | EventoFormulario |
| finalidade | enum: inscricao, presenca | sim | Inscrição não comprova presença. |
| camposAtivos | array<enum: nome, sexoCodigo, nascimento, contatos, endereco, documentos> | sim | Lista de valores. · minItems=1; maxItems=100 |
| camposObrigatorios | array<enum: nome, sexoCodigo, nascimento, contatos, endereco> | sim | Lista de valores. · minItems=1; maxItems=100 |
| abreEm | string (date-time) \| null | não | Instante em UTC; apresentação no fuso da interface. |
| fechaEm | string (date-time) \| null | não | Instante em UTC; apresentação no fuso da interface. |
| situacao | enum: rascunho, aberto, encerrado, revogado | sim | Salvar e divulgar pode abrir na mesma transação. |

```json
{
  "titulo": "Lista de presença",
  "descricao": "Informe seus dados para conferência.",
  "evento": {
    "id": "11111111-1111-4111-8111-111111111111",
    "nome": "Encontro de atendimento",
    "descricao": "Atendimento à comunidade.",
    "inicioEm": "2026-11-16T17:00:00Z",
    "fimEm": "2026-11-16T17:00:00Z",
    "local": "Espaço comunitário",
    "versao": 1
  },
  "finalidade": "inscricao",
  "camposAtivos": [
    "nome"
  ],
  "camposObrigatorios": [
    "nome"
  ],
  "abreEm": "2026-11-16T17:00:00Z",
  "fechaEm": "2026-11-16T17:00:00Z",
  "situacao": "rascunho"
}
```

**Resposta 201:** Dados prontos para a tela, no alcance autorizado.

`application/json` · [FormularioEditor](#schema-FormularioEditor)

```json
{
  "id": "11111111-1111-4111-8111-111111111111",
  "versao": 1,
  "etag": "\"edicao-1\"",
  "formulario": {
    "titulo": "Lista de presença",
    "descricao": "Informe seus dados para conferência.",
    "evento": {
      "id": "11111111-1111-4111-8111-111111111111",
      "nome": "Encontro de atendimento",
      "descricao": "Atendimento à comunidade.",
      "inicioEm": "2026-11-16T17:00:00Z",
      "fimEm": "2026-11-16T17:00:00Z",
      "local": "Espaço comunitário",
      "versao": 1
    },
    "finalidade": "inscricao",
    "camposAtivos": [
      "nome"
    ],
    "camposObrigatorios": [
      "nome"
    ],
    "abreEm": "2026-11-16T17:00:00Z",
    "fechaEm": "2026-11-16T17:00:00Z",
    "situacao": "rascunho"
  },
  "linkPublico": "https://crm.example.invalid/f/identificador-publico-opaco",
  "quantidadeEnvios": 1,
  "quantidadeParticipantes": 1,
  "permissoes": {
    "acoes": [
      "salvar"
    ],
    "camposEditaveis": [
      "contatos"
    ]
  }
}
```

| Header retornado | Uso |
| --- | --- |
| Cache-Control | Sem cache público de dados pessoais/QR. |
| X-Request-Id | Correlação e cache. |
| ETag | Usar este ETag na edição do agregado indicado. |
| X-Activity-Id | Atividade do comando agregado, com seus detalhes por campo/vínculo. |

Erros: `400`, `401`, `403`, `409`, `422`, `429`, `500`, `503`. Ver [envelope e comportamento](README.md#erros).

O backend resolve nesta ação: resolver evento e validar versão compartilhada; validar campos/janela; salvar configuração e estado; gerar link opaco; retornar editor completo.

<a id="get_formularios_editor"></a>
## GET /formularios/editor

**Tela:** Editor de formulário e evento. **Ação:** Abrir editor novo ou existente com contexto completo.

Sem id retorna novo editor; com id retorna evento, campos, janela, estado, link e permissões. Selecionar evento existente pode informar eventoId para prefill; versão da origem vem no formulário, sem GET de evento separado.

Permissões: `formularios.ler`.

| Nome | Local | Obrigatório | Tipo | Uso |
| --- | --- | --- | --- | --- |
| id | query | não | string (uuid) | Formulário para editar; omitir para novo. |
| eventoId | query | não | string (uuid) | Origem existente escolhida por autocomplete. |

**Resposta 200:** Dados prontos para a tela, no alcance autorizado.

`application/json` · [EditorFormularioTela](#schema-EditorFormularioTela)

```json
{
  "valoresIniciais": {
    "camposAtivos": [
      "nome"
    ],
    "camposObrigatorios": [
      "nome"
    ],
    "situacao": "rascunho"
  },
  "eventosIniciais": [
    {
      "id": "11111111-1111-4111-8111-111111111111",
      "rotulo": "Ana Exemplo",
      "ativo": true
    }
  ],
  "permissoes": {
    "acoes": [
      "salvar"
    ],
    "camposEditaveis": [
      "contatos"
    ]
  }
}
```

| Header retornado | Uso |
| --- | --- |
| Cache-Control | Sem cache público de dados pessoais/QR. |
| X-Request-Id | Correlação e cache. |
| ETag | Usar este ETag na edição do agregado indicado. |

Erros: `400`, `401`, `403`, `422`, `429`, `500`, `503`. Ver [envelope e comportamento](README.md#erros).

<a id="patch_formularios_id"></a>
## PATCH /formularios/{id}

**Tela:** Editor de formulário e evento. **Ação:** Salvar edição, encerrar, revogar ou trocar link.

If-Match do editor. Estado e gerarNovoLink representam botões finitos da tela; validar motivo e impedir reutilização silenciosa de link revogado. Mudanças da origem compartilhada revalidam sua versão. Documento continua opcional.

Permissões: `formularios.editar`.

| Nome | Local | Obrigatório | Tipo | Uso |
| --- | --- | --- | --- | --- |
| id | path | sim | string (uuid) | Identificador interno UUID. |
| X-CSRF-Token | header | sim | string | Obrigatório nas chamadas autenticadas não GET; cookie HttpOnly é enviado automaticamente pelo navegador. |
| Idempotency-Key | header | sim | string | Mesma identidade+rota+chave+corpo não repete efeitos. Corpo alterado usa nova chave. |
| If-Match | header | sim | string | Versão do agregado/item especificado. 428 ausente, 412 desatualizado; não aceitar *. |

Entrada obrigatória `application/json`: [FormularioAlterar](#schema-FormularioAlterar).

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| titulo | string | não | Título público. · minLength=1 |
| descricao | string | não | Finalidade da coleta. |
| evento | EventoFormulario | não | EventoFormulario |
| finalidade | enum: inscricao, presenca | não | Inscrição não comprova presença. |
| camposAtivos | array<enum: nome, sexoCodigo, nascimento, contatos, endereco, documentos> | não | Lista de valores. · minItems=1; maxItems=100 |
| camposObrigatorios | array<enum: nome, sexoCodigo, nascimento, contatos, endereco> | não | Lista de valores. · minItems=1; maxItems=100 |
| abreEm | string (date-time) \| null | não | Instante em UTC; apresentação no fuso da interface. |
| fechaEm | string (date-time) \| null | não | Instante em UTC; apresentação no fuso da interface. |
| situacao | enum: rascunho, aberto, encerrado, revogado | não | Salvar e divulgar pode abrir na mesma transação. |
| gerarNovoLink | boolean | não | Ação explícita invalida link anterior; não reabrir link revogado silenciosamente. |
| motivoAlteracao | string | não | Motivo de revogação/rotação/correção. |

```json
{
  "titulo": "Lista de presença",
  "descricao": "Informe seus dados para conferência.",
  "evento": {
    "id": "11111111-1111-4111-8111-111111111111",
    "nome": "Encontro de atendimento",
    "descricao": "Atendimento à comunidade.",
    "inicioEm": "2026-11-16T17:00:00Z",
    "fimEm": "2026-11-16T17:00:00Z",
    "local": "Espaço comunitário",
    "versao": 1
  },
  "finalidade": "inscricao",
  "camposAtivos": [
    "nome"
  ],
  "camposObrigatorios": [
    "nome"
  ],
  "abreEm": "2026-11-16T17:00:00Z",
  "fechaEm": "2026-11-16T17:00:00Z",
  "situacao": "rascunho",
  "gerarNovoLink": false,
  "motivoAlteracao": "Encerramento da coleta."
}
```

**Resposta 200:** Dados prontos para a tela, no alcance autorizado.

`application/json` · [FormularioEditor](#schema-FormularioEditor)

```json
{
  "id": "11111111-1111-4111-8111-111111111111",
  "versao": 1,
  "etag": "\"edicao-1\"",
  "formulario": {
    "titulo": "Lista de presença",
    "descricao": "Informe seus dados para conferência.",
    "evento": {
      "id": "11111111-1111-4111-8111-111111111111",
      "nome": "Encontro de atendimento",
      "descricao": "Atendimento à comunidade.",
      "inicioEm": "2026-11-16T17:00:00Z",
      "fimEm": "2026-11-16T17:00:00Z",
      "local": "Espaço comunitário",
      "versao": 1
    },
    "finalidade": "inscricao",
    "camposAtivos": [
      "nome"
    ],
    "camposObrigatorios": [
      "nome"
    ],
    "abreEm": "2026-11-16T17:00:00Z",
    "fechaEm": "2026-11-16T17:00:00Z",
    "situacao": "rascunho"
  },
  "linkPublico": "https://crm.example.invalid/f/identificador-publico-opaco",
  "quantidadeEnvios": 1,
  "quantidadeParticipantes": 1,
  "permissoes": {
    "acoes": [
      "salvar"
    ],
    "camposEditaveis": [
      "contatos"
    ]
  }
}
```

| Header retornado | Uso |
| --- | --- |
| Cache-Control | Sem cache público de dados pessoais/QR. |
| X-Request-Id | Correlação e cache. |
| ETag | Usar este ETag na edição do agregado indicado. |
| X-Activity-Id | Atividade do comando agregado, com seus detalhes por campo/vínculo. |

Erros: `400`, `401`, `403`, `404`, `409`, `412`, `422`, `428`, `429`, `500`, `503`. Ver [envelope e comportamento](README.md#erros).

<a id="get_publico_formularios_token"></a>
## GET /publico/formularios/{token}

**Tela:** Autocadastro pelo link. **Ação:** Abrir formulário público com todos os campos/opções.

Somente configuração pública aberta/vigente. Sem sessão da equipe, pesquisa, preenchimento da base, IDs de pessoas ou lista de participantes; cookie de equipe presente não amplia este contrato.

Permissões: público.

| Nome | Local | Obrigatório | Tipo | Uso |
| --- | --- | --- | --- | --- |
| token | path | sim | string | Token público opaco. |

**Resposta 200:** Dados prontos para a tela, no alcance autorizado.

`application/json` · [FormularioPublico](#schema-FormularioPublico)

```json
{
  "titulo": "Lista de presença",
  "descricao": "Informe seus dados para conferência.",
  "versaoFormulario": 1,
  "finalidade": "inscricao",
  "camposAtivos": [
    "nome"
  ],
  "camposObrigatorios": [
    "nome"
  ],
  "opcoesSexo": [
    {
      "codigo": "nao_informado",
      "rotulo": "Não informado"
    }
  ]
}
```

| Header retornado | Uso |
| --- | --- |
| Cache-Control | Sem cache público de dados pessoais/QR. |
| X-Request-Id | Correlação e cache. |

Erros: `400`, `404`, `410`, `422`, `429`, `500`, `503`. Ver [envelope e comportamento](README.md#erros).

<a id="post_publico_formularios_token_envios"></a>
## POST /publico/formularios/{token}/envios

**Tela:** Autocadastro pelo link. **Ação:** Enviar cadastro temporário completo.

Uma chamada recebe os dados declarados. Persistir antes de responder; mesmo recibo/202 para novo ou existente, sem verificar/expor candidatos. Não retorna ID interno ou rota de leitura do envio; versão/campos inválidos são erros de formulário, nunca aviso de já cadastrado.

Permissões: público.

| Nome | Local | Obrigatório | Tipo | Uso |
| --- | --- | --- | --- | --- |
| token | path | sim | string | Token público opaco. |
| Idempotency-Key | header | sim | string | Mesma identidade+rota+chave+corpo não repete efeitos. Corpo alterado usa nova chave. |

Entrada obrigatória `application/json`: [EnvioPublico](#schema-EnvioPublico).

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| versaoFormulario | integer | sim | Versão consultada. · minimum=1 |
| dados | PessoaDeclarada | sim | PessoaDeclarada |

```json
{
  "versaoFormulario": 1,
  "dados": {
    "nome": "Ana Exemplo"
  }
}
```

**Resposta 202:** Aceito para processamento; ainda não representa efeito externo concluído.

`application/json` · [ReciboPublico](#schema-ReciboPublico)

```json
{
  "recebido": true,
  "mensagem": "Dados recebidos para conferência."
}
```

| Header retornado | Uso |
| --- | --- |
| Cache-Control | Sem cache público de dados pessoais/QR. |
| X-Request-Id | Correlação e cache. |

Erros: `400`, `404`, `409`, `410`, `422`, `429`, `500`, `503`. Ver [envelope e comportamento](README.md#erros).

<a id="get_formularios_id_participantes"></a>
## GET /formularios/{id}/participantes

**Tela:** Participantes da ação. **Ação:** Listar inscrições e presenças prontas para conferência.

Uma pessoa por evento, com nome e estado; reenvios não multiplicam contagem. Data filtra presença/inscrição segundo situacao. Exige acesso à pessoa e evento.

Permissões: `eventos.ler`.

| Nome | Local | Obrigatório | Tipo | Uso |
| --- | --- | --- | --- | --- |
| id | path | sim | string (uuid) | Identificador interno UUID. |
| limite | query | não | integer | Limite, máximo 100. |
| cursor | query | não | string | Retomar a página sem refazer consultas por item. |
| incluirTotal | query | não | boolean | Default false. |
| data | query | não | FiltroData | FiltroData codificado como JSON; a rota declara o campo temporal. |
| situacao | query | não | enum: inscrito, presente, cancelado | Filtro explícito. |

**Resposta 200:** Dados prontos para a tela, no alcance autorizado.

`application/json` · [Participacoes](#schema-Participacoes)

```json
{
  "dados": [
    {
      "id": "11111111-1111-4111-8111-111111111111",
      "versao": 1,
      "etag": "\"edicao-1\"",
      "pessoa": {
        "id": "11111111-1111-4111-8111-111111111111",
        "nome": "Ana Exemplo",
        "bairro": "Centro",
        "contatoPrincipal": "+5511999990000",
        "foto": {
          "id": "11111111-1111-4111-8111-111111111111",
          "nome": "foto-exemplo.jpg",
          "mimeType": "image/jpeg",
          "tamanhoBytes": 1024,
          "url": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo",
          "miniaturaUrl": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo?variante=miniatura"
        },
        "arquivado": false
      },
      "evento": {
        "id": "11111111-1111-4111-8111-111111111111",
        "rotulo": "Ana Exemplo",
        "ativo": true
      },
      "situacao": "inscrito",
      "presencaEm": "2026-11-16T17:00:00Z",
      "observacao": "Presença conferida."
    }
  ],
  "paginacao": {
    "proximoCursor": null,
    "total": 1,
    "limite": 25
  }
}
```

| Header retornado | Uso |
| --- | --- |
| Cache-Control | Sem cache público de dados pessoais/QR. |
| X-Request-Id | Correlação e cache. |

Erros: `400`, `401`, `403`, `404`, `422`, `429`, `500`, `503`. Ver [envelope e comportamento](README.md#erros).

<a id="post_formularios_id_participantes"></a>
## POST /formularios/{id}/participantes

**Tela:** Incluir participação pela equipe. **Ação:** Registrar participante existente ou novo completo.

Se novo, cria pessoa completa e participação na mesma transação. Backend impede duplicação da mesma pessoa/evento, preserva origem e não abre atendimento automaticamente.

Permissões: `eventos.editar`.

| Nome | Local | Obrigatório | Tipo | Uso |
| --- | --- | --- | --- | --- |
| id | path | sim | string (uuid) | Identificador interno UUID. |
| X-CSRF-Token | header | sim | string | Obrigatório nas chamadas autenticadas não GET; cookie HttpOnly é enviado automaticamente pelo navegador. |
| Idempotency-Key | header | sim | string | Mesma identidade+rota+chave+corpo não repete efeitos. Corpo alterado usa nova chave. |

Entrada obrigatória `application/json`: [ParticipanteCriar](#schema-ParticipanteCriar).

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| solicitante | PessoaSelecionada | sim | Pessoa definitiva existente ou nova completa inline. |
| situacao | enum: inscrito, presente | sim | Estado da participação. |
| presencaEm | string (date-time) \| null | não | Instante em UTC; apresentação no fuso da interface. |
| observacao | string \| null | não | Contexto. |

```json
{
  "solicitante": {
    "tipo": "existente",
    "municipeId": "11111111-1111-4111-8111-111111111111"
  },
  "situacao": "inscrito",
  "presencaEm": "2026-11-16T17:00:00Z",
  "observacao": "Participação registrada pela equipe."
}
```

**Resposta 201:** Dados prontos para a tela, no alcance autorizado.

`application/json` · [Participacao](#schema-Participacao)

```json
{
  "id": "11111111-1111-4111-8111-111111111111",
  "versao": 1,
  "etag": "\"edicao-1\"",
  "pessoa": {
    "id": "11111111-1111-4111-8111-111111111111",
    "nome": "Ana Exemplo",
    "bairro": "Centro",
    "contatoPrincipal": "+5511999990000",
    "foto": {
      "id": "11111111-1111-4111-8111-111111111111",
      "nome": "foto-exemplo.jpg",
      "mimeType": "image/jpeg",
      "tamanhoBytes": 1024,
      "url": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo",
      "miniaturaUrl": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo?variante=miniatura"
    },
    "arquivado": false
  },
  "evento": {
    "id": "11111111-1111-4111-8111-111111111111",
    "rotulo": "Ana Exemplo",
    "ativo": true
  },
  "situacao": "inscrito",
  "presencaEm": "2026-11-16T17:00:00Z",
  "observacao": "Presença conferida."
}
```

| Header retornado | Uso |
| --- | --- |
| Cache-Control | Sem cache público de dados pessoais/QR. |
| X-Request-Id | Correlação e cache. |
| ETag | Usar este ETag na edição do agregado indicado. |
| X-Activity-Id | Atividade do comando agregado, com seus detalhes por campo/vínculo. |

Erros: `400`, `401`, `403`, `404`, `409`, `422`, `429`, `500`, `503`. Ver [envelope e comportamento](README.md#erros).

<a id="patch_formularios_id_participantes_participacaoId"></a>
## PATCH /formularios/{id}/participantes/{participacaoId}

**Tela:** Participantes da ação. **Ação:** Confirmar presença ou corrigir participação.

If-Match do item já na lista. Confirmar presença exige data/evidência; cancelamento preserva histórico. Não altera a pessoa por esta edição.

Permissões: `eventos.editar`.

| Nome | Local | Obrigatório | Tipo | Uso |
| --- | --- | --- | --- | --- |
| id | path | sim | string (uuid) | Identificador interno UUID. |
| participacaoId | path | sim | string (uuid) | Identificador interno UUID. |
| X-CSRF-Token | header | sim | string | Obrigatório nas chamadas autenticadas não GET; cookie HttpOnly é enviado automaticamente pelo navegador. |
| Idempotency-Key | header | sim | string | Mesma identidade+rota+chave+corpo não repete efeitos. Corpo alterado usa nova chave. |
| If-Match | header | sim | string | Versão do agregado/item especificado. 428 ausente, 412 desatualizado; não aceitar *. |

Entrada obrigatória `application/json`: [ParticipacaoAlterar](#schema-ParticipacaoAlterar).

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| situacao | enum: inscrito, presente, cancelado | não | Cancelar é lógico. |
| presencaEm | string (date-time) \| null | não | Instante em UTC; apresentação no fuso da interface. |
| observacao | string \| null | não | Contexto. |

```json
{
  "situacao": "inscrito",
  "presencaEm": "2026-11-16T17:00:00Z",
  "observacao": "Participação conferida."
}
```

**Resposta 200:** Dados prontos para a tela, no alcance autorizado.

`application/json` · [Participacao](#schema-Participacao)

```json
{
  "id": "11111111-1111-4111-8111-111111111111",
  "versao": 1,
  "etag": "\"edicao-1\"",
  "pessoa": {
    "id": "11111111-1111-4111-8111-111111111111",
    "nome": "Ana Exemplo",
    "bairro": "Centro",
    "contatoPrincipal": "+5511999990000",
    "foto": {
      "id": "11111111-1111-4111-8111-111111111111",
      "nome": "foto-exemplo.jpg",
      "mimeType": "image/jpeg",
      "tamanhoBytes": 1024,
      "url": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo",
      "miniaturaUrl": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo?variante=miniatura"
    },
    "arquivado": false
  },
  "evento": {
    "id": "11111111-1111-4111-8111-111111111111",
    "rotulo": "Ana Exemplo",
    "ativo": true
  },
  "situacao": "inscrito",
  "presencaEm": "2026-11-16T17:00:00Z",
  "observacao": "Presença conferida."
}
```

| Header retornado | Uso |
| --- | --- |
| Cache-Control | Sem cache público de dados pessoais/QR. |
| X-Request-Id | Correlação e cache. |
| ETag | Usar este ETag na edição do agregado indicado. |
| X-Activity-Id | Atividade do comando agregado, com seus detalhes por campo/vínculo. |

Erros: `400`, `401`, `403`, `404`, `409`, `412`, `422`, `428`, `429`, `500`, `503`. Ver [envelope e comportamento](README.md#erros).

<a id="get_cadastros_recebidos"></a>
## GET /cadastros-recebidos

**Tela:** Fila de cadastros temporários. **Ação:** Carregar fila com nome, origem e responsável.

Fila interna com dados da linha prontos. Não exposta no link público.

Permissões: `cadastros_recebidos.ler`.

| Nome | Local | Obrigatório | Tipo | Uso |
| --- | --- | --- | --- | --- |
| limite | query | não | integer | Limite, máximo 100. |
| cursor | query | não | string | Retomar a página sem refazer consultas por item. |
| incluirTotal | query | não | boolean | Default false. |
| data | query | não | FiltroData | FiltroData codificado como JSON; a rota declara o campo temporal. |
| formularioId | query | não | string (uuid) | Filtrar origem. |
| situacao | query | não | enum: pendente, em_conferencia, integrado_novo, integrado_existente, descartado | Estado da conferência. |

**Resposta 200:** Dados prontos para a tela, no alcance autorizado.

`application/json` · [FilaCadastros](#schema-FilaCadastros)

```json
{
  "dados": [
    {
      "id": "11111111-1111-4111-8111-111111111111",
      "versao": 1,
      "etag": "\"edicao-1\"",
      "nome": "Ana Exemplo",
      "origem": {
        "id": "11111111-1111-4111-8111-111111111111",
        "rotulo": "Ana Exemplo",
        "ativo": true
      },
      "recebidoEm": "2026-11-16T17:00:00Z",
      "situacao": "pendente",
      "revisor": {
        "id": "11111111-1111-4111-8111-111111111111",
        "rotulo": "Ana Exemplo",
        "ativo": true
      }
    }
  ],
  "paginacao": {
    "proximoCursor": null,
    "total": 1,
    "limite": 25
  },
  "origens": [
    {
      "id": "11111111-1111-4111-8111-111111111111",
      "rotulo": "Ana Exemplo",
      "ativo": true
    }
  ]
}
```

| Header retornado | Uso |
| --- | --- |
| Cache-Control | Sem cache público de dados pessoais/QR. |
| X-Request-Id | Correlação e cache. |

Erros: `400`, `401`, `403`, `422`, `429`, `500`, `503`. Ver [envelope e comportamento](README.md#erros).

<a id="get_cadastros_recebidos_id"></a>
## GET /cadastros-recebidos/{id}

**Tela:** Conferir envio e comparar pessoa. **Ação:** Abrir conferência pronta para decidir.

Traz declaração original, candidatos, ficha completa do candidato selecionado e contexto de cadastro novo. Trocar candidato envia compararComMunicipeId na mesma rota; não precisa buscar campos e candidatos em várias APIs.

Permissões: `cadastros_recebidos.ler`.

| Nome | Local | Obrigatório | Tipo | Uso |
| --- | --- | --- | --- | --- |
| id | path | sim | string (uuid) | Identificador interno UUID. |
| compararComMunicipeId | query | não | string (uuid) | Pessoa escolhida no autocomplete para comparar. |

**Resposta 200:** Dados prontos para a tela, no alcance autorizado.

`application/json` · [RevisaoCadastro](#schema-RevisaoCadastro)

```json
{
  "cadastro": {
    "id": "11111111-1111-4111-8111-111111111111",
    "versao": 1,
    "etag": "\"edicao-1\"",
    "nome": "Ana Exemplo",
    "origem": {
      "id": "11111111-1111-4111-8111-111111111111",
      "rotulo": "Ana Exemplo",
      "ativo": true
    },
    "recebidoEm": "2026-11-16T17:00:00Z",
    "situacao": "pendente",
    "revisor": {
      "id": "11111111-1111-4111-8111-111111111111",
      "rotulo": "Ana Exemplo",
      "ativo": true
    }
  },
  "declaracaoOriginal": {
    "nome": "Ana Exemplo",
    "sexoCodigo": "nao_informado",
    "nascimento": "1990-11-15",
    "contatos": [
      {
        "tipo": "telefone",
        "valor": "+5511999990000"
      }
    ],
    "endereco": {
      "logradouro": "Rua Exemplo",
      "numero": "100",
      "complemento": "Casa 2",
      "bairro": "Centro",
      "cidade": "São Paulo",
      "uf": "SP",
      "cep": "01001000"
    },
    "documentos": [
      {
        "tipo": "outro",
        "valor": "DOC-EXEMPLO",
        "orgaoEmissor": "Órgão Exemplo"
      }
    ]
  },
  "candidatos": [
    {
      "pessoa": {
        "id": "11111111-1111-4111-8111-111111111111",
        "rotulo": "Ana Exemplo",
        "ativo": true
      },
      "motivos": [
        "Nome semelhante e nascimento coincidente."
      ],
      "resumo": "Nascimento: 15/11/1990 · bairro Centro"
    }
  ],
  "compararCom": {
    "id": "11111111-1111-4111-8111-111111111111",
    "versao": 1,
    "etag": "\"edicao-1\"",
    "pessoa": {
      "id": "11111111-1111-4111-8111-111111111111",
      "nome": "Ana Exemplo",
      "bairro": "Centro",
      "contatoPrincipal": "+5511999990000",
      "foto": {
        "id": "11111111-1111-4111-8111-111111111111",
        "nome": "foto-exemplo.jpg",
        "mimeType": "image/jpeg",
        "tamanhoBytes": 1024,
        "url": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo",
        "miniaturaUrl": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo?variante=miniatura"
      },
      "arquivado": false
    },
    "formulario": {
      "nome": "Ana Exemplo",
      "sexoCodigo": null,
      "nascimento": "1990-11-15",
      "observacoes": "Participa do futebol. Prefere contato à tarde.",
      "contatos": [
        {
          "chave": "telefone-1",
          "id": "11111111-1111-4111-8111-111111111111",
          "tipo": "telefone",
          "valor": "+5511999990000",
          "relacao": "Telefone da família.",
          "principal": true
        }
      ],
      "enderecos": [
        {
          "chave": "endereco-1",
          "id": "11111111-1111-4111-8111-111111111111",
          "logradouro": "Rua Exemplo",
          "numero": "100",
          "complemento": null,
          "bairro": "Centro",
          "cidade": "São Paulo",
          "uf": "SP",
          "cep": "01001000",
          "principal": true
        }
      ],
      "documentos": [
        {
          "chave": "documento-1",
          "id": "11111111-1111-4111-8111-111111111111",
          "tipo": "outro",
          "valor": "DOC-EXEMPLO",
          "orgaoEmissor": null
        }
      ],
      "classificacaoIds": [
        "33333333-3333-4333-8333-333333333333"
      ],
      "indicadoPorMunicipeId": "33333333-3333-4333-8333-333333333333",
      "preferenciaContato": {
        "permitirProativo": true
      },
      "fotos": [
        {
          "chave": "foto-1",
          "id": "11111111-1111-4111-8111-111111111111",
          "legenda": "Foto de reconhecimento.",
          "principal": true
        }
      ],
      "transcricoesUtilizadas": [
        {
          "transcricaoId": "11111111-1111-4111-8111-111111111111",
          "trechoAceito": "Prefere contato à tarde."
        }
      ]
    },
    "referencias": {
      "indicador": {
        "id": "11111111-1111-4111-8111-111111111111",
        "rotulo": "Ana Exemplo",
        "ativo": true
      },
      "classificacoes": [
        {
          "id": "11111111-1111-4111-8111-111111111111",
          "rotulo": "Ana Exemplo",
          "ativo": true
        }
      ]
    },
    "fotos": [
      {
        "id": "11111111-1111-4111-8111-111111111111",
        "nome": "foto-exemplo.jpg",
        "mimeType": "image/jpeg",
        "tamanhoBytes": 1024,
        "url": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo",
        "miniaturaUrl": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo?variante=miniatura"
      }
    ],
    "contextoEdicao": {
      "sexos": [
        {
          "codigo": "nao_informado",
          "rotulo": "Não informado"
        }
      ],
      "tiposDocumento": [
        "cpf"
      ],
      "classificacoesIniciais": [
        {
          "id": "11111111-1111-4111-8111-111111111111",
          "rotulo": "Ana Exemplo",
          "ativo": true
        }
      ],
      "responsaveisIniciais": [
        {
          "id": "11111111-1111-4111-8111-111111111111",
          "rotulo": "Ana Exemplo",
          "ativo": true
        }
      ],
      "servicosIniciais": [
        {
          "id": "11111111-1111-4111-8111-111111111111",
          "rotulo": "Ana Exemplo",
          "ativo": true
        }
      ],
      "limites": {
        "maxUploadBytes": 26214400,
        "maxArquivosPorLote": 10,
        "maxAudioSegundos": 600,
        "maxObservacaoCaracteres": 100000,
        "mimeTypes": [
          "application/pdf"
        ],
        "maxItensPorColecao": 100,
        "maxDestinatariosEtiquetas": 5000
      },
      "permissoes": {
        "acoes": [
          "salvar"
        ],
        "camposEditaveis": [
          "contatos"
        ]
      }
    },
    "resumoContato": {
      "ultimaInteracaoEm": "2026-11-16T17:00:00Z",
      "diasSemContato": 75,
      "janelaDias": 90,
      "diasComInteracao": 8,
      "mensagensRecebidas": 20,
      "mensagensEnviadas": 10,
      "atendimentos": 2,
      "ultimaTentativaEm": "2026-11-16T17:00:00Z",
      "cobertura": "disponivel"
    },
    "atendimentosRecentes": [
      {
        "id": "11111111-1111-4111-8111-111111111111",
        "protocolo": "2026-000001",
        "titulo": "Pedido de iluminação",
        "situacao": "aberto",
        "pessoa": {
          "id": "11111111-1111-4111-8111-111111111111",
          "rotulo": "Ana Exemplo",
          "ativo": true
        },
        "responsavel": {
          "id": "11111111-1111-4111-8111-111111111111",
          "rotulo": "Ana Exemplo",
          "ativo": true
        },
        "abertoEm": "2026-11-16T17:00:00Z",
        "prazo": "2026-11-16T17:00:00Z",
        "acoesPermitidas": [
          "abrir"
        ],
        "identidadePendente": false
      }
    ],
    "atividadesRecentes": [
      {
        "id": "11111111-1111-4111-8111-111111111111",
        "acao": "municipe.atualizado",
        "alvoTipo": "municipe",
        "alvoId": "11111111-1111-4111-8111-111111111111",
        "autor": {
          "tipo": "usuario",
          "usuarioId": "11111111-1111-4111-8111-111111111111",
          "nome": "Operador Exemplo"
        },
        "ocorridoEm": "2026-11-16T17:00:00Z",
        "resumo": "Ficha atualizada.",
        "podeReverter": true
      }
    ],
    "marcacaoVotoAtualizadaEm": "2026-11-16T17:00:00Z",
    "marcacaoVotoAtualizadaPor": {
      "id": "11111111-1111-4111-8111-111111111111",
      "rotulo": "Ana Exemplo",
      "ativo": true
    },
    "conversaAtualizada": {
      "id": "11111111-1111-4111-8111-111111111111",
      "etag": "\"conversa-1\"",
      "pessoa": {
        "id": "11111111-1111-4111-8111-111111111111",
        "nome": "Ana Exemplo",
        "bairro": "Centro",
        "contatoPrincipal": "+5511999990000",
        "foto": {
          "id": "11111111-1111-4111-8111-111111111111",
          "nome": "foto-exemplo.jpg",
          "mimeType": "image/jpeg",
          "tamanhoBytes": 1024,
          "url": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo",
          "miniaturaUrl": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo?variante=miniatura"
        },
        "arquivado": false
      },
      "contatoCanal": "+5511999990000",
      "estado": "aguardando",
      "responsavel": {
        "id": "11111111-1111-4111-8111-111111111111",
        "rotulo": "Ana Exemplo",
        "ativo": true
      },
      "equipe": {
        "id": "11111111-1111-4111-8111-111111111111",
        "rotulo": "Ana Exemplo",
        "ativo": true
      },
      "naoLidas": 1,
      "ultimaMensagem": "Gostaria de saber o andamento.",
      "ultimaMensagemEm": "2026-11-16T17:00:00Z"
    }
  },
  "contextoCadastroNovo": {
    "valoresIniciais": {
      "contatos": [],
      "enderecos": [],
      "documentos": [],
      "classificacaoIds": [],
      "fotos": [],
      "preferenciaContato": {
        "permitirProativo": true
      }
    },
    "contexto": {
      "sexos": [
        {
          "codigo": "nao_informado",
          "rotulo": "Não informado"
        }
      ],
      "tiposDocumento": [
        "cpf"
      ],
      "classificacoesIniciais": [
        {
          "id": "11111111-1111-4111-8111-111111111111",
          "rotulo": "Ana Exemplo",
          "ativo": true
        }
      ],
      "responsaveisIniciais": [
        {
          "id": "11111111-1111-4111-8111-111111111111",
          "rotulo": "Ana Exemplo",
          "ativo": true
        }
      ],
      "servicosIniciais": [
        {
          "id": "11111111-1111-4111-8111-111111111111",
          "rotulo": "Ana Exemplo",
          "ativo": true
        }
      ],
      "limites": {
        "maxUploadBytes": 26214400,
        "maxArquivosPorLote": 10,
        "maxAudioSegundos": 600,
        "maxObservacaoCaracteres": 100000,
        "mimeTypes": [
          "application/pdf"
        ],
        "maxItensPorColecao": 100,
        "maxDestinatariosEtiquetas": 5000
      },
      "permissoes": {
        "acoes": [
          "salvar"
        ],
        "camposEditaveis": [
          "contatos"
        ]
      }
    },
    "conversaOrigem": {
      "conversaId": "11111111-1111-4111-8111-111111111111",
      "etagConversa": "\"conversa-1\""
    }
  },
  "acoesPermitidas": [
    "integrar_novo"
  ],
  "fichaIntegrada": {
    "id": "11111111-1111-4111-8111-111111111111",
    "versao": 1,
    "etag": "\"edicao-1\"",
    "pessoa": {
      "id": "11111111-1111-4111-8111-111111111111",
      "nome": "Ana Exemplo",
      "bairro": "Centro",
      "contatoPrincipal": "+5511999990000",
      "foto": {
        "id": "11111111-1111-4111-8111-111111111111",
        "nome": "foto-exemplo.jpg",
        "mimeType": "image/jpeg",
        "tamanhoBytes": 1024,
        "url": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo",
        "miniaturaUrl": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo?variante=miniatura"
      },
      "arquivado": false
    },
    "formulario": {
      "nome": "Ana Exemplo",
      "sexoCodigo": null,
      "nascimento": "1990-11-15",
      "observacoes": "Participa do futebol. Prefere contato à tarde.",
      "contatos": [
        {
          "chave": "telefone-1",
          "id": "11111111-1111-4111-8111-111111111111",
          "tipo": "telefone",
          "valor": "+5511999990000",
          "relacao": "Telefone da família.",
          "principal": true
        }
      ],
      "enderecos": [
        {
          "chave": "endereco-1",
          "id": "11111111-1111-4111-8111-111111111111",
          "logradouro": "Rua Exemplo",
          "numero": "100",
          "complemento": null,
          "bairro": "Centro",
          "cidade": "São Paulo",
          "uf": "SP",
          "cep": "01001000",
          "principal": true
        }
      ],
      "documentos": [
        {
          "chave": "documento-1",
          "id": "11111111-1111-4111-8111-111111111111",
          "tipo": "outro",
          "valor": "DOC-EXEMPLO",
          "orgaoEmissor": null
        }
      ],
      "classificacaoIds": [
        "33333333-3333-4333-8333-333333333333"
      ],
      "indicadoPorMunicipeId": "33333333-3333-4333-8333-333333333333",
      "preferenciaContato": {
        "permitirProativo": true
      },
      "fotos": [
        {
          "chave": "foto-1",
          "id": "11111111-1111-4111-8111-111111111111",
          "legenda": "Foto de reconhecimento.",
          "principal": true
        }
      ],
      "transcricoesUtilizadas": [
        {
          "transcricaoId": "11111111-1111-4111-8111-111111111111",
          "trechoAceito": "Prefere contato à tarde."
        }
      ]
    },
    "referencias": {
      "indicador": {
        "id": "11111111-1111-4111-8111-111111111111",
        "rotulo": "Ana Exemplo",
        "ativo": true
      },
      "classificacoes": [
        {
          "id": "11111111-1111-4111-8111-111111111111",
          "rotulo": "Ana Exemplo",
          "ativo": true
        }
      ]
    },
    "fotos": [
      {
        "id": "11111111-1111-4111-8111-111111111111",
        "nome": "foto-exemplo.jpg",
        "mimeType": "image/jpeg",
        "tamanhoBytes": 1024,
        "url": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo",
        "miniaturaUrl": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo?variante=miniatura"
      }
    ],
    "contextoEdicao": {
      "sexos": [
        {
          "codigo": "nao_informado",
          "rotulo": "Não informado"
        }
      ],
      "tiposDocumento": [
        "cpf"
      ],
      "classificacoesIniciais": [
        {
          "id": "11111111-1111-4111-8111-111111111111",
          "rotulo": "Ana Exemplo",
          "ativo": true
        }
      ],
      "responsaveisIniciais": [
        {
          "id": "11111111-1111-4111-8111-111111111111",
          "rotulo": "Ana Exemplo",
          "ativo": true
        }
      ],
      "servicosIniciais": [
        {
          "id": "11111111-1111-4111-8111-111111111111",
          "rotulo": "Ana Exemplo",
          "ativo": true
        }
      ],
      "limites": {
        "maxUploadBytes": 26214400,
        "maxArquivosPorLote": 10,
        "maxAudioSegundos": 600,
        "maxObservacaoCaracteres": 100000,
        "mimeTypes": [
          "application/pdf"
        ],
        "maxItensPorColecao": 100,
        "maxDestinatariosEtiquetas": 5000
      },
      "permissoes": {
        "acoes": [
          "salvar"
        ],
        "camposEditaveis": [
          "contatos"
        ]
      }
    },
    "resumoContato": {
      "ultimaInteracaoEm": "2026-11-16T17:00:00Z",
      "diasSemContato": 75,
      "janelaDias": 90,
      "diasComInteracao": 8,
      "mensagensRecebidas": 20,
      "mensagensEnviadas": 10,
      "atendimentos": 2,
      "ultimaTentativaEm": "2026-11-16T17:00:00Z",
      "cobertura": "disponivel"
    },
    "atendimentosRecentes": [
      {
        "id": "11111111-1111-4111-8111-111111111111",
        "protocolo": "2026-000001",
        "titulo": "Pedido de iluminação",
        "situacao": "aberto",
        "pessoa": {
          "id": "11111111-1111-4111-8111-111111111111",
          "rotulo": "Ana Exemplo",
          "ativo": true
        },
        "responsavel": {
          "id": "11111111-1111-4111-8111-111111111111",
          "rotulo": "Ana Exemplo",
          "ativo": true
        },
        "abertoEm": "2026-11-16T17:00:00Z",
        "prazo": "2026-11-16T17:00:00Z",
        "acoesPermitidas": [
          "abrir"
        ],
        "identidadePendente": false
      }
    ],
    "atividadesRecentes": [
      {
        "id": "11111111-1111-4111-8111-111111111111",
        "acao": "municipe.atualizado",
        "alvoTipo": "municipe",
        "alvoId": "11111111-1111-4111-8111-111111111111",
        "autor": {
          "tipo": "usuario",
          "usuarioId": "11111111-1111-4111-8111-111111111111",
          "nome": "Operador Exemplo"
        },
        "ocorridoEm": "2026-11-16T17:00:00Z",
        "resumo": "Ficha atualizada.",
        "podeReverter": true
      }
    ],
    "marcacaoVotoAtualizadaEm": "2026-11-16T17:00:00Z",
    "marcacaoVotoAtualizadaPor": {
      "id": "11111111-1111-4111-8111-111111111111",
      "rotulo": "Ana Exemplo",
      "ativo": true
    },
    "conversaAtualizada": {
      "id": "11111111-1111-4111-8111-111111111111",
      "etag": "\"conversa-1\"",
      "pessoa": {
        "id": "11111111-1111-4111-8111-111111111111",
        "nome": "Ana Exemplo",
        "bairro": "Centro",
        "contatoPrincipal": "+5511999990000",
        "foto": {
          "id": "11111111-1111-4111-8111-111111111111",
          "nome": "foto-exemplo.jpg",
          "mimeType": "image/jpeg",
          "tamanhoBytes": 1024,
          "url": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo",
          "miniaturaUrl": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo?variante=miniatura"
        },
        "arquivado": false
      },
      "contatoCanal": "+5511999990000",
      "estado": "aguardando",
      "responsavel": {
        "id": "11111111-1111-4111-8111-111111111111",
        "rotulo": "Ana Exemplo",
        "ativo": true
      },
      "equipe": {
        "id": "11111111-1111-4111-8111-111111111111",
        "rotulo": "Ana Exemplo",
        "ativo": true
      },
      "naoLidas": 1,
      "ultimaMensagem": "Gostaria de saber o andamento.",
      "ultimaMensagemEm": "2026-11-16T17:00:00Z"
    }
  }
}
```

| Header retornado | Uso |
| --- | --- |
| Cache-Control | Sem cache público de dados pessoais/QR. |
| X-Request-Id | Correlação e cache. |
| ETag | Usar este ETag na edição do agregado indicado. |

Erros: `400`, `401`, `403`, `404`, `422`, `429`, `500`, `503`. Ver [envelope e comportamento](README.md#erros).

<a id="post_cadastros_recebidos_id_conferencia"></a>
## POST /cadastros-recebidos/{id}/conferencia

**Tela:** Conferir envio e comparar pessoa. **Ação:** Executar ação de conferência em uma chamada.

Comandos restritos da tela: assumir/transferir/adiar/descartar/integrar novo/existente. Integração salva pessoa completa ou alterações escolhidas, contatos, participação, decisão e temporário atomicamente. Não cadastrar pessoa antes para depois incorporar. If-Match do temporário e ETag do destino já recebido na comparação; permissões condicionais por ação. Além da permissão da tela, cada acao possui permissões próprias (x-permissoes-por-acao); incorporar alteracoes exige municipes.editar e permissões dos campos, enquanto omitir alteracoes preserva a pessoa e registra apenas origem/participação.

Permissões: `cadastros_recebidos.conferir`.

| Nome | Local | Obrigatório | Tipo | Uso |
| --- | --- | --- | --- | --- |
| id | path | sim | string (uuid) | Identificador interno UUID. |
| X-CSRF-Token | header | sim | string | Obrigatório nas chamadas autenticadas não GET; cookie HttpOnly é enviado automaticamente pelo navegador. |
| Idempotency-Key | header | sim | string | Mesma identidade+rota+chave+corpo não repete efeitos. Corpo alterado usa nova chave. |
| If-Match | header | sim | string | Versão do agregado/item especificado. 428 ausente, 412 desatualizado; não aceitar *. |

Entrada obrigatória `application/json`: [Conferencia](#schema-Conferencia).

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |

```json
{
  "acao": "assumir",
  "usuarioDestinoId": "11111111-1111-4111-8111-111111111111",
  "motivo": "Conferência atribuída à equipe."
}
```

**Resposta 200:** Dados prontos para a tela, no alcance autorizado.

`application/json` · [RevisaoCadastro](#schema-RevisaoCadastro)

```json
{
  "cadastro": {
    "id": "11111111-1111-4111-8111-111111111111",
    "versao": 1,
    "etag": "\"edicao-1\"",
    "nome": "Ana Exemplo",
    "origem": {
      "id": "11111111-1111-4111-8111-111111111111",
      "rotulo": "Ana Exemplo",
      "ativo": true
    },
    "recebidoEm": "2026-11-16T17:00:00Z",
    "situacao": "pendente",
    "revisor": {
      "id": "11111111-1111-4111-8111-111111111111",
      "rotulo": "Ana Exemplo",
      "ativo": true
    }
  },
  "declaracaoOriginal": {
    "nome": "Ana Exemplo",
    "sexoCodigo": "nao_informado",
    "nascimento": "1990-11-15",
    "contatos": [
      {
        "tipo": "telefone",
        "valor": "+5511999990000"
      }
    ],
    "endereco": {
      "logradouro": "Rua Exemplo",
      "numero": "100",
      "complemento": "Casa 2",
      "bairro": "Centro",
      "cidade": "São Paulo",
      "uf": "SP",
      "cep": "01001000"
    },
    "documentos": [
      {
        "tipo": "outro",
        "valor": "DOC-EXEMPLO",
        "orgaoEmissor": "Órgão Exemplo"
      }
    ]
  },
  "candidatos": [
    {
      "pessoa": {
        "id": "11111111-1111-4111-8111-111111111111",
        "rotulo": "Ana Exemplo",
        "ativo": true
      },
      "motivos": [
        "Nome semelhante e nascimento coincidente."
      ],
      "resumo": "Nascimento: 15/11/1990 · bairro Centro"
    }
  ],
  "compararCom": {
    "id": "11111111-1111-4111-8111-111111111111",
    "versao": 1,
    "etag": "\"edicao-1\"",
    "pessoa": {
      "id": "11111111-1111-4111-8111-111111111111",
      "nome": "Ana Exemplo",
      "bairro": "Centro",
      "contatoPrincipal": "+5511999990000",
      "foto": {
        "id": "11111111-1111-4111-8111-111111111111",
        "nome": "foto-exemplo.jpg",
        "mimeType": "image/jpeg",
        "tamanhoBytes": 1024,
        "url": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo",
        "miniaturaUrl": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo?variante=miniatura"
      },
      "arquivado": false
    },
    "formulario": {
      "nome": "Ana Exemplo",
      "sexoCodigo": null,
      "nascimento": "1990-11-15",
      "observacoes": "Participa do futebol. Prefere contato à tarde.",
      "contatos": [
        {
          "chave": "telefone-1",
          "id": "11111111-1111-4111-8111-111111111111",
          "tipo": "telefone",
          "valor": "+5511999990000",
          "relacao": "Telefone da família.",
          "principal": true
        }
      ],
      "enderecos": [
        {
          "chave": "endereco-1",
          "id": "11111111-1111-4111-8111-111111111111",
          "logradouro": "Rua Exemplo",
          "numero": "100",
          "complemento": null,
          "bairro": "Centro",
          "cidade": "São Paulo",
          "uf": "SP",
          "cep": "01001000",
          "principal": true
        }
      ],
      "documentos": [
        {
          "chave": "documento-1",
          "id": "11111111-1111-4111-8111-111111111111",
          "tipo": "outro",
          "valor": "DOC-EXEMPLO",
          "orgaoEmissor": null
        }
      ],
      "classificacaoIds": [
        "33333333-3333-4333-8333-333333333333"
      ],
      "indicadoPorMunicipeId": "33333333-3333-4333-8333-333333333333",
      "preferenciaContato": {
        "permitirProativo": true
      },
      "fotos": [
        {
          "chave": "foto-1",
          "id": "11111111-1111-4111-8111-111111111111",
          "legenda": "Foto de reconhecimento.",
          "principal": true
        }
      ],
      "transcricoesUtilizadas": [
        {
          "transcricaoId": "11111111-1111-4111-8111-111111111111",
          "trechoAceito": "Prefere contato à tarde."
        }
      ]
    },
    "referencias": {
      "indicador": {
        "id": "11111111-1111-4111-8111-111111111111",
        "rotulo": "Ana Exemplo",
        "ativo": true
      },
      "classificacoes": [
        {
          "id": "11111111-1111-4111-8111-111111111111",
          "rotulo": "Ana Exemplo",
          "ativo": true
        }
      ]
    },
    "fotos": [
      {
        "id": "11111111-1111-4111-8111-111111111111",
        "nome": "foto-exemplo.jpg",
        "mimeType": "image/jpeg",
        "tamanhoBytes": 1024,
        "url": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo",
        "miniaturaUrl": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo?variante=miniatura"
      }
    ],
    "contextoEdicao": {
      "sexos": [
        {
          "codigo": "nao_informado",
          "rotulo": "Não informado"
        }
      ],
      "tiposDocumento": [
        "cpf"
      ],
      "classificacoesIniciais": [
        {
          "id": "11111111-1111-4111-8111-111111111111",
          "rotulo": "Ana Exemplo",
          "ativo": true
        }
      ],
      "responsaveisIniciais": [
        {
          "id": "11111111-1111-4111-8111-111111111111",
          "rotulo": "Ana Exemplo",
          "ativo": true
        }
      ],
      "servicosIniciais": [
        {
          "id": "11111111-1111-4111-8111-111111111111",
          "rotulo": "Ana Exemplo",
          "ativo": true
        }
      ],
      "limites": {
        "maxUploadBytes": 26214400,
        "maxArquivosPorLote": 10,
        "maxAudioSegundos": 600,
        "maxObservacaoCaracteres": 100000,
        "mimeTypes": [
          "application/pdf"
        ],
        "maxItensPorColecao": 100,
        "maxDestinatariosEtiquetas": 5000
      },
      "permissoes": {
        "acoes": [
          "salvar"
        ],
        "camposEditaveis": [
          "contatos"
        ]
      }
    },
    "resumoContato": {
      "ultimaInteracaoEm": "2026-11-16T17:00:00Z",
      "diasSemContato": 75,
      "janelaDias": 90,
      "diasComInteracao": 8,
      "mensagensRecebidas": 20,
      "mensagensEnviadas": 10,
      "atendimentos": 2,
      "ultimaTentativaEm": "2026-11-16T17:00:00Z",
      "cobertura": "disponivel"
    },
    "atendimentosRecentes": [
      {
        "id": "11111111-1111-4111-8111-111111111111",
        "protocolo": "2026-000001",
        "titulo": "Pedido de iluminação",
        "situacao": "aberto",
        "pessoa": {
          "id": "11111111-1111-4111-8111-111111111111",
          "rotulo": "Ana Exemplo",
          "ativo": true
        },
        "responsavel": {
          "id": "11111111-1111-4111-8111-111111111111",
          "rotulo": "Ana Exemplo",
          "ativo": true
        },
        "abertoEm": "2026-11-16T17:00:00Z",
        "prazo": "2026-11-16T17:00:00Z",
        "acoesPermitidas": [
          "abrir"
        ],
        "identidadePendente": false
      }
    ],
    "atividadesRecentes": [
      {
        "id": "11111111-1111-4111-8111-111111111111",
        "acao": "municipe.atualizado",
        "alvoTipo": "municipe",
        "alvoId": "11111111-1111-4111-8111-111111111111",
        "autor": {
          "tipo": "usuario",
          "usuarioId": "11111111-1111-4111-8111-111111111111",
          "nome": "Operador Exemplo"
        },
        "ocorridoEm": "2026-11-16T17:00:00Z",
        "resumo": "Ficha atualizada.",
        "podeReverter": true
      }
    ],
    "marcacaoVotoAtualizadaEm": "2026-11-16T17:00:00Z",
    "marcacaoVotoAtualizadaPor": {
      "id": "11111111-1111-4111-8111-111111111111",
      "rotulo": "Ana Exemplo",
      "ativo": true
    },
    "conversaAtualizada": {
      "id": "11111111-1111-4111-8111-111111111111",
      "etag": "\"conversa-1\"",
      "pessoa": {
        "id": "11111111-1111-4111-8111-111111111111",
        "nome": "Ana Exemplo",
        "bairro": "Centro",
        "contatoPrincipal": "+5511999990000",
        "foto": {
          "id": "11111111-1111-4111-8111-111111111111",
          "nome": "foto-exemplo.jpg",
          "mimeType": "image/jpeg",
          "tamanhoBytes": 1024,
          "url": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo",
          "miniaturaUrl": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo?variante=miniatura"
        },
        "arquivado": false
      },
      "contatoCanal": "+5511999990000",
      "estado": "aguardando",
      "responsavel": {
        "id": "11111111-1111-4111-8111-111111111111",
        "rotulo": "Ana Exemplo",
        "ativo": true
      },
      "equipe": {
        "id": "11111111-1111-4111-8111-111111111111",
        "rotulo": "Ana Exemplo",
        "ativo": true
      },
      "naoLidas": 1,
      "ultimaMensagem": "Gostaria de saber o andamento.",
      "ultimaMensagemEm": "2026-11-16T17:00:00Z"
    }
  },
  "contextoCadastroNovo": {
    "valoresIniciais": {
      "contatos": [],
      "enderecos": [],
      "documentos": [],
      "classificacaoIds": [],
      "fotos": [],
      "preferenciaContato": {
        "permitirProativo": true
      }
    },
    "contexto": {
      "sexos": [
        {
          "codigo": "nao_informado",
          "rotulo": "Não informado"
        }
      ],
      "tiposDocumento": [
        "cpf"
      ],
      "classificacoesIniciais": [
        {
          "id": "11111111-1111-4111-8111-111111111111",
          "rotulo": "Ana Exemplo",
          "ativo": true
        }
      ],
      "responsaveisIniciais": [
        {
          "id": "11111111-1111-4111-8111-111111111111",
          "rotulo": "Ana Exemplo",
          "ativo": true
        }
      ],
      "servicosIniciais": [
        {
          "id": "11111111-1111-4111-8111-111111111111",
          "rotulo": "Ana Exemplo",
          "ativo": true
        }
      ],
      "limites": {
        "maxUploadBytes": 26214400,
        "maxArquivosPorLote": 10,
        "maxAudioSegundos": 600,
        "maxObservacaoCaracteres": 100000,
        "mimeTypes": [
          "application/pdf"
        ],
        "maxItensPorColecao": 100,
        "maxDestinatariosEtiquetas": 5000
      },
      "permissoes": {
        "acoes": [
          "salvar"
        ],
        "camposEditaveis": [
          "contatos"
        ]
      }
    },
    "conversaOrigem": {
      "conversaId": "11111111-1111-4111-8111-111111111111",
      "etagConversa": "\"conversa-1\""
    }
  },
  "acoesPermitidas": [
    "integrar_novo"
  ],
  "fichaIntegrada": {
    "id": "11111111-1111-4111-8111-111111111111",
    "versao": 1,
    "etag": "\"edicao-1\"",
    "pessoa": {
      "id": "11111111-1111-4111-8111-111111111111",
      "nome": "Ana Exemplo",
      "bairro": "Centro",
      "contatoPrincipal": "+5511999990000",
      "foto": {
        "id": "11111111-1111-4111-8111-111111111111",
        "nome": "foto-exemplo.jpg",
        "mimeType": "image/jpeg",
        "tamanhoBytes": 1024,
        "url": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo",
        "miniaturaUrl": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo?variante=miniatura"
      },
      "arquivado": false
    },
    "formulario": {
      "nome": "Ana Exemplo",
      "sexoCodigo": null,
      "nascimento": "1990-11-15",
      "observacoes": "Participa do futebol. Prefere contato à tarde.",
      "contatos": [
        {
          "chave": "telefone-1",
          "id": "11111111-1111-4111-8111-111111111111",
          "tipo": "telefone",
          "valor": "+5511999990000",
          "relacao": "Telefone da família.",
          "principal": true
        }
      ],
      "enderecos": [
        {
          "chave": "endereco-1",
          "id": "11111111-1111-4111-8111-111111111111",
          "logradouro": "Rua Exemplo",
          "numero": "100",
          "complemento": null,
          "bairro": "Centro",
          "cidade": "São Paulo",
          "uf": "SP",
          "cep": "01001000",
          "principal": true
        }
      ],
      "documentos": [
        {
          "chave": "documento-1",
          "id": "11111111-1111-4111-8111-111111111111",
          "tipo": "outro",
          "valor": "DOC-EXEMPLO",
          "orgaoEmissor": null
        }
      ],
      "classificacaoIds": [
        "33333333-3333-4333-8333-333333333333"
      ],
      "indicadoPorMunicipeId": "33333333-3333-4333-8333-333333333333",
      "preferenciaContato": {
        "permitirProativo": true
      },
      "fotos": [
        {
          "chave": "foto-1",
          "id": "11111111-1111-4111-8111-111111111111",
          "legenda": "Foto de reconhecimento.",
          "principal": true
        }
      ],
      "transcricoesUtilizadas": [
        {
          "transcricaoId": "11111111-1111-4111-8111-111111111111",
          "trechoAceito": "Prefere contato à tarde."
        }
      ]
    },
    "referencias": {
      "indicador": {
        "id": "11111111-1111-4111-8111-111111111111",
        "rotulo": "Ana Exemplo",
        "ativo": true
      },
      "classificacoes": [
        {
          "id": "11111111-1111-4111-8111-111111111111",
          "rotulo": "Ana Exemplo",
          "ativo": true
        }
      ]
    },
    "fotos": [
      {
        "id": "11111111-1111-4111-8111-111111111111",
        "nome": "foto-exemplo.jpg",
        "mimeType": "image/jpeg",
        "tamanhoBytes": 1024,
        "url": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo",
        "miniaturaUrl": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo?variante=miniatura"
      }
    ],
    "contextoEdicao": {
      "sexos": [
        {
          "codigo": "nao_informado",
          "rotulo": "Não informado"
        }
      ],
      "tiposDocumento": [
        "cpf"
      ],
      "classificacoesIniciais": [
        {
          "id": "11111111-1111-4111-8111-111111111111",
          "rotulo": "Ana Exemplo",
          "ativo": true
        }
      ],
      "responsaveisIniciais": [
        {
          "id": "11111111-1111-4111-8111-111111111111",
          "rotulo": "Ana Exemplo",
          "ativo": true
        }
      ],
      "servicosIniciais": [
        {
          "id": "11111111-1111-4111-8111-111111111111",
          "rotulo": "Ana Exemplo",
          "ativo": true
        }
      ],
      "limites": {
        "maxUploadBytes": 26214400,
        "maxArquivosPorLote": 10,
        "maxAudioSegundos": 600,
        "maxObservacaoCaracteres": 100000,
        "mimeTypes": [
          "application/pdf"
        ],
        "maxItensPorColecao": 100,
        "maxDestinatariosEtiquetas": 5000
      },
      "permissoes": {
        "acoes": [
          "salvar"
        ],
        "camposEditaveis": [
          "contatos"
        ]
      }
    },
    "resumoContato": {
      "ultimaInteracaoEm": "2026-11-16T17:00:00Z",
      "diasSemContato": 75,
      "janelaDias": 90,
      "diasComInteracao": 8,
      "mensagensRecebidas": 20,
      "mensagensEnviadas": 10,
      "atendimentos": 2,
      "ultimaTentativaEm": "2026-11-16T17:00:00Z",
      "cobertura": "disponivel"
    },
    "atendimentosRecentes": [
      {
        "id": "11111111-1111-4111-8111-111111111111",
        "protocolo": "2026-000001",
        "titulo": "Pedido de iluminação",
        "situacao": "aberto",
        "pessoa": {
          "id": "11111111-1111-4111-8111-111111111111",
          "rotulo": "Ana Exemplo",
          "ativo": true
        },
        "responsavel": {
          "id": "11111111-1111-4111-8111-111111111111",
          "rotulo": "Ana Exemplo",
          "ativo": true
        },
        "abertoEm": "2026-11-16T17:00:00Z",
        "prazo": "2026-11-16T17:00:00Z",
        "acoesPermitidas": [
          "abrir"
        ],
        "identidadePendente": false
      }
    ],
    "atividadesRecentes": [
      {
        "id": "11111111-1111-4111-8111-111111111111",
        "acao": "municipe.atualizado",
        "alvoTipo": "municipe",
        "alvoId": "11111111-1111-4111-8111-111111111111",
        "autor": {
          "tipo": "usuario",
          "usuarioId": "11111111-1111-4111-8111-111111111111",
          "nome": "Operador Exemplo"
        },
        "ocorridoEm": "2026-11-16T17:00:00Z",
        "resumo": "Ficha atualizada.",
        "podeReverter": true
      }
    ],
    "marcacaoVotoAtualizadaEm": "2026-11-16T17:00:00Z",
    "marcacaoVotoAtualizadaPor": {
      "id": "11111111-1111-4111-8111-111111111111",
      "rotulo": "Ana Exemplo",
      "ativo": true
    },
    "conversaAtualizada": {
      "id": "11111111-1111-4111-8111-111111111111",
      "etag": "\"conversa-1\"",
      "pessoa": {
        "id": "11111111-1111-4111-8111-111111111111",
        "nome": "Ana Exemplo",
        "bairro": "Centro",
        "contatoPrincipal": "+5511999990000",
        "foto": {
          "id": "11111111-1111-4111-8111-111111111111",
          "nome": "foto-exemplo.jpg",
          "mimeType": "image/jpeg",
          "tamanhoBytes": 1024,
          "url": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo",
          "miniaturaUrl": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo?variante=miniatura"
        },
        "arquivado": false
      },
      "contatoCanal": "+5511999990000",
      "estado": "aguardando",
      "responsavel": {
        "id": "11111111-1111-4111-8111-111111111111",
        "rotulo": "Ana Exemplo",
        "ativo": true
      },
      "equipe": {
        "id": "11111111-1111-4111-8111-111111111111",
        "rotulo": "Ana Exemplo",
        "ativo": true
      },
      "naoLidas": 1,
      "ultimaMensagem": "Gostaria de saber o andamento.",
      "ultimaMensagemEm": "2026-11-16T17:00:00Z"
    }
  }
}
```

| Header retornado | Uso |
| --- | --- |
| Cache-Control | Sem cache público de dados pessoais/QR. |
| X-Request-Id | Correlação e cache. |
| ETag | Usar este ETag na edição do agregado indicado. |
| X-Activity-Id | Atividade do comando agregado, com seus detalhes por campo/vínculo. |

Erros: `400`, `401`, `403`, `404`, `409`, `412`, `422`, `428`, `429`, `500`, `503`. Ver [envelope e comportamento](README.md#erros).

O backend resolve nesta ação: validar comando e autorização; revalidar temporário/destino/duplicidade; salvar agregado de pessoa e participação; registrar decisão e estado; retornar revisão e ficha resultante.

<a id="get_etiquetas_preparacao"></a>
## GET /etiquetas/preparacao

**Tela:** Editor de etiquetas. **Ação:** Montar editor com modelo, formato e opções.

Uma chamada carrega modelo padrão/selecionado, formato selecionado, campos permitidos e opções iniciais. Trocar escolha usa modeloId/formatoId para retornar o editor já preenchido; /opcoes só pesquisa bibliotecas grandes.

Permissões: `etiquetas.ler`.

| Nome | Local | Obrigatório | Tipo | Uso |
| --- | --- | --- | --- | --- |
| modeloId | query | não | string (uuid) | Modelo selecionado; omitir usa padrão. |
| formatoId | query | não | string (uuid) | Formato escolhido; necessário para gerar, não para abrir a tela. |

**Resposta 200:** Dados prontos para a tela, no alcance autorizado.

`application/json` · [PreparacaoEtiquetas](#schema-PreparacaoEtiquetas)

```json
{
  "modeloSelecionado": {
    "id": "11111111-1111-4111-8111-111111111111",
    "versao": 1,
    "etag": "\"edicao-1\"",
    "nome": "Nome e endereço",
    "blocos": [
      {
        "tipo": "campo",
        "campo": "nome",
        "xMm": 2,
        "yMm": 2,
        "larguraMm": 56,
        "alturaMm": 6,
        "fontePt": 9,
        "negrito": true,
        "alinhamento": "esquerda",
        "omitirSeVazio": true
      }
    ],
    "padrao": true,
    "ativo": true
  },
  "etagModelo": "\"edicao-1\"",
  "formatoSelecionado": {
    "id": "11111111-1111-4111-8111-111111111111",
    "versao": 1,
    "etag": "\"edicao-1\"",
    "nome": "Personalizado 60 x 25",
    "folhaLarguraMm": 210,
    "folhaAlturaMm": 297,
    "etiquetaLarguraMm": 60,
    "etiquetaAlturaMm": 25,
    "margemSuperiorMm": 10,
    "margemInferiorMm": 10,
    "margemEsquerdaMm": 10,
    "margemDireitaMm": 10,
    "linhas": 10,
    "colunas": 3,
    "espacoHorizontalMm": 5,
    "espacoVerticalMm": 2,
    "ativo": true,
    "origem": "personalizado",
    "codigoPimaco": "CODIGO-A-CONFERIR"
  },
  "etagFormato": "\"edicao-1\"",
  "modelosIniciais": [
    {
      "id": "11111111-1111-4111-8111-111111111111",
      "rotulo": "Ana Exemplo",
      "ativo": true
    }
  ],
  "formatosIniciais": [
    {
      "id": "11111111-1111-4111-8111-111111111111",
      "rotulo": "Ana Exemplo",
      "ativo": true
    }
  ],
  "camposPermitidos": [
    "nome"
  ],
  "acoesPermitidas": [
    "gerar_previa"
  ]
}
```

| Header retornado | Uso |
| --- | --- |
| Cache-Control | Sem cache público de dados pessoais/QR. |
| X-Request-Id | Correlação e cache. |

Erros: `400`, `401`, `403`, `422`, `429`, `500`, `503`. Ver [envelope e comportamento](README.md#erros).

<a id="post_etiquetas_modelos"></a>
## POST /etiquetas/modelos

**Tela:** Salvar modelo de etiqueta. **Ação:** Salvar como novo modelo.

Usa os dados completos que já estão no editor. Cópia é o mesmo POST com novo nome, sem endpoint extra de copiar. Só é chamado se o usuário quiser guardar modelo; imprimir rascunho não exige salvar biblioteca.

Permissões: `etiquetas.modelos.editar`.

| Nome | Local | Obrigatório | Tipo | Uso |
| --- | --- | --- | --- | --- |
| X-CSRF-Token | header | sim | string | Obrigatório nas chamadas autenticadas não GET; cookie HttpOnly é enviado automaticamente pelo navegador. |
| Idempotency-Key | header | sim | string | Mesma identidade+rota+chave+corpo não repete efeitos. Corpo alterado usa nova chave. |

Entrada obrigatória `application/json`: [ModeloEtiquetaSalvar](#schema-ModeloEtiquetaSalvar).

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| nome | string | sim | Nome do modelo. · minLength=1 |
| blocos | array<BlocoEtiqueta> | sim | Lista de valores. · minItems=1; maxItems=100 |
| padrao | boolean | não | Definir padrão na mesma gravação, se autorizado. |
| ativo | boolean | sim | Pode ser inativado pelo editor. |

```json
{
  "nome": "Nome e endereço",
  "blocos": [
    {
      "tipo": "campo",
      "campo": "nome",
      "xMm": 2,
      "yMm": 2,
      "larguraMm": 56,
      "alturaMm": 6,
      "fontePt": 9,
      "negrito": true,
      "alinhamento": "esquerda",
      "omitirSeVazio": true
    },
    {
      "tipo": "campo",
      "campo": "enderecoCompleto",
      "xMm": 2,
      "yMm": 9,
      "larguraMm": 56,
      "alturaMm": 14,
      "fontePt": 9,
      "negrito": false,
      "alinhamento": "esquerda",
      "omitirSeVazio": true
    }
  ],
  "padrao": true,
  "ativo": true
}
```

**Resposta 201:** Dados prontos para a tela, no alcance autorizado.

`application/json` · [ModeloEtiqueta](#schema-ModeloEtiqueta)

```json
{
  "id": "11111111-1111-4111-8111-111111111111",
  "versao": 1,
  "etag": "\"edicao-1\"",
  "nome": "Nome e endereço",
  "blocos": [
    {
      "tipo": "campo",
      "campo": "nome",
      "xMm": 2,
      "yMm": 2,
      "larguraMm": 56,
      "alturaMm": 6,
      "fontePt": 9,
      "negrito": true,
      "alinhamento": "esquerda",
      "omitirSeVazio": true
    }
  ],
  "padrao": true,
  "ativo": true
}
```

| Header retornado | Uso |
| --- | --- |
| Cache-Control | Sem cache público de dados pessoais/QR. |
| X-Request-Id | Correlação e cache. |
| ETag | Usar este ETag na edição do agregado indicado. |
| X-Activity-Id | Atividade do comando agregado, com seus detalhes por campo/vínculo. |

Erros: `400`, `401`, `403`, `409`, `422`, `429`, `500`, `503`. Ver [envelope e comportamento](README.md#erros).

<a id="patch_etiquetas_modelos_id"></a>
## PATCH /etiquetas/modelos/{id}

**Tela:** Salvar modelo de etiqueta. **Ação:** Salvar modelo existente e opção de padrão.

If-Match já veio na preparação. Grava blocos, nome, ativo e padrão autorizado na mesma ação. Inativar preserva versões/arquivos gerados; não recolhe impressão.

Permissões: `etiquetas.modelos.editar`.

| Nome | Local | Obrigatório | Tipo | Uso |
| --- | --- | --- | --- | --- |
| id | path | sim | string (uuid) | Identificador interno UUID. |
| X-CSRF-Token | header | sim | string | Obrigatório nas chamadas autenticadas não GET; cookie HttpOnly é enviado automaticamente pelo navegador. |
| Idempotency-Key | header | sim | string | Mesma identidade+rota+chave+corpo não repete efeitos. Corpo alterado usa nova chave. |
| If-Match | header | sim | string | Versão do agregado/item especificado. 428 ausente, 412 desatualizado; não aceitar *. |

Entrada obrigatória `application/json`: [ModeloEtiquetaSalvar](#schema-ModeloEtiquetaSalvar).

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| nome | string | sim | Nome do modelo. · minLength=1 |
| blocos | array<BlocoEtiqueta> | sim | Lista de valores. · minItems=1; maxItems=100 |
| padrao | boolean | não | Definir padrão na mesma gravação, se autorizado. |
| ativo | boolean | sim | Pode ser inativado pelo editor. |

```json
{
  "nome": "Nome e endereço",
  "blocos": [
    {
      "tipo": "campo",
      "campo": "nome",
      "xMm": 2,
      "yMm": 2,
      "larguraMm": 56,
      "alturaMm": 6,
      "fontePt": 9,
      "negrito": true,
      "alinhamento": "esquerda",
      "omitirSeVazio": true
    },
    {
      "tipo": "campo",
      "campo": "enderecoCompleto",
      "xMm": 2,
      "yMm": 9,
      "larguraMm": 56,
      "alturaMm": 14,
      "fontePt": 9,
      "negrito": false,
      "alinhamento": "esquerda",
      "omitirSeVazio": true
    }
  ],
  "padrao": true,
  "ativo": true
}
```

**Resposta 200:** Dados prontos para a tela, no alcance autorizado.

`application/json` · [ModeloEtiqueta](#schema-ModeloEtiqueta)

```json
{
  "id": "11111111-1111-4111-8111-111111111111",
  "versao": 1,
  "etag": "\"edicao-1\"",
  "nome": "Nome e endereço",
  "blocos": [
    {
      "tipo": "campo",
      "campo": "nome",
      "xMm": 2,
      "yMm": 2,
      "larguraMm": 56,
      "alturaMm": 6,
      "fontePt": 9,
      "negrito": true,
      "alinhamento": "esquerda",
      "omitirSeVazio": true
    }
  ],
  "padrao": true,
  "ativo": true
}
```

| Header retornado | Uso |
| --- | --- |
| Cache-Control | Sem cache público de dados pessoais/QR. |
| X-Request-Id | Correlação e cache. |
| ETag | Usar este ETag na edição do agregado indicado. |
| X-Activity-Id | Atividade do comando agregado, com seus detalhes por campo/vínculo. |

Erros: `400`, `401`, `403`, `404`, `409`, `412`, `422`, `428`, `429`, `500`, `503`. Ver [envelope e comportamento](README.md#erros).

<a id="post_etiquetas_formatos"></a>
## POST /etiquetas/formatos

**Tela:** Salvar formato personalizado. **Ação:** Guardar medidas personalizadas para reutilizar.

Única criação de formato pela equipe. Pimaco é catálogo homologado somente leitura. Valida grade/margens; retorna objeto pronto para seleção sem GET adicional.

Permissões: `etiquetas.formatos.editar`.

| Nome | Local | Obrigatório | Tipo | Uso |
| --- | --- | --- | --- | --- |
| X-CSRF-Token | header | sim | string | Obrigatório nas chamadas autenticadas não GET; cookie HttpOnly é enviado automaticamente pelo navegador. |
| Idempotency-Key | header | sim | string | Mesma identidade+rota+chave+corpo não repete efeitos. Corpo alterado usa nova chave. |

Entrada obrigatória `application/json`: [FormatoEtiquetaSalvar](#schema-FormatoEtiquetaSalvar).

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| nome | string | sim | Nome reutilizável. · minLength=1 |
| folhaLarguraMm | number | sim | Largura da folha. · minimum=1 |
| folhaAlturaMm | number | sim | Altura da folha. · minimum=1 |
| etiquetaLarguraMm | number | sim | Largura. · minimum=1 |
| etiquetaAlturaMm | number | sim | Altura. · minimum=1 |
| margemSuperiorMm | number | sim | Margem. · minimum=0 |
| margemInferiorMm | number | sim | Margem. · minimum=0 |
| margemEsquerdaMm | number | sim | Margem. · minimum=0 |
| margemDireitaMm | number | sim | Margem. · minimum=0 |
| linhas | integer | sim | Linhas. · minimum=1; maximum=100 |
| colunas | integer | sim | Colunas. · minimum=1; maximum=100 |
| espacoHorizontalMm | number | sim | Entre colunas. · minimum=0 |
| espacoVerticalMm | number | sim | Entre linhas. · minimum=0 |
| ativo | boolean | sim | Formato habilitado. |

```json
{
  "nome": "Personalizado 60 x 25",
  "folhaLarguraMm": 210,
  "folhaAlturaMm": 297,
  "etiquetaLarguraMm": 60,
  "etiquetaAlturaMm": 25,
  "margemSuperiorMm": 10,
  "margemInferiorMm": 10,
  "margemEsquerdaMm": 10,
  "margemDireitaMm": 10,
  "linhas": 10,
  "colunas": 3,
  "espacoHorizontalMm": 5,
  "espacoVerticalMm": 2,
  "ativo": true
}
```

**Resposta 201:** Dados prontos para a tela, no alcance autorizado.

`application/json` · [FormatoEtiqueta](#schema-FormatoEtiqueta)

```json
{
  "id": "11111111-1111-4111-8111-111111111111",
  "versao": 1,
  "etag": "\"edicao-1\"",
  "nome": "Personalizado 60 x 25",
  "folhaLarguraMm": 210,
  "folhaAlturaMm": 297,
  "etiquetaLarguraMm": 60,
  "etiquetaAlturaMm": 25,
  "margemSuperiorMm": 10,
  "margemInferiorMm": 10,
  "margemEsquerdaMm": 10,
  "margemDireitaMm": 10,
  "linhas": 10,
  "colunas": 3,
  "espacoHorizontalMm": 5,
  "espacoVerticalMm": 2,
  "ativo": true,
  "origem": "personalizado",
  "codigoPimaco": "CODIGO-A-CONFERIR"
}
```

| Header retornado | Uso |
| --- | --- |
| Cache-Control | Sem cache público de dados pessoais/QR. |
| X-Request-Id | Correlação e cache. |
| ETag | Usar este ETag na edição do agregado indicado. |
| X-Activity-Id | Atividade do comando agregado, com seus detalhes por campo/vínculo. |

Erros: `400`, `401`, `403`, `409`, `422`, `429`, `500`, `503`. Ver [envelope e comportamento](README.md#erros).

<a id="patch_etiquetas_formatos_id"></a>
## PATCH /etiquetas/formatos/{id}

**Tela:** Salvar formato personalizado. **Ação:** Alterar ou inativar formato personalizado.

Somente formato personalizado; 409 em gabarito oficial. ETag já veio no editor. Não reescreve gerações anteriores nem altera calibração oficial silenciosamente.

Permissões: `etiquetas.formatos.editar`.

| Nome | Local | Obrigatório | Tipo | Uso |
| --- | --- | --- | --- | --- |
| id | path | sim | string (uuid) | Identificador interno UUID. |
| X-CSRF-Token | header | sim | string | Obrigatório nas chamadas autenticadas não GET; cookie HttpOnly é enviado automaticamente pelo navegador. |
| Idempotency-Key | header | sim | string | Mesma identidade+rota+chave+corpo não repete efeitos. Corpo alterado usa nova chave. |
| If-Match | header | sim | string | Versão do agregado/item especificado. 428 ausente, 412 desatualizado; não aceitar *. |

Entrada obrigatória `application/json`: [FormatoEtiquetaSalvar](#schema-FormatoEtiquetaSalvar).

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| nome | string | sim | Nome reutilizável. · minLength=1 |
| folhaLarguraMm | number | sim | Largura da folha. · minimum=1 |
| folhaAlturaMm | number | sim | Altura da folha. · minimum=1 |
| etiquetaLarguraMm | number | sim | Largura. · minimum=1 |
| etiquetaAlturaMm | number | sim | Altura. · minimum=1 |
| margemSuperiorMm | number | sim | Margem. · minimum=0 |
| margemInferiorMm | number | sim | Margem. · minimum=0 |
| margemEsquerdaMm | number | sim | Margem. · minimum=0 |
| margemDireitaMm | number | sim | Margem. · minimum=0 |
| linhas | integer | sim | Linhas. · minimum=1; maximum=100 |
| colunas | integer | sim | Colunas. · minimum=1; maximum=100 |
| espacoHorizontalMm | number | sim | Entre colunas. · minimum=0 |
| espacoVerticalMm | number | sim | Entre linhas. · minimum=0 |
| ativo | boolean | sim | Formato habilitado. |

```json
{
  "nome": "Personalizado 60 x 25",
  "folhaLarguraMm": 210,
  "folhaAlturaMm": 297,
  "etiquetaLarguraMm": 60,
  "etiquetaAlturaMm": 25,
  "margemSuperiorMm": 10,
  "margemInferiorMm": 10,
  "margemEsquerdaMm": 10,
  "margemDireitaMm": 10,
  "linhas": 10,
  "colunas": 3,
  "espacoHorizontalMm": 5,
  "espacoVerticalMm": 2,
  "ativo": true
}
```

**Resposta 200:** Dados prontos para a tela, no alcance autorizado.

`application/json` · [FormatoEtiqueta](#schema-FormatoEtiqueta)

```json
{
  "id": "11111111-1111-4111-8111-111111111111",
  "versao": 1,
  "etag": "\"edicao-1\"",
  "nome": "Personalizado 60 x 25",
  "folhaLarguraMm": 210,
  "folhaAlturaMm": 297,
  "etiquetaLarguraMm": 60,
  "etiquetaAlturaMm": 25,
  "margemSuperiorMm": 10,
  "margemInferiorMm": 10,
  "margemEsquerdaMm": 10,
  "margemDireitaMm": 10,
  "linhas": 10,
  "colunas": 3,
  "espacoHorizontalMm": 5,
  "espacoVerticalMm": 2,
  "ativo": true,
  "origem": "personalizado",
  "codigoPimaco": "CODIGO-A-CONFERIR"
}
```

| Header retornado | Uso |
| --- | --- |
| Cache-Control | Sem cache público de dados pessoais/QR. |
| X-Request-Id | Correlação e cache. |
| ETag | Usar este ETag na edição do agregado indicado. |
| X-Activity-Id | Atividade do comando agregado, com seus detalhes por campo/vínculo. |

Erros: `400`, `401`, `403`, `404`, `409`, `412`, `422`, `428`, `429`, `500`, `503`. Ver [envelope e comportamento](README.md#erros).

<a id="post_etiquetas_previas"></a>
## POST /etiquetas/previas

**Tela:** Prévia e impressão de etiquetas. **Ação:** Gerar PDF conferível e imprimível.

Um comando materializa seleção por IDs/pesquisa, valida endereços/layout/formato, renderiza PDF e registra emissão. Aceita modelo/formato em rascunho: sem POST prévio de seleção ou biblioteca. O mesmo PDF imutável é mostrado e impresso pelo navegador, sem outra geração/endpoint para dizer que imprimiu. Mudanças no editor pedem nova prévia; manter data do snapshot visível.

Permissões: `etiquetas.imprimir`.

| Nome | Local | Obrigatório | Tipo | Uso |
| --- | --- | --- | --- | --- |
| X-CSRF-Token | header | sim | string | Obrigatório nas chamadas autenticadas não GET; cookie HttpOnly é enviado automaticamente pelo navegador. |
| Idempotency-Key | header | sim | string | Mesma identidade+rota+chave+corpo não repete efeitos. Corpo alterado usa nova chave. |

Entrada obrigatória `application/json`: [PreviaEtiquetasCriar](#schema-PreviaEtiquetasCriar).

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| selecao | SelecaoEtiquetas | sim | Selecionar destinatários não exige persistir seleção no frontend. IDs ou pesquisa são materializados pelo backend no preview. |
| modelo | ModeloSalvoUsar \| ModeloRascunhoUsar | sim |  |
| formato | FormatoSalvoUsar \| FormatoRascunhoUsar | sim |  |
| posicaoInicial | integer | sim | Célula inicial, base 1, da primeira folha. · minimum=1 |
| copiasPorPessoa | integer | sim | Cópias por padrão. · minimum=1; maximum=100 |
| enderecosEscolhidos | array<object> | não | Lista de valores. · minItems=0; maxItems=100 |
| deslocamentoXMm | number | não | Calibração local; sem modificar gabarito oficial. |
| deslocamentoYMm | number | não | Calibração local. |

```json
{
  "selecao": {
    "tipo": "ids",
    "municipeIds": [
      "11111111-1111-4111-8111-111111111111"
    ]
  },
  "modelo": {
    "tipo": "salvo",
    "id": "11111111-1111-4111-8111-111111111111",
    "versao": 1
  },
  "formato": {
    "tipo": "salvo",
    "id": "11111111-1111-4111-8111-111111111111",
    "versao": 1
  },
  "posicaoInicial": 1,
  "copiasPorPessoa": 1,
  "enderecosEscolhidos": [
    {
      "municipeId": "11111111-1111-4111-8111-111111111111",
      "enderecoId": "11111111-1111-4111-8111-111111111111",
      "copias": 1
    }
  ],
  "deslocamentoXMm": 0,
  "deslocamentoYMm": 0
}
```

**Resposta 202:** Aceito para processamento; ainda não representa efeito externo concluído.

`application/json` · [Operacao](#schema-Operacao)

```json
{
  "id": "11111111-1111-4111-8111-111111111111",
  "tipo": "previa_etiquetas",
  "estado": "pendente",
  "progresso": 0,
  "podeCancelar": true,
  "resultado": null
}
```

| Header retornado | Uso |
| --- | --- |
| Cache-Control | Sem cache público de dados pessoais/QR. |
| X-Request-Id | Correlação e cache. |
| Location | URI de GET /operacoes/{id} para fallback de acompanhamento. |
| X-Activity-Id | Atividade do comando agregado, com seus detalhes por campo/vínculo. |

Erros: `400`, `401`, `403`, `409`, `422`, `429`, `500`, `503`. Ver [envelope e comportamento](README.md#erros).

O backend resolve nesta ação: materializar destinatários autorizados; resolver template/formato salvo ou rascunho; validar endereços/texto/grade e posição inicial; gerar PDF imutável e auditar emissão; devolver arquivo/quantidades pela operação.

<a id="get_historico"></a>
## GET /historico

**Tela:** Histórico global ou aba da ficha. **Ação:** Carregar atividades autorizadas.

Mesma listagem serve à aba filtrada por alvo ou ao histórico global; linha já tem autor/data/resumo/ação. Datas referem ao ocorrido. Versões substituídas não entram na busca geral de pessoas.

Permissões: `historico.ler`.

| Nome | Local | Obrigatório | Tipo | Uso |
| --- | --- | --- | --- | --- |
| limite | query | não | integer | Limite, máximo 100. |
| cursor | query | não | string | Retomar a página sem refazer consultas por item. |
| incluirTotal | query | não | boolean | Default false. |
| data | query | não | FiltroData | FiltroData codificado como JSON; a rota declara o campo temporal. |
| alvoTipo | query | não | enum: municipe, atendimento, conversa, formulario, etiqueta, usuario, configuracao | Tipo do registro. |
| alvoId | query | não | string (uuid) | Filtrar registro. |
| autorId | query | não | string (uuid) | Autor acessível. |

**Resposta 200:** Dados prontos para a tela, no alcance autorizado.

`application/json` · [HistoricoTela](#schema-HistoricoTela)

```json
{
  "dados": [
    {
      "id": "11111111-1111-4111-8111-111111111111",
      "acao": "municipe.atualizado",
      "alvoTipo": "municipe",
      "alvoId": "11111111-1111-4111-8111-111111111111",
      "autor": {
        "tipo": "usuario",
        "usuarioId": "11111111-1111-4111-8111-111111111111",
        "nome": "Operador Exemplo"
      },
      "ocorridoEm": "2026-11-16T17:00:00Z",
      "resumo": "Ficha atualizada.",
      "podeReverter": true
    }
  ],
  "paginacao": {
    "proximoCursor": null,
    "total": 1,
    "limite": 25
  }
}
```

| Header retornado | Uso |
| --- | --- |
| Cache-Control | Sem cache público de dados pessoais/QR. |
| X-Request-Id | Correlação e cache. |

Erros: `400`, `401`, `403`, `422`, `429`, `500`, `503`. Ver [envelope e comportamento](README.md#erros).

<a id="get_historico_id"></a>
## GET /historico/{id}

**Tela:** Detalhe e confirmação de reversão. **Ação:** Abrir diferenças e impacto de reverter.

O detalhe já calcula impacto/limitações e devolve token de revisão quando autorizado. Não obriga GET do registro, POST de prévia e outro GET só para mostrar o modal. Token vincula identidade e versões atuais; não concede acesso novo.

Permissões: `historico.ler`.

| Nome | Local | Obrigatório | Tipo | Uso |
| --- | --- | --- | --- | --- |
| id | path | sim | string (uuid) | Identificador interno UUID. |

**Resposta 200:** Dados prontos para a tela, no alcance autorizado.

`application/json` · [DetalheAtividade](#schema-DetalheAtividade)

```json
{
  "atividade": {
    "id": "11111111-1111-4111-8111-111111111111",
    "acao": "municipe.atualizado",
    "alvoTipo": "municipe",
    "alvoId": "11111111-1111-4111-8111-111111111111",
    "autor": {
      "tipo": "usuario",
      "usuarioId": "11111111-1111-4111-8111-111111111111",
      "nome": "Operador Exemplo"
    },
    "ocorridoEm": "2026-11-16T17:00:00Z",
    "resumo": "Ficha atualizada.",
    "podeReverter": true
  },
  "diferencas": [
    {
      "campo": "observacoes",
      "antes": "Texto anterior.",
      "depois": "Texto revisado."
    }
  ],
  "reversao": {
    "token": "revisao-opaca-exemplo",
    "expiraEm": "2026-11-16T17:00:00Z",
    "permitida": true,
    "impactos": [
      "Recompor os vínculos afetados, preservando histórico."
    ],
    "conflitos": []
  },
  "limitacoes": [
    "Mensagem entregue não pode ser recolhida."
  ]
}
```

| Header retornado | Uso |
| --- | --- |
| Cache-Control | Sem cache público de dados pessoais/QR. |
| X-Request-Id | Correlação e cache. |

Erros: `400`, `401`, `403`, `404`, `422`, `429`, `500`, `503`. Ver [envelope e comportamento](README.md#erros).

<a id="post_historico_id_reverter"></a>
## POST /historico/{id}/reverter

**Tela:** Detalhe e confirmação de reversão. **Ação:** Confirmar reversão revisada.

Recebe token do detalhe e motivo. Revalida versões/permissões/dependências, preserva alterações independentes e registra nova atividade. Efeitos externos consumados/bytes expirados têm limites; marcações restritas e grafo também revalidam suas regras. Não apaga atividade original.

Permissões: `historico.reverter`.

| Nome | Local | Obrigatório | Tipo | Uso |
| --- | --- | --- | --- | --- |
| id | path | sim | string (uuid) | Identificador interno UUID. |
| X-CSRF-Token | header | sim | string | Obrigatório nas chamadas autenticadas não GET; cookie HttpOnly é enviado automaticamente pelo navegador. |
| Idempotency-Key | header | sim | string | Mesma identidade+rota+chave+corpo não repete efeitos. Corpo alterado usa nova chave. |

Entrada obrigatória `application/json`: [ConfirmarReversao](#schema-ConfirmarReversao).

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| revisaoToken | string | sim | Já fornecido no detalhe aberto pelo usuário; não exige POST de prévia extra. |
| motivo | string | sim | Justificativa. · minLength=3 |

```json
{
  "revisaoToken": "revisao-opaca-exemplo",
  "motivo": "Correção conferida pela equipe."
}
```

**Resposta 200:** Dados prontos para a tela, no alcance autorizado.

`application/json` · [ResultadoReversao](#schema-ResultadoReversao)

```json
{
  "atividadeOriginalId": "11111111-1111-4111-8111-111111111111",
  "atividadeReversaoId": "11111111-1111-4111-8111-111111111111",
  "situacao": "concluida",
  "recursoAtualizado": {
    "id": "11111111-1111-4111-8111-111111111111",
    "rotulo": "Ana Exemplo",
    "ativo": true
  },
  "limitacoes": [
    "Download já realizado não é recolhido."
  ]
}
```

| Header retornado | Uso |
| --- | --- |
| Cache-Control | Sem cache público de dados pessoais/QR. |
| X-Request-Id | Correlação e cache. |
| X-Activity-Id | Atividade do comando agregado, com seus detalhes por campo/vínculo. |

Erros: `400`, `401`, `403`, `404`, `409`, `410`, `422`, `429`, `500`, `503`. Ver [envelope e comportamento](README.md#erros).

O backend resolve nesta ação: revalidar revisão e permissão da ação original; verificar dependências/retenção; aplicar inversão interna em transação; registrar compensação externa se aplicável; retornar resultado sem falsa confirmação.

<a id="get_administracao_catalogos_catalogo"></a>
## GET /administracao/catalogos/{catalogo}

**Tela:** Catálogo de classificações, serviços ou categorias. **Ação:** Abrir catálogo escolhido com ações e itens.

Só os três catálogos com editor real. A mesma UI usa nome/descrição/ativo; não é CRUD genérico para tabelas internas.

Permissões: `catalogos.ler`.

| Nome | Local | Obrigatório | Tipo | Uso |
| --- | --- | --- | --- | --- |
| catalogo | path | sim | enum: classificacoes, servicos, categorias | Catálogo com editor real. |
| limite | query | não | integer | Limite, máximo 100. |
| cursor | query | não | string | Retomar a página sem refazer consultas por item. |
| incluirTotal | query | não | boolean | Default false. |
| q | query | não | string | Filtro do catálogo. |
| incluirInativos | query | não | boolean | Default true nesta tela. |

**Resposta 200:** Dados prontos para a tela, no alcance autorizado.

`application/json` · [CatalogoTela](#schema-CatalogoTela)

```json
{
  "catalogo": "classificacoes",
  "dados": [
    {
      "id": "11111111-1111-4111-8111-111111111111",
      "versao": 1,
      "etag": "\"edicao-1\"",
      "nome": "Futebol",
      "descricao": "Grupo de futebol.",
      "ativo": true
    }
  ],
  "paginacao": {
    "proximoCursor": null,
    "total": 1,
    "limite": 25
  },
  "acoesPermitidas": [
    "criar"
  ]
}
```

| Header retornado | Uso |
| --- | --- |
| Cache-Control | Sem cache público de dados pessoais/QR. |
| X-Request-Id | Correlação e cache. |

Erros: `400`, `401`, `403`, `404`, `422`, `429`, `500`, `503`. Ver [envelope e comportamento](README.md#erros).

<a id="post_administracao_catalogos_catalogo"></a>
## POST /administracao/catalogos/{catalogo}

**Tela:** Catálogo ou modal dentro de formulário. **Ação:** Cadastrar opção e já selecioná-la no editor.

Retorna ID/rótulo/dados prontos. O modal de nova classificação pode acrescentar o resultado ao formulário local, que só criará o vínculo no Salvar da pessoa.

Permissões: `catalogos.editar`.

| Nome | Local | Obrigatório | Tipo | Uso |
| --- | --- | --- | --- | --- |
| catalogo | path | sim | enum: classificacoes, servicos, categorias | Catálogo com editor real. |
| X-CSRF-Token | header | sim | string | Obrigatório nas chamadas autenticadas não GET; cookie HttpOnly é enviado automaticamente pelo navegador. |
| Idempotency-Key | header | sim | string | Mesma identidade+rota+chave+corpo não repete efeitos. Corpo alterado usa nova chave. |

Entrada obrigatória `application/json`: [ItemCatalogoSalvar](#schema-ItemCatalogoSalvar).

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| nome | string | sim | Nome normalizado único no catálogo. · minLength=1 |
| descricao | string \| null | não | Descrição. |
| ativo | boolean | sim | Inativar preserva vínculos e impede novas escolhas. |

```json
{
  "nome": "Futebol",
  "descricao": "Grupo de futebol.",
  "ativo": true
}
```

**Resposta 201:** Dados prontos para a tela, no alcance autorizado.

`application/json` · [ItemCatalogo](#schema-ItemCatalogo)

```json
{
  "id": "11111111-1111-4111-8111-111111111111",
  "versao": 1,
  "etag": "\"edicao-1\"",
  "nome": "Futebol",
  "descricao": "Grupo de futebol.",
  "ativo": true
}
```

| Header retornado | Uso |
| --- | --- |
| Cache-Control | Sem cache público de dados pessoais/QR. |
| X-Request-Id | Correlação e cache. |
| ETag | Usar este ETag na edição do agregado indicado. |
| X-Activity-Id | Atividade do comando agregado, com seus detalhes por campo/vínculo. |

Erros: `400`, `401`, `403`, `404`, `409`, `422`, `429`, `500`, `503`. Ver [envelope e comportamento](README.md#erros).

<a id="patch_administracao_catalogos_catalogo_id"></a>
## PATCH /administracao/catalogos/{catalogo}/{id}

**Tela:** Catálogo de classificações, serviços ou categorias. **Ação:** Editar ou inativar item do catálogo.

If-Match do item da listagem. Inativar via ativo=false preserva vínculos e impede novas escolhas; não exige DELETE separado.

Permissões: `catalogos.editar`.

| Nome | Local | Obrigatório | Tipo | Uso |
| --- | --- | --- | --- | --- |
| catalogo | path | sim | enum: classificacoes, servicos, categorias | Catálogo com editor real. |
| id | path | sim | string (uuid) | Identificador interno UUID. |
| X-CSRF-Token | header | sim | string | Obrigatório nas chamadas autenticadas não GET; cookie HttpOnly é enviado automaticamente pelo navegador. |
| Idempotency-Key | header | sim | string | Mesma identidade+rota+chave+corpo não repete efeitos. Corpo alterado usa nova chave. |
| If-Match | header | sim | string | Versão do agregado/item especificado. 428 ausente, 412 desatualizado; não aceitar *. |

Entrada obrigatória `application/json`: [ItemCatalogoAlterar](#schema-ItemCatalogoAlterar).

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| nome | string | não | Nome normalizado único no catálogo. · minLength=1 |
| descricao | string \| null | não | Descrição. |
| ativo | boolean | não | Inativar preserva vínculos e impede novas escolhas. |

```json
{
  "nome": "Futebol",
  "descricao": "Grupo de futebol.",
  "ativo": true
}
```

**Resposta 200:** Dados prontos para a tela, no alcance autorizado.

`application/json` · [ItemCatalogo](#schema-ItemCatalogo)

```json
{
  "id": "11111111-1111-4111-8111-111111111111",
  "versao": 1,
  "etag": "\"edicao-1\"",
  "nome": "Futebol",
  "descricao": "Grupo de futebol.",
  "ativo": true
}
```

| Header retornado | Uso |
| --- | --- |
| Cache-Control | Sem cache público de dados pessoais/QR. |
| X-Request-Id | Correlação e cache. |
| ETag | Usar este ETag na edição do agregado indicado. |
| X-Activity-Id | Atividade do comando agregado, com seus detalhes por campo/vínculo. |

Erros: `400`, `401`, `403`, `404`, `409`, `412`, `422`, `428`, `429`, `500`, `503`. Ver [envelope e comportamento](README.md#erros).

<a id="get_administracao_acessos"></a>
## GET /administracao/acessos

**Tela:** Equipe, usuários e perfis. **Ação:** Montar administração de acessos.

Uma tela recebe usuários paginados, equipes/perfis com dados de edição e catálogo de permissões. Não precisa GET para cada usuário ou vínculo de equipe/perfil.

Permissões: `acessos.ler`.

| Nome | Local | Obrigatório | Tipo | Uso |
| --- | --- | --- | --- | --- |
| limite | query | não | integer | Limite, máximo 100. |
| cursor | query | não | string | Retomar a página sem refazer consultas por item. |
| incluirTotal | query | não | boolean | Default false. |
| q | query | não | string | Busca de usuários. |

**Resposta 200:** Dados prontos para a tela, no alcance autorizado.

`application/json` · [AcessosTela](#schema-AcessosTela)

```json
{
  "usuarios": [
    {
      "id": "11111111-1111-4111-8111-111111111111",
      "versao": 1,
      "etag": "\"edicao-1\"",
      "nome": "Operador Exemplo",
      "email": "operador@example.invalid",
      "perfilIds": [
        "11111111-1111-4111-8111-111111111111"
      ],
      "equipeIds": [
        "11111111-1111-4111-8111-111111111111"
      ],
      "ativo": true
    }
  ],
  "paginacao": {
    "proximoCursor": null,
    "total": 1,
    "limite": 25
  },
  "perfis": [
    {
      "id": "11111111-1111-4111-8111-111111111111",
      "versao": 1,
      "etag": "\"edicao-1\"",
      "nome": "Operador",
      "permissoes": [
        "municipes.ler"
      ],
      "escopo": "proprio",
      "camposRestritos": [
        "municipes.documentos"
      ],
      "ativo": true
    }
  ],
  "equipes": [
    {
      "id": "11111111-1111-4111-8111-111111111111",
      "versao": 1,
      "etag": "\"edicao-1\"",
      "nome": "Atendimento",
      "descricao": "Equipe de atendimento.",
      "ativa": true
    }
  ],
  "catalogoPermissoes": [
    {
      "codigo": "municipes.editar",
      "descricao": "Editar ficha no escopo concedido."
    }
  ]
}
```

| Header retornado | Uso |
| --- | --- |
| Cache-Control | Sem cache público de dados pessoais/QR. |
| X-Request-Id | Correlação e cache. |

Erros: `400`, `401`, `403`, `422`, `429`, `500`, `503`. Ver [envelope e comportamento](README.md#erros).

<a id="post_administracao_usuarios"></a>
## POST /administracao/usuarios

**Tela:** Formulário de usuário. **Ação:** Cadastrar usuário com perfis e equipes.

Um POST salva usuário e todas as associações, com senha inicial protegida. Não há POST de cada vínculo. Retorna linha pronta para atualizar a tela.

Permissões: `acessos.editar`.

| Nome | Local | Obrigatório | Tipo | Uso |
| --- | --- | --- | --- | --- |
| X-CSRF-Token | header | sim | string | Obrigatório nas chamadas autenticadas não GET; cookie HttpOnly é enviado automaticamente pelo navegador. |
| Idempotency-Key | header | sim | string | Mesma identidade+rota+chave+corpo não repete efeitos. Corpo alterado usa nova chave. |

Entrada obrigatória `application/json`: [UsuarioSalvar](#schema-UsuarioSalvar).

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| nome | string | sim | Nome. · minLength=1 |
| email | string (email) | sim | E-mail único de acesso. |
| senhaInicial | string | sim | Somente criação; segredo nunca retornado/auditado. · minLength=12; somente entrada; segredo não auditável em claro |
| perfilIds | array<string (uuid)> | sim | Lista de valores. · minItems=1; maxItems=100 |
| equipeIds | array<string (uuid)> | sim | Lista de valores. · minItems=0; maxItems=100 |
| ativo | boolean | sim | Desativar revoga acesso e novas notificações. |

```json
{
  "nome": "Operador Exemplo",
  "email": "operador@example.invalid",
  "senhaInicial": "senha-inicial-exemplo",
  "perfilIds": [
    "11111111-1111-4111-8111-111111111111"
  ],
  "equipeIds": [
    "11111111-1111-4111-8111-111111111111"
  ],
  "ativo": true
}
```

**Resposta 201:** Dados prontos para a tela, no alcance autorizado.

`application/json` · [Usuario](#schema-Usuario)

```json
{
  "id": "11111111-1111-4111-8111-111111111111",
  "versao": 1,
  "etag": "\"edicao-1\"",
  "nome": "Operador Exemplo",
  "email": "operador@example.invalid",
  "perfilIds": [
    "11111111-1111-4111-8111-111111111111"
  ],
  "equipeIds": [
    "11111111-1111-4111-8111-111111111111"
  ],
  "ativo": true
}
```

| Header retornado | Uso |
| --- | --- |
| Cache-Control | Sem cache público de dados pessoais/QR. |
| X-Request-Id | Correlação e cache. |
| ETag | Usar este ETag na edição do agregado indicado. |
| X-Activity-Id | Atividade do comando agregado, com seus detalhes por campo/vínculo. |

Erros: `400`, `401`, `403`, `409`, `422`, `429`, `500`, `503`. Ver [envelope e comportamento](README.md#erros).

<a id="patch_administracao_usuarios_id"></a>
## PATCH /administracao/usuarios/{id}

**Tela:** Formulário de usuário. **Ação:** Salvar usuário, perfis, equipes ou desativação.

Atualiza agregado de acesso em uma chamada. Desativar revoga sessões/novos alertas; não permite eliminar último administrador ou elevar autoridade do próprio executor.

Permissões: `acessos.editar`.

| Nome | Local | Obrigatório | Tipo | Uso |
| --- | --- | --- | --- | --- |
| id | path | sim | string (uuid) | Identificador interno UUID. |
| X-CSRF-Token | header | sim | string | Obrigatório nas chamadas autenticadas não GET; cookie HttpOnly é enviado automaticamente pelo navegador. |
| Idempotency-Key | header | sim | string | Mesma identidade+rota+chave+corpo não repete efeitos. Corpo alterado usa nova chave. |
| If-Match | header | sim | string | Versão do agregado/item especificado. 428 ausente, 412 desatualizado; não aceitar *. |

Entrada obrigatória `application/json`: [UsuarioAlterar](#schema-UsuarioAlterar).

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| nome | string | não | Nome. · minLength=1 |
| email | string (email) | não | E-mail único de acesso. |
| perfilIds | array<string (uuid)> | não | Lista de valores. · minItems=1; maxItems=100 |
| equipeIds | array<string (uuid)> | não | Lista de valores. · minItems=0; maxItems=100 |
| ativo | boolean | não | Desativar revoga acesso e novas notificações. |

```json
{
  "nome": "Operador Exemplo",
  "email": "operador@example.invalid",
  "perfilIds": [
    "11111111-1111-4111-8111-111111111111"
  ],
  "equipeIds": [
    "11111111-1111-4111-8111-111111111111"
  ],
  "ativo": true
}
```

**Resposta 200:** Dados prontos para a tela, no alcance autorizado.

`application/json` · [Usuario](#schema-Usuario)

```json
{
  "id": "11111111-1111-4111-8111-111111111111",
  "versao": 1,
  "etag": "\"edicao-1\"",
  "nome": "Operador Exemplo",
  "email": "operador@example.invalid",
  "perfilIds": [
    "11111111-1111-4111-8111-111111111111"
  ],
  "equipeIds": [
    "11111111-1111-4111-8111-111111111111"
  ],
  "ativo": true
}
```

| Header retornado | Uso |
| --- | --- |
| Cache-Control | Sem cache público de dados pessoais/QR. |
| X-Request-Id | Correlação e cache. |
| ETag | Usar este ETag na edição do agregado indicado. |
| X-Activity-Id | Atividade do comando agregado, com seus detalhes por campo/vínculo. |

Erros: `400`, `401`, `403`, `404`, `409`, `412`, `422`, `428`, `429`, `500`, `503`. Ver [envelope e comportamento](README.md#erros).

<a id="post_administracao_usuarios_id_senha"></a>
## POST /administracao/usuarios/{id}/senha

**Tela:** Recuperação de acesso pela equipe. **Ação:** Definir senha temporária por administrador.

Ação administrativa explícita com motivo; revoga sessões e exige troca no próximo login. Não retorna senha antiga nem audita segredos.

Permissões: `acessos.redefinir_senha`.

| Nome | Local | Obrigatório | Tipo | Uso |
| --- | --- | --- | --- | --- |
| id | path | sim | string (uuid) | Identificador interno UUID. |
| X-CSRF-Token | header | sim | string | Obrigatório nas chamadas autenticadas não GET; cookie HttpOnly é enviado automaticamente pelo navegador. |
| Idempotency-Key | header | sim | string | Mesma identidade+rota+chave+corpo não repete efeitos. Corpo alterado usa nova chave. |
| If-Match | header | sim | string | Versão do agregado/item especificado. 428 ausente, 412 desatualizado; não aceitar *. |

Entrada obrigatória `application/json`: [SenhaAdministrativa](#schema-SenhaAdministrativa).

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| novaSenhaTemporaria | string | sim | Segredo; exigir troca no próximo login. · minLength=12; somente entrada; segredo não auditável em claro |
| motivo | string | sim | Justificativa. · minLength=3 |

```json
{
  "novaSenhaTemporaria": "senha-temporaria-exemplo",
  "motivo": "Recuperação de acesso conferida."
}
```

**Resposta 204:** Operação concluída, sem corpo.

| Header retornado | Uso |
| --- | --- |
| Cache-Control | Sem cache público de dados pessoais/QR. |
| X-Request-Id | Correlação e cache. |
| X-Activity-Id | Atividade do comando agregado, com seus detalhes por campo/vínculo. |

Erros: `400`, `401`, `403`, `404`, `409`, `412`, `422`, `428`, `429`, `500`, `503`. Ver [envelope e comportamento](README.md#erros).

<a id="post_administracao_perfis"></a>
## POST /administracao/perfis

**Tela:** Equipe, usuários e perfis. **Ação:** Cadastrar perfil de acesso.

Formulário real de administração; retorna item completo para atualizar a tela. Validar autoridade do executor e referências.

Permissões: `acessos.editar`.

| Nome | Local | Obrigatório | Tipo | Uso |
| --- | --- | --- | --- | --- |
| X-CSRF-Token | header | sim | string | Obrigatório nas chamadas autenticadas não GET; cookie HttpOnly é enviado automaticamente pelo navegador. |
| Idempotency-Key | header | sim | string | Mesma identidade+rota+chave+corpo não repete efeitos. Corpo alterado usa nova chave. |

Entrada obrigatória `application/json`: [PerfilSalvar](#schema-PerfilSalvar).

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| nome | string | sim | Nome do perfil. · minLength=1 |
| permissoes | array<string> | sim | Lista de valores. · minItems=0; maxItems=100 |
| escopo | enum: proprio, equipe, global | sim | Alcance máximo, com verificação de campo adicional. |
| camposRestritos | array<string> | sim | Lista de valores. · minItems=0; maxItems=100 |
| ativo | boolean | sim | Perfil habilitado. |

```json
{
  "nome": "Operador",
  "permissoes": [
    "municipes.ler"
  ],
  "escopo": "proprio",
  "camposRestritos": [
    "municipes.documentos"
  ],
  "ativo": true
}
```

**Resposta 201:** Dados prontos para a tela, no alcance autorizado.

`application/json` · [Perfil](#schema-Perfil)

```json
{
  "id": "11111111-1111-4111-8111-111111111111",
  "versao": 1,
  "etag": "\"edicao-1\"",
  "nome": "Operador",
  "permissoes": [
    "municipes.ler"
  ],
  "escopo": "proprio",
  "camposRestritos": [
    "municipes.documentos"
  ],
  "ativo": true
}
```

| Header retornado | Uso |
| --- | --- |
| Cache-Control | Sem cache público de dados pessoais/QR. |
| X-Request-Id | Correlação e cache. |
| ETag | Usar este ETag na edição do agregado indicado. |
| X-Activity-Id | Atividade do comando agregado, com seus detalhes por campo/vínculo. |

Erros: `400`, `401`, `403`, `409`, `422`, `429`, `500`, `503`. Ver [envelope e comportamento](README.md#erros).

<a id="patch_administracao_perfis_id"></a>
## PATCH /administracao/perfis/{id}

**Tela:** Equipe, usuários e perfis. **Ação:** Salvar ou inativar perfil de acesso.

If-Match já veio na tela. Inativar preserva vínculos; capacidade/responsabilidades e último caminho de administração são verificados antes de confirmar.

Permissões: `acessos.editar`.

| Nome | Local | Obrigatório | Tipo | Uso |
| --- | --- | --- | --- | --- |
| id | path | sim | string (uuid) | Identificador interno UUID. |
| X-CSRF-Token | header | sim | string | Obrigatório nas chamadas autenticadas não GET; cookie HttpOnly é enviado automaticamente pelo navegador. |
| Idempotency-Key | header | sim | string | Mesma identidade+rota+chave+corpo não repete efeitos. Corpo alterado usa nova chave. |
| If-Match | header | sim | string | Versão do agregado/item especificado. 428 ausente, 412 desatualizado; não aceitar *. |

Entrada obrigatória `application/json`: [PerfilSalvar](#schema-PerfilSalvar).

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| nome | string | sim | Nome do perfil. · minLength=1 |
| permissoes | array<string> | sim | Lista de valores. · minItems=0; maxItems=100 |
| escopo | enum: proprio, equipe, global | sim | Alcance máximo, com verificação de campo adicional. |
| camposRestritos | array<string> | sim | Lista de valores. · minItems=0; maxItems=100 |
| ativo | boolean | sim | Perfil habilitado. |

```json
{
  "nome": "Operador",
  "permissoes": [
    "municipes.ler"
  ],
  "escopo": "proprio",
  "camposRestritos": [
    "municipes.documentos"
  ],
  "ativo": true
}
```

**Resposta 200:** Dados prontos para a tela, no alcance autorizado.

`application/json` · [Perfil](#schema-Perfil)

```json
{
  "id": "11111111-1111-4111-8111-111111111111",
  "versao": 1,
  "etag": "\"edicao-1\"",
  "nome": "Operador",
  "permissoes": [
    "municipes.ler"
  ],
  "escopo": "proprio",
  "camposRestritos": [
    "municipes.documentos"
  ],
  "ativo": true
}
```

| Header retornado | Uso |
| --- | --- |
| Cache-Control | Sem cache público de dados pessoais/QR. |
| X-Request-Id | Correlação e cache. |
| ETag | Usar este ETag na edição do agregado indicado. |
| X-Activity-Id | Atividade do comando agregado, com seus detalhes por campo/vínculo. |

Erros: `400`, `401`, `403`, `404`, `409`, `412`, `422`, `428`, `429`, `500`, `503`. Ver [envelope e comportamento](README.md#erros).

<a id="post_administracao_equipes"></a>
## POST /administracao/equipes

**Tela:** Equipe, usuários e perfis. **Ação:** Cadastrar equipe.

Formulário real de administração; retorna item completo para atualizar a tela. Validar autoridade do executor e referências.

Permissões: `acessos.editar`.

| Nome | Local | Obrigatório | Tipo | Uso |
| --- | --- | --- | --- | --- |
| X-CSRF-Token | header | sim | string | Obrigatório nas chamadas autenticadas não GET; cookie HttpOnly é enviado automaticamente pelo navegador. |
| Idempotency-Key | header | sim | string | Mesma identidade+rota+chave+corpo não repete efeitos. Corpo alterado usa nova chave. |

Entrada obrigatória `application/json`: [EquipeSalvar](#schema-EquipeSalvar).

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| nome | string | sim | Nome. · minLength=1 |
| descricao | string \| null | não | Descrição. |
| ativa | boolean | sim | Habilitada para novas atribuições. |

```json
{
  "nome": "Atendimento",
  "descricao": "Equipe de atendimento.",
  "ativa": true
}
```

**Resposta 201:** Dados prontos para a tela, no alcance autorizado.

`application/json` · [Equipe](#schema-Equipe)

```json
{
  "id": "11111111-1111-4111-8111-111111111111",
  "versao": 1,
  "etag": "\"edicao-1\"",
  "nome": "Atendimento",
  "descricao": "Equipe de atendimento.",
  "ativa": true
}
```

| Header retornado | Uso |
| --- | --- |
| Cache-Control | Sem cache público de dados pessoais/QR. |
| X-Request-Id | Correlação e cache. |
| ETag | Usar este ETag na edição do agregado indicado. |
| X-Activity-Id | Atividade do comando agregado, com seus detalhes por campo/vínculo. |

Erros: `400`, `401`, `403`, `409`, `422`, `429`, `500`, `503`. Ver [envelope e comportamento](README.md#erros).

<a id="patch_administracao_equipes_id"></a>
## PATCH /administracao/equipes/{id}

**Tela:** Equipe, usuários e perfis. **Ação:** Salvar ou inativar equipe.

If-Match já veio na tela. Inativar preserva vínculos; capacidade/responsabilidades e último caminho de administração são verificados antes de confirmar.

Permissões: `acessos.editar`.

| Nome | Local | Obrigatório | Tipo | Uso |
| --- | --- | --- | --- | --- |
| id | path | sim | string (uuid) | Identificador interno UUID. |
| X-CSRF-Token | header | sim | string | Obrigatório nas chamadas autenticadas não GET; cookie HttpOnly é enviado automaticamente pelo navegador. |
| Idempotency-Key | header | sim | string | Mesma identidade+rota+chave+corpo não repete efeitos. Corpo alterado usa nova chave. |
| If-Match | header | sim | string | Versão do agregado/item especificado. 428 ausente, 412 desatualizado; não aceitar *. |

Entrada obrigatória `application/json`: [EquipeSalvar](#schema-EquipeSalvar).

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| nome | string | sim | Nome. · minLength=1 |
| descricao | string \| null | não | Descrição. |
| ativa | boolean | sim | Habilitada para novas atribuições. |

```json
{
  "nome": "Atendimento",
  "descricao": "Equipe de atendimento.",
  "ativa": true
}
```

**Resposta 200:** Dados prontos para a tela, no alcance autorizado.

`application/json` · [Equipe](#schema-Equipe)

```json
{
  "id": "11111111-1111-4111-8111-111111111111",
  "versao": 1,
  "etag": "\"edicao-1\"",
  "nome": "Atendimento",
  "descricao": "Equipe de atendimento.",
  "ativa": true
}
```

| Header retornado | Uso |
| --- | --- |
| Cache-Control | Sem cache público de dados pessoais/QR. |
| X-Request-Id | Correlação e cache. |
| ETag | Usar este ETag na edição do agregado indicado. |
| X-Activity-Id | Atividade do comando agregado, com seus detalhes por campo/vínculo. |

Erros: `400`, `401`, `403`, `404`, `409`, `412`, `422`, `428`, `429`, `500`, `503`. Ver [envelope e comportamento](README.md#erros).

<a id="get_administracao_configuracoes"></a>
## GET /administracao/configuracoes

**Tela:** Configurações do gabinete. **Ação:** Carregar formulário de configurações autorizado.

Blocos institucionais, contato, WhatsApp, limites, sexo e retenção na mesma resposta; sem credenciais de fornecedores expostas.

Permissões: `configuracoes.ler`.

**Resposta 200:** Dados prontos para a tela, no alcance autorizado.

`application/json` · [ConfiguracoesTela](#schema-ConfiguracoesTela)

```json
{
  "id": "11111111-1111-4111-8111-111111111111",
  "versao": 1,
  "etag": "\"edicao-1\"",
  "formulario": {
    "institucional": {
      "nome": "Gabinete Exemplo",
      "descricaoPublica": "Atendimento à comunidade.",
      "contatoPublico": "contato@example.invalid"
    },
    "contato": {
      "janelaDias": 90,
      "diasRetomada": 90,
      "intervaloTentativasDias": 7
    },
    "whatsapp": {
      "limiarQuedaSegundos": 60,
      "maxTentativasAutomaticas": 3,
      "politicaIa": "assistida"
    },
    "retencao": {
      "recuperacaoExclusaoDias": 90,
      "rascunhosDias": 7,
      "documentosGeradosHoras": 24
    },
    "limites": {
      "maxUploadBytes": 26214400,
      "maxArquivosPorLote": 10,
      "maxAudioSegundos": 600,
      "maxObservacaoCaracteres": 100000,
      "mimeTypes": [
        "application/pdf"
      ],
      "maxItensPorColecao": 100,
      "maxDestinatariosEtiquetas": 5000
    },
    "sexos": [
      {
        "codigo": "nao_informado",
        "rotulo": "Não informado",
        "ativo": true
      }
    ]
  },
  "permissoes": {
    "acoes": [
      "salvar"
    ],
    "camposEditaveis": [
      "contatos"
    ]
  }
}
```

| Header retornado | Uso |
| --- | --- |
| Cache-Control | Sem cache público de dados pessoais/QR. |
| X-Request-Id | Correlação e cache. |
| ETag | Usar este ETag na edição do agregado indicado. |

Erros: `400`, `401`, `403`, `422`, `429`, `500`, `503`. Ver [envelope e comportamento](README.md#erros).

<a id="patch_administracao_configuracoes"></a>
## PATCH /administracao/configuracoes

**Tela:** Configurações do gabinete. **Ação:** Salvar blocos alterados em uma ação.

If-Match do agregado. Omitidos permanecem; validar conjunto, acesso por bloco e auditoria. Alterar retenção não dispara expurgo definitivo por si só. Valores operacionais nos exemplos são propostas.

Permissões: `configuracoes.editar`.

| Nome | Local | Obrigatório | Tipo | Uso |
| --- | --- | --- | --- | --- |
| X-CSRF-Token | header | sim | string | Obrigatório nas chamadas autenticadas não GET; cookie HttpOnly é enviado automaticamente pelo navegador. |
| Idempotency-Key | header | sim | string | Mesma identidade+rota+chave+corpo não repete efeitos. Corpo alterado usa nova chave. |
| If-Match | header | sim | string | Versão do agregado/item especificado. 428 ausente, 412 desatualizado; não aceitar *. |

Entrada obrigatória `application/json`: [ConfiguracoesAlterar](#schema-ConfiguracoesAlterar).

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| institucional | object | não |  |
| contato | object | não |  |
| whatsapp | object | não |  |
| retencao | object | não |  |
| limites | Limites | não | Limites |
| sexos | array<object> | não | Lista de valores. · minItems=0; maxItems=100 |

```json
{
  "institucional": {
    "nome": "Gabinete Exemplo",
    "descricaoPublica": "Atendimento à comunidade.",
    "contatoPublico": "contato@example.invalid"
  },
  "contato": {
    "janelaDias": 90,
    "diasRetomada": 90,
    "intervaloTentativasDias": 7
  },
  "whatsapp": {
    "limiarQuedaSegundos": 60,
    "maxTentativasAutomaticas": 3,
    "politicaIa": "assistida"
  },
  "retencao": {
    "recuperacaoExclusaoDias": 90,
    "rascunhosDias": 7,
    "documentosGeradosHoras": 24
  },
  "limites": {
    "maxUploadBytes": 26214400,
    "maxArquivosPorLote": 10,
    "maxAudioSegundos": 600,
    "maxObservacaoCaracteres": 100000,
    "mimeTypes": [
      "application/pdf"
    ],
    "maxItensPorColecao": 100,
    "maxDestinatariosEtiquetas": 5000
  },
  "sexos": [
    {
      "codigo": "nao_informado",
      "rotulo": "Não informado",
      "ativo": true
    }
  ]
}
```

**Resposta 200:** Dados prontos para a tela, no alcance autorizado.

`application/json` · [ConfiguracoesTela](#schema-ConfiguracoesTela)

```json
{
  "id": "11111111-1111-4111-8111-111111111111",
  "versao": 1,
  "etag": "\"edicao-1\"",
  "formulario": {
    "institucional": {
      "nome": "Gabinete Exemplo",
      "descricaoPublica": "Atendimento à comunidade.",
      "contatoPublico": "contato@example.invalid"
    },
    "contato": {
      "janelaDias": 90,
      "diasRetomada": 90,
      "intervaloTentativasDias": 7
    },
    "whatsapp": {
      "limiarQuedaSegundos": 60,
      "maxTentativasAutomaticas": 3,
      "politicaIa": "assistida"
    },
    "retencao": {
      "recuperacaoExclusaoDias": 90,
      "rascunhosDias": 7,
      "documentosGeradosHoras": 24
    },
    "limites": {
      "maxUploadBytes": 26214400,
      "maxArquivosPorLote": 10,
      "maxAudioSegundos": 600,
      "maxObservacaoCaracteres": 100000,
      "mimeTypes": [
        "application/pdf"
      ],
      "maxItensPorColecao": 100,
      "maxDestinatariosEtiquetas": 5000
    },
    "sexos": [
      {
        "codigo": "nao_informado",
        "rotulo": "Não informado",
        "ativo": true
      }
    ]
  },
  "permissoes": {
    "acoes": [
      "salvar"
    ],
    "camposEditaveis": [
      "contatos"
    ]
  }
}
```

| Header retornado | Uso |
| --- | --- |
| Cache-Control | Sem cache público de dados pessoais/QR. |
| X-Request-Id | Correlação e cache. |
| ETag | Usar este ETag na edição do agregado indicado. |
| X-Activity-Id | Atividade do comando agregado, com seus detalhes por campo/vínculo. |

Erros: `400`, `401`, `403`, `409`, `412`, `422`, `428`, `429`, `500`, `503`. Ver [envelope e comportamento](README.md#erros).

<a id="get_atendimentos_id_mensagens"></a>
## GET /atendimentos/{id}/mensagens

**Tela:** Mensagens vinculadas ao pedido. **Ação:** Carregar mais mensagens do protocolo.

A ficha já entrega a primeira página. Este GET só carrega páginas seguintes/aba extensa, com contexto e mídias prontos; não expõe a conversa familiar inteira.

Permissões: `atendimentos.ler`, `conversas.ler`.

| Nome | Local | Obrigatório | Tipo | Uso |
| --- | --- | --- | --- | --- |
| id | path | sim | string (uuid) | Identificador interno UUID. |
| limite | query | não | integer | Limite, máximo 100. |
| cursor | query | não | string | Retomar a página sem refazer consultas por item. |
| incluirTotal | query | não | boolean | Default false. |

**Resposta 200:** Dados prontos para a tela, no alcance autorizado.

`application/json` · [MensagensAtendimento](#schema-MensagensAtendimento)

```json
{
  "dados": [
    {
      "id": "11111111-1111-4111-8111-111111111111",
      "chaveCliente": "msg-local-1",
      "direcao": "entrada",
      "texto": "Gostaria de saber o andamento.",
      "arquivos": [
        {
          "id": "11111111-1111-4111-8111-111111111111",
          "nome": "foto-exemplo.jpg",
          "mimeType": "image/jpeg",
          "tamanhoBytes": 1024,
          "url": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo",
          "miniaturaUrl": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo?variante=miniatura"
        }
      ],
      "ocorridoEm": "2026-11-16T17:00:00Z",
      "estadoEnvio": "recebida",
      "atendimentos": [
        {
          "id": "11111111-1111-4111-8111-111111111111",
          "rotulo": "Ana Exemplo",
          "ativo": true
        }
      ]
    }
  ],
  "paginacao": {
    "proximoCursor": null,
    "total": 1,
    "limite": 25
  }
}
```

| Header retornado | Uso |
| --- | --- |
| Cache-Control | Sem cache público de dados pessoais/QR. |
| X-Request-Id | Correlação e cache. |

Erros: `400`, `401`, `403`, `404`, `422`, `429`, `500`, `503`. Ver [envelope e comportamento](README.md#erros).

## Dicionário dos payloads utilizados

Somente schemas alcançáveis pelas operações. O JSON completo explicita variantes exclusivas e regras condicionais.

<a id="schema-ErroCampo"></a>
### ErroCampo

ErroCampo

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| campo | string | sim | Caminho exato no formulário, inclusive chave de item. |
| codigo | string | sim | Código estável. |
| mensagem | string | sim | Mensagem para exibir junto ao campo. |

<a id="schema-Opcao"></a>
### Opcao

Opcao

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| id | string (uuid) | sim | Identificador interno UUID. |
| rotulo | string | sim | Nome pronto para select/autocomplete. |
| ativo | boolean | sim | Opção habilitada para novas escolhas. |

<a id="schema-Pagina"></a>
### Pagina

Pagina

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| proximoCursor | string \| null | sim | Cursor opaco da mesma pesquisa/identidade. |
| total | integer \| null | sim | Total de registros autorizados, se solicitado. |
| limite | integer | sim | Limite aplicado. · minimum=1; maximum=100 |

<a id="schema-CandidatoDuplicidade"></a>
### CandidatoDuplicidade

CandidatoDuplicidade

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| pessoa | Opcao | sim | Opcao |
| motivos | array<string> | sim | Lista de valores. · minItems=0; maxItems=100 |
| resumo | string | sim | Dados permitidos para reconhecer o candidato sem abrir várias fichas. |

<a id="schema-Problema"></a>
### Problema

Problema

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| type | string (uri) | sim | Tipo do problema. |
| title | string | sim | Título. |
| status | integer | sim | HTTP correspondente. · minimum=400; maximum=599 |
| detail | string | sim | Orientação segura. |
| codigo | string | sim | Código de domínio. |
| requestId | string | sim | Correlação. |
| erros | array<ErroCampo> | não | Lista de valores. · minItems=0; maxItems=100 |
| revisaoDuplicidadeToken | string | não | Somente em 409 de duplicidade interno; vinculado ao formulário e à identidade. |
| candidatos | array<CandidatoDuplicidade> | não | Lista de valores. · minItems=0; maxItems=100 |
| etagAtual | string | não | Só se o recurso ainda é acessível; o front recarrega/compara sem sobrescrever. |
| alternativasCampos | array<object> | não | Somente quando o erro interno exige escolher uma alternativa autorizada, como endereço ambíguo na etiqueta. · minItems=0; maxItems=100 |

<a id="schema-DataComponentes"></a>
### DataComponentes

DataComponentes

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| modo | enum: componentes | sim | Modo exclusivo. |
| dia | integer | não | Dia isolado ou combinado. · minimum=1; maximum=31 |
| mes | integer | não | Mês sem impor ano atual. · minimum=1; maximum=12 |
| ano | integer | não | Ano isolado ou combinado. · minimum=1; maximum=9999 |

```json
{
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "modo": {
      "type": "string",
      "description": "Modo exclusivo.",
      "examples": [
        "componentes"
      ],
      "enum": [
        "componentes"
      ]
    },
    "dia": {
      "type": "integer",
      "description": "Dia isolado ou combinado.",
      "minimum": 1,
      "examples": [
        15
      ],
      "maximum": 31
    },
    "mes": {
      "type": "integer",
      "description": "Mês sem impor ano atual.",
      "minimum": 1,
      "examples": [
        11
      ],
      "maximum": 12
    },
    "ano": {
      "type": "integer",
      "description": "Ano isolado ou combinado.",
      "minimum": 1,
      "examples": [
        1990
      ],
      "maximum": 9999
    }
  },
  "anyOf": [
    {
      "required": [
        "dia"
      ]
    },
    {
      "required": [
        "mes"
      ]
    },
    {
      "required": [
        "ano"
      ]
    }
  ],
  "required": [
    "modo"
  ],
  "description": "DataComponentes"
}
```

<a id="schema-DataIntervalo"></a>
### DataIntervalo

DataIntervalo

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| modo | enum: intervalo | sim | Modo exclusivo. |
| de | string (date) | não | Início inclusivo, opcional se ate for informado. |
| ate | string (date) | não | Fim inclusivo, opcional se de for informado. |

```json
{
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "modo": {
      "type": "string",
      "description": "Modo exclusivo.",
      "examples": [
        "intervalo"
      ],
      "enum": [
        "intervalo"
      ]
    },
    "de": {
      "type": "string",
      "description": "Início inclusivo, opcional se ate for informado.",
      "examples": [
        "1990-11-15"
      ],
      "format": "date"
    },
    "ate": {
      "type": "string",
      "description": "Fim inclusivo, opcional se de for informado.",
      "examples": [
        "1990-11-15"
      ],
      "format": "date"
    }
  },
  "anyOf": [
    {
      "required": [
        "de"
      ]
    },
    {
      "required": [
        "ate"
      ]
    }
  ],
  "required": [
    "modo"
  ],
  "description": "DataIntervalo"
}
```

<a id="schema-DataAusente"></a>
### DataAusente

DataAusente

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| modo | enum: nao_informado | sim | Ausência real de data. |

<a id="schema-FiltroData"></a>
### FiltroData

Reutilizado em toda pesquisa temporal. Validar datas e de<=ate. Data civil sem fuso; timestamp inclui o dia final inteiro no fuso informado.

```json
{
  "description": "Reutilizado em toda pesquisa temporal. Validar datas e de<=ate. Data civil sem fuso; timestamp inclui o dia final inteiro no fuso informado.",
  "oneOf": [
    {
      "$ref": "#/components/schemas/DataComponentes"
    },
    {
      "$ref": "#/components/schemas/DataIntervalo"
    },
    {
      "$ref": "#/components/schemas/DataAusente"
    }
  ]
}
```

<a id="schema-PermissoesTela"></a>
### PermissoesTela

PermissoesTela

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| acoes | array<string> | sim | Lista de valores. · minItems=0; maxItems=100 |
| camposEditaveis | array<string> | sim | Lista de valores. · minItems=0; maxItems=100 |

<a id="schema-Preferencias"></a>
### Preferencias

Preferencias

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| ocultarFotosMunicipes | boolean | sim | Preferência pessoal; não apaga imagens. |
| fusoHorario | string | sim | Fuso IANA. |
| receberAlertasWhatsapp | boolean | sim | Depende também da permissão e inscrição do dispositivo. |

<a id="schema-Disponibilidade"></a>
### Disponibilidade

Disponibilidade

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| estado | enum: disponivel, pausado, ausente | sim | Disponibilidade declarada, não presença online. |
| capacidade | integer | sim | Conversas simultâneas permitidas pela política. · minimum=1; maximum=50 |

<a id="schema-Conta"></a>
### Conta

Conta

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| id | string (uuid) | sim | Identificador interno UUID. |
| versao | integer | sim | Versão informativa do agregado; usar o ETag opaco retornado, sem montá-lo no frontend. · minimum=1 |
| etag | string | sim | Token de edição já disponível também em listas e comparações; usar literalmente em If-Match. |
| nome | string | sim | Usuário atual. |
| email | string (email) | sim | E-mail. |
| preferencias | Preferencias | sim | Preferencias |
| disponibilidade | Disponibilidade | sim | Disponibilidade |

<a id="schema-Limites"></a>
### Limites

Limites

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| maxUploadBytes | integer | sim | Limite configurável proposto. · minimum=1 |
| maxArquivosPorLote | integer | sim | Upload de vários arquivos em uma chamada. · minimum=1 |
| maxAudioSegundos | integer | sim | Duração máxima proposta. · minimum=1 |
| maxObservacaoCaracteres | integer | sim | Limite longo explícito. · minimum=1 |
| mimeTypes | array<string> | sim | Lista de valores. · minItems=0; maxItems=100 |
| maxItensPorColecao | integer | não | Limite operacional de itens ativos por bloco editável do formulário; histórico permanece paginado. · minimum=1 |
| maxDestinatariosEtiquetas | integer | não | Limite proposto por emissão de etiquetas. · minimum=1 |

<a id="schema-ContextoFormulario"></a>
### ContextoFormulario

Dados de montagem do editor. Opções grandes usam /opcoes ao pesquisar, sem CRUD prévio de vínculos.

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| sexos | array<object> | não | Lista de valores. · minItems=0; maxItems=100 |
| tiposDocumento | array<enum: cpf, rg, outro> | não | Lista de valores. · minItems=0; maxItems=100 |
| classificacoesIniciais | array<Opcao> | não | Lista de valores. · minItems=0; maxItems=100 |
| responsaveisIniciais | array<Opcao> | não | Lista de valores. · minItems=0; maxItems=100 |
| servicosIniciais | array<Opcao> | não | Lista de valores. · minItems=0; maxItems=100 |
| limites | Limites | sim | Limites |
| permissoes | PermissoesTela | sim | PermissoesTela |

<a id="schema-App"></a>
### App

App

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| conta | Conta | sim | Conta |
| etagConta | string | sim | ETag de PATCH /conta; já disponível no bootstrap. |
| csrfToken | string | sim | Token anti-CSRF de sessão, legível pelo front. A sessão HttpOnly permanece no cookie. |
| permissoes | array<string> | sim | Lista de valores. · minItems=0; maxItems=100 |
| menu | array<string> | sim | Lista de valores. · minItems=0; maxItems=100 |
| limites | Limites | sim | Limites |
| notificacoesNaoLidas | integer | sim | Badge inicial. · minimum=0 |
| avisosWhatsapp | array<string> | sim | Lista de valores. · minItems=0; maxItems=100 |

<a id="schema-Login"></a>
### Login

Login

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| email | string (email) | sim | E-mail de acesso. |
| senha | string | sim | Segredo; não auditar em claro. · minLength=8; somente entrada; segredo não auditável em claro |

<a id="schema-ContaAlterar"></a>
### ContaAlterar

Salvar preferências/disponibilidade em uma ação; blocos omitidos permanecem.

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| preferencias | Preferencias | não | Preferencias |
| disponibilidade | Disponibilidade | não | Disponibilidade |

<a id="schema-SenhaAlterar"></a>
### SenhaAlterar

SenhaAlterar

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| senhaAtual | string | sim | Senha atual. · somente entrada; segredo não auditável em claro |
| novaSenha | string | sim | Nova senha. · minLength=12; somente entrada; segredo não auditável em claro |

<a id="schema-ArquivoResumo"></a>
### ArquivoResumo

ArquivoResumo

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| id | string (uuid) | sim | Identificador interno UUID. |
| nome | string | sim | Nome seguro. |
| mimeType | string | sim | MIME detectado. |
| tamanhoBytes | integer | sim | Tamanho. · minimum=0 |
| url | string | sim | URL protegida por cookie, pronta para <img>, player ou download. |
| miniaturaUrl | string \| null | não | Quando suportada; não exige outro GET de metadados. |

<a id="schema-ArquivoLote"></a>
### ArquivoLote

ArquivoLote

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| chave | string | sim | Chave local estável do item do formulário. |
| indice | integer | sim | Índice da parte binária arquivos[], base zero. · minimum=0 |
| uso | enum: foto_municipe, anexo_atendimento, midia_mensagem | sim | Finalidade validada pelo backend. |

<a id="schema-ManifestoUpload"></a>
### ManifestoUpload

ManifestoUpload

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| rascunhoId | string (uuid) | sim | UUID do rascunho criado pelo frontend, não uma pessoa incompleta. |
| arquivos | array<ArquivoLote> | sim | Lista de valores. · minItems=1; maxItems=10 |

<a id="schema-UploadLote"></a>
### UploadLote

UploadLote

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| metadados | ManifestoUpload | sim | ManifestoUpload |
| arquivos | array<string (binary)> | sim | Lista de valores. · minItems=1; maxItems=10 |

<a id="schema-UploadPronto"></a>
### UploadPronto

UploadPronto

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| chave | string | sim | Eco da chave local, para preencher o mesmo item do formulário. |
| uploadToken | string | sim | Referência temporária opaca, vinculada ao usuário/rascunho/uso; consumida no salvar agregado. |
| expiraEm | string (date-time) | sim | Instante em UTC; apresentação no fuso da interface. |
| arquivo | ArquivoResumo | sim | ArquivoResumo |

<a id="schema-UploadsProntos"></a>
### UploadsProntos

UploadsProntos

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| rascunhoId | string (uuid) | sim | Identificador interno UUID. |
| arquivos | array<UploadPronto> | sim | Lista de valores. · minItems=1; maxItems=100 |

<a id="schema-ContatoFormulario"></a>
### ContatoFormulario

ContatoFormulario

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| chave | string | sim | Chave local única do item, também em erros de campo. |
| id | string (uuid) | não | ID do vínculo existente, se já salvo; deve pertencer ao munícipe. |
| tipo | enum: telefone, email | sim | Meio compartilhável entre pessoas. |
| valor | string | sim | Valor informado; backend normaliza e cria/reutiliza o meio. · minLength=1 |
| relacao | string \| null | não | Titularidade/parentesco conhecido. |
| principal | boolean | sim | Preferência desta pessoa. |

<a id="schema-EnderecoFormulario"></a>
### EnderecoFormulario

EnderecoFormulario

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| chave | string | sim | Chave local única. |
| id | string (uuid) | não | ID existente desta pessoa, opcional para novo item. |
| logradouro | string | sim | Logradouro. · minLength=1 |
| numero | string \| null | não | Número ou s/n. |
| complemento | string \| null | não | Complemento. |
| bairro | string \| null | não | Bairro. |
| cidade | string | sim | Cidade. · minLength=1 |
| uf | string | sim | UF. · pattern=^[A-Z]{2}$ |
| cep | string \| null | não | Oito dígitos. |
| principal | boolean | sim | Um principal por pessoa. |

<a id="schema-DocumentoFormulario"></a>
### DocumentoFormulario

DocumentoFormulario

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| chave | string | sim | Chave local única. |
| id | string (uuid) | não | ID existente, se houver. |
| tipo | enum: outro, cpf, rg | sim | Documento sempre opcional no cadastro. |
| valor | string | sim | Valor validado conforme o tipo. · minLength=1 |
| orgaoEmissor | string \| null | não | Órgão opcional. |

<a id="schema-FotoFormulario"></a>
### FotoFormulario

FotoFormulario

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| chave | string | sim | Chave local única. |
| id | string (uuid) | não | Foto já vinculada a esta pessoa. |
| uploadToken | string | não | Token pronto obtido no upload em lote; não exige criar pessoa antes. · somente entrada; segredo não auditável em claro |
| legenda | string \| null | não | Descrição acessível. |
| principal | boolean | sim | Uma principal; a posição no array define a ordem. |

```json
{
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "chave": {
      "type": "string",
      "description": "Chave local única.",
      "examples": [
        "foto-1"
      ]
    },
    "id": {
      "type": "string",
      "description": "Foto já vinculada a esta pessoa.",
      "examples": [
        "11111111-1111-4111-8111-111111111111"
      ],
      "format": "uuid"
    },
    "uploadToken": {
      "type": "string",
      "description": "Token pronto obtido no upload em lote; não exige criar pessoa antes.",
      "examples": [
        "upload-opaco-exemplo"
      ],
      "writeOnly": true
    },
    "legenda": {
      "anyOf": [
        {
          "type": "string",
          "description": "Descrição acessível.",
          "examples": [
            "Foto de reconhecimento."
          ]
        },
        {
          "type": "null"
        }
      ],
      "description": "Descrição acessível."
    },
    "principal": {
      "type": "boolean",
      "description": "Uma principal; a posição no array define a ordem.",
      "examples": [
        true
      ]
    }
  },
  "oneOf": [
    {
      "required": [
        "id"
      ],
      "not": {
        "required": [
          "uploadToken"
        ]
      }
    },
    {
      "required": [
        "uploadToken"
      ],
      "not": {
        "required": [
          "id"
        ]
      }
    }
  ],
  "required": [
    "chave",
    "principal"
  ],
  "description": "FotoFormulario",
  "examples": [
    {
      "chave": "foto-1",
      "uploadToken": "upload-opaco-exemplo",
      "legenda": "Foto de reconhecimento.",
      "principal": true
    }
  ]
}
```

<a id="schema-OrigemTranscricao"></a>
### OrigemTranscricao

OrigemTranscricao

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| transcricaoId | string (uuid) | sim | Operação do mesmo usuário/rascunho/pessoa. |
| trechoAceito | string | sim | Trecho revisado que já integra observacoes. Backend não o acrescenta de novo. · minLength=1 |

<a id="schema-PreferenciaContato"></a>
### PreferenciaContato

PreferenciaContato

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| permitirProativo | boolean | sim | Preferência, sem impedir resposta a solicitação iniciada pela pessoa. |

<a id="schema-DadosMunicipe"></a>
### DadosMunicipe

Valores do formulário. Campo/bloco ausente no PATCH preserva. Coleção presente substitui o conjunto editável somente se o usuário pode gerenciá-lo integralmente; nunca remove itens ocultos por falta de acesso.

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| nome | string | sim | Nome informado, sem documento obrigatório. · minLength=1; maxLength=200 |
| sexoCodigo | string \| null | não | Informação declarada opcional. |
| nascimento | string (date) \| null | não | Data civil no formato AAAA-MM-DD, sem conversão de fuso. |
| observacoes | string \| null | não | Texto final completo do editor, inclusive digitação ainda não salva e trecho transcrito revisado. |
| contatos | array<ContatoFormulario> | não | Lista de valores. · minItems=0; maxItems=100 |
| enderecos | array<EnderecoFormulario> | não | Lista de valores. · minItems=0; maxItems=100 |
| documentos | array<DocumentoFormulario> | não | Lista de valores. · minItems=0; maxItems=100 |
| classificacaoIds | array<string (uuid)> | não | Lista de valores. · minItems=0; maxItems=100 |
| indicadoPorMunicipeId | string (uuid) \| null | não | Outro munícipe existente ou null; valida ciclos sob concorrência. |
| votoGarantido | boolean | não | Anotação manual restrita. False é não marcado; sem inferência/verificação ou uso para comunicação. |
| preferenciaContato | PreferenciaContato | não | PreferenciaContato |
| fotos | array<FotoFormulario> | não | Lista de valores. · minItems=0; maxItems=100 |
| transcricoesUtilizadas | array<OrigemTranscricao> | não | Lista de valores. · minItems=0; maxItems=100 |

<a id="schema-DecisaoDuplicidade"></a>
### DecisaoDuplicidade

DecisaoDuplicidade

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| revisaoToken | string | sim | Retornado pelo erro 409 do próprio salvar, sem etapa de verificação obrigatória. |
| confirmarPessoaDistinta | boolean | sim | Decisão humana explícita, revalidada na gravação. · const=True |
| motivo | string | sim | Justificativa. · minLength=3 |

<a id="schema-ContextoConversaSalvar"></a>
### ContextoConversaSalvar

ContextoConversaSalvar

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| conversaId | string (uuid) | sim | Identificador interno UUID. |
| etagConversa | string | sim | ETag já entregue pelo workspace; revalidar na transação. |

<a id="schema-CadastroMunicipe"></a>
### CadastroMunicipe

Um POST salva pessoa, meios normalizados, todos os vínculos, fotos e contexto opcional. Não exige chamadas prévias de criação de contatos/endereços/documentos.

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| nome | string | sim | Nome informado, sem documento obrigatório. · minLength=1; maxLength=200 |
| sexoCodigo | string \| null | não | Informação declarada opcional. |
| nascimento | string (date) \| null | não | Data civil no formato AAAA-MM-DD, sem conversão de fuso. |
| observacoes | string \| null | não | Texto final completo do editor, inclusive digitação ainda não salva e trecho transcrito revisado. |
| contatos | array<ContatoFormulario> | não | Lista de valores. · minItems=0; maxItems=100 |
| enderecos | array<EnderecoFormulario> | não | Lista de valores. · minItems=0; maxItems=100 |
| documentos | array<DocumentoFormulario> | não | Lista de valores. · minItems=0; maxItems=100 |
| classificacaoIds | array<string (uuid)> | não | Lista de valores. · minItems=0; maxItems=100 |
| indicadoPorMunicipeId | string (uuid) \| null | não | Outro munícipe existente ou null; valida ciclos sob concorrência. |
| votoGarantido | boolean | não | Anotação manual restrita. False é não marcado; sem inferência/verificação ou uso para comunicação. |
| preferenciaContato | PreferenciaContato | não | PreferenciaContato |
| fotos | array<FotoFormulario> | não | Lista de valores. · minItems=0; maxItems=100 |
| transcricoesUtilizadas | array<OrigemTranscricao> | não | Lista de valores. · minItems=0; maxItems=100 |
| rascunhoId | string (uuid) | não | Necessário se houver uploads/transcrições do formulário. |
| decisaoDuplicidade | DecisaoDuplicidade | não | DecisaoDuplicidade |
| contextoConversa | ContextoConversaSalvar | não | ContextoConversaSalvar |

<a id="schema-EditarMunicipe"></a>
### EditarMunicipe

PATCH agregado: um clique Salvar, uma transação. Omitir campos sem permissão; envio de campo proibido é rejeitado, não ignorado.

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| nome | string | não | Nome informado, sem documento obrigatório. · minLength=1; maxLength=200 |
| sexoCodigo | string \| null | não | Informação declarada opcional. |
| nascimento | string (date) \| null | não | Data civil no formato AAAA-MM-DD, sem conversão de fuso. |
| observacoes | string \| null | não | Texto final completo do editor, inclusive digitação ainda não salva e trecho transcrito revisado. |
| contatos | array<ContatoFormulario> | não | Lista de valores. · minItems=0; maxItems=100 |
| enderecos | array<EnderecoFormulario> | não | Lista de valores. · minItems=0; maxItems=100 |
| documentos | array<DocumentoFormulario> | não | Lista de valores. · minItems=0; maxItems=100 |
| classificacaoIds | array<string (uuid)> | não | Lista de valores. · minItems=0; maxItems=100 |
| indicadoPorMunicipeId | string (uuid) \| null | não | Outro munícipe existente ou null; valida ciclos sob concorrência. |
| votoGarantido | boolean | não | Anotação manual restrita. False é não marcado; sem inferência/verificação ou uso para comunicação. |
| preferenciaContato | PreferenciaContato | não | PreferenciaContato |
| fotos | array<FotoFormulario> | não | Lista de valores. · minItems=0; maxItems=100 |
| transcricoesUtilizadas | array<OrigemTranscricao> | não | Lista de valores. · minItems=0; maxItems=100 |
| rascunhoId | string (uuid) | não | Identificador interno UUID. |
| decisaoDuplicidade | DecisaoDuplicidade | não | DecisaoDuplicidade |
| motivoAlteracao | string | não | Justificativa quando necessária à ação. |

<a id="schema-MunicipeResumo"></a>
### MunicipeResumo

MunicipeResumo

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| id | string (uuid) | sim | Identificador interno UUID. |
| nome | string | sim | Nome autorizado. |
| bairro | string \| null | não | Bairro permitido. |
| contatoPrincipal | string \| null | não | Contato permitido. |
| foto | ArquivoResumo \| null | não | Valor opcional; null significa ausência. |
| arquivado | boolean | sim | Situação lógica. |

<a id="schema-ResumoContato"></a>
### ResumoContato

ResumoContato

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| ultimaInteracaoEm | string (date-time) \| null | sim | Instante em UTC; apresentação no fuso da interface. |
| diasSemContato | integer \| null | sim | Null quando não há evidência. |
| janelaDias | integer | sim | Janela configurada, exemplo proposto. · minimum=1 |
| diasComInteracao | integer | sim | Dias distintos, não mensagens fragmentadas. · minimum=0 |
| mensagensRecebidas | integer | sim | Volume separado. · minimum=0 |
| mensagensEnviadas | integer | sim | Volume de saída. · minimum=0 |
| atendimentos | integer | sim | Quantidade de pedidos. · minimum=0 |
| ultimaTentativaEm | string (date-time) \| null | não | Instante em UTC; apresentação no fuso da interface. |
| cobertura | enum: disponivel, incompleto, acesso_parcial | sim | Não tratar histórico parcial como nunca ter havido contato. |

<a id="schema-CorrespondenciaBusca"></a>
### CorrespondenciaBusca

CorrespondenciaBusca

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| campo | string | sim | Onde encontrou, já autorizado. |
| trecho | string | sim | Trecho permitido. |
| atendimentoId | string (uuid) \| null | não | Identificador interno UUID. |

<a id="schema-LinhaMunicipe"></a>
### LinhaMunicipe

LinhaMunicipe

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| pessoa | MunicipeResumo | sim | MunicipeResumo |
| classificacoes | array<Opcao> | sim | Lista de valores. · minItems=0; maxItems=100 |
| contato | ResumoContato | sim | ResumoContato |
| correspondencias | array<CorrespondenciaBusca> | sim | Lista de valores. · minItems=0; maxItems=100 |
| acoesPermitidas | array<string> | sim | Lista de valores. · minItems=0; maxItems=100 |

<a id="schema-FiltroAtendimento"></a>
### FiltroAtendimento

Todos os critérios coincidem no mesmo atendimento.

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| existe | boolean | não | Existência de um pedido que cumpre todos os critérios. |
| situacoes | array<enum: aberto, em_andamento, aguardando_informacao, encaminhado, concluido, cancelado> | não | Lista de valores. · minItems=0; maxItems=100 |
| servicoIds | array<string (uuid)> | não | Lista de valores. · minItems=0; maxItems=100 |
| responsavelIds | array<string (uuid)> | não | Lista de valores. · minItems=0; maxItems=100 |
| abertura | FiltroData | não | Reutilizado em toda pesquisa temporal. Validar datas e de<=ate. Data civil sem fuso; timestamp inclui o dia final inteiro no fuso informado. |
| conclusao | FiltroData | não | Reutilizado em toda pesquisa temporal. Validar datas e de<=ate. Data civil sem fuso; timestamp inclui o dia final inteiro no fuso informado. |

<a id="schema-FiltrosMunicipes"></a>
### FiltrosMunicipes

Grupos com E; múltiplos valores com OU, salvo classificações=todas. Sem filtro de anotação manual de voto.

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| sexoCodigos | array<string> | não | Lista de valores. · minItems=0; maxItems=100 |
| nascimento | FiltroData | não | Reutilizado em toda pesquisa temporal. Validar datas e de<=ate. Data civil sem fuso; timestamp inclui o dia final inteiro no fuso informado. |
| cadastro | FiltroData | não | Reutilizado em toda pesquisa temporal. Validar datas e de<=ate. Data civil sem fuso; timestamp inclui o dia final inteiro no fuso informado. |
| classificacaoIds | array<string (uuid)> | não | Lista de valores. · minItems=0; maxItems=100 |
| classificacaoModo | enum: qualquer, todas | não | Como combinar classificações. |
| semClassificacao | boolean | não | Não combinar true com IDs de classificação. |
| incluirClassificacoesInativas | boolean | não | Incluir vínculos preservados explicitamente. |
| bairro | string | não | Bairro. |
| cidade | string | não | Cidade. |
| uf | string | não | UF. |
| cep | string | não | CEP normalizado. |
| logradouro | string | não | Logradouro. |
| documento | string | não | Documento autorizado. |
| contato | string | não | Telefone/e-mail compartilhável. |
| atendimento | FiltroAtendimento | não | Todos os critérios coincidem no mesmo atendimento. |
| semInteracaoRegistrada | boolean | não | Ausência na cobertura autorizada. |
| diasSemContatoMin | integer | não | Mínimo inclusivo, sem incluir ausência de histórico. · minimum=0 |
| diasSemContatoMax | integer | não | Máximo inclusivo. · minimum=0 |
| diasComInteracaoMin | integer | não | Frequência na janela configurada. · minimum=0 |
| ultimaInteracao | FiltroData | não | Reutilizado em toda pesquisa temporal. Validar datas e de<=ate. Data civil sem fuso; timestamp inclui o dia final inteiro no fuso informado. |
| proximoContato | FiltroData | não | Reutilizado em toda pesquisa temporal. Validar datas e de<=ate. Data civil sem fuso; timestamp inclui o dia final inteiro no fuso informado. |
| arquivado | boolean | não | Default false. |
| fusoHorario | string | não | Fuso IANA para timestamps. |

<a id="schema-PesquisaMunicipes"></a>
### PesquisaMunicipes

Usado pela lista e pelo relatório; mesma consulta, sem endpoints duplicados.

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| q | string | não | Busca em dados atuais e atendimentos autorizados, com origem da coincidência. · maxLength=500 |
| filtros | FiltrosMunicipes | não | Grupos com E; múltiplos valores com OU, salvo classificações=todas. Sem filtro de anotação manual de voto. |
| cursor | string | não | Cursor retornado para esta consulta. |
| limite | integer | não | Default 25, máximo 100. · minimum=1; maximum=100 |
| incluirTotal | boolean | não | Solicitar total autorizado. |
| ordenarPor | enum: nome, nascimento, cadastradoEm, ultimaInteracaoEm, diasSemContato, diasComInteracao, quantidadeAtendimentos | não | Ordenação permitida desta lista/relatório, sem campos restritos. |
| direcao | enum: asc, desc | não | Sentido. |

<a id="schema-ResultadoPesquisaMunicipes"></a>
### ResultadoPesquisaMunicipes

ResultadoPesquisaMunicipes

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| dados | array<LinhaMunicipe> | sim | Lista de valores. · minItems=0; maxItems=100 |
| paginacao | Pagina | sim | Pagina |
| resumoFiltros | array<string> | sim | Lista de valores. · minItems=0; maxItems=100 |

<a id="schema-FormularioMunicipe"></a>
### FormularioMunicipe

FormularioMunicipe

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| valoresIniciais | RascunhoMunicipe | sim | Valores iniciais permitidos; campos ainda não preenchidos podem estar ausentes. |
| contexto | ContextoFormulario | sim | Dados de montagem do editor. Opções grandes usam /opcoes ao pesquisar, sem CRUD prévio de vínculos. |
| conversaOrigem | ContextoConversaSalvar \| null | não | Valor opcional; null significa ausência. |

<a id="schema-FichaMunicipe"></a>
### FichaMunicipe

Tudo para montar a ficha e editar sem buscar cada contato/endereço/classificação. Históricos longos são paginados sob demanda. Campos restritos são omitidos, sem tratar omissão como null.

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| id | string (uuid) | sim | Identificador interno UUID. |
| versao | integer | sim | Versão informativa do agregado; usar o ETag opaco retornado, sem montá-lo no frontend. · minimum=1 |
| etag | string | sim | Token de edição já disponível também em listas e comparações; usar literalmente em If-Match. |
| pessoa | MunicipeResumo | sim | MunicipeResumo |
| formulario | DadosMunicipe | sim | Valores do formulário. Campo/bloco ausente no PATCH preserva. Coleção presente substitui o conjunto editável somente se o usuário pode gerenciá-lo integralmente; nunca remove itens ocultos por falta de acesso. |
| referencias | object | sim |  |
| fotos | array<ArquivoResumo> | não | Lista de valores. · minItems=0; maxItems=100 |
| contextoEdicao | ContextoFormulario | sim | Dados de montagem do editor. Opções grandes usam /opcoes ao pesquisar, sem CRUD prévio de vínculos. |
| resumoContato | ResumoContato | sim | ResumoContato |
| atendimentosRecentes | array<AtendimentoResumo> | sim | Lista de valores. · minItems=0; maxItems=5 |
| atividadesRecentes | array<AtividadeResumo> | sim | Lista de valores. · minItems=0; maxItems=5 |
| marcacaoVotoAtualizadaEm | string (date-time) \| null | não | Instante em UTC; apresentação no fuso da interface. |
| marcacaoVotoAtualizadaPor | Opcao \| null | não | Valor opcional; null significa ausência. |
| conversaAtualizada | ConversaResumo \| null | não | Valor opcional; null significa ausência. |

<a id="schema-SolicitanteExistente"></a>
### SolicitanteExistente

SolicitanteExistente

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| tipo | enum: existente | sim | Pessoa já cadastrada. |
| municipeId | string (uuid) | sim | Identificador interno UUID. |

<a id="schema-SolicitanteNovo"></a>
### SolicitanteNovo

SolicitanteNovo

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| tipo | enum: novo | sim | Criar pessoa completa no mesmo salvar do atendimento. |
| cadastro | CadastroMunicipe | sim | Um POST salva pessoa, meios normalizados, todos os vínculos, fotos e contexto opcional. Não exige chamadas prévias de criação de contatos/endereços/documentos. |

<a id="schema-PessoaSelecionada"></a>
### PessoaSelecionada

Pessoa definitiva existente ou nova completa inline.

```json
{
  "oneOf": [
    {
      "$ref": "#/components/schemas/SolicitanteExistente"
    },
    {
      "$ref": "#/components/schemas/SolicitanteNovo"
    }
  ],
  "description": "Pessoa definitiva existente ou nova completa inline."
}
```

<a id="schema-SolicitantePendente"></a>
### SolicitantePendente

Exige contatoInformado ou contextoConversa no pedido. Resolver a pessoa depois pelo mesmo salvar agregado.

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| tipo | enum: a_identificar | sim | Identidade ainda não confirmada; não cria pessoa fictícia. |
| contatoInformado | object | não |  |

<a id="schema-Solicitante"></a>
### Solicitante

Não obriga salvar pessoa antes; novo cadastro e pedido são transacionais. Identidade desconhecida permanece a identificar com contato/conversa, sem inventar pessoa.

```json
{
  "oneOf": [
    {
      "$ref": "#/components/schemas/SolicitanteExistente"
    },
    {
      "$ref": "#/components/schemas/SolicitanteNovo"
    },
    {
      "$ref": "#/components/schemas/SolicitantePendente"
    }
  ],
  "description": "Não obriga salvar pessoa antes; novo cadastro e pedido são transacionais. Identidade desconhecida permanece a identificar com contato/conversa, sem inventar pessoa."
}
```

<a id="schema-ServicoFormulario"></a>
### ServicoFormulario

ServicoFormulario

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| chave | string | sim | Chave local para anexos apontarem a este item antes de existir ID. |
| id | string (uuid) | não | Execução já existente neste atendimento. |
| tipoServicoId | string (uuid) | sim | Opção já selecionada; backend cria a execução. |
| responsavelId | string (uuid) \| null | não | Identificador interno UUID. |
| ocorridoEm | string (date-time) | sim | Instante em UTC; apresentação no fuso da interface. |
| situacao | enum: planejado, em_execucao, encaminhado, concluido, cancelado | sim | Estado da execução, diferente do pedido. |
| encaminhamento | string \| null | não | Destino. |
| resultado | string \| null | não | Desfecho da ação. |

<a id="schema-PendenciaFormulario"></a>
### PendenciaFormulario

PendenciaFormulario

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| chave | string | sim | Chave local. |
| id | string (uuid) | não | Pendência existente neste atendimento. |
| descricao | string | sim | Próxima ação. · minLength=1 |
| responsavelId | string (uuid) \| null | não | Identificador interno UUID. |
| venceEm | string (date-time) \| null | não | Instante em UTC; apresentação no fuso da interface. |
| situacao | enum: aberta, concluida, cancelada | sim | Estado do item. |
| resultado | string \| null | não | Resultado ao concluir. |

<a id="schema-AnexoFormulario"></a>
### AnexoFormulario

AnexoFormulario

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| chave | string | sim | Chave local. |
| id | string (uuid) | não | Vínculo de anexo já pertencente ao atendimento. |
| uploadToken | string | não | Novo arquivo pronto do lote, em vez de criar vínculo antecipadamente. · somente entrada; segredo não auditável em claro |
| execucaoChave | string \| null | não | Chave do serviço no mesmo formulário; backend resolve o novo ID. |
| descricao | string \| null | não | Descrição. |
| mensagemOrigemId | string (uuid) \| null | não | Identificador interno UUID. |

```json
{
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "chave": {
      "type": "string",
      "description": "Chave local.",
      "examples": [
        "anexo-1"
      ]
    },
    "id": {
      "type": "string",
      "description": "Vínculo de anexo já pertencente ao atendimento.",
      "examples": [
        "11111111-1111-4111-8111-111111111111"
      ],
      "format": "uuid"
    },
    "uploadToken": {
      "type": "string",
      "description": "Novo arquivo pronto do lote, em vez de criar vínculo antecipadamente.",
      "examples": [
        "upload-anexo-exemplo"
      ],
      "writeOnly": true
    },
    "execucaoChave": {
      "anyOf": [
        {
          "type": "string",
          "description": "Chave do serviço no mesmo formulário; backend resolve o novo ID.",
          "examples": [
            "servico-1"
          ]
        },
        {
          "type": "null"
        }
      ],
      "description": "Chave do serviço no mesmo formulário; backend resolve o novo ID."
    },
    "descricao": {
      "anyOf": [
        {
          "type": "string",
          "description": "Descrição.",
          "examples": [
            "Comprovante apresentado."
          ]
        },
        {
          "type": "null"
        }
      ],
      "description": "Descrição."
    },
    "mensagemOrigemId": {
      "anyOf": [
        {
          "type": "string",
          "description": "Identificador interno UUID.",
          "examples": [
            "11111111-1111-4111-8111-111111111111"
          ],
          "format": "uuid"
        },
        {
          "type": "null"
        }
      ],
      "description": "Identificador interno UUID."
    }
  },
  "oneOf": [
    {
      "required": [
        "id"
      ],
      "not": {
        "required": [
          "uploadToken"
        ]
      }
    },
    {
      "required": [
        "uploadToken"
      ],
      "not": {
        "required": [
          "id"
        ]
      }
    }
  ],
  "required": [
    "chave"
  ],
  "description": "AnexoFormulario",
  "examples": [
    {
      "chave": "anexo-1",
      "uploadToken": "upload-anexo-exemplo",
      "execucaoChave": "servico-1",
      "descricao": "Comprovante apresentado."
    }
  ]
}
```

<a id="schema-NotaFormulario"></a>
### NotaFormulario

NotaFormulario

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| chave | string | sim | Chave local. |
| id | string (uuid) | não | Nota existente editável neste atendimento. |
| texto | string | sim | Nota interna, não enviada ao WhatsApp. · minLength=1 |

<a id="schema-AtendimentoDados"></a>
### AtendimentoDados

Coleções dentro do mesmo salvar. Ausentes no PATCH permanecem; presentes substituem apenas conjuntos integralmente editáveis.

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| titulo | string | sim | Resumo. · minLength=1 |
| descricao | string | sim | Demanda completa. · minLength=1 |
| canal | enum: presencial, telefone, whatsapp, email, outro | sim | Origem. |
| categoriaId | string (uuid) \| null | não | Identificador interno UUID. |
| responsavelId | string (uuid) \| null | não | Identificador interno UUID. |
| prazo | string (date-time) \| null | não | Instante em UTC; apresentação no fuso da interface. |
| situacao | enum: aberto, em_andamento, aguardando_informacao, encaminhado, concluido, cancelado | não | Concluir exige resultado; backend valida transições. |
| resultado | string \| null | não | Resultado do pedido. |
| servicos | array<ServicoFormulario> | não | Lista de valores. · minItems=0; maxItems=100 |
| pendencias | array<PendenciaFormulario> | não | Lista de valores. · minItems=0; maxItems=100 |
| anexos | array<AnexoFormulario> | não | Lista de valores. · minItems=0; maxItems=100 |
| notas | array<NotaFormulario> | não | Lista de valores. · minItems=0; maxItems=100 |

<a id="schema-ContextoPedidoConversa"></a>
### ContextoPedidoConversa

ContextoPedidoConversa

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| conversaId | string (uuid) | sim | Identificador interno UUID. |
| etagConversa | string | sim | Já disponível no workspace. |
| mensagemIds | array<string (uuid)> | sim | Mensagens pertinentes, não todo histórico familiar. · minItems=1; maxItems=100 |

<a id="schema-CriarAtendimento"></a>
### CriarAtendimento

Uma transação salva solicitante novo (se houver), pedido, execuções, pendências, notas, anexos e vínculos de mensagens.

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| titulo | string | sim | Resumo. · minLength=1 |
| descricao | string | sim | Demanda completa. · minLength=1 |
| canal | enum: presencial, telefone, whatsapp, email, outro | sim | Origem. |
| categoriaId | string (uuid) \| null | não | Identificador interno UUID. |
| responsavelId | string (uuid) \| null | não | Identificador interno UUID. |
| prazo | string (date-time) \| null | não | Instante em UTC; apresentação no fuso da interface. |
| situacao | enum: aberto, em_andamento, aguardando_informacao, encaminhado, concluido, cancelado | não | Concluir exige resultado; backend valida transições. |
| resultado | string \| null | não | Resultado do pedido. |
| servicos | array<ServicoFormulario> | não | Lista de valores. · minItems=0; maxItems=100 |
| pendencias | array<PendenciaFormulario> | não | Lista de valores. · minItems=0; maxItems=100 |
| anexos | array<AnexoFormulario> | não | Lista de valores. · minItems=0; maxItems=100 |
| notas | array<NotaFormulario> | não | Lista de valores. · minItems=0; maxItems=100 |
| solicitante | Solicitante | sim | Não obriga salvar pessoa antes; novo cadastro e pedido são transacionais. Identidade desconhecida permanece a identificar com contato/conversa, sem inventar pessoa. |
| rascunhoId | string (uuid) | não | Identificador interno UUID. |
| contextoConversa | ContextoPedidoConversa | não | ContextoPedidoConversa |

<a id="schema-EditarAtendimento"></a>
### EditarAtendimento

Salvar edição/conclusão e coleções em uma chamada; não exige PATCH de cada serviço/pendência/anexo.

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| titulo | string | não | Resumo. · minLength=1 |
| descricao | string | não | Demanda completa. · minLength=1 |
| canal | enum: presencial, telefone, whatsapp, email, outro | não | Origem. |
| categoriaId | string (uuid) \| null | não | Identificador interno UUID. |
| responsavelId | string (uuid) \| null | não | Identificador interno UUID. |
| prazo | string (date-time) \| null | não | Instante em UTC; apresentação no fuso da interface. |
| situacao | enum: aberto, em_andamento, aguardando_informacao, encaminhado, concluido, cancelado | não | Concluir exige resultado; backend valida transições. |
| resultado | string \| null | não | Resultado do pedido. |
| servicos | array<ServicoFormulario> | não | Lista de valores. · minItems=0; maxItems=100 |
| pendencias | array<PendenciaFormulario> | não | Lista de valores. · minItems=0; maxItems=100 |
| anexos | array<AnexoFormulario> | não | Lista de valores. · minItems=0; maxItems=100 |
| notas | array<NotaFormulario> | não | Lista de valores. · minItems=0; maxItems=100 |
| corrigirSolicitante | object | não |  |
| rascunhoId | string (uuid) | não | Identificador interno UUID. |
| motivoAlteracao | string | não | Obrigatório ao concluir/reabrir/corrigir estado conforme a ação. · minLength=3 |

<a id="schema-AtendimentoResumo"></a>
### AtendimentoResumo

AtendimentoResumo

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| id | string (uuid) | sim | Identificador interno UUID. |
| protocolo | string | sim | Gerado no servidor. |
| titulo | string | sim | Resumo. |
| situacao | enum: aberto, em_andamento, aguardando_informacao, encaminhado, concluido, cancelado | sim | Estado. |
| pessoa | Opcao \| null | sim | Valor opcional; null significa ausência. |
| responsavel | Opcao \| null | não | Valor opcional; null significa ausência. |
| abertoEm | string (date-time) | sim | Instante em UTC; apresentação no fuso da interface. |
| prazo | string (date-time) \| null | não | Instante em UTC; apresentação no fuso da interface. |
| acoesPermitidas | array<string> | sim | Lista de valores. · minItems=0; maxItems=100 |
| identidadePendente | boolean | não | Contato/conversa ainda sem pessoa confirmada. |

<a id="schema-FichaAtendimento"></a>
### FichaAtendimento

FichaAtendimento

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| id | string (uuid) | sim | Identificador interno UUID. |
| versao | integer | sim | Versão informativa do agregado; usar o ETag opaco retornado, sem montá-lo no frontend. · minimum=1 |
| etag | string | sim | Token de edição já disponível também em listas e comparações; usar literalmente em If-Match. |
| protocolo | string | sim | Identificador legível. |
| pessoa | MunicipeResumo \| null | sim | Valor opcional; null significa ausência. |
| formulario | AtendimentoDados | sim | Coleções dentro do mesmo salvar. Ausentes no PATCH permanecem; presentes substituem apenas conjuntos integralmente editáveis. |
| referencias | object | sim |  |
| arquivos | array<ArquivoResumo> | sim | Lista de valores. · minItems=0; maxItems=100 |
| mensagensVinculadas | MensagensAtendimento | sim | MensagensAtendimento |
| atividadesRecentes | array<AtividadeResumo> | sim | Lista de valores. · minItems=0; maxItems=5 |
| contextoEdicao | ContextoFormulario | sim | Dados de montagem do editor. Opções grandes usam /opcoes ao pesquisar, sem CRUD prévio de vínculos. |
| conversaAtualizada | ConversaResumo \| null | não | Valor opcional; null significa ausência. |
| solicitanteAtual | SolicitanteExistente \| SolicitantePendente | sim | Situação persistida: pessoa definitiva ou identidade a identificar, sem dados de cadastro ainda não salvo. |

<a id="schema-FormularioAtendimento"></a>
### FormularioAtendimento

FormularioAtendimento

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| valoresIniciais | RascunhoAtendimento | sim | Prefill do novo pedido; campos ainda não preenchidos podem estar ausentes. |
| solicitanteSelecionado | MunicipeResumo \| null | sim | Valor opcional; null significa ausência. |
| contextoConversa | ContextoPedidoConversa \| null | sim | Valor opcional; null significa ausência. |
| contexto | ContextoFormulario | sim | Dados de montagem do editor. Opções grandes usam /opcoes ao pesquisar, sem CRUD prévio de vínculos. |

<a id="schema-PesquisaAtendimentos"></a>
### PesquisaAtendimentos

PesquisaAtendimentos

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| q | string | não | Nome/protocolo/texto autorizado. |
| municipeId | string (uuid) | não | Identificador interno UUID. |
| filtros | FiltroAtendimento | não | Todos os critérios coincidem no mesmo atendimento. |
| fusoHorario | string | não | Fuso das datas com horário. |
| cursor | string | não | Cursor retornado para esta consulta. |
| limite | integer | não | Default 25, máximo 100. · minimum=1; maximum=100 |
| incluirTotal | boolean | não | Solicitar total autorizado. |
| ordenarPor | enum: abertoEm, prazo, protocolo, titulo, situacao | não | Ordenação permitida da lista de pedidos. |
| direcao | enum: asc, desc | não | Sentido. |

<a id="schema-ResultadoAtendimentos"></a>
### ResultadoAtendimentos

ResultadoAtendimentos

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| dados | array<AtendimentoResumo> | sim | Lista de valores. · minItems=0; maxItems=100 |
| paginacao | Pagina | sim | Pagina |
| situacoes | array<enum: aberto, em_andamento, aguardando_informacao, encaminhado, concluido, cancelado> | sim | Lista de valores. · minItems=0; maxItems=100 |

<a id="schema-AnexoLinha"></a>
### AnexoLinha

AnexoLinha

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| id | string (uuid) | sim | Identificador interno UUID. |
| atendimento | AtendimentoResumo | sim | AtendimentoResumo |
| arquivo | ArquivoResumo | sim | ArquivoResumo |
| descricao | string \| null | não | Descrição autorizada. |
| incluidoPor | Opcao | sim | Opcao |
| incluidoEm | string (date-time) | sim | Instante em UTC; apresentação no fuso da interface. |

<a id="schema-AnexosPessoa"></a>
### AnexosPessoa

AnexosPessoa

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| dados | array<AnexoLinha> | sim | Lista de valores. · minItems=0; maxItems=100 |
| paginacao | Pagina | sim | Pagina |

<a id="schema-ConversaResumo"></a>
### ConversaResumo

ConversaResumo

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| id | string (uuid) | sim | Identificador interno UUID. |
| etag | string | sim | Versão da responsabilidade/contexto; mensagens novas não invalidam desnecessariamente a edição. |
| pessoa | MunicipeResumo \| null | não | Valor opcional; null significa ausência. |
| contatoCanal | string | sim | Contato do canal, não identidade única. |
| estado | enum: aguardando, em_triagem, em_atendimento, encerrada | sim | Estado da caixa. |
| responsavel | Opcao \| null | não | Valor opcional; null significa ausência. |
| equipe | Opcao \| null | não | Valor opcional; null significa ausência. |
| naoLidas | integer | sim | Badge. · minimum=0 |
| ultimaMensagem | string \| null | não | Trecho permitido. |
| ultimaMensagemEm | string (date-time) \| null | não | Instante em UTC; apresentação no fuso da interface. |

<a id="schema-MensagemResumo"></a>
### MensagemResumo

MensagemResumo

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| id | string (uuid) | sim | Identificador interno UUID. |
| chaveCliente | string \| null | não | Correlação com o envio otimista, sem duplicar via SSE. |
| direcao | enum: entrada, saida | sim | Direção. |
| texto | string \| null | não | Conteúdo permitido. |
| arquivos | array<ArquivoResumo> | sim | Lista de valores. · minItems=0; maxItems=100 |
| ocorridoEm | string (date-time) | sim | Instante em UTC; apresentação no fuso da interface. |
| estadoEnvio | enum: recebida, pendente, aceita_provedor, entregue, lida, falha, incerta | sim | Evidência real; 202 não é entrega. |
| atendimentos | array<Opcao> | sim | Lista de valores. · minItems=0; maxItems=100 |

<a id="schema-NotaConversa"></a>
### NotaConversa

NotaConversa

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| id | string (uuid) | sim | Identificador interno UUID. |
| versao | integer | sim | Versão informativa do agregado; usar o ETag opaco retornado, sem montá-lo no frontend. · minimum=1 |
| etag | string | sim | Token de edição já disponível também em listas e comparações; usar literalmente em If-Match. |
| texto | string | sim | Nota interna. |
| autor | Opcao | sim | Opcao |
| registradaEm | string (date-time) | sim | Instante em UTC; apresentação no fuso da interface. |
| removida | boolean | sim | Remoção lógica. |

<a id="schema-ItemHistoricoConversa"></a>
### ItemHistoricoConversa

ItemHistoricoConversa

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| tipo | enum: mensagem, nota, transferencia | sim | Renderizar com distinção clara entre nota interna e mensagem externa. |
| ocorridoEm | string (date-time) | sim | Instante em UTC; apresentação no fuso da interface. |
| mensagem | MensagemResumo | não | MensagemResumo |
| nota | NotaConversa | não | NotaConversa |
| transferencia | object | não |  |

```json
{
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "tipo": {
      "type": "string",
      "description": "Renderizar com distinção clara entre nota interna e mensagem externa.",
      "examples": [
        "mensagem"
      ],
      "enum": [
        "mensagem",
        "nota",
        "transferencia"
      ]
    },
    "ocorridoEm": {
      "type": "string",
      "description": "Instante em UTC; apresentação no fuso da interface.",
      "examples": [
        "2026-11-16T17:00:00Z"
      ],
      "format": "date-time"
    },
    "mensagem": {
      "$ref": "#/components/schemas/MensagemResumo"
    },
    "nota": {
      "$ref": "#/components/schemas/NotaConversa"
    },
    "transferencia": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "id": {
          "type": "string",
          "description": "Identificador interno UUID.",
          "examples": [
            "11111111-1111-4111-8111-111111111111"
          ],
          "format": "uuid"
        },
        "origem": {
          "anyOf": [
            {
              "$ref": "#/components/schemas/Opcao"
            },
            {
              "type": "null"
            }
          ],
          "description": "Valor opcional; null significa ausência."
        },
        "destino": {
          "$ref": "#/components/schemas/Opcao"
        },
        "motivo": {
          "type": "string",
          "description": "Motivo.",
          "examples": [
            "Encaminhado à equipe responsável."
          ]
        }
      },
      "required": [
        "id",
        "destino",
        "motivo"
      ]
    }
  },
  "required": [
    "tipo",
    "ocorridoEm"
  ],
  "description": "ItemHistoricoConversa",
  "oneOf": [
    {
      "properties": {
        "tipo": {
          "const": "mensagem"
        }
      },
      "required": [
        "mensagem"
      ],
      "not": {
        "anyOf": [
          {
            "required": [
              "nota"
            ]
          },
          {
            "required": [
              "transferencia"
            ]
          }
        ]
      }
    },
    {
      "properties": {
        "tipo": {
          "const": "nota"
        }
      },
      "required": [
        "nota"
      ],
      "not": {
        "anyOf": [
          {
            "required": [
              "mensagem"
            ]
          },
          {
            "required": [
              "transferencia"
            ]
          }
        ]
      }
    },
    {
      "properties": {
        "tipo": {
          "const": "transferencia"
        }
      },
      "required": [
        "transferencia"
      ],
      "not": {
        "anyOf": [
          {
            "required": [
              "mensagem"
            ]
          },
          {
            "required": [
              "nota"
            ]
          }
        ]
      }
    }
  ],
  "examples": [
    {
      "tipo": "mensagem",
      "ocorridoEm": "2026-11-16T17:00:00Z",
      "mensagem": {
        "id": "11111111-1111-4111-8111-111111111111",
        "chaveCliente": "msg-local-1",
        "direcao": "entrada",
        "texto": "Gostaria de saber o andamento.",
        "arquivos": [
          {
            "id": "11111111-1111-4111-8111-111111111111",
            "nome": "foto-exemplo.jpg",
            "mimeType": "image/jpeg",
            "tamanhoBytes": 1024,
            "url": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo",
            "miniaturaUrl": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo?variante=miniatura"
          }
        ],
        "ocorridoEm": "2026-11-16T17:00:00Z",
        "estadoEnvio": "recebida",
        "atendimentos": [
          {
            "id": "11111111-1111-4111-8111-111111111111",
            "rotulo": "Ana Exemplo",
            "ativo": true
          }
        ]
      }
    }
  ]
}
```

<a id="schema-HistoricoConversa"></a>
### HistoricoConversa

HistoricoConversa

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| dados | array<ItemHistoricoConversa> | sim | Lista de valores. · minItems=0; maxItems=100 |
| paginacao | Pagina | sim | Pagina |

<a id="schema-TriagemWorkspace"></a>
### TriagemWorkspace

TriagemWorkspace

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| id | string (uuid) | sim | Identificador interno UUID. |
| estado | enum: aguardando, processando, sugestao, revisao_necessaria, falha | sim | IA não bloqueia humano. |
| resumo | string \| null | não | Contexto autorizado. |
| candidatos | array<AtendimentoResumo> | sim | Lista de valores. · minItems=0; maxItems=100 |
| motivos | array<string> | sim | Lista de valores. · minItems=0; maxItems=100 |

<a id="schema-WorkspaceConversa"></a>
### WorkspaceConversa

WorkspaceConversa

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| conversa | ConversaResumo | sim | ConversaResumo |
| historico | HistoricoConversa | sim | HistoricoConversa |
| pessoa | MunicipeResumo \| null | sim | Valor opcional; null significa ausência. |
| atendimentos | array<AtendimentoResumo> | sim | Lista de valores. · minItems=0; maxItems=100 |
| triagem | TriagemWorkspace \| null | não | Valor opcional; null significa ausência. |
| destinosTransferencia | array<Opcao> | sim | Lista de valores. · minItems=0; maxItems=100 |
| acoesPermitidas | array<string> | sim | Lista de valores. · minItems=0; maxItems=100 |
| modoIa | enum: desativada, assistida, automatica_validada | sim | Atuação humana bloqueia respostas concorrentes. |

<a id="schema-Caixa"></a>
### Caixa

Caixa

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| dados | array<ConversaResumo> | sim | Lista de valores. · minItems=0; maxItems=100 |
| paginacao | Pagina | sim | Pagina |
| contadores | object | sim |  |
| meuEstado | Disponibilidade | sim | Disponibilidade |
| equipes | array<Opcao> | sim | Lista de valores. · minItems=0; maxItems=100 |

<a id="schema-TransferirConversa"></a>
### TransferirConversa

TransferirConversa

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| destinoTipo | enum: usuario, equipe | sim | Pessoa ou fila de equipe. |
| destinoId | string (uuid) | sim | Identificador interno UUID. |
| motivo | string | sim | Motivo auditado. · minLength=3 |

<a id="schema-ResultadoTransferencia"></a>
### ResultadoTransferencia

ResultadoTransferencia

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| conversaId | string (uuid) | sim | Identificador interno UUID. |
| removidaDaMinhaCaixa | boolean | sim | Se a transferência retirou o acesso, não devolver workspace restrito. |
| conversa | ConversaResumo \| null | não | Valor opcional; null significa ausência. |

<a id="schema-VinculoMensagem"></a>
### VinculoMensagem

VinculoMensagem

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| mensagemId | string (uuid) | sim | Identificador interno UUID. |
| atendimentoId | string (uuid) | sim | Identificador interno UUID. |
| trecho | string \| null | não | Trecho pertinente, quando necessário. |

<a id="schema-ContextoConversaAlterar"></a>
### ContextoConversaAlterar

ContextoConversaAlterar

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| municipeId | string (uuid) \| null | não | Identificação contextual; não move toda conversa familiar. |
| vinculosMensagens | array<VinculoMensagem> | não | Conjunto dos vínculos das mensagens explicitamente envolvidas; backend valida todos. · minItems=0; maxItems=100 |
| modoIa | enum: desativada, assistida, automatica_validada | não | Automático exige política/permissão adicional. |
| triagemId | string (uuid) | não | Se houve aceite/correção de sugestão. |
| motivo | string | sim | Justificativa. · minLength=3 |

```json
{
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "municipeId": {
      "anyOf": [
        {
          "type": "string",
          "description": "Identificação contextual; não move toda conversa familiar.",
          "examples": [
            "11111111-1111-4111-8111-111111111111"
          ],
          "format": "uuid"
        },
        {
          "type": "null"
        }
      ],
      "description": "Identificação contextual; não move toda conversa familiar."
    },
    "vinculosMensagens": {
      "type": "array",
      "items": {
        "$ref": "#/components/schemas/VinculoMensagem"
      },
      "minItems": 0,
      "maxItems": 100,
      "description": "Conjunto dos vínculos das mensagens explicitamente envolvidas; backend valida todos."
    },
    "modoIa": {
      "type": "string",
      "description": "Automático exige política/permissão adicional.",
      "examples": [
        "desativada"
      ],
      "enum": [
        "desativada",
        "assistida",
        "automatica_validada"
      ]
    },
    "triagemId": {
      "type": "string",
      "description": "Se houve aceite/correção de sugestão.",
      "examples": [
        "11111111-1111-4111-8111-111111111111"
      ],
      "format": "uuid"
    },
    "motivo": {
      "type": "string",
      "description": "Justificativa.",
      "examples": [
        "Pessoa e protocolo conferidos."
      ],
      "minLength": 3
    }
  },
  "anyOf": [
    {
      "required": [
        "municipeId"
      ]
    },
    {
      "required": [
        "vinculosMensagens"
      ]
    },
    {
      "required": [
        "modoIa"
      ]
    }
  ],
  "required": [
    "motivo"
  ],
  "description": "ContextoConversaAlterar",
  "examples": [
    {
      "municipeId": "11111111-1111-4111-8111-111111111111",
      "vinculosMensagens": [
        {
          "mensagemId": "11111111-1111-4111-8111-111111111111",
          "atendimentoId": "33333333-3333-4333-8333-333333333333",
          "trecho": "andamento"
        }
      ],
      "motivo": "Identidade e protocolo conferidos."
    }
  ]
}
```

<a id="schema-EnviarMensagem"></a>
### EnviarMensagem

EnviarMensagem

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| chaveCliente | string | sim | Chave local única do envio, retornada no resultado/evento. · minLength=1 |
| texto | string | não | Mensagem externa. · minLength=1 |
| uploadTokens | array<string> | não | Lista de valores. · minItems=1; maxItems=100 |
| respostaAMensagemId | string (uuid) | não | Identificador interno UUID. |

```json
{
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "chaveCliente": {
      "type": "string",
      "description": "Chave local única do envio, retornada no resultado/evento.",
      "examples": [
        "msg-local-1"
      ],
      "minLength": 1
    },
    "texto": {
      "type": "string",
      "description": "Mensagem externa.",
      "examples": [
        "Estamos acompanhando sua solicitação."
      ],
      "minLength": 1
    },
    "uploadTokens": {
      "type": "array",
      "items": {
        "type": "string",
        "description": "Mídia pronta do lote.",
        "examples": [
          "upload-midia-exemplo"
        ]
      },
      "minItems": 1,
      "maxItems": 100,
      "description": "Lista de valores."
    },
    "respostaAMensagemId": {
      "type": "string",
      "description": "Identificador interno UUID.",
      "examples": [
        "11111111-1111-4111-8111-111111111111"
      ],
      "format": "uuid"
    }
  },
  "anyOf": [
    {
      "required": [
        "texto"
      ]
    },
    {
      "required": [
        "uploadTokens"
      ]
    }
  ],
  "required": [
    "chaveCliente"
  ],
  "description": "EnviarMensagem"
}
```

<a id="schema-NotaSalvar"></a>
### NotaSalvar

Nova nota exige texto; edição permite texto ou removida=true.

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| texto | string | não | Texto interno. · minLength=1 |
| removida | boolean | não | true remove logicamente; preservar auditoria. |
| motivo | string | não | Motivo de remoção/correção quando aplicável. |

```json
{
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "texto": {
      "type": "string",
      "description": "Texto interno.",
      "examples": [
        "Aguardar retorno."
      ],
      "minLength": 1
    },
    "removida": {
      "type": "boolean",
      "description": "true remove logicamente; preservar auditoria.",
      "examples": [
        false
      ]
    },
    "motivo": {
      "type": "string",
      "description": "Motivo de remoção/correção quando aplicável.",
      "examples": [
        "Correção conferida pela equipe."
      ]
    }
  },
  "anyOf": [
    {
      "required": [
        "texto"
      ]
    },
    {
      "properties": {
        "removida": {
          "const": true
        }
      },
      "required": [
        "removida"
      ]
    }
  ],
  "description": "Nova nota exige texto; edição permite texto ou removida=true.",
  "examples": [
    {
      "texto": "Aguardar retorno do órgão."
    }
  ]
}
```

<a id="schema-LeituraConversa"></a>
### LeituraConversa

LeituraConversa

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| ateMensagemId | string (uuid) | sim | Última mensagem efetivamente exibida; marcador monotônico por usuário. |

<a id="schema-Motivo"></a>
### Motivo

Motivo

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| motivo | string | sim | Justificativa auditada. · minLength=3; maxLength=2000 |

<a id="schema-ResultadoTranscricao"></a>
### ResultadoTranscricao

ResultadoTranscricao

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| transcricaoId | string (uuid) | sim | Identificador interno UUID. |
| texto | string | sim | Texto de trabalho para revisar no formulário local; ainda não está salvo na observação. |
| audio | ArquivoResumo | sim | ArquivoResumo |
| rascunhoId | string (uuid) | sim | Identificador interno UUID. |

<a id="schema-ResultadoPreviaEtiquetas"></a>
### ResultadoPreviaEtiquetas

ResultadoPreviaEtiquetas

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| previaId | string (uuid) | sim | Identificador interno UUID. |
| arquivo | ArquivoResumo | sim | ArquivoResumo |
| quantidadeEtiquetas | integer | sim | Quantidade efetivamente materializada. · minimum=0 |
| quantidadeFolhas | integer | sim | Considera posição inicial e cópias. · minimum=0 |
| geradoEm | string (date-time) | sim | Instante em UTC; apresentação no fuso da interface. |
| expiraEm | string (date-time) | sim | Instante em UTC; apresentação no fuso da interface. |
| problemas | array<ErroCampo> | sim | Lista de valores. · minItems=0; maxItems=100 |

<a id="schema-Operacao"></a>
### Operacao

Operacao

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| id | string (uuid) | sim | Identificador interno UUID. |
| tipo | enum: transcricao, previa_etiquetas, reconectar_whatsapp, reenviar_mensagem, reanalisar_conversa | sim | Tarefa que corresponde a uma ação real de tela. |
| estado | enum: pendente, processando, concluida, falha, cancelada | sim | Não confundir aceitação com conclusão. |
| progresso | integer | sim | Percentual aproximado. · minimum=0; maximum=100 |
| podeCancelar | boolean | sim | Não promete desfazer efeito externo já consumado. |
| resultado | ResultadoTranscricao \| ResultadoPreviaEtiquetas \| MensagemResumo \| EstadoWhatsapp \| TriagemWorkspace \| null | sim | Resultado tipado conforme tipo; null até concluir. |
| erro | Problema \| null | não | Valor opcional; null significa ausência. |

```json
{
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "id": {
      "type": "string",
      "description": "Identificador interno UUID.",
      "examples": [
        "11111111-1111-4111-8111-111111111111"
      ],
      "format": "uuid"
    },
    "tipo": {
      "type": "string",
      "description": "Tarefa que corresponde a uma ação real de tela.",
      "examples": [
        "transcricao"
      ],
      "enum": [
        "transcricao",
        "previa_etiquetas",
        "reconectar_whatsapp",
        "reenviar_mensagem",
        "reanalisar_conversa"
      ]
    },
    "estado": {
      "type": "string",
      "description": "Não confundir aceitação com conclusão.",
      "examples": [
        "pendente"
      ],
      "enum": [
        "pendente",
        "processando",
        "concluida",
        "falha",
        "cancelada"
      ]
    },
    "progresso": {
      "type": "integer",
      "description": "Percentual aproximado.",
      "minimum": 0,
      "examples": [
        0
      ],
      "maximum": 100
    },
    "podeCancelar": {
      "type": "boolean",
      "description": "Não promete desfazer efeito externo já consumado.",
      "examples": [
        true
      ]
    },
    "resultado": {
      "anyOf": [
        {
          "oneOf": [
            {
              "$ref": "#/components/schemas/ResultadoTranscricao"
            },
            {
              "$ref": "#/components/schemas/ResultadoPreviaEtiquetas"
            },
            {
              "$ref": "#/components/schemas/MensagemResumo"
            },
            {
              "$ref": "#/components/schemas/EstadoWhatsapp"
            },
            {
              "$ref": "#/components/schemas/TriagemWorkspace"
            }
          ],
          "description": "Resultado tipado conforme tipo; null até concluir."
        },
        {
          "type": "null"
        }
      ],
      "description": "Resultado tipado conforme tipo; null até concluir."
    },
    "erro": {
      "anyOf": [
        {
          "$ref": "#/components/schemas/Problema"
        },
        {
          "type": "null"
        }
      ],
      "description": "Valor opcional; null significa ausência."
    }
  },
  "required": [
    "id",
    "tipo",
    "estado",
    "progresso",
    "podeCancelar",
    "resultado"
  ],
  "description": "Operacao",
  "allOf": [
    {
      "if": {
        "properties": {
          "estado": {
            "const": "concluida"
          },
          "tipo": {
            "const": "transcricao"
          }
        },
        "required": [
          "estado",
          "tipo"
        ]
      },
      "then": {
        "properties": {
          "resultado": {
            "$ref": "#/components/schemas/ResultadoTranscricao"
          },
          "progresso": {
            "const": 100
          },
          "podeCancelar": {
            "const": false
          }
        }
      }
    },
    {
      "if": {
        "properties": {
          "estado": {
            "const": "concluida"
          },
          "tipo": {
            "const": "previa_etiquetas"
          }
        },
        "required": [
          "estado",
          "tipo"
        ]
      },
      "then": {
        "properties": {
          "resultado": {
            "$ref": "#/components/schemas/ResultadoPreviaEtiquetas"
          },
          "progresso": {
            "const": 100
          },
          "podeCancelar": {
            "const": false
          }
        }
      }
    },
    {
      "if": {
        "properties": {
          "estado": {
            "const": "concluida"
          },
          "tipo": {
            "const": "reconectar_whatsapp"
          }
        },
        "required": [
          "estado",
          "tipo"
        ]
      },
      "then": {
        "properties": {
          "resultado": {
            "$ref": "#/components/schemas/EstadoWhatsapp"
          },
          "progresso": {
            "const": 100
          },
          "podeCancelar": {
            "const": false
          }
        }
      }
    },
    {
      "if": {
        "properties": {
          "estado": {
            "const": "concluida"
          },
          "tipo": {
            "const": "reenviar_mensagem"
          }
        },
        "required": [
          "estado",
          "tipo"
        ]
      },
      "then": {
        "properties": {
          "resultado": {
            "$ref": "#/components/schemas/MensagemResumo"
          },
          "progresso": {
            "const": 100
          },
          "podeCancelar": {
            "const": false
          }
        }
      }
    },
    {
      "if": {
        "properties": {
          "estado": {
            "const": "concluida"
          },
          "tipo": {
            "const": "reanalisar_conversa"
          }
        },
        "required": [
          "estado",
          "tipo"
        ]
      },
      "then": {
        "properties": {
          "resultado": {
            "$ref": "#/components/schemas/TriagemWorkspace"
          },
          "progresso": {
            "const": 100
          },
          "podeCancelar": {
            "const": false
          }
        }
      }
    },
    {
      "if": {
        "properties": {
          "estado": {
            "enum": [
              "pendente",
              "processando"
            ]
          }
        },
        "required": [
          "estado"
        ]
      },
      "then": {
        "properties": {
          "resultado": {
            "type": "null"
          }
        }
      }
    },
    {
      "if": {
        "properties": {
          "estado": {
            "const": "falha"
          }
        },
        "required": [
          "estado"
        ]
      },
      "then": {
        "properties": {
          "erro": {
            "$ref": "#/components/schemas/Problema"
          }
        },
        "required": [
          "erro"
        ]
      }
    }
  ],
  "examples": [
    {
      "id": "11111111-1111-4111-8111-111111111111",
      "tipo": "transcricao",
      "estado": "pendente",
      "progresso": 0,
      "podeCancelar": true,
      "resultado": null
    },
    {
      "id": "11111111-1111-4111-8111-111111111111",
      "tipo": "transcricao",
      "estado": "concluida",
      "progresso": 100,
      "podeCancelar": false,
      "resultado": {
        "transcricaoId": "11111111-1111-4111-8111-111111111111",
        "texto": "Prefere contato à tarde.",
        "audio": {
          "id": "11111111-1111-4111-8111-111111111111",
          "nome": "foto-exemplo.jpg",
          "mimeType": "image/jpeg",
          "tamanhoBytes": 1024,
          "url": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo",
          "miniaturaUrl": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo?variante=miniatura"
        },
        "rascunhoId": "11111111-1111-4111-8111-111111111111"
      }
    }
  ]
}
```

<a id="schema-TranscreverAudio"></a>
### TranscreverAudio

TranscreverAudio

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| rascunhoId | string (uuid) | sim | Rascunho ainda não salvo; não exige munícipe existente. |
| municipeId | string (uuid) | não | Somente ao editar pessoa existente autorizada. |
| audio | string (binary) | sim | Áudio enviado ou gravado; upload e início da transcrição na mesma chamada. |

<a id="schema-ItemAgenda"></a>
### ItemAgenda

ItemAgenda

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| id | string (uuid) | sim | Identificador interno UUID. |
| versao | integer | sim | Versão informativa do agregado; usar o ETag opaco retornado, sem montá-lo no frontend. · minimum=1 |
| etag | string | sim | Token de edição já disponível também em listas e comparações; usar literalmente em If-Match. |
| tipo | enum: pendencia_atendimento, retorno_contato | sim | Origem do compromisso. |
| pessoa | MunicipeResumo \| null | sim | Valor opcional; null significa ausência. |
| atendimento | AtendimentoResumo \| null | não | Valor opcional; null significa ausência. |
| descricao | string | sim | Ação pendente. |
| responsavel | Opcao \| null | não | Valor opcional; null significa ausência. |
| previstoEm | string (date-time) | sim | Instante em UTC; apresentação no fuso da interface. |
| situacao | enum: aberto, concluido, cancelado | sim | Situação. |
| motivosRetomada | array<enum: aguardando_equipe, retorno_vencido, primeiro_contato, inatividade, tentativa_sem_resposta> | sim | Lista de valores. · minItems=0; maxItems=100 |
| ultimaTentativaEm | string (date-time) \| null | não | Instante em UTC; apresentação no fuso da interface. |
| acoesPermitidas | array<string> | sim | Lista de valores. · minItems=0; maxItems=100 |

<a id="schema-Agenda"></a>
### Agenda

Agenda

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| dados | array<ItemAgenda> | sim | Lista de valores. · minItems=0; maxItems=100 |
| paginacao | Pagina | sim | Pagina |
| responsaveis | array<Opcao> | sim | Lista de valores. · minItems=0; maxItems=100 |
| contadores | object | sim |  |

<a id="schema-AgendarContato"></a>
### AgendarContato

AgendarContato

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| municipeId | string (uuid) | sim | Identificador interno UUID. |
| atendimentoId | string (uuid) | não | Opcional quando vinculado a pedido. |
| motivo | string | sim | Objetivo do retorno. · minLength=1 |
| responsavelId | string (uuid) | sim | Identificador interno UUID. |
| previstoEm | string (date-time) | sim | Instante em UTC; apresentação no fuso da interface. |

<a id="schema-AgendaAlterar"></a>
### AgendaAlterar

Um resultado pode atualizar compromisso, criar interação e próximo retorno atomicamente.

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| descricao | string | não | Nova descrição. |
| responsavelId | string (uuid) \| null | não | Identificador interno UUID. |
| previstoEm | string (date-time) | não | Instante em UTC; apresentação no fuso da interface. |
| situacao | enum: aberto, concluido, cancelado | não | Alteração de estado do compromisso. |
| resultadoContato | enum: falou, sem_resposta, remarcar, nao_deseja_contato | não | Quando registra tentativa/conversa; backend cria evidência e calcula recência. |
| ocorridoEm | string (date-time) | não | Instante real da tentativa/conversa. |
| resumoResultado | string | não | Descrição auditada. |
| novoRetornoEm | string (date-time) | não | Pode registrar resultado e agendar a próxima tentativa na mesma chamada. |

<a id="schema-ResultadoAgenda"></a>
### ResultadoAgenda

Resumo de contato somente quando a identidade atual tem permissão de lê-lo.

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| item | ItemAgenda | sim | ItemAgenda |
| novoRetorno | ItemAgenda \| null | não | Valor opcional; null significa ausência. |
| contatoAtualizado | ResumoContato \| null | não | Valor opcional; null significa ausência. |

<a id="schema-EventoFormulario"></a>
### EventoFormulario

EventoFormulario

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| id | string (uuid) | não | Se reutiliza origem existente autorizada, já fornecida pelo editor/lookup. |
| nome | string | sim | Nome da ação/evento. · minLength=1 |
| descricao | string | sim | Descrição pública. |
| inicioEm | string (date-time) | sim | Instante em UTC; apresentação no fuso da interface. |
| fimEm | string (date-time) \| null | não | Instante em UTC; apresentação no fuso da interface. |
| local | string \| null | não | Local. |
| versao | integer | não | Obrigatória ao editar/reutilizar evento existente; editor já a fornece, sem GET adicional. · minimum=1 |

```json
{
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "id": {
      "type": "string",
      "description": "Se reutiliza origem existente autorizada, já fornecida pelo editor/lookup.",
      "examples": [
        "11111111-1111-4111-8111-111111111111"
      ],
      "format": "uuid"
    },
    "nome": {
      "type": "string",
      "description": "Nome da ação/evento.",
      "examples": [
        "Encontro de atendimento"
      ],
      "minLength": 1
    },
    "descricao": {
      "type": "string",
      "description": "Descrição pública.",
      "examples": [
        "Atendimento à comunidade."
      ]
    },
    "inicioEm": {
      "type": "string",
      "description": "Instante em UTC; apresentação no fuso da interface.",
      "examples": [
        "2026-11-16T17:00:00Z"
      ],
      "format": "date-time"
    },
    "fimEm": {
      "anyOf": [
        {
          "type": "string",
          "description": "Instante em UTC; apresentação no fuso da interface.",
          "examples": [
            "2026-11-16T17:00:00Z"
          ],
          "format": "date-time"
        },
        {
          "type": "null"
        }
      ],
      "description": "Instante em UTC; apresentação no fuso da interface."
    },
    "local": {
      "anyOf": [
        {
          "type": "string",
          "description": "Local.",
          "examples": [
            "Espaço comunitário"
          ]
        },
        {
          "type": "null"
        }
      ],
      "description": "Local."
    },
    "versao": {
      "type": "integer",
      "description": "Obrigatória ao editar/reutilizar evento existente; editor já a fornece, sem GET adicional.",
      "minimum": 1,
      "examples": [
        1
      ]
    }
  },
  "required": [
    "nome",
    "descricao",
    "inicioEm"
  ],
  "description": "EventoFormulario",
  "allOf": [
    {
      "if": {
        "required": [
          "id"
        ]
      },
      "then": {
        "required": [
          "versao"
        ]
      }
    }
  ]
}
```

<a id="schema-FormularioDados"></a>
### FormularioDados

FormularioDados

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| titulo | string | sim | Título público. · minLength=1 |
| descricao | string | sim | Finalidade da coleta. |
| evento | EventoFormulario | sim | EventoFormulario |
| finalidade | enum: inscricao, presenca | sim | Inscrição não comprova presença. |
| camposAtivos | array<enum: nome, sexoCodigo, nascimento, contatos, endereco, documentos> | sim | Lista de valores. · minItems=1; maxItems=100 |
| camposObrigatorios | array<enum: nome, sexoCodigo, nascimento, contatos, endereco> | sim | Lista de valores. · minItems=1; maxItems=100 |
| abreEm | string (date-time) \| null | não | Instante em UTC; apresentação no fuso da interface. |
| fechaEm | string (date-time) \| null | não | Instante em UTC; apresentação no fuso da interface. |
| situacao | enum: rascunho, aberto, encerrado, revogado | sim | Salvar e divulgar pode abrir na mesma transação. |

<a id="schema-FormularioEditor"></a>
### FormularioEditor

FormularioEditor

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| id | string (uuid) | sim | Identificador interno UUID. |
| versao | integer | sim | Versão informativa do agregado; usar o ETag opaco retornado, sem montá-lo no frontend. · minimum=1 |
| etag | string | sim | Token de edição já disponível também em listas e comparações; usar literalmente em If-Match. |
| formulario | FormularioDados | sim | FormularioDados |
| linkPublico | string (uri) | sim | Link opaco, sem consulta de pessoas da base. |
| quantidadeEnvios | integer | sim | Total autorizado. · minimum=0 |
| quantidadeParticipantes | integer | sim | Pessoas únicas da origem. · minimum=0 |
| permissoes | PermissoesTela | sim | PermissoesTela |

<a id="schema-FormularioNovo"></a>
### FormularioNovo

FormularioNovo

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| valoresIniciais | RascunhoFormulario | sim | Prefill do editor de formulário público, antes de validar o Salvar. |
| eventosIniciais | array<Opcao> | sim | Lista de valores. · minItems=0; maxItems=100 |
| permissoes | PermissoesTela | sim | PermissoesTela |

<a id="schema-FormularioLista"></a>
### FormularioLista

FormularioLista

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| dados | array<FormularioEditor> | sim | Lista de valores. · minItems=0; maxItems=100 |
| paginacao | Pagina | sim | Pagina |

<a id="schema-FormularioAlterar"></a>
### FormularioAlterar

FormularioAlterar

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| titulo | string | não | Título público. · minLength=1 |
| descricao | string | não | Finalidade da coleta. |
| evento | EventoFormulario | não | EventoFormulario |
| finalidade | enum: inscricao, presenca | não | Inscrição não comprova presença. |
| camposAtivos | array<enum: nome, sexoCodigo, nascimento, contatos, endereco, documentos> | não | Lista de valores. · minItems=1; maxItems=100 |
| camposObrigatorios | array<enum: nome, sexoCodigo, nascimento, contatos, endereco> | não | Lista de valores. · minItems=1; maxItems=100 |
| abreEm | string (date-time) \| null | não | Instante em UTC; apresentação no fuso da interface. |
| fechaEm | string (date-time) \| null | não | Instante em UTC; apresentação no fuso da interface. |
| situacao | enum: rascunho, aberto, encerrado, revogado | não | Salvar e divulgar pode abrir na mesma transação. |
| gerarNovoLink | boolean | não | Ação explícita invalida link anterior; não reabrir link revogado silenciosamente. |
| motivoAlteracao | string | não | Motivo de revogação/rotação/correção. |

<a id="schema-FormularioPublico"></a>
### FormularioPublico

FormularioPublico

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| titulo | string | sim | Título público. |
| descricao | string | sim | Finalidade pública. |
| versaoFormulario | integer | sim | Versão que será enviada no submit. · minimum=1 |
| finalidade | enum: inscricao, presenca | sim | Tipo da lista. |
| camposAtivos | array<enum: nome, sexoCodigo, nascimento, contatos, endereco, documentos> | sim | Lista de valores. · minItems=1; maxItems=100 |
| camposObrigatorios | array<enum: nome, sexoCodigo, nascimento, contatos, endereco> | sim | Lista de valores. · minItems=1; maxItems=100 |
| opcoesSexo | array<object> | não | Lista de valores. · minItems=0; maxItems=100 |

<a id="schema-PessoaDeclarada"></a>
### PessoaDeclarada

PessoaDeclarada

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| nome | string | sim | Nome declarado. · minLength=1 |
| sexoCodigo | string \| null | não | Opcional. |
| nascimento | string (date) \| null | não | Data civil no formato AAAA-MM-DD, sem conversão de fuso. |
| contatos | array<object> | não | Lista de valores. · minItems=0; maxItems=100 |
| endereco | object | não |  |
| documentos | array<object> | não | Lista de valores. · minItems=0; maxItems=100 |

<a id="schema-EnvioPublico"></a>
### EnvioPublico

EnvioPublico

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| versaoFormulario | integer | sim | Versão consultada. · minimum=1 |
| dados | PessoaDeclarada | sim | PessoaDeclarada |

<a id="schema-ReciboPublico"></a>
### ReciboPublico

ReciboPublico

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| recebido | boolean | sim | Persistência temporária confirmada. · const=True |
| mensagem | string | sim | Sempre igual para novos/existentes. |

<a id="schema-Participacao"></a>
### Participacao

Participacao

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| id | string (uuid) | sim | Identificador interno UUID. |
| versao | integer | sim | Versão informativa do agregado; usar o ETag opaco retornado, sem montá-lo no frontend. · minimum=1 |
| etag | string | sim | Token de edição já disponível também em listas e comparações; usar literalmente em If-Match. |
| pessoa | MunicipeResumo | sim | MunicipeResumo |
| evento | Opcao | sim | Opcao |
| situacao | enum: inscrito, presente, cancelado | sim | Presença é diferente de inscrição. |
| presencaEm | string (date-time) \| null | não | Instante em UTC; apresentação no fuso da interface. |
| observacao | string \| null | não | Contexto. |

<a id="schema-Participacoes"></a>
### Participacoes

Participacoes

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| dados | array<Participacao> | sim | Lista de valores. · minItems=0; maxItems=100 |
| paginacao | Pagina | sim | Pagina |

<a id="schema-ParticipanteCriar"></a>
### ParticipanteCriar

ParticipanteCriar

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| solicitante | PessoaSelecionada | sim | Pessoa definitiva existente ou nova completa inline. |
| situacao | enum: inscrito, presente | sim | Estado da participação. |
| presencaEm | string (date-time) \| null | não | Instante em UTC; apresentação no fuso da interface. |
| observacao | string \| null | não | Contexto. |

<a id="schema-ParticipacaoAlterar"></a>
### ParticipacaoAlterar

ParticipacaoAlterar

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| situacao | enum: inscrito, presente, cancelado | não | Cancelar é lógico. |
| presencaEm | string (date-time) \| null | não | Instante em UTC; apresentação no fuso da interface. |
| observacao | string \| null | não | Contexto. |

<a id="schema-CadastroRecebidoResumo"></a>
### CadastroRecebidoResumo

CadastroRecebidoResumo

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| id | string (uuid) | sim | Identificador interno UUID. |
| versao | integer | sim | Versão informativa do agregado; usar o ETag opaco retornado, sem montá-lo no frontend. · minimum=1 |
| etag | string | sim | Token de edição já disponível também em listas e comparações; usar literalmente em If-Match. |
| nome | string | sim | Nome declarado. |
| origem | Opcao | sim | Opcao |
| recebidoEm | string (date-time) | sim | Instante em UTC; apresentação no fuso da interface. |
| situacao | enum: pendente, em_conferencia, integrado_novo, integrado_existente, descartado | sim | Estado da fila. |
| revisor | Opcao \| null | não | Valor opcional; null significa ausência. |

<a id="schema-FilaCadastros"></a>
### FilaCadastros

FilaCadastros

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| dados | array<CadastroRecebidoResumo> | sim | Lista de valores. · minItems=0; maxItems=100 |
| paginacao | Pagina | sim | Pagina |
| origens | array<Opcao> | sim | Lista de valores. · minItems=0; maxItems=100 |

<a id="schema-RevisaoCadastro"></a>
### RevisaoCadastro

Comparação e contexto do editor já vêm prontos, sem GET separado de candidatos e de cada campo.

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| cadastro | CadastroRecebidoResumo | sim | CadastroRecebidoResumo |
| declaracaoOriginal | PessoaDeclarada | sim | PessoaDeclarada |
| candidatos | array<CandidatoDuplicidade> | sim | Lista de valores. · minItems=0; maxItems=100 |
| compararCom | FichaMunicipe \| null | não | Valor opcional; null significa ausência. |
| contextoCadastroNovo | FormularioMunicipe | sim | FormularioMunicipe |
| acoesPermitidas | array<string> | sim | Lista de valores. · minItems=0; maxItems=100 |
| fichaIntegrada | FichaMunicipe \| null | não | Valor opcional; null significa ausência. |

<a id="schema-ConferenciaAcaoSimples"></a>
### ConferenciaAcaoSimples

ConferenciaAcaoSimples

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| acao | enum: assumir, transferir, adiar, descartar | sim | Botão da fila de revisão. |
| usuarioDestinoId | string (uuid) | não | Só transferir, com autorização. |
| motivo | string | sim | Justificativa. · minLength=3 |

```json
{
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "acao": {
      "type": "string",
      "description": "Botão da fila de revisão.",
      "examples": [
        "assumir"
      ],
      "enum": [
        "assumir",
        "transferir",
        "adiar",
        "descartar"
      ]
    },
    "usuarioDestinoId": {
      "type": "string",
      "description": "Só transferir, com autorização.",
      "examples": [
        "11111111-1111-4111-8111-111111111111"
      ],
      "format": "uuid"
    },
    "motivo": {
      "type": "string",
      "description": "Justificativa.",
      "examples": [
        "Conferência atribuída à equipe."
      ],
      "minLength": 3
    }
  },
  "required": [
    "acao",
    "motivo"
  ],
  "description": "ConferenciaAcaoSimples",
  "allOf": [
    {
      "if": {
        "properties": {
          "acao": {
            "const": "transferir"
          }
        },
        "required": [
          "acao"
        ]
      },
      "then": {
        "required": [
          "usuarioDestinoId"
        ]
      }
    }
  ]
}
```

<a id="schema-ConferenciaNovo"></a>
### ConferenciaNovo

ConferenciaNovo

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| acao | enum: integrar_novo | sim | Confirmar cadastro novo sem criar pessoa antes. |
| cadastro | CadastroMunicipe | sim | Um POST salva pessoa, meios normalizados, todos os vínculos, fotos e contexto opcional. Não exige chamadas prévias de criação de contatos/endereços/documentos. |
| motivo | string | sim | Decisão humana. · minLength=3 |

<a id="schema-ConferenciaExistente"></a>
### ConferenciaExistente

ConferenciaExistente

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| acao | enum: integrar_existente | sim | Incorporar só escolhas explícitas no cadastro existente. |
| municipeId | string (uuid) | sim | Identificador interno UUID. |
| etagMunicipe | string | sim | Já fornecido pela ficha de comparação da mesma tela. |
| alteracoes | EditarMunicipe | não | Opcional: omitir preserva todos os campos atuais e integra somente origem/participação/decisão. Não exige alteração fictícia para confirmar pessoa existente. |
| motivo | string | sim | Justificativa da identidade e campos escolhidos. · minLength=3 |

<a id="schema-Conferencia"></a>
### Conferencia

Comandos finitos da própria tela. Integração completa, participação e decisão são uma transação.

```json
{
  "oneOf": [
    {
      "$ref": "#/components/schemas/ConferenciaAcaoSimples"
    },
    {
      "$ref": "#/components/schemas/ConferenciaNovo"
    },
    {
      "$ref": "#/components/schemas/ConferenciaExistente"
    }
  ],
  "description": "Comandos finitos da própria tela. Integração completa, participação e decisão são uma transação."
}
```

<a id="schema-BlocoEtiqueta"></a>
### BlocoEtiqueta

BlocoEtiqueta

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| tipo | enum: campo, texto | sim | Bloco estruturado. |
| campo | enum: nome, enderecoCompleto, bairro, cidade, uf, cep, contatoPrincipal, classificacoes | não | Campo permitido na impressão. |
| texto | string | não | Texto fixo; sem HTML/código. |
| xMm | number | sim | Posição. · minimum=0 |
| yMm | number | sim | Posição. · minimum=0 |
| larguraMm | number | sim | Largura. · minimum=1 |
| alturaMm | number | sim | Altura. · minimum=1 |
| fontePt | number | sim | Fonte em pontos. · minimum=4; maximum=72 |
| negrito | boolean | não | Ênfase. |
| alinhamento | enum: esquerda, centro, direita | sim | Alinhamento. |
| omitirSeVazio | boolean | não | Omitir campo opcional vazio. |

```json
{
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "tipo": {
      "type": "string",
      "description": "Bloco estruturado.",
      "examples": [
        "campo"
      ],
      "enum": [
        "campo",
        "texto"
      ]
    },
    "campo": {
      "type": "string",
      "description": "Campo permitido na impressão.",
      "examples": [
        "nome"
      ],
      "enum": [
        "nome",
        "enderecoCompleto",
        "bairro",
        "cidade",
        "uf",
        "cep",
        "contatoPrincipal",
        "classificacoes"
      ]
    },
    "texto": {
      "type": "string",
      "description": "Texto fixo; sem HTML/código.",
      "examples": [
        "Destinatário"
      ]
    },
    "xMm": {
      "type": "number",
      "description": "Posição.",
      "minimum": 0,
      "examples": [
        2
      ]
    },
    "yMm": {
      "type": "number",
      "description": "Posição.",
      "minimum": 0,
      "examples": [
        2
      ]
    },
    "larguraMm": {
      "type": "number",
      "description": "Largura.",
      "minimum": 1,
      "examples": [
        56
      ]
    },
    "alturaMm": {
      "type": "number",
      "description": "Altura.",
      "minimum": 1,
      "examples": [
        6
      ]
    },
    "fontePt": {
      "type": "number",
      "description": "Fonte em pontos.",
      "minimum": 4,
      "examples": [
        9
      ],
      "maximum": 72
    },
    "negrito": {
      "type": "boolean",
      "description": "Ênfase.",
      "examples": [
        false
      ]
    },
    "alinhamento": {
      "type": "string",
      "description": "Alinhamento.",
      "examples": [
        "esquerda"
      ],
      "enum": [
        "esquerda",
        "centro",
        "direita"
      ]
    },
    "omitirSeVazio": {
      "type": "boolean",
      "description": "Omitir campo opcional vazio.",
      "examples": [
        true
      ]
    }
  },
  "oneOf": [
    {
      "properties": {
        "tipo": {
          "const": "campo"
        }
      },
      "required": [
        "campo"
      ],
      "not": {
        "required": [
          "texto"
        ]
      }
    },
    {
      "properties": {
        "tipo": {
          "const": "texto"
        }
      },
      "required": [
        "texto"
      ],
      "not": {
        "required": [
          "campo"
        ]
      }
    }
  ],
  "required": [
    "tipo",
    "xMm",
    "yMm",
    "larguraMm",
    "alturaMm",
    "fontePt",
    "alinhamento"
  ],
  "description": "BlocoEtiqueta",
  "examples": [
    {
      "tipo": "campo",
      "campo": "nome",
      "xMm": 2,
      "yMm": 2,
      "larguraMm": 56,
      "alturaMm": 6,
      "fontePt": 9,
      "negrito": true,
      "alinhamento": "esquerda",
      "omitirSeVazio": true
    }
  ]
}
```

<a id="schema-ModeloEtiquetaSalvar"></a>
### ModeloEtiquetaSalvar

ModeloEtiquetaSalvar

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| nome | string | sim | Nome do modelo. · minLength=1 |
| blocos | array<BlocoEtiqueta> | sim | Lista de valores. · minItems=1; maxItems=100 |
| padrao | boolean | não | Definir padrão na mesma gravação, se autorizado. |
| ativo | boolean | sim | Pode ser inativado pelo editor. |

<a id="schema-ModeloEtiqueta"></a>
### ModeloEtiqueta

ModeloEtiqueta

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| id | string (uuid) | sim | Identificador interno UUID. |
| versao | integer | sim | Versão informativa do agregado; usar o ETag opaco retornado, sem montá-lo no frontend. · minimum=1 |
| etag | string | sim | Token de edição já disponível também em listas e comparações; usar literalmente em If-Match. |
| nome | string | sim | Nome do modelo. · minLength=1 |
| blocos | array<BlocoEtiqueta> | sim | Lista de valores. · minItems=1; maxItems=100 |
| padrao | boolean | não | Definir padrão na mesma gravação, se autorizado. |
| ativo | boolean | sim | Pode ser inativado pelo editor. |

<a id="schema-FormatoEtiquetaSalvar"></a>
### FormatoEtiquetaSalvar

FormatoEtiquetaSalvar

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| nome | string | sim | Nome reutilizável. · minLength=1 |
| folhaLarguraMm | number | sim | Largura da folha. · minimum=1 |
| folhaAlturaMm | number | sim | Altura da folha. · minimum=1 |
| etiquetaLarguraMm | number | sim | Largura. · minimum=1 |
| etiquetaAlturaMm | number | sim | Altura. · minimum=1 |
| margemSuperiorMm | number | sim | Margem. · minimum=0 |
| margemInferiorMm | number | sim | Margem. · minimum=0 |
| margemEsquerdaMm | number | sim | Margem. · minimum=0 |
| margemDireitaMm | number | sim | Margem. · minimum=0 |
| linhas | integer | sim | Linhas. · minimum=1; maximum=100 |
| colunas | integer | sim | Colunas. · minimum=1; maximum=100 |
| espacoHorizontalMm | number | sim | Entre colunas. · minimum=0 |
| espacoVerticalMm | number | sim | Entre linhas. · minimum=0 |
| ativo | boolean | sim | Formato habilitado. |

<a id="schema-FormatoEtiqueta"></a>
### FormatoEtiqueta

FormatoEtiqueta

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| id | string (uuid) | sim | Identificador interno UUID. |
| versao | integer | sim | Versão informativa do agregado; usar o ETag opaco retornado, sem montá-lo no frontend. · minimum=1 |
| etag | string | sim | Token de edição já disponível também em listas e comparações; usar literalmente em If-Match. |
| nome | string | sim | Nome reutilizável. · minLength=1 |
| folhaLarguraMm | number | sim | Largura da folha. · minimum=1 |
| folhaAlturaMm | number | sim | Altura da folha. · minimum=1 |
| etiquetaLarguraMm | number | sim | Largura. · minimum=1 |
| etiquetaAlturaMm | number | sim | Altura. · minimum=1 |
| margemSuperiorMm | number | não | Margem. · minimum=0 |
| margemInferiorMm | number | não | Margem. · minimum=0 |
| margemEsquerdaMm | number | não | Margem. · minimum=0 |
| margemDireitaMm | number | não | Margem. · minimum=0 |
| linhas | integer | sim | Linhas. · minimum=1; maximum=100 |
| colunas | integer | sim | Colunas. · minimum=1; maximum=100 |
| espacoHorizontalMm | number | não | Entre colunas. · minimum=0 |
| espacoVerticalMm | number | não | Entre linhas. · minimum=0 |
| ativo | boolean | sim | Formato habilitado. |
| origem | enum: personalizado, pimaco | sim | Pimaco é catálogo verificado somente leitura; personalizados são editáveis. |
| codigoPimaco | string \| null | não | Quando homologado; nenhum código é presumido aqui. |

<a id="schema-PreparacaoEtiquetas"></a>
### PreparacaoEtiquetas

PreparacaoEtiquetas

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| modeloSelecionado | ModeloEtiqueta | sim | ModeloEtiqueta |
| etagModelo | string | sim | Para salvar o modelo existente. |
| formatoSelecionado | FormatoEtiqueta \| null | sim | Valor opcional; null significa ausência. |
| etagFormato | string \| null | não | Para salvar um formato personalizado. |
| modelosIniciais | array<Opcao> | sim | Lista de valores. · minItems=0; maxItems=100 |
| formatosIniciais | array<Opcao> | sim | Lista de valores. · minItems=0; maxItems=100 |
| camposPermitidos | array<string> | sim | Lista de valores. · minItems=0; maxItems=100 |
| acoesPermitidas | array<string> | sim | Lista de valores. · minItems=0; maxItems=100 |

<a id="schema-SelecaoIds"></a>
### SelecaoIds

SelecaoIds

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| tipo | enum: ids | sim | Seleção explícita do relatório. |
| municipeIds | array<string (uuid)> | sim | Lista de valores. · minItems=1; maxItems=5000 |

<a id="schema-SelecaoConsulta"></a>
### SelecaoConsulta

SelecaoConsulta

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| tipo | enum: consulta | sim | Backend materializa os resultados atuais na geração, sem rota prévia de seleção. |
| consulta | PesquisaMunicipes | sim | Usado pela lista e pelo relatório; mesma consulta, sem endpoints duplicados. |
| excluirIds | array<string (uuid)> | não | Lista de valores. · minItems=0; maxItems=100 |

<a id="schema-SelecaoEtiquetas"></a>
### SelecaoEtiquetas

Selecionar destinatários não exige persistir seleção no frontend. IDs ou pesquisa são materializados pelo backend no preview.

```json
{
  "oneOf": [
    {
      "$ref": "#/components/schemas/SelecaoIds"
    },
    {
      "$ref": "#/components/schemas/SelecaoConsulta"
    }
  ],
  "description": "Selecionar destinatários não exige persistir seleção no frontend. IDs ou pesquisa são materializados pelo backend no preview."
}
```

<a id="schema-ModeloSalvoUsar"></a>
### ModeloSalvoUsar

ModeloSalvoUsar

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| tipo | enum: salvo | sim | Usar modelo salvo. |
| id | string (uuid) | sim | Identificador interno UUID. |
| versao | integer | sim | Versão já fornecida pela preparação. · minimum=1 |

<a id="schema-ModeloRascunhoUsar"></a>
### ModeloRascunhoUsar

ModeloRascunhoUsar

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| tipo | enum: rascunho | sim | Prévia sem obrigar salvar template antes. |
| dados | ModeloEtiquetaSalvar | sim | ModeloEtiquetaSalvar |

<a id="schema-FormatoSalvoUsar"></a>
### FormatoSalvoUsar

FormatoSalvoUsar

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| tipo | enum: salvo | sim | Pimaco ou personalizado existente. |
| id | string (uuid) | sim | Identificador interno UUID. |
| versao | integer | sim | Versão fornecida pelo editor. · minimum=1 |

<a id="schema-FormatoRascunhoUsar"></a>
### FormatoRascunhoUsar

FormatoRascunhoUsar

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| tipo | enum: personalizado | sim | Medidas personalizadas sem salvar catálogo antes. |
| dados | FormatoEtiquetaSalvar | sim | FormatoEtiquetaSalvar |

<a id="schema-PreviaEtiquetasCriar"></a>
### PreviaEtiquetasCriar

Uma ação valida seleção e layout, gera PDF imutável e registra emissão. Default de endereço principal só quando inequívoco; caso contrário retorna erro por destinatário com opções autorizadas.

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| selecao | SelecaoEtiquetas | sim | Selecionar destinatários não exige persistir seleção no frontend. IDs ou pesquisa são materializados pelo backend no preview. |
| modelo | ModeloSalvoUsar \| ModeloRascunhoUsar | sim |  |
| formato | FormatoSalvoUsar \| FormatoRascunhoUsar | sim |  |
| posicaoInicial | integer | sim | Célula inicial, base 1, da primeira folha. · minimum=1 |
| copiasPorPessoa | integer | sim | Cópias por padrão. · minimum=1; maximum=100 |
| enderecosEscolhidos | array<object> | não | Lista de valores. · minItems=0; maxItems=100 |
| deslocamentoXMm | number | não | Calibração local; sem modificar gabarito oficial. |
| deslocamentoYMm | number | não | Calibração local. |

<a id="schema-NoIndicacao"></a>
### NoIndicacao

NoIndicacao

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| pessoa | MunicipeResumo | sim | MunicipeResumo |
| quantidadeIndicadosDiretos | integer | sim | Somente filhos acessíveis. · minimum=0 |
| podeExpandir | boolean | sim | Somente existência autorizada. |

<a id="schema-IndicacoesTela"></a>
### IndicacoesTela

IndicacoesTela

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| selecionado | MunicipeResumo \| null | sim | Valor opcional; null significa ausência. |
| caminho | array<Opcao> | sim | Lista de valores. · minItems=0; maxItems=100 |
| dados | array<NoIndicacao> | sim | Lista de valores. · minItems=0; maxItems=100 |
| paginacao | Pagina | sim | Pagina |
| modo | enum: raizes, filhos_diretos | sim | Sem indicadorId começa nas raízes reais com filhos. |

<a id="schema-AtividadeResumo"></a>
### AtividadeResumo

AtividadeResumo

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| id | string (uuid) | sim | Identificador interno UUID. |
| acao | string | sim | Ação de negócio. |
| alvoTipo | string | sim | Agregado. |
| alvoId | string (uuid) | sim | Identificador interno UUID. |
| autor | AutorAtividade | sim | Distingue pessoa autenticada, serviço/agente e envio público não autenticado. |
| ocorridoEm | string (date-time) | sim | Instante em UTC; apresentação no fuso da interface. |
| resumo | string | sim | Descrição pronta para timeline. |
| podeReverter | boolean | sim | Indicação, revalidada ao abrir detalhe/confirmar. |

<a id="schema-Diferenca"></a>
### Diferenca

Diferenca

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| campo | string | sim | Campo/vínculo autorizado. |
| antes | string \| null | sim | Representação autorizada; sem segredos. |
| depois | string \| null | sim | Representação autorizada. |

<a id="schema-RevisaoToken"></a>
### RevisaoToken

RevisaoToken

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| token | string | sim | Token curto de revisão, vinculado a usuário/versões/ação, não autorização permanente. |
| expiraEm | string (date-time) | sim | Instante em UTC; apresentação no fuso da interface. |
| permitida | boolean | sim | Conflito bloqueia confirmação. |
| impactos | array<string> | sim | Lista de valores. · minItems=0; maxItems=100 |
| conflitos | array<string> | sim | Lista de valores. · minItems=0; maxItems=100 |

<a id="schema-DetalheAtividade"></a>
### DetalheAtividade

DetalheAtividade

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| atividade | AtividadeResumo | sim | AtividadeResumo |
| diferencas | array<Diferenca> | sim | Lista de valores. · minItems=0; maxItems=100 |
| reversao | RevisaoToken \| null | sim | Valor opcional; null significa ausência. |
| limitacoes | array<string> | sim | Lista de valores. · minItems=0; maxItems=100 |

<a id="schema-HistoricoTela"></a>
### HistoricoTela

HistoricoTela

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| dados | array<AtividadeResumo> | sim | Lista de valores. · minItems=0; maxItems=100 |
| paginacao | Pagina | sim | Pagina |

<a id="schema-ConfirmarReversao"></a>
### ConfirmarReversao

ConfirmarReversao

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| revisaoToken | string | sim | Já fornecido no detalhe aberto pelo usuário; não exige POST de prévia extra. |
| motivo | string | sim | Justificativa. · minLength=3 |

<a id="schema-ResultadoReversao"></a>
### ResultadoReversao

ResultadoReversao

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| atividadeOriginalId | string (uuid) | sim | Identificador interno UUID. |
| atividadeReversaoId | string (uuid) | sim | Identificador interno UUID. |
| situacao | enum: concluida, compensacao_pendente, bloqueada, falha | sim | Efeito externo pode continuar pendente. |
| recursoAtualizado | Opcao \| null | não | Valor opcional; null significa ausência. |
| limitacoes | array<string> | sim | Lista de valores. · minItems=0; maxItems=100 |

<a id="schema-FusaoPreparar"></a>
### FusaoPreparar

FusaoPreparar

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| principalId | string (uuid) | sim | Identificador interno UUID. |
| duplicadoId | string (uuid) | sim | Pessoa diferente da principal. |

<a id="schema-FusaoComparacao"></a>
### FusaoComparacao

FusaoComparacao

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| principal | FichaMunicipe | sim | Tudo para montar a ficha e editar sem buscar cada contato/endereço/classificação. Históricos longos são paginados sob demanda. Campos restritos são omitidos, sem tratar omissão como null. |
| duplicado | FichaMunicipe | sim | Tudo para montar a ficha e editar sem buscar cada contato/endereço/classificação. Históricos longos são paginados sob demanda. Campos restritos são omitidos, sem tratar omissão como null. |
| revisao | RevisaoToken | sim | RevisaoToken |
| camposComparados | array<string> | sim | Lista de valores. · minItems=0; maxItems=100 |

<a id="schema-FusaoConfirmar"></a>
### FusaoConfirmar

FusaoConfirmar

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| revisaoToken | string | sim | Revisão de ambas as fichas e suas dependências. |
| formularioFinal | DadosMunicipe | sim | Valores finais escolhidos no comparador, inclusive coleções, indicação e campos manuais quando autorizados. IDs dos itens podem vir de qualquer uma das duas fichas revisadas; não admite IDs de terceiros. Blocos omitidos preservam o principal, sem união implícita de campos restritos. |
| motivo | string | sim | Justificativa da fusão. · minLength=3 |

<a id="schema-ResultadoFusao"></a>
### ResultadoFusao

ResultadoFusao

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| ficha | FichaMunicipe | sim | Tudo para montar a ficha e editar sem buscar cada contato/endereço/classificação. Históricos longos são paginados sob demanda. Campos restritos são omitidos, sem tratar omissão como null. |
| atividadeId | string (uuid) | sim | Identificador interno UUID. |

<a id="schema-EstadoWhatsapp"></a>
### EstadoWhatsapp

EstadoWhatsapp

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| id | string (uuid) | sim | Identificador interno UUID. |
| etag | string | sim | Versão da sessão/configuração para reconectar. |
| nome | string | sim | Nome da conta. |
| numero | string \| null | não | Número confirmado. |
| estado | enum: conectado, reconectando, aguardando_autenticacao, desconectado, falha, desconhecido | sim | Evidência atual do servidor. |
| ultimaVerificacaoEm | string (date-time) \| null | não | Instante em UTC; apresentação no fuso da interface. |
| motivo | string \| null | não | Motivo conhecido sem credenciais. |
| operacaoAtivaId | string (uuid) \| null | não | Identificador interno UUID. |
| acoesPermitidas | array<string> | sim | Lista de valores. · minItems=0; maxItems=100 |

<a id="schema-AutenticacaoWhatsapp"></a>
### AutenticacaoWhatsapp

AutenticacaoWhatsapp

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| conexaoId | string (uuid) | sim | Identificador interno UUID. |
| metodo | enum: qr, codigo, procedimento_externo | sim | Método realmente suportado pelo conector. |
| conteudo | string | sim | QR/código sensível, nunca auditado; apenas gestores autorizados. |
| expiraEm | string (date-time) | sim | Instante em UTC; apresentação no fuso da interface. |
| instrucoes | string | sim | Orientação pronta para exibir. |

<a id="schema-PainelWhatsapp"></a>
### PainelWhatsapp

PainelWhatsapp

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| conexoes | array<EstadoWhatsapp> | sim | Lista de valores. · minItems=0; maxItems=100 |
| autenticacoes | array<AutenticacaoWhatsapp> | sim | Lista de valores. · minItems=0; maxItems=100 |
| incidentesRecentes | array<object> | sim | Lista de valores. · minItems=0; maxItems=100 |
| podeAtivarNotificacoes | boolean | sim | Navegador decide permissão, API não a concede. |

<a id="schema-Notificacao"></a>
### Notificacao

Notificacao

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| id | string (uuid) | sim | Identificador interno UUID. |
| versao | integer | sim | Versão informativa do agregado; usar o ETag opaco retornado, sem montá-lo no frontend. · minimum=1 |
| etag | string | sim | Token de edição já disponível também em listas e comparações; usar literalmente em If-Match. |
| titulo | string | sim | Sem dados pessoais/QR. |
| mensagem | string | sim | Orientação mínima. |
| destino | string | sim | Rota de tela, não comando a executar. |
| lida | boolean | sim | Leitura interna explícita. |
| criadaEm | string (date-time) | sim | Instante em UTC; apresentação no fuso da interface. |

<a id="schema-NotificacoesTela"></a>
### NotificacoesTela

NotificacoesTela

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| dados | array<Notificacao> | sim | Lista de valores. · minItems=0; maxItems=100 |
| paginacao | Pagina | sim | Pagina |
| naoLidas | integer | sim | Badge autorizado. · minimum=0 |

<a id="schema-InscreverPush"></a>
### InscreverPush

InscreverPush

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| dispositivoChave | string (uuid) | sim | Identificador local do navegador; não concede identidade. |
| nomeDispositivo | string | sim | Nome amigável. |
| endpoint | string (uri) | sim | URL da inscrição Web Push validada contra abuso/SSRF. |
| p256dh | string | sim | Chave pública. |
| auth | string | sim | Segredo da inscrição; nunca auditar em claro. · somente entrada; segredo não auditável em claro |
| conexaoIds | array<string (uuid)> | sim | Lista de valores. · minItems=0; maxItems=100 |

<a id="schema-InscricaoPush"></a>
### InscricaoPush

InscricaoPush

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| id | string (uuid) | sim | Identificador interno UUID. |
| ativa | boolean | sim | Vinculada ao usuário atual. |

<a id="schema-TesteNotificacao"></a>
### TesteNotificacao

TesteNotificacao

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| inscricaoId | string (uuid) | sim | Inscrição do usuário/dispositivo atual. |

<a id="schema-AvisoAceito"></a>
### AvisoAceito

AvisoAceito

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| aceito | boolean | sim | Aceito para processamento, sem comprovar entrega/exibição. · const=True |

<a id="schema-NotificacaoAlterar"></a>
### NotificacaoAlterar

NotificacaoAlterar

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| lida | boolean | sim | Estado de leitura do aviso próprio. |

<a id="schema-EventoTela"></a>
### EventoTela

EventoTela

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| id | string | sim | Cursor SSE. |
| tipo | enum: mensagem_atualizada, conversa_atualizada, whatsapp_atualizado, operacao_atualizada, notificacao, ressincronizar | sim | DTO de atualização, sem obrigar um GET por mensagem. |
| ocorridoEm | string (date-time) | sim | Instante em UTC; apresentação no fuso da interface. |
| mensagem | MensagemResumo | não | MensagemResumo |
| conversa | ConversaResumo | não | ConversaResumo |
| whatsapp | EstadoWhatsapp | não | EstadoWhatsapp |
| operacao | Operacao | não | Operacao |
| notificacao | Notificacao | não | Notificacao |

```json
{
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "id": {
      "type": "string",
      "description": "Cursor SSE.",
      "examples": [
        "evento-tela-1"
      ]
    },
    "tipo": {
      "type": "string",
      "description": "DTO de atualização, sem obrigar um GET por mensagem.",
      "examples": [
        "mensagem_atualizada"
      ],
      "enum": [
        "mensagem_atualizada",
        "conversa_atualizada",
        "whatsapp_atualizado",
        "operacao_atualizada",
        "notificacao",
        "ressincronizar"
      ]
    },
    "ocorridoEm": {
      "type": "string",
      "description": "Instante em UTC; apresentação no fuso da interface.",
      "examples": [
        "2026-11-16T17:00:00Z"
      ],
      "format": "date-time"
    },
    "mensagem": {
      "$ref": "#/components/schemas/MensagemResumo"
    },
    "conversa": {
      "$ref": "#/components/schemas/ConversaResumo"
    },
    "whatsapp": {
      "$ref": "#/components/schemas/EstadoWhatsapp"
    },
    "operacao": {
      "$ref": "#/components/schemas/Operacao"
    },
    "notificacao": {
      "$ref": "#/components/schemas/Notificacao"
    }
  },
  "required": [
    "id",
    "tipo",
    "ocorridoEm"
  ],
  "description": "EventoTela",
  "oneOf": [
    {
      "properties": {
        "tipo": {
          "const": "mensagem_atualizada"
        }
      },
      "required": [
        "mensagem"
      ],
      "not": {
        "anyOf": [
          {
            "required": [
              "conversa"
            ]
          },
          {
            "required": [
              "whatsapp"
            ]
          },
          {
            "required": [
              "operacao"
            ]
          },
          {
            "required": [
              "notificacao"
            ]
          }
        ]
      }
    },
    {
      "properties": {
        "tipo": {
          "const": "conversa_atualizada"
        }
      },
      "required": [
        "conversa"
      ],
      "not": {
        "anyOf": [
          {
            "required": [
              "mensagem"
            ]
          },
          {
            "required": [
              "whatsapp"
            ]
          },
          {
            "required": [
              "operacao"
            ]
          },
          {
            "required": [
              "notificacao"
            ]
          }
        ]
      }
    },
    {
      "properties": {
        "tipo": {
          "const": "whatsapp_atualizado"
        }
      },
      "required": [
        "whatsapp"
      ],
      "not": {
        "anyOf": [
          {
            "required": [
              "mensagem"
            ]
          },
          {
            "required": [
              "conversa"
            ]
          },
          {
            "required": [
              "operacao"
            ]
          },
          {
            "required": [
              "notificacao"
            ]
          }
        ]
      }
    },
    {
      "properties": {
        "tipo": {
          "const": "operacao_atualizada"
        }
      },
      "required": [
        "operacao"
      ],
      "not": {
        "anyOf": [
          {
            "required": [
              "mensagem"
            ]
          },
          {
            "required": [
              "conversa"
            ]
          },
          {
            "required": [
              "whatsapp"
            ]
          },
          {
            "required": [
              "notificacao"
            ]
          }
        ]
      }
    },
    {
      "properties": {
        "tipo": {
          "const": "notificacao"
        }
      },
      "required": [
        "notificacao"
      ],
      "not": {
        "anyOf": [
          {
            "required": [
              "mensagem"
            ]
          },
          {
            "required": [
              "conversa"
            ]
          },
          {
            "required": [
              "whatsapp"
            ]
          },
          {
            "required": [
              "operacao"
            ]
          }
        ]
      }
    },
    {
      "properties": {
        "tipo": {
          "const": "ressincronizar"
        }
      },
      "not": {
        "anyOf": [
          {
            "required": [
              "mensagem"
            ]
          },
          {
            "required": [
              "conversa"
            ]
          },
          {
            "required": [
              "whatsapp"
            ]
          },
          {
            "required": [
              "operacao"
            ]
          },
          {
            "required": [
              "notificacao"
            ]
          }
        ]
      }
    }
  ],
  "examples": [
    {
      "id": "evento-tela-1",
      "tipo": "mensagem_atualizada",
      "ocorridoEm": "2026-11-16T17:00:00Z",
      "mensagem": {
        "id": "11111111-1111-4111-8111-111111111111",
        "chaveCliente": "msg-local-1",
        "direcao": "entrada",
        "texto": "Gostaria de saber o andamento.",
        "arquivos": [
          {
            "id": "11111111-1111-4111-8111-111111111111",
            "nome": "foto-exemplo.jpg",
            "mimeType": "image/jpeg",
            "tamanhoBytes": 1024,
            "url": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo",
            "miniaturaUrl": "/api/v1/arquivos/11111111-1111-4111-8111-111111111111/conteudo?variante=miniatura"
          }
        ],
        "ocorridoEm": "2026-11-16T17:00:00Z",
        "estadoEnvio": "recebida",
        "atendimentos": [
          {
            "id": "11111111-1111-4111-8111-111111111111",
            "rotulo": "Ana Exemplo",
            "ativo": true
          }
        ]
      }
    },
    {
      "id": "evento-tela-2",
      "tipo": "ressincronizar",
      "ocorridoEm": "2026-11-16T17:00:00Z"
    }
  ]
}
```

<a id="schema-ItemCatalogoSalvar"></a>
### ItemCatalogoSalvar

ItemCatalogoSalvar

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| nome | string | sim | Nome normalizado único no catálogo. · minLength=1 |
| descricao | string \| null | não | Descrição. |
| ativo | boolean | sim | Inativar preserva vínculos e impede novas escolhas. |

<a id="schema-ItemCatalogo"></a>
### ItemCatalogo

ItemCatalogo

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| id | string (uuid) | sim | Identificador interno UUID. |
| versao | integer | sim | Versão informativa do agregado; usar o ETag opaco retornado, sem montá-lo no frontend. · minimum=1 |
| etag | string | sim | Token de edição já disponível também em listas e comparações; usar literalmente em If-Match. |
| nome | string | sim | Nome normalizado único no catálogo. · minLength=1 |
| descricao | string \| null | não | Descrição. |
| ativo | boolean | sim | Inativar preserva vínculos e impede novas escolhas. |

<a id="schema-CatalogoTela"></a>
### CatalogoTela

CatalogoTela

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| catalogo | enum: classificacoes, servicos, categorias | sim | Somente catálogos que possuem editor. |
| dados | array<ItemCatalogo> | sim | Lista de valores. · minItems=0; maxItems=100 |
| paginacao | Pagina | sim | Pagina |
| acoesPermitidas | array<string> | sim | Lista de valores. · minItems=0; maxItems=100 |

<a id="schema-ItemCatalogoAlterar"></a>
### ItemCatalogoAlterar

ItemCatalogoAlterar

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| nome | string | não | Nome normalizado único no catálogo. · minLength=1 |
| descricao | string \| null | não | Descrição. |
| ativo | boolean | não | Inativar preserva vínculos e impede novas escolhas. |

<a id="schema-Permissao"></a>
### Permissao

Permissao

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| codigo | string | sim | Código conhecido pelo backend. |
| descricao | string | sim | Finalidade. |

<a id="schema-PerfilSalvar"></a>
### PerfilSalvar

PerfilSalvar

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| nome | string | sim | Nome do perfil. · minLength=1 |
| permissoes | array<string> | sim | Lista de valores. · minItems=0; maxItems=100 |
| escopo | enum: proprio, equipe, global | sim | Alcance máximo, com verificação de campo adicional. |
| camposRestritos | array<string> | sim | Lista de valores. · minItems=0; maxItems=100 |
| ativo | boolean | sim | Perfil habilitado. |

<a id="schema-Perfil"></a>
### Perfil

Perfil

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| id | string (uuid) | sim | Identificador interno UUID. |
| versao | integer | sim | Versão informativa do agregado; usar o ETag opaco retornado, sem montá-lo no frontend. · minimum=1 |
| etag | string | sim | Token de edição já disponível também em listas e comparações; usar literalmente em If-Match. |
| nome | string | sim | Nome do perfil. · minLength=1 |
| permissoes | array<string> | sim | Lista de valores. · minItems=0; maxItems=100 |
| escopo | enum: proprio, equipe, global | sim | Alcance máximo, com verificação de campo adicional. |
| camposRestritos | array<string> | sim | Lista de valores. · minItems=0; maxItems=100 |
| ativo | boolean | sim | Perfil habilitado. |

<a id="schema-EquipeSalvar"></a>
### EquipeSalvar

EquipeSalvar

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| nome | string | sim | Nome. · minLength=1 |
| descricao | string \| null | não | Descrição. |
| ativa | boolean | sim | Habilitada para novas atribuições. |

<a id="schema-Equipe"></a>
### Equipe

Equipe

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| id | string (uuid) | sim | Identificador interno UUID. |
| versao | integer | sim | Versão informativa do agregado; usar o ETag opaco retornado, sem montá-lo no frontend. · minimum=1 |
| etag | string | sim | Token de edição já disponível também em listas e comparações; usar literalmente em If-Match. |
| nome | string | sim | Nome. · minLength=1 |
| descricao | string \| null | não | Descrição. |
| ativa | boolean | sim | Habilitada para novas atribuições. |

<a id="schema-UsuarioSalvar"></a>
### UsuarioSalvar

UsuarioSalvar

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| nome | string | sim | Nome. · minLength=1 |
| email | string (email) | sim | E-mail único de acesso. |
| senhaInicial | string | sim | Somente criação; segredo nunca retornado/auditado. · minLength=12; somente entrada; segredo não auditável em claro |
| perfilIds | array<string (uuid)> | sim | Lista de valores. · minItems=1; maxItems=100 |
| equipeIds | array<string (uuid)> | sim | Lista de valores. · minItems=0; maxItems=100 |
| ativo | boolean | sim | Desativar revoga acesso e novas notificações. |

<a id="schema-UsuarioAlterar"></a>
### UsuarioAlterar

UsuarioAlterar

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| nome | string | não | Nome. · minLength=1 |
| email | string (email) | não | E-mail único de acesso. |
| perfilIds | array<string (uuid)> | não | Lista de valores. · minItems=1; maxItems=100 |
| equipeIds | array<string (uuid)> | não | Lista de valores. · minItems=0; maxItems=100 |
| ativo | boolean | não | Desativar revoga acesso e novas notificações. |

<a id="schema-Usuario"></a>
### Usuario

Usuario

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| id | string (uuid) | sim | Identificador interno UUID. |
| versao | integer | sim | Versão informativa do agregado; usar o ETag opaco retornado, sem montá-lo no frontend. · minimum=1 |
| etag | string | sim | Token de edição já disponível também em listas e comparações; usar literalmente em If-Match. |
| nome | string | sim | Nome. · minLength=1 |
| email | string (email) | sim | E-mail único de acesso. |
| perfilIds | array<string (uuid)> | sim | Lista de valores. · minItems=1; maxItems=100 |
| equipeIds | array<string (uuid)> | sim | Lista de valores. · minItems=0; maxItems=100 |
| ativo | boolean | sim | Desativar revoga acesso e novas notificações. |

<a id="schema-AcessosTela"></a>
### AcessosTela

AcessosTela

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| usuarios | array<Usuario> | sim | Lista de valores. · minItems=0; maxItems=100 |
| paginacao | Pagina | sim | Pagina |
| perfis | array<Perfil> | sim | Lista de valores. · minItems=0; maxItems=100 |
| equipes | array<Equipe> | sim | Lista de valores. · minItems=0; maxItems=100 |
| catalogoPermissoes | array<Permissao> | sim | Lista de valores. · minItems=0; maxItems=100 |

<a id="schema-SenhaAdministrativa"></a>
### SenhaAdministrativa

SenhaAdministrativa

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| novaSenhaTemporaria | string | sim | Segredo; exigir troca no próximo login. · minLength=12; somente entrada; segredo não auditável em claro |
| motivo | string | sim | Justificativa. · minLength=3 |

<a id="schema-ConfiguracoesDados"></a>
### ConfiguracoesDados

ConfiguracoesDados

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| institucional | object | não |  |
| contato | object | não |  |
| whatsapp | object | não |  |
| retencao | object | não |  |
| limites | Limites | não | Limites |
| sexos | array<object> | não | Lista de valores. · minItems=0; maxItems=100 |

<a id="schema-ConfiguracoesTela"></a>
### ConfiguracoesTela

ConfiguracoesTela

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| id | string (uuid) | sim | Identificador interno UUID. |
| versao | integer | sim | Versão informativa do agregado; usar o ETag opaco retornado, sem montá-lo no frontend. · minimum=1 |
| etag | string | sim | Token de edição já disponível também em listas e comparações; usar literalmente em If-Match. |
| formulario | ConfiguracoesDados | sim | ConfiguracoesDados |
| permissoes | PermissoesTela | sim | PermissoesTela |

<a id="schema-ConfiguracoesAlterar"></a>
### ConfiguracoesAlterar

ConfiguracoesAlterar

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| institucional | object | não |  |
| contato | object | não |  |
| whatsapp | object | não |  |
| retencao | object | não |  |
| limites | Limites | não | Limites |
| sexos | array<object> | não | Lista de valores. · minItems=0; maxItems=100 |

<a id="schema-ResumoGestao"></a>
### ResumoGestao

ResumoGestao

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| abertos | integer | sim | Pedidos autorizados. · minimum=0 |
| vencidos | integer | sim | Pedidos vencidos. · minimum=0 |
| concluidos | integer | sim | Pedidos concluídos no período. · minimum=0 |
| servicosRealizados | integer | sim | Execuções concluídas, separadas dos pedidos. · minimum=0 |
| retornosVencidos | integer | sim | Compromissos vencidos. · minimum=0 |
| semInteracaoRegistrada | integer | sim | Na cobertura autorizada. · minimum=0 |
| calculadoEm | string (date-time) | sim | Instante em UTC; apresentação no fuso da interface. |

<a id="schema-OpcoesBusca"></a>
### OpcoesBusca

OpcoesBusca

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| dados | array<Opcao> | sim | Lista de valores. · minItems=0; maxItems=100 |
| paginacao | Pagina | sim | Pagina |

<a id="schema-EditorFormularioTela"></a>
### EditorFormularioTela

Novo ou edição segundo id; ETag só será usado para editar um formulário existente.

```json
{
  "oneOf": [
    {
      "$ref": "#/components/schemas/FormularioNovo"
    },
    {
      "$ref": "#/components/schemas/FormularioEditor"
    }
  ],
  "description": "Novo ou edição segundo id; ETag só será usado para editar um formulário existente."
}
```

<a id="schema-AutorUsuario"></a>
### AutorUsuario

AutorUsuario

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| tipo | enum: usuario | sim | Autor autenticado. |
| usuarioId | string (uuid) | sim | Identificador interno UUID. |
| nome | string | sim | Nome histórico autorizado do responsável. |

<a id="schema-AutorServico"></a>
### AutorServico

AutorServico

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| tipo | enum: servico | sim | Ação automatizada identificada. |
| codigo | string | sim | Serviço/agente responsável, sem fabricar usuário humano. |
| nome | string | sim | Nome para a linha do tempo. |
| porOrdemDe | Opcao \| null | não | Valor opcional; null significa ausência. |

<a id="schema-AutorPublico"></a>
### AutorPublico

AutorPublico

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| tipo | enum: publico | sim | Declaração por link sem login. |
| nome | string | sim | Origem honesta, sem inventar identidade autenticada. |

<a id="schema-AutorAtividade"></a>
### AutorAtividade

Distingue pessoa autenticada, serviço/agente e envio público não autenticado.

```json
{
  "oneOf": [
    {
      "$ref": "#/components/schemas/AutorUsuario"
    },
    {
      "$ref": "#/components/schemas/AutorServico"
    },
    {
      "$ref": "#/components/schemas/AutorPublico"
    }
  ],
  "description": "Distingue pessoa autenticada, serviço/agente e envio público não autenticado."
}
```

<a id="schema-MensagensAtendimento"></a>
### MensagensAtendimento

MensagensAtendimento

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| dados | array<MensagemResumo> | sim | Lista de valores. · minItems=0; maxItems=100 |
| paginacao | Pagina | sim | Pagina |

<a id="schema-RascunhoMunicipe"></a>
### RascunhoMunicipe

Valores iniciais permitidos; campos ainda não preenchidos podem estar ausentes.

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| nome | string | não | Nome informado, sem documento obrigatório. · minLength=1; maxLength=200 |
| sexoCodigo | string \| null | não | Informação declarada opcional. |
| nascimento | string (date) \| null | não | Data civil no formato AAAA-MM-DD, sem conversão de fuso. |
| observacoes | string \| null | não | Texto final completo do editor, inclusive digitação ainda não salva e trecho transcrito revisado. |
| contatos | array<ContatoFormulario> | não | Lista de valores. · minItems=0; maxItems=100 |
| enderecos | array<EnderecoFormulario> | não | Lista de valores. · minItems=0; maxItems=100 |
| documentos | array<DocumentoFormulario> | não | Lista de valores. · minItems=0; maxItems=100 |
| classificacaoIds | array<string (uuid)> | não | Lista de valores. · minItems=0; maxItems=100 |
| indicadoPorMunicipeId | string (uuid) \| null | não | Outro munícipe existente ou null; valida ciclos sob concorrência. |
| votoGarantido | boolean | não | Anotação manual restrita. False é não marcado; sem inferência/verificação ou uso para comunicação. |
| preferenciaContato | PreferenciaContato | não | PreferenciaContato |
| fotos | array<FotoFormulario> | não | Lista de valores. · minItems=0; maxItems=100 |
| transcricoesUtilizadas | array<OrigemTranscricao> | não | Lista de valores. · minItems=0; maxItems=100 |

<a id="schema-RascunhoAtendimento"></a>
### RascunhoAtendimento

Prefill do novo pedido; campos ainda não preenchidos podem estar ausentes.

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| titulo | string | não | Resumo. · minLength=1 |
| descricao | string | não | Demanda completa. · minLength=1 |
| canal | enum: presencial, telefone, whatsapp, email, outro | não | Origem. |
| categoriaId | string (uuid) \| null | não | Identificador interno UUID. |
| responsavelId | string (uuid) \| null | não | Identificador interno UUID. |
| prazo | string (date-time) \| null | não | Instante em UTC; apresentação no fuso da interface. |
| situacao | enum: aberto, em_andamento, aguardando_informacao, encaminhado, concluido, cancelado | não | Concluir exige resultado; backend valida transições. |
| resultado | string \| null | não | Resultado do pedido. |
| servicos | array<ServicoFormulario> | não | Lista de valores. · minItems=0; maxItems=100 |
| pendencias | array<PendenciaFormulario> | não | Lista de valores. · minItems=0; maxItems=100 |
| anexos | array<AnexoFormulario> | não | Lista de valores. · minItems=0; maxItems=100 |
| notas | array<NotaFormulario> | não | Lista de valores. · minItems=0; maxItems=100 |

<a id="schema-RascunhoFormulario"></a>
### RascunhoFormulario

Prefill do editor de formulário público, antes de validar o Salvar.

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| titulo | string | não | Título público. · minLength=1 |
| descricao | string | não | Finalidade da coleta. |
| evento | EventoFormulario | não | EventoFormulario |
| finalidade | enum: inscricao, presenca | não | Inscrição não comprova presença. |
| camposAtivos | array<enum: nome, sexoCodigo, nascimento, contatos, endereco, documentos> | não | Lista de valores. · minItems=1; maxItems=100 |
| camposObrigatorios | array<enum: nome, sexoCodigo, nascimento, contatos, endereco> | não | Lista de valores. · minItems=1; maxItems=100 |
| abreEm | string (date-time) \| null | não | Instante em UTC; apresentação no fuso da interface. |
| fechaEm | string (date-time) \| null | não | Instante em UTC; apresentação no fuso da interface. |
| situacao | enum: rascunho, aberto, encerrado, revogado | não | Salvar e divulgar pode abrir na mesma transação. |

<a id="schema-NotaCriar"></a>
### NotaCriar

NotaCriar

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| texto | string | sim | Texto interno, nunca enviado ao munícipe. · minLength=1 |

<a id="schema-ProblemaPublico"></a>
### ProblemaPublico

Erro público sem candidatos/IDs internos da base ou detalhes de privilégios.

| Campo | Tipo | Obrigatório | Uso e limites |
| --- | --- | --- | --- |
| type | string (uri) | sim | Tipo do problema. |
| title | string | sim | Título. |
| status | integer | sim | HTTP correspondente. · minimum=400; maximum=599 |
| detail | string | sim | Orientação segura. |
| codigo | string | sim | Código de domínio. |
| requestId | string | sim | Correlação. |
| erros | array<ErroCampo> | não | Lista de valores. · minItems=0; maxItems=100 |
