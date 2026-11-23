# Regras de negócio dos comandos e leituras

Contrato proposto **1.0.0-draft.3**. Estas são obrigações para a futura implementação; validar o OpenAPI não prova que elas já funcionam. Cada regra deve valer para UI, worker e futura integração MCP.

## Salvar conjuntos, sem entidades pela metade

O limite transacional acompanha a confirmação do usuário: salvar munícipe, salvar pedido com itens, integrar temporário, confirmar fusão, registrar retorno ou reverter atividade. Toda validação de campo, permissão, versão e dependência deve ocorrer antes da publicação dos efeitos internos. Auditoria e outbox pertinentes são gravadas na mesma transação de banco.

Arquivo já enviado permanece privado temporário até ser reivindicado pelo comando. A transação publica referências aos bytes persistidos, sem alegar atomicidade distribuída com armazenamento externo. Chamadas externas são processadas com estado durável, idempotência e reconciliação; não manter uma transação aberta esperando WhatsApp/transcrição.

Rejeição de um item não deixa pessoa, protocolo, associação ou participação parcialmente criada. Erro identifica o caminho/chave no editor. O backend não descarta silenciosamente campos proibidos ou itens inválidos para retornar sucesso parcial.

## Pessoa, identificação e contatos

- UUID é identidade interna. Nome é obrigatório; documento, nascimento e contato não são obrigatórios no cadastro geral.
- Mesmo nome, telefone, e-mail ou endereço não implica mesma pessoa. Ausência de informação não conta como coincidência.
- Meio de contato normalizado pode ser compartilhado. Alterar vínculo de uma pessoa não transfere conversas, não renomeia familiares nem remove seu contato.
- IDs de filhos editados pertencem ao agregado autorizado. Criação usa chaves locais e dados inline; não aceita apropriação de itens de outra pessoa.
- A lista de fotos define ordem e principal; mais de uma principal é erro. Ocultar carrossel é preferência do usuário e não exclusão de imagens.
- Documento repetido exige revisão, sem assumir identidade comprovada. Reavaliar candidatos no Salvar sob concorrência. 409 já inclui revisão; confirmação de pessoa distinta é explícita e auditada.
- Coleções presentes em PATCH são o conjunto final editável completo. Ocultar itens por acesso jamais os torna removíveis por omissão. Não truncar um formulário e depois tratá-lo como conjunto completo.

## Indicações e anotação manual restrita

Indicação liga duas pessoas definitivas: zero ou um indicador e vários indicados diretos. Indicado por é campo do próprio cadastro/edição da pessoa. Não criar uma segunda etapa de gravação apenas para esse vínculo. Alteração exige justificativa quando aplicável à edição e registra autor/data/antes/depois.

Rejeitar autoindicação, ciclos de qualquer tamanho e referências sem acesso. A validação de aciclicidade precisa permanecer correta em duas alterações simultâneas, inclusive fusão, integração e reversão. Não basta consultar ancestrais fora da transação. Trocar pai não move os filhos da pessoa.

`GET /relatorios/indicacoes` sem indicadorId lista raízes reais com filhos acessíveis. Com indicadorId retorna filhos diretos e caminho autorizado. Paginação por nível; folha é lista vazia. Pai restrito/arquivado não equivale a ausência de pai. Não expor ancestrais/contagens inacessíveis nem fabricar raiz por filtragem.

“Voto garantido” é apenas anotação manual, facultativa e restrita, com autor/data. Ausência do campo por permissão não equivale a false. Não inferir, verificar ou prever voto. Não usar esse campo em busca geral, classificação automática, filtros de audiência, seleção de destinatários, exportações ou mensagens. Divergência em fusão exige decisão humana autorizada, sem OR/propagação automática. As regras de visibilidade também valem para histórico e reversão.

## Atendimentos e serviços

Conversa, mensagem, pessoa e solicitação com protocolo são conceitos diferentes. Uma conversa pode reunir familiares e vários pedidos. Vincular somente mensagens pertinentes, preservando autoria/origem; não copiar toda a conversa familiar para um protocolo.

`POST /atendimentos` recebe solicitante existente, cadastro novo completo inline ou identidade `a_identificar` com contato/conversa. Identidade desconhecida não obriga criar pessoa fictícia. Resolver posteriormente pode ser parte do mesmo PATCH de pedido, com motivo e permissão, inclusive cadastro novo inline.

Protocolo é gerado no servidor. Serviços executados, pendências, notas e anexos são salvos junto do formulário. `execucaoChave` liga anexo ao serviço criado no mesmo comando. Resultado/conclusão do pedido é diferente de resultado de execução; encaminhado não implica concluído. Concluir/reabrir valida estados, motivos e pendências conforme política, sem exigir salvar cada item por rota própria.

Fichas trazem primeira página de mensagens e histórico recente. Paginação extensa é explícita. Foto de atendimento não se torna automaticamente foto de reconhecimento da pessoa. Arquivo exige acesso atual também ao pedido/execução; conhecer URL ou ID não basta.

## Caixa, responsabilidade e respostas

Assumir é atômico: uma pessoa responsável por conversa, respeitando equipe, capacidade, horário e disponibilidade. A presença online não basta. Responsável do pedido pode diferir do responsável da conversa. Queda breve não redistribui imediatamente.

Transferir preserva histórico e pode retirar acesso do executor; resposta não devolve workspace agora proibido. Alteração de contexto usa versão de responsabilidade/contexto, sem invalidar todo envio apenas porque chegou uma mensagem nova. A implementação ainda verifica acesso e estado antes da saída.

Uma resposta pode conter texto e mídias preparadas no mesmo comando. Persistir mensagem pendente e outbox antes de 202. Usar chaveCliente para reconciliar UI otimista, resposta e SSE. Recebida/aceita pelo provedor/entregue/lida/falha/resultado incerto são estados diferentes. Só usar evidências oferecidas pelo conector.

O botão Tentar novamente já inclui reconciliação no backend. Timeout incerto não autoriza envio duplicado. Há uma operação ativa por intenção/mensagem. Confirmar estados antigos não regride estado confirmado. Notas internas têm tipo e compositor próprios e nunca são enviadas como resposta.

IA sugere e organiza durante atuação humana. Automação exige política validada e permissões; revalidar responsabilidade/modo no worker antes de uma resposta automática pendente. IA indisponível não bloqueia triagem humana. Mensagens fragmentadas/cumprimentos não criam protocolos por mensagem. Reanalisar é ação explícita de exceção, não requisito de todo recebimento.

## Cadastro público, conferência e presença

Formulário público expõe somente configuração e dados permitidos para declaração. Não pesquisa pessoas, não lista cadastros/participantes e não preenche com dados internos. Sessão da equipe presente no navegador não amplia a resposta desse endpoint. Confirmação e erros não revelam se pessoa/telefone/documento já existe.

Persistir declaração temporária antes do recibo. Conferência interna recebe declaração original, candidatos com evidências e ficha comparada já montada. Usuário escolhe novo ou existente e quais campos incorporar; vazio declarado não apaga informação automaticamente. Comparar outro candidato é mudança explícita da tela.

Integração revalida versão do temporário e do destino, identidade/autorização, duplicidade e origem. Um comando salva pessoa, vínculos, participação e decisão, preservando ID/histórico do destino. Em integrar_existente, omitir alteracoes mantém todos os dados e integra apenas participação/origem/decisão; não exigir edição fictícia. Ações de assumir, transferir, adiar, descartar e integrar têm permissões condicionais explícitas, além do acesso à tela. Duas conferências concorrentes não integram duas vezes. Também reavaliar candidatos de envios distintos processados ao mesmo tempo.

Uma pessoa participa de vários eventos; reenvios no mesmo evento não multiplicam participação. Preservar declarações e decisões anteriores. Inscrição e presença confirmada são diferentes; presença requer data/evidência da equipe. Finalidade “lista de presença” do link não é, sozinha, comprovação de comparecimento. Participação não cria automaticamente atendimento ou serviço.

Criar evento novo e formulário pode ser o mesmo salvar; reutilizar evento existente revalida versão compartilhada. Alterar nome/local compartilhado exige permissão explícita e atualiza os consumidores de maneira coerente. Revogar/rotacionar link invalida o anterior; não reabrir silenciosamente um link revogado.

## Observações, transcrição e busca

Observações são texto extenso com limite efetivo explícito. Áudio pode ser enviado em rascunho novo ou ficha existente. Resultado é texto de trabalho, sujeito a revisão. O Salvar recebe texto final já mesclado e origem; transcrição não é aplicada duas vezes nem automaticamente por um worker. Não exigir salvar a digitação existente antes de transcrever.

Falha da transcrição não apaga digitação. Permissão, duração, formato, retenção do áudio e escopo do rascunho são revalidados. Texto salvo integra busca autorizada; áudio não publicado e versões substituídas de auditoria não viram resultados gerais.

Busca normaliza acentos/grafia dos campos previstos e procura dados atuais da pessoa e texto de atendimentos autorizados. Uma pessoa por resultado, com trecho e origem autorizados. Aplicar acesso antes de trechos, contagens, ordenação e total. Múltiplos critérios de atendimento precisam coincidir no mesmo pedido. Filtros de classificações distinguem qualquer/todas/sem classificação e preservam histórico de opções inativas.

Datas usam componentes, intervalo ou ausência; validar existência civil, limites e fuso. Intervalos são inclusivos na experiência da interface. Não substituir mês informado por datas do ano atual quando a consulta é de aniversariantes de qualquer ano.

## Contato, agenda e retomada

Contato efetivo, tentativa e edição administrativa são eventos distintos. Alterar ficha não atualiza último contato. Mensagem enviada sem evidência de interação/resposta e tentativa sem resposta não comprovam conversa efetiva. Frequência pode usar dias distintos de interação; volume de mensagens e número de protocolos permanecem separados.

Ausência no histórico autorizado não prova que nunca houve contato fora dele. Exibir cobertura incompleta/acesso parcial. Fusões, correções e reversões recalculam evidências e indicadores. Dias sem contato/janelas móveis mudam também com o tempo.

Agenda retorna motivo da pendência, pessoa/pedido, responsável, versão e ação. Registrar resultado pode concluir compromisso, criar evidência real e agendar próximo retorno em uma transação. Respeitar preferência e evitar retornos duplicados. Nenhum filtro ou lista autoriza disparo automático de mensagens.

## Etiquetas e impressão

Modelo inicial contém nome e endereço. Editor permite campos autorizados e texto fixo estruturado; sem código arbitrário. Usuário escolhe gabarito Pimaco homologado somente leitura ou medidas personalizadas em milímetros. Nenhum código/dimensão oficial é presumido antes da homologação do catálogo.

Prévia aceita template/formato em rascunho e seleção por IDs ou consulta. Não exige salvar bibliotecas nem persistir seleção. Backend materializa destinatários autorizados uma vez, valida endereços/grade/margens/célula inicial/cópias/deslocamento, verifica texto que não cabe e gera PDF imutável. Erro de destinatário inclui alternativas permitidas no próprio contexto do erro; não escolher endereço ambíguo silenciosamente.

O mesmo PDF é usado para conferência e impressão, com data do snapshot visível. Alterar seleção, dados ou layout exige nova prévia. Revalidar acesso ao arquivo; mudança de permissão pode invalidar sua disponibilidade. PDF já baixado e papel impresso não podem ser recolhidos pela API. Registrar emissão não comprova impressão física; não criar endpoint de falsa confirmação do navegador. Posição inicial vale para primeira folha; não sobrescrever gabarito oficial por calibração local.

## Conexão e avisos do Chrome

Painel reúne estado recente, tentativa ativa, autenticação permitida e incidentes. GET não reconecta. Comando de reconexão é único por canal; decide recuperar sessão ou renovar autenticação conforme estado/conector. Permissão específica para reconectar/ver QR; não incluir QR em SSE geral, histórico ou notificações.

Servidor monitora mesmo sem tela aberta, agrupa incidente e evita tempestade de alertas. Web Push exige consentimento do navegador e inscrição do dispositivo autorizado; registrar aceite não comprova visualização. Logout/desativação revoga futuros alertas. Notificação em trânsito pode chegar com conteúdo mínimo. Navegador totalmente fechado, dispositivo offline ou notificações bloqueadas têm limites; queda de toda a VPS requer monitor externo.

## Auditoria, arquivamento, fusão e reversão

Registrar ação, alvo, autor humano/serviço/público devidamente diferenciado, data do servidor, origem, resultado, antes/depois, versões e proveniência dos vínculos. Não inventar usuário autenticado para envio público. Não registrar senhas, sessão, QR ou chaves push em claro. Leituras/arquivos têm rastreamento apropriado sem fabricar mudança no negócio.

Arquivamento é lógico e preserva histórico/dependências. Fusões preservam rastreamento dos IDs e itens movidos. Comparação devolve duas fichas, impactos e token; confirmação recebe formulário final escolhido. Dados e vínculos restritos não são unidos por inferência. Preservar proveniência de contatos, participações, mensagens e relações para eventual recomposição.

Detalhe da atividade já mostra impacto e limites da reversão. Confirmar com token/motivo revalida acesso atual, versões e dependências e cria nova atividade ligada à original. Preservar mudanças posteriores independentes; conflito exige decisão, não sobrescrita. Toda inversão exige também a permissão da ação/campo correspondente.

Reversão não desfaz mensagem entregue, serviço realizado, download ou impressão. Pode cancelar trabalho ainda pendente quando seguro e registrar compensação quando aplicável. Bytes definitivamente expurgados não voltam apenas pelo log; respeitar prazo de recuperação. Backup integral é recuperação de desastre, separado do botão Reverter.

## Administração e pendências

Catálogos editáveis reais: classificações, tipos de serviço e categorias. Inativar preserva vínculos; cadastrar em modal devolve objeto selecionável e não obriga vínculo antecipado. Usuário é salvo com perfis/equipes em uma ação. Desativar revoga acesso futuro; impedir eliminação do último administrador e elevação de autoridade do executor.

Configuração é formulário agregado por blocos autorizados, sem segredos de fornecedores. Alterar retenção não autoriza expurgo imediato. Papéis finais, limites, retenção, critérios de estados, metas de desempenho e capacidades do conector precisam ser validados antes da implementação. Recursos futuros não recebem CRUD antecipado nesta documentação.
