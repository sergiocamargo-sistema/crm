# Etiquetas de munícipes

Implementado no frontend mock em 18/11/2026, a partir da seção 3.3 do [planejamento anterior](../../docs/planejamento.md) e do pedido de barra lateral e impressão nesta conversa. A confirmação posterior do usuário foi usar Pimaco, mantendo o catálogo genérico e leve.

## Fluxo disponível

1. Em `/municipes`, clicar em **Selecionar resultados** para revelar as caixas acima dos botões de redes sociais, sem marcar ninguém automaticamente. O texto vira **Selecionar todos**, que marca toda a busca atual e preserva quem já estava selecionado em outras buscas. A seleção e o modo ativo persistem ao alterar texto, filtros e ordenação, inclusive ao visitar a ficha ou o editor e voltar. O contador mostra o total e quantos estão fora da busca atual. **Limpar seleção** permanece disponível mesmo com zero marcados: esvazia tudo, oculta as caixas e restaura Selecionar resultados. Não existe ação Desmarcar resultados; as caixas permitem retirar pessoas individualmente.
2. Abrir o ícone de impressão e escolher **Selecionados (N)**, incluindo as pessoas marcadas em pesquisas anteriores, ou **Todos os resultados (N)**, incluindo a busca completa na ordenação atual, sem depender das caixas marcadas. Imprimir resultados não acrescenta, remove nem mistura pessoas da seleção acumulada. O ícone fica habilitado quando houver resultados ou seleção. `/etiquetas?municipes=id1,id2` recebe uma cópia dos IDs escolhidos e prepara todos os destinatários por uma ação do repositório, sem carregar uma ficha por pessoa. O mesmo acesso está no grupo de ações da ficha para imprimir uma pessoa.
3. Escolher código Pimaco, formato personalizado ou um formato salvo. Os destinatários e o endereço usado ficam visíveis e podem ser retirados do lote sem editar o cadastro. É possível restaurar os destinatários da seleção original.
4. Editar o modelo inicial Nome e endereço, acrescentar/remover/reordenar campos, escolher negrito, fonte, tamanho, alinhamento, margem interna e textos fixos. Campos opcionais vazios não consomem linhas. Salvar alterações atualiza o modelo selecionado; Salvar como novo exige outro nome e preserva o anterior.
5. Definir cópias por munícipe, posição inicial na primeira folha e deslocamentos em mm. A contagem das posições é da esquerda para a direita, de cima para baixo. O lote continua nas folhas seguintes. Contornos de alinhamento são opcionais e fazem parte do PDF quando escolhidos.
6. Gerar a prévia em PDF. Conferir, baixar ou solicitar impressão do mesmo arquivo. A impressão deve usar tamanho real/100% e o papel do formato. O navegador/impressora podem exigir seus próprios ajustes; a implementação não declara impressão física concluída ao chamar `print()`.

A amostra de conteúdo antes da geração é apenas uma composição legível. A prévia nas medidas físicas é o PDF gerado, sem reconstrução diferente para imprimir. Modificar conteúdo, destinatários, papel ou geometria invalida esse PDF; o arquivo é gerado novamente antes de imprimir. Pesquisar outro código no catálogo não modifica o trabalho atual nem invalida o arquivo.

## Busca completa e paginação

Pedido de 18/11/2026: `CitizenListService.resultIds` representa todos os registros que satisfazem a busca e os filtros, na ordem selecionada. `labelRecipientIds` devolve uma cópia desse conjunto ou da seleção acumulada, sem alterá-los. Impressão e seleção em lote usam o conjunto completo, nunca os elementos renderizados da página. Desde 19/11/2026, o mock aplica busca, filtros e ordenação antes de devolver a projeção completa dos resultados; ainda não há paginação. Enquanto uma consulta está pendente ou falha, ações sobre todos os resultados ficam indisponíveis para não imprimir a resposta de critérios anteriores; a seleção acumulada permanece disponível. Se a apresentação for paginada, manter `results`/`resultIds` completos e paginar somente a apresentação. Em integração futura com paginação no servidor, resolver todos os IDs por uma ação de busca completa no repositório antes de preparar os destinatários; não usar apenas a página carregada nem declarar suporte de backend já implementado. Os limites existentes do lote PDF continuam explícitos, sem cortar resultados silenciosamente.

## Campos na mesma linha

Pedido de 18/11/2026: a partir do segundo campo, marcar **Na mesma linha do anterior, separado por " - "** para compor, por exemplo, `Vila Nova - São Paulo / SP`. A opção pertence ao campo que será acrescentado ao anterior e pode encadear mais de dois campos. Desmarcada, inicia outra linha. A configuração é salva no modelo como `joinPrevious`; modelos anteriores sem esse valor continuam com linhas separadas.

A composição é compartilhada entre a amostra de conteúdo e o gerador PDF. Campos opcionais vazios são omitidos sem hífen inicial, final ou duplicado; um campo configurado para iniciar outra linha mantém esse limite mesmo quando estiver vazio. O primeiro campo não recebe um separador, inclusive após reordenação. Cada trecho preserva seu próprio negrito; o separador usa peso regular. O gerador mede o conjunto e quebra o texto dentro da largura disponível, preservando a validação de altura e sem truncar conteúdo. Alterar a opção invalida a prévia PDF anterior.

## Catálogo Pimaco

`src/app/features/labels/data/pimaco-formats.json` tem 156 códigos/variações extraídos das quatro tabelas disponibilizadas pelo fabricante, incluindo Carta/A4, A5 Evolution, Pimatab e cartões de visita. O JSON minificado ocupa aproximadamente 19 KB, agrupa códigos com as mesmas medidas e é importado pelo repositório mock de etiquetas. A biblioteca `pdf-lib` é um import dinâmico separado, solicitado apenas ao gerar a prévia; não é incluída na home ou na lista.

Fontes consultadas e baixadas em **18/11/2026**:

- [Pimaco — parâmetros de impressão](https://editor.pimaco.com.br/downloads/parametros).
- [Tabela Carta/A4 e especiais — Word 2007](https://editor.pimaco.com.br/documents/parametros/inkjet_a4/params_inkjet_a4_especiais_word_2007.doc).
- [Tabela A5 Evolution — Word 2007](https://editor.pimaco.com.br/documents/parametros/inkjet_a5/params_inkjet_a5_word_2007.doc).
- [Tabela Pimatab — Word 2007](https://editor.pimaco.com.br/documents/parametros/pimatab/params_pimatab_word_2007.doc).
- [Tabela de cartões de visita — Word](https://editor.pimaco.com.br/documents/parametros/cartoes_visita/params_cartao_visita_word.doc).

As tabelas fornecem valores em centímetros: o catálogo os converte para milímetros. Densidade é o passo entre posições; o vão resulta da diferença entre densidade e dimensão da etiqueta. Não confundir densidade com espaçamento vazio. A orientação A5 é **inferida** pelo encaixe da grade no papel de 148,5 × 210 mm informado pelo fabricante. Formulários contínuos Pimatab não têm dimensões de folha definidas nessas tabelas: o usuário informa largura e altura antes de gerar, sem inventar um tamanho oficial. O catálogo cobre os códigos publicados nessas fontes, sem afirmar que representa todo produto já comercializado pela marca; códigos ausentes continuam atendidos pelo formato personalizado.

As medidas do catálogo permanecem preservadas; Usar como personalizado cria um rascunho separado. Deslocamentos de calibração pertencem ao trabalho e não alteram o gabarito. Códigos repetidos em Pimatab são distinguidos pela quantidade de colunas. Os gabaritos expressam a grade e as dimensões de posicionamento: recortes especiais e calibração física precisam ser conferidos pela equipe no papel usado.

Para atualizar os dados, baixar as quatro fontes, convertê-las localmente para HTML com LibreOffice usando os mesmos nomes-base e executar `python3 scripts/import-pimaco-catalog.py <pasta-html> src/app/features/labels/data/pimaco-formats.json`. O importador não acessa a rede e não integra o bundle da aplicação. O Word/HTML original e suas imagens não são distribuídos com o frontend.

## Conteúdo, encaixe e arquivos

- Campos permitidos no mock: nome, logradouro/número, complemento, bairro, cidade/UF, CEP, telefone, CRA, categorias, aniversário e texto fixo. Os valores são texto, nunca HTML ou código executável. O editor não altera a pessoa.
- Endereço escolhido é o único endereço disponível no cadastro mock. Uma versão futura com vários endereços exigirá escolha explícita; não criar uma regra implícita de envio para endereço arbitrário.
- A geração usa métricas reais da fonte do PDF para quebrar linhas, inclusive nomes longos. O texto não é truncado nem reduzido silenciosamente. Se ultrapassar a altura, a geração identifica a pessoa e exige ajuste ou retirada do lote.
- Endereços incompletos bloqueiam etiquetas de endereço. Campos exclusivamente não postais podem usar outro modelo sem exigir endereço. As fontes padrão são Helvetica, Times Roman e Courier; caracteres fora de sua codificação são informados, sem substituição silenciosa.
- A grade deve caber na folha, com margens/vãos não negativos, dimensões positivas e deslocamentos válidos. Limites operacionais do mock: 5.000 etiquetas, 100 cópias por pessoa e 500 folhas por geração, além de até 20 campos por modelo.
- A prévia usa um snapshot dos dados, do modelo e do formato. Seu Blob PDF alimenta o iframe e o download; a URL é revogada ao invalidar/substituir a prévia ou sair da página. O `DomSanitizer` recebe somente essa URL `blob:` criada localmente, nunca uma URL ou HTML digitado no editor.

## Arquitetura e escopo

`LabelPrintComponent` → `LabelPrintService` → `CitizenDetailRepository.prepareLabelRecipients` para destinatários e `LabelPrintRepository` → `MockLabelPrintRepository` para modelos/formatos. `label-layout.ts` valida e compõe campos; `label-pdf.ts` gera o PDF com `pdf-lib` somente sob demanda. O modelo de conteúdo e o formato físico são objetos distintos. Há versões e preservação das anteriores no repositório em memória, com rejeição de versão concorrente no salvamento; auditoria e reversão com backend ficam para outra etapa.

Não há upload, API de etiquetas, autenticação ou envio para impressão remota. Modelos e formatos salvos são preservados durante a navegação e removidos no F5, conforme o comportamento mock atual. Não exibir avisos repetitivos desse comportamento na tela. A criação de modelo/formato permanece um gatilho disponível para automação futura; o motor não é implementado nesta entrega.

Não foram executados testes, builds, navegação de validação ou impressão física: o usuário reservou esses testes para si. A recompilação automática do servidor de desenvolvimento permanece em funcionamento.
