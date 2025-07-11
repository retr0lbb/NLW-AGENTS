/** biome-ignore-all lint/suspicious/useAwait: wrong role */
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod';
import { z } from 'zod/v4';
import { db } from '../db/connection.ts';
import { schema } from '../db/schema/index.ts';

export const createRoom: FastifyPluginCallbackZod = async (app) => {
  app.post(
    '/rooms',
    {
      schema: {
        body: z.object({
          name: z.string().min(2),
          description: z.string().optional(),
        }),
      },
    },
    async (request, reply) => {
      const { name, description } = request.body;

      const result = await db
        .insert(schema.rooms)
        .values({ name, description })
        .returning();

      if (!result[0]) {
        throw new Error('Failed to create new room');
      }

      return reply.status(201).send({ room: result[0] });
    }
  );
};
