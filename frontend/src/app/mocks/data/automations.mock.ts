import type {
  AutomationRule,
  TaskSet,
  TaskTemplate,
} from '../../features/automations/models/automation';

export const MOCK_TASK_TEMPLATES: readonly TaskTemplate[] = [
  ['oficio', 'Fazer ofício', 'Preparar e encaminhar o ofício sobre a solicitação.'],
  ['avisar', 'Avisar o munícipe', 'Informar ao munícipe o encaminhamento realizado.'],
  ['foto', 'Tirar foto', 'Registrar fotos do local e anexá-las à solicitação.'],
  [
    'requerimento',
    'Fazer requerimento',
    'Preparar o requerimento e registrar a referência na solicitação.',
  ],
  ['156', 'Fazer 156', 'Registrar a demanda no 156 e anotar o protocolo na solicitação.'],
  ['retorno', 'Dar retorno', 'Conferir os encaminhamentos e dar retorno ao munícipe.'],
].map(([id, title, description]) => ({
  id: `template-${id}`,
  version: 1,
  title,
  description,
  assigneeIds: ['user-ana'],
  labelIds: [],
  priority: 'normal' as const,
  dueInDays: null,
}));

export const MOCK_TASK_SETS: readonly TaskSet[] = [
  {
    id: 'set-tapa-buraco',
    version: 1,
    name: 'Tapa-buraco',
    steps: [
      { id: 'step-oficio', templateId: 'template-oficio', dependsOn: [] },
      { id: 'step-avisar', templateId: 'template-avisar', dependsOn: ['step-oficio'] },
      { id: 'step-foto', templateId: 'template-foto', dependsOn: [] },
      { id: 'step-requerimento', templateId: 'template-requerimento', dependsOn: [] },
      { id: 'step-156', templateId: 'template-156', dependsOn: [] },
      {
        id: 'step-retorno',
        templateId: 'template-retorno',
        dependsOn: ['step-oficio', 'step-avisar', 'step-foto', 'step-requerimento', 'step-156'],
      },
    ],
  },
];

export const MOCK_AUTOMATION_RULES: readonly AutomationRule[] = [
  {
    id: 'automation-tapa-buraco',
    version: 1,
    name: 'Acompanhar tapa-buraco',
    trigger: 'request-created',
    patternId: 'pattern-buraco',
    setId: 'set-tapa-buraco',
    enabled: true,
  },
];
