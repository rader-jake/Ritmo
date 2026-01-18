import { useMemo } from "react";
import { Log } from "@shared/schema";
import { format, subDays, eachDayOfInterval, isSameDay, startOfToday, getDay } from "date-fns";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface HeatmapProps {
  logs: Log[];
  startDate?: string | Date;
  endDate?: string | Date | null;
  className?: string;
}

export function Heatmap({ logs, startDate: customStartDate, endDate: customEndDate, className }: HeatmapProps) {
  const today = startOfToday();
  const startDate = useMemo(() => {
    if (customStartDate) {
      const date = new Date(customStartDate);
      // Ensure we don't start in the future or something weird
      return date > today ? today : date;
    }
    return subDays(today, 365);
  }, [customStartDate, today]);

  const endDate = useMemo(() => {
    if (customEndDate) {
      return new Date(customEndDate);
    }
    return today;
  }, [customEndDate, today]);
  
  // Generate all dates in the range
  const dates = useMemo(() => {
    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [startDate, endDate]);

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
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ 
                      delay: weekIndex * 0.02 + dayIndex * 0.005,
                      duration: 0.2,
                      ease: "easeOut"
                    }}
                    className={cn(
                      "w-3 h-3 rounded-[3px] transition-all duration-300 cursor-default border border-black/[0.03]", 
                      getColor(effort),
                      effort > 0 && "shadow-[inset_0_-1px_0_rgba(0,0,0,0.1)] hover:scale-110"
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
