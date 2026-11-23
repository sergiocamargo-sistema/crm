# Catálogo de secretarias e departamentos de São José dos Campos

A fonte é o [organograma de 2026](https://www.sjc.sp.gov.br/media/kh4oz5bo/organograma-prefeitura_2026.pdf) publicado na [página de estrutura organizacional da Prefeitura](https://www.sjc.sp.gov.br/servicos/governanca/portal-da-transparencia/informacoes-institucionais/estrutura-organizacional-e-normas/). Os nomes das pastas foram conferidos no [diretório oficial de secretarias](https://www.sjc.sp.gov.br/secretarias/).

O catálogo inclui as 14 secretarias, os departamentos indicados no organograma e os órgãos intermediários necessários para preservar a subordinação. A divisão de iluminação pública também está cadastrada, pois corresponde a um dos encaminhamentos da prévia. As demais divisões, assessorias e entidades da administração indireta estão fora deste recorte. O Gabinete do CRM é uma opção interna distinta do Gabinete do Prefeito.

A base inicial fica em [sjc-departments.mock.ts](../src/app/mocks/data/sjc-departments.mock.ts) e é servida pelo repositório. Cada unidade tem um ID estável e um `parentId`. Os seletores mostram o caminho da unidade, inclusive quando dois departamentos têm o mesmo nome. A criação e a classificação de solicitações usam o ID da unidade escolhida. O filtro de solicitações inclui os descendentes da unidade selecionada e executa essa busca no repositório.

A prévia encaminha os exemplos de iluminação e limpeza para as unidades correspondentes da Secretaria de Manutenção da Cidade. Essa associação foi definida para os registros fictícios, com base nas [atribuições publicadas pela Prefeitura](https://www.sjc.sp.gov.br/media/o3obf2hd/atribui%C3%A7%C3%B5es-das-secretarias-2026.pdf).

## Gerenciar o catálogo

O ícone de prédio no topo da lista de Solicitações abre `/solicitacoes/departamentos`. A tela lista e busca unidades, permite cadastrar, renomear, trocar a unidade superior e excluir com confirmação.

O cadastro usa o mesmo repositório dos seletores. Editar mantém o ID da unidade e atualiza o catálogo na sessão. O mock bloqueia ciclos de hierarquia, nomes duplicados sob a mesma unidade superior e exclusões que deixariam unidades subordinadas ou registros vinculados. O Gabinete interno é protegido como unidade padrão.
