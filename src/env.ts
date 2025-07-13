import z from 'zod';

const EnvSchema = z.object({
  PORT: z.coerce.number().default(3333),
  DATABASE_URL: z.string().nonempty(),
  GEMINI_KEY: z.string(),
});

export const env = EnvSchema.parse(process.env);
