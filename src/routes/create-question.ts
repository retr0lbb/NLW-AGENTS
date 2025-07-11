/** biome-ignore-all lint/suspicious/useAwait: wrong role */
import { eq } from 'drizzle-orm';
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod';
import z from 'zod/v4';
import { db } from '../db/connection.ts';
import { schema } from '../db/schema/index.ts';

export const createQuestionRoute: FastifyPluginCallbackZod = async (app) => {
  app.post(
    '/rooms/:roomId/questions',
    {
      schema: {
        params: z.object({
          roomId: z.string(),
        }),
        body: z.object({
          question: z.string().min(5),
        }),
      },
    },
    async (request, reply) => {
      const { roomId } = request.params;
      const { question } = request.body;

      const room = await db
        .select()
        .from(schema.rooms)
        .where(eq(schema.rooms.id, roomId));

      if (!room[0]) {
        return reply.status(404).send({ message: 'Room not found' });
      }

      const createdQuestion = await db
        .insert(schema.questions)
        .values({
          question,
          roomId,
        })
        .returning();

      return reply.status(200).send({ question: createdQuestion });
    }
  );
};
