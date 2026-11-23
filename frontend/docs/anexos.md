# Anexos e reprodução de áudio

Pedido do usuário em 19/11/2026: permitir anexar e reproduzir áudios em todos os fluxos de anexos. Implementado nas telas atuais de solicitações e cartões do Kanban; novas telas e a futura retomada da caixa de conversas devem reutilizar esta base.

O catálogo `src/app/features/requests/models/attachment-files.ts` define os formatos aceitos e gera o `accept` dos seletores. Além das fotos e documentos existentes, aceita MP3, M4A, AAC, WAV, OGG, OGA, OPUS, WebM, FLAC, AMR, AIF/AIFF e 3GP. O tipo `RequestAttachment` distingue `photo`, `document` e `audio`. A extensão é validada; para áudio, preservar o MIME `audio/*` informado pelo arquivo quando disponível, recorrendo ao catálogo quando estiver ausente. Isso não valida os bytes nem converte codecs.

Os serviços existentes continuam validando arquivos não vazios de até 20 MB cada antes de criar as URLs locais. Não há biblioteca, upload, base64 ou persistência remota. Falhas ao incluir revogam as URLs criadas; a aplicação mantém sua liberação ao destruir os serviços.

`shared/components/audio-attachments/AudioAttachmentsComponent` recebe uma lista leve de `{id, name, url}` e um rótulo acessível. Cada arquivo apresenta nome, botão padrão de download e player HTML nativo com controles de reprodução, pausa e posição. Usa `preload="none"`, sem autoplay, evitando carregar todos os áudios ao montar a tela. A lista e os players têm rótulos; o layout se ajusta à largura disponível, inclusive no celular.

A reprodução depende do navegador, contêiner e codec. Se o player emitir erro, apresenta uma mensagem junto ao arquivo e mantém o download para ouvir em outro aplicativo. O anexo continua aceito mesmo quando não puder ser reproduzido naquele navegador. Não foi implementada gravação de voz nem transcrição nesta alteração.

Anexos de tarefas vinculadas permanecem na coleção da solicitação com `taskId`; independentes usam a coleção da tarefa. Os contadores incluem áudio sem tratá-lo como capa ou foto. O histórico identifica o arquivo como áudio; o mesmo registro continua sendo projetado na solicitação e na ficha do munícipe. Toda criação de anexo permanece gatilho para automações futuras, sem executar automações nesta etapa.

Não foram executados testes, build manual ou reprodução em navegador, conforme preferência do usuário.
