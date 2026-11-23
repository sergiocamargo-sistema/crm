import { TeamCollaborationService } from '../../core/services/team-collaboration.service';
import { TeamStore } from '../../core/stores/team.store';
import { Component, inject, input, output } from '@angular/core';
import { IconComponent, type IconName } from '../../shared/components/icon/icon.component';

interface NavigationItem {
  label: string;
  icon: IconName;
  active?: boolean;
}
interface NavigationGroup {
  label: string;
  items: readonly NavigationItem[];
}

@Component({
  selector: 'app-sidebar',
  imports: [IconComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  protected readonly profile = inject(TeamStore).current;

  constructor() {
    inject(TeamCollaborationService);
  }

  readonly unreadCount = input(0);
  readonly showClose = input(false);
  readonly dismissed = output<void>();
  protected readonly groups: readonly NavigationGroup[] = [
    {
      label: 'PRINCIPAL',
      items: [
        { label: 'Visão geral', icon: 'dashboard' },
        { label: 'Caixa de entrada', icon: 'inbox', active: true },
        { label: 'Munícipes', icon: 'users' },
        { label: 'Atendimentos', icon: 'clipboard' },
        { label: 'Agenda', icon: 'calendar' },
      ],
    },
    {
      label: 'ORGANIZAÇÃO',
      items: [
        { label: 'Eventos e cadastros', icon: 'event' },
        { label: 'Relatórios', icon: 'chart' },
        { label: 'Etiquetas', icon: 'tag' },
        { label: 'Histórico de atividades', icon: 'history' },
      ],
    },
  ];
}
