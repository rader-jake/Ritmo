import { useMemo } from "react";
import { Log } from "@shared/schema";
import { format, subDays, eachDayOfInterval, isSameDay, startOfToday, getDay } from "date-fns";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface HeatmapProps {
  logs: Log[];
  days?: number;
  className?: string;
}

export function Heatmap({ logs, days = 365, className }: HeatmapProps) {
  const today = startOfToday();
  const startDate = subDays(today, days);
  
  // Generate all dates in the range
  const dates = useMemo(() => {
    return eachDayOfInterval({ start: startDate, end: today });
  }, [startDate, today]);

  // Create a map for fast lookup
  const logsMap = useMemo(() => {
    const map = new Map<string, number>();
    logs.forEach(log => {
      // date string from DB might be YYYY-MM-DD
      map.set(log.date.toString(), log.effort);
    });
    return map;
  }, [logs]);

  // Determine color based on effort
  const getColor = (effort: number) => {
    if (effort === 0) return "bg-gray-100 hover:bg-gray-200"; // Empty
    if (effort === 1) return "bg-[#ccfbf1]"; // Teal 100
    if (effort === 2) return "bg-[#99f6e4]"; // Teal 200
    if (effort === 3) return "bg-[#5eead4]"; // Teal 300
    if (effort === 4) return "bg-[#2dd4bf]"; // Teal 400
    if (effort >= 5) return "bg-[#0f766e]"; // Teal 800 (Primary)
    return "bg-gray-100";
  };

  // Group by weeks for the grid layout
  // We want columns of weeks, rows of days (Sun-Sat)
  const weeks = useMemo(() => {
    const weeksArray: Date[][] = [];
    let currentWeek: Date[] = [];
    
    // Pad the beginning if startDate isn't a Sunday
    const startDay = getDay(startDate);
    for (let i = 0; i < startDay; i++) {
      currentWeek.push(null as any); // Empty placeholder
    }

    dates.forEach((date) => {
      currentWeek.push(date);
      if (currentWeek.length === 7) {
        weeksArray.push(currentWeek);
        currentWeek = [];
      }
    });

    if (currentWeek.length > 0) {
      weeksArray.push(currentWeek);
    }

    return weeksArray;
  }, [dates, startDate]);

  return (
    <div className={cn("flex gap-1 overflow-x-auto pb-2 hide-scrollbar", className)}>
      {weeks.map((week, weekIndex) => (
        <div key={weekIndex} className="flex flex-col gap-1">
          {week.map((date, dayIndex) => {
            if (!date) return <div key={`empty-${weekIndex}-${dayIndex}`} className="w-3 h-3" />;
            
            const dateStr = format(date, "yyyy-MM-dd");
            const effort = logsMap.get(dateStr) || 0;
            
            return (
              <Tooltip key={dateStr}>
                <TooltipTrigger asChild>
                  <div 
                    className={cn(
                      "w-3 h-3 rounded-[2px] transition-colors cursor-default", 
                      getColor(effort)
                    )} 
                  />
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  <p className="font-medium">{format(date, "MMM d, yyyy")}</p>
                  <p className="text-muted-foreground">Effort: {effort}/5</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      ))}
    </div>
  );
}
