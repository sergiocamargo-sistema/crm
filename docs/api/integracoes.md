# Contrato técnico separado do frontend

Versão **1.0.0-draft.3**, proposto e não implementado. [YAML](integracoes.openapi.yaml) · [JSON](integracoes.openapi.json). Base `/api/v1`.

Há somente dois consumidores técnicos já identificados. Essas rotas não são usadas para montar telas nem estão no catálogo principal do frontend.

| Consumidor | Endpoint | Entrada e saída |
| --- | --- | --- |
| Monitor externo/orquestrador | `GET /saude` | Sem sessão; resposta mínima de prontidão. 503 em indisponibilidade, sem configurações ou segredos. |
| Adaptador do conector WhatsApp | `POST /webhooks/whatsapp/{conectorId}` | `WebhookWhatsapp` normalizado; HMAC do adaptador; 202 após persistência durável, incluindo duplicados reconhecidos. |

O webhook documenta o envelope interno do adaptador, não o payload nativo de um fornecedor ainda não escolhido. Inclui eventoId, tipo, ocorridoEm, identificadores de mensagem do provedor e conteúdo normalizado conforme tipo. O schema e exemplo completos estão no contrato técnico. O adaptador precisa validar a autenticação nativa do provedor antes de assinar o envelope interno.

`X-Webhook-Signature: sha256=<hex>` é HMAC-SHA256 do segredo específico do adaptador sobre `X-Webhook-Timestamp + '.' + corpo bruto`. Comparar em tempo constante, validar conector/assinatura e janela proposta de 300 segundos. Retry reassina com timestamp atual e mantém eventoId. Restrições de rede não substituem autenticação. Headers não são credenciais de usuário nem cookie do frontend.

Deduplicar por conectorId+eventoId. Persistir entrada/outbox antes de confirmar 202. Eventos antigos ou fora de ordem não podem regredir entrega/estado silenciosamente. Workers e envios reutilizam serviços e regras do produto; não criam rota pública de execução SQL. Se banco não persiste, responder erro em vez de confirmar recebimento perdido.

Fornecedor, capacidades, autenticação nativa e estratégia de reconciliação são pendências técnicas. Não acrescentar CRUD de mensagens, jobs, outbox, tentativas ou incidentes só para espelhar tabelas internas. O operador humano usa a caixa, o painel WhatsApp e os comandos descritos no [contrato de telas](README.md).
