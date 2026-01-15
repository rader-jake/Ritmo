import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { useCreateLog } from "@/hooks/use-logs";
import { useToast } from "@/hooks/use-toast";

interface EffortLoggerProps {
  goalId: number;
  existingLogs?: Map<string, number>; // date -> effort
}

export function EffortLogger({ goalId }: EffortLoggerProps) {
  const [date, setDate] = useState<Date>(new Date());
  const [effort, setEffort] = useState([3]);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  
  const createLog = useCreateLog();

  const handleLog = async () => {
    try {
      await createLog.mutateAsync({
        goalId,
        date: format(date, "yyyy-MM-dd"),
        effort: effort[0],
        note: "",
      });
      toast({
        title: "Effort logged!",
        description: `Logged level ${effort[0]} effort for ${format(date, "MMM d")}.`,
      });
      setIsOpen(false);
    } catch (error) {
      toast({
        title: "Failed to log",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2">
          <span className="w-2 h-2 rounded-full bg-primary" />
          Log Effort
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end">
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Log Activity</h4>
            <p className="text-sm text-muted-foreground">
              How much effort did you put in?
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                  initialFocus
                  disabled={(date) => date > new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Intensity</label>
              <span className="text-sm font-bold text-primary">{effort[0]}/5</span>
            </div>
            <Slider
              value={effort}
              onValueChange={setEffort}
              max={5}
              min={1}
              step={1}
              className="py-2"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground uppercase px-1">
              <span>Light</span>
              <span>Moderate</span>
              <span>Max</span>
            </div>
          </div>

          <Button 
            className="w-full mt-2 bg-primary hover:bg-primary/90" 
            onClick={handleLog}
            disabled={createLog.isPending}
          >
            {createLog.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Save Log
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
