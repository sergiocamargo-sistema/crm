import {
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { form, FormField } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { DomSanitizer, type SafeResourceUrl } from '@angular/platform-browser';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import {
  type LabelConfiguration,
  LABEL_FIELDS,
  type LabelField,
  type LabelFormat,
  type LabelJob,
  type LabelTemplate,
} from '../../models/label-print';
import { composeLabelRows, labelJobError, recipientAddressError } from '../../models/label-layout';
import { LabelPrintService } from '../../services/label-print.service';

interface EditorState {
  formatId: string;
  formatSearch: string;
  templateId: string;
  template: LabelTemplate;
  custom: LabelFormat;
  continuousWidth: number;
  continuousHeight: number;
  copies: number;
  startAt: number;
  offsetX: number;
  offsetY: number;
  guides: boolean;
  newField: LabelField;
}
interface Preview {
  readonly url: string;
  readonly safeUrl: SafeResourceUrl;
  readonly pages: number;
  readonly labels: number;
  readonly key: string;
}
const initialEditor = (configuration: LabelConfiguration): EditorState => ({
  formatId: configuration.defaultFormatId,
  formatSearch: '',
  templateId: configuration.defaultTemplate.id,
  template: { ...configuration.defaultTemplate, blocks: [...configuration.defaultTemplate.blocks] },
  custom: { ...configuration.customFormatDraft },
  continuousWidth: 0,
  continuousHeight: 0,
  copies: 1,
  startAt: 1,
  offsetX: 0,
  offsetY: 0,
  guides: false,
  newField: 'phone',
});
const normalizeCode = (value: string): string =>
  value.toLocaleLowerCase('pt-BR').replace(/[^\p{L}\p{N}]/gu, '');

@Component({
  imports: [FormField, RouterLink, IconComponent],
  selector: 'app-label-print',
  styleUrl: './label-print.component.scss',
  templateUrl: './label-print.component.html',
})
export class LabelPrintComponent {
  readonly municipes = input('');
  private readonly service = inject(LabelPrintService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly heading = viewChild.required<ElementRef<HTMLHeadingElement>>('pageTitle');
  private readonly pdfFrame = viewChild<ElementRef<HTMLIFrameElement>>('pdfFrame');
  protected readonly configuration = this.service.configurationStore.state;
  protected readonly model = signal<EditorState>(initialEditor(this.configuration()));
  protected readonly editorForm = form(this.model);
  protected readonly fields = LABEL_FIELDS;
  protected readonly formatChoices = computed(() => {
    const query = normalizeCode(this.model().formatSearch);
    const selected = this.model().formatId;
    return this.configuration().formats.filter(
      (format) => format.id === selected || normalizeCode(format.name).includes(query),
    );
  });
  protected readonly selectedFormat = computed(() =>
    this.configuration().formats.find((format) => format.id === this.model().formatId),
  );
  protected readonly format = computed<LabelFormat>(() => {
    const state = this.model();
    const selected = this.selectedFormat();
    if (state.formatId === 'custom' || selected?.origin === 'custom') return state.custom;
    if (!selected) return this.configuration().customFormatDraft;
    if (!selected.paperWidth || !selected.paperHeight)
      return {
        ...selected,
        paperWidth: state.continuousWidth,
        paperHeight: state.continuousHeight,
      };
    return selected;
  });
  protected readonly paperRequired = computed(
    () => !!this.selectedFormat() && !this.selectedFormat()?.paperWidth,
  );
  protected readonly isCustom = computed(
    () => this.model().formatId === 'custom' || this.selectedFormat()?.origin === 'custom',
  );
  private readonly excluded = signal<ReadonlySet<string>>(new Set());
  protected readonly preparation = this.service.observeRecipients(this.municipes).state;
  protected readonly recipients = computed(() =>
    this.preparation().recipients.filter((person) => !this.excluded().has(person.id)),
  );
  protected readonly job = computed<LabelJob>(() => {
    const state = this.model();
    return {
      recipients: this.recipients(),
      template: state.template,
      format: this.format(),
      copies: state.copies,
      startAt: state.startAt,
      offsetX: state.offsetX,
      offsetY: state.offsetY,
      guides: state.guides,
    };
  });
  private readonly generationKey = computed(() => JSON.stringify(this.job()));
  protected readonly validationError = computed(
    () =>
      this.preparation().error ||
      (!this.selectedFormat() && this.model().formatId !== 'custom'
        ? 'Selecione um formato disponível.'
        : labelJobError(this.job())),
  );
  protected readonly addressProblems = computed(() =>
    this.recipients().flatMap((person) => {
      const error = recipientAddressError(person, this.model().template);
      return error ? [{ id: person.id, name: person.name, error }] : [];
    }),
  );
  protected readonly exampleLines = computed(() => {
    const person = this.recipients()[0];
    return person ? composeLabelRows(person, this.model().template) : [];
  });
  protected readonly preview = signal<Preview | null>(null);
  protected readonly generating = signal(false);
  protected readonly failure = signal('');
  protected readonly status = signal('');
  protected readonly dimensions = [
    { key: 'paperWidth', label: 'Largura da folha (mm)' },
    { key: 'paperHeight', label: 'Altura da folha (mm)' },
    { key: 'width', label: 'Largura da etiqueta (mm)' },
    { key: 'height', label: 'Altura da etiqueta (mm)' },
    { key: 'left', label: 'Margem esquerda (mm)' },
    { key: 'top', label: 'Margem superior (mm)' },
    { key: 'gapX', label: 'Espaço horizontal (mm)' },
    { key: 'gapY', label: 'Espaço vertical (mm)' },
    { key: 'columns', label: 'Colunas' },
    { key: 'rows', label: 'Linhas' },
  ] as const;
  private alive = true;

  constructor() {
    afterNextRender(() => this.heading().nativeElement.focus({ preventScroll: true }));
    effect(() => {
      const key = this.generationKey();
      const preview = untracked(this.preview);
      this.failure.set('');
      if (preview && preview.key !== key) {
        URL.revokeObjectURL(preview.url);
        this.preview.set(null);
      }
    });
    inject(DestroyRef).onDestroy(() => {
      this.alive = false;
      const preview = this.preview();
      if (preview) URL.revokeObjectURL(preview.url);
    });
  }
  protected chooseFormat(event: Event): void {
    const id = (event.target as HTMLSelectElement).value;
    const format = this.configuration().formats.find((item) => item.id === id);
    if (format?.origin === 'custom')
      this.model.update((value) => ({ ...value, custom: { ...format }, startAt: 1 }));
    else this.model.update((value) => ({ ...value, startAt: 1 }));
  }
  protected customizeFormat(): void {
    const format = this.format();
    this.model.update((value) => ({
      ...value,
      formatId: 'custom',
      custom: {
        ...format,
        id: 'custom',
        version: 0,
        origin: 'custom',
        name: `Cópia de ${format.name}`.slice(0, 80),
        source: '',
      },
    }));
  }
  protected chooseTemplate(event: Event): void {
    const id = (event.target as HTMLSelectElement).value;
    const template = this.configuration().templates.find((item) => item.id === id);
    if (template)
      this.model.update((value) => ({
        ...value,
        template: {
          ...template,
          blocks: template.blocks.map((block) => ({
            ...block,
            joinPrevious: block.joinPrevious ?? false,
          })),
        },
      }));
  }
  protected addField(): void {
    if (this.model().template.blocks.length >= 20) return;
    this.model.update((value) => ({
      ...value,
      template: {
        ...value.template,
        blocks: [
          ...value.template.blocks,
          {
            id: crypto.randomUUID(),
            field: value.newField,
            text: '',
            bold: false,
            joinPrevious: false,
          },
        ],
      },
    }));
  }
  protected moveField(index: number, direction: number): void {
    const next = index + direction;
    const length = this.model().template.blocks.length;
    if (next < 0 || next >= length) return;
    this.model.update((value) => {
      const blocks = [...value.template.blocks];
      [blocks[index], blocks[next]] = [blocks[next], blocks[index]];
      return { ...value, template: { ...value.template, blocks } };
    });
  }
  protected removeField(id: string): void {
    this.model.update((value) => ({
      ...value,
      template: {
        ...value.template,
        blocks: value.template.blocks.filter((block) => block.id !== id),
      },
    }));
  }
  protected saveTemplate(asNew: boolean): void {
    void this.act(async () => {
      const saved = await this.service.saveTemplate(this.model().template, asNew);
      this.model.update((value) => ({ ...value, templateId: saved.id, template: saved }));
      this.status.set('Modelo salvo.');
    });
  }
  protected saveFormat(): void {
    void this.act(async () => {
      const saved = await this.service.saveFormat(this.format());
      this.model.update((value) => ({ ...value, formatId: saved.id, custom: saved }));
      this.status.set('Formato salvo.');
    });
  }
  protected exclude(id: string): void {
    this.excluded.update((values) => new Set([...values, id]));
  }
  protected restoreRecipients(): void {
    this.excluded.set(new Set());
  }
  private async act(action: () => Promise<void>): Promise<void> {
    this.failure.set('');
    this.status.set('');
    try {
      await action();
    } catch (error: unknown) {
      this.failure.set(error instanceof Error ? error.message : 'Não foi possível salvar.');
    }
  }
  protected async generate(): Promise<void> {
    if (this.validationError() || this.addressProblems().length || this.generating()) return;
    this.failure.set('');
    this.status.set('');
    this.generating.set(true);
    const job = structuredClone(this.job());
    const key = this.generationKey();
    try {
      const result = await this.service.generate(job);
      if (!this.alive || key !== this.generationKey()) return;
      const url = URL.createObjectURL(
        new Blob([new Uint8Array(result.bytes).buffer], { type: 'application/pdf' }),
      );
      const previous = this.preview();
      if (previous) URL.revokeObjectURL(previous.url);
      this.preview.set({
        url,
        safeUrl: this.sanitizer.bypassSecurityTrustResourceUrl(url),
        pages: result.pages,
        labels: result.labels,
        key,
      });
      this.status.set('PDF gerado. Confira a prévia antes de imprimir.');
    } catch (error: unknown) {
      if (this.alive)
        this.failure.set(error instanceof Error ? error.message : 'Não foi possível gerar o PDF.');
    } finally {
      if (this.alive) this.generating.set(false);
    }
  }
  protected print(): void {
    const preview = this.preview();
    if (!preview || preview.key !== this.generationKey()) return;
    try {
      const window = this.pdfFrame()?.nativeElement.contentWindow;
      if (!window) throw new Error('PDF não disponível.');
      window.focus();
      window.print();
      this.status.set('Impressão solicitada ao navegador.');
    } catch {
      this.status.set('Abra o PDF em outra aba para imprimir pelo visualizador.');
    }
  }
}
