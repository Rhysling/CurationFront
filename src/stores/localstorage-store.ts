import { writable } from 'svelte/store';

export const localStore = <T extends JsonValue>(key: string, initial: T) => {

  const toString = (value: T) => JSON.stringify(value, null, 2);
  const toObj = JSON.parse;

  if (localStorage.getItem(key) === null) {
    localStorage.setItem(key, toString(initial));
  }

  const saved = toObj(localStorage.getItem(key) || "");

  const { subscribe, set, update } = writable<T>(saved);

  return {
    subscribe,
    set: (value: T) => {
      localStorage.setItem(key, toString(value));
      return set(value);
    },
    update
  }
}