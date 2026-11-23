# Fluxos e payloads do frontend

Contrato proposto **1.0.0-draft.3**. [Todos os cenários](cenarios.md), [referência de todas as rotas](referencia.md) e [convenções](README.md). Os valores abaixo são fictícios; não executar como uma sequência contra produção.

## Entrar e abrir a aplicação

`POST /auth/login` recebe e-mail/senha e retorna App, além do cookie HttpOnly. Guardar o CSRF em memória e usar os ETags recebidos. Em reload, GET /app é a alternativa de retomada. Não há consulta adicional obrigatória de usuário/perfil/menu. GET /eventos é conexão compartilhada, aberta uma vez enquanto a aplicação estiver ativa.

## Novo munícipe: uma confirmação completa

Abrir `GET /municipes/formulario` uma vez. O usuário preenche tudo localmente. Se escolher fotos, gerar rascunhoId local, enviar um lote em `POST /uploads` e colocar os tokens recebidos nos itens do formulário. Selecionar classificação/indicador existente só muda o estado local. Um Salvar usa `POST /municipes`:

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

Esse único POST valida duplicidade e permissões, resolve contatos compartilháveis, cria pessoa e vínculos, registra fotos/transcrição/contexto e audita. Responde 201 com FichaMunicipe e ETag; a UI renderiza a resposta sem outro GET obrigatório. Sem dados complementares, o menor payload aceito é `{"nome":"Ana Exemplo"}`.

## Edição, duplicidade e foto principal

`GET /municipes/{id}` já contém formulário, referências com nomes, contexto, fotos/URLs, resumos e ETag. Enviar apenas blocos alterados em um PATCH. Coleção enviada é conjunto final integralmente editável; não usar listas truncadas ou ocultas para substituição. Para reorganizar fotos existentes, enviar seus IDs, ordem e principal na mesma ação.

409 de duplicidade já devolve candidatos, evidências e revisão. Se o usuário confirmar pessoa distinta, reenviar o formulário completo com `decisaoDuplicidade` e nova chave de idempotência. Se escolher a ficha existente, navegar para ela. Fusão é comparação/decisão separada e não ocorre automaticamente.

## Áudio com texto ainda não salvo

Enviar `POST /observacoes/transcricoes` multipart com rascunhoId e audio; municipeId só quando existente. O upload e início do trabalho são uma chamada. SSE entrega ResultadoTranscricao; GET /operacoes/{id} é fallback. Revisar e mesclar texto no editor local. Um PATCH final pode ser:

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

No cadastro novo, esses mesmos campos vão no POST inicial. O trecho já integra observacoes; transcricoesUtilizadas apenas registra sua origem. O backend não concatena outra vez. Não existe obrigação de salvar o texto digitado antes de iniciar áudio ou de aplicar transcrição em outra rota.

## Atendimento com pessoa nova e todos os itens

`GET /atendimentos/formulario` monta editor e contexto de pessoa/conversa. Um lote opcional prepara documentos. Um `POST /atendimentos` recebe solicitante novo inline e os itens do pedido:

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
    "tipo": "novo",
    "cadastro": {
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
  },
  "rascunhoId": "11111111-1111-4111-8111-111111111111"
}
```

Chaves locais permitem que anexo-1 aponte para servico-1 sem existir execução persistida. O backend resolve a pessoa, gera protocolo, grava serviços/pendências/notas/anexos e vincula mensagens dentro da mesma transação. Responde com ficha pronta. Para pessoa existente, substituir solicitante por `{"tipo":"existente","municipeId":"11111111-1111-4111-8111-111111111111"}`.

Identidade ainda incerta pode usar `{"tipo":"a_identificar","contatoInformado":{"tipo":"telefone","valor":"+5511999990000"}}`, ou contextoConversa autorizado, preservando a demanda pendente sem criar pessoa fictícia. Corrigir depois usa corrigirSolicitante com o seletor existente/novo e motivo no PATCH do pedido.

## Concluir pedido sem gravar cada item

A ficha já entrega ETag. Um `PATCH /atendimentos/{id}` pode concluir o pedido e registrar o resultado da pendência na mesma confirmação:

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

Coleções presentes precisam incluir os itens que devem permanecer. Erro de item impede todo o comando; campo de resultado, permissão e estado são revalidados no backend.

## Caixa, resposta e resultado incerto

GET /caixa devolve linhas prontas. Selecionar GET /conversas/{id} entrega workspace; Assumir é um POST atômico e já retorna o novo workspace. Texto/mídias são enviados por um único POST /conversas/{id}/mensagens com chaveCliente. 202 é linha pendente; stream atualiza entrega. Notas internas usam compositor/rota própria.

No botão Tentar novamente, POST /mensagens/{id}/tentar-novamente reconcilia antes de decidir reenviar. O frontend não faz checagem de provedor seguida de outra chamada para reenvio. Novo pedido a partir do diálogo usa POST /atendimentos com contextoConversa; os vínculos são gravados junto do pedido.

## Lista, relatório e datas

POST /municipes/pesquisa é compartilhado por lista/relatório. Exemplo de aniversariantes de novembro com todas as classificações escolhidas e busca em dados/pedidos:

```json
{
  "q": "iluminação",
  "filtros": {
    "nascimento": {
      "modo": "componentes",
      "mes": 11
    },
    "classificacaoIds": [
      "11111111-1111-4111-8111-111111111111"
    ],
    "classificacaoModo": "todas"
  },
  "limite": 25,
  "incluirTotal": true,
  "ordenarPor": "nome",
  "direcao": "asc"
}
```

As linhas já têm referência, resumo, trechos e origem da coincidência; não buscar uma ficha por linha. Outras datas aceitam dia, ano, combinações, intervalo inclusivo e ausência. Exemplo de GET de agenda: `GET /agenda?data=%7B%22modo%22%3A%22componentes%22%2C%22mes%22%3A11%7D`. A data se aplica ao previstoEm do compromisso.

## Link público e conferência interna

Na equipe: GET /formularios/editor monta; POST /formularios cria evento inline, formulário e link já aberto conforme situacao. No link: GET de configuração pública e POST da declaração retornam recibo uniforme, sem consultar a base.

Na conferência: GET /cadastros-recebidos/{id} já traz declaração, candidatos, ficha comparada e contexto de criação. Pode trocar o candidato com compararComMunicipeId na mesma rota. Confirmar novo usa:

```json
{
  "acao": "integrar_novo",
  "cadastro": {
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
  },
  "motivo": "Nova pessoa confirmada."
}
```

Alternativa de incorporar ao existente, sem cadastro/atualização preliminar:

```json
{
  "acao": "integrar_existente",
  "municipeId": "11111111-1111-4111-8111-111111111111",
  "etagMunicipe": "\"edicao-1\"",
  "alteracoes": {
    "observacoes": "Informação conferida e escolhida no comparador."
  },
  "motivo": "Identidade e campos conferidos."
}
```

Se todos os dados existentes devem permanecer, omitir alteracoes; a integração registra participação/origem/decisão sem alteração fictícia. If-Match é o ETag do temporário já aberto. O ETag do destino vem na ficha comparada. Permissão e todas as versões são revalidadas dentro do comando. Pessoa/participação/decisão ficam consistentes sem POST separado. Assume/adiar/transferir/descartar são outros botões finitos do contrato, não pré-requisitos técnicos ocultos da integração.

## Etiquetas sem cadeia de preparação de entidades

GET /etiquetas/preparacao entrega modelo padrão completo, formato/opções e versões. Usuário pode editar o layout localmente. Um POST /etiquetas/previas recebe seleção e escolhas:

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

Os discriminadores permitem modelo tipo rascunho com dados completos e formato tipo personalizado com medidas. Não é obrigatório salvá-los em bibliotecas. Seleção pode ser tipo consulta com PesquisaMunicipes ou IDs explícitos. Backend materializa, valida endereço/grade/texto/cópias e gera PDF imutável; Operacao entrega arquivo/contagens. Conferir e imprimir abre o MESMO arquivo, sem POST de gerar definitivo nem alegação de impressão física. Alterar escolhas requer nova prévia.

## Histórico, fusão e reversão

GET /historico serve tanto à tela global quanto à aba com alvoTipo/alvoId. Abrir atividade já entrega diferenças, impactos e token de reversão. Confirmar usa um POST com motivo/token; não apaga o original nem recolhe efeitos externos consumados.

Comparação de fusão usa POST /municipes/fusoes/preparar sem efeitos, retornando as duas fichas completas e dependências. Confirmar envia revisaoToken, formularioFinal escolhido e motivo em POST /municipes/fusoes. Não obriga PATCH separado de cada coleção/relação.

## Administração e seletores

GET /administracao/acessos entrega linhas de usuários, equipes/perfis editáveis e permissões. Criar/editar usuário inclui as associações em um comando. Os ETags das linhas permitem salvar sem GET de cada item.

Classificação inexistente pode ser cadastrada pelo modal do catálogo; a resposta já é selecionável no editor local. O vínculo com pessoa só é gravado no salvar agregado. GET /opcoes é usado ao pesquisar opções maiores; rótulos dos selecionados já vêm na tela. Nenhuma seleção existente exige criar associação antecipada.

## Orçamento e limites

Os cenários não escondem requisições de bytes ou progresso. Um cadastro novo sem arquivos requer uma montagem e um Salvar; com arquivos, acrescenta lote de upload. Uma tarefa demorada usa SSE compartilhado ou consultas de fallback e leitura do arquivo quando aplicável. Trocar filtro, paginar ou revisar conflito é interação real. A confirmação de cada agregado continua sendo uma gravação. Limites anunciados impedem truncamento silencioso; desempenho real precisa ser medido no backend futuro.
