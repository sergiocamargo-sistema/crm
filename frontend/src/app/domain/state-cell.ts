/** Estado de domínio independente de Angular, Firebase e do meio de persistência. */
export interface StateCell<T> {
  (): T;
  set(value: T): void;
  update(update: (value: T) => T): void;
}

export type StateFactory = <T>(initial: T) => StateCell<T>;

export const createState: StateFactory = <T>(initial: T): StateCell<T> => {
  let value = initial;
  const read = (): T => value;
  read.set = (next: T): void => {
    value = next;
  };
  read.update = (update: (current: T) => T): void => {
    value = update(value);
  };
  return read;
};
