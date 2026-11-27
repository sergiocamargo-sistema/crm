# Backend do Gabinete CRM

Implementação iniciada em 25/11/2026 na branch `homologacao`, autorizada para todos os módulos ativos existentes. Firestore é o primeiro provedor de persistência; o navegador usa uma API por ações de negócio. A `main` e sua publicação no GitHub Pages permanecem na versão anterior.

## Estado atual

Código preparado para cadastro/ficha/busca/listagem de munícipes, categorias e indicação, interações e detalhes de conversas/agendamentos já existentes, solicitações, departamentos, padrões, ciências, comentários, anexos, tarefas/Kanban, etiquetas de tarefas, histórico/horas, automações, notificações internas e impressão de etiquetas. Os botões de módulos que ainda não tinham implementação não passam a existir por este trabalho. A antiga caixa de entrada continua arquivada: não há integração WhatsApp/156/e-mail, envio ao munícipe ou novos módulos legislativos.

Atualização de 26/11/2026: faturamento Blaze confirmado ativo. API `crmApi`, função programada `crmMaintenance`, regras/índices e bucket privado foram preparados/publicados no projeto existente, em São Paulo. A URL da API é `https://southamerica-east1-sergio-6ceff.cloudfunctions.net/crmApi`. O site e a `main` permanecem preservados. Em 27/11/2026 foram ativados backups nativos diários/semanais e PITR. Cópia externa continua sem agendamento.

Na etapa de 26/11/2026, a compilação do backend e **15 testes locais** passaram, incluindo autorização, contrato HTTP fechado, CORS, persistência/rollback, concorrência, idempotência, estrelas, solicitações/tarefas, automações com dependências, fotos e sincronização incremental. Os testes usam adaptadores em memória, sem dados reais ou acesso à nuvem. A API publicada respondeu HTTP 401 sem login e 204 ao preflight permitido; isso não equivale a validar login real e CRUD autenticado em produção. Não foram executados build/testes do frontend ou navegador naquela etapa. Na tarefa de segurança de 27/11/2026, o usuário autorizou compilação e testes locais do frontend/backend; resultados e limites abaixo.

O frontend seleciona repositórios HTTP, sem fallback para dados fictícios. O banco permanece sem importação de munícipes reais. A integração ainda precisa de validação do fluxo autenticado e do frontend antes de substituir a versão da `main`.

## Proteções e operação — 27/11/2026

Ver [SECURITY.md](SECURITY.md) para permissões por operação, App Check, limites e custos, auditoria/TTL, cache cifrado, anexos, backups e resposta a incidentes. Não remover esses controles para contornar um erro de integração. A autenticação Google real com reCAPTCHA ainda requer validação pelo usuário antes de migrar a main.

- Backups: diário sete dias + semanal/domingo quatro semanas, PITR ativo. A janela histórica passa a existir progressivamente; o agendamento não comprova primeira cópia concluída.
- App Check/reCAPTCHA Enterprise cadastrado para o app existente e seus domínios, score 0,5 e token de uma hora. A entrada de produção exige comprovação da aplicação antes de verificar identidade/vínculo.
- Alertas de orçamento configurados para este projeto, em BRL, referência mensal inicial de R$ 50, avisos em 50%, 80% e 100%. Referência escolhida e comunicada durante o trabalho enquanto a preferência opcional estava pendente. Não é limite de cobrança. Destinatários padrão da conta de faturamento; nenhum serviço é interrompido pelo alerta.
- Permissões substituem a antiga equivalência total de administrador e membro; não foram criados usuários ou ampliados acessos na nuvem. Sessão máxima de oito horas. Por decisão explícita do usuário em 27/11/2026, manter somente o login Google; a verificação em duas etapas fica para depois e não é requisito desta entrega. Retomar somente mediante novo pedido. Configurações já existentes nas contas Google seguem sob controle dos titulares.
- Banco e código continuam sem importação de munícipes reais. Análise antimalware, WAF e cópia externa agendada não estão implementados.

Validação em 27/11/2026: compilação estrita/bundle do backend e build de produção do frontend concluídos; **27 testes locais do backend e quatro do frontend passaram**. O frontend mantém o aviso já existente de dependência CommonJS `pako` usada pelo `pdf-lib`; sem erro de build. Não houve teste de navegador nem login Google real.

API e manutenção foram publicadas no projeto existente, com a identidade IAM documentada abaixo. O estado final foi conferido como `ACTIVE`. Regras e índices/TTL foram publicados. As duas políticas TTL foram confirmadas `ACTIVE`; a manutenção diária também limpa vencidos. A remoção por TTL é eventual; não foi observado um ciclo de expiração com dados reais.

Seis verificações HTTP passaram sem dados de negócio: 401 sem login; 403 sem App Check; 403 com App Check inválido; 401 com App Check real de teste e sessão inválida (confirma que a atestação foi aceita); 403 no endereço direto Cloud Run sem App Check; preflight 204 permitindo o header. Tokens de debug foram temporários e removidos; a listagem final confirmou zero. Isso não valida a pontuação reCAPTCHA real de uma sessão do usuário.

Ensaio PITR: clone isolado `crm-restore-check-1795773670694`, instante `2026-11-27T09:59:00Z`, comparação concluída em `2026-11-27T10:11:34Z` (UTC). Todas as coleções existentes no instante foram comparadas por ID/conteúdo; havia somente um documento de autorização em `teamAccess`, que correspondeu. Nenhum munícipe/anexo foi importado ou exportado para o disco. O ensaio valida clonagem e leitura dessa base inicial, não recuperação de uma base populada, anexos, Authentication ou uma cópia diária ainda não executada. A exclusão da cópia temporária foi concluída e confirmada pela operação gerenciada. O banco original continua com proteção contra exclusão e não foi sobrescrito.

A auditoria `npm audit --omit=dev` terminou sem avisos conhecidos nas dependências de produção do frontend/backend. Foi aplicado override de `@grpc/grpc-js` para 1.14.7 no frontend, eliminando o aviso transitivo do Firebase sem fazer downgrade do SDK. Explicação e fonte em SECURITY.md.

Na conferência inicial, zero backups agendados já haviam concluído. Manter a verificação da primeira execução como pendência operacional; as duas agendas e PITR estão ativos.

## Fluxo e desacoplamento

```text
Componente → Service → contrato do repositório → ApiClient → API
                                     Service → Store → Componente
API → Dispatcher → motor de domínio → WorkspaceRepository → DocumentDatabase
                                                            ↓
                                                       FirestoreDatabase
```

- `../src/app/domain/`: regras sem Angular, SDK do Firebase ou fixtures. Cadastro, duplicidade, filtros, Kanban, histórico, horas, automações e etiquetas reutilizam as regras extraídas das implementações anteriores.
- `../src/app/domain/contracts/backend-api.ts`: contrato tipado por ações/consultas; `ApiInvocation` é uma união fechada.
- `../src/app/core/backend/providers.ts`: composição dos repositórios do frontend; nenhum componente ou service conhece o Firestore.
- `src/ports/document-database.ts`: operações JSON, filtros neutros e transações. Sem snapshots, FieldValue ou Timestamp do SDK.
- **`src/config/persistence.ts`: único arquivo de seleção do banco.** `FirestoreDatabase` é o adaptador atual; `MemoryDatabase` exemplifica outra implementação do mesmo contrato.
- `IdentityProvider` e `FileStorage` são contratos independentes. Trocar o banco não exige trocar login Google nem armazenamento de arquivos.

Trocar para PostgreSQL exige implementar seu adaptador, migrar os dados e então mudar a seleção nesse arquivo. O adaptador deve cumprir isolamento transacional, filtros e leitura das próprias escritas. Uma tabela de documentos com chave `(collection,id)` e corpo JSONB pode preservar o formato inicialmente; um modelo relacional exige migração explícita. Alterar uma linha de configuração não converte os dados nem cria o novo adaptador.

Os contratos antigos de `docs/api` draft.3 no repositório são planejamento histórico, não uma lista de endpoints já publicados. A implementação atual é o contrato de ações acima. O build agora executa o TypeScript estrito antes de empacotar; não basta o esbuild aceitar o código.

## API e acesso

Funções publicadas: `crmApi` e `crmMaintenance`, região `southamerica-east1`, Node 22. API com mínimo zero e máximo duas instâncias, até quatro chamadas simultâneas por instância. Não há configuração de Hosting.

- `GET /v1/session`: valida token Google e vínculo ativo, devolve perfil da equipe/autorização.
- `POST /v1/actions`: `{operation,args,requestId}`. Operações são geradas dos contratos, sem execução de métodos arbitrários. JSON Schema valida argumentos e campos; domínio valida regras de negócio. Resposta `{result,revision}`; erros usam `application/problem+json`.
- `POST /v1/files`: binário, `X-File-Name` codificado por `encodeURIComponent`, MIME aceito e até 20 MB. Devolve referência durável.

Toda chamada recebe Bearer token e verifica revogação, login Google verificado, `teamAccess/{uid}.active`, e-mail correspondente e papel `admin`/`member`. O papel não é escolhido no frontend. A equipe efetiva vem desses documentos; preencher `name` e, opcionalmente, `handle` ao provisionar membros. O fallback usa o e-mail protegido e UID, mantendo nomes/menções consistentes entre usuários. O primeiro administrador provisionado na etapa anterior é `comunicacaosergiocamargo@gmail.com`, UID `SoxIKikGouVIFQzsRDLUSirudpp2`. Não adicionar automaticamente quem faz login.

Os membros ativos têm permissões por operação conforme SECURITY.md; o perfil comum não administra catálogos/automações/modelos nem prepara impressão sem permissão específica. A leitura continua compartilhada entre os módulos autorizados; não há separação por campo/departamento. Notificações são consultadas e marcadas apenas para o usuário autenticado. Os dados completos de `teamAccess` não são enviados ao frontend.

Firestore e Storage negam acesso direto do navegador. O backend usa IAM. CORS inclui a origem atual do GitHub Pages e localhost; CORS não substitui autorização. O limite por usuário em memória é uma proteção básica por instância, não um limite global de cobrança.

## Persistência e concorrência

- `crmRecords`: entidades separadas por grupo e chave; comentários, anexos, tarefas, contatos e eventos não crescem em um único documento do pai. Catálogos vazios têm marcador explícito; coleções vazias de uma solicitação ficam na própria metadata, evitando cinco documentos extras por solicitação. A reconstrução clona os dados e não modifica os documentos usados na comparação de alterações. Configurações canônicas iniciais incluem Gabinete, tipos de documento/gênero e modelo de etiquetas; não incluem pessoas, tarefas ou automações fictícias.
- `crmMeta/head`: época e revisão global. Cada gravação verifica a revisão e autorização, grava somente documentos alterados, journal, arquivos vinculados, notificações e recibo em uma transação. Conflito refaz a operação sobre a versão atual.
- `crmJournal`: IDs dos documentos/munícipes alterados, com vencimento em 30 dias.
- `crmReceipts`: resultado por usuário/requestId e impressão digital dos argumentos. Repetição com outros dados é rejeitada. Ações podem ser repetidas pela rede com a mesma chave.
- `crmNotifications`, `crmFiles`: notificações por destinatário e metadados de arquivos.

A instância mantém um snapshot em memória. Em aquecimento lê a revisão; quando ela muda, aplica documentos indicados no journal. Uma instância fria, cursor antigo ou lacuna de journal exige carregar os registros persistidos. Portanto há custo de leitura na partida: não afirmar que cada ação lê só um documento em todos os casos. O motor ainda projeta consultas em memória; o caminho para volume muito maior é implementar consultas por agregado/índices no repositório, mantendo os contratos.

O limite é de 400 alterações, notificações e vínculos de arquivos por ação, com reserva para metadados. Registro individual limita conteúdo a aproximadamente 700 KB. Esse limite falha explicitamente, sem salvar parcialmente. Grandes operações devem ser divididas em casos de uso apropriados. O máximo de instâncias e os limites não são um teto financeiro: CPU, chamadas, leituras, arquivos e rede continuam medidos.

## Busca e impressão

O cache de busca usa IndexedDB e memória por UID. Após confirmar o acesso, recebe projeção de identificação/contatos e texto normalizado pesquisável; não recebe fotos, históricos ou ficha inteira. A versão 2 pesquisa somente nome/bairro/telefones; não contém observações, categorias, e-mails ou CRA no índice. Ainda é dado pessoal, não um catálogo público. Registros/metadados no IndexedDB são cifrados com AES-256-GCM e chave no sessionStorage da aba, separada do banco. Isso não protege uma sessão aberta de XSS ou controle do dispositivo. O índice antigo é descartado.

Primeira carga em páginas de 200; próximas cargas usam época/revisão e IDs alterados, inclusive remoções. A paginação fica vinculada à versão: mudanças durante uma carga reiniciam a sincronização. As páginas são aplicadas juntas; metadados e alterações persistem na mesma transação local. Logout/troca de usuário limpa o cache anterior. A limpeza é de melhor esforço se o navegador bloquear IndexedDB, mas o cache continua separado por UID e só é usado após autorização.

Limites iniciais: 20 mil registros, aproximadamente 12 MiB e validade máxima de oito horas. Sincroniza a cada minuto visível e após gravações locais. Um verificador de revisão da API atualiza também os módulos abertos quando outro usuário grava, sem baixar o banco inteiro para verificar mudanças. Acima do limite usa busca remota limitada a 100 candidatos; a interface continua mostrando seus seis primeiros resultados. Falha de armazenamento local mantém o índice em memória. Não há fila de gravações offline nem confirmação de sucesso sem resposta do servidor.

A listagem e seus filtros continuam no backend. Impressão busca apenas os campos de etiquetas em lotes de 200; não baixa uma ficha por pessoa. Observações não são truncadas. A geração do PDF permanece no navegador. Lotes limitam transferência e resposta, não tornam uma impressão de milhares de pessoas isenta de consumo.

## Avaliação do gabinete — 25/11/2026

A avaliação agora representa a nota efetivamente informada pelo munícipe sobre o gabinete. `cabinetRating` aceita exclusivamente 1, 2, 3, 4, 5 ou `null` (Sem avaliação). Cadastro e ficha usam o mesmo `CabinetRatingComponent`, com cinco estrelas/rádios nativos, limpeza, teclado e toque; a ficha mantém salvamento explícito. A Árvore reutiliza o componente em modo somente leitura e a listagem filtra por múltiplas notas, inclusive ausência.

`CabinetRating`, `isCabinetRating` e os níveis ficam em `src/app/core/models/cabinet-rating.ts`. O contrato usa `saveCabinetRating`; o filtro é `cabinetRatings`. Frontend e API compartilham a validação. Não é previsão, probabilidade ou classificação de preferência política.

O antigo `voteEstimate` não é lido como avaliação nem convertido para estrelas. Cadastros legados sem o novo campo aparecem Sem avaliação, e o campo anterior é excluído da resposta da ficha. Nenhuma migração/exclusão foi executada em banco ou backup real; dados legados eventualmente existentes exigem uma decisão administrativa própria sobre retenção/eliminação. Os formatos de backup continuam versionados e preservam o conteúdo original, sem reinterpretá-lo. O schema da API é regenerado para aceitar o novo domínio e retirar a operação anterior.

## Arquivos

Adaptador de produção: Cloud Storage, bucket `sergio-6ceff.firebasestorage.app`, criado em `southamerica-east1` com acesso uniforme, prevenção de acesso público e soft delete de sete dias. O backend valida extensão, tipo aceito, tamanho, propriedade do upload pendente e existência; autoria, tamanho e MIME gravados vêm do servidor. Agora também confere assinatura dos formatos, recusa conteúdo disfarçado e fixa MIME canônico. Não inclui antivírus nem garante que um documento de formato válido seja seguro.

Persistência usa `crm-file://UUID`, nunca `blob:` ou URL assinada. Respostas recebem URL de leitura com dez minutos de validade (áudios preservam uma hora para reprodução por trechos) e referência durável para futuras edições. Reconsultar o registro renova a URL. URLs não são públicas permanentes; quem possuir uma URL assinada pode lê-la até vencer. A assinatura exige que a identidade de execução possa assinar blobs, além de ler os objetos.

A revisão de duplicidade mantém fotos ainda não usadas como pendentes. Somente referências efetivamente presentes nos registros salvos marcam o arquivo como vinculado; texto livre não é convertido em URL nem vincula arquivos. Uploads sem vínculo são limpos depois de sete dias pelo job diário; objetos vinculados não entram nessa limpeza. Um marcador impede disputar exclusão com uma gravação. Áudios mantêm os players compartilhados, sem transcodificação. Google Drive não é o adaptador de arquivos ativos implementado nesta etapa.

## Instalação e publicação

Dependências do backend têm lockfile próprio. Usar Node 22 e `npm ci` neste diretório. `npm run generate:contract` regenera tipos concretos e JSON Schema; `npm run build` gera os bundles da função e do CLI de backup. São rotinas distintas: gerar contrato não substitui compilar ou testar.

As APIs de Functions, Cloud Build, Artifact Registry, Cloud Run, Eventarc, Pub/Sub, Scheduler, Storage e IAM Credentials foram habilitadas. A identidade de execução é `crm-backend@sergio-6ceff.iam.gserviceaccount.com`, com `roles/datastore.user` e `roles/firebaseauth.viewer` no projeto, `roles/storage.objectAdmin` somente no bucket e `roles/iam.serviceAccountTokenCreator` sobre si mesma para assinar URLs. A API HTTP permite invocação pública na infraestrutura e exige token Firebase/vínculo ativo na aplicação; o job programado não compartilha essa abertura. O repositório de imagens de deploy tem limpeza automática após sete dias. Alertas de cobrança foram configurados separadamente em 27/11/2026; App Check, auditoria, cotas e TTL estão descritos em SECURITY.md. Não escolher conta global de outro projeto nem baixar chave de serviço para o repositório.

O deploy, quando autorizado e validado, parte de `frontend/`:

```sh
firebase deploy --only functions:crm,firestore,storage --project sergio-6ceff --account comunicacaosergiocamargo@gmail.com
```

O predeploy executa o build do backend; não publica GitHub Pages. Confirmar a URL retornada e ajustar `../src/app/core/config/backend.config.ts` se necessário. Aplicar as regras que bloqueiam acesso direto somente junto da migração para a API; o login antigo publicado em outra branch ainda usa leitura da própria autorização. A `main` permanece no mock e não foi migrada por esta branch.

## Desenvolvimento sem nuvem

A entrada HTTP comum está em `src/http/api.ts`, com dependências por contrato. `src/index.ts` apenas liga essa aplicação ao Firebase. `src/local.ts` liga a mesma aplicação a banco/arquivos em memória e a uma identidade de desenvolvimento isolada:

```sh
cd backend
npm ci
npm run dev:local
```

A API local escuta somente em `127.0.0.1:4400` e mostra no terminal um token temporário, renovado a cada execução. Usá-lo como Bearer em chamadas HTTP a `/v1/session`, `/v1/actions` e `/v1/files`. `CRM_LOCAL_PORT` permite outra porta. Esse modo não usa login Google real nem se conecta ao Firebase; é desenvolvimento da API, não um modo de produção do frontend. Banco, uploads e usuário local somem ao encerrar. A entrada local é bloqueada em ambiente de produção/Functions e é excluída do pacote enviado ao Firebase.

```sh
npm run build
npm test
```

`npm test` compila os arquivos de teste e executa casos com `node:test`; `.tests/` é artefato local ignorado. Não instalar outro runner nem publicar fixtures no projeto. Nesta sessão, o usuário autorizou continuar após a pergunta sobre compilação/testes do backend e informou o upgrade para Blaze; isso não autoriza novas execuções automáticas em tarefas futuras nem testes de navegador/frontend.

## Backups, cópia física e migração

Política ativa desde 27/11/2026: backup nativo diário com retenção de sete dias e semanal/domingo com quatro semanas. O Google escolhe o horário exato. As cópias ficam no serviço gerenciado, na mesma região e projeto, separadas do banco ativo; restauram para um novo banco. São cobradas à parte e não são ativadas só por assinar Blaze. **Os dois agendamentos foram criados e conferidos; a primeira execução deve ser confirmada separadamente.**

Configuração administrativa após Blaze, a partir da CLI autenticada:

```sh
firebase firestore:backups:schedules:create --database '(default)' --recurrence DAILY --retention 7d --project sergio-6ceff --account comunicacaosergiocamargo@gmail.com
firebase firestore:backups:schedules:create --database '(default)' --recurrence WEEKLY --day-of-week SUNDAY --retention 4w --project sergio-6ceff --account comunicacaosergiocamargo@gmail.com
```

Conferir agendamentos existentes antes de criar, sem duplicar. PITR de sete dias também foi habilitado em 27/11/2026; a janela passa a se formar a partir da ativação. A proteção contra exclusão do banco já existia da etapa anterior. Soft delete do Storage foi configurado para sete dias; backup do banco não inclui bytes dos anexos, usuários do Firebase Authentication, IAM, TTLs ou todas as configurações externas.

O CLI administrativo `src/backup-cli.ts` produz uma cópia independente em diretório local, usando ADC/credencial administrativa fora do projeto. Exige `GOOGLE_CLOUD_PROJECT`, `CRM_STORAGE_BUCKET` e `CRM_BACKUP_KEY` (32 bytes aleatórios em hexadecimal, fornecidos pelo gerenciador de segredos, nunca no Git ou em argumento de processo):

```sh
npm run backup -- export /caminho/privado/backup-AAAA-MM-DD
npm run backup -- decrypt /caminho/backup/database.json.gz.enc /caminho/privado/database.json
```

Cada arquivo é comprimido e criptografado com AES-256-GCM, nonce próprio e chave separada do pacote. O manifesto lista hashes dos arquivos criptografados. O banco inclui versão do formato, data e checksum; anexos vinculados são copiados separadamente. O export confere a revisão antes/depois; em uso intenso deve rodar em janela sem gravações. Falha não gera manifesto de conclusão. Não substituir a última cópia boa por diretório incompleto. Guardar em disco protegido/HD externo e manter a chave em outro local. Perder a chave inviabiliza recuperar a cópia.

O formato inclui dados do domínio, metadados de arquivos, equipe, notificações e, nos novos pacotes, auditoria de segurança; recibos temporários/journal são reconstruíveis. Não inclui credenciais ou exportação do Firebase Authentication. Identidades precisam ser preservadas/revinculadas ao migrar de projeto/provedor. Uma cópia local só permanece atualizada se a rotina de exportação for executada regularmente.

Pode-se enviar esse pacote criptografado ao Drive de outra conta, via OAuth e API do Drive. **Envio e agendamento no Drive não foram implementados/configurados**, porque ainda faltam conta de destino, consentimento e política de retenção externa. Não usar links públicos. Guardar a chave de criptografia fora desse Drive. Outra conta no mesmo provedor reduz dependência do projeto, mas ainda compartilha o provedor Google; cópia física pode complementá-la.

Restauração: preservar o banco atual, criar um banco vazio isolado, recuperar backup nativo ou descriptografar o pacote independente, verificar versão/integridade e anexos, importar os documentos/dados pelo adaptador do destino, restabelecer acessos e só então mudar a configuração da API. O CLI desta etapa exporta/descriptografa; **não oferece comando de restauração automática** nem migração SQL pronta. Validar uma restauração em ambiente isolado antes do uso em produção, mediante autorização do usuário.

Referências oficiais consultadas em 25/11/2026: [backups](https://firebase.google.com/docs/firestore/backups), [PITR](https://firebase.google.com/docs/firestore/pitr), [cobrança](https://firebase.google.com/docs/firestore/pricing), [soft delete](https://docs.cloud.google.com/storage/docs/soft-delete), [upload no Drive](https://developers.google.com/workspace/drive/api/guides/manage-uploads).
