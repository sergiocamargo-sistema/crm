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
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { RichTextComponent } from '../../../../shared/components/rich-text/rich-text.component';
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
type Removal = { kind: 'template' | 'set' | 'rule'; id: string; version: number; name: string };

@Component({
  selector: 'app-automations',
  imports: [
    RouterLink,
    DatePipe,
    FormField,
    IconComponent,
    TaskLabelsComponent,
    RichTextComponent,
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
  private readonly router = inject(Router);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly state = this.service.store;
  protected readonly searchForm = form(this.state.search);
  protected readonly tab = signal<Tab>('rules');
  protected readonly editor = signal<Editor | null>(null);
  protected readonly removal = signal<Removal | null>(null);
  protected readonly status = signal('');
  protected readonly targetRun = signal('');
  private readonly document = inject(DOCUMENT);
  private focusedRun = '';
  protected readonly tabs: readonly { id: Tab; label: string }[] = [
    { id: 'rules', label: 'Automações' },
    { id: 'sets', label: 'Conjuntos' },
    { id: 'templates', label: 'Banco de tarefas' },
    { id: 'runs', label: 'Execuções' },
  ];
  protected readonly currentLabel = computed(
    () => this.tabs.find((tab) => tab.id === this.tab())?.label ?? 'Automações',
  );
  protected readonly taskPriorityLabel = taskPriorityLabel;
  private readonly heading = viewChild.required<ElementRef<HTMLHeadingElement>>('heading');
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('deleteDialog');
  private trigger: HTMLElement | null = null;
  private deleteTrigger: HTMLElement | null = null;
  constructor() {
    const subscription = this.route.queryParamMap.subscribe((params) => {
      const tab = params.get('aba');
      const runId = params.get('execucao') ?? '';
      this.targetRun.set(runId);
      if (runId) this.state.search.set({ text: '' });
      if (tab === 'sets' || tab === 'templates' || tab === 'runs' || tab === 'rules')
        this.tab.set(tab);
      else this.tab.set('rules');
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
  protected changeTab(tab: Tab): void {
    this.status.set('');
    this.service.clearError();
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { aba: tab },
      replaceUrl: true,
    });
  }
  protected open(editor: Editor, trigger: HTMLElement): void {
    this.trigger = trigger;
    this.service.clearError();
    this.status.set('');
    this.editor.set(editor);
  }
  protected create(trigger: HTMLElement): void {
    const tab = this.tab();
    if (tab === 'templates') this.open({ kind: 'template', record: null }, trigger);
    else if (tab === 'sets') this.open({ kind: 'set', record: null }, trigger);
    else this.open({ kind: 'rule', record: null }, trigger);
  }
  protected closeEditor(saved = false): void {
    if (this.state.saving()) return;
    this.editor.set(null);
    this.service.clearError();
    if (saved)
      this.status.set('Configuração salva. Execuções iniciadas preservam a versão original.');
    afterNextRender(
      () => {
        const target =
          this.trigger?.isConnected && !this.trigger.matches(':disabled')
            ? this.trigger
            : this.heading().nativeElement;
        target.focus({ preventScroll: true });
        this.trigger = null;
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
    (this.deleteTrigger?.isConnected ? this.deleteTrigger : this.heading().nativeElement).focus({
      preventScroll: true,
    });
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
      !this.editor() ||
      (!this.state.saving() &&
        window.confirm('Sair da edição e descartar as alterações não salvas?'))
    );
  }
}
