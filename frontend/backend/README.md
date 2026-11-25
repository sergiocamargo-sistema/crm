# Backend do Gabinete CRM

Implementação iniciada em 25/11/2026 na branch `homologacao`, autorizada para todos os módulos ativos existentes. Firestore é o primeiro provedor de persistência; o navegador usa uma API por ações de negócio. A `main` e sua publicação no GitHub Pages permanecem na versão anterior.

## Estado de entrega

Código preparado para cadastro/ficha/busca/listagem de munícipes, categorias e indicação, interações e detalhes de conversas/agendamentos já existentes, solicitações, departamentos, padrões, ciências, comentários, anexos, tarefas/Kanban, etiquetas de tarefas, histórico/horas, automações, notificações internas e impressão de etiquetas. Os botões de módulos que ainda não tinham implementação não passam a existir por este trabalho. A antiga caixa de entrada continua arquivada: não há integração WhatsApp/156/e-mail, envio ao munícipe ou novos módulos legislativos.

Na última consulta operacional desta implementação, o projeto `sergio-6ceff` estava sem faturamento (`billingEnabled:false`). Auth Google, conta inicial e Firestore foram configurados na etapa anterior. A API, Storage, limpeza programada, backups nativos e cópia externa ainda precisam ser publicados/configurados. Não houve build manual, testes ou navegador nesta tarefa, conforme a preferência explícita do usuário. Não chamar este estado de produção validada.

O aplicativo agora seleciona os repositórios HTTP, sem fallback para dados fictícios. Até a publicação da API, esta branch precisa do backend para entrar e carregar os módulos. Não publicar a branch na `main` antes da integração real e da validação.

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

Os contratos antigos de `docs/api` draft.3 no repositório são planejamento histórico, não uma lista de endpoints já publicados. A implementação atual é o contrato de ações acima.

## API e acesso

Funções previstas: `crmApi` e `crmMaintenance`, região `southamerica-east1`, Node 22. API com mínimo zero e máximo duas instâncias. Não há configuração de Hosting.

- `GET /v1/session`: valida token Google e vínculo ativo, devolve perfil da equipe/autorização.
- `POST /v1/actions`: `{operation,args,requestId}`. Operações são geradas dos contratos, sem execução de métodos arbitrários. JSON Schema valida argumentos e campos; domínio valida regras de negócio. Resposta `{result,revision}`; erros usam `application/problem+json`.
- `POST /v1/files`: binário, `X-File-Name` codificado por `encodeURIComponent`, MIME aceito e até 20 MB. Devolve referência durável.

Toda chamada recebe Bearer token e verifica revogação, login Google verificado, `teamAccess/{uid}.active`, e-mail correspondente e papel `admin`/`member`. O papel não é escolhido no frontend. A equipe efetiva vem desses documentos; preencher `name` e, opcionalmente, `handle` ao provisionar membros. O fallback usa o e-mail protegido e UID, mantendo nomes/menções consistentes entre usuários. O primeiro administrador provisionado na etapa anterior é `comunicacaosergiocamargo@gmail.com`, UID `SoxIKikGouVIFQzsRDLUSirudpp2`. Não adicionar automaticamente quem faz login.

Os membros ativos compartilham o acesso aos módulos de negócio existentes. Não há RBAC granular por campo/departamento implementado. Notificações são consultadas e marcadas apenas para o usuário autenticado. Os dados completos de `teamAccess` não são enviados ao frontend.

Firestore e Storage negam acesso direto do navegador. O backend usa IAM. CORS inclui a origem atual do GitHub Pages e localhost; CORS não substitui autorização. O limite por usuário em memória é uma proteção básica por instância, não um limite global de cobrança.

## Persistência e concorrência

- `crmRecords`: entidades separadas por grupo e chave; comentários, anexos, tarefas, contatos e eventos não crescem em um único documento do pai. Arrays vazios têm marcador explícito. Configurações canônicas iniciais incluem Gabinete, tipos de documento/gênero e modelo de etiquetas; não incluem pessoas, tarefas ou automações fictícias.
- `crmMeta/head`: época e revisão global. Cada gravação verifica a revisão e autorização, grava somente documentos alterados, journal, arquivos vinculados, notificações e recibo em uma transação. Conflito refaz a operação sobre a versão atual.
- `crmJournal`: IDs dos documentos/munícipes alterados, com vencimento em 30 dias.
- `crmReceipts`: resultado por usuário/requestId e impressão digital dos argumentos. Repetição com outros dados é rejeitada. Ações podem ser repetidas pela rede com a mesma chave.
- `crmNotifications`, `crmFiles`: notificações por destinatário e metadados de arquivos.

A instância mantém um snapshot em memória. Em aquecimento lê a revisão; quando ela muda, aplica documentos indicados no journal. Uma instância fria, cursor antigo ou lacuna de journal exige carregar os registros persistidos. Portanto há custo de leitura na partida: não afirmar que cada ação lê só um documento em todos os casos. O motor ainda projeta consultas em memória; o caminho para volume muito maior é implementar consultas por agregado/índices no repositório, mantendo os contratos.

O limite é de 400 alterações, notificações e vínculos de arquivos por ação, com reserva para metadados. Registro individual limita conteúdo a aproximadamente 700 KB. Esse limite falha explicitamente, sem salvar parcialmente. Grandes operações devem ser divididas em casos de uso apropriados. O máximo de instâncias e os limites não são um teto financeiro: CPU, chamadas, leituras, arquivos e rede continuam medidos.

## Busca e impressão

O cache de busca usa IndexedDB e memória por UID. Após confirmar o acesso, recebe projeção de identificação/contatos e texto normalizado pesquisável; não recebe fotos, históricos ou ficha inteira. Esse texto pode conter observações/categorias pesquisáveis, portanto é dado pessoal e não um catálogo público.

Primeira carga em páginas de 200; próximas cargas usam época/revisão e IDs alterados, inclusive remoções. A paginação fica vinculada à versão: mudanças durante uma carga reiniciam a sincronização. As páginas são aplicadas juntas; metadados e alterações persistem na mesma transação local. Logout/troca de usuário limpa o cache anterior. A limpeza é de melhor esforço se o navegador bloquear IndexedDB, mas o cache continua separado por UID e só é usado após autorização.

Limites iniciais: 20 mil registros, aproximadamente 12 MiB e validade máxima de 7 dias. Sincroniza a cada minuto visível e após gravações locais. Um verificador de revisão da API atualiza também os módulos abertos quando outro usuário grava, sem baixar o banco inteiro para verificar mudanças. Acima do limite usa busca remota limitada a 100 candidatos; a interface continua mostrando seus seis primeiros resultados. Falha de armazenamento local mantém o índice em memória. Não há fila de gravações offline nem confirmação de sucesso sem resposta do servidor.

A listagem e seus filtros continuam no backend. Impressão busca apenas os campos de etiquetas em lotes de 200; não baixa uma ficha por pessoa. Observações não são truncadas. A geração do PDF permanece no navegador. Lotes limitam transferência e resposta, não tornam uma impressão de milhares de pessoas isenta de consumo.

## Avaliação do gabinete — 25/11/2026

A avaliação agora representa a nota efetivamente informada pelo munícipe sobre o gabinete. `cabinetRating` aceita exclusivamente 1, 2, 3, 4, 5 ou `null` (Sem avaliação). Cadastro e ficha usam o mesmo `CabinetRatingComponent`, com cinco estrelas/rádios nativos, limpeza, teclado e toque; a ficha mantém salvamento explícito. A Árvore reutiliza o componente em modo somente leitura e a listagem filtra por múltiplas notas, inclusive ausência.

`CabinetRating`, `isCabinetRating` e os níveis ficam em `src/app/core/models/cabinet-rating.ts`. O contrato usa `saveCabinetRating`; o filtro é `cabinetRatings`. Frontend e API compartilham a validação. Não é previsão, probabilidade ou classificação de preferência política.

O antigo `voteEstimate` não é lido como avaliação nem convertido para estrelas. Cadastros legados sem o novo campo aparecem Sem avaliação, e o campo anterior é excluído da resposta da ficha. Nenhuma migração/exclusão foi executada em banco ou backup real; dados legados eventualmente existentes exigem uma decisão administrativa própria sobre retenção/eliminação. Os formatos de backup continuam versionados e preservam o conteúdo original, sem reinterpretá-lo. O schema da API é regenerado para aceitar o novo domínio e retirar a operação anterior.

## Arquivos

Primeiro adaptador: Cloud Storage, bucket esperado `sergio-6ceff.firebasestorage.app`. Criar/configurar o bucket no Blaze antes de usar anexos. O backend valida extensão, tipo aceito, tamanho, propriedade do upload pendente e existência; autoria, tamanho e MIME gravados vêm do servidor. Esta validação não inclui antivírus.

Persistência usa `crm-file://UUID`, nunca `blob:` ou URL assinada. Respostas recebem URL de leitura com uma hora de validade e referência durável para futuras edições. Reconsultar o registro renova a URL. URLs não são públicas permanentes; quem possuir uma URL assinada pode lê-la até vencer. A assinatura exige que a identidade de execução possa assinar blobs, além de ler os objetos.

Uploads sem vínculo são limpos depois de sete dias pelo job diário; objetos vinculados não entram nessa limpeza. Um marcador impede disputar exclusão com uma gravação. Áudios mantêm os players compartilhados, sem transcodificação. Google Drive não é o adaptador de arquivos ativos implementado nesta etapa.

## Instalação e publicação

Dependências do backend têm lockfile próprio. Usar Node 22 e `npm ci` neste diretório. `npm run generate:contract` regenera tipos concretos e JSON Schema; `npm run build` gera os bundles da função e do CLI de backup. São rotinas distintas: gerar contrato não substitui compilar ou testar.

Depois de ativar Blaze, preparar APIs e IAM necessários ao Functions de segunda geração, Scheduler, Firestore e Storage. Criar o bucket, configurar soft delete e a assinatura de URLs pela identidade de execução. Configurar orçamento/alertas separadamente. Não escolher conta global de outro projeto nem baixar chave de serviço para o repositório.

O deploy, quando autorizado e validado, parte de `frontend/`:

```sh
firebase deploy --only functions:crm,firestore,storage --project sergio-6ceff --account comunicacaosergiocamargo@gmail.com
```

O predeploy executa o build do backend; não publica GitHub Pages. Confirmar a URL retornada e ajustar `../src/app/core/config/backend.config.ts` se necessário. Aplicar as regras que bloqueiam acesso direto somente junto da migração para a API; o login antigo publicado em outra branch ainda usa leitura da própria autorização. A `main` permanece no mock e não foi migrada por esta branch.

## Backups, cópia física e migração

Política proposta: backup nativo diário com retenção de sete dias e semanal com quatro semanas. O Google escolhe o horário exato. As cópias ficam no serviço gerenciado, na mesma região e projeto, separadas do banco ativo; restauram para um novo banco. São cobradas à parte e não são ativadas só por assinar Blaze. **Agendamentos ainda não foram criados.**

Configuração administrativa após Blaze, a partir da CLI autenticada:

```sh
firebase firestore:backups:schedules:create --database '(default)' --recurrence DAILY --retention 7d --project sergio-6ceff --account comunicacaosergiocamargo@gmail.com
firebase firestore:backups:schedules:create --database '(default)' --recurrence WEEKLY --day-of-week SUNDAY --retention 4w --project sergio-6ceff --account comunicacaosergiocamargo@gmail.com
```

Conferir agendamentos existentes antes de criar, sem duplicar. PITR de sete dias é uma opção adicional, ainda não habilitada. A proteção contra exclusão do banco já existia da etapa anterior. Soft delete do Storage precisa ser conferido; backup do banco não inclui bytes dos anexos, usuários do Firebase Authentication, IAM, TTLs ou todas as configurações externas.

O CLI administrativo `src/backup-cli.ts` produz uma cópia independente em diretório local, usando ADC/credencial administrativa fora do projeto. Exige `GOOGLE_CLOUD_PROJECT`, `CRM_STORAGE_BUCKET` e `CRM_BACKUP_KEY` (32 bytes aleatórios em hexadecimal, fornecidos pelo gerenciador de segredos, nunca no Git ou em argumento de processo):

```sh
npm run backup -- export /caminho/privado/backup-AAAA-MM-DD
npm run backup -- decrypt /caminho/backup/database.json.gz.enc /caminho/privado/database.json
```

Cada arquivo é comprimido e criptografado com AES-256-GCM, nonce próprio e chave separada do pacote. O manifesto lista hashes dos arquivos criptografados. O banco inclui versão do formato, data e checksum; anexos vinculados são copiados separadamente. O export confere a revisão antes/depois; em uso intenso deve rodar em janela sem gravações. Falha não gera manifesto de conclusão. Não substituir a última cópia boa por diretório incompleto. Guardar em disco protegido/HD externo e manter a chave em outro local. Perder a chave inviabiliza recuperar a cópia.

O formato inclui dados do domínio, metadados de arquivos, equipe e notificações; recibos temporários/journal são reconstruíveis. Não inclui credenciais ou exportação do Firebase Authentication. Identidades precisam ser preservadas/revinculadas ao migrar de projeto/provedor. Uma cópia local só permanece atualizada se a rotina de exportação for executada regularmente.

Pode-se enviar esse pacote criptografado ao Drive de outra conta, via OAuth e API do Drive. **Envio e agendamento no Drive não foram implementados/configurados**, porque ainda faltam conta de destino, consentimento e política de retenção externa. Não usar links públicos. Guardar a chave de criptografia fora desse Drive. Outra conta no mesmo provedor reduz dependência do projeto, mas ainda compartilha o provedor Google; cópia física pode complementá-la.

Restauração: preservar o banco atual, criar um banco vazio isolado, recuperar backup nativo ou descriptografar o pacote independente, verificar versão/integridade e anexos, importar os documentos/dados pelo adaptador do destino, restabelecer acessos e só então mudar a configuração da API. O CLI desta etapa exporta/descriptografa; **não oferece comando de restauração automática** nem migração SQL pronta. Validar uma restauração em ambiente isolado antes do uso em produção, mediante autorização do usuário.

Referências oficiais consultadas em 25/11/2026: [backups](https://firebase.google.com/docs/firestore/backups), [PITR](https://firebase.google.com/docs/firestore/pitr), [cobrança](https://firebase.google.com/docs/firestore/pricing), [soft delete](https://docs.cloud.google.com/storage/docs/soft-delete), [upload no Drive](https://developers.google.com/workspace/drive/api/guides/manage-uploads).
