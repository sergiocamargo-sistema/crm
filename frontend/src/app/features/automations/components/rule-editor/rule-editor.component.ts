import {
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { form, FormField, maxLength, required } from '@angular/forms/signals';
import {
  flowSteps,
  type AutomationRule,
  type AutomationRuleDraft,
  type TaskSet,
} from '../../models/automation';
import { AutomationService } from '../../services/automation.service';
import { TaskSetFlowComponent } from '../task-set-flow/task-set-flow.component';

const emptyRule: AutomationRuleDraft = { name: '', patternId: '', setId: '', enabled: false };

@Component({
  selector: 'app-rule-editor',
  imports: [FormField, TaskSetFlowComponent],
  templateUrl: './rule-editor.component.html',
  styleUrl: '../../automation-editor.scss',
})
export class RuleEditorComponent {
  readonly record = input<AutomationRule | null>(null);
  readonly createdSet = input<TaskSet | null>(null);
  readonly createSet = output<HTMLElement>();
  readonly cancelled = output<void>();
  readonly saved = output<void>();
  private readonly service = inject(AutomationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly nameInput = viewChild.required<ElementRef<HTMLInputElement>>('nameInput');
  private readonly patternInput = viewChild.required<ElementRef<HTMLSelectElement>>('patternInput');
  private readonly setInput = viewChild.required<ElementRef<HTMLSelectElement>>('setInput');
  private readonly attempted = signal(false);
  protected readonly state = this.service.store;
  protected readonly draft = signal<AutomationRuleDraft>({ ...emptyRule });
  protected readonly fields = form(this.draft, (schema) => {
    required(schema.name);
    maxLength(schema.name, 120);
    required(schema.patternId);
    required(schema.setId);
  });
  protected readonly sets = computed(() => {
    const sets = this.state.sets();
    const created = this.createdSet();
    return created && !sets.some(({ id }) => id === created.id) ? [...sets, created] : sets;
  });
  protected readonly selectedSet = computed(
    () => this.sets().find(({ id }) => id === this.draft().setId) ?? null,
  );
  protected readonly preview = computed(() =>
    flowSteps(this.selectedSet(), this.state.templates(), this.state.catalog().users),
  );
  protected readonly hasOtherEnabledRule = computed(() => {
    const { enabled, patternId } = this.draft();
    return (
      enabled &&
      this.state
        .rules()
        .some(
          (rule) => rule.enabled && rule.patternId === patternId && rule.id !== this.record()?.id,
        )
    );
  });
  protected readonly errors = computed(() => {
    if (!this.attempted()) return { name: '', pattern: '', set: '' };
    const { name, patternId } = this.draft();
    return {
      name:
        !name.trim() || this.fields.name().invalid() ? 'Use um nome de até 120 caracteres.' : '',
      pattern: this.state.catalog().patterns.some(({ id }) => id === patternId)
        ? ''
        : 'Selecione um padrão de solicitação.',
      set: this.selectedSet() ? '' : 'Selecione ou crie um conjunto de tarefas.',
    };
  });

  constructor() {
    effect(() => {
      const record = this.record();
      this.fields().reset(
        record
          ? {
              name: record.name,
              patternId: record.patternId,
              setId: record.setId,
              enabled: record.enabled,
            }
          : { ...emptyRule },
      );
      this.attempted.set(false);
    });
    effect(() => {
      const created = this.createdSet();
      if (created) untracked(() => this.draft.update((draft) => ({ ...draft, setId: created.id })));
    });
  }

  protected async save(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    if (this.state.saving()) return;
    this.attempted.set(true);
    this.service.clearError();
    const { name, pattern, set } = this.errors();
    if (name || pattern || set) {
      const invalid = name ? this.nameInput() : pattern ? this.patternInput() : this.setInput();
      invalid.nativeElement.focus();
      return;
    }

    const record = this.record();
    const result = await this.service.saveRule(
      record?.id ?? null,
      record?.version ?? null,
      this.draft(),
    );
    if (result && !this.destroyRef.destroyed) this.saved.emit();
  }
}
