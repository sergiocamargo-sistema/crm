# Reconstrução da marca dos prints

Correção de 17/11/2026, a pedido do usuário: preservar a identidade original. Assinatura pequena VEREADOR acima do nome compacto SérgioCamargo, com bandeira integrada ao o de Sérgio. O favicon usa um recorte circular dessa parte da marca; o cabeçalho mantém a assinatura completa também no celular.

## Fonte e arquivos

- Referências originais: [01](../referencias/referencia-01.png), [03](../referencias/referencia-03.png) e [04](../referencias/referencia-04.png).
- [Reconstrução transparente utilizada](sergio-camargo-reconstrucao.png), gerada com o modo integrado do `image_gen.imagegen`, usando as referências.
- [Conversor](../gerar_marca.py): vetoriza os contornos em SVG, padroniza os preenchimentos e deriva versão inversa, uma cor e o elemento da letra o. Não gera lettering a partir de fonte.
- Saída para o site: `frontend/public/brand/sergio-camargo.svg`, `sergio-camargo-inverse.svg`, `sergio-camargo-monochrome.svg` e `simbolo.svg`.

A origem disponível é uma captura de tela. Trata-se de uma reconstrução visual a partir dela, não do arquivo mestre oficial. Preservar essa distinção e substituir pelos arquivos oficiais caso sejam disponibilizados.

## Prompt final de refinamento

Ferramenta: `image_gen.imagegen`, modo integrado, fundo transparente. Entradas: reconstrução inicial e referências 01 e 03.

```text
Make only this restrained fidelity correction to the restored logo in image 1, following the original wordmark at top of images 2 and 3: the small uppercase VEREADOR caption must have the original LIGHT REGULAR WEIGHT with wide tracking, not the heavy bold lettering now used for that small caption. Keep its current total width, centered placement above the name, and small scale. Main SérgioCamargo lettering must retain exactly its current contours, compact spacing, accented é and proportions. Retain exactly the original Brazilian flag detail IN PLACE OF THE o in Sérgio, not separate from the lettering. Replace any subtle gradients/textures by solid royal blue #064EA0, solid yellow #FFDF00, and a white curved band inside the blue circle; crisp flat logo artwork. No other changes, no new icons, no C monogram, no badge to the left, no added text. Transparent background, horizontal complete logo only. Modest transparent padding. This is restoration of the original identity, not a new design.
```

As duas edições foram feitas pela ferramenta de imagem integrada. O PNG selecionado foi copiado para esta pasta; a etapa posterior produz SVG nativo sem bitmaps incorporados.
