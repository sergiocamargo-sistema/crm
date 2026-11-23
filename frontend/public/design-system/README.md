# Design system do gabinete — 1.1

Atualizado em 17/11/2026 por pedido explícito do usuário: padronizar os botões com ícone e impedir variações improvisadas nas próximas alterações. Esta versão complementa a identidade 1.0, preservando marca, cores, fonte e composição das telas.

Fonte de implementação: `tokens.css` e `components.css` nesta pasta. A aplicação e o [guia visual](index.html#botoes-icone) importam esses mesmos arquivos. Não copiar os estilos para componentes Angular.

## Botão com ícone

O padrão `.icon-button` tem área de 30 × 30 px, ícone de 18 px, border-radius de 100% (formato circular), conforme ajuste explícito do usuário, fundo azul suave e ícone azul. Busca, menu de ações, filtro e fechar diálogos usam exatamente esta base, inclusive no celular. O formato não muda conforme a tela ou a tag HTML.

Este padrão atende controles compostos por ícone e, quando aplicável, contador. Botões com texto usam `.button`, compartilhando o tamanho do ícone. Botões com texto mantêm a altura de 44 px e o raio de controle. Cartões de módulos e fotos clicáveis mantêm seus componentes próprios; não aplicar `.icon-button` ao cartão inteiro.

- `button` para executar uma ação, sempre com `type="button"` fora de submissões.
- `a` com `href` ou `routerLink` para navegar, mantendo abertura em outra aba.
- `summary` para abrir filtros com `details`; o estado aberto usa o mesmo destaque dos outros controles.
- `aria-label` obrigatório quando não houver texto visível. `title` pode complementar, mas não substitui o rótulo acessível.
- Ícones da aplicação vêm de `IconComponent`, com traço único; não usar emoji, texto ou imagens como substitutos.
- Hover usa azul preenchido e ícone branco; pressionado/selecionado usa azul escuro; foco tem contorno azul de 3 px. `aria-expanded`, `aria-pressed` e `details[open]` determinam o estado visual sem seletores próprios de cada tela.
- Desabilitar com `disabled` no botão nativo. Não usar opacidade isoladamente para indicar indisponibilidade.

```html
<button
  type="button"
  class="icon-button"
  aria-label="Ações do munícipe"
  aria-controls="citizen-contact-actions"
  [attr.aria-expanded]="actionsExpanded()"
>
  <app-icon name="menu" />
</button>

<summary class="icon-button" aria-label="Filtrar linha do tempo">
  <app-icon name="filterFunnel" />
</summary>
```

## Variantes permitidas

Uma variante é uma função específica, não uma alternativa estética para escolher por tela. Todas exigem a classe base `.icon-button`.

| Classe adicional          | Uso permitido                                                   | Diferença                                                                                                                     |
| ------------------------- | --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `icon-button--compact`    | Ferramentas lado a lado no desktop e controles dentro de campos | Fundo transparente; mantém os mesmos 30 × 30 px e formato circular no desktop e no celular.                                   |
| `icon-button--success`    | Atalho de WhatsApp                                              | Verde semântico, mantendo tamanho, raio e ícone da base.                                                                      |
| `icon-button--overlay`    | Ações sobre fotografias                                         | Fundo escuro translúcido e ícone branco. Não usar em filtros, cabeçalhos ou formulários.                                      |
| `icon-button--with-count` | Quantidade de fotos                                             | Largura ajustada ao contador; mantém a altura e o raio da base. Combinar com `--overlay`.                                     |
| `icon-button--primary`    | Ação principal                                                  | Azul preenchido e ícone branco.                                                                                               |
| `icon-button--floating`   | Botão “+” de nova interação                                     | 56 × 56 px, ícone de 24 px, círculo e sombra. Combinar com `--primary`. Apenas a posição fixa pertence ao componente da tela. |

Não combinar `--compact` com `--with-count` ou `--floating`. Não combinar cores de `--success`, `--overlay` e `--primary` entre si. Os botões de ícone são circulares. A variante com contador usa formato de cápsula para acomodar o número; o flutuante conserva o tamanho especial de 56 px.

`.icon-toolbar` organiza grupos com espaçamento de 4 px. `.icon-toolbar--badged` reserva 20 px entre controles e 8 px de espaço vertical para os contadores, sem alterar os botões. `.icon-button__badge` posiciona o contador no canto superior direito. Contadores não redefinem a geometria ou a cor do botão.

Contadores de solicitações usam `icon-button__badge--danger` para pendentes e `icon-button__badge--success` para finalizadas. Quando houver os dois no mesmo botão, aplicar também `icon-button__badge--lower` ao segundo contador, colocando-o no canto inferior direito. O rótulo acessível e o `title` devem informar os dois números e seus estados por extenso; os números visuais usam `aria-hidden="true"` para evitar repetição. Interações e agendamentos usam o contador azul padrão. Manter inclusive os valores zero.

```html
<a
  class="icon-button icon-button--success"
  href="https://wa.me/5511900000001"
  target="_blank"
  rel="noopener noreferrer"
  aria-label="Conversar no WhatsApp"
>
  <app-icon name="whatsapp" />
</a>

<button
  type="button"
  class="icon-button icon-button--overlay icon-button--with-count"
  aria-label="Ver todas as fotos do munícipe"
>
  <app-icon name="image" /><span>4</span>
</button>
```

## Espaçamento entre blocos

**Etiquetas de tarefas — 19/11/2026:** `.task-label` apresenta nome e cor definidos pelo usuário, com quebra de texto e sem truncamento. `--task-label-background` recebe a cor hexadecimal do cadastro; `--task-label-foreground` recebe preto ou branco, escolhidos pelo componente compartilhado conforme a maior razão de contraste WCAG (mínimo AA para qualquer cor sRGB opaca). As cores são dados do catálogo, não uma nova paleta de status. `TaskLabelChipComponent` é a apresentação única no cartão, no seletor e na gestão; `TaskLabelsComponent` organiza várias etiquetas por tarefa. A seleção usa checkboxes nativas com nomes visíveis. Não usar somente a cor para comunicar a etiqueta, nem substituir os indicadores de status, prioridade ou prazo. Exemplos estão em `index.html`; controles com ícone continuam usando `.icon-button` sem variações locais.

No formulário de tarefa, `Adicionar etiqueta` usa `.form-input.form-input--compact`, com largura ajustada ao texto e altura mínima de 32 px. Cada seleção aparece abaixo como um pill colorido. `.task-label--removable` usa o nome completo e o ícone de fechar no mesmo botão, com rótulo acessível para a remoção. Os pills quebram de linha conforme a largura disponível.

Cards de módulos usam `.module-tile`. Quando houver página disponível, usar um link (`a` com `routerLink` na aplicação) para permitir navegação e abertura em outra aba, mantendo a mesma aparência dos botões dos módulos ainda indisponíveis. O estilo compartilhado remove o sublinhado do cartão inteiro; não criar outra geometria para o link.

Categorias do munícipe usam `.badge.badge--category`: etiquetas de leitura em formato de cápsula, texto de 11 px, peso regular e padding de 3 × 8 px, mantendo aparência de etiqueta. Na ficha, cada categoria é um botão nativo que abre confirmação antes de remover o vínculo; usar também `.badge--category-action` para o estado de hover. Cancelar preserva o vínculo, e remover não exclui a categoria do catálogo. O contêiner usa flex com `flex-wrap` e `gap` para acomodar várias categorias no celular. Adicionar categoria usa o botão `.icon-button` padrão com o ícone `plus`, ao lado das etiquetas; não criar um novo estilo de botão. O desenho da etiqueta fica em `components.css`, sem duplicação nas telas.

Preferência explícita do usuário: para separar elementos irmãos de um layout, usar `gap` no contêiner `flex` ou `grid` em vez de acumular `margin-top`/`margin-bottom` nos filhos. O contêiner é responsável pelo ritmo entre os blocos; usar os tokens de espaçamento existentes.

A classe compartilhada `.layout-stack` organiza blocos na vertical com `gap: var(--space-3)` (12 px). Na ficha, ela separa o card do nome e `.detail-columns`, substituindo a margem superior anterior de 24 px por um intervalo menor de 12 px. O espaçamento interno entre as colunas continua definido pelo grid.

Margens continuam apropriadas para centralização (`margin-inline: auto`) e ajustes pontuais que não representem a separação regular entre irmãos. Não fazer uma troca indiscriminada de todas as margens da aplicação.

```html
<div class="layout-stack">
  <header class="citizen-header">...</header>
  <div class="detail-columns">...</div>
</div>
```

## Regras para agentes e manutenção

1. Antes de criar ou alterar um controle, usar a classe existente e escolher a variante pela função descrita acima.
2. Não redefinir `width`, `height`, `padding`, `border`, `border-radius`, `background`, `color`, `box-shadow`, dimensões do ícone ou estados de `.icon-button` nos SCSS das telas.
3. Classes locais cuidam somente de posição, margem, visibilidade responsiva, abertura de painéis e organização do layout. Exemplos: mostrar o menu somente no celular, posicionar o contador de fotos sobre o mosaico ou fixar o “+” no canto.
4. Não criar classes locais de hover, foco ou seleção para estes botões. Usar os atributos nativos e as classes centrais.
5. Quando uma necessidade nova exigir evoluir o padrão, alterar a base compartilhada, atualizar este documento e incluir um exemplo no guia visual na mesma tarefa. Não introduzir uma exceção escondida no componente.
6. O protótipo arquivado de conversas não foi migrado nesta versão. Ao retomá-lo, remover seus overrides locais e aplicar esta mesma base.

Os tokens `--icon-button-*` têm definição única em `tokens.css`. Não sobrescrevê-los dentro de componentes para contornar estas regras. A preferência do usuário de não executar testes/build sem solicitação continua valendo.
