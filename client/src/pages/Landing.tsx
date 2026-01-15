import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Heatmap } from "@/components/Heatmap";

export default function Landing() {
  const demoLogs = Array.from({ length: 300 }).map((_, i) => ({
    id: i,
    goalId: 1,
    date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    effort: Math.random() > 0.3 ? Math.floor(Math.random() * 5) + 1 : 0,
    note: "",
    createdAt: new Date(),
  })).reverse();

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      <header className="absolute top-0 w-full z-10 px-4 py-6">
        <div className="container mx-auto max-w-6xl flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <span className="font-bold text-xl tracking-tight text-[#1F2933]">Ritmo</span>
          </div>
          <a href="/api/login">
            <Button variant="ghost" className="font-medium text-[#1F2933] hover:bg-black/5">
              Log in
            </Button>
          </a>
        </div>
      </header>

      <main className="pt-32 pb-16 px-4">
        <div className="container mx-auto max-w-4xl text-center space-y-8">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-[#1F2933] leading-[1.1]">
            Consistency, <br/>
            <span className="text-primary">made visible.</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Stop tracking binary "yes/no" habits. Ritmo helps you visualize effort intensity 
            over time, creating a beautiful map of your progress.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <a href="/api/login">
              <Button size="lg" className="h-12 px-8 text-base bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 transition-all hover:scale-105">
                Start Tracking Free
              </Button>
            </a>
          </div>

          <div className="pt-16 pb-12">
            <div className="bg-white p-6 rounded-3xl shadow-xl shadow-black/5 border border-black/5 mx-auto max-w-3xl transform rotate-1 hover:rotate-0 transition-transform duration-500">
              <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-4">
                <span className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Example: Daily Reading</span>
                <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded">243 Day Streak</span>
              </div>
              <div className="overflow-hidden">
                <Heatmap logs={demoLogs} days={240} className="justify-center" />
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 pt-12 max-w-5xl mx-auto">
            <div className="text-left space-y-3">
              <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-primary mb-2">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-lg">Effort, not just streaks</h3>
              <p className="text-muted-foreground">
                Life isn't black and white. Log how much effort you actually gave, from 1 to 5.
              </p>
            </div>
            <div className="text-left space-y-3">
              <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-primary mb-2">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-lg">Visual Accountability</h3>
              <p className="text-muted-foreground">
                See your year at a glance. Identify patterns, gaps, and periods of high performance.
              </p>
            </div>
            <div className="text-left space-y-3">
              <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-primary mb-2">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-lg">Flexible Goals</h3>
              <p className="text-muted-foreground">
                Track anything: fitness, coding, reading, or meditation. Your grid adapts to you.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-8 text-center text-sm text-muted-foreground border-t border-black/5">
        <p>© 2024 Ritmo. Progress you can see.</p>
      </footer>
    </div>
  );
}
