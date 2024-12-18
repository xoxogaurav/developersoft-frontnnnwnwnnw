/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CURRENCY_SYMBOL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}