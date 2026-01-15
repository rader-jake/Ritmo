import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertGoalSchema } from "@shared/schema";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useCreateGoal } from "@/hooks/use-goals";
import { Loader2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Extend schema for form validation if needed, or use directly
const formSchema = insertGoalSchema.pick({
  title: true,
  description: true,
  color: true,
});

type FormValues = z.infer<typeof formSchema>;

export function CreateGoalDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const createGoal = useCreateGoal();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      color: "#0F766E",
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      await createGoal.mutateAsync({
        ...data,
        startDate: new Date().toISOString().split('T')[0], // Today YYYY-MM-DD
      });
      toast({ title: "Goal created successfully!" });
      setOpen(false);
      form.reset();
    } catch (error) {
      toast({ 
        title: "Failed to create goal", 
        description: "Please try again later.",
        variant: "destructive" 
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/20">
          <Plus className="h-4 w-4" />
          New Goal
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Goal</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Goal Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Read 30 mins daily" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Why is this important to you?" 
                      className="resize-none"
                      {...field}
                      value={field.value || ""} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={createGoal.isPending} className="bg-primary hover:bg-primary/90">
                {createGoal.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Goal
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
