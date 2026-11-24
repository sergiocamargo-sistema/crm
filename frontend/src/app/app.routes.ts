import type { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'relatorios/horas-trabalhadas',
    title: 'Horas trabalhadas · Gabinete Sérgio Camargo',
    loadComponent: () =>
      import('./features/reports/pages/work-hours/work-hours.component').then(
        (module) => module.WorkHoursComponent,
      ),
  },
  { path: 'relatorios', pathMatch: 'full', redirectTo: 'relatorios/horas-trabalhadas' },
  {
    path: 'kanban/etiquetas',
    title: 'Etiquetas das tarefas · Gabinete Sérgio Camargo',
    loadComponent: () =>
      import('./features/kanban/pages/task-label-management/task-label-management.component').then(
        (module) => module.TaskLabelManagementComponent,
      ),
  },
  {
    path: 'kanban',
    title: 'Kanban · Gabinete Sérgio Camargo',
    loadComponent: () =>
      import('./features/kanban/pages/kanban-board/kanban-board.component').then(
        (module) => module.KanbanBoardComponent,
      ),
  },
  {
    path: '',
    title: 'Início · Gabinete Sérgio Camargo',
    loadComponent: () =>
      import('./features/home/pages/home-page/home-page.component').then(
        (module) => module.HomePageComponent,
      ),
  },
  {
    path: 'municipes',
    title: 'Munícipes · Gabinete Sérgio Camargo',
    loadComponent: () =>
      import('./features/citizens/pages/citizen-list/citizen-list.component').then(
        (module) => module.CitizenListComponent,
      ),
  },
  {
    path: 'municipes/novo',
    title: 'Adicionar munícipe · Gabinete Sérgio Camargo',
    canDeactivate: [
      (component: { canLeave: () => boolean | Promise<boolean> }) => component.canLeave(),
    ],
    loadComponent: () =>
      import('./features/citizens/pages/citizen-editor/citizen-editor.component').then(
        (module) => module.CitizenEditorComponent,
      ),
  },
  {
    path: 'municipes/:id',
    title: 'Ficha do munícipe · Gabinete Sérgio Camargo',
    loadComponent: () =>
      import('./features/citizens/pages/citizen-detail/citizen-detail.component').then(
        (module) => module.CitizenDetailComponent,
      ),
  },
  {
    path: 'interacoes/:id',
    title: 'Detalhes da interação · Gabinete Sérgio Camargo',
    data: { kind: 'interaction' },
    loadComponent: () =>
      import('./features/activities/pages/activity-detail/activity-detail.component').then(
        (module) => module.ActivityDetailComponent,
      ),
  },
  {
    path: 'solicitacoes',
    title: 'Solicitações · Gabinete Sérgio Camargo',
    loadComponent: () =>
      import('./features/requests/pages/request-list/request-list.component').then(
        (module) => module.RequestListComponent,
      ),
  },
  {
    path: 'solicitacoes/departamentos',
    title: 'Secretarias e departamentos · Gabinete Sérgio Camargo',
    loadComponent: () =>
      import('./features/requests/pages/department-management/department-management.component').then(
        (module) => module.DepartmentManagementComponent,
      ),
  },
  {
    path: 'solicitacoes/padroes',
    title: 'Padrões de solicitação · Gabinete Sérgio Camargo',
    loadComponent: () =>
      import('./features/requests/pages/request-pattern-management/request-pattern-management.component').then(
        (module) => module.RequestPatternManagementComponent,
      ),
  },
  {
    path: 'solicitacoes/nova',
    title: 'Nova solicitação · Gabinete Sérgio Camargo',
    loadComponent: () =>
      import('./features/requests/pages/request-editor/request-editor.component').then(
        (module) => module.RequestEditorComponent,
      ),
  },
  {
    path: 'solicitacoes/:id/editar',
    title: 'Editar solicitação · Gabinete Sérgio Camargo',
    loadComponent: () =>
      import('./features/requests/pages/request-editor/request-editor.component').then(
        (module) => module.RequestEditorComponent,
      ),
  },
  {
    path: 'solicitacoes/:id',
    title: 'Detalhes da solicitação · Gabinete Sérgio Camargo',
    loadComponent: () =>
      import('./features/requests/pages/request-detail/request-detail.component').then(
        (module) => module.RequestDetailComponent,
      ),
  },
  {
    path: 'conversas/:id',
    title: 'Detalhes da conversa · Gabinete Sérgio Camargo',
    data: { kind: 'conversation' },
    loadComponent: () =>
      import('./features/activities/pages/activity-detail/activity-detail.component').then(
        (module) => module.ActivityDetailComponent,
      ),
  },
  {
    path: 'agendamentos/:id',
    title: 'Detalhes do agendamento · Gabinete Sérgio Camargo',
    data: { kind: 'appointment' },
    loadComponent: () =>
      import('./features/activities/pages/activity-detail/activity-detail.component').then(
        (module) => module.ActivityDetailComponent,
      ),
  },
  {
    path: 'etiquetas',
    title: 'Imprimir etiquetas · Gabinete Sérgio Camargo',
    loadComponent: () =>
      import('./features/labels/pages/label-print/label-print.component').then(
        (module) => module.LabelPrintComponent,
      ),
  },
  { path: '**', redirectTo: '' },
];
