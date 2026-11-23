# Verificação da home e design system 1.0 — 17/11/2026

Escopo: identidade visual aplicada à home de módulos em Angular 22, busca compartilhada, marca redesenhada e guia do design system. Dados fictícios, executados localmente.

- **Build de produção aprovado**, sem erros ou avisos de orçamento. Angular 22.2.6 / CLI 22.2.7, Node 22.23.2. Saída: `dist/gabinete-web/browser`.
- **12 testes unitários aprovados**, em quatro arquivos: persistência do cabeçalho e da busca entre rotas; pesquisa por nome sem acentos e telefone sem máscara; estado vazio e limpeza. Incluem os oito testes já existentes dos mocks e serviços de conversas preservados.
- **6 cenários de navegador aprovados**, usando Playwright e o Chrome local: oito acessos atuais e aviso ao clicar; busca por nome/telefone, estado vazio e resumo; teclado; dimensões responsivas e cabeçalho fixo; acessibilidade com axe; marca e guia visual, com assets carregados e diálogo acessível.
- **7 larguras verificadas:** 320, 390, 600, 768, 1024, 1440 e 1536 px. Botões quadrados, duas colunas até 600 px e quatro nas larguras maiores, sem rolagem horizontal. A busca permanece visível ao rolar no celular.
- **Teclado verificado:** Ctrl K na busca, setas para selecionar resultados, Enter para abrir resumo e Escape com retorno de foco.
- **Axe sem violações nas verificações padrão**, na home desktop/celular, resultados da busca, resumo em modal, guia visual em 1440/390/320 px e diálogo do guia. A verificação automatizada cobre contraste e nomes acessíveis; uma avaliação manual completa com tecnologias assistivas continua sendo uma etapa distinta.
- **11 pares de contraste aprovados:** textos com mínimo de 4,5:1 e bordas de controle com mínimo de 3:1. Branco/azul principal: 8,06:1. Resultados em [contraste.json](../docs/design-system/contraste.json).
- **Logo SVG e fontes locais carregados**, sem erros ou avisos do app no Chrome. Versões principal, inversa, monocromática e símbolo; lettering convertido em curvas. As quatro referências possuem cópias e SHA-256 em `docs/design-system/referencias/`.
- **Nenhuma chamada externa/API nas interações verificadas.** Fonte Inter e ícones são locais; a busca utiliza oito pessoas fictícias em memória.
- **Conversas preservadas:** os 65 arquivos da cópia v0.15 conferem com o manifesto SHA-256. Os 25 arquivos de funcionalidade e domínio de conversas também permanecem idênticos na fonte atual. A home anterior ao design system foi guardada separadamente, com 67 arquivos e manifesto. O teste de navegador de conversas permanece fora da descoberta da suíte atual.
- **MCP oficial do Angular utilizado nesta tarefa:** `list_projects` identificou o workspace e `get_best_practices` devolveu o guia para Angular 22 antes das alterações. Servidor 22.2.7, cliente SDK v2.4.0 e protocolo `2026-07-28`.

Os cenários atuais estão em [tests/home.spec.ts](tests/home.spec.ts). Configuração em [playwright.config.ts](playwright.config.ts). O Chrome já instalado foi utilizado.

```sh
npm run build
npm test -- --watch=false
# Com npm start aberto em outro terminal:
npm run test:ui
npm run mcp:check
```

Os metadados MCP estão em `.angular/mcp-check.json`, com guia em `.angular/angular-best-practices.md`. O Playwright gera `playwright-report/` e `test-results/`. Esses diretórios são locais e ignorados pelo Git.

Imagens da revisão visual atual: [desktop](artifacts/design-system-home-desktop.png), [celular](artifacts/design-system-home-mobile.png), [busca no celular](artifacts/design-system-search-mobile.png) e [guia visual](artifacts/design-system-guide.png). Guia completo em `artifacts/design-system-guide-full.png`. As imagens e o log `artifacts/home-unit-tests.txt` da revisão v0.16 continuam disponíveis como histórico.

A ordem de implementação está em [roadmap-frontend.md](../.agents/roadmap-frontend.md). Os botões mostram “Em breve”; a próxima etapa será Munícipes, conforme novo pedido. A [cópia de conversas](../docs/prototipos/README.md) contém a validação anterior, com os fluxos da antiga home.

Tokens, componentes e orientações para novas telas estão no [design system](../docs/design-system/README.md). A aplicação e o guia usam os mesmos arquivos CSS. A revisão visual preservou a ordem atual dos acessos editada pelo usuário.

## Correção da marca — 17/11/2026

O usuário pediu fidelidade ao logo original. A marca foi reconstruída conforme os prints: VEREADOR centralizado acima de SérgioCamargo, com o elemento da bandeira integrado ao o. A assinatura completa permanece no cabeçalho também no celular; o favicon vem de um recorte da própria letra o. O desenho anterior com monograma C foi substituído em todos os SVGs publicados.

Arquivos e processo estão em [marca/README.md](../docs/design-system/marca/README.md). A fonte disponível é uma captura de tela; a reprodução não deve ser apresentada como arquivo mestre oficial. A tipografia da interface continua Inter; a marca utiliza os contornos reconstruídos da referência.

Na correção, a verificação de navegador cobre os três cenários afetados: carregamento da marca/guia com uso por teclado; sete larguras da home; axe na home, busca, resumo e guia. A suíte completa de seis cenários e os 12 unitários acima correspondem à entrega inicial do design system. Revisão atual: [versões](artifacts/logo-original-versoes.png), [desktop](artifacts/logo-original-home-desktop.png) e [celular](artifacts/logo-original-home-mobile.png).

## Busca móvel animada e padding — 17/11/2026

Até 600 px, a busca começa em uma lupa. O toque abre o campo pela largura útil do cabeçalho, com foco síncrono para digitar e expansão CSS de 220 ms. A seta, Escape e toque fora fecham; o texto é preservado e selecionado ao reabrir. No desktop, o campo continua aberto. Cabeçalho e serviço permanecem compartilhados entre rotas.

- **Build aprovado**, sem erros ou avisos. **12 testes unitários aprovados**, incluindo a persistência da busca no cabeçalho entre rotas.
- A suíte de navegador agora contém **9 cenários**. Nesta tarefa foram verificados os nove; após o ajuste final, os cinco afetados por layout e toque passaram novamente. Incluem animação conferida em um ponto intermediário, foco no toque, seleção, consulta, resumo, fechamento, movimento reduzido e mudança de largura mantendo foco e consulta.
- **Padding verificado com `scrollbar-gutter: stable`** em 320, 346, 360, 361, 390 e 600 px. Campo e resultados se alinham aos dois paddings do cabeçalho, com diferença inferior a 1 px. A largura expandida usa porcentagem da área disponível; não inclui a largura da scrollbar.
- **Axe sem violações** nos estados verificados da home, da busca e do resumo; o guia também passou na execução inicial desta tarefa. Fonte e ícones continuam locais, com dados fictícios.
- O teste de toque utiliza emulação móvel no Chrome. Foco foi confirmado no próprio toque; não foi feito teste físico de teclado virtual em aparelhos iOS/Android.

Revisão visual: [lupa recolhida](artifacts/search-mobile-collapsed.png), [campo expandido](artifacts/search-mobile-expanded.png) e [resultados alinhados](artifacts/search-mobile-results.png).


## Investigação de montagem da ficha — 17/11/2026

Testes e builds foram autorizados explicitamente pelo usuário nesta tarefa. A preferência de não executar validações automaticamente nas tarefas futuras permanece vigente.

Causa reproduzida em desenvolvimento: `NG02952` em `NgOptimizedImage`. Os atributos `sizes` do mosaico e da ampliação incluíam valores finais de `400px` e `660px`, incompatíveis com a validação da versão instalada sem `ngSrcset` próprio. A exceção interrompia a criação da view. O nome chegava a aparecer, mas a linha do tempo tinha **zero cards**, mesmo após três segundos. Bloquear as fotos externas não resolvia, pois a falha ocorria antes das requisições.

Correção: `sizes` com unidades responsivas (`vw`), galeria em componente separado e conteúdo da ampliação criado apenas ao abrir a foto. Incluído `preconnect` para `images.unsplash.com`. A separação também resolveu a falha do build causada pelo CSS da ficha, que excedia o limite de erro de 8 kB (8,02 kB). Os limites de orçamento não foram aumentados.

Medições locais no Chrome, viewport 1440 × 1000, nova sessão de navegador em cada cenário. São amostras de diagnóstico, sem simulação de rede móvel ou dispositivo físico; não representam percentis ou garantia para outros equipamentos.

| Cenário | Resultado |
| --- | --- |
| Resposta do servidor de desenvolvimento | HTML em aproximadamente 14 ms |
| Antes da correção, desenvolvimento | Erro Angular; zero cards da linha do tempo após a espera |
| Após a correção, desenvolvimento | Nome localizado em aproximadamente 0,71 s; nove cards montados, inclusive com imagens bloqueadas |
| Produção local com gzip, imagens normais | Nome e histórico disponíveis em 411 ms; primeiro conteúdo em 240 ms |
| Produção local com gzip, imagens bloqueadas | Nome e histórico disponíveis em 584 ms; primeiro conteúdo em 300 ms |

O nome isoladamente não é um indicador suficiente de montagem da ficha: ele também aparecia antes da correção. O teste de regressão exige os nove cards, o botão de novo contato e ausência de erros Angular. O HTML permanece utilizável se as fotos externas falharem.

Build de produção aprovado pelo MCP oficial do Angular. Código inicial: 344,34 kB brutos, estimativa de transferência de 93,49 kB; chunk da ficha: 56,99 kB brutos, estimativa de 12,94 kB. Esses valores não incluem imagens/fontes. Resta um aviso não bloqueante no CSS da linha do tempo (6,86 kB ante orçamento de aviso de 6 kB), sem ultrapassar o limite de erro.

Quatro testes focados em `tests/citizen-detail.spec.ts` passaram em desenvolvimento e novamente contra o build de produção: montagem completa em 390/1440 px com fotos indisponíveis, galeria sob demanda/troca de munícipe e filtros/registro de novo contato sem fotos. Não foram executadas a suíte antiga da home ou a suíte unitária nesta investigação.

Evidências: [antes](artifacts/performance-citizen-2026-11-17/before.json), [desenvolvimento corrigido](artifacts/performance-citizen-2026-11-17/development-after.json), [produção corrigida](artifacts/performance-citizen-2026-11-17/production-after.json) e [captura de produção](artifacts/performance-citizen-2026-11-17/production-desktop.png). O servidor temporário de produção foi usado na porta 4301; a prévia normal permanece na porta 4300.
