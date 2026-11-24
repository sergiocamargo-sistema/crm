import {
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  DOCUMENT,
  effect,
  ElementRef,
  inject,
  Injector,
  signal,
  viewChild,
} from '@angular/core';
import { form, FormField } from '@angular/forms/signals';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { TaskLabelsComponent } from '../../../../shared/components/task-labels/task-labels.component';
import { taskPriorityLabel } from '../../../../core/models/task';
import { AutomationService } from '../../services/automation.service';
import type { AutomationRule, AutomationRun, TaskSet, TaskTemplate } from '../../models/automation';
import { TemplateEditorComponent } from '../../components/template-editor/template-editor.component';
import { SetEditorComponent } from '../../components/set-editor/set-editor.component';
import { RuleEditorComponent } from '../../components/rule-editor/rule-editor.component';

type Tab = 'rules' | 'sets' | 'templates' | 'runs';
type Editor =
  | { kind: 'template'; record: TaskTemplate | null }
  | { kind: 'set'; record: TaskSet | null }
  | { kind: 'rule'; record: AutomationRule | null };
type OpenEditor = { editor: Editor; trigger: HTMLElement };
type Removal = { kind: 'template' | 'set' | 'rule'; id: string; version: number; name: string };

@Component({
  selector: 'app-automations',
  imports: [
    RouterLink,
    DatePipe,
    FormField,
    IconComponent,
    TaskLabelsComponent,
    TemplateEditorComponent,
    SetEditorComponent,
    RuleEditorComponent,
  ],
  templateUrl: './automations.component.html',
  styleUrl: './automations.component.scss',
})
export class AutomationsComponent {
  private readonly service = inject(AutomationService);
  private readonly route = inject(ActivatedRoute);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly state = this.service.store;
  protected readonly searchForm = form(this.state.search);
  protected readonly tab = signal<Tab>('rules');
  protected readonly editors = signal<readonly OpenEditor[]>([]);
  protected readonly activeEditor = computed(() => this.editors().at(-1));
  protected readonly createdSet = signal<TaskSet | null>(null);
  protected readonly createdTemplate = signal<TaskTemplate | null>(null);
  protected readonly editorTitle = computed(() => {
    const editor = this.activeEditor()?.editor;
    switch (editor?.kind) {
      case 'rule':
        return editor.record ? 'Editar automação' : 'Nova automação';
      case 'set':
        return editor.record ? 'Editar conjunto' : 'Novo conjunto';
      case 'template':
        return editor.record ? 'Editar tarefa modelo' : 'Nova tarefa modelo';
      default:
        return '';
    }
  });
  protected readonly removal = signal<Removal | null>(null);
  protected readonly status = signal('');
  protected readonly targetRun = signal('');
  private readonly document = inject(DOCUMENT);
  private focusedRun = '';
  protected readonly tabs: readonly { id: Tab; label: string; search: string; create?: string }[] =
    [
      { id: 'rules', label: 'Automações', search: 'Buscar automações', create: 'Nova automação' },
      { id: 'sets', label: 'Conjuntos', search: 'Buscar conjuntos', create: 'Novo conjunto' },
      {
        id: 'templates',
        label: 'Banco de tarefas',
        search: 'Buscar tarefas modelo',
        create: 'Nova tarefa modelo',
      },
      { id: 'runs', label: 'Execuções', search: 'Buscar execuções' },
    ];
  protected readonly section = computed(
    () => this.tabs.find((tab) => tab.id === this.tab()) ?? this.tabs[0],
  );
  protected readonly taskPriorityLabel = taskPriorityLabel;
  private readonly heading = viewChild.required<ElementRef<HTMLHeadingElement>>('heading');
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('deleteDialog');
  private readonly editorDialog = viewChild.required<ElementRef<HTMLDialogElement>>('editorDialog');
  private readonly editorHeading =
    viewChild.required<ElementRef<HTMLHeadingElement>>('editorHeading');
  private deleteTrigger: HTMLElement | null = null;
  constructor() {
    const subscription = this.route.queryParamMap.subscribe((params) => {
      const tab = params.get('aba');
      const runId = params.get('execucao') ?? '';
      const nextTab = tab === 'sets' || tab === 'templates' || tab === 'runs' ? tab : 'rules';
      if (runId || nextTab !== this.tab()) {
        this.state.search.set({ text: '' });
        this.status.set('');
        this.service.clearError();
      }
      if (this.targetRun() !== runId) this.focusedRun = '';
      this.targetRun.set(runId);
      this.tab.set(nextTab);
    });
    this.destroyRef.onDestroy(() => subscription.unsubscribe());
    afterNextRender(() => this.heading().nativeElement.focus({ preventScroll: true }));
    effect(() => {
      const id = this.targetRun();
      if (!id || this.state.loading() || this.tab() !== 'runs' || this.focusedRun === id) return;
      const exists = this.state.runs().some((run) => run.id === id);
      if (!exists) {
        this.status.set('Esta execução não está disponível.');
        return;
      }
      afterNextRender(
        () => {
          const row = this.document.getElementById(`automation-run-${id}`);
          if (!row) return;
          this.focusedRun = id;
          row.focus({ preventScroll: true });
          row.scrollIntoView({ block: 'start' });
        },
        { injector: this.injector },
      );
    });
  }
  protected open(editor: Editor, trigger: HTMLElement): void {
    if (!this.editors().length) this.status.set('');
    if (editor.kind === 'set') this.createdTemplate.set(null);
    this.service.clearError();
    this.editors.update((editors) => [...editors, { editor, trigger }]);
    afterNextRender(
      () => {
        const dialog = this.editorDialog().nativeElement;
        if (!dialog.open) dialog.showModal();
        dialog.scrollTop = 0;
        this.editorHeading().nativeElement.focus();
      },
      { injector: this.injector },
    );
  }
  protected create(trigger: HTMLElement): void {
    const tab = this.tab();
    if (tab === 'templates') this.open({ kind: 'template', record: null }, trigger);
    else if (tab === 'sets') this.open({ kind: 'set', record: null }, trigger);
    else this.open({ kind: 'rule', record: null }, trigger);
  }
  protected saveSet(set: TaskSet): void {
    if (this.editors().length > 1) this.createdSet.set(set);
    this.closeEditor(true);
  }
  protected saveTemplate(template: TaskTemplate): void {
    if (this.editors().length > 1) this.createdTemplate.set(template);
    this.closeEditor(true);
  }
  protected closeEditor(saved = false): void {
    const active = this.activeEditor();
    if (!active || this.state.saving()) return;
    this.service.clearError();
    if (this.editors().length > 1) {
      this.editors.update((editors) => editors.slice(0, -1));
      this.restoreFocus(active.trigger);
      return;
    }
    if (saved) this.status.set('Alterações salvas.');
    this.editorDialog().nativeElement.close();
  }
  protected cancelEditor(event: Event): void {
    event.preventDefault();
    this.closeEditor();
  }
  protected onEditorClosed(): void {
    const trigger = this.editors()[0]?.trigger ?? null;
    this.editors.set([]);
    this.createdSet.set(null);
    this.createdTemplate.set(null);
    this.restoreFocus(trigger);
  }
  private restoreFocus(trigger: HTMLElement | null): void {
    afterNextRender(
      () => {
        const dialogOpen = this.editorDialog().nativeElement.open;
        const fallback = dialogOpen ? this.editorHeading() : this.heading();
        const target =
          trigger?.isConnected && !trigger.matches(':disabled') ? trigger : fallback.nativeElement;
        target.focus({ preventScroll: !dialogOpen });
      },
      { injector: this.injector },
    );
  }
  protected askRemove(removal: Removal, trigger: HTMLElement): void {
    this.deleteTrigger = trigger;
    this.removal.set(removal);
    this.service.clearError();
    this.dialog().nativeElement.showModal();
  }
  protected cancelRemove(): void {
    if (!this.state.saving()) this.dialog().nativeElement.close();
  }
  protected cancelDialog(event: Event): void {
    if (this.state.saving()) event.preventDefault();
  }
  protected restoreDeleteFocus(): void {
    this.service.clearError();
    this.removal.set(null);
    this.restoreFocus(this.deleteTrigger);
    this.deleteTrigger = null;
  }
  protected async remove(): Promise<void> {
    const removal = this.removal();
    if (!removal) return;
    const result = await this.service.remove(removal.kind, removal.id, removal.version);
    if (!result || this.destroyRef.destroyed) return;
    this.status.set('Registro excluído.');
    this.dialog().nativeElement.close();
  }
  protected async disable(rule: AutomationRule): Promise<void> {
    const result = await this.service.saveRule(rule.id, rule.version, { ...rule, enabled: false });
    if (result && !this.destroyRef.destroyed)
      this.status.set('Automação desativada. As sequências iniciadas continuarão.');
  }
  protected patternName(id: string): string {
    return (
      this.state.catalog().patterns.find((item) => item.id === id)?.name ?? 'Padrão indisponível'
    );
  }
  protected setName(id: string): string {
    return this.state.sets().find((item) => item.id === id)?.name ?? 'Conjunto indisponível';
  }
  protected assignees(ids: readonly string[]): string {
    return ids
      .map(
        (id) =>
          this.state.catalog().users.find((item) => item.id === id)?.name ??
          'Responsável indisponível',
      )
      .join(', ');
  }
  protected completed(run: AutomationRun): number {
    const tasks = this.state.response()?.tasks ?? [];
    return run.steps.filter((step) =>
      tasks.some((task) => task.id === step.taskId && task.status === 'completed'),
    ).length;
  }
  protected created(run: AutomationRun): number {
    return run.steps.filter((step) => step.taskId).length;
  }
  protected runStatus(run: AutomationRun): string {
    return run.error
      ? 'Precisa de atenção'
      : this.completed(run) === run.steps.length
        ? 'Concluída'
        : 'Em andamento';
  }
  protected pendingNames(run: AutomationRun, dependencies: readonly string[]): string {
    return dependencies
      .map((id) => run.steps.find((item) => item.id === id)?.template.title ?? 'Etapa indisponível')
      .join(' + ');
  }
  protected taskStatus(id: string): string {
    const task = this.state.response()?.tasks.find((task) => task.id === id);
    return task?.status === 'completed' ? 'Concluída' : 'Criada';
  }
  protected reload(): void {
    this.service.reload();
  }
  protected async retry(id: string): Promise<void> {
    if (await this.service.retry(id))
      this.status.set('Execução retomada sem repetir tarefas já criadas.');
  }
  canLeave(): boolean {
    return (
      !this.activeEditor() ||
      (!this.state.saving() &&
        window.confirm('Sair da edição e descartar as alterações não salvas?'))
    );
  }
}
