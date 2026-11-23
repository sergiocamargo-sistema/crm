import {
  DestroyRef,
  Directive,
  DOCUMENT,
  ElementRef,
  inject,
  input,
  isDevMode,
  signal,
} from '@angular/core';
import {
  speechRecognitionConstructor,
  type BrowserSpeechRecognition,
  type BrowserSpeechResultEvent,
} from '../browser/speech-recognition';

@Directive({
  selector: 'textarea[appSpeechToText]',
  exportAs: 'speechToText',
  host: {
    '(beforeinput)': 'stopForEditing()',
    '(input)': 'onInput()',
    '(pointerdown)': 'stopForEditing()',
    '(document:visibilitychange)': 'onVisibilityChange()',
  },
})
export class SpeechToTextDirective {
  readonly speechLanguage = input('pt-BR');
  private readonly document = inject(DOCUMENT);
  private readonly textarea = inject<ElementRef<HTMLTextAreaElement>>(ElementRef).nativeElement;
  private readonly createRecognition = speechRecognitionConstructor(this.document.defaultView);
  readonly supported = !!this.createRecognition && !!this.document.defaultView?.isSecureContext;
  private readonly activeState = signal(false);
  private readonly statusState = signal(
    this.supported
      ? ''
      : this.createRecognition
        ? 'Abra o site por HTTPS ou localhost para usar o microfone.'
        : 'Ditado indisponível neste navegador. Você pode digitar normalmente.',
  );
  readonly active = this.activeState.asReadonly();
  readonly status = this.statusState.asReadonly();
  private recognition: BrowserSpeechRecognition | null = null;
  private prefix = '';
  private suffix = '';
  private initialValue = '';
  private lastValue = '';
  private writing = false;
  private captureStarted = false;

  constructor() {
    const onDialogClose = (): void => this.stop();
    const dialog = this.textarea.closest('dialog');
    dialog?.addEventListener('close', onDialogClose);
    inject(DestroyRef).onDestroy(() => {
      this.stop();
      dialog?.removeEventListener('close', onDialogClose);
    });
  }

  unavailable(): boolean {
    return !this.supported || this.textarea.disabled || this.textarea.readOnly;
  }

  toggle(): void {
    if (this.active()) this.stop();
    else this.start();
  }

  reset(): void {
    this.stop();
    if (this.supported) this.statusState.set('');
  }

  stop(message = 'Ditado encerrado. Você pode revisar o texto.'): void {
    const recognition = this.recognition;
    if (!recognition) return;
    this.release(recognition);
    try {
      recognition.abort();
    } catch {
      // Some engines have already ended when the dialog closes.
    }
    this.statusState.set(message);
  }

  protected stopForEditing(): void {
    this.stop('Ditado pausado para você editar o texto.');
  }

  protected onInput(): void {
    if (!this.writing) this.stopForEditing();
  }

  protected onVisibilityChange(): void {
    if (this.document.hidden) this.stop();
  }

  private start(): void {
    if (this.unavailable() || !this.createRecognition || this.active()) return;
    this.captureStarted = false;
    this.initialValue = this.textarea.value;
    this.lastValue = this.initialValue;
    this.prefix = this.initialValue.slice(0, this.textarea.selectionStart);
    this.suffix = this.initialValue.slice(this.textarea.selectionEnd);
    if (
      this.textarea.maxLength >= 0 &&
      this.prefix.length + this.suffix.length >= this.textarea.maxLength
    ) {
      this.statusState.set('O campo atingiu o limite de caracteres.');
      return;
    }
    try {
      const recognition = new this.createRecognition();
      this.recognition = recognition;
      recognition.lang = this.speechLanguage();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.onstart = () => {
        if (this.recognition === recognition && !this.captureStarted)
          this.statusState.set('Preparando reconhecimento de voz…');
      };
      recognition.onaudiostart = () => {
        if (this.recognition !== recognition) return;
        this.captureStarted = true;
        this.statusState.set('Ouvindo… Fale para preencher o texto.');
      };
      recognition.onresult = (event) => {
        if (this.recognition === recognition) this.writeResult(event);
      };
      recognition.onerror = ({ error }) => {
        if (this.recognition !== recognition) return;
        if (isDevMode())
          console.warn('[Ditado] Falha:', error, '| Captura iniciada:', this.captureStarted);
        this.stop(this.errorMessage(error));
      };
      recognition.onend = () => {
        if (this.recognition !== recognition) return;
        this.release(recognition);
        this.statusState.set(
          !this.captureStarted
            ? 'O navegador encerrou o ditado antes de capturar áudio. Tente novamente.'
            : this.lastValue === this.initialValue
              ? 'Nenhuma fala reconhecida. Toque no microfone para tentar novamente.'
              : 'Ditado encerrado. Você pode revisar o texto.',
        );
      };
      this.activeState.set(true);
      this.statusState.set('Ativando microfone…');
      recognition.start();
    } catch {
      this.stop('Não foi possível iniciar o microfone. Tente novamente.');
      this.statusState.set('Não foi possível iniciar o microfone. Tente novamente.');
    }
  }

  private writeResult(event: BrowserSpeechResultEvent): void {
    if (
      this.textarea.value !== this.lastValue ||
      this.textarea.disabled ||
      this.textarea.readOnly
    ) {
      this.stopForEditing();
      return;
    }
    // Each event contains the session's complete result list, including revised interim text.
    const transcript = Array.from(event.results, (result) => result[0]?.transcript ?? '')
      .join(' ')
      .trim();
    const leftSpace =
      transcript && this.prefix && !/\s$/.test(this.prefix) && !/^[,.;:!?]/.test(transcript)
        ? ' '
        : '';
    const rightSpace = transcript && this.suffix && !/^[\s,.;:!?]/.test(this.suffix) ? ' ' : '';
    const available =
      this.textarea.maxLength < 0
        ? Infinity
        : Math.max(0, this.textarea.maxLength - this.prefix.length - this.suffix.length);
    const candidate = leftSpace + transcript + rightSpace;
    const inserted = candidate.slice(0, available);
    const value = transcript ? this.prefix + inserted + this.suffix : this.initialValue;
    this.lastValue = value;
    this.textarea.value = value;
    const caret = transcript ? this.prefix.length + inserted.length : this.textarea.selectionStart;
    this.textarea.setSelectionRange(caret, caret);
    this.writing = true;
    try {
      // Keep native controls and Angular Signal Forms synchronized without a second text model.
      const EventConstructor = this.document.defaultView?.Event;
      if (EventConstructor)
        this.textarea.dispatchEvent(new EventConstructor('input', { bubbles: true }));
    } finally {
      this.writing = false;
    }
    if (candidate.length > available)
      this.stop('O campo atingiu o limite de caracteres. Revise o texto.');
  }

  private release(recognition: BrowserSpeechRecognition): void {
    recognition.onstart = null;
    recognition.onaudiostart = null;
    recognition.onresult = null;
    recognition.onerror = null;
    recognition.onend = null;
    this.recognition = null;
    this.activeState.set(false);
  }

  private errorMessage(error: string): string {
    switch (error) {
      case 'not-allowed':
        return 'O navegador bloqueou o ditado. Confira as permissões de microfone e de reconhecimento de voz.';
      case 'service-not-allowed':
        return 'O serviço de ditado não está disponível neste navegador, mesmo com o microfone permitido.';
      case 'audio-capture':
        return 'A captura de áudio falhou. Confira o microfone selecionado no navegador e nas configurações de som.';
      case 'network':
        return 'O serviço de ditado está indisponível. Verifique sua conexão e tente novamente.';
      case 'no-speech':
        return 'Nenhuma fala reconhecida. Toque no microfone para tentar novamente.';
      case 'language-not-supported':
        return 'O navegador não oferece ditado nesse idioma.';
      default:
        return 'O ditado foi interrompido. Você pode continuar digitando ou tentar novamente.';
    }
  }
}
