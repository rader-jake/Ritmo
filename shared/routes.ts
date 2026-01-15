import { z } from "zod";
import { insertGoalSchema, insertLogSchema, goals, logs } from "./schema";

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  goals: {
    list: {
      method: "GET" as const,
      path: "/api/goals",
      responses: {
        200: z.array(z.custom<typeof goals.$inferSelect>()),
      },
    },
    get: {
      method: "GET" as const,
      path: "/api/goals/:id",
      responses: {
        200: z.custom<typeof goals.$inferSelect & { logs?: typeof logs.$inferSelect[] }>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/goals",
      input: insertGoalSchema,
      responses: {
        201: z.custom<typeof goals.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: "PUT" as const,
      path: "/api/goals/:id",
      input: insertGoalSchema.partial().extend({ archived: z.boolean().optional() }),
      responses: {
        200: z.custom<typeof goals.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: "DELETE" as const,
      path: "/api/goals/:id",
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  logs: {
    list: {
      method: "GET" as const,
      path: "/api/logs", // ?goalId=1&from=2023-01-01&to=2023-12-31
      input: z.object({
        goalId: z.coerce.number(),
        from: z.string().optional(),
        to: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof logs.$inferSelect>()),
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/logs",
      input: insertLogSchema,
      responses: {
        201: z.custom<typeof logs.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    // We can handle updates via create if we check existence, or separate endpoint.
    // Let's add explicit update for specific log ID if needed, but usually users log by date.
    // For simplicity, let's assume the frontend sends the log ID if updating, or we use a "log entry" endpoint that upserts by date+goal.
    // But sticking to standard CRUD for now.
    update: {
      method: "PUT" as const,
      path: "/api/logs/:id",
      input: insertLogSchema.partial(),
      responses: {
        200: z.custom<typeof logs.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: "DELETE" as const,
      path: "/api/logs/:id",
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
