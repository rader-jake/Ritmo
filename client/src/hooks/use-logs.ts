import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type CreateLogRequest, type UpdateLogRequest } from "@shared/routes";

export function useLogs(goalId: number, from?: string, to?: string) {
  return useQuery({
    queryKey: [api.logs.list.path, goalId, from, to],
    queryFn: async () => {
      // Manually construct query params since api.logs.list.path doesn't have them
      const url = new URL(api.logs.list.path, window.location.origin);
      url.searchParams.append("goalId", goalId.toString());
      if (from) url.searchParams.append("from", from);
      if (to) url.searchParams.append("to", to);

      const res = await fetch(url.toString(), { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch logs");
      return api.logs.list.responses[200].parse(await res.json());
    },
    enabled: !!goalId,
  });
}

export function useCreateLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateLogRequest) => {
      const validated = api.logs.create.input.parse(data);
      const res = await fetch(api.logs.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to log effort");
      return api.logs.create.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.logs.list.path, variables.goalId] });
      queryClient.invalidateQueries({ queryKey: [api.goals.get.path, variables.goalId] });
    },
  });
}

export function useDeleteLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, goalId }: { id: number, goalId: number }) => {
      const url = buildUrl(api.logs.delete.path, { id });
      const res = await fetch(url, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete log");
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.logs.list.path, variables.goalId] });
      queryClient.invalidateQueries({ queryKey: [api.goals.get.path, variables.goalId] });
    },
  });
}
