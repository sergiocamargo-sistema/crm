# Backend do Gabinete CRM

Leia `README.md` deste diretório e `../AGENTS.md` antes de alterar os fluxos. A autorização atual, de 25/11/2026, abrange os módulos ativos existentes; as restrições antigas de adiar backend estão superadas nesse escopo.

- Trabalhar na branch `homologacao`. Não alterar/publicar `main`, GitHub Pages ou criar outro site.
- `src/config/persistence.ts` seleciona o banco. Os repositórios dependem de `DocumentDatabase`, nunca de tipos do Firebase. Identidade e arquivos têm portas separadas.
- Regras de negócio compartilhadas vivem em `../src/app/domain/`; não recriar cópias no frontend/backend. Mocks antigos estão arquivados localmente, sem participação na aplicação.
- A entrada HTTP comum é `src/http/api.ts`; `src/index.ts` é o adaptador Firebase e `src/local.ts` é só desenvolvimento em loopback/memória. Nunca ligar a identidade local ao Functions. Testes ficam em `tests/`, sem acessar a nuvem.
- Nova operação: atualizar contrato `BackendApi`/operações de domínio, implementar regra, regenerar contrato com `npm run generate:contract`, registrar consumidor via Service → Repository. Não expor métodos internos do motor.
- API autenticada e autorização por `teamAccess/{uid}` em toda requisição; conferir novamente dentro da transação das gravações. Autoria vem da identidade verificada.
- Não persistir `blob:`, URLs assinadas ou objetos SDK. Arquivos persistem como `crm-file://UUID`; URLs temporárias são produzidas na resposta.
- Avaliação do gabinete: nota informada pelo munícipe, `cabinetRating` = 1–5 ou null, `saveCabinetRating` e filtro `cabinetRatings`. Não inferir voto nem converter o campo legado para estrelas; ver README.
- Preservar atomicidade, recibos de idempotência, histórico, snapshots das automações, cursores e exclusões no cache. Nenhuma persistência apenas otimista com falha silenciosa.
- Não exportar dados reais, executar restore, alterar faturamento, provisionar acessos ou enviar arquivos ao Drive sem autorização específica. Restaurar primeiro em banco vazio e isolado.
- Preferência do usuário: não executar testes, builds manuais ou navegador por iniciativa própria; solicitar quando necessário. Não afirmar validação que não ocorreu.

Atualização de 26/11/2026: Blaze ativo confirmado; API/job, regras/índices e bucket privado publicados no projeto existente. Backend compilado e 15 testes locais passaram nesta sessão com autorização para continuar após a pergunta de validação. Checagens HTTP sem dados reais confirmaram 401 sem login e 204 ao preflight permitido. Não houve login real/CRUD autenticado em produção, build do frontend ou navegador. Naquela etapa, backups/PITR/Drive, RBAC e auditoria ainda estavam pendentes; a atualização de 27/11 abaixo supera esse estado para os controles implementados. Ver README para identidade IAM, execução local e limites reais de validação.

## Segurança — pedido de 27/11/2026

- Ler `SECURITY.md` antes de alterar API, permissões, cache, anexos, auditoria ou backup.
- Produção exige App Check do app correto; não criar bypass por Origin, localhost, e-mail ou token de desenvolvimento. AppAttestation é uma porta separada; banco continua selecionado apenas em persistence.ts.
- Permissões fechadas por operação em security.ts. Novas operações precisam de mapeamento explícito; revalidar permissão e vínculo na transação. Membro não gerencia catálogos/automações/modelos nem imprime sem permissão específica. Criar categoria por addCategory também exige catalogs.manage.
- Auditoria sem argumentos/textos pessoais; gravações incluem evento confirmado atomicamente. Expiração de 90 dias; contadores curtos. Timestamp de TTL fica exclusivamente no adaptador Firestore, mantendo ISO no contrato.
- Índice de busca v2 mínimo e cifrado, chave separada no sessionStorage, validade oito horas; não repor observações/categorias/e-mails/documentos no índice. Preservar deltas, limpeza, limites e busca remota. Criptografia do cache não protege sessão aberta de XSS.
- Anexos conferem assinatura/formato, sem antivírus. URLs novas de imagens/documentos duram dez minutos; áudio preserva uma hora para reprodução por trechos. Documentos usam download. Não afirmar que revogação de usuário invalida links já emitidos.
- Backups diário/semanal e PITR foram ativados por esta autorização; alertas mensais R$ 50 configurados. Não duplicar agendamentos. Drive externo segue sem destino/consentimento configurado. Não sobrescrever o banco atual em ensaio de recuperação.
- O usuário autorizou compilação e testes locais de backend/frontend nesta tarefa; isso não altera a preferência permanente para tarefas futuras. Estado de deploy/ensaios/resultados e pendências no README.

- Dependências de produção auditadas nesta tarefa; override gRPC 1.14.7 no frontend corrige aviso transitivo do Firebase. Não fazer downgrade automático do SDK nem remover o override sem revisar advisory, lockfile e validação.
