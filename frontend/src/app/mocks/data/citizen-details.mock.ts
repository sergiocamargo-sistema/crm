import { MOCK_CITIZENS } from './citizens.mock';
import type {
  CitizenDetail,
  CitizenInteraction,
  CitizenPhone,
} from '../../features/citizens/models/citizen-detail';

const profiles = [
  {
    birth: '12/03/1992',
    occupation: 'Professora',
    street: 'Rua das Acácias, 45',
    complement: 'Casa 2',
    reference: 'Próximo à praça do bairro',
    observations:
      'Prefere contato pelo WhatsApp no período da manhã. Ao retornar sobre solicitações, enviar o número do protocolo e explicar o próximo passo. Participa da associação de moradores do Jardim das Flores.',
  },
  {
    birth: '23/08/1981',
    occupation: 'Comerciante',
    street: 'Rua dos Ipês, 180',
    complement: 'Casa',
    reference: 'Ao lado da padaria do bairro',
    observations:
      'Sãopaulino da Sagrada Família, sua esposa é a Maria Isabel, filhos: José, João e Maria, eu conheci ele no encontro da Pastoral Familiar',
  },
  {
    birth: '07/06/1988',
    occupation: 'Auxiliar administrativa',
    street: 'Rua da Praça, 62',
    complement: 'Apartamento 12',
    reference: 'Em frente à biblioteca',
    observations:
      'Prefere receber orientações por escrito. Nas visitas ao gabinete, combinar horário com antecedência e encaminhar uma confirmação pelo WhatsApp.',
  },
  {
    birth: '19/09/1979',
    occupation: 'Eletricista',
    street: 'Rua das Palmeiras, 310',
    complement: 'Casa',
    reference: 'Próximo à escola municipal',
    observations:
      'Costuma atender entre 12h e 13h. Solicita informações sobre melhorias no bairro e prefere que o gabinete reúna as atualizações em uma única mensagem.',
  },
  {
    birth: '05/01/1990',
    occupation: 'Empreendedora',
    street: 'Rua da Esperança, 87',
    complement: 'Fundos',
    reference: 'Segunda rua depois da praça',
    observations:
      'Prefere contato por WhatsApp. Antes de uma visita ao endereço, confirmar a disponibilidade e informar quem fará o atendimento.',
  },
  {
    birth: '30/04/1965',
    occupation: 'Aposentado',
    street: 'Rua São José, 24',
    complement: 'Casa térrea',
    reference: 'Próximo ao centro comunitário',
    observations:
      'Prefere ligações pela manhã e atendimento presencial. Ao orientar sobre documentos, apresentar uma lista simples e confirmar se ficou alguma dúvida.',
  },
  {
    birth: '16/11/1995',
    occupation: 'Designer',
    street: 'Rua dos Girassóis, 156',
    complement: 'Apartamento 23',
    reference: 'Edifício próximo à praça',
    observations:
      'Prefere mensagens de texto no fim da tarde. Tem interesse nas atividades culturais do bairro; confirmar o interesse antes de enviar comunicados.',
  },
  {
    birth: '21/07/1972',
    occupation: 'Motorista',
    street: 'Rua do Comércio, 209',
    complement: 'Casa',
    reference: 'Próximo ao terminal de ônibus',
    observations:
      'Tem horários de trabalho variáveis. Iniciar o contato por mensagem para combinar a ligação e registrar o retorno na linha do tempo.',
  },
] as const;

// Registros inteiramente fictícios. As datas permanecem fixas para apresentação do protótipo.
const interactions: readonly CitizenInteraction[] = [
  {
    id: 'interaction-09',
    type: 'call',
    direction: 'active',
    occurredAt: '2026-11-17T10:35:00-03:00',
    title: 'Retorno sobre a melhoria da iluminação',
    description:
      'O gabinete entrou em contato para informar que a vistoria foi agendada. Combinado novo retorno assim que a secretaria confirmar a execução.',
    department: 'Serviços Urbanos',
    author: 'Ana Martins',
    protocol: '2026-0148',
  },
  {
    id: 'interaction-08',
    type: 'conversation',
    direction: 'passive',
    occurredAt: '2026-11-16T09:12:00-03:00',
    title: 'Dúvida sobre o andamento da solicitação',
    description:
      'O munícipe procurou a equipe pelo WhatsApp para saber a previsão do atendimento. A equipe confirmou o encaminhamento e registrou o pedido de retorno.',
    department: 'Serviços Urbanos',
    author: 'Rafael Souza',
    protocol: '2026-0148',
  },
  {
    id: 'interaction-06',
    type: 'office-visit',
    direction: 'passive',
    occurredAt: '2026-11-10T11:00:00-03:00',
    title: 'Atendimento presencial no gabinete',
    description:
      'Visita para conversar sobre as demandas do bairro. Foram acolhidos os relatos, confirmados os dados de contato e explicados os canais de acompanhamento.',
    department: 'Gabinete',
    author: 'Beatriz Lima',
  },
  {
    id: 'interaction-05',
    type: 'announcement',
    direction: 'active',
    occurredAt: '2026-11-06T16:20:00-03:00',
    title: 'Informações sobre a reunião do bairro',
    description:
      'Enviado comunicado com data, local e pauta do encontro com moradores. O conteúdo incluiu um canal para confirmar presença e esclarecer dúvidas.',
    department: 'Gabinete',
    author: 'Ana Martins',
  },
  {
    id: 'interaction-04',
    type: 'meeting',
    direction: 'active',
    occurredAt: '2026-10-28T18:30:00-03:00',
    title: 'Conversa durante encontro com moradores',
    description:
      'Encontro pessoal na praça do bairro para ouvir sugestões sobre os espaços de convivência. A equipe ficou de reunir as propostas e apresentar os encaminhamentos.',
    department: 'Cultura e Lazer',
    author: 'Rafael Souza',
  },
  {
    id: 'interaction-03',
    type: 'call',
    direction: 'passive',
    occurredAt: '2026-10-20T08:45:00-03:00',
    title: 'Orientação sobre os serviços da unidade de saúde',
    description:
      'Ligação recebida para esclarecer os canais de agendamento da unidade. Foram repassados os contatos públicos e os horários de atendimento.',
    department: 'Saúde',
    author: 'Beatriz Lima',
  },
  {
    id: 'interaction-02',
    type: 'announcement',
    direction: 'active',
    occurredAt: '2026-10-14T10:10:00-03:00',
    title: 'Programação cultural compartilhada',
    description:
      'Compartilhada a programação gratuita do centro comunitário, conforme o interesse registrado no atendimento anterior.',
    department: 'Cultura e Lazer',
    author: 'Ana Martins',
  },
  {
    id: 'interaction-01',
    type: 'conversation',
    direction: 'passive',
    occurredAt: '2026-10-05T09:30:00-03:00',
    title: 'Primeiro contato e acolhimento',
    description:
      'Conversa inicial para conhecer as demandas do munícipe, registrar os dados de contato e apresentar o acompanhamento realizado pelo gabinete.',
    department: 'Gabinete',
    author: 'Ana Martins',
  },
];

const portraits = [
  'photo-1580489944761-15a19d654956',
  'photo-1500648767791-00dcc994a43e',
  'photo-1494790108377-be9c29b29330',
  'photo-1519085360753-af0119f7cbe7',
  'photo-1534528741775-53994a69daeb',
  'photo-1506794778202-cad84cf45f1d',
  'photo-1531123897727-8f129e1688ce',
  'photo-1560250097-0b93528c311a',
] as const;

const phone = (number: string, label: string, whatsapp = false): CitizenPhone => {
  const internationalNumber = `55${number.replace(/\D/g, '')}`;
  return {
    number,
    label,
    callUrl: `tel:+${internationalNumber}`,
    ...(whatsapp ? { whatsappUrl: `https://wa.me/${internationalNumber}` } : {}),
  };
};

// Cadeias fictícias para a demonstração da Árvore.
const referrersByCitizenId = new Map([
  ['cid-beatriz', 'cid-mariana'],
  ['cid-joao', 'cid-mariana'],
  ['cid-patricia', 'cid-beatriz'],
  ['cid-roberto', 'cid-patricia'],
  ['cid-carlos', 'cid-antonio'],
]);
const citizensById = new Map(MOCK_CITIZENS.map((citizen) => [citizen.id, citizen]));

export const MOCK_CITIZEN_DETAILS: readonly CitizenDetail[] = MOCK_CITIZENS.map(
  (citizen, index) => {
    const profile = profiles[index];
    const [birthDay, birthMonth, birthYear] = profile.birth.split('/');
    const slug = citizen.id.replace('cid-', '');
    const photoBase = `https://images.unsplash.com/${portraits[index]}`;
    const referrer = citizensById.get(referrersByCitizenId.get(citizen.id) ?? '');
    return {
      ...citizen,
      birthDate: `${birthYear}-${birthMonth}-${birthDay}`,
      cra: String(100001 + index),
      observations: profile.observations,
      ...(referrer ? { referrerId: referrer.id } : {}),
      categories: ['Paróquia Sagrada Família', 'Ministro da Eucaristia', 'Pastoral Familiar'],
      phones: [
        phone(citizen.phone, 'Principal', true),
        phone(`(11) 90000-01${String(index + 1).padStart(2, '0')}`, 'Alternativo', true),
      ],
      emails: [
        { address: `${slug}@example.com`, label: 'Pessoal' },
        { address: `${slug}.contato@example.com`, label: 'Alternativo' },
      ],
      socialLinks: [
        { label: 'Instagram', icon: 'instagram', url: 'https://www.instagram.com/' },
        { label: 'Facebook', icon: 'facebook', url: 'https://www.facebook.com/' },
        { label: 'LinkedIn', icon: 'linkedin', url: 'https://www.linkedin.com/' },
      ],
      address: {
        street: profile.street,
        complement: profile.complement,
        city: 'São Paulo',
        state: 'SP',
        postalCode: '00000-000',
        reference: profile.reference,
      },
      personalData: [
        { label: 'Nome completo', value: citizen.name },
        { label: 'Data de nascimento', value: profile.birth },
        { label: 'Profissão', value: profile.occupation },
        { label: 'Canal preferencial', value: index === 5 ? 'Ligação' : 'WhatsApp' },
        ...(referrer ? [{ label: 'Indicado por', value: referrer.name }] : []),
      ],
      // Retratos de exemplo da internet; não correspondem aos nomes fictícios.
      photos: [
        {
          src: `${photoBase}?auto=format&fit=crop&crop=faces&w=900&h=1000&q=80`,
          label: 'Retrato do munícipe · exemplo',
        },
        {
          src: `${photoBase}?auto=format&fit=crop&crop=faces&w=900&h=450&q=80`,
          label: 'Foto 2 do munícipe · exemplo',
        },
        {
          src: `${photoBase}?auto=format&fit=crop&crop=top&w=900&h=450&q=80`,
          label: 'Foto 3 do munícipe · exemplo',
        },
        {
          src: `${photoBase}?auto=format&fit=crop&w=900&h=1000&q=80`,
          label: 'Foto 4 do munícipe · exemplo',
        },
      ],
      interactions: interactions.map((interaction) => ({
        ...interaction,
        id: `${citizen.id}-${interaction.id}`,
        requestId: interaction.protocol === '2026-0148' ? `${citizen.id}-request-0148` : undefined,
        channel: interaction.type === 'conversation' ? ('whatsapp' as const) : interaction.channel,
        conversation:
          interaction.type === 'conversation'
            ? {
                status: 'open' as const,
                messages: [
                  {
                    id: `${citizen.id}-${interaction.id}-message-01`,
                    text: interaction.protocol
                      ? 'Bom dia! Gostaria de saber se há uma previsão para a manutenção da iluminação da nossa rua.'
                      : 'Bom dia! Gostaria de conversar sobre as necessidades do nosso bairro.',
                    sentAt: interaction.occurredAt,
                    direction: 'incoming' as const,
                    author: citizen.name,
                  },
                  {
                    id: `${citizen.id}-${interaction.id}-message-02`,
                    text: interaction.protocol
                      ? 'Bom dia! A solicitação 2026-0148 já foi encaminhada aos Serviços Urbanos. Vou acompanhar a vistoria e retorno assim que houver uma atualização.'
                      : 'Bom dia! Vamos ouvir suas demandas e registrar os encaminhamentos. Como podemos ajudar?',
                    sentAt: new Date(Date.parse(interaction.occurredAt) + 120000).toISOString(),
                    direction: 'outgoing' as const,
                    author: interaction.author,
                  },
                ],
              }
            : undefined,
      })),
      requests: [
        {
          id: `${citizen.id}-request-0148`,
          title: 'Manutenção na iluminação da rua',
          status: 'pending',
          protocol: '2026-0148',
          createdBy: 'Ana Martins',
          direction: 'passive',
          description: `Dois pontos de iluminação sem funcionamento na ${profile.street}. O munícipe relata pouca visibilidade à noite e solicita manutenção. Referência: ${profile.reference}.`,
          department: 'Serviços Urbanos',
          createdAt: '2026-11-13T14:40:00-03:00',
          dueAt: '2026-11-25T18:00:00-03:00',
          priority: 'Alta',
          history: [
            {
              id: 'request-0148-history-03',
              author: 'Ana Martins',
              title: 'Vistoria agendada',
              description:
                'A secretaria confirmou o recebimento. Aguardando a vistoria e a previsão de execução.',
              occurredAt: '2026-11-17T10:35:00-03:00',
            },
            {
              id: 'request-0148-history-02',
              author: 'Ana Martins',
              title: 'Encaminhada à secretaria',
              description: 'Endereço e referências enviados aos Serviços Urbanos.',
              occurredAt: '2026-11-14T09:00:00-03:00',
            },
          ],
        },
        {
          id: `${citizen.id}-request-0122`,
          title: 'Limpeza da praça do bairro',
          status: 'completed',
          protocol: '2026-0122',
          createdBy: 'Rafael Souza',
          direction: 'passive',
          description:
            'Solicitada a limpeza da praça e a retirada de resíduos nas áreas de circulação. Serviço concluído e retorno realizado ao munícipe.',
          department: 'Serviços Urbanos',
          createdAt: '2026-10-07T11:20:00-03:00',
          dueAt: '2026-10-20T18:00:00-03:00',
          priority: 'Normal',
          history: [
            {
              id: 'request-0122-history-02',
              author: 'Rafael Souza',
              title: 'Serviço concluído',
              description: 'Limpeza realizada e conclusão informada ao munícipe.',
              occurredAt: '2026-10-19T15:00:00-03:00',
            },
          ],
        },
      ],
      appointments: [
        {
          id: `${citizen.id}-appointment-01`,
          title: 'Retorno no gabinete',
          startsAt: '2026-11-23T10:00:00-03:00',
          endsAt: '2026-11-23T10:30:00-03:00',
          description:
            'Conversa de retorno sobre os encaminhamentos das demandas do bairro. Levar o protocolo da solicitação de iluminação.',
          location: 'Gabinete do vereador · Câmara Municipal',
          responsible: 'Ana Martins',
          status: 'confirmed',
          participants: [citizen.name, 'Ana Martins'],
        },
        {
          id: `${citizen.id}-appointment-02`,
          title: 'Reunião com moradores',
          startsAt: '2026-11-26T18:30:00-03:00',
          endsAt: '2026-11-26T19:30:00-03:00',
          description:
            'Encontro para ouvir propostas de melhoria dos espaços de convivência e combinar os próximos encaminhamentos.',
          location: `Centro comunitário · ${citizen.neighborhood}`,
          responsible: 'Rafael Souza',
          status: 'scheduled',
          participants: [citizen.name, 'Rafael Souza', 'Representantes da associação de moradores'],
        },
      ],
      registeredAt: '2026-10-05',
      responsible: index % 2 === 0 ? 'Ana Martins' : 'Rafael Souza',
    };
  },
);
