import {
  afterNextRender,
  Component,
  computed,
  ElementRef,
  inject,
  Injector,
  input,
  linkedSignal,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { form, FormField, maxLength, required, submit } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { CitizenSearchComponent } from '../../../../shared/components/citizen-search/citizen-search.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { CitizenBriefComponent } from '../../components/citizen-brief/citizen-brief.component';
import { REQUEST_PRIORITIES, type RequestEditorDraft } from '../../models/request-detail';
import { RequestEditorService } from '../../services/request-editor.service';
import { RequestDetailService } from '../../services/request-detail.service';

type EditorForm = Omit<RequestEditorDraft, 'citizenId' | 'patternId'> & {
  citizenId: string;
  patternId: string;
};

function localDateTime(value: string): string {
  if (!value) return '';
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return '';
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

@Component({
  imports: [RouterLink, FormField, IconComponent, CitizenBriefComponent, CitizenSearchComponent],
  selector: 'app-request-editor',
  templateUrl: './request-editor.component.html',
  styleUrl: './request-editor.component.scss',
})
export class RequestEditorComponent {
  readonly id = input<string>();
  readonly municipe = input<string>();
  private readonly router = inject(Router);
  private readonly service = inject(RequestEditorService);
  private readonly injector = inject(Injector);
  private readonly heading = viewChild<ElementRef<HTMLElement>>('pageTitle');
  private readonly citizenPicker = viewChild(CitizenSearchComponent);
  private readonly removeCitizenButton = viewChild<ElementRef<HTMLButtonElement>>('removeCitizen');
  private readonly departmentSelect = viewChild<ElementRef<HTMLSelectElement>>('departmentSelect');
  protected readonly workspace = this.service.observeRequest(this.id).state;
  protected readonly departments = this.service.departments.state;
  protected readonly patterns = this.service.patterns.state;
  protected readonly suggestedDepartment = computed(() => {
    const draft = this.model();
    const pattern = this.patterns().find((pattern) => pattern.id === draft.patternId);
    return pattern && pattern.departmentId !== draft.departmentId
      ? this.departments().find((department) => department.id === pattern.departmentId)
      : undefined;
  });
  protected readonly priorities = REQUEST_PRIORITIES;
  protected readonly failure = signal('');
  protected readonly attempted = signal(false);
  private readonly model = linkedSignal({
    source: () => ({ id: this.id(), citizenId: this.municipe() }),
    computation: ({ citizenId }): EditorForm => {
      const workspace = untracked(this.workspace);
      return {
        citizenId: workspace ? (workspace.citizen?.id ?? '') : (citizenId ?? ''),
        title: workspace?.request.title ?? '',
        description: workspace?.request.description ?? '',
        departmentId: workspace?.extras.departmentId ?? '',
        patternId: workspace?.extras.patternId ?? '',
        dueAt: localDateTime(workspace?.request.dueAt ?? ''),
        priority: workspace?.request.priority ?? 'Normal',
        status: workspace?.request.status ?? 'pending',
      };
    },
  });
  protected readonly fields = form(this.model, (schema) => {
    required(schema.title);
    maxLength(schema.title, 120);
    required(schema.description);
    maxLength(schema.description, 5000);
  });
  private readonly automationPlans = inject(RequestDetailService).observeAutomationPlans(
    computed(() => (this.id() ? null : this.model().patternId)),
  ).state;
  protected readonly automationSummary = computed(() => {
    const plans = this.automationPlans();
    if (!plans.length) return null;
    return plans.reduce(
      (summary, plan) =>
        plan.enabled
          ? {
              initial: summary.initial + plan.initialTaskCount,
              dependent: summary.dependent + plan.dependentTaskCount,
            }
          : summary,
      { initial: 0, dependent: 0 },
    );
  });
  protected readonly citizen = this.service.observeCitizen(computed(() => this.model().citizenId))
    .state;
  protected readonly backLink = computed(() => {
    const id = this.id();
    if (id && this.workspace()) return ['/solicitacoes', id];
    const origin = this.municipe();
    return origin && !id ? ['/municipes', origin] : ['/solicitacoes'];
  });

  constructor() {
    afterNextRender(() => this.heading()?.nativeElement.focus());
  }

  protected selectCitizen(id: string): void {
    this.model.update((model) => ({ ...model, citizenId: id }));
    afterNextRender(
      () => {
        if (id) this.removeCitizenButton()?.nativeElement.focus({ preventScroll: true });
        else this.citizenPicker()?.focus();
      },
      { injector: this.injector },
    );
  }

  protected useSuggestedDepartment(): void {
    const department = this.suggestedDepartment();
    if (!department) return;
    this.model.update((model) => ({ ...model, departmentId: department.id }));
    this.departmentSelect()?.nativeElement.focus({ preventScroll: true });
  }

  protected save(event: SubmitEvent): void {
    event.preventDefault();
    this.failure.set('');
    this.attempted.set(true);
    if (this.fields().invalid()) return;
    void submit(this.fields, async () => {
      try {
        const model = this.model();
        const existingDueAt = this.workspace()?.request.dueAt ?? '';
        const id = this.service.save(this.id() ?? null, {
          ...model,
          dueAt: model.dueAt === localDateTime(existingDueAt) ? existingDueAt : model.dueAt,
          citizenId: model.citizenId || null,
          patternId: model.patternId || null,
        });
        await this.router.navigate(['/solicitacoes', id]);
      } catch (error: unknown) {
        this.failure.set(
          error instanceof Error ? error.message : 'Não foi possível salvar a solicitação.',
        );
      }
    });
  }
}
