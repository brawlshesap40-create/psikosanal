import Fastify, { type FastifyServerOptions } from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import websocket from "@fastify/websocket";
import { corsOrigins, env } from "./env";
import authPlugin from "./plugins/auth";
import errorHandlerPlugin from "./plugins/error-handler";
import healthRoutes from "./routes/health";
import authRoutes from "./routes/auth";
import notificationsRoutes from "./routes/notifications";
import favoritesRoutes from "./routes/favorites";
import waitlistRoutes from "./routes/waitlist";
import availabilityRoutes from "./routes/availability";
import packagesRoutes from "./routes/packages";
import conversationsRoutes from "./routes/conversations";
import reviewsRoutes from "./routes/reviews";
import psychologistsRoutes from "./routes/psychologists";
import appointmentsRoutes from "./routes/appointments";
import paymentsRoutes from "./routes/payments";
import videoSignalingRoutes from "./routes/video-signaling";

export function buildServer(opts: FastifyServerOptions = {}) {
  const app = Fastify({
    logger: opts.logger ?? { level: env.NODE_ENV === "test" ? "silent" : "info" },
    ...opts,
  });

  app.register(cors, { origin: corsOrigins });
  app.register(websocket);
  app.register(errorHandlerPlugin);
  app.register(authPlugin);
  app.register(healthRoutes);
  app.register(videoSignalingRoutes);
  app.register(notificationsRoutes);
  app.register(favoritesRoutes);
  app.register(waitlistRoutes);
  app.register(availabilityRoutes);
  app.register(packagesRoutes);
  app.register(conversationsRoutes);
  app.register(reviewsRoutes);
  app.register(psychologistsRoutes);
  app.register(appointmentsRoutes);
  app.register(paymentsRoutes);

  app.register(async (scoped) => {
    await scoped.register(rateLimit, {
      max: env.RATE_LIMIT_MAX,
      timeWindow: env.RATE_LIMIT_WINDOW,
    });
    await scoped.register(authRoutes);
  });

  return app;
}
