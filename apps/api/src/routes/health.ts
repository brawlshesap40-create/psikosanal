import type { FastifyInstance } from "fastify";
import { sql } from "drizzle-orm";
import { db } from "@psikosanal/db";

export default async function healthRoutes(app: FastifyInstance) {
  app.get("/health", async (_request, reply) => {
    let dbOk = true;
    try {
      await db.execute(sql`select 1`);
    } catch {
      dbOk = false;
    }

    const status = dbOk ? "ok" : "degraded";
    return reply.status(dbOk ? 200 : 503).send({
      status,
      uptime: process.uptime(),
      db: dbOk ? "ok" : "unreachable",
    });
  });
}
