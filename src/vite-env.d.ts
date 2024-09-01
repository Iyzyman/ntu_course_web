/// <reference types="vite/client" />
interface ImportMetaEnv {
  VITE_PORT: string
  // Define other environment variables here if needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
