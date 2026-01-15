import { Link } from "wouter";
import { GoalWithLogs } from "@shared/schema";
import { Heatmap } from "./Heatmap";
import { EffortLogger } from "./EffortLogger";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GoalCardProps {
  goal: GoalWithLogs;
}

export function GoalCard({ goal }: GoalCardProps) {
  // Calculate current streak
  // This is a simplified streak calculation.
  // In a real app, you'd iterate backwards from today checking consecutive days with effort > 0
  const logs = goal.logs || [];
  
  // Sort logs by date descending
  const sortedLogs = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  // Very basic "active days" count
  const totalActiveDays = logs.filter(l => l.effort > 0).length;

  return (
    <Card className="glass-card hover:shadow-md transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold text-foreground">
          {goal.title}
        </CardTitle>
        <div className="flex items-center gap-4">
          <div className="flex items-center text-xs font-medium text-muted-foreground gap-1">
            <Flame className="h-4 w-4 text-orange-500 fill-orange-500" />
            {totalActiveDays} days
          </div>
          <EffortLogger goalId={goal.id} />
        </div>
      </CardHeader>
      <CardContent>
        {goal.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-1">{goal.description}</p>
        )}
        
        <div className="mt-2">
          <Heatmap logs={logs} days={200} className="mask-gradient-right" />
        </div>

        <div className="flex justify-end mt-4">
          <Link href={`/goals/${goal.id}`}>
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 hover:bg-primary/5 -mr-2">
              View Details <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
