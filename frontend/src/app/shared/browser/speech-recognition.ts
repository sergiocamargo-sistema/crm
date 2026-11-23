// Minimal local types for the native API, including browsers that expose the WebKit prefix.
export interface BrowserSpeechResultEvent {
  readonly results: ArrayLike<ArrayLike<{ readonly transcript: string }>>;
}

export interface BrowserSpeechRecognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onstart: (() => void) | null;
  onaudiostart: (() => void) | null;
  onresult: ((event: BrowserSpeechResultEvent) => void) | null;
  onerror: ((event: { readonly error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  abort(): void;
}

type RecognitionConstructor = new () => BrowserSpeechRecognition;

export function speechRecognitionConstructor(
  window: Window | null,
): RecognitionConstructor | undefined {
  const browser = window as
    | (Window & {
        SpeechRecognition?: RecognitionConstructor;
        webkitSpeechRecognition?: RecognitionConstructor;
      })
    | null;
  return browser?.SpeechRecognition ?? browser?.webkitSpeechRecognition;
}
