# Segurança do CRM

Implementação autorizada em 27/11/2026. Branch `homologacao`; `main`/GitHub Pages preservados. Este documento distingue controles implementados, configurações publicadas e pendências operacionais. Segurança não é garantia de ausência de ataques nem de conformidade automática com a LGPD.

## Entrada, identidade e permissões

`src/http/api.ts` é a entrada comum; somente `src/index.ts` liga os adaptadores de produção. As regras de Firestore e Storage continuam negando acesso direto. A API pública exige token Firebase válido, Google como provedor, e-mail verificado e vínculo ativo em `teamAccess/{uid}`. Verifica revogação do token e revalida vínculo/permissão nas transações de gravação. Sessões exigem novo login após oito horas desde `auth_time`; atualizar o token não reinicia essa janela.

App Check usa o contrato `AppAttestation`, implementado por `FirebaseAttestation`, e verifica também o App ID esperado. A entrada de produção exige App Check **antes** da validação de identidade e da consulta de vínculo. O cliente envia `X-Firebase-AppCheck` no login periódico, nas ações e nos uploads. A identidade local e testes em memória não são ligados à entrada publicada. Não criar exceção por e-mail, Origin, localhost ou header de debug na API de produção.

App Check cadastrado no projeto `sergio-6ceff` com reCAPTCHA Enterprise, chave pública `6LeO3jQuAAAAAPYpKvDV2S-zWF5ErrbMm0RgTpmG`, App ID `1:364283541545:web:1d9b9315cef070a2c48438`, score mínimo 0,5 e token de uma hora. Domínios: `sergiocamargo-sistema.github.io`, `localhost`, `127.0.0.1`. O SDK renova o token. Isso reduz abuso; um token válido não comprova autorização nem elimina automação. Avaliações reCAPTCHA acima da franquia têm cobrança própria. Mudança de domínio exige atualizar o cadastro, não remover a verificação. Debug tokens, se necessários, devem ser temporários, fora do Git, e revogados depois do teste.

Permissões ficam em `src/application/security.ts`, em uma lista fechada de todas as operações públicas, verificada pelo TypeScript:

| Permissão            | Finalidade                                                             |
| -------------------- | ---------------------------------------------------------------------- |
| `records.read`       | Consultas dos módulos, busca remota e catálogos                        |
| `records.write`      | Cadastro/edição, interações, tarefas, vínculos e notificações próprias |
| `catalogs.manage`    | Departamentos, padrões, categorias, colunas e etiquetas de tarefas     |
| `automations.manage` | Configurar/excluir automações e repetir execuções                      |
| `labels.manage`      | Alterar modelos/formatos de impressão                                  |
| `labels.print`       | Preparar dados pessoais para etiquetas                                 |
| `files.upload`       | Enviar anexos/fotos                                                    |
| `search.sync`        | Sincronizar o índice local de munícipes                                |

Perfil `admin`: todas essas permissões. Perfil `member`: `records.read`, `records.write`, `files.upload`, `search.sync`. Uma lista opcional `permissions` no documento de acesso **substitui** o perfil, inclusive para administradores. Exemplo de leitura sem cópia local: `permissions: ['records.read']`; impressão exige adicionar `labels.print`. Valores desconhecidos falham fechados. Vincular uma categoria existente usa escrita normal; criar uma categoria por esse mesmo vínculo exige `catalogs.manage`. Novos usuários nunca recebem acesso automaticamente. Alterar permissões é uma tarefa administrativa fora da API pública; não conceder permissões pelo frontend.

Essa separação protege ações, mas ainda não separa pessoas por departamento nem campos da ficha por função. Leitura autorizada continua abrangendo os registros dos módulos. Não prometer proteção contra extração por uma conta que possui essa leitura. As telas mantêm os controles atuais e apresentam erro se o servidor negar a operação; não há tela nova de administração de acessos.

**Decisão do usuário — 27/11/2026:** manter somente o login Google no CRM, com acesso às contas autorizadas. A verificação em duas etapas, tanto a exigência de confirmação nas contas Google quanto um segundo fator próprio no CRM, fica adiada para uma etapa futura e não bloqueia esta entrega. Não implementar, ativar ou voltar a exigir essa etapa sem novo pedido. Configurações de segurança já existentes nas contas Google continuam sob controle dos titulares; esta decisão não solicita desativá-las. App Check e os demais controles da API permanecem ativos; App Check não adiciona um segundo fator ao login.

## Abuso e custos

Antes de autenticar, há um limitador em memória: 1.200 requisições/minuto por instância e 300 por endereço do par de rede. O endereço vem do socket do adaptador, nunca de um header fornecido pelo cliente; em infraestrutura com proxy esse limite pode agrupar vários usuários. Não é um limitador global por IP nem um WAF.

Após verificar o vínculo, `RequestQuota` faz contagem transacional compartilhada entre instâncias: 240 requisições/minuto por usuário, 20 uploads/minuto e 20 mil destinatários de impressão/minuto. Cada preparação aceita até 200 IDs; a impressão existente já usa lotes desse tamanho. HTTP 429 inclui `Retry-After: 60`. Repetições de rede também contam: a idempotência impede duplicar a alteração, não torna a chamada gratuita. Os limites são janelas fixas de um minuto; podem ocorrer rajadas na virada da janela.

Contadores ficam em `crmRateLimits` por hash de UID/escopo/minuto, sem tokens ou endereços de rede. Expiram após a janela. No adaptador Firestore, somente `expiresAt` de contadores/auditoria vira Timestamp; contratos, consultas e backups continuam usando ISO. Políticas TTL versionadas em `firebase/firestore.indexes.json` eliminam esses documentos, com o job diário como complemento. TTL é eventual, não exclusão instantânea.

A API mantém no máximo duas instâncias e concorrência quatro. Esses controles reduzem abuso e escalada, mas **não impõem teto total de cobrança**. Alertas de orçamento também não interrompem serviços. Um WAF na borda ainda não foi provisionado; Cloud Armor exigiria desenhar e restringir os caminhos de entrada, inclusive para evitar acesso direto ao endereço da função/Cloud Run.

## Auditoria

`crmSecurityAudit` registra tentativa, negativa de permissão, gravação confirmada e consulta devolvida: UID do ator, operação, trace ID, data, revisão, contagem e IDs dos registros quando a operação identifica o alvo. Não registra argumentos completos, texto de busca, nomes, observações, telefone, token ou conteúdo de arquivos. Contagens de respostas compostas são resumidas; não representam uma lista de todos os registros contidos em cada agregado.

Gravações de domínio, uploads e marcação de notificações inserem seu evento confirmado na mesma transação. Se essa escrita falhar, a operação correspondente reverte. Tentativas sem confirmação ajudam a investigar falhas; recibos evitam duplicar gravações numa repetição. Consultas só são devolvidas depois de persistir a auditoria. Respostas bem-sucedidas de ações também emitem `crm_security_event` no Cloud Logging. Sessão periódica não gera uma cópia de todos esses eventos; negar tráfego sem autenticação não cria documentos ilimitados de auditoria.

Retenção operacional de 90 dias, com TTL eventual; backups podem preservar eventos por mais tempo conforme sua própria retenção. A aplicação não oferece leitura ou exclusão dessa coleção. O acesso administrativo é pelo IAM. Isso não é um arquivo imutável: uma credencial administrativa comprometida continua sendo risco. O histórico funcional de tarefas permanece separado. A exportação portátil inclui auditoria; pacotes antigos sem essa coleção continuam válidos.

## Cache e anexos

O índice de busca versão 2 inclui identificação, bairro e contatos necessários às ações já existentes, com texto normalizado somente de nome/bairro/telefones. Não contém observações, categorias, e-mails ou CRA/documentos no texto pesquisável. A busca global deixa de localizar por esses campos; os filtros próprios da listagem continuam no backend. Não chamar esse índice de público ou anônimo.

IndexedDB guarda registros/metadados cifrados com AES-256-GCM, nonce aleatório por gravação e UID autenticado como dado adicional. A chave fica no `sessionStorage` da aba, fora do banco, permitindo recarga na mesma sessão. Logout/troca tenta apagar banco e chave; a versão antiga sem criptografia é descartada e nunca reutilizada. Limites: 20 mil registros, aproximadamente 12 MiB de conteúdo antes da cifra, validade de oito horas, páginas de 200, deltas por época/revisão, busca remota acima do limite. A época `search-v2:` força reconstruir projeções antigas. Armazenamento indisponível mantém apenas memória.

Essa criptografia ajuda contra cópia isolada dos arquivos do IndexedDB. Não protege de XSS, extensões maliciosas ou alguém controlando uma sessão aberta, que pode acessar a chave e a memória. Navegadores podem restaurar sessões/abas. Fechar todas as abas antigas é necessário para liberar exclusão de bancos bloqueados por versões antigas.

Uploads continuam privados, com limite de 20 MB, referência durável e vínculo validado. A verificação agora confere assinaturas dos formatos, recusa conteúdo disfarçado e usa MIME canônico no servidor. Não é validação completa do arquivo nem antivírus; PDF, Office e outros formatos válidos ainda podem carregar conteúdo malicioso. Não afirmar que esses anexos foram analisados por um serviço antimalware.

Novas URLs assinadas de imagens/documentos duram dez minutos; áudios preservam uma hora, como antes, para reprodução e busca por trechos no player nativo. Imagens/áudios preservam exibição/reprodução e documentos usam download. Reabrir/reconsultar o registro renova um link vencido; não há renovação automática do player. URLs já emitidas antes da atualização podem permanecer válidas até o prazo original. Qualquer pessoa com um link assinado pode usá-lo enquanto ele valer, mesmo após revogar o usuário. A assinatura não é persistida no banco. Arquivos novos recebem `private, no-store`. Arquivos antigos mantêm seus metadados anteriores; não houve regravação de objetos existentes.

## Backups e resposta a incidentes

Em 27/11/2026 foram criados e conferidos no Firestore:

- Diário: retenção `604800s` (sete dias), schedule `637868cd-ef03-4bfb-a3d5-5dc5c540cb3a`.
- Semanal, domingo: retenção `2419200s` (quatro semanas), schedule `8f4a8207-796f-4721-9ec0-5914ccc55196`.
- PITR habilitado; a janela de sete dias começa a se formar na ativação.

Backup agendado só existe depois de executar; não afirmar que já há cópia diária criada ao salvar o agendamento. O horário é escolhido pelo Google. Backup nativo não inclui bytes dos anexos, contas Authentication ou IAM. O bucket preserva soft delete de sete dias. Cópia independente criptografada de banco e anexos continua disponível pelo CLI local, sem agendamento no Drive nem destino externo definido. Procedimentos em `README.md`.

Ao suspeitar de incidente: desativar o vínculo afetado, revogar suas sessões na administração Firebase, preservar logs e artefatos, limitar a operação comprometida, identificar dados/usuários atingidos e seguir o procedimento do controlador para avaliar comunicações legais. Não apagar evidências automaticamente. Revogar um usuário não recupera cópias que ele já fez nem links assinados ainda válidos.

Antes de recuperar: identificar o instante/cópia, restaurar em banco novo isolado, comparar dados/índices, verificar anexos e vínculos de identidade e só depois decidir a troca. Nunca sobrescrever o banco atual como primeiro passo. A cópia temporária de ensaio não deve ficar acessível ao frontend nem permanecer acumulando dados/custos.

## Dependências

`npm audit --omit=dev` foi consultado em 27/11/2026. Backend sem avisos conhecidos de produção. No frontend, o pacote Firebase 12.7.0 incluía uma dependência transitiva Node do Firestore, `@grpc/grpc-js` 1.9.16, com aviso alto [GHSA-m9gg-hp2v-232j](https://github.com/grpc/grpc-node/security/advisories/GHSA-m9gg-hp2v-232j). O aviso trata de autenticação por certificados em configurações específicas de servidores gRPC; não comprova exploração do nosso login Google no navegador. A aplicação usa Auth/App Check do SDK Web e acessa os dados pela API.

`package.json`/lockfile fixam override compatível da série 1.x para `@grpc/grpc-js` 1.14.7. A nova consulta terminou sem avisos conhecidos de produção em ambos os pacotes. Firebase continua 12.7.0; não aplicar o downgrade sugerido automaticamente pelo audit. Reavaliar o override ao atualizar o SDK, executar compilação/testes com autorização e verificar novamente `npm ls`/audit. O resultado não cobre pacotes de desenvolvimento nem vulnerabilidades desconhecidas.

## Fontes e validação

- [App Check web](https://firebase.google.com/docs/app-check/web/recaptcha-enterprise-provider), [verificação no backend](https://firebase.google.com/docs/app-check/custom-resource-backend).
- [Backups](https://firebase.google.com/docs/firestore/backups), [PITR e clonagem](https://firebase.google.com/docs/firestore/use-pitr).
- [Alertas de orçamento](https://firebase.google.com/docs/projects/billing/budget-alerts), [TTL](https://firebase.google.com/docs/firestore/ttl).
- [Ativar verificação em duas etapas da conta Google](https://support.google.com/accounts/answer/185839).

Resultados finais de compilação/testes, publicação e ensaio estão no estado operacional do `README.md`. Login Google real no navegador e pontuação real de reCAPTCHA ainda precisam ser validados antes de migrar a `main`. Não remover App Check para contornar esse teste. A verificação em duas etapas foi adiada por decisão do usuário, conforme registrado acima. Ainda pendentes: separação por departamento/campo, serviço antimalware, WAF, cópia externa agendada e exercício de recuperação dos anexos/identidade.
