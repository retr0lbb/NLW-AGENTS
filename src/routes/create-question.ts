/** biome-ignore-all lint/suspicious/useAwait: wrong role */
import { and, eq, sql } from 'drizzle-orm';
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod';
import z from 'zod/v4';
import { db } from '../db/connection.ts';
import { schema } from '../db/schema/index.ts';
import { generateAnswer, generateEmbeddings } from '../services/gemini.ts';

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

      const embeddings = await generateEmbeddings(question);

      const embeddingsAsString = `[${embeddings.join(',')}]`;

      const chunks = await db
        .select({
          id: schema.audioChunks.id,
          transcription: schema.audioChunks.transcription,
          similarity: sql<number>`1 - (${schema.audioChunks.embeddings} <=> ${embeddingsAsString}::vector)`,
        })
        .from(schema.audioChunks)
        .where(
          and(
            eq(schema.audioChunks.roomId, roomId),
            sql`1 - (${schema.audioChunks.embeddings} <=> ${embeddingsAsString}::vector) > 0.7`
          )
        )
        .orderBy(
          sql`${schema.audioChunks.embeddings} <=> ${embeddingsAsString}::vector`
        )
        .limit(3);

      let answer: string | null = null;

      if (chunks.length > 0) {
        const transcriptions = chunks.map((chunk) => chunk.transcription);

        answer = await generateAnswer(question, transcriptions);
      }

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
          answer,
        })
        .returning();

      return reply
        .status(200)
        .send({ questionId: createdQuestion[0].id, answer });
    }
  );
};
