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
    <div className="min-h-screen bg-[#F7F7F7] pb-20">
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#1F2933]">Your Progress</h1>
            <p className="text-muted-foreground mt-1">Track your consistency, day by day.</p>
          </div>
          <CreateGoalDialog />
        </div>

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
            {goals.map((goal) => (
              <GoalCard key={goal.id} goal={goal as any} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
