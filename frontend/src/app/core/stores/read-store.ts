import { effect, inject, signal, type Signal } from '@angular/core';
import { DataConnection } from '../backend/data-connection';
import { SessionContext } from '../backend/session-context';

export class ReadStore<T> {
  constructor(readonly state: Signal<T>) {}
}

/** Mantém a última consulta, descarta respostas antigas e limpa o resultado ao trocar parâmetros. */
export class RemoteReadStore<T> extends ReadStore<T> {
  readonly loading = signal(true);
  readonly error = signal('');
  constructor(load: () => Promise<T> | T, initial: T, key?: () => unknown) {
    const state = signal(initial);
    super(state.asReadonly());
    const connection = inject(DataConnection);
    const session = inject(SessionContext);
    let previousKey: string | undefined;
    let previousOwner: string | undefined;
    effect((onCleanup) => {
      connection.revision();
      const owner = session.profile()?.actor.id;
      if (!owner) {
        state.set(initial);
        this.loading.set(false);
        previousOwner = undefined;
        return;
      }
      const currentKey = JSON.stringify(key?.());
      if (owner !== previousOwner || currentKey !== previousKey) state.set(initial);
      previousOwner = owner;
      previousKey = currentKey;
      let active = true;
      this.loading.set(true);
      this.error.set('');
      connection.pending.update((value) => value + 1);
      let settled = false;
      const settle = (): void => {
        if (!settled) {
          settled = true;
          connection.pending.update((value) => Math.max(0, value - 1));
        }
      };
      onCleanup(() => {
        active = false;
        settle();
      });
      // Executar load dentro do effect registra os parâmetros signals lidos pelo service.
      let result: Promise<T>;
      try {
        result = Promise.resolve(load());
      } catch (error) {
        result = Promise.reject(error);
      }
      void result
        .then((value) => {
          if (active) state.set(value);
        })
        .catch((error: unknown) => {
          if (!active) return;
          const message =
            error instanceof Error ? error.message : 'Não foi possível carregar os dados.';
          this.error.set(message);
          connection.error.set(message);
        })
        .finally(() => {
          settle();
          if (active) this.loading.set(false);
        });
    });
  }
}
