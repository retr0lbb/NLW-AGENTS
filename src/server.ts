import { fastifyCors } from '@fastify/cors';
import { fastify } from 'fastify';
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { env } from './env.js';
import { createQuestionRoute } from './routes/create-question.ts';
import { createRoom } from './routes/create-room.ts';
import { getRoomQuestionsRoute } from './routes/get-room-questions.ts';
import { getRoomsRoute } from './routes/get-rooms.ts';

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.register(fastifyCors, {
  origin: '*',
});

app.setSerializerCompiler(serializerCompiler);
app.setValidatorCompiler(validatorCompiler);

app.get('/health', () => {
  return 'Ok';
});

app.register(getRoomsRoute);
app.register(createRoom);
app.register(getRoomQuestionsRoute);
app.register(createQuestionRoute);

app.listen({ port: process.env.PORT ? Number(env.PORT) : 3333 }).then(() => {
  // biome-ignore lint/suspicious/noConsole: Just for testing
  console.log(`Http server Running on port ${env.PORT}`);
});
