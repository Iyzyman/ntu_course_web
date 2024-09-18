import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(['development', 'test', 'production']),
  },
  clientPrefix: 'VITE_',
  client: {
    VITE_BETA_FLAG: z
      .string()
      /** @external https://env.t3.gg/docs/recipes#booleans */
      .transform((s) => s !== 'false' && s !== '0'),

    //#endregion  //*======== EXPERIMENTAL FLAGS ===========

    //#endregion  //*======== EXPERIMENTAL FLAGS ===========
    VITE_CLERK_PUBLISHABLE_KEY: z.string().min(1),

    VITE_TYPESENSE_HOST: z.string().min(1),
    VITE_TYPESENSE_KEY: z.string().min(1),

    VITE_HARDCOVER_HOST: z.string().min(1),

    VITE_SHELVD_PORT: z.coerce.number(),
    VITE_SHELVD_HOST: z.string().min(1),
  },
  runtimeEnv: import.meta.env,

  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
   * This is especially useful for Docker builds.
   */
  skipValidation: !!import.meta.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
})
