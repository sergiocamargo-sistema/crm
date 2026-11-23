# Ditado de texto por voz

Implementado em **18/11/2026**, a pedido do usuário, no texto da interação aberta pelo “+” flutuante da ficha do munícipe. A implementação não foi testada nem buildada nesta tarefa, conforme a preferência de validação pelo usuário.

## Funcionamento

O botão de microfone inicia o reconhecimento em **português do Brasil** após um clique e a permissão do navegador. O ícone muda para parar e o estado indica que está ouvindo. Resultados provisórios aparecem no próprio campo enquanto a pessoa fala e são corrigidos quando o navegador revisa a transcrição, sem acrescentar a mesma frase a cada resultado.

O texto é inserido na posição do cursor; uma seleção é substituída quando chega a primeira transcrição. O conteúdo anterior e posterior é preservado. O limite de caracteres do campo também limita o ditado; na interação, são 1.500 caracteres, configurados por `maxLength(schema.description, 1500)` no Signal Forms. Não declarar o atributo `maxlength` junto de `[formField]`: o Angular gerencia esse atributo a partir do schema. O texto já exibido fica disponível para revisão quando o usuário para, ocorre uma falha ou o navegador encerra a sessão. Não há reinício automático após uma pausa ou erro: o usuário pode tocar novamente no microfone.

Digitar ou tocar no campo pausa o ditado para preservar a edição manual. Fechar o diálogo, trocar de munícipe, sair da aba ou destruir o campo encerra a captura e descarta eventos tardios. Ao salvar a interação, interromper o ditado antes de ler o formulário. A transcrição não salva a interação por conta própria; continua sendo necessário registrar o formulário.

## Reutilização

- `src/app/shared/directives/speech-to-text.directive.ts`: diretiva `SpeechToTextDirective`, aplicada em `textarea[appSpeechToText]` e exportada como `speechToText`.
- `src/app/shared/components/dictation-button/`: `DictationButtonComponent`, que usa o botão circular de 30 px do design system e apresenta o estado acessível.
- `src/app/shared/browser/speech-recognition.ts`: tipos mínimos e detecção de `SpeechRecognition`/`webkitSpeechRecognition`, sem declarar globais ou adicionar biblioteca.

Importar `SpeechToTextDirective` e `DictationButtonComponent` no componente consumidor, mantendo também `FormField` para Signal Forms. Usar IDs únicos para cada campo:

```html
<label for="texto-longo">Descrição</label>
<textarea
  id="texto-longo"
  appSpeechToText
  #ditado="speechToText"
  speechLanguage="pt-BR"
  [formField]="editorForm.description"
  aria-describedby="texto-longo-dictation-status"
></textarea>
<app-dictation-button [target]="ditado" controlId="texto-longo" />
```

A diretiva atualiza o valor nativo e dispara `input` para manter o formulário sincronizado, sem duplicar seu modelo de texto. Definir o limite no schema do Signal Forms, por exemplo `maxLength(schema.description, 5000)`, e não no HTML com `[formField]`. Se já houver mensagens de ajuda/erro, acrescentar seus IDs a `aria-describedby`.

`active()` e `status()` são sinais somente de leitura. `stop()` encerra imediatamente o reconhecimento e preserva a transcrição já exibida; `reset()` também limpa a mensagem anterior ao reabrir um editor. Em consumidores que reutilizam o campo, obter a diretiva com `viewChild(SpeechToTextDirective)` e chamar `stop()` antes de salvar/trocar de registro, além de `reset()` antes de limpar o rascunho.

## Requisitos e limites

- Requer contexto seguro (HTTPS ou localhost), microfone e permissão do usuário. Não solicita acesso ao carregar a tela.
- Detecta disponibilidade em tempo de execução. Não promete suporte a todos os navegadores; sem a API, o botão fica indisponível com uma explicação e a digitação continua normal.
- Permissão negada, microfone indisponível, falta de fala, falha de rede e idioma não suportado recebem mensagens próprias, preservando o texto.
- O estado “Ouvindo” depende do evento `audiostart`, que confirma o início da captura; o evento `start` indica somente a preparação do reconhecimento. `audio-capture` significa falha de captura, `not-allowed` bloqueio do ditado por permissões/políticas, e `service-not-allowed` indisponibilidade ou bloqueio do serviço de reconhecimento; não tratá-los como uma mesma negação do microfone. Em desenvolvimento, o console registra somente o código da falha e se a captura iniciou, sem áudio ou transcrição.
- Usa a Web Speech API do navegador, sem backend, chave de API, biblioteca de transcrição, download de modelo ou armazenamento de áudio pelo CRM.
- **Frontend não significa reconhecimento necessariamente local/offline:** dependendo do navegador, o áudio é enviado ao serviço de reconhecimento do próprio fornecedor. A implementação não força processamento local nem garante funcionamento sem internet. Isso deve ser considerado antes do uso com dados reais.

Referências consultadas em 18/11/2026: [SpeechRecognition](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition) e [resultados provisórios](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition/interimResults).

Diagnóstico de 18/11/2026: os prints das 10:37 mostravam início do ditado seguido de falha de captura. A leitura dos logs existentes de PipeWire/WirePlumber confirmou `Failure in Bluetooth audio transport` para o fone usado como entrada padrão no mesmo horário. Isso comprova uma falha do caminho de áudio Bluetooth nessa tentativa, sem atribuir a causa a uma nova negação da permissão do site. Consultar a entrada selecionada e considerar o microfone interno como alternativa. Nenhuma gravação ou teste de microfone foi realizado, nem configuração de áudio alterada durante esse diagnóstico.
