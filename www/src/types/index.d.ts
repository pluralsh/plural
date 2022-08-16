export {}

declare global {
  interface Window {
    __WB_MANIFEST: string | PrecacheEntry;
  }
}
