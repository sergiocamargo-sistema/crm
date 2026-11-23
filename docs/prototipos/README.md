# Protótipo de conversas preservado

Em 17/11/2026, a pedido do usuário, a caixa de atendimento deixou de ser a home. O trabalho já realizado foi guardado para reutilização na etapa **Conversas**, quarta na ordem de implementação.

- [Cópia da versão v0.15](caixa-de-conversas-v0.15.tar.gz): fonte, configuração do frontend, dados fictícios, estilos, imagens e testes da versão anterior.
- [Manifesto de integridade](caixa-de-conversas-v0.15.manifest.json): SHA-256 de cada arquivo e data de captura.
- A fonte da funcionalidade também permanece em `frontend/src/app/features/inbox/`, com os mocks correspondentes.

A cópia contém 65 arquivos e foi conferida contra o manifesto. Exclui dependências instaladas, caches e credenciais. As imagens preservadas mostram a caixa em desktop e celular.

Para consultar, listar o arquivo ou extrair em uma pasta temporária; não extrair sobre a aplicação atual. Ao retomar Conversas, aproveitar os componentes existentes e adaptá-los ao cabeçalho global com busca de munícipes. A antiga página possui cabeçalho e atalho locais que precisam ser ajustados à nova estrutura.

A home atual tem os acessos: Munícipes, Kanban, Solicitações, Conversas, Projetos de lei, Leis, Configurações e Relatórios. O arquivo de conversas não está ligado à rota inicial e não cria uma tela nova nesta entrega.

## Home anterior ao design system

Também está preservada a [home v0.16](home-v0.16.tar.gz), com [manifesto de integridade](home-v0.16.manifest.json), capturada antes da aplicação da identidade Sérgio Camargo em 17/11/2026. Inclui as edições locais do usuário, fonte, estilos, testes e configuração. Consultar em pasta temporária para não sobrescrever a identidade atual.
