# MCP e API de negócio

Direção proposta: o MCP usa os mesmos serviços de aplicação e permissões da API. Evitar acesso direto de escrita ao banco, pois isso contornaria normalização, duplicidade, auditoria, concorrência, vínculos e limites dos efeitos externos.

Se MCP e API estiverem no mesmo backend, o adaptador MCP pode chamar esses serviços internamente. Se forem processos separados, uma API de negócio autenticada pode expô-los. Isso não exige criar hoje rotas que nenhuma tela ou integração definida utilizará. Autenticação do futuro cliente MCP deve ser projetada quando seu consumidor e hospedagem forem definidos; o cookie da sessão humana não será um segredo compartilhado com agentes.

| Intenção eventual da ferramenta | Capacidade de negócio compartilhada |
| --- | --- |
| Pesquisar pessoa autorizada | Consulta usada por `POST /municipes/pesquisa`, com mesmos filtros e acesso aos trechos. |
| Abrir solicitação | Comando agregado de `POST /atendimentos`, inclusive itens e contexto. |
| Consultar protocolo e serviços | Leitura da ficha de atendimento pronta. |
| Atualizar pedido/serviços | Comando agregado de edição, com versão e justificativa. |
| Consultar pendências | Leitura da agenda no escopo concedido. |

Essas correspondências são planejamento, não ferramentas MCP instaladas. Não publicar endpoints extras de CRUD por tabela para permitir automação hipotética. Identificar agente/serviço no histórico, delimitar escopo próprio e revalidar acesso em cada ação. Usuário e serviço não podem elevar suas próprias permissões.

Triagem contextual não cria protocolo a cada mensagem. Dúvida de identidade ou múltiplos assuntos vai para revisão humana. Durante atuação humana, a IA sugere sem disputar respostas. Qualquer resposta automática futura exige política explícita e revalidação no worker antes do efeito externo.

Auditoria, idempotência e reconciliação pertencem ao backend e são comuns a UI, worker e MCP. Uma consulta analítica de leitura a uma réplica, se futuramente necessária, seria outro consumidor com escopo documentado; não constitui autorização presente de conexão direta ao banco.
