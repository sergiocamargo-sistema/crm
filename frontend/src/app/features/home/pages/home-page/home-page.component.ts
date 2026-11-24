import { Component, DestroyRef, inject, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { IconComponent, type IconName } from '../../../../shared/components/icon/icon.component';
import { HomeMessageStore } from '../../stores/home-message.store';
import { TeamCollaborationService } from '../../../../core/services/team-collaboration.service';
import { HomeMessageService } from '../../services/home-message';
import { RouterLink } from '@angular/router';

interface HomeModule {
  readonly id: string;
  readonly label: string;
  readonly icon: IconName;
  readonly route?: string;
}

@Component({
  selector: 'app-home-page',
  imports: [IconComponent, NgOptimizedImage, RouterLink],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
})
export class HomePageComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly messages = inject(HomeMessageService);
  protected readonly homeMessage = inject(HomeMessageStore).message;
  protected readonly firstName = inject(TeamCollaborationService).actor.name.split(' ')[0];
  protected readonly selectedModule = signal('');
  private noticeTimer: ReturnType<typeof setTimeout> | undefined;
  protected readonly modules: readonly HomeModule[] = [
    { id: 'municipes', label: 'Munícipes', icon: 'users', route: '/municipes' },
    { id: 'kanban', label: 'Tarefas', icon: 'kanban', route: '/kanban' },
    { id: 'solicitacoes', label: 'Solicitações', icon: 'clipboard', route: '/solicitacoes' },
    { id: 'conversas', label: 'Conversas', icon: 'message' },
    { id: 'projetos-de-lei', label: 'Projetos de lei', icon: 'filePen' },
    { id: 'leis', label: 'Leis', icon: 'scales' },
    {
      id: 'relatorios',
      label: 'Relatórios',
      icon: 'chart',
      route: '/relatorios/horas-trabalhadas',
    },
    { id: 'configuracoes', label: 'Configurações', icon: 'settings' },
    { id: 'automacoes', label: 'Automações', icon: 'workflow', route: '/automacoes' },
    { id: 'arvore', label: 'Árvore', icon: 'tree', route: '/arvore' },
  ];

  constructor() {
    this.messages.load();
    this.destroyRef.onDestroy(() => clearTimeout(this.noticeTimer));
  }
  protected selectModule(label: string): void {
    clearTimeout(this.noticeTimer);
    this.selectedModule.set(label);
    this.noticeTimer = setTimeout(() => this.selectedModule.set(''), 3500);
  }
  protected dismissNotice(): void {
    clearTimeout(this.noticeTimer);
    this.selectedModule.set('');
  }
}
