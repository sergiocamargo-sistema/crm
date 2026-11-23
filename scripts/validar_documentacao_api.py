#!/usr/bin/env python3
"""Validação documental reproduzível. Não executa um backend."""
import copy
import json
import re
import subprocess
import tempfile
import unicodedata
from datetime import datetime
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

import yaml
from jsonschema import Draft202012Validator, FormatChecker
from openapi_spec_validator import validate

from api_contrato import OUT, ROOT, VERSION, spec_for
from api_render import operations, stats

COUNTS = {'exemplos': 0, 'casosNegativos': 0, 'refs': 0, 'links': 0, 'blocosJsonFluxos': 0, 'javascript': 0}


def check(condition, message):
    if not condition:
        raise AssertionError(message)


def pointer(doc, ref):
    check(ref.startswith('#/'), 'Referência externa não prevista: ' + ref)
    value = doc
    for part in ref[2:].split('/'):
        value = value[part.replace('~1', '/').replace('~0', '~')]
    return value


def validator(spec, schema):
    return Draft202012Validator({'components': spec['components'], '$ref': '#/target', 'target': schema}, format_checker=FormatChecker())


def validate_examples(spec):
    def visit(node, path=''):
        if isinstance(node, dict):
            if '$ref' in node:
                pointer(spec, node['$ref'])
                COUNTS['refs'] += 1
            if 'schema' in node and 'example' in node:
                errors = list(validator(spec, node['schema']).iter_errors(node['example']))
                check(not errors, f'Exemplo inválido {path}: {errors[:1]}')
                COUNTS['exemplos'] += 1
            if 'examples' in node and isinstance(node['examples'], list):
                for sample in node['examples']:
                    errors = list(validator(spec, node).iter_errors(sample))
                    check(not errors, f'Exemplo de campo/schema inválido {path}: {errors[:1]}')
                    COUNTS['exemplos'] += 1
            for key, value in node.items():
                if key not in ['example', 'examples']:
                    visit(value, path + '/' + key)
        elif isinstance(node, list):
            for i, value in enumerate(node):
                visit(value, path + '/' + str(i))
    visit(spec)
    for name, value in spec['components']['schemas'].items():
        Draft202012Validator.check_schema(value)


def validate_contract(stem, technical):
    spec = json.loads((OUT / (stem + '.json')).read_text())
    check(spec == yaml.safe_load((OUT / (stem + '.yaml')).read_text()), 'YAML/JSON divergentes')
    check(spec == spec_for(technical), 'Artefatos divergentes da fonte: execute gerador')
    validate(spec)
    check(spec['info']['version'] == VERSION and spec['x-estado'] == 'proposto-nao-implementado', 'Versão/estado incorreto')
    ids, shapes = set(), set()
    for path, method, op in operations(spec):
        check(op['operationId'] not in ids, 'operationId repetido')
        ids.add(op['operationId'])
        shape = (method, re.sub(r'\{[^}]+\}', '{}', path))
        check(shape not in shapes, 'Rota ambígua: ' + path)
        shapes.add(shape)
        check(op['x-tela'] and op['summary'] and op['description'], 'Operação sem consumidor/finalidade')
        check(op['x-implementado'] is False, 'Não alegar implementação')
        parameters = op.get('parameters', [])
        check(len({(p['in'],p['name']) for p in parameters}) == len(parameters), 'Parâmetro duplicado')
        check(set(re.findall(r'\{([^}]+)\}', path)) == {p['name'] for p in parameters if p['in']=='path' and p['required']}, 'Parâmetro de rota ausente')
        headers = {p['name'] for p in parameters if p['in']=='header'}
        if not technical:
            check(op['x-consumidor'] in ['frontend-interno','frontend-publico'], 'Consumidor técnico no frontend')
            check(('X-CSRF-Token' in headers) == (method != 'get' and bool(op['security'])), 'CSRF inconsistente: ' + path)
            check(('Idempotency-Key' in headers) == (op['x-idempotencia']=='obrigatoria'), 'Idempotência inconsistente')
            if path.startswith('/publico') or path == '/auth/login':
                check(op['security'] == [], 'Sessão exigida no público')
                for response in op['responses'].values():
                    if '$ref' in response:
                        schema = pointer(spec,response['$ref'])['content']['application/problem+json']['schema']
                        check(schema['$ref'].endswith('/ProblemaPublico'), 'Erro público com candidatos internos')
            else:
                check(op['security'] == [{'sessao':[]}], 'Sessão interna ausente')
        if method=='delete':
            check('requestBody' not in op and 'X-Motivo' in headers, 'DELETE precisa motivo/header e nenhum body')
        check(('428' in op['responses']) == ('If-Match' in headers), '428 incoerente')
        check(('412' in op['responses']) == ('If-Match' in headers), '412 incoerente')
        if '204' in op['responses']:
            check('content' not in op['responses']['204'], '204 com conteúdo')
    validate_examples(spec)
    return spec


def validate_flows(spec):
    manifest = json.loads((OUT/'cenarios.json').read_text())
    by_id = {o['operationId']:(p,m,o) for p,m,o in operations(spec)}
    actions = {x['id']:x for x in manifest['acoes']}
    check(set(actions)==set(by_id), 'Ação sem tela/cobertura ou órfã')
    for key, action in actions.items():
        path, method, operation = by_id[key]
        check(action['rota']==path and action['metodo']==method.upper() and action['tela']==operation['x-tela'] and action['chamadasPorAcao']==1, 'Manifesto de ação divergente')
    flow_ids = set()
    for flow in manifest['fluxos']:
        check(flow['id'] not in flow_ids, 'Cenário repetido')
        flow_ids.add(flow['id'])
        for step in flow['etapas']:
            for key in step['operacoes']:
                check(key in by_id, 'Cenário usa endpoint ausente: '+key)
        if 'salvamentoUnico' in flow:
            confirmations = [key for s in flow['etapas'] if s['papel']=='confirmacao' for key in s['operacoes']]
            check(confirmations == [flow['salvamentoUnico']] and flow['maxChamadasConfirmacao']==1, 'Salvar fragmentado em várias gravações')
            check(by_id[flow['salvamentoUnico']][1] in ['post','patch'], 'Salvar não é comando')
            for step in flow['etapas']:
                if step['papel']=='preparacao_opcional':
                    check(all(by_id[k][0]=='/uploads' for k in step['operacoes']), 'Pré-requisito de entidades escondido no Salvar')
    required = {'novo-municipe','editar-municipe','atendimento-completo','concluir-pedido','publico','conferencia','etiquetas','audio','duplicidade','indicacoes','retomada','assumir'}
    check(required <= flow_ids, 'Cenário principal ausente')
    forbidden = r'^/(contatos|enderecos|documentos|execucoes|pendencias|transcricoes|importacoes|exportacoes|portal|selecoes|jobs)(/|$)|/municipes/\{id\}/(contatos|enderecos|documentos|classificacoes|fotos|indicador|marcacao-voto)(/|$)|^/auth/(refresh|me|tokens)|^/(saude|webhooks)(/|$)'
    check(not any(re.search(forbidden,p) for p in spec['paths']), 'CRUD fragmentado/futuro/técnico reapareceu')
    citizen = spec['components']['schemas']['CadastroMunicipe']['properties']
    check({'contatos','enderecos','documentos','classificacaoIds','indicadoPorMunicipeId','fotos','observacoes'} <= citizen.keys(), 'Cadastro deixou blocos fora do agregado')
    request = spec['components']['schemas']['CriarAtendimento']['properties']
    check({'solicitante','servicos','pendencias','anexos','notas','contextoConversa'} <= request.keys(), 'Pedido incompleto')
    check(spec['components']['schemas']['SolicitanteNovo']['properties']['cadastro']['$ref'].endswith('/CadastroMunicipe'), 'Pessoa inline incompleta')
    check('municipeId' not in spec['components']['schemas']['TranscreverAudio']['required'], 'Áudio exige pessoa já salva')
    check('alvoId' not in spec['components']['schemas']['ManifestoUpload'].get('required',[]), 'Upload exige entidade salva')
    check('votoGarantido' not in spec['components']['schemas']['FiltrosMunicipes']['properties'], 'Campo restrito entrou em audiência')
    check(spec['components']['schemas']['SelecaoConsulta']['properties']['consulta']['$ref'].endswith('/PesquisaMunicipes'), 'Etiquetas precisam mesma consulta')
    # Fichas, listas e comparação já carregam o token de edição dos itens.
    for name in ['FichaMunicipe','FichaAtendimento','Conta','Usuario','Perfil','Equipe','Participacao','ModeloEtiqueta','FormatoEtiqueta','ItemAgenda']:
        check('etag' in spec['components']['schemas'][name]['required'], 'ETag ausente em DTO editável: '+name)
    return manifest


def validate_negative(spec):
    cases = [
        ('CadastroMunicipe',{},'nome obrigatório'),
        ('CadastroMunicipe',{'nome':'Ana','tabelaInterna':1},'campos desconhecidos'),
        ('CadastroMunicipe',{'nome':'Ana','nascimento':'2026-02-30'},'data impossível'),
        ('CadastroMunicipe',{'nome':'Ana','indicadoPorMunicipeId':'nao-uuid'},'referência inválida'),
        ('EditarMunicipe',{},'PATCH vazio'),
        ('EditarAtendimento',{},'pedido PATCH vazio'),
        ('FiltroData',{'modo':'componentes'},'componentes sem valor'),
        ('FiltroData',{'modo':'componentes','mes':13},'mês inválido'),
        ('FiltroData',{'modo':'componentes','dia':0},'dia inválido'),
        ('FiltroData',{'modo':'intervalo'},'intervalo vazio'),
        ('FiltroData',{'modo':'intervalo','de':'16/11/2026'},'formato de data'),
        ('FiltroData',{'modo':'componentes','mes':11,'de':'2026-11-01'},'modos misturados'),
        ('FotoFormulario',{'chave':'foto-1','principal':True},'foto sem fonte'),
        ('FotoFormulario',{'chave':'foto-1','principal':True,'id':'11111111-1111-4111-8111-111111111111','uploadToken':'x'},'foto com fontes ambíguas'),
        ('CriarAtendimento',{'titulo':'T','descricao':'D','canal':'presencial'},'pedido sem solicitante'),
        ('Solicitante',{'tipo':'novo','municipeId':'11111111-1111-4111-8111-111111111111'},'novo sem cadastro'),
        ('PessoaSelecionada',{'tipo':'a_identificar'},'participação sem pessoa definitiva'),
        ('NotaCriar',{'removida':True},'criação de nota sem texto'),
        ('Conferencia',{'acao':'integrar_novo','motivo':'Revisado'},'conferência sem cadastro'),
        ('Conferencia',{'acao':'transferir','motivo':'Revisado'},'transferência sem destino'),
        ('Conferencia',{'acao':'executar_sql','motivo':'Revisado'},'comando não previsto'),
        ('SelecaoEtiquetas',{'tipo':'ids','municipeIds':[]},'seleção vazia'),
        ('ModeloRascunhoUsar',{'tipo':'rascunho','id':'11111111-1111-4111-8111-111111111111'},'rascunho sem dados'),
        ('BlocoEtiqueta',{'tipo':'campo','campo':'nome','texto':'X','xMm':0,'yMm':0,'larguraMm':50,'alturaMm':5,'fontePt':10,'alinhamento':'esquerda'},'campo e texto misturados'),
        ('ConfirmarReversao',{'motivo':'Revisado'},'reversão sem revisão'),
        ('EventoTela',{'id':'e','tipo':'mensagem_atualizada','ocorridoEm':'2026-11-16T17:00:00Z'},'evento sem DTO'),
        ('EventoTela',{'id':'e','tipo':'ressincronizar','ocorridoEm':'2026-11-16T17:00:00Z','mensagem':{}},'ressincronizar vazando DTO'),
        ('Operacao',{'id':'11111111-1111-4111-8111-111111111111','tipo':'transcricao','estado':'concluida','progresso':100,'podeCancelar':False,'resultado':None},'concluída sem resultado tipado'),
        ('Operacao',{'id':'11111111-1111-4111-8111-111111111111','tipo':'transcricao','estado':'falha','progresso':0,'podeCancelar':False,'resultado':None},'falha sem erro'),
        ('ProblemaPublico',{'type':'urn:gabinete:erro','title':'Erro','status':409,'detail':'Revise','codigo':'ERRO','requestId':'r','candidatos':[]},'erro público com dados internos'),
    ]
    cases += [('AutorAtividade',{'tipo':'publico','nome':'Envio público','usuarioId':'11111111-1111-4111-8111-111111111111'},'envio público com identidade autenticada inventada')]
    wrong_result = copy.deepcopy(spec['components']['schemas']['Operacao']['examples'][1])
    wrong_result['tipo'] = 'previa_etiquetas'
    cases.append(('Operacao',wrong_result,'resultado de transcrição usado como PDF'))
    for name, sample, label in cases:
        errors = list(validator(spec,{'$ref':'#/components/schemas/'+name}).iter_errors(sample))
        check(bool(errors), 'Caso inválido aceito: '+label)
        COUNTS['casosNegativos'] += 1


class Document(HTMLParser):
    voids = {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}
    def __init__(self, path):
        super().__init__(convert_charrefs=True)
        self.path,self.ids,self.links,self.scripts,self.stack,self.in_script = path,set(),[],[],[],False
        self.feed(path.read_text())
        check(not self.stack, 'HTML não fechado: '+str(self.stack[-4:]))
    def handle_starttag(self, tag, attrs):
        attrs=dict(attrs)
        if 'id' in attrs:
            check(attrs['id'] not in self.ids, 'ID HTML duplicado: '+attrs['id'])
            self.ids.add(attrs['id'])
        if 'href' in attrs:
            self.links.append(attrs['href'])
        if tag not in self.voids:
            self.stack.append(tag)
        if tag=='script':
            check('src' not in attrs, 'HTML offline depende de script externo')
            self.in_script=True
            self.scripts.append('')
    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag,attrs)
        if tag not in self.voids:
            self.handle_endtag(tag)
    def handle_endtag(self, tag):
        if tag in self.voids:
            return
        check(bool(self.stack) and self.stack[-1]==tag, f'HTML mal aninhado {self.path.name}: </{tag}> após {self.stack[-3:]}')
        self.stack.pop()
        if tag=='script':
            self.in_script=False
    def handle_data(self, data):
        if self.in_script:
            self.scripts[-1]+=data


def md_anchors(path):
    value=path.read_text()
    anchors=set(re.findall(r'<a id="([^"]+)"',value))
    for heading in re.findall(r'^#{1,6}\s+(.+)$',value,re.M):
        slug=''.join(c for c in heading.lower() if unicodedata.category(c)[0] in ['L','N'] or c in ' _-').replace(' ','-')
        anchors.add(slug)
    return anchors


def validate_documents(spec):
    docs = {path:Document(path) for path in [ROOT/'index.html',OUT/'index.html']}
    for path,doc in docs.items():
        for script in doc.scripts:
            with tempfile.NamedTemporaryFile(mode='w',suffix='.js') as handle:
                handle.write(script);handle.flush()
                result=subprocess.run(['node','--check',handle.name],capture_output=True,text=True)
                check(result.returncode==0,'JavaScript inválido: '+result.stderr)
                COUNTS['javascript']+=1
    api=docs[OUT/'index.html']
    check({o['operationId'] for _,_,o in operations(spec)} <= api.ids, 'Endpoint faltando no explorador')
    check({'schema-'+k for k in spec['components']['schemas']} <= api.ids, 'Schema faltando no explorador')
    def link(source, href):
        parsed=urlsplit(href)
        if parsed.scheme or parsed.netloc:
            return
        target=(source.parent/unquote(parsed.path)).resolve() if parsed.path else source
        check(target.exists(),f'Link quebrado {source.relative_to(ROOT)}: {href}')
        if parsed.fragment:
            frag=unquote(parsed.fragment)
            if target.suffix=='.html':
                check(frag in docs[target].ids, f'Âncora HTML ausente {href}')
            elif target.suffix=='.md':
                check(frag in md_anchors(target), f'Âncora Markdown ausente {href}')
        COUNTS['links']+=1
    for path,doc in docs.items():
        for href in doc.links:
            link(path,href)
    for path in [ROOT/'README.md',ROOT/'docs/planejamento.md',*OUT.glob('*.md')]:
        text=re.sub(r'```.*?```','',path.read_text(),flags=re.S)
        for href in re.findall(r'\[[^\]]*\]\(([^)]+)\)',text):
            link(path,href)
    # Exemplos do guia de fluxos são parte da documentação usada pelo integrador.
    schemas=['CadastroMunicipe','EditarMunicipe','CriarAtendimento','EditarAtendimento','PesquisaMunicipes','ConferenciaNovo','ConferenciaExistente','PreviaEtiquetasCriar']
    samples=re.findall(r'```json\n(.*?)\n```',(OUT/'fluxos.md').read_text(),flags=re.S)
    check(len(samples)==len(schemas),'Quantidade de exemplos de fluxo mudou sem atualizar validação')
    for name, sample in zip(schemas,samples):
        value=json.loads(sample)
        check(not list(validator(spec,{'$ref':'#/components/schemas/'+name}).iter_errors(value)), 'Exemplo do fluxo não corresponde ao schema '+name)
        COUNTS['blocosJsonFluxos']+=1
    http=(OUT/'exemplos.http').read_text()
    for _,_,operation in operations(spec):
        check('# '+operation['operationId']+'\n' in http,'Exemplo HTTP ausente')


def report(spec,technical,manifest):
    s,t=stats(spec),stats(technical)
    body=f'''# Validação documental — {VERSION}

Executada em {datetime.now().astimezone().strftime('%d/%m/%Y %H:%M %z')}. Estado: contrato proposto, sem backend implementado.

- Frontend: **{s['operacoes']} operações / {s['caminhos']} caminhos / {s['schemas']} schemas utilizados**.
- Integrações separadas: **{t['operacoes']} operações / {t['caminhos']} caminhos / {t['schemas']} schemas**.
- Métodos do frontend: {', '.join(f'{m} {n}' for m,n in s['metodos'].items())}.
- **{len(manifest['fluxos'])} cenários completos**; todas as operações têm tela e ação no manifesto.
- OpenAPI 3.1.1 de ambos os contratos validado por openapi-spec-validator; schemas com JSON Schema 2020-12 e formatos.
- YAML = JSON = fonte gerada, referências internas resolvidas ({COUNTS['refs']} ocorrências), operationIds/parâmetros sem duplicação e rotas normalizadas sem colisão.
- **{COUNTS['exemplos']} exemplos** de campos/schemas, entradas, respostas e parâmetros verificados; **{COUNTS['blocosJsonFluxos']} payloads JSON dos fluxos humanos** conferidos contra o contrato.
- **{COUNTS['casosNegativos']} casos estruturalmente inválidos** rejeitados: variantes, datas, referências, campos desconhecidos, PATCH vazio, evento sem DTO, resultado de operação e privacidade do erro público.
- Invariantes documentais: uma confirmação por agregado, payload completo de pessoa/pedido, pessoa nova inline, áudio/upload sem alvo persistido, ETags nas linhas/fichas, nenhuma rota CRUD fragmentada selecionada, futura ou técnica no frontend.
- Segurança declarativa: sessão/CSRF, idempotência, If-Match/412/428, DELETE sem corpo e erros públicos separados conferidos.
- Dois HTMLs com IDs únicos, estrutura de tags verificada, endpoints/schemas presentes e **{COUNTS['links']} links/âncoras locais** conferidos; **{COUNTS['javascript']} scripts** passaram em node --check.
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
'''
    (OUT/'validacao.md').write_text(body)


def main():
    spec=validate_contract('openapi',False)
    technical=validate_contract('integracoes.openapi',True)
    manifest=validate_flows(spec)
    validate_negative(spec)
    validate_documents(spec)
    report(spec,technical,manifest)
    print(json.dumps({'resultado':'OK','frontend':stats(spec),'integracoes':stats(technical),'cenarios':len(manifest['fluxos']),**COUNTS},ensure_ascii=False))


if __name__=='__main__':
    main()
