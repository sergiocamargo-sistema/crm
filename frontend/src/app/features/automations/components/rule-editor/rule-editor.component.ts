import {
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  Injector,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { form, FormField, maxLength, required } from '@angular/forms/signals';
import { AutomationService } from '../../services/automation.service';
import { flowSteps, type AutomationRule, type AutomationRuleDraft } from '../../models/automation';
import { TaskSetFlowComponent } from '../task-set-flow/task-set-flow.component';

@Component({
  selector: 'app-rule-editor',
  imports: [FormField, TaskSetFlowComponent],
  templateUrl: './rule-editor.component.html',
  styleUrl: '../../automation-editor.scss',
})
export class RuleEditorComponent {
  readonly record = input<AutomationRule | null>(null);
  readonly cancelled = output<void>();
  readonly saved = output<void>();
  private readonly service = inject(AutomationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
  protected readonly state = this.service.store;
  protected readonly step = signal(1);
  protected readonly draft = signal<AutomationRuleDraft>({
    name: '',
    patternId: '',
    setId: '',
    enabled: false,
  });
  protected readonly fields = form(this.draft, (schema) => {
    required(schema.name);
    maxLength(schema.name, 120);
    required(schema.patternId);
    required(schema.setId);
  });
  protected readonly selectedSet = computed(
    () => this.state.sets().find((item) => item.id === this.draft().setId) ?? null,
  );
  protected readonly patternName = computed(
    () =>
      this.state.catalog().patterns.find((item) => item.id === this.draft().patternId)?.name ??
      'Selecione o padrão',
  );
  protected readonly preview = computed(() =>
    flowSteps(this.selectedSet(), this.state.templates(), this.state.catalog().users),
  );
  protected readonly otherRules = computed(() =>
    this.state
      .rules()
      .filter(
        (rule) =>
          rule.enabled &&
          rule.patternId === this.draft().patternId &&
          rule.id !== this.record()?.id,
      ),
  );
  protected readonly error = signal('');
  private readonly heading = viewChild.required<ElementRef<HTMLHeadingElement>>('heading');
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
          : { name: '', patternId: '', setId: '', enabled: false },
      );
    });
    afterNextRender(() => this.heading().nativeElement.focus({ preventScroll: true }));
  }
  protected move(step: number): void {
    this.error.set('');
    if (step > this.step()) {
      if (
        this.step() === 1 &&
        (!this.draft().name.trim() || this.fields.name().invalid() || !this.draft().patternId)
      ) {
        this.error.set('Informe um nome com até 120 caracteres e escolha o padrão de solicitação.');
        return;
      }
      if (this.step() === 2 && !this.selectedSet()) {
        this.error.set('Escolha um conjunto de tarefas para continuar.');
        return;
      }
    }
    this.step.set(step);
    afterNextRender(() => this.heading().nativeElement.focus({ preventScroll: true }), {
      injector: this.injector,
    });
  }
  protected async save(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    if (this.step() < 3) {
      this.move(this.step() + 1);
      return;
    }
    if (this.fields().invalid()) {
      this.error.set('Revise os campos das etapas anteriores.');
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
