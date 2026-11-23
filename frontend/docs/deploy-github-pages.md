# Publicação no GitHub Pages

Configuração preparada em 23/11/2026 para o repositório
<https://github.com/sergiocamargo-sistema/crm>.

## Publicação automática

Em **Settings → Pages → Build and deployment → Source**, selecionar
**GitHub Actions** com a conta proprietária do repositório.

O workflow `.github/workflows/deploy-pages.yml`, na raiz do repositório, instala
as versões do lockfile com `npm ci`, usa o Node indicado em `frontend/.nvmrc` e
compila o frontend em produção com base `/crm/`. Em cada push para `main`, publica
somente `frontend/dist/gabinete-web/browser`. Pull requests apenas compilam.
Também é possível iniciar a publicação por **Actions → Publicar frontend no GitHub
Pages → Run workflow**.

Endereço previsto: <https://sergiocamargo-sistema.github.io/crm/>.

O workflow usa o `GITHUB_TOKEN` temporário e OIDC disponibilizados pelo próprio
GitHub. Não cadastrar chave SSH privada nem token pessoal em arquivos do projeto.
As permissões de publicação ficam somente no job de deploy.

## Rotas e arquivos

`npm run build:pages`, executado em `frontend/`, gera o mesmo artefato usado pelo
workflow. O script de preparação copia `index.html` para `404.html` para permitir
abrir ou recarregar rotas como `/crm/municipes/cid-mariana`, preservando os
parâmetros e fragmentos. O Pages responde HTTP 404 nessas URLs, mas carrega a
aplicação e o Angular abre a rota; a home responde HTTP 200. Um servidor com
reescrita de SPA será necessário se todas as rotas precisarem responder HTTP 200.

Os links de compartilhamento respeitam o base href, e os PDFs de exemplo usam
caminhos relativos. Ao renomear o repositório ou configurar um domínio próprio,
revisar o `--base-href` no script `build:pages`.

## Credenciais e dados

O `.gitignore` cobre arquivos `.env`, chaves privadas, certificados, credenciais
de provedores e configurações locais de autenticação, além de dependências,
compilações e relatórios locais. Exemplos `.env.example` devem conter apenas
nomes de variáveis e valores fictícios. Ignorar um arquivo não remove segredos
que já tenham sido publicados no histórico; nesse caso, revogar a credencial.

Valores incorporados ao JavaScript do frontend são públicos, mesmo que venham
de um secret do workflow. Credenciais de backend devem permanecer no servidor.

A publicação atual utiliza os repositórios mock e os dados fictícios da prévia,
sem backend ou login. As alterações feitas na interface permanecem na sessão e
somem ao recarregar. A documentação de planejamento não é incluída no artefato
do site.

## Acesso Git nesta máquina

O remoto usa o alias SSH `github-sergiocamargo` para selecionar a chave da conta
`sergiocamargo-sistema`, preservando os outros acessos locais:

```sh
git remote -v
# git@github-sergiocamargo:sergiocamargo-sistema/crm.git

git push origin main
```

Esse alias é local. Em outra máquina, configurar a própria chave e usar a URL
SSH padrão `git@github.com:sergiocamargo-sistema/crm.git` ou a URL HTTPS.
