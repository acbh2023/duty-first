"use client";

import { CheckCircle2, Calendar } from "lucide-react";

interface MissionCompleteProps {
  lifesong: { full: string; chorus: string };
  planningSchedule: { day: string; time: string };
  onPlanNextWeek: () => void;
}

/**
 * Reusable victory/mission complete component
 * Displayed when all tasks in active mission are completed
 */
export function MissionComplete({
  lifesong,
  planningSchedule,
  onPlanNextWeek,
}: MissionCompleteProps) {
  return (
    <div className="bg-gradient-to-br from-green-900/30 to-orange-900/30 border-2 border-green-600/50 p-8 rounded-2xl text-center space-y-4">
      <div className="bg-green-600/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2">
        <CheckCircle2 className="text-green-400" size={32} />
      </div>
      <h3 className="text-2xl font-black text-white uppercase tracking-tight">Mission Complete!</h3>
      <p className="text-sm text-slate-300 leading-relaxed">Well done, warrior. Stay focused on your vision:</p>
      
      <div className="bg-black/40 border border-orange-600/30 p-6 rounded-xl my-4">
        <p className="text-2xl font-black text-orange-400 italic mb-2 uppercase tracking-tight">
          {lifesong.chorus}
        </p>
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
        onClick={onPlanNextWeek}
        className="bg-orange-600 text-white font-black px-8 py-3 rounded-lg text-xs uppercase tracking-widest mt-4"
      >
        Plan Next Week
      </button>
    </div>
  );
}
