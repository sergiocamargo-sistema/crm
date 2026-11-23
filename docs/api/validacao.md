# Validação documental — 1.0.0-draft.3

Executada em 16/11/2026 23:36 -0300. Estado: contrato proposto, sem backend implementado.

- Frontend: **88 operações / 79 caminhos / 180 schemas utilizados**.
- Integrações separadas: **2 operações / 2 caminhos / 8 schemas**.
- Métodos do frontend: POST 36, GET 32, PATCH 16, DELETE 4.
- **26 cenários completos**; todas as operações têm tela e ação no manifesto.
- OpenAPI 3.1.1 de ambos os contratos validado por openapi-spec-validator; schemas com JSON Schema 2020-12 e formatos.
- YAML = JSON = fonte gerada, referências internas resolvidas (1234 ocorrências), operationIds/parâmetros sem duplicação e rotas normalizadas sem colisão.
- **1239 exemplos** de campos/schemas, entradas, respostas e parâmetros verificados; **8 payloads JSON dos fluxos humanos** conferidos contra o contrato.
- **32 casos estruturalmente inválidos** rejeitados: variantes, datas, referências, campos desconhecidos, PATCH vazio, evento sem DTO, resultado de operação e privacidade do erro público.
- Invariantes documentais: uma confirmação por agregado, payload completo de pessoa/pedido, pessoa nova inline, áudio/upload sem alvo persistido, ETags nas linhas/fichas, nenhuma rota CRUD fragmentada selecionada, futura ou técnica no frontend.
- Segurança declarativa: sessão/CSRF, idempotência, If-Match/412/428, DELETE sem corpo e erros públicos separados conferidos.
- Dois HTMLs com IDs únicos, estrutura de tags verificada, endpoints/schemas presentes e **709 links/âncoras locais** conferidos; **2 scripts** passaram em node --check.
- Exemplos HTTP presentes para todas as ações do frontend. Leituras GET usam cabeçalhos/seletores; bytes multipart são marcadores a substituir por arquivos reais.

## Reproduzir

```sh
/tmp/gabinete-api-docs-venv/bin/python scripts/gerar_documentacao_api.py
/tmp/gabinete-api-docs-venv/bin/python scripts/validar_documentacao_api.py
```

Dependências em [requirements-docs.txt](requirements-docs.txt); fontes em [contrato](../../scripts/api_contrato.py), [renderização](../../scripts/api_render.py) e [validador](../../scripts/validar_documentacao_api.py).

## Limites da verificação

Não houve execução de endpoints, banco, frontend, testes de autorização real, transações, concorrência do grafo, idempotência sob falha, armazenamento, conector WhatsApp, IA/transcrição, Web Push, PDF ou impressão física. Não houve inspeção visual automatizada do navegador. O contrato contém regras que o schema não resolve sozinho, como início ≤ fim, ciclos, posse de IDs/tokens, escopo de acesso, grade física e efeitos externos.

Os testes acima comprovam a consistência dos documentos e exemplos, não o comportamento ou desempenho do sistema futuro. Cenários de implementação permanecem em [regras de negócio](regras-negocio.md) e no [planejamento](../planejamento.md).
