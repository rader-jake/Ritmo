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
      className="glass-card hover:shadow-md transition-all duration-300 cursor-pointer group active:scale-[0.99] overflow-hidden"
      onClick={() => setLocation(`/goals/${goal.id}`)}
    >
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
            {goal.title}
          </h3>
          <div className="flex items-center gap-3">
            <div className="flex items-center text-xs font-medium text-muted-foreground gap-1 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100">
              <Flame className="h-3 w-3 text-orange-500 fill-orange-500" />
              <span className="text-orange-700">{totalActiveDays}</span>
            </div>
            <div onClick={(e) => e.stopPropagation()}>
              <EffortLogger goalId={goal.id} />
            </div>
          </div>
        </div>
        
        <div className="relative">
          <Heatmap logs={logs} startDate={goal.startDate} className="mask-gradient-right" />
        </div>
      </CardContent>
    </Card>
  );
}
