import z from 'zod';

const EnvSchema = z.object({
  PORT: z.coerce.number().default(3333),
});

export const env = EnvSchema.parse(process.env);
