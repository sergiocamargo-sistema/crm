#!/usr/bin/env python3
"""Gera contratos e referência a partir das ações/telas, sem gerar CRUD."""
import json
import yaml
from api_contrato import OUT, VERSION, spec_for
from api_render import render_all, stats


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    frontend, technical = spec_for(), spec_for(technical=True)
    for stem, spec in [('openapi', frontend), ('integracoes.openapi', technical)]:
        (OUT / (stem + '.yaml')).write_text(yaml.safe_dump(spec, allow_unicode=True, sort_keys=False, width=110), encoding='utf-8')
        (OUT / (stem + '.json')).write_text(json.dumps(spec, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    manifest = render_all(frontend)
    print(json.dumps({'versao': VERSION, 'frontend': stats(frontend), 'integracoes': stats(technical), 'cenarios': len(manifest['fluxos'])}, ensure_ascii=False))


if __name__ == '__main__':
    main()
