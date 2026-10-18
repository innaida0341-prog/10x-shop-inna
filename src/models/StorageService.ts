/** The single gateway to localStorage. Values are validated with a type guard. */
export class StorageService<T> {
  constructor(
    private readonly key: string,
    private readonly guard: (x: unknown) => x is T,
  ) {}

  get(): T | null {
    try {
      const raw = localStorage.getItem(this.key);
      if (raw === null) return null;
      const parsed: unknown = JSON.parse(raw);
      return this.guard(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }

  set(value: T): void {
    try {
      localStorage.setItem(this.key, JSON.stringify(value));
    } catch {
      /* storage full or unavailable - app keeps working in memory */
    }
  }

  remove(): void {
    try {
      localStorage.removeItem(this.key);
    } catch {
      /* ignore */
    }
  }
}
