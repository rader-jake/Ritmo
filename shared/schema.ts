import { pgTable, text, serial, integer, boolean, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
// Import auth tables to link them
import { users } from "./models/auth";

export * from "./models/auth";

export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), // Links to auth users.id (which is string/varchar)
  title: text("title").notNull(),
  description: text("description"),
  color: text("color").notNull().default("#0F766E"), // Default to primary color
  startDate: date("start_date").defaultNow().notNull(),
  endDate: date("end_date"),
  archived: boolean("archived").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const logs = pgTable("logs", {
  id: serial("id").primaryKey(),
  goalId: integer("goal_id").notNull(),
  date: date("date").notNull(), // YYYY-MM-DD
  effort: integer("effort").notNull(), // 0 to 10 scale usually, or 0-4
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const goalsRelations = relations(goals, ({ one, many }) => ({
  logs: many(logs),
}));

export const logsRelations = relations(logs, ({ one }) => ({
  goal: one(goals, {
    fields: [logs.goalId],
    references: [goals.id],
  }),
}));

// Schemas
export const insertGoalSchema = createInsertSchema(goals).omit({ id: true, userId: true, createdAt: true, archived: true });
export const insertLogSchema = createInsertSchema(logs).omit({ id: true, createdAt: true });

// Types
export type Goal = typeof goals.$inferSelect;
export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Log = typeof logs.$inferSelect;
export type InsertLog = z.infer<typeof insertLogSchema>;

// Request Types
export type CreateGoalRequest = InsertGoal;
export type UpdateGoalRequest = Partial<InsertGoal> & { archived?: boolean };
export type CreateLogRequest = InsertLog; // goalId, date, effort, note
export type UpdateLogRequest = Partial<InsertLog>; // effort, note mostly

// Response Types
export type GoalWithLogs = Goal & { logs: Log[] };
