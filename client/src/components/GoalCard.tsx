import { useLocation } from "wouter";
import { GoalWithLogs } from "@shared/schema";
import { Heatmap } from "./Heatmap";
import { EffortLogger } from "./EffortLogger";
import { Card, CardContent } from "@/components/ui/card";
import { Flame } from "lucide-react";

interface GoalCardProps {
  goal: GoalWithLogs;
}

export function GoalCard({ goal }: GoalCardProps) {
  const [, setLocation] = useLocation();
  const logs = goal.logs || [];
  const totalActiveDays = logs.filter(l => l.effort > 0).length;

  return (
    <Card 
      className="glass-card hover:shadow-xl hover:-translate-y-1 transition-all duration-500 cursor-pointer group active:scale-[0.98] overflow-hidden border-black/[0.02]"
      onClick={() => setLocation(`/goals/${goal.id}`)}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <CardContent className="p-5 sm:p-6 relative z-10">
        <div className="flex items-start justify-between mb-6">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors leading-none">
              {goal.title}
            </h3>
            {goal.description && (
              <p className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">
                {goal.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center text-[10px] font-bold text-orange-600 gap-1 bg-orange-50 px-2 py-1 rounded-lg border border-orange-100/50 uppercase tracking-tighter">
              <Flame className="h-3 w-3 fill-orange-500" />
              <span>{totalActiveDays} Days</span>
            </div>
            <div onClick={(e) => e.stopPropagation()}>
              <EffortLogger goalId={goal.id} />
            </div>
          </div>
        </div>
        
        <div className="relative mt-2">
          <Heatmap logs={logs} startDate={goal.startDate} endDate={goal.endDate} className="mask-gradient-right" interactive={false} />
        </div>
      </CardContent>
    </Card>
  );
}
