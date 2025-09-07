// Storage shim: prefer AsyncStorage, fallback to in-memory for Snack/web
export interface StorageLike {
  getItem(key: string): Promise<string | null> | string | null;
  setItem(key: string, value: string): Promise<void> | void;
  removeItem(key: string): Promise<void> | void;
}

class MemoryStorage implements StorageLike {
  private store = new Map<string, string>();
  async getItem(key: string) {
    return this.store.has(key) ? this.store.get(key)! : null;
  }
  async setItem(key: string, value: string) {
    this.store.set(key, value);
  }
  async removeItem(key: string) {
    this.store.delete(key);
  }
}

let impl: StorageLike;
try {

  impl = require('@react-native-async-storage/async-storage').default;
} catch (e) {
  impl = new MemoryStorage();
}

export const storage: StorageLike = impl;

