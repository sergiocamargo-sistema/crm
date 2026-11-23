# Cobertura: tela → ação → endpoint

26 cenários completos e 88 ações. [Ordem e orçamento de chamadas](cenarios.md) · [Manifesto verificável](cenarios.json).

| Tela | Ação do frontend | Endpoint | Backend resolve |
| --- | --- | --- | --- |
| Entrar | Entrar no sistema | `POST /auth/login` | autenticar; criar sessão; montar bootstrap |
| Inicialização | Restaurar sessão e montar a aplicação | `GET /app` | DTO pronto ou ação explícita da tela. |
| Menu da conta | Sair e desvincular alertas da sessão | `POST /auth/logout` | DTO pronto ou ação explícita da tela. |
| Preferências e disponibilidade | Salvar minhas preferências ou disponibilidade | `PATCH /conta` | DTO pronto ou ação explícita da tela. |
| Alterar senha | Trocar minha senha | `POST /conta/senha` | DTO pronto ou ação explícita da tela. |
| Autocomplete compartilhado | Pesquisar opções de um campo | `GET /opcoes` | DTO pronto ou ação explícita da tela. |
| Cadastrar munícipe | Montar o formulário de novo munícipe | `GET /municipes/formulario` | DTO pronto ou ação explícita da tela. |
| Lista e relatório de munícipes | Pesquisar, filtrar e paginar munícipes | `POST /municipes/pesquisa` | DTO pronto ou ação explícita da tela. |
| Cadastrar munícipe | Salvar munícipe completo | `POST /municipes` | validar formulário/permissões; reavaliar duplicidade; criar pessoa; resolver contatos compartilhados; salvar endereços/documentos/classificações/indicação/preferência; consumir uploads e registrar fotos; registrar origem de transcrição; vincular contexto da conversa se pedido; auditar e retornar ficha pronta |
| Ficha e edição do munícipe | Abrir ficha pronta para consultar e editar | `GET /municipes/{id}` | DTO pronto ou ação explícita da tela. |
| Ficha e edição do munícipe | Salvar a edição completa do formulário | `PATCH /municipes/{id}` | validar versão e todos os blocos; calcular diferenças de coleções; resolver meios de contato e preservar familiares; validar grafo e campos restritos; gravar tudo em transação; auditar e devolver ficha/ETag atuais |
| Ficha e edição do munícipe | Arquivar munícipe | `DELETE /municipes/{id}` | DTO pronto ou ação explícita da tela. |
| Aba de anexos da pessoa | Carregar mais anexos dos atendimentos | `GET /municipes/{id}/anexos` | DTO pronto ou ação explícita da tela. |
| Aba de participações da pessoa | Carregar participações em eventos | `GET /municipes/{id}/participacoes` | DTO pronto ou ação explícita da tela. |
| Comparar duplicados | Abrir comparação de duas pessoas | `POST /municipes/fusoes/preparar` | DTO pronto ou ação explícita da tela. |
| Comparar duplicados | Confirmar escolhas e fundir registros | `POST /municipes/fusoes` | revalidar comparação; aplicar escolhas e recompor relações; preservar origem e histórico; retornar ficha mantida |
| Árvore de indicações | Abrir raízes ou filhos diretos de um nível | `GET /relatorios/indicacoes` | DTO pronto ou ação explícita da tela. |
| Arquivos de qualquer formulário | Enviar arquivos do rascunho em lote | `POST /uploads` | validar lote e formatos; persistir temporários privados; devolver tokens por chave local |
| Foto, player, prévia e download | Abrir arquivo ou variante autorizada | `GET /arquivos/{id}/conteudo` | DTO pronto ou ação explícita da tela. |
| Observações por áudio | Enviar áudio e iniciar transcrição | `POST /observacoes/transcricoes` | DTO pronto ou ação explícita da tela. |
| Progresso de tarefa demorada | Acompanhar resultado por fallback de consulta | `GET /operacoes/{id}` | DTO pronto ou ação explícita da tela. |
| Progresso de tarefa demorada | Cancelar processamento ainda cancelável | `DELETE /operacoes/{id}` | DTO pronto ou ação explícita da tela. |
| Novo atendimento | Montar formulário e contexto do pedido | `GET /atendimentos/formulario` | DTO pronto ou ação explícita da tela. |
| Lista de atendimentos | Pesquisar pedidos com linhas prontas | `POST /atendimentos/pesquisa` | DTO pronto ou ação explícita da tela. |
| Novo atendimento | Salvar atendimento completo e seus itens | `POST /atendimentos` | validar formulário e solicitante; cadastrar pessoa inline se necessário e autorizado; gerar protocolo; criar serviços e resolver chaves locais; criar pendências/notas e consumir anexos; vincular mensagens pertinentes; auditar tudo e devolver ficha/contexto |
| Ficha de atendimento | Abrir pedido pronto para editar | `GET /atendimentos/{id}` | DTO pronto ou ação explícita da tela. |
| Ficha de atendimento | Salvar edição ou conclusão com todos os itens | `PATCH /atendimentos/{id}` | revalidar ETag e transição; validar coleções e referências locais; gravar diferenças em transação; auditar e retornar ficha atual |
| Ficha de atendimento | Arquivar atendimento | `DELETE /atendimentos/{id}` | DTO pronto ou ação explícita da tela. |
| Minha agenda e entrar em contato | Carregar pendências, retornos e motivos | `GET /agenda` | DTO pronto ou ação explícita da tela. |
| Agendar próximo contato | Criar retorno com pessoa e responsável | `POST /agenda/contatos` | DTO pronto ou ação explícita da tela. |
| Agenda e entrar em contato | Registrar resultado, concluir ou reagendar | `PATCH /agenda/{id}` | validar item e preferência; registrar resultado/interação pela data real; concluir ou reagendar e evitar duplicidade; recalcular indicadores; retornar item e próximo compromisso |
| Painel de gestão | Carregar indicadores fixos do painel | `GET /relatorios/resumo` | DTO pronto ou ação explícita da tela. |
| Caixa de atendimento | Carregar lista e contadores da caixa | `GET /caixa` | DTO pronto ou ação explícita da tela. |
| Workspace da conversa | Abrir diálogo com todo o contexto | `GET /conversas/{id}` | DTO pronto ou ação explícita da tela. |
| Rolagem e abas do diálogo | Carregar página anterior de mensagens ou notas | `GET /conversas/{id}/historico` | DTO pronto ou ação explícita da tela. |
| Workspace da conversa | Assumir conversa para mim | `POST /conversas/{id}/assumir` | DTO pronto ou ação explícita da tela. |
| Transferir conversa | Transferir para atendente ou equipe | `POST /conversas/{id}/transferir` | DTO pronto ou ação explícita da tela. |
| Identificação e protocolos da conversa | Salvar pessoa, vínculos e correção da triagem | `PATCH /conversas/{id}/contexto` | DTO pronto ou ação explícita da tela. |
| Workspace da conversa | Encerrar atendimento da conversa | `POST /conversas/{id}/encerrar` | DTO pronto ou ação explícita da tela. |
| Compositor de resposta | Enviar resposta ou mídia | `POST /conversas/{id}/mensagens` | DTO pronto ou ação explícita da tela. |
| Mensagem com falha ou estado incerto | Verificar e tentar novamente com segurança | `POST /mensagens/{id}/tentar-novamente` | reconciliar com provedor; só reenviar falha comprovada e autorizada; atualizar linha e emitir evento |
| Compositor de nota interna | Adicionar nota sem enviar ao munícipe | `POST /conversas/{id}/notas` | DTO pronto ou ação explícita da tela. |
| Nota interna do diálogo | Editar ou remover logicamente nota | `PATCH /conversas/{id}/notas/{notaId}` | DTO pronto ou ação explícita da tela. |
| Leitura do diálogo | Atualizar marcador do usuário | `POST /conversas/{id}/leitura` | DTO pronto ou ação explícita da tela. |
| Triagem indisponível ou corrigida | Pedir nova análise contextual | `POST /conversas/{id}/reanalisar` | DTO pronto ou ação explícita da tela. |
| Aplicação aberta | Receber alterações SSE das telas autorizadas | `GET /eventos` | DTO pronto ou ação explícita da tela. |
| Gerenciar conexão do WhatsApp | Abrir painel com estado, QR e histórico recente | `GET /whatsapp` | DTO pronto ou ação explícita da tela. |
| Gerenciar conexão do WhatsApp | Reconectar ou renovar autenticação | `POST /whatsapp/{id}/reconectar` | DTO pronto ou ação explícita da tela. |
| Central de avisos | Carregar notificações com conteúdo e destino | `GET /notificacoes` | DTO pronto ou ação explícita da tela. |
| Central de avisos | Marcar aviso próprio como lido | `PATCH /notificacoes/{id}` | DTO pronto ou ação explícita da tela. |
| Ativar notificações do Chrome | Vincular ou atualizar inscrição deste navegador | `POST /notificacoes/inscricoes` | DTO pronto ou ação explícita da tela. |
| Desativar notificações deste navegador | Desvincular inscrição própria | `DELETE /notificacoes/inscricoes/{id}` | DTO pronto ou ação explícita da tela. |
| Testar notificações do Chrome | Enviar aviso de teste ao próprio dispositivo | `POST /notificacoes/teste` | DTO pronto ou ação explícita da tela. |
| Formulários e listas de presença | Listar formulários com evento, link e contadores | `GET /formularios` | DTO pronto ou ação explícita da tela. |
| Editor de formulário e evento | Salvar evento e formulário, podendo abrir coleta | `POST /formularios` | resolver evento e validar versão compartilhada; validar campos/janela; salvar configuração e estado; gerar link opaco; retornar editor completo |
| Editor de formulário e evento | Abrir editor novo ou existente com contexto completo | `GET /formularios/editor` | DTO pronto ou ação explícita da tela. |
| Editor de formulário e evento | Salvar edição, encerrar, revogar ou trocar link | `PATCH /formularios/{id}` | DTO pronto ou ação explícita da tela. |
| Autocadastro pelo link | Abrir formulário público com todos os campos/opções | `GET /publico/formularios/{token}` | DTO pronto ou ação explícita da tela. |
| Autocadastro pelo link | Enviar cadastro temporário completo | `POST /publico/formularios/{token}/envios` | DTO pronto ou ação explícita da tela. |
| Participantes da ação | Listar inscrições e presenças prontas para conferência | `GET /formularios/{id}/participantes` | DTO pronto ou ação explícita da tela. |
| Incluir participação pela equipe | Registrar participante existente ou novo completo | `POST /formularios/{id}/participantes` | DTO pronto ou ação explícita da tela. |
| Participantes da ação | Confirmar presença ou corrigir participação | `PATCH /formularios/{id}/participantes/{participacaoId}` | DTO pronto ou ação explícita da tela. |
| Fila de cadastros temporários | Carregar fila com nome, origem e responsável | `GET /cadastros-recebidos` | DTO pronto ou ação explícita da tela. |
| Conferir envio e comparar pessoa | Abrir conferência pronta para decidir | `GET /cadastros-recebidos/{id}` | DTO pronto ou ação explícita da tela. |
| Conferir envio e comparar pessoa | Executar ação de conferência em uma chamada | `POST /cadastros-recebidos/{id}/conferencia` | validar comando e autorização; revalidar temporário/destino/duplicidade; salvar agregado de pessoa e participação; registrar decisão e estado; retornar revisão e ficha resultante |
| Editor de etiquetas | Montar editor com modelo, formato e opções | `GET /etiquetas/preparacao` | DTO pronto ou ação explícita da tela. |
| Salvar modelo de etiqueta | Salvar como novo modelo | `POST /etiquetas/modelos` | DTO pronto ou ação explícita da tela. |
| Salvar modelo de etiqueta | Salvar modelo existente e opção de padrão | `PATCH /etiquetas/modelos/{id}` | DTO pronto ou ação explícita da tela. |
| Salvar formato personalizado | Guardar medidas personalizadas para reutilizar | `POST /etiquetas/formatos` | DTO pronto ou ação explícita da tela. |
| Salvar formato personalizado | Alterar ou inativar formato personalizado | `PATCH /etiquetas/formatos/{id}` | DTO pronto ou ação explícita da tela. |
| Prévia e impressão de etiquetas | Gerar PDF conferível e imprimível | `POST /etiquetas/previas` | materializar destinatários autorizados; resolver template/formato salvo ou rascunho; validar endereços/texto/grade e posição inicial; gerar PDF imutável e auditar emissão; devolver arquivo/quantidades pela operação |
| Histórico global ou aba da ficha | Carregar atividades autorizadas | `GET /historico` | DTO pronto ou ação explícita da tela. |
| Detalhe e confirmação de reversão | Abrir diferenças e impacto de reverter | `GET /historico/{id}` | DTO pronto ou ação explícita da tela. |
| Detalhe e confirmação de reversão | Confirmar reversão revisada | `POST /historico/{id}/reverter` | revalidar revisão e permissão da ação original; verificar dependências/retenção; aplicar inversão interna em transação; registrar compensação externa se aplicável; retornar resultado sem falsa confirmação |
| Catálogo de classificações, serviços ou categorias | Abrir catálogo escolhido com ações e itens | `GET /administracao/catalogos/{catalogo}` | DTO pronto ou ação explícita da tela. |
| Catálogo ou modal dentro de formulário | Cadastrar opção e já selecioná-la no editor | `POST /administracao/catalogos/{catalogo}` | DTO pronto ou ação explícita da tela. |
| Catálogo de classificações, serviços ou categorias | Editar ou inativar item do catálogo | `PATCH /administracao/catalogos/{catalogo}/{id}` | DTO pronto ou ação explícita da tela. |
| Equipe, usuários e perfis | Montar administração de acessos | `GET /administracao/acessos` | DTO pronto ou ação explícita da tela. |
| Formulário de usuário | Cadastrar usuário com perfis e equipes | `POST /administracao/usuarios` | DTO pronto ou ação explícita da tela. |
| Formulário de usuário | Salvar usuário, perfis, equipes ou desativação | `PATCH /administracao/usuarios/{id}` | DTO pronto ou ação explícita da tela. |
| Recuperação de acesso pela equipe | Definir senha temporária por administrador | `POST /administracao/usuarios/{id}/senha` | DTO pronto ou ação explícita da tela. |
| Equipe, usuários e perfis | Cadastrar perfil de acesso | `POST /administracao/perfis` | DTO pronto ou ação explícita da tela. |
| Equipe, usuários e perfis | Salvar ou inativar perfil de acesso | `PATCH /administracao/perfis/{id}` | DTO pronto ou ação explícita da tela. |
| Equipe, usuários e perfis | Cadastrar equipe | `POST /administracao/equipes` | DTO pronto ou ação explícita da tela. |
| Equipe, usuários e perfis | Salvar ou inativar equipe | `PATCH /administracao/equipes/{id}` | DTO pronto ou ação explícita da tela. |
| Configurações do gabinete | Carregar formulário de configurações autorizado | `GET /administracao/configuracoes` | DTO pronto ou ação explícita da tela. |
| Configurações do gabinete | Salvar blocos alterados em uma ação | `PATCH /administracao/configuracoes` | DTO pronto ou ação explícita da tela. |
| Mensagens vinculadas ao pedido | Carregar mais mensagens do protocolo | `GET /atendimentos/{id}/mensagens` | DTO pronto ou ação explícita da tela. |

## Fora do catálogo de telas

Webhook de conector e saúde da infraestrutura têm [contrato separado](integracoes.md). Importação, exportação, portal, relatórios personalizados, filtros salvos e expansão MCP continuam no planejamento, sem rotas antecipadas.

O frontend ainda não existe. A cobertura parte das telas planejadas; latência, SQL, autorização e atomicidade precisam ser verificadas na implementação.
