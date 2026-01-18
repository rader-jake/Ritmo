import { db } from "./db";
import { goals, logs, type InsertGoal, type InsertLog, type UpdateGoalRequest, type UpdateLogRequest } from "@shared/schema";
import { eq, and, desc, gte, lte } from "drizzle-orm";
import { authStorage, type IAuthStorage } from "./replit_integrations/auth/storage";

export interface IStorage extends IAuthStorage {
  // Goals
  getGoals(userId: string): Promise<typeof goals.$inferSelect[]>;
  getGoal(id: number): Promise<typeof goals.$inferSelect | undefined>;
  createGoal(goal: InsertGoal & { userId: string }): Promise<typeof goals.$inferSelect>;
  updateGoal(id: number, updates: UpdateGoalRequest): Promise<typeof goals.$inferSelect>;
  deleteGoal(id: number): Promise<void>;

  // Logs
  getLogs(goalId: number, from?: string, to?: string): Promise<typeof logs.$inferSelect[]>;
  createLog(log: InsertLog): Promise<typeof logs.$inferSelect>;
  updateLog(id: number, updates: UpdateLogRequest): Promise<typeof logs.$inferSelect>;
  deleteLog(id: number): Promise<void>;
  
  // Upsert log helper (often used in these apps to overwrite day)
  upsertLog(log: InsertLog): Promise<typeof logs.$inferSelect>;
}

export class DatabaseStorage implements IStorage {
  // Auth methods delegated to authStorage
  getUser = authStorage.getUser;
  upsertUser = authStorage.upsertUser;

  // Goals
  async getGoals(userId: string) {
    const results = await db.query.goals.findMany({
      where: and(eq(goals.userId, userId), eq(goals.archived, false)),
      with: {
        logs: true,
      },
      orderBy: [desc(goals.createdAt)],
    });
    return results;
  }

  async getGoal(id: number) {
    const [goal] = await db.select().from(goals).where(eq(goals.id, id));
    return goal;
  }

  async createGoal(goal: InsertGoal & { userId: string }) {
    const [newGoal] = await db.insert(goals).values(goal).returning();
    return newGoal;
  }

  async updateGoal(id: number, updates: UpdateGoalRequest) {
    const [updated] = await db.update(goals).set(updates).where(eq(goals.id, id)).returning();
    return updated;
  }

  async deleteGoal(id: number) {
    // Soft delete usually preferred for goals, but API said delete. 
    // Schema has 'archived', so maybe we just set archived?
    // Let's actually delete for now to match the 'delete' route, or user can use update to archive.
    await db.delete(goals).where(eq(goals.id, id));
  }

  // Logs
  async getLogs(goalId: number, from?: string, to?: string) {
    let where = eq(logs.goalId, goalId);
    
    if (from && to) {
      return await db.select().from(logs).where(and(where, gte(logs.date, from), lte(logs.date, to))).orderBy(desc(logs.date));
    } else if (from) {
      return await db.select().from(logs).where(and(where, gte(logs.date, from))).orderBy(desc(logs.date));
    } else if (to) {
      return await db.select().from(logs).where(and(where, lte(logs.date, to))).orderBy(desc(logs.date));
    }
    
    return await db.select().from(logs).where(where).orderBy(desc(logs.date));
  }

  async createLog(log: InsertLog) {
    const [newLog] = await db.insert(logs).values(log).returning();
    return newLog;
  }

  async updateLog(id: number, updates: UpdateLogRequest) {
    const [updated] = await db.update(logs).set(updates).where(eq(logs.id, id)).returning();
    return updated;
  }

  async deleteLog(id: number) {
    await db.delete(logs).where(eq(logs.id, id));
  }

  async upsertLog(log: InsertLog) {
    // Check if log exists for this goal and date
    const [existing] = await db.select().from(logs).where(and(eq(logs.goalId, log.goalId), eq(logs.date, log.date)));
    
    if (existing) {
      const [updated] = await db.update(logs).set(log).where(eq(logs.id, existing.id)).returning();
      return updated;
    } else {
      const [newLog] = await db.insert(logs).values(log).returning();
      return newLog;
    }
  }
}

export const storage = new DatabaseStorage();
