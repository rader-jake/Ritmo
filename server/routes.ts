import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Auth Setup
  await setupAuth(app);
  registerAuthRoutes(app);

  // -- Goals --

  app.get(api.goals.list.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const goals = await storage.getGoals(userId);
    res.json(goals);
  });

  app.get(api.goals.get.path, isAuthenticated, async (req: any, res) => {
    const goalId = Number(req.params.id);
    const goal = await storage.getGoal(goalId);
    
    if (!goal) return res.status(404).json({ message: "Goal not found" });
    if (goal.userId !== req.user.claims.sub) return res.status(403).json({ message: "Forbidden" });

    // Fetch logs too? The API definition had optional logs in response.
    // For now, let's just return the goal. Logs can be fetched separately or we add them.
    // Let's add them for convenience if it was in the type.
    const logs = await storage.getLogs(goalId);
    
    res.json({ ...goal, logs });
  });

  app.post(api.goals.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const input = api.goals.create.input.parse(req.body);
      const userId = req.user.claims.sub;
      const goal = await storage.createGoal({ ...input, userId });
      res.status(201).json(goal);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.put(api.goals.update.path, isAuthenticated, async (req: any, res) => {
    const goalId = Number(req.params.id);
    const existing = await storage.getGoal(goalId);
    if (!existing) return res.status(404).json({ message: "Goal not found" });
    if (existing.userId !== req.user.claims.sub) return res.status(403).json({ message: "Forbidden" });

    try {
      const input = api.goals.update.input.parse(req.body);
      const updated = await storage.updateGoal(goalId, input);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete(api.goals.delete.path, isAuthenticated, async (req: any, res) => {
    const goalId = Number(req.params.id);
    const existing = await storage.getGoal(goalId);
    if (!existing) return res.status(404).json({ message: "Goal not found" });
    if (existing.userId !== req.user.claims.sub) return res.status(403).json({ message: "Forbidden" });

    await storage.deleteGoal(goalId);
    res.status(204).send();
  });

  // -- Logs --

  app.get(api.logs.list.path, isAuthenticated, async (req: any, res) => {
    const goalId = Number(req.query.goalId);
    if (!goalId) return res.status(400).json({ message: "Goal ID required" });

    const goal = await storage.getGoal(goalId);
    if (!goal) return res.status(404).json({ message: "Goal not found" });
    if (goal.userId !== req.user.claims.sub) return res.status(403).json({ message: "Forbidden" });

    const from = req.query.from as string;
    const to = req.query.to as string;

    const logs = await storage.getLogs(goalId, from, to);
    res.json(logs);
  });

  app.post(api.logs.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const input = api.logs.create.input.parse(req.body);
      const goal = await storage.getGoal(input.goalId);
      if (!goal) return res.status(404).json({ message: "Goal not found" });
      if (goal.userId !== req.user.claims.sub) return res.status(403).json({ message: "Forbidden" });

      // Use upsert logic to handle re-logging same day
      const log = await storage.upsertLog(input);
      res.status(201).json(log);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  return httpServer;
}
