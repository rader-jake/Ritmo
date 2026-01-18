import { useRoute } from "wouter";
import { useGoal, useUpdateGoal, useDeleteGoal } from "@/hooks/use-goals";
import { Heatmap } from "@/components/Heatmap";
import { EffortLogger } from "@/components/EffortLogger";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Trash2, Archive, Calendar as CalendarIcon } from "lucide-react";
import { Link, useLocation } from "wouter";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

export default function GoalDetails() {
  const [, params] = useRoute("/goals/:id");
  const id = parseInt(params?.id || "0");
  const [, setLocation] = useLocation();
  
  const { data: goal, isLoading, error } = useGoal(id);
  const deleteGoal = useDeleteGoal();
  const updateGoal = useUpdateGoal();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F7F7F7]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !goal) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F7F7F7]">
        <p>Goal not found</p>
      </div>
    );
  }

  const handleDelete = async () => {
    await deleteGoal.mutateAsync(id);
    setLocation("/");
  };

  const handleArchive = async () => {
    await updateGoal.mutateAsync({ id, archived: !goal.archived });
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      <header className="sticky top-0 z-10 border-b border-black/5 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="hover:bg-black/5">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <span className="font-semibold text-lg tracking-tight truncate max-w-[200px] sm:max-w-md">
              {goal.title}
            </span>
          </div>
          <EffortLogger goalId={goal.id} />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid gap-8">
          {/* Stats Section */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/5">
              <p className="text-sm text-muted-foreground uppercase tracking-wide font-medium">Total Entries</p>
              <p className="text-3xl font-bold mt-2 text-[#1F2933]">
                {goal.logs?.length || 0}
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/5">
              <p className="text-sm text-muted-foreground uppercase tracking-wide font-medium">Started</p>
              <p className="text-3xl font-bold mt-2 text-[#1F2933]">
                {format(new Date(goal.startDate), "MMM d")}
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/5">
              <p className="text-sm text-muted-foreground uppercase tracking-wide font-medium">Ends</p>
              <p className="text-3xl font-bold mt-2 text-[#1F2933]">
                {goal.endDate ? format(new Date(goal.endDate), "MMM d") : "None"}
              </p>
            </div>
          </section>

          {/* Heatmap Section */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-black/5">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                Yearly Overview
              </h2>
            </div>
            
            <div className="w-full overflow-x-auto pb-4">
              <Heatmap logs={goal.logs || []} startDate={goal.startDate} endDate={goal.endDate} className="min-w-[600px]" />
            </div>

            <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground justify-end">
              <span>Less</span>
              <div className="flex gap-1">
                <div className="w-3 h-3 bg-gray-100 rounded-[2px]" />
                <div className="w-3 h-3 bg-[#ccfbf1] rounded-[2px]" />
                <div className="w-3 h-3 bg-[#99f6e4] rounded-[2px]" />
                <div className="w-3 h-3 bg-[#5eead4] rounded-[2px]" />
                <div className="w-3 h-3 bg-[#2dd4bf] rounded-[2px]" />
                <div className="w-3 h-3 bg-[#0f766e] rounded-[2px]" />
              </div>
              <span>More</span>
            </div>
          </section>

          {/* Description Section */}
          {goal.description && (
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-black/5">
              <h3 className="text-lg font-semibold mb-2">About this goal</h3>
              <p className="text-muted-foreground leading-relaxed">
                {goal.description}
              </p>
            </section>
          )}

          {/* Actions */}
          <section className="flex justify-end gap-4 pt-8 border-t border-black/5">
            <Button 
              variant="outline" 
              onClick={handleArchive} 
              disabled={updateGoal.isPending}
              className="text-muted-foreground hover:text-foreground"
            >
              <Archive className="h-4 w-4 mr-2" />
              {goal.archived ? "Unarchive" : "Archive"}
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border-none shadow-none">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Goal
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your goal
                    and all associated progress logs.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </section>
        </div>
      </main>
    </div>
  );
}
