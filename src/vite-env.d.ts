/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OPENAI_API_BASE?: string;
  readonly VITE_OPENAI_MODEL: string;
  readonly VITE_OPENAI_AVAILABLE_MODELS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
