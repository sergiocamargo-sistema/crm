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
import type { InteractionChannel } from '../../../citizens/models/citizen-detail';
import {
  flowSteps,
  type AutomationInteractionType,
  type AutomationRule,
  type AutomationRuleDraft,
  type AutomationTrigger,
  type TaskSet,
} from '../../models/automation';
import { AutomationService } from '../../services/automation.service';
import { TaskSetFlowComponent } from '../task-set-flow/task-set-flow.component';

interface RuleFormValue extends Omit<AutomationRuleDraft, 'trigger'> {
  readonly triggerKind: AutomationTrigger['kind'] | '';
  readonly patternId: string;
  readonly interactionType: AutomationInteractionType | '';
  readonly channel: InteractionChannel | '';
}

const emptyRule: RuleFormValue = {
  name: '',
  triggerKind: '',
  patternId: '',
  interactionType: '',
  channel: '',
  setId: '',
  enabled: false,
};

function isRequestTrigger(kind: RuleFormValue['triggerKind']): boolean {
  return kind === 'request-created' || kind === 'request-with-pattern';
}

function triggersOverlap(a: AutomationTrigger, b: AutomationTrigger): boolean {
  if (isRequestTrigger(a.kind) !== isRequestTrigger(b.kind)) return false;
  if (a.kind === 'request-with-pattern' && b.kind === 'request-with-pattern') {
    return a.patternId === b.patternId;
  }
  if (a.kind === 'interaction-with-type' && b.kind === 'interaction-with-type') {
    return (
      a.interactionType === b.interactionType &&
      (!a.channel || !b.channel || a.channel === b.channel)
    );
  }
  return true;
}

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
  private readonly triggerInput = viewChild.required<ElementRef<HTMLSelectElement>>('triggerInput');
  private readonly patternInput = viewChild<ElementRef<HTMLSelectElement>>('patternInput');
  private readonly typeInput = viewChild<ElementRef<HTMLSelectElement>>('typeInput');
  private readonly channelInput = viewChild<ElementRef<HTMLSelectElement>>('channelInput');
  private readonly setInput = viewChild.required<ElementRef<HTMLSelectElement>>('setInput');
  private readonly attempted = signal(false);
  protected readonly state = this.service.store;
  protected readonly draft = signal<RuleFormValue>({ ...emptyRule });
  protected readonly fields = form(this.draft, (schema) => {
    required(schema.name);
    maxLength(schema.name, 120);
    required(schema.triggerKind);
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
  protected readonly isInteraction = computed(() => {
    const kind = this.draft().triggerKind;
    return kind === 'interaction-created' || kind === 'interaction-with-type';
  });
  private readonly selectedTrigger = computed<AutomationTrigger | null>(() => {
    const { triggerKind, patternId, interactionType, channel } = this.draft();
    switch (triggerKind) {
      case 'request-created':
      case 'interaction-created':
        return { kind: triggerKind };
      case 'request-with-pattern':
        return this.state.catalog().patterns.some(({ id }) => id === patternId)
          ? { kind: triggerKind, patternId }
          : null;
      case 'interaction-with-type':
        if (
          !interactionType ||
          !this.state.catalog().interactionTypes.some(({ value }) => value === interactionType)
        ) {
          return null;
        }
        if (
          interactionType === 'conversation' &&
          channel &&
          !this.state.catalog().interactionChannels.some(({ value }) => value === channel)
        ) {
          return null;
        }
        return {
          kind: triggerKind,
          interactionType,
          channel: interactionType === 'conversation' ? channel || null : null,
        };
      default:
        return null;
    }
  });
  protected readonly hasOtherEnabledRule = computed(() => {
    const trigger = this.selectedTrigger();
    return (
      this.draft().enabled &&
      !!trigger &&
      this.state
        .rules()
        .some(
          (rule) =>
            rule.enabled && rule.id !== this.record()?.id && triggersOverlap(rule.trigger, trigger),
        )
    );
  });
  protected readonly errors = computed(() => {
    const errors = { name: '', trigger: '', pattern: '', type: '', channel: '', set: '' };
    if (!this.attempted()) return errors;
    const { name, triggerKind, interactionType } = this.draft();
    if (!name.trim() || this.fields.name().invalid())
      errors.name = 'Use um nome de até 120 caracteres.';
    if (!this.selectedTrigger()) {
      switch (triggerKind) {
        case 'request-with-pattern':
          errors.pattern = 'Selecione um padrão de solicitação.';
          break;
        case 'interaction-with-type':
          if (
            this.state.catalog().interactionTypes.some(({ value }) => value === interactionType)
          ) {
            errors.channel = 'Selecione um canal de conversa válido.';
          } else {
            errors.type = 'Selecione um tipo de interação.';
          }
          break;
        default:
          errors.trigger = 'Escolha quando a automação deve rodar.';
      }
    }
    if (!this.selectedSet()) errors.set = 'Selecione ou crie um conjunto de tarefas.';
    return errors;
  });

  constructor() {
    effect(() => {
      const record = this.record();
      const trigger = record?.trigger;
      this.fields().reset(
        record
          ? {
              name: record.name,
              triggerKind: record.trigger.kind,
              patternId: trigger?.kind === 'request-with-pattern' ? trigger.patternId : '',
              interactionType:
                trigger?.kind === 'interaction-with-type' ? trigger.interactionType : '',
              channel: trigger?.kind === 'interaction-with-type' ? (trigger.channel ?? '') : '',
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
    const trigger = this.selectedTrigger();
    const { name, trigger: triggerError, pattern, type, channel, set } = this.errors();
    const invalid = [
      [name, this.nameInput],
      [triggerError, this.triggerInput],
      [pattern, this.patternInput],
      [type, this.typeInput],
      [channel, this.channelInput],
      [set, this.setInput],
    ] as const;
    if (!trigger || invalid.some(([error]) => !!error)) {
      invalid
        .find(([error]) => !!error)?.[1]()
        ?.nativeElement.focus();
      return;
    }

    const record = this.record();
    const draft = this.draft();
    const result = await this.service.saveRule(record?.id ?? null, record?.version ?? null, {
      name: draft.name,
      setId: draft.setId,
      enabled: draft.enabled,
      trigger,
    });
    if (result && !this.destroyRef.destroyed) this.saved.emit();
  }
}
