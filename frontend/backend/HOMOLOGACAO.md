# Publicação da homologação

Pedido autorizado em 27/11/2026: publicar a branch `homologacao` em endereço próprio, com atualização pelo GitHub. Essa autorização substitui a restrição anterior de não reativar outro site Firebase para este ambiente. Produção permanece na `main` e no workflow existente do GitHub Pages.

## Endereços e dados

- Principal: <https://sergio-6ceff-homologacao.web.app>.
- Alternativo do mesmo site: <https://sergio-6ceff-homologacao.firebaseapp.com>.
- Projeto Firebase: `sergio-6ceff`; site já existente reaproveitado: `sergio-6ceff-homologacao`.
- API: `https://southamerica-east1-sergio-6ceff.cloudfunctions.net/crmApi`.

Esse frontend usa o backend e o banco existentes do projeto, com persistência real. Não é outro banco nem um sandbox descartável. O site antigo da main continua com sua configuração própria. Não importar dados fictícios ou reais automaticamente durante o deploy.

## Publicação automática

Workflow: `.github/workflows/deploy-homologacao.yml`, na raiz do repositório. Cada push para `homologacao` executa instalação pelo lockfile, prepara Firebase CLI 15.31.0, autentica com identidade temporária e publica **somente** `hosting:homologacao`. Não publica Functions, regras, índices ou GitHub Pages. O grupo de concorrência serializa publicações desse ambiente.

O predeploy do Hosting executa `npm run build:homologacao`: exige a branch correta, compila Angular em produção com base `/`, confere o diretório do artefato e gera `deployment.json` com branch, commit e data. Esse arquivo contém somente metadados públicos do build, sem credenciais. A publicação envia apenas `frontend/dist/gabinete-web/browser`, nunca a raiz do repositório ou documentação de trabalho.

O Hosting usa rewrite para `index.html` em rotas Angular. Os headers exigem revalidação de cache, desabilitam sniffing/embedding e pedem aos mecanismos de busca para não indexar o ambiente. O build de Pages com base `/crm/` continua no script separado já existente.

## Identidade do GitHub

- Conta de serviço: `crm-hosting-homologacao@sergio-6ceff.iam.gserviceaccount.com`.
- Pool: `projects/364283541545/locations/global/workloadIdentityPools/crm-homologacao-20261127`.
- Provedor OIDC: `github`, issuer `https://token.actions.githubusercontent.com`.
- Repositório GitHub ID `1469435054`, proprietário ID `360410584`.
- Trust restrito a `refs/heads/homologacao`, evento `push`, arquivo `.github/workflows/deploy-homologacao.yml` dessa mesma branch e environment `homologacao`.
- Subject OIDC observado: `repo:sergiocamargo-sistema@360410584/crm@1469435054:environment:homologacao`. Esse repositório usa o formato com IDs imutáveis do GitHub; não substituir pelo formato legado sem os IDs. O workflow registra apenas esses identificadores públicos para diagnóstico, nunca o token.
- A conta recebe `roles/firebasehosting.admin` e `roles/serviceusage.serviceUsageConsumer` no projeto; não recebe permissões de dados/Functions ou a identidade de execução do backend. O papel de Hosting é no projeto, não uma garantia de escopo por site; o workflow fixa o target permitido.
- A identidade federada do repositório recebe `roles/iam.workloadIdentityUser` somente sobre essa conta de serviço. Não criar chave JSON, token pessoal, secret Firebase ou alterar a conta global desta máquina.

As actions estão fixadas por commit. `actions/checkout` não persiste credenciais. `gha-creds-*.json` fica ignorado; a credencial temporária criada pela action não entra no artefato publicado. Ao trocar a branch, caminho do workflow, environment, repositório ou proprietário, revisar explicitamente as condições de confiança; não afrouxá-las para aceitar qualquer job.

## Login e API

Os dois domínios foram incluídos na lista autorizada do Firebase Authentication, nos domínios da chave reCAPTCHA Enterprise já usada pelo App Check e na lista CORS exata da API. O App ID e as verificações permanecem os mesmos. Atualizar a lista CORS exige publicar a API separadamente; não dar permissão de Functions à conta de deploy do frontend para isso.

O acesso continua por login Google de conta autorizada. MFA está adiado por decisão do usuário, e não foi ativado neste deploy. Não desabilitar App Check para resolver um problema de login. Domínios autorizados não concedem acesso a uma conta sem vínculo ativo.

## Operação e validação

Para publicar manualmente, com a conta administradora já conectada ao Firebase CLI, a partir de `frontend/` e na branch `homologacao`:

```sh
firebase deploy --only hosting:homologacao --project sergio-6ceff --account comunicacaosergiocamargo@gmail.com --non-interactive
```

O predeploy compila o frontend. Não reutilizar sem recompilar um artefato feito para Pages, que tem outra base. Alterações de API, banco e regras seguem o procedimento próprio do backend e não são publicadas por esse workflow.

O usuário dispensou verificações do site e assumiu a validação nesta tarefa. Executar somente a compilação necessária ao deploy; não executar testes, probes HTTP de páginas/rotas/login ou navegador por iniciativa própria. O sucesso do deploy confirma publicação do artefato, não valida login real, pontuação reCAPTCHA, telas ou CRUD. Registrar resultado operacional em `README.md`.
