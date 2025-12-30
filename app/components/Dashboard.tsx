"use client";

import { Shield, Plus, BookOpen, Wrench, Users, Target, CheckCircle2, Calendar, ArrowRight, Info } from "lucide-react";
import { Mission, Task } from "@/app/types";

interface DashboardProps {
  activeMission: Mission | null;
  lifesong: { full: string; chorus: string };
  planningSchedule: { day: string; time: string };
  onTaskComplete: (index: number) => void;
  onTaskUncomplete: (index: number) => void;
  onNavigate: (view: string) => void;
  showEncouragement: boolean;
  encouragementVerse: string;
  onDismissEncouragement: () => void;
}

export function Dashboard({
  activeMission,
  lifesong,
  planningSchedule,
  onTaskComplete,
  onTaskUncomplete,
  onNavigate,
  showEncouragement,
  encouragementVerse,
  onDismissEncouragement,
}: DashboardProps) {
  const navigationItems = [
    { label: "DASH: YOU'RE HERE", view: "dashboard", icon: Shield, desc: "Mission Control" },
    { label: "RES", view: "reservoir", icon: Plus, desc: "Task/Dream/Idea Capture" },
    { label: "BIBLE", view: "bible", icon: BookOpen, desc: "Bible Study Companion: Takeaways" },
    { label: "WIZARD", view: "wizard", icon: Wrench, desc: "Weekly Planner" },
    { label: "WINGMAN", view: "wingman", icon: Users, desc: "Accountability Guidelines" },
  ];

  const allTasksCompleted = activeMission?.tasks && activeMission.tasks.every((task: Task) => task.completed);

  return (
    <div className="space-y-8">
      {/* Encouragement Message Snackbar */}
      {showEncouragement && (
        <div className="fixed inset-x-4 top-24 z-50 animate-in slide-in-from-top-4">
          <div className="bg-orange-600 border-4 border-orange-400 p-6 rounded-2xl shadow-2xl max-w-md mx-auto">
            <div className="flex items-start gap-4">
              <div className="bg-white/20 p-3 rounded-full shrink-0">
                <CheckCircle2 className="text-white" size={32} />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-black text-lg mb-2">Well Done!</h3>
                <p className="text-white/90 text-sm leading-relaxed italic">{encouragementVerse}</p>
              </div>
              <button
                onClick={onDismissEncouragement}
                className="text-white hover:text-white/70 transition shrink-0"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-xs uppercase font-black text-slate-500 tracking-widest">
            Active Mission Dashboard
            <button
              onClick={() => alert(`ACTIVE MISSION: Your focus for the next 7 days, chosen during the Sunday Wizard.`)}
              className="inline-block ml-1 text-slate-500 hover:text-orange-500 transition"
            >
              <Info size={14} />
            </button>
          </h3>
        </div>

        {/* No Active Mission State */}
        {!activeMission || !activeMission.tasks || activeMission.tasks.length === 0 ? (
          <div className="border-2 border-dashed border-slate-800 p-10 rounded-2xl text-center space-y-4">
            <p className="text-sm text-slate-500">The week is unaligned. Re-orient now.</p>
            <button
              onClick={() => onNavigate("wizard")}
              className="bg-orange-600 text-white font-black px-8 py-3 rounded-lg text-xs uppercase tracking-widest"
            >
              Start Sunday Wizard
            </button>
          </div>
        ) : allTasksCompleted ? (
          // Mission Complete Victory State
          <div className="bg-gradient-to-br from-green-900/30 to-orange-900/30 border-2 border-green-600/50 p-8 rounded-2xl text-center space-y-4">
            <div className="bg-green-600/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="text-green-400" size={32} />
            </div>
            <h3 className="text-2xl font-black text-white uppercase tracking-tight">Mission Complete!</h3>
            <p className="text-sm text-slate-300 leading-relaxed">Well done, warrior. Stay focused on your vision:</p>
            <div className="bg-black/40 border border-orange-600/30 p-6 rounded-xl my-4">
              <p className="text-2xl font-black text-orange-400 italic mb-2 uppercase tracking-tight">{lifesong.chorus}</p>
              <p className="text-xs text-slate-400 leading-relaxed">{lifesong.full}</p>
            </div>
            <div className="bg-orange-600/10 border border-orange-600/30 p-4 rounded-lg space-y-2">
              <p className="text-xs font-bold text-orange-400 uppercase tracking-wide flex items-center justify-center gap-2">
                <Calendar size={14} /> Next Planning Session
              </p>
              <p className="text-sm text-slate-300">
                Make sure you've scheduled your next weekly planning session for {planningSchedule.day} at {planningSchedule.time}.
              </p>
            </div>
            <button
              onClick={() => onNavigate("wizard")}
              className="bg-orange-600 text-white font-black px-8 py-3 rounded-lg text-xs uppercase tracking-widest mt-4"
            >
              Plan Next Week
            </button>
          </div>
        ) : (
          // Active Mission Tasks Display
          <div className="space-y-3 animate-in zoom-in-95">
            <div className="bg-orange-600 p-5 rounded-xl text-black">
              <p className="text-[10px] uppercase font-black mb-1 opacity-70">How This Aligns With Your Vision</p>
              <p className="text-base font-black leading-tight break-words">{activeMission.visionAlignment || activeMission.success}</p>
            </div>
            {activeMission.tasks.map((t: Task, i: number) => (
              <div
                key={t.id || i}
                className={`bg-slate-900 border rounded-xl overflow-hidden group ${t.completed ? "border-green-500/30 opacity-60" : "border-slate-800"}`}
              >
                <div className="flex items-center gap-4 p-4">
                  <button
                    onClick={() => (t.completed ? onTaskUncomplete(i) : onTaskComplete(i))}
                    className="shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition"
                    style={{
                      borderColor: t.completed ? "#22c55e" : "#475569",
                      backgroundColor: t.completed ? "#22c55e" : "transparent",
                    }}
                  >
                    <CheckCircle2
                      className="transition"
                      style={{ color: t.completed ? "white" : "#475569" }}
                      size={20}
                    />
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] uppercase font-bold text-orange-500 mb-1 tracking-widest">{t.pillar}</p>
                    <p className={`text-sm font-medium break-words ${t.completed ? "text-slate-500 line-through" : "text-white"}`}>
                      {t.text}
                    </p>
                    {t.completed && t.completedDate && (
                      <p className="text-[10px] text-green-500 mt-1">✓ Completed {new Date(t.completedDate).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SYSTEM NAVIGATOR GRID */}
      <div>
        <p className="text-orange-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">CORE COMPONENTS (SAME AS NAV BAR BELOW)</p>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-8">
        {navigationItems.map((item) => (
          <button
            key={item.label}
            onClick={() => onNavigate(item.view)}
            className="p-3 rounded-xl border transition-all active:scale-95 flex flex-col items-center justify-center text-center gap-1 bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700"
          >
            <div className="text-orange-500">
              <item.icon size={16} />
            </div>
            <span className="font-black text-[10px] tracking-tighter italic">{item.label}</span>
            <span className="text-[8px] uppercase font-bold opacity-60 tracking-widest">{item.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
