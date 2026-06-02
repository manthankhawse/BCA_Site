// Next.js instrumentation file - runs before the app initializes
// This polyfills browser APIs that behave differently in Node.js 22+

export async function register() {
  // Node.js v22+ has a built-in `localStorage` that requires --localstorage-file
  // but without that flag it throws on getItem/setItem. Override it with a
  // simple in-memory implementation safe for SSR.
  const store: Record<string, string> = {};
  const ssrStorage = {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = String(value); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { for (const k of Object.keys(store)) delete store[k]; },
    key: (index: number) => Object.keys(store)[index] ?? null,
    get length() { return Object.keys(store).length; },
  };

  // Override both localStorage and sessionStorage unconditionally in Node
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).localStorage = ssrStorage;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).sessionStorage = { ...ssrStorage };
}
