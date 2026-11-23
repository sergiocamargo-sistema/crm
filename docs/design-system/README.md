# Design system do gabinete — 1.0

Criado em **17/11/2026**, a partir dos quatro prints mais recentes indicados pelo usuário. Identidade aplicada à home Angular 22, ao cabeçalho, à busca de munícipes, aos diálogos e ao favicon.

**[Abrir o guia visual local](http://127.0.0.1:4300/design-system/index.html)** · [Home](http://127.0.0.1:4300/)

## Referências e interpretação

| Referência | Captura original | Elementos aproveitados |
| --- | --- | --- |
| [01](referencias/referencia-01.png) | 17/11/2026, 16:09:34 | Assinatura Sérgio Camargo, azul, amarelo e títulos fortes. |
| [02](referencias/referencia-02.png) | 17/11/2026, 16:09:43 | Azul institucional em áreas planas, branco e hierarquia editorial. |
| [03](referencias/referencia-03.png) | 17/11/2026, 16:10:06 | Fundo azul noturno, tipografia de peso alto e amarelo de destaque. |
| [04](referencias/referencia-04.png) | 17/11/2026, 16:10:28 | Azul e branco, composição institucional e presença da assinatura. |

As quatro imagens estão preservadas com origem e SHA-256 no [manifesto](referencias/manifest.json). O azul **#064EA0** foi identificado nos pixels predominantes das áreas planas das referências 02 e 04. Amarelo, escala de cinzas, contraste, geometria e espaçamentos foram ajustados para o uso em uma aplicação. A fonte dos posts não foi identificada; Inter é a escolha de interface desta versão.

## Marca fiel à referência

Assinatura: **Vereador Sérgio Camargo**. Preservar a composição dos prints: “VEREADOR” pequeno e centralizado acima de “SérgioCamargo”, com o elemento da bandeira integrado à letra “o” de Sérgio. A assinatura completa também é mantida no celular; o favicon é um recorte circular dessa própria letra.

| Versão | Arquivo | Aplicação |
| --- | --- | --- |
| Principal | [sergio-camargo.svg](../../frontend/public/brand/sergio-camargo.svg) | Cabeçalho e fundos claros. |
| Inversa | [sergio-camargo-inverse.svg](../../frontend/public/brand/sergio-camargo-inverse.svg) | Fundos escuros. |
| Monocromática | [sergio-camargo-monochrome.svg](../../frontend/public/brand/sergio-camargo-monochrome.svg) | Rodapé e impressão em uma cor. |
| Recorte do o | [simbolo.svg](../../frontend/public/brand/simbolo.svg) | Favicon e detalhe da marca. |

Os SVGs têm fundo transparente e lettering convertido em curvas; sua exibição não depende de fontes externas. Preservar proporções e reservar respiro mínimo equivalente a ¼ da altura do símbolo. Assinatura completa a partir de 180 px; símbolo a partir de 24 px. A versão inversa usa branco no lettering; a monocromática preserva os vazios do símbolo.

Os arquivos foram reconstruídos a partir das referências disponíveis; não são o arquivo mestre original. A [origem e o processo da reconstrução](marca/README.md) estão registrados com o PNG utilizado. O [conversor para SVG](gerar_marca.py), com o extrator determinístico `tracar_contornos.py`, vetoriza esses contornos e deriva as versões sem substituir a tipografia. Para regenerar, usar Python com Pillow e executar `python gerar_marca.py /caminho/do/frontend`. Essas ferramentas não são dependências da aplicação.

## Fonte única de estilos

- [tokens.css](../../frontend/public/design-system/tokens.css): cores, tipografia, espaçamentos, raios, sombras, movimento, altura do cabeçalho e largura de conteúdo.
- [components.css](../../frontend/public/design-system/components.css): controles, acessos de módulos, botões, campos, avatares, badges, diálogos e foco.
- [src/styles.scss](../../frontend/src/styles.scss): inclui essas duas bases na aplicação Angular.
- [Guia visual](../../frontend/public/design-system/index.html): importa os mesmos arquivos e demonstra os componentes. É documentação estática, distribuída também no build de produção.

Novas telas herdam a base global. Usar os tokens nos estilos dos componentes e classes compartilhadas nos elementos apropriados. Manter os templates HTML externos conforme as instruções do projeto. Os aliases `--green`, `--ink`, `--muted` e outros do protótipo antigo são compatibilidade temporária; em código novo, usar nomes semânticos como `--color-primary`.

## Cores

| Papel | Token | Valor |
| --- | --- | --- |
| Marca e ação principal | `--color-primary` | #064EA0 |
| Hover principal | `--color-primary-hover` | #07366D |
| Destaque | `--color-accent` | #F5DF31 |
| Título institucional | `--brand-navy` | #1B1B2B |
| Texto principal | `--color-text` | #1C2B43 |
| Texto secundário | `--color-text-muted` | #5D6C81 |
| Superfície | `--color-surface` | #FFFFFF |
| Fundo | `--color-canvas` | #F4F6FA |
| Borda decorativa | `--color-border` | #DCE3EE |
| Borda de controle | `--color-border-control` | #7D8DA5 |
| Sucesso | `--color-success` | #176540 |
| Atenção | `--color-warning` | #76520A |
| Erro | `--color-danger` | #AC2C36 |

Azul para orientar e acionar; amarelo para acentos e destaques com texto escuro. Fundos claros ocupam a maior parte das telas operacionais. Status sempre incluem texto. A cor vermelha fica reservada a erro e ação destrutiva.

Pares calculados: branco/azul **8,06:1**, azul/amarelo **5,94:1**, azul noturno/amarelo **12,50:1**, texto secundário/fundo **4,94:1**. Os onze pares avaliados, incluindo bordas de campos, estão em [contraste.json](contraste.json). Textos usam mínimo de 4,5:1; bordas de controle, 3:1.

## Tipografia

Família da interface: **Inter Variable**, arquivos normal e itálico locais, com `font-display: swap`. Licença em [OFL.txt](../../frontend/public/brand/fonts/OFL.txt). O lettering da marca mantém os contornos reconstruídos dos prints e não usa a fonte da interface.

| Uso | Tamanho | Peso | Entrelinha |
| --- | --- | --- | --- |
| Display editorial do guia | 30–66 px | 850 | 1,04–1,05 |
| Título de tela | 26–34 px | 750 | 1,2 |
| Título de diálogo | 18 px | 750 | 1,5 |
| Corpo | 14–16 px | 400 | 1,5 |
| Campo, botão, rótulo | 13–15 px | 550–650 | 1,4–1,5 |
| Informação auxiliar | 12 px | 400–550 | 1,5 |

O itálico e as letras maiúsculas das referências aparecem nos exemplos editoriais. Dados, busca e navegação usam formas diretas para leitura rápida. Informações auxiliares compactas do protótipo variam entre 10 e 12 px; conteúdo principal usa a escala acima.

## Componentes e estados

| Elemento | Base compartilhada | Comportamento |
| --- | --- | --- |
| Botão | `.button`, `--primary`, `--accent`, `--danger` | Mínimo de 44 px, hover, foco e indisponível. |
| Acesso de módulo | `.module-tile`, `.module-icon`, `.module-label` | Quadrado, ícone azul e realce amarelo no hover. |
| Campo | `.form-label`, `.form-input`, `.form-hint`, `.form-error` | Rótulo visível, borda de controle, foco e erro com texto. |
| Busca de munícipes | `CitizenSearchComponent` + tokens | Nome/telefone, limpar, vazio, resultados e resumo. |
| Identificação | `.avatar` | Iniciais e cor auxiliar. |
| Estado | `.badge` e variantes semânticas | Rótulo de estado com cor correspondente. |
| Diálogo | `.dialog` e seções internas | Elemento nativo, título, foco contido e Escape. |

Foco visível: contorno azul de 3 px com afastamento de 3 px. Na busca, o contêiner ganha borda azul e anel externo. Animações curtas, de 140 e 220 ms; `prefers-reduced-motion` reduz os movimentos. Os exemplos do guia permitem experimentar botões, copiar cores e abrir um diálogo.

## Geometria e responsividade

- Escala de espaçamento: **4, 8, 12, 16, 20, 24, 32, 40, 48 e 64 px**.
- Raios: campos **10 px**, cards **14 px**, ícones **16 px**, diálogos **20 px**.
- Conteúdo até **1160 px**, com margens adaptadas à largura disponível.
- Home em **duas colunas até 600 px** e **quatro colunas acima de 600 px**; acessos com proporção 1:1.
- Cabeçalho global fixo durante a rolagem, com assinatura completa no desktop e no celular. Busca disponível em ambos.
- Até 600 px, a busca começa como lupa. O toque expande o campo por toda a área útil do cabeçalho em 220 ms e dá foco imediato. A seta, Escape e o toque externo fecham; o texto é preservado e fica selecionado ao reabrir. Campo e resultados se alinham aos paddings reais, incluindo layouts com scrollbar.
- A ordem vigente dos botões, editada pelo usuário na fonte, foi preservada nesta alteração visual.

## Preservação e continuidade

A home anterior à identidade foi guardada em [home-v0.16.tar.gz](../prototipos/home-v0.16.tar.gz), com [manifesto](../prototipos/home-v0.16.manifest.json). O protótipo de conversas continua preservado separadamente para a etapa correspondente.

Esta entrega estabelece a identidade e os componentes visuais. A home continua com dados fictícios, os oito acessos e a busca global. Resultados de build, navegador, teclado e axe estão em [validacao.md](../../frontend/validacao.md).

A busca móvel usa o [Popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API/Using) e transições CSS com [@starting-style](https://developer.mozilla.org/en-US/docs/Web/CSS/@starting-style), mantendo o foco no gesto de abertura e a preferência de movimento reduzido.
