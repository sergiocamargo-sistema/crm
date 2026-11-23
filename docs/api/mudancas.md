# Revisão da API: draft.2 → draft.3

Em 16/11/2026, o usuário definiu: documentar somente endpoints que as telas usarão, com payloads que resolvam suas ações completas. A draft.3 substitui a documentação ativa anterior; não há backend implantado nem compatibilidade de clientes a preservar.

| Antes | Agora |
| --- | --- |
| 298 operações em 190 caminhos, misturando tabelas, telas, integrações e recursos futuros. | 88 operações do frontend em 79 caminhos, com tela/ação identificadas; duas operações técnicas em contrato separado. |
| Criar pessoa e gravar contatos, endereços, documentos, classificações, fotos e outros vínculos separadamente. | Um POST completo ou um PATCH do agregado; o servidor resolve filhos e vínculos. |
| Montar a ficha com várias consultas aos recursos relacionados. | Uma resposta contém formulário, referências com rótulos, contexto, permissões, URLs e resumos. |
| Salvar pessoa antes do atendimento e cadastrar itens em sequência. | Solicitante novo inline no POST do atendimento, com serviços, pendências, notas e anexos atômicos. |
| Arquivos dependentes de alvo já salvo e aplicação de transcrição como outra etapa de escrita. | Upload privado em lote por rascunho local; transcrição funciona antes do cadastro e entra no texto final revisado. |
| Checagem de duplicidade como preparação técnica obrigatória. | O próprio Salvar valida e, se necessário, devolve 409 com candidatos e revisão. |
| Conferência dependente de criar/atualizar pessoa antes de integrar temporário. | Um comando integra formulário escolhido, pessoa, participação e decisão em transação. |
| Cadeia de persistir seleção, preparar geração, gerar e confirmar impressão. | Um comando aceita seleção/layout/formato inline e gera PDF imutável para prévia e impressão. |
| Estado/QR/incidente/tentativa em consultas fragmentadas. | Painel de conexão pronto e uma ação de reconectar/renovar. |
| Frontend administrando token e várias chamadas de bootstrap. | Proposta same-origin com sessão HttpOnly; login já devolve App, GET /app retoma sessão. |
| CRUD antecipado para importação/exportação/portal/filtros salvos. | Funcionalidades permanecem no planejamento, sem rotas sem consumidor definido. |

Separações mantidas correspondem a intenções reais: navegar, pesquisar, paginar histórico, enviar bytes, revisar impacto de fusão/reversão, salvar modelo reutilizável e acompanhar tarefa demorada. A redução não obriga um endpoint genérico de “executar qualquer ação”. Os comandos têm schemas e permissões próprios.

Cada operação está vinculada em [cobertura](cobertura.md); [26 cenários](cenarios.md) explicam o percurso e o orçamento das chamadas. Limites de payload, permissões finais, fornecedor WhatsApp, retenção e política de IA continuam propostas a validar na implementação.
