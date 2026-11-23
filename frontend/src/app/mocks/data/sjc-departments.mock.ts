import type { Department } from '../../features/requests/models/request-detail';

// Organograma da Prefeitura de São José dos Campos (2026).
// https://www.sjc.sp.gov.br/media/kh4oz5bo/organograma-prefeitura_2026.pdf
type Unit = readonly [id: string, name: string, children?: readonly Unit[]];

const municipality: readonly Unit[] = [
  [
    'sjc-prefeito',
    'Gabinete do Prefeito',
    [
      [
        'sjc-parcerias-especiais',
        'Assessoria para Parcerias de Investimentos e Projetos Especiais',
        [['sjc-parcerias-projetos', 'Departamento de Parcerias e Projetos']],
      ],
    ],
  ],
  [
    'sjc-apoio-social',
    'Secretaria de Apoio Social ao Cidadão',
    [
      ['sjc-apoio-desenvolvimento', 'Departamento de Desenvolvimento Social'],
      ['sjc-apoio-promocao', 'Departamento de Promoção à Cidadania'],
      ['sjc-apoio-planejamento', 'Departamento de Planejamento e Gestão Social'],
      ['sjc-apoio-integracao', 'Departamento de Integração Comunitária'],
    ],
  ],
  [
    'sjc-juridicos',
    'Secretaria de Assuntos Jurídicos',
    [['sjc-juridicos-consumidor', 'Departamento de Proteção ao Consumidor']],
  ],
  [
    'sjc-educacao',
    'Secretaria de Educação e Cidadania',
    [
      ['sjc-educacao-projetos', 'Departamento de Gestão de Projetos Especiais'],
      ['sjc-educacao-expansao', 'Departamento de Expansão e Estrutura Educacional'],
      ['sjc-educacao-gestao', 'Departamento de Gestão'],
      ['sjc-educacao-fundamental', 'Departamento de Ensino Fundamental'],
      ['sjc-educacao-infantil', 'Departamento de Educação Infantil'],
      ['sjc-educacao-esporte', 'Departamento de Esporte Educacional'],
    ],
  ],
  [
    'sjc-esporte',
    'Secretaria de Esporte e Qualidade de Vida',
    [
      ['sjc-esporte-lazer', 'Departamento de Esportes e Lazer'],
      ['sjc-esporte-desporto', 'Departamento de Desporto'],
    ],
  ],
  [
    'sjc-financas',
    'Secretaria de Gestão Administrativa e Finanças',
    [
      ['sjc-financas-pessoas', 'Departamento de Gestão de Pessoas'],
      ['sjc-financas-infraestrutura', 'Departamento de Gestão de Infraestrutura Interna e Suporte'],
      ['sjc-financas-ti', 'Departamento de Tecnologia da Informação'],
      ['sjc-financas-recursos', 'Departamento de Planejamento e Gestão de Recursos'],
      ['sjc-financas-ativos', 'Departamento de Ativos Imobiliários'],
      ['sjc-financas-financeiro', 'Departamento Financeiro'],
      ['sjc-financas-estrategico', 'Departamento Estratégico'],
    ],
  ],
  [
    'dept-obras',
    'Secretaria de Gestão de Obras',
    [
      ['sjc-obras-publicas', 'Departamento de Obras Públicas'],
      ['sjc-obras-viarias', 'Departamento de Obras Viárias'],
      ['sjc-obras-planejamento', 'Departamento de Planejamento Estratégico de Obras Públicas'],
    ],
  ],
  [
    'sjc-governanca',
    'Secretaria de Governança',
    [
      [
        'sjc-governanca-gabinete',
        'Gabinete do Secretário',
        [
          [
            'sjc-governanca-adjunta',
            'Secretaria Adjunta',
            [
              ['sjc-governanca-digital', 'Departamento de Governo Digital'],
              ['sjc-governanca-legislativos', 'Departamento de Assuntos Legislativos'],
            ],
          ],
        ],
      ],
      [
        'sjc-governanca-controladoria',
        'Controladoria Geral do Município',
        [
          ['sjc-governanca-controle', 'Departamento de Controle Interno'],
          ['sjc-governanca-transparencia', 'Departamento de Transparência e Auditoria'],
        ],
      ],
      [
        'sjc-governanca-institucionais',
        'Subsecretaria de Relações Institucionais',
        [
          ['sjc-governanca-comunitarias', 'Departamento de Relações Comunitárias'],
          ['sjc-governanca-esportes', 'Departamento de Esportes de Alto Rendimento'],
        ],
      ],
      [
        'sjc-governanca-comunicacao',
        'Subsecretaria de Comunicação',
        [
          ['sjc-governanca-marketing', 'Departamento de Publicidade e Marketing'],
          ['sjc-governanca-imprensa', 'Departamento de Comunicação'],
        ],
      ],
    ],
  ],
  [
    'sjc-habitacao',
    'Secretaria de Habitação e Regularização Fundiária',
    [
      ['sjc-habitacao-programas', 'Departamento de Habitação'],
      ['sjc-habitacao-regularizacao', 'Departamento de Regularização Fundiária'],
    ],
  ],
  [
    'sjc-inovacao',
    'Secretaria de Inovação e Desenvolvimento Econômico',
    [
      ['sjc-inovacao-negocios', 'Departamento de Relações Institucionais e Negócios'],
      ['sjc-inovacao-turismo', 'Departamento de Turismo'],
      [
        'sjc-inovacao-empregabilidade',
        'Departamento de Empregabilidade e Qualificação do Trabalhador',
      ],
      ['sjc-inovacao-empreendedor', 'Departamento de Apoio ao Empreendedor'],
      ['sjc-inovacao-projetos', 'Departamento de Gestão de Projetos Especiais'],
    ],
  ],
  [
    'dept-urbanos',
    'Secretaria de Manutenção da Cidade',
    [
      ['sjc-manutencao-limpeza', 'Departamento de Gestão de Limpeza Urbana'],
      ['sjc-manutencao-administrativo', 'Departamento de Planejamento e Gestão Administrativa'],
      [
        'sjc-manutencao-concessionarias',
        'Departamento de Relações com Concessionárias',
        [['sjc-manutencao-iluminacao', 'Divisão de Gestão de Energia e Iluminação Pública']],
      ],
      ['sjc-manutencao-zeladoria', 'Departamento de Gestão de Zeladoria Urbana'],
    ],
  ],
  [
    'sjc-mobilidade',
    'Secretaria de Mobilidade Urbana',
    [
      ['sjc-mobilidade-patrimonio', 'Departamento de Gestão Patrimonial e Estatístico'],
      ['sjc-mobilidade-operacao', 'Departamento de Operação Viária'],
      ['sjc-mobilidade-melhorias', 'Departamento de Melhorias Viárias'],
      ['sjc-mobilidade-projetos', 'Departamento de Projetos Viários'],
      ['sjc-mobilidade-transportes', 'Departamento de Transportes Públicos'],
    ],
  ],
  [
    'sjc-protecao',
    'Secretaria de Proteção ao Cidadão',
    [
      ['sjc-protecao-seguranca', 'Departamento de Planejamento de Segurança'],
      ['sjc-protecao-defesa', 'Departamento de Política de Defesa Civil'],
      ['sjc-protecao-posturas', 'Departamento de Posturas Municipais e Estética Urbana'],
    ],
  ],
  [
    'dept-saude',
    'Secretaria de Saúde',
    [
      ['sjc-saude-vigilancia', 'Departamento de Vigilância em Saúde'],
      ['sjc-saude-gestao', 'Departamento de Gestão em Saúde'],
      ['sjc-saude-hospitalar', 'Departamento de Gestão Hospitalar e de Emergências'],
      ['sjc-saude-regulacao', 'Departamento de Regulação e Controle'],
      ['sjc-saude-primaria', 'Departamento de Atenção Primária à Saúde'],
      ['sjc-saude-secundaria', 'Departamento de Atenção Secundária à Saúde'],
    ],
  ],
  [
    'sjc-urbanismo',
    'Secretaria de Urbanismo e Sustentabilidade',
    [
      ['sjc-urbanismo-habite-se', 'Departamento de Gestão de Habite-se e Fiscalização de Obras'],
      ['sjc-urbanismo-planejamento', 'Departamento de Planejamento Urbano'],
      ['dept-ambiente', 'Departamento de Gestão Ambiental'],
      ['sjc-urbanismo-particulares', 'Departamento de Gestão de Obras Particulares'],
    ],
  ],
];

function flatten(units: readonly Unit[], parentId: string | null = null): Department[] {
  return units.flatMap(([id, name, children]) => [
    { id, name, parentId },
    ...(children ? flatten(children, id) : []),
  ]);
}

export const MOCK_DEPARTMENTS: readonly Department[] = [
  { id: 'dept-gabinete', name: 'Gabinete', parentId: null },
  ...flatten(municipality),
];
