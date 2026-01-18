import { useAuth } from "@/hooks/use-auth";
import { useGoals } from "@/hooks/use-goals";
import { CreateGoalDialog } from "@/components/CreateGoalDialog";
import { GoalCard } from "@/components/GoalCard";
import { Loader2 } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: goals, isLoading, error } = useGoals();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F7F7F7]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-[#F7F7F7]">
        <p className="text-destructive font-medium">Failed to load dashboard</p>
        <button onClick={() => window.location.reload()} className="text-primary hover:underline">
          Retry
        </button>
      </div>
    );
  }

  const hasGoals = goals && goals.length > 0;

  return (
    <div className="min-h-screen bg-[#F7F7F7] dashboard-bg pb-20">
      <header className="sticky top-0 z-10 border-b border-black/5 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <span className="font-semibold text-lg tracking-tight">Ritmo</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm">
              {user?.firstName?.[0] || "U"}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <section className="mb-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold text-[#1F2933] tracking-tight">
                Hello, {user?.firstName || "there"}
              </h1>
              <p className="text-muted-foreground mt-2 text-lg">
                Your consistency journey is looking great.
              </p>
            </div>
            <CreateGoalDialog />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white p-4 rounded-2xl border border-black/[0.03] shadow-sm">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Active Goals</p>
              <p className="text-2xl font-bold mt-1">{goals?.length || 0}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-black/[0.03] shadow-sm">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Consistency</p>
              <p className="text-2xl font-bold mt-1">High</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-black/[0.03] shadow-sm">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Effort</p>
              <p className="text-2xl font-bold mt-1">
                {goals?.reduce((acc, g) => acc + (g.logs?.length || 0), 0) || 0}
              </p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-black/[0.03] shadow-sm">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Streak</p>
              <p className="text-2xl font-bold mt-1">7 Days</p>
            </div>
          </div>
        </section>

        {!hasGoals ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
            <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mb-4">
              <span className="text-2xl">🌱</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">No goals yet</h3>
            <p className="text-muted-foreground mb-6 max-w-sm text-center">
              Start by creating your first goal. Whether it's reading, exercising, or learning something new.
            </p>
            <CreateGoalDialog />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {(goals || []).map((goal) => (
              <GoalCard key={goal.id} goal={goal as any} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
