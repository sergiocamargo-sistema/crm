# Backend do Gabinete CRM

Leia `README.md` deste diretório e `../AGENTS.md` antes de alterar os fluxos. A autorização atual, de 25/11/2026, abrange os módulos ativos existentes; as restrições antigas de adiar backend estão superadas nesse escopo.

- Trabalhar na branch `homologacao`. Não alterar/publicar `main`, GitHub Pages ou criar outro site.
- `src/config/persistence.ts` seleciona o banco. Os repositórios dependem de `DocumentDatabase`, nunca de tipos do Firebase. Identidade e arquivos têm portas separadas.
- Regras de negócio compartilhadas vivem em `../src/app/domain/`; não recriar cópias no frontend/backend. Mocks antigos estão arquivados localmente, sem participação na aplicação.
- Nova operação: atualizar contrato `BackendApi`/operações de domínio, implementar regra, regenerar contrato com `npm run generate:contract`, registrar consumidor via Service → Repository. Não expor métodos internos do motor.
- API autenticada e autorização por `teamAccess/{uid}` em toda requisição; conferir novamente dentro da transação das gravações. Autoria vem da identidade verificada.
- Não persistir `blob:`, URLs assinadas ou objetos SDK. Arquivos persistem como `crm-file://UUID`; URLs temporárias são produzidas na resposta.
- Preservar atomicidade, recibos de idempotência, histórico, snapshots das automações, cursores e exclusões no cache. Nenhuma persistência apenas otimista com falha silenciosa.
- Não exportar dados reais, executar restore, alterar faturamento, provisionar acessos ou enviar arquivos ao Drive sem autorização específica. Restaurar primeiro em banco vazio e isolado.
- Preferência do usuário: não executar testes, builds manuais ou navegador por iniciativa própria; solicitar quando necessário. Não afirmar validação que não ocorreu.

Estado inicial desta implementação: código preparado, ainda sem build/testes/deploy; a consulta de faturamento de 25/11/2026 retornou `billingEnabled:false`. Não confundir código com serviço já publicado. Atualizar esse registro quando houver nova evidência.
