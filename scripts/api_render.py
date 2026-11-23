"""Renderização dos contratos por tela, sem servidor ou dependências web externas."""
import html
import json
from collections import Counter
from api_contrato import OUT, SCHEMAS, ERRORS, VERSION, PLAN, resolve, SCENARIOS, PERMISSIONS

def typename(s):
    if "$ref" in s:
        return s["$ref"].rsplit("/", 1)[1]
    if "enum" in s:
        return "enum: " + ", ".join(str(x) for x in s["enum"])
    if s.get("type") == "array":
        return "array<" + typename(s["items"]) + ">"
    for kind in ["anyOf", "oneOf"]:
        if kind in s and "type" not in s:
            return " | ".join(typename(x) for x in s[kind])
    return str(s.get("type", "objeto")) + (" (" + s["format"] + ")" if "format" in s else "")

def prop_rows(schema_):
    resolved = resolve(schema_)
    required = set(resolved.get("required", []))
    rows = []
    for name, val in resolved.get("properties", {}).items():
        constraints = []
        for key in ["minLength", "maxLength", "minimum", "maximum", "minItems", "maxItems", "pattern", "const", "default"]:
            if key in val:
                constraints.append(f"{key}={val[key]}")
        if val.get("writeOnly"):
            constraints.append("somente entrada; segredo não auditável em claro")
        desc = val.get("description", resolve(val).get("description", ""))
        rows.append([name, typename(val), "sim" if name in required else "não", desc + ((" · " + "; ".join(constraints)) if constraints else "")])
    return rows

def md_table(headers, rows):
    def clean(v):
        return str(v).replace("|", "\\|").replace("\n", " ")
    return "\n".join(["| " + " | ".join(headers) + " |", "| " + " | ".join("---" for _ in headers) + " |", *["| " + " | ".join(clean(x) for x in row) + " |" for row in rows]])

def success_responses(operation):
    return [(code, val) for code, val in operation["responses"].items() if code.startswith("2")]

def refname(schema_):
    return schema_.get("$ref", "").rsplit("/", 1)[-1]

def h(value):
    return html.escape(str(value), quote=True)

def html_table(headers, rows):
    return '<div class="table-wrap"><table><thead><tr>' + "".join("<th>" + h(v) + "</th>" for v in headers) + "</tr></thead><tbody>" + "".join("<tr>" + "".join("<td>" + h(v) + "</td>" for v in row) + "</tr>" for row in rows) + "</tbody></table></div>"


def operations(spec):
    return [(p, m, o) for p, methods in spec['paths'].items() for m, o in methods.items()]


def stats(spec):
    return {'operacoes': len(operations(spec)), 'caminhos': len(spec['paths']), 'schemas': len(spec['components']['schemas']), 'metodos': dict(Counter(m.upper() for _, m, _ in operations(spec)))}


def operation_id(method, path):
    import re
    return re.sub(r'[^a-zA-Z0-9]+', '_', method.lower() + '_' + path).strip('_')


def step(when, role, method, path):
    return {'quando': when, 'papel': role, 'operacoes': [operation_id(method, path)]}


def parameter_type(p):
    return typename(p.get('schema', next(iter(p.get('content', {}).values()), {}).get('schema', {})))


def scenarios(spec):
    flows = []
    def add(key, title, load, save, note, optional=None):
        steps = []
        if load:
            steps.append(step('Abrir tela ou selecionar registro', 'carregamento', *load))
        if optional:
            steps.append(step(optional[0], 'preparacao_opcional', *optional[1:]))
        steps.append(step('Confirmar ação principal', 'confirmacao', *save))
        entry = {'id': key, 'cenario': title, 'etapas': steps, 'observacao': note, 'salvamentoUnico': operation_id(*save), 'maxChamadasConfirmacao': 1}
        flows.append(entry)
    add('novo-municipe', 'Cadastrar pessoa completa', ('get','/municipes/formulario'), ('post','/municipes'), 'Sem documento obrigatório. Pessoa, contatos compartilháveis, endereços, documentos, classificações, indicação e fotos são salvos em uma transação. Sem arquivos: uma montagem + uma gravação. O resultado já é a ficha atual.', ('Se escolher arquivos: lote de bytes ligado ao rascunho local','post','/uploads'))
    add('editar-municipe', 'Editar ficha e reorganizar fotos', ('get','/municipes/{id}'), ('patch','/municipes/{id}'), 'A ficha já entrega ETag, nomes dos selecionados, URLs e coleções editáveis completas. Salvar devolve a ficha atual; não exige GET posterior.', ('Somente se incluir novas fotos','post','/uploads'))
    add('atendimento-completo', 'Criar pedido, inclusive com solicitante novo', ('get','/atendimentos/formulario'), ('post','/atendimentos'), 'Pessoa nova recebe cadastro completo inline. Uma transação cria pedido, serviços, pendências, notas, anexos e vínculos com mensagens. Chaves locais resolvem o vínculo de anexo ao serviço ainda sem ID.', ('Se houver documentos/fotos','post','/uploads'))
    add('concluir-pedido', 'Editar ou concluir atendimento com seus itens', ('get','/atendimentos/{id}'), ('patch','/atendimentos/{id}'), 'Um botão pode editar dados, concluir pedido e registrar resultados de serviços e pendências. Qualquer falha aborta o conjunto. Sem PATCH obrigatório de cada filho.')
    add('retomada', 'Encontrar retorno e registrar resultado', ('get','/agenda'), ('patch','/agenda/{id}'), 'Lista já inclui pessoa, protocolo, ações e ETag. Uma gravação conclui/reagenda, registra tentativa ou interação efetiva, preferência e próximo retorno. Sem resposta não renova último contato efetivo.')
    add('assumir', 'Selecionar e assumir conversa', ('get','/conversas/{id}'), ('post','/conversas/{id}/assumir'), 'Antes de selecionar, GET /caixa desenha a fila com linhas prontas. Selecionar carrega workspace completo. Assumir é ação humana distinta e devolve o workspace atual, sem GET posterior.')
    add('responder', 'Enviar texto ou mídia', None, ('post','/conversas/{id}/mensagens'), '202 devolve a linha pendente com chaveCliente. SSE atualiza entrega. Texto não exige upload; mídias usam um lote. Falha incerta tem um botão Tentar novamente cujo backend reconcilia antes de reenviar.', ('Somente para mídia','post','/uploads'))
    add('contexto', 'Corrigir pessoa, vínculos de mensagens ou modo IA', None, ('patch','/conversas/{id}/contexto'), 'Um modal, uma gravação. Novo pedido usa POST /atendimentos com contextoConversa; nova pessoa usa POST /municipes com contextoConversa. Não exige criar e depois vincular.')
    add('conexao', 'Receber aviso e reconectar WhatsApp', ('get','/whatsapp'), ('post','/whatsapp/{id}/reconectar'), 'Uma leitura traz estado, tentativa ativa, instruções/QR permitido e incidentes. Uma chamada inicia recuperação/renovação apropriada. SSE informa estado; QR novo é consultado na tela autorizada.')
    add('push', 'Ativar alertas do Chrome', None, ('post','/notificacoes/inscricoes'), 'Antes da chamada, o próprio navegador solicita consentimento e cria PushSubscription. API salva inscrição do usuário/dispositivo; não concede permissão do Chrome. Testar é outro botão explícito.')
    add('criar-formulario', 'Criar evento e link já aberto', ('get','/formularios/editor'), ('post','/formularios'), 'Evento novo inline, configuração, janela e estado de coleta são uma transação. Sem criar evento, formulário e abrir link em três gravações.')
    add('publico', 'Autocadastro sem consulta à base', ('get','/publico/formularios/{token}'), ('post','/publico/formularios/{token}/envios'), 'A configuração já traz opções públicas. Recebe declaração completa e confirma recibo igual para novo/existente, sem IDs internos ou candidatos.')
    add('conferencia', 'Integrar temporário em pessoa nova ou existente', ('get','/cadastros-recebidos/{id}'), ('post','/cadastros-recebidos/{id}/conferencia'), 'A fila usa GET /cadastros-recebidos. O detalhe inclui declaração, candidatos, ficha comparada e contexto de cadastro novo. Confirmar salva pessoa, escolhas explícitas, participação, decisão e temporário juntos. Sem cadastro prévio de pessoa.')
    add('presenca', 'Incluir participante novo e presença', ('get','/formularios/{id}/participantes'), ('post','/formularios/{id}/participantes'), 'Solicitante novo pode vir completo inline; pessoa e participação são atômicas. Correção posterior usa PATCH da participação, com ETag já na linha. Não duplica pessoa/evento nem cria atendimento automaticamente.')
    add('etiquetas', 'Gerar PDF para conferir e imprimir', ('get','/etiquetas/preparacao'), ('post','/etiquetas/previas'), 'Envia IDs ou consulta, modelo salvo/rascunho e formato salvo/personalizado. Um comando materializa, valida e gera um PDF imutável. Abrir GET /arquivos/{id}/conteudo é leitura de bytes para a prévia e impressão do MESMO PDF. Nenhum POST prévio de seleção/template/formato é obrigatório. Salvar biblioteca é outra intenção opcional.')
    add('fusao', 'Comparar duplicados e confirmar valores finais', ('post','/municipes/fusoes/preparar'), ('post','/municipes/fusoes'), 'Preparar é consulta sem efeitos, apesar de POST. Retorna duas fichas, diferenças, dependências e token. Confirmar grava formulário final, relações e rastreamento em uma transação.')
    add('reversao', 'Revisar impacto e reverter atividade', ('get','/historico/{id}'), ('post','/historico/{id}/reverter'), 'Detalhe já inclui diferenças, impacto e token. Dois passos humanos reais, sem endpoint extra de prévia. Confirmação revalida dependências e preserva original; efeito externo consumado tem limite explícito.')
    add('acessos', 'Cadastrar usuário com perfis e equipes', ('get','/administracao/acessos'), ('post','/administracao/usuarios'), 'Uma leitura traz usuários paginados, perfis/equipes completos e permissões. Um salvar grava usuário e associações. Edição/desativação usa PATCH com ETag da linha, sem GET individual.')
    add('configuracoes', 'Salvar configurações do gabinete', ('get','/administracao/configuracoes'), ('patch','/administracao/configuracoes'), 'Uma versão e uma gravação para os blocos alterados do formulário autorizado; sem CRUD por chave de configuração.')
    flows += [
        {'id':'acesso','cenario':'Entrar ou retomar a aplicação','observacao':'Login já entrega App, conta, menu e CSRF. GET /app é alternativa ao recarregar com sessão ativa, não etapa obrigatória após login. SSE é conexão compartilhada.','etapas':[step('Entrar','confirmacao','post','/auth/login'),step('Alternativa: sessão ativa após reload','alternativa','get','/app'),step('Aplicação aberta','acompanhamento','get','/eventos')]},
        {'id':'audio','cenario':'Ditar observações antes ou depois do cadastro','observacao':'Um multipart envia áudio e inicia tarefa, inclusive sem munícipe salvo. SSE entrega resultado; polling só no fallback. Usuário revisa e mescla LOCALMENTE com texto ainda não salvo. Último passo é POST /municipes OU PATCH da ficha, nunca ambos. Não exige salvar o texto antes nem aplicar a transcrição depois.','etapas':[step('Enviar/gravar e transcrever','preparacao_opcional','post','/observacoes/transcricoes'),step('Fallback de progresso/retomada','acompanhamento','get','/operacoes/{id}'),step('Se nova pessoa','alternativa','post','/municipes'),step('Se pessoa existente','alternativa','patch','/municipes/{id}')]},
        {'id':'duplicidade','cenario':'Revisar conflito do próprio salvar','observacao':'409 já retorna candidatos/motivos/token. Se decidir pessoa distinta, reenviar formulário com decisão e nova chave de idempotência. Só há segunda gravação após decisão humana real; nenhum endpoint de checagem prévia é obrigatório.','etapas':[step('Salvar e eventualmente receber 409','confirmacao','post','/municipes'),step('Se 409: confirmar pessoa distinta','decisao','post','/municipes')]},
        {'id':'pesquisa','cenario':'Lista, relatório e busca geral','observacao':'Uma pessoa por linha com nomes, contadores e origem da coincidência. A mesma consulta atende à lista e relatório. Uma chamada por alteração de filtros/página, independente do número de linhas.','etapas':[step('Pesquisar/filtrar/paginar','navegacao','post','/municipes/pesquisa')]},
        {'id':'indicacoes','cenario':'Raízes, filhos, folha e retorno por níveis','observacao':'Um GET por nível; sem indicadorId abre raízes, com ele abre filhos diretos e caminho para voltar. Alterar indicação é parte do Salvar pessoa, sem outro endpoint de vínculo.','etapas':[step('Abrir/descer/voltar um nível','navegacao','get','/relatorios/indicacoes')]},
        {'id':'abas','cenario':'Históricos longos sob demanda','observacao':'São abas/páginas explícitas, não pré-requisitos para montar ou salvar o editor. A ficha já contém resumo e itens recentes.','etapas':[step('Aba Anexos','alternativa','get','/municipes/{id}/anexos'),step('Aba Participações','alternativa','get','/municipes/{id}/participacoes'),step('Histórico do alvo','alternativa','get','/historico'),step('Mais mensagens além da primeira página do pedido','alternativa','get','/atendimentos/{id}/mensagens')]},
        {'id':'classificacao','cenario':'Criar classificação dentro do editor','observacao':'Criar item do catálogo é outra intenção explícita, só se faltar opção. O modal devolve objeto selecionável; vínculo com pessoa é criado somente no salvar agregado. Selecionar classificação existente nunca exige POST de associação.','etapas':[step('Se faltar opção: cadastrar no modal','decisao','post','/administracao/catalogos/{catalogo}'),step('Salvar pessoa com classificacaoIds','confirmacao','patch','/municipes/{id}')]},
    ]
    return {'versao': VERSION, 'estado':'proposto-nao-implementado', 'criterio':'Confirmação grava agregado em uma chamada. Montagem, bytes, lookup opcional, revisão humana e acompanhamento são distinguidos.', 'fluxos':flows,'acoes':SCENARIOS}


def schema_link(s):
    name=refname(s)
    return f'[{name}](#schema-{name})' if name else f'`{typename(s)}`'


def render_reference(spec):
    s=stats(spec)
    lines=[f'# Referência da API — {VERSION}', '', f"Contrato proposto: {s['operacoes']} operações em {s['caminhos']} caminhos. Base `/api/v1`. Nenhuma rota implementada.", '', '[Convenções](README.md) · [Fluxos](fluxos.md) · [Cenários](cenarios.md) · [Integrações separadas](integracoes.md)', '']
    lines += [md_table(['Tela','Ação','Endpoint'],[[o['x-tela'],o['summary'],f"[{m.upper()} {p}](#{o['operationId']})"] for p,m,o in operations(spec)]),'']
    for path,method,o in operations(spec):
        lines += [f'<a id="{o["operationId"]}"></a>',f'## {method.upper()} {path}','',f"**Tela:** {o['x-tela']}. **Ação:** {o['summary']}.",'',o['description'],'','Permissões: '+(', '.join('`'+v+'`' for v in o['x-permissoes']) or ('público' if not o['security'] else 'sessão e acesso atual ao recurso'))+'.','']
        if o['parameters']:
            lines += [md_table(['Nome','Local','Obrigatório','Tipo','Uso'],[[p['name'],p['in'],'sim' if p.get('required') else 'não',typename(p.get('schema',next(iter(p.get('content',{}).values()),{}).get('schema',{}))),p.get('description','')] for p in o['parameters']]),'']
        for mime,media in o.get('requestBody',{}).get('content',{}).items():
            lines += [f'Entrada obrigatória `{mime}`: '+schema_link(media['schema'])+'.','',md_table(['Campo','Tipo','Obrigatório','Uso'],prop_rows(media['schema'])),'','```json',json.dumps(media['example'],ensure_ascii=False,indent=2),'```','']
        for code,response in success_responses(o):
            lines += [f"**Resposta {code}:** {response['description']}",'']
            for mime,media in response.get('content',{}).items():
                lines += [f'`{mime}` · '+schema_link(media['schema']),'']
                if 'example' in media:
                    sample=json.dumps(media['example'],ensure_ascii=False,indent=2) if mime=='application/json' else str(media['example'])
                    lines += ['```'+('json' if mime=='application/json' else 'text'),sample,'```','']
            if response.get('headers'):
                lines += [md_table(['Header retornado','Uso'],[[k,v.get('description','Correlação e cache.')] for k,v in response['headers'].items()]),'']
        lines += ['Erros: '+', '.join('`'+c+'`' for c in o['responses'] if not c.startswith('2'))+'. Ver [envelope e comportamento](README.md#erros).','']
        if o['x-backend-resolve']:
            lines += ['O backend resolve nesta ação: '+'; '.join(o['x-backend-resolve'])+'.','']
    lines += ['## Dicionário dos payloads utilizados','','Somente schemas alcançáveis pelas operações. O JSON completo explicita variantes exclusivas e regras condicionais.','']
    for name,value in spec['components']['schemas'].items():
        lines += [f'<a id="schema-{name}"></a>',f'### {name}','',value.get('description',''),'']
        if prop_rows(value):
            lines += [md_table(['Campo','Tipo','Obrigatório','Uso e limites'],prop_rows(value)),'']
        if any(k in value for k in ['oneOf','anyOf','allOf']):
            lines += ['```json',json.dumps(value,ensure_ascii=False,indent=2),'```','']
    (OUT/'referencia.md').write_text('\n'.join(lines),encoding='utf-8')


def render_coverage(spec,manifest):
    (OUT/'cenarios.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    lines=[f'# Cenários completos do frontend — {VERSION}','',manifest['criterio'],'','Uma montagem + um Salvar são duas requisições com finalidades distintas. Upload é lote até o limite de App. Autocomplete, paginação e revisão de conflitos correspondem a ações reais. SSE é compartilhado; polling só quando necessário.','']
    lookup={o['operationId']:(p,m) for p,m,o in operations(spec)}
    for flow in manifest['fluxos']:
        lines += ['## '+flow['cenario'],'',flow['observacao'],'',md_table(['Quando','Papel','Chamada'],[[s['quando'],s['papel'],'; '.join(f'`{lookup[i][1].upper()} {lookup[i][0]}`' for i in s['operacoes'])] for s in flow['etapas']]),'']
        if 'salvamentoUnico' in flow:
            lines += ['**Confirmação principal: uma gravação de negócio**, com validação e auditoria do conjunto.','']
    (OUT/'cenarios.md').write_text('\n'.join(lines),encoding='utf-8')
    lines=['# Cobertura: tela → ação → endpoint','',f"{len(manifest['fluxos'])} cenários completos e {len(manifest['acoes'])} ações. [Ordem e orçamento de chamadas](cenarios.md) · [Manifesto verificável](cenarios.json).",'',md_table(['Tela','Ação do frontend','Endpoint','Backend resolve'],[[o['x-tela'],o['summary'],f'`{m.upper()} {p}`','; '.join(o['x-backend-resolve']) or 'DTO pronto ou ação explícita da tela.'] for p,m,o in operations(spec)]),'','## Fora do catálogo de telas','','Webhook de conector e saúde da infraestrutura têm [contrato separado](integracoes.md). Importação, exportação, portal, relatórios personalizados, filtros salvos e expansão MCP continuam no planejamento, sem rotas antecipadas.','','O frontend ainda não existe. A cobertura parte das telas planejadas; latência, SQL, autorização e atomicidade precisam ser verificadas na implementação.']
    (OUT/'cobertura.md').write_text('\n'.join(lines)+'\n',encoding='utf-8')


def render_html(spec,manifest):
    s=stats(spec)
    cards=[]
    for path,method,o in operations(spec):
        c=[f'<article class="endpoint" id="{o["operationId"]}" data-method="{method.upper()}" data-module="{h(o["tags"][0])}">',f'<p class="eyebrow">{h(o["tags"][0])} · {h(o["x-tela"])}</p>',f'<h3><span class="verb {method}">{method.upper()}</span> <code>{h(path)}</code></h3>',f'<h4>{h(o["summary"])}</h4><p>{h(o["description"])}</p>','<p class="muted">Permissões: '+h(', '.join(o['x-permissoes']) or ('público' if not o['security'] else 'sessão e acesso atual ao recurso'))+' · Proposto, sem implementação.</p>']
        if o['parameters']:
            c += ['<details><summary>Parâmetros e headers</summary>',html_table(['Nome','Local','Obrigatório','Tipo / opções','Uso'],[[p['name'],p['in'],'sim' if p.get('required') else 'não',parameter_type(p),p.get('description','')] for p in o['parameters']]),'<pre><code>'+h(json.dumps(o['parameters'],ensure_ascii=False,indent=2))+'</code></pre></details>']
        if o.get('x-permissoes-por-acao'):
            c += ['<details><summary>Permissões por ação da conferência</summary>',html_table(['Ação','Permissões adicionais'],[[k,', '.join(v)] for k,v in o['x-permissoes-por-acao'].items()]),'</details>']
        for mime,media in o.get('requestBody',{}).get('content',{}).items():
            name=refname(media['schema'])
            c += [f'<details><summary>Entrada · {h(mime)} · {h(name)}</summary>',html_table(['Campo','Tipo','Obrigatório','Uso'],prop_rows(media['schema'])),f'<p><a href="#schema-{name}">Schema completo</a></p><pre><code>{h(json.dumps(media["example"],ensure_ascii=False,indent=2))}</code></pre></details>']
        for code,response in success_responses(o):
            c += [f'<details><summary>Resposta {code} · headers e exemplo</summary><p>{h(response["description"])}</p>',html_table(['Header','Uso'],[[k,v.get('description','Correlação e cache.')] for k,v in response.get('headers',{}).items()])]
            for mime,media in response.get('content',{}).items():
                name=refname(media['schema'])
                c += ['<p>'+h(mime)+(f' · <a href="#schema-{name}">{h(name)}</a>' if name else '')+'</p>']
                if 'example' in media:
                    sample=json.dumps(media['example'],ensure_ascii=False,indent=2) if mime=='application/json' else str(media['example'])
                    c += [f'<pre><code>{h(sample)}</code></pre>']
            c += ['</details>']
        c += ['<p class="muted">Erros: '+h(', '.join(k for k in o['responses'] if not k.startswith('2')))+' · <a href="README.md#erros">envelope e comportamento</a></p>']
        if o['x-backend-resolve']:
            c += ['<p><strong>Backend resolve:</strong> '+h('; '.join(o['x-backend-resolve']))+'.</p>']
        cards.append('\n'.join(c+['</article>']))
    schemas=''.join(f'<details class="schema" id="schema-{name}"><summary>{h(name)}</summary><p>{h(v.get("description",""))}</p>{html_table(["Campo","Tipo","Obrigatório","Uso"],prop_rows(v))}<pre><code>{h(json.dumps(v,ensure_ascii=False,indent=2))}</code></pre></details>' for name,v in spec['components']['schemas'].items())
    modules=''.join('<option>'+h(t['name'])+'</option>' for t in spec['tags'])
    flow_cards=''.join(f'<details><summary>{h(f["cenario"])}</summary><p>{h(f["observacao"])}</p>{html_table(["Quando","Papel","Operação"],[[x["quando"],x["papel"],", ".join(x["operacoes"])] for x in f["etapas"]])}</details>' for f in manifest['fluxos'])
    page='''<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>API por telas · Gabinete CRM</title><style>
:root{color-scheme:light;--ink:#172c38;--muted:#4e6571;--line:#d4e0e5;--bg:#f4f7f8}*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.6 system-ui,sans-serif}a{color:#075d83}header,main,footer{max-width:1180px;margin:auto;padding:28px}header{padding-top:42px}h1{font-size:clamp(28px,5vw,44px);line-height:1.15;margin:12px 0}h2{margin-top:30px}h3{font-size:19px;overflow-wrap:anywhere}h4{margin:10px 0}p{max-width:95ch}.eyebrow{color:#086b67;font-size:13px;font-weight:700}.muted{color:var(--muted);font-size:14px}.stats{display:flex;gap:12px;flex-wrap:wrap}.stats span,.notice{background:#e0efeb;border-radius:8px;padding:12px 16px}.stats strong{display:block;font-size:25px}nav{display:flex;gap:16px;flex-wrap:wrap;margin:20px 0}.filters{position:sticky;top:0;z-index:2;display:flex;gap:12px;flex-wrap:wrap;background:#f4f7f8f5;padding:14px 0;border-bottom:1px solid var(--line)}label{font-size:14px;display:flex;flex-direction:column;gap:4px}label:first-child{flex:1;min-width:220px}input,select{padding:10px;border:1px solid #8099a5;border-radius:6px;background:white;color:var(--ink);font:inherit}.endpoint,section.panel{background:white;padding:24px;border:1px solid var(--line);border-radius:10px;margin:18px 0}.endpoint,.schema{scroll-margin-top:110px}.verb{display:inline-block;padding:3px 7px;border-radius:5px;background:#e2edf7;color:#174774;font-size:13px}.post{background:#e0f3e8;color:#195d35}.patch{background:#fff0d3;color:#77510d}.delete{background:#fce5e2;color:#97312c}details{border-top:1px solid var(--line);padding:12px 0}summary{cursor:pointer;font-weight:650}pre{max-height:520px;overflow:auto;padding:18px;background:#132934;color:#e5f1f4;border-radius:6px;font-size:13px;line-height:1.5}code{font-family:ui-monospace,monospace}.table-wrap{overflow:auto}table{width:100%;border-collapse:collapse;font-size:14px}th,td{text-align:left;padding:10px;vertical-align:top;border-bottom:1px solid var(--line);overflow-wrap:anywhere}th{background:#edf4f6}[hidden]{display:none!important}:focus-visible{outline:3px solid #f4ae37;outline-offset:3px}@media(max-width:650px){header,main,footer{padding:16px}.endpoint,section.panel{padding:16px}.filters{position:static}th,td{padding:8px}}
</style></head><body><header><p class="eyebrow">PLANEJAMENTO @@PLAN@@ · @@VERSION@@ · 16/11/2026</p><h1>A API acompanha as ações da tela</h1><p>Cadastrar um munícipe completo é uma gravação. Abrir a ficha entrega os dados, os nomes das referências e o contexto de edição. Serviços, vínculos e documentos são resolvidos pelo backend dentro da ação.</p><p class="notice"><strong>Contrato proposto.</strong> O projeto contém documentação; nenhuma rota está implementada. Base prevista: <code>/api/v1</code>.</p><div class="stats"><span><strong>@@OPS@@</strong>ações do frontend</span><span><strong>@@PATHS@@</strong>caminhos</span><span><strong>@@FLOWS@@</strong>cenários completos</span><span><strong>1</strong>gravação por Salvar agregado</span></div><nav aria-label="Documentos"><a href="../../index.html">Planejamento</a><a href="README.md">Convenções</a><a href="fluxos.md">Fluxos e payloads</a><a href="cenarios.md">Cenários</a><a href="openapi.yaml">OpenAPI YAML</a><a href="openapi.json">JSON</a><a href="integracoes.md">Integrações técnicas</a><a href="validacao.md">Validação</a><a href="mudancas.md">O que mudou</a></nav></header><main>
<section class="panel" id="decisoes"><h2>Como consumir</h2><ul><li><code>POST /municipes</code>: formulário completo com contatos, endereços, documentos, classificações, indicação e fotos preparadas.</li><li><code>POST /atendimentos</code>: pedido completo com serviços, pendências, notas, anexos e solicitante novo inline.</li><li>Um GET monta cada ficha; o resultado do Salvar já devolve a ficha atual. Histórico extenso é paginado sob demanda.</li><li>Uploads em lote ligados ao rascunho; áudio pode ser transcrito antes de existir munícipe.</li><li>Sessão em cookie HttpOnly same-origin, CSRF nas chamadas autenticadas não GET, ETag para edição e idempotência por intenção.</li><li>Funcionalidades futuras sem tela definida ficam no planejamento. Webhook e saúde têm contrato técnico separado.</li></ul></section>
<section class="panel" id="cenarios"><h2>Percursos das telas</h2>@@FLOW_CARDS@@</section><h2 id="endpoints">Rotas necessárias</h2><div class="filters"><label>Buscar por tela, ação ou rota<input id="search" type="search" placeholder="Ex.: salvar munícipe, transcrição, etiquetas"></label><label>Método<select id="method"><option value="">Todos</option><option>GET</option><option>POST</option><option>PATCH</option><option>DELETE</option></select></label><label>Módulo<select id="module"><option value="">Todos</option>@@MODULES@@</select></label></div><p id="count" aria-live="polite">@@OPS@@ ações</p><div id="operations">@@CARDS@@</div><p id="empty" hidden>Nenhuma ação corresponde à pesquisa.</p><section class="panel" id="schemas"><h2>Payloads utilizados</h2><p>Somente schemas alcançáveis pelas rotas. Campos condicionais e variantes exclusivas estão no JSON completo.</p>@@SCHEMAS@@</section></main><footer><p>Leitura offline, sem dependência externa. A página não envia requisições. <a href="../../scripts/gerar_documentacao_api.py">Gerador</a> · <a href="../../scripts/api_contrato.py">Fonte do contrato</a> · <a href="../../scripts/validar_documentacao_api.py">Validador</a></p></footer><script>
const entries=[...document.querySelectorAll('.endpoint')];
const search=document.getElementById('search'),method=document.getElementById('method'),moduleSelect=document.getElementById('module');
const normalize=s=>s.normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').toLowerCase();
const searchable=new Map(entries.map(el=>[el,normalize(el.querySelector('.eyebrow').textContent+' '+el.querySelector('h3').textContent+' '+el.querySelector('h4').textContent+' '+el.querySelector('p:not(.eyebrow)').textContent)]));
function filter(){const q=normalize(search.value).trim();let visible=0;for(const el of entries){const show=(!q||q.split(/\\s+/).every(part=>searchable.get(el).includes(part)))&&(!method.value||el.dataset.method===method.value)&&(!moduleSelect.value||el.dataset.module===moduleSelect.value);el.hidden=!show;if(show)visible++;}document.getElementById('count').textContent=visible+' de '+entries.length+' ações';document.getElementById('empty').hidden=visible!==0;}
for(const input of [search,method,moduleSelect])input.addEventListener('input',filter);
function reveal(){const id=decodeURIComponent(location.hash.slice(1)),el=document.getElementById(id);if(!el)return;if(el.classList.contains('endpoint')&&el.hidden){search.value='';method.value='';moduleSelect.value='';filter();}if(el.tagName==='DETAILS')el.open=true;}
addEventListener('hashchange',reveal);reveal();
</script></body></html>'''
    values={'PLAN':PLAN,'VERSION':VERSION,'OPS':s['operacoes'],'PATHS':s['caminhos'],'FLOWS':len(manifest['fluxos']),'FLOW_CARDS':flow_cards,'MODULES':modules,'CARDS':'\n'.join(cards),'SCHEMAS':schemas}
    for key,value in values.items():
        page=page.replace('@@'+key+'@@',str(value))
    (OUT/'index.html').write_text(page,encoding='utf-8')


def render_all(spec):
    manifest=scenarios(spec)
    render_reference(spec)
    render_coverage(spec,manifest)
    render_html(spec,manifest)
    render_http(spec)
    return manifest


def render_http(spec):
    import re
    from urllib.parse import urlencode
    from api_contrato import example
    lines = ['# API por telas — exemplos independentes, não roteiro automático.', '# Cookie de sessão é recebido no login pelo cliente HTTP com cookie jar habilitado.', '# csrf vem de App.csrfToken; etag vem do recurso da tela, não de um contador calculado.', '# Substituir cada ID pelo retorno autorizado e usar nova chave por intenção/corpo.', '# Tokens/arquivos abaixo são fictícios. A API ainda não foi implementada.', '@baseUrl = http://localhost:3000/api/v1', '@id = 11111111-1111-4111-8111-111111111111', '@token = identificador-publico-opaco', '@catalogo = classificacoes', '@csrf = substituir-pelo-App.csrfToken', '@etag = "edicao-1"', '@idempotencyKey = 22222222-2222-4222-8222-222222222222', '']
    for path, method, o in operations(spec):
        route = re.sub(r'\{([^}]+)\}', lambda m: '{{' + (m[1] if m[1] in ['token','catalogo'] else 'id') + '}}', path)
        query = {p['name']:example(p['schema']) for p in o['parameters'] if p['in']=='query' and p.get('required') and 'schema' in p}
        if query:
            route += '?' + urlencode(query)
        lines += ['### ' + o['x-tela'] + ' — ' + o['summary'], '# ' + o['operationId'], method.upper() + ' {{baseUrl}}' + route]
        for p in o['parameters']:
            if p['in'] != 'header' or not p.get('required'):
                continue
            value = {'X-CSRF-Token':'{{csrf}}', 'If-Match':'{{etag}}', 'Idempotency-Key':'{{idempotencyKey}}', 'X-Motivo':'Ação conferida pela equipe.'}.get(p['name'], 'substituir')
            lines.append(p['name'] + ': ' + value)
        content = o.get('requestBody',{}).get('content',{})
        if 'application/json' in content:
            lines += ['Content-Type: application/json', '', json.dumps(content['application/json']['example'], ensure_ascii=False, indent=2)]
        elif 'multipart/form-data' in content:
            lines += ['Content-Type: multipart/form-data; boundary=crm-boundary', '']
            for k,v in content['multipart/form-data']['example'].items():
                lines.append('--crm-boundary')
                if k in ['audio','arquivos']:
                    lines += [f'Content-Disposition: form-data; name="{k}"; filename="exemplo.' + ('ogg' if k=='audio' else 'pdf') + '"', 'Content-Type: ' + ('audio/ogg' if k=='audio' else 'application/pdf'), '', '< ./substituir-pelo-arquivo.' + ('ogg' if k=='audio' else 'pdf')]
                else:
                    lines += [f'Content-Disposition: form-data; name="{k}"']
                    if isinstance(v,dict):
                        lines += ['Content-Type: application/json']
                    lines += ['', json.dumps(v,ensure_ascii=False) if isinstance(v,dict) else str(v)]
            lines.append('--crm-boundary--')
        lines += ['']
    (OUT/'exemplos.http').write_text('\n'.join(lines),encoding='utf-8')
