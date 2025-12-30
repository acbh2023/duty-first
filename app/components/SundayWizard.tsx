"use client";

import { useState } from "react";
import { ArrowRight, AlertCircle, BookOpen, Calendar, Info } from "lucide-react";
import { Task, ReservoirItem } from "@/app/types";

interface SundayWizardProps {
  wizardStep: number;
  tempSelection: ReservoirItem[];
  tempSuccess: string;
  tempEntry: { text: string; pillar: string };
  staleTaskExplanations: Record<number, string>;
  reservoir: ReservoirItem[];
  lifesong: { full: string; chorus: string };
  onStepChange: (step: number) => void;
  onSelectionChange: (selection: ReservoirItem[]) => void;
  onSuccessChange: (text: string) => void;
  onEntryChange: (entry: { text: string; pillar: string }) => void;
  onStaleExplanationChange: (explanations: Record<number, string>) => void;
  onAddNewTask: (task: ReservoirItem) => void;
  onCompleteWizard: () => void;
  getStaleTasks: () => Array<{ task: ReservoirItem; index: number }>;
}

export function SundayWizard({
  wizardStep,
  tempSelection,
  tempSuccess,
  tempEntry,
  staleTaskExplanations,
  reservoir,
  lifesong,
  onStepChange,
  onSelectionChange,
  onSuccessChange,
  onEntryChange,
  onStaleExplanationChange,
  onAddNewTask,
  onCompleteWizard,
  getStaleTasks,
}: SundayWizardProps) {
  const staleTasks = getStaleTasks();

  const FAQ = ({ title, text }: { title: string; text: string }) => (
    <button
      onClick={() => alert(`${title.toUpperCase()}: ${text}`)}
      className="inline-block ml-1 text-slate-500 hover:text-orange-500 transition"
    >
      <Info size={14} />
    </button>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black uppercase text-white italic">
        Sunday Wizard{" "}
        <FAQ
          title="Sunday Wizard"
          text="Weekly ritual to select your mission. Align every week with your vision."
        />
      </h2>

      {/* Progress bar */}
      <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
        <div
          className="bg-orange-600 h-full transition-all duration-500"
          style={{ width: `${(wizardStep / 3) * 100}%` }}
        ></div>
      </div>

      {/* Wizard Step 1: Task Alignment */}
      {wizardStep === 1 && (
        <div className="space-y-6 animate-in slide-in-from-left-4">
          <p className="text-sm font-bold text-orange-500 uppercase tracking-widest">Step 1: Alignment</p>
          <h3 className="text-xl font-black italic">Which tasks align with your Lifesong this week?</h3>
          <p className="text-sm text-slate-400 leading-relaxed px-2">
            Choose at least one Private (Soul) and one Creative (Family) task. You can also add new tasks below.
          </p>

          {/* Quick Add New Task Form */}
          <div className="bg-slate-900 border-2 border-slate-800 p-4 rounded-xl space-y-3">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Quick Add New Task</p>
            <textarea
              className="w-full bg-black border border-slate-700 p-3 rounded-lg text-sm text-white leading-relaxed resize-none"
              placeholder="New task for this week..."
              value={tempEntry.text}
              onChange={(e) => onEntryChange({ ...tempEntry, text: e.target.value })}
              rows={2}
            />
            {/* Pillar selection */}
            <div className="flex gap-2">
              {["Private", "Creative", "Home Logistical", "Dreams"].map((p) => (
                <button
                  key={p}
                  onClick={() => onEntryChange({ ...tempEntry, pillar: p })}
                  className={`flex-1 py-2 text-[9px] uppercase font-black rounded border transition ${
                    tempEntry.pillar === p
                      ? "bg-orange-600 border-orange-600 text-black"
                      : "border-slate-700 text-slate-500"
                  }`}
                >
                  {p === "Home Logistical" ? "Log" : p}
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                if (tempEntry.text) {
                  const newTask: ReservoirItem = {
                    id: Date.now(),
                    text: tempEntry.text,
                    pillar: tempEntry.pillar as any,
                    createdAt: Date.now(),
                    category: "active",
                  };
                  onAddNewTask(newTask);
                  onSelectionChange([...tempSelection, newTask]);
                  onEntryChange({ text: "", pillar: "Private" });
                }
              }}
              className="w-full bg-slate-700 text-white font-bold py-2 rounded text-xs uppercase"
            >
              Add & Select
            </button>
          </div>

          {/* Stale Tasks Warning */}
          {staleTasks.length > 0 && (
            <div className="bg-yellow-900/20 border-2 border-yellow-600 p-5 rounded-xl space-y-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="text-yellow-500 shrink-0" size={24} />
                <h4 className="text-yellow-500 font-black text-sm uppercase tracking-wide">Tasks Gathering Dust</h4>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                The following tasks have been sitting in your reservoir for 2+ weeks. Either select them this week or explain why they're still valuable to keep.
              </p>
              <div className="space-y-3">
                {staleTasks.map(({ task, index }) => (
                  <div key={task.id || index} className="bg-black/40 p-4 rounded-lg space-y-2">
                    <div>
                      <p className="text-[8px] uppercase font-bold text-slate-500">{task.pillar}</p>
                      <p className="text-sm text-white break-words">{task.text}</p>
                    </div>
                    <textarea
                      className="w-full bg-slate-900 border border-slate-700 p-3 rounded-lg text-xs text-white leading-relaxed resize-none"
                      placeholder="Why keep this? (e.g., 'Long-term dream project, waiting for right season')"
                      value={staleTaskExplanations[index] || ""}
                      onChange={(e) => onStaleExplanationChange({ ...staleTaskExplanations, [index]: e.target.value })}
                      rows={2}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* List of all reservoir tasks for selection */}
          <div className="space-y-2">
            {reservoir.map((item, i) => (
              <button
                key={item.id || i}
                onClick={() =>
                  tempSelection.includes(item)
                    ? onSelectionChange(tempSelection.filter((s) => s !== item))
                    : onSelectionChange([...tempSelection, item])
                }
                className={`w-full text-left p-4 rounded-xl border transition ${
                  tempSelection.includes(item)
                    ? "bg-orange-600/10 border-orange-600"
                    : "bg-slate-900 border-slate-800"
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <p
                    className={`text-[8px] uppercase font-bold ${
                      tempSelection.includes(item) ? "text-orange-500" : "text-slate-500"
                    }`}
                  >
                    {item.pillar}
                  </p>
                  <p className="text-[8px] font-bold text-slate-600 uppercase">
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ""}
                  </p>
                </div>
                <p className="text-sm font-bold break-words">{item.text}</p>
              </button>
            ))}
          </div>

          {/* Continue button */}
          <button
            disabled={staleTasks.length > 0}
            onClick={() => onStepChange(2)}
            className="w-full bg-orange-600 text-white font-black py-4 rounded-xl uppercase tracking-widest text-sm disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {staleTasks.length > 0 ? "Resolve Stale Tasks to Proceed" : "Continue to Mission Selection"}
          </button>
        </div>
      )}

      {/* Wizard Step 2: Align to Vision */}
      {wizardStep === 2 && (
        <div className="space-y-6 animate-in slide-in-from-right-4">
          <p className="text-sm font-bold text-orange-500 uppercase tracking-widest">Step 2: Align to Vision</p>
          <h3 className="text-xl font-black italic">How do these tasks advance your Lifesong?</h3>

          {/* Lifesong display */}
          <div className="bg-slate-900/80 border border-orange-600/30 p-5 rounded-xl mb-4">
            <p className="text-xs uppercase font-bold text-slate-500 mb-2 tracking-wide">Your Lifesong:</p>
            <p className="text-sm italic text-orange-400 font-bold">"{lifesong.chorus}"</p>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed break-words">"{lifesong.full}"</p>
          </div>

          <p className="text-sm text-slate-400 leading-relaxed px-2">
            Reflect on how each task connects to your ultimate vision. This isn't busywork—it's building your legacy.
          </p>

          {/* Display selected tasks for the week */}
          <div className="bg-black/40 border border-slate-800 p-5 rounded-xl space-y-4">
            <p className="text-xs uppercase font-black text-orange-500 tracking-wide mb-3">This Week's Mission:</p>
            {tempSelection.map((task, i) => (
              <div key={task.id || i} className="flex items-start gap-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full shrink-0 mt-1.5"></div>
                <div>
                  <p className="text-white text-sm font-medium break-words">{task.text}</p>
                  <p className="text-slate-500 text-xs mt-0.5">({task.pillar})</p>
                </div>
              </div>
            ))}
          </div>

          {/* Text area for vision alignment explanation */}
          <textarea
            className="w-full bg-black border border-slate-800 p-4 rounded-xl text-white leading-relaxed resize-none text-sm"
            placeholder="Write how these tasks connect to your Lifesong... (e.g., 'Daily prayer strengthens my spiritual foundation. Building the backyard slide creates memories and shows my kids I prioritize quality time with them.')"
            value={tempSuccess}
            onChange={(e) => onSuccessChange(e.target.value)}
            rows={5}
          />

          {/* Navigation buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => onStepChange(1)}
              className="flex-1 border border-slate-800 text-slate-500 font-bold py-4 rounded-xl uppercase tracking-widest"
            >
              Back
            </button>
            <button
              disabled={!tempSuccess}
              onClick={() => onStepChange(3)}
              className="flex-1 bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black py-4 rounded-xl uppercase tracking-widest"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Wizard Step 3: Schedule It */}
      {wizardStep === 3 && (
        <div className="space-y-6 py-6 animate-in zoom-in-95">
          <div className="flex justify-center mb-6">
            <div className="inline-block p-6 bg-orange-600/10 border-2 border-orange-500 rounded-full">
              <BookOpen className="text-orange-500" size={56} />
            </div>
          </div>

          <h3 className="text-2xl font-black uppercase italic text-center text-white">Now Schedule It</h3>

          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-4">
            <p className="text-sm text-slate-300 leading-relaxed">
              <strong className="text-orange-500">Good intentions without scheduled time windows fail.</strong>
            </p>

            <p className="text-sm text-slate-300 leading-relaxed">
              Go to your calendar app now. Look at your work calendar, your wife's calendar, and any family commitments.
            </p>

            {/* Display selected tasks for scheduling */}
            <div className="bg-black/40 p-5 rounded-xl space-y-3">
              <p className="text-xs uppercase font-black text-orange-500 tracking-wide mb-3">Block time for:</p>
              {tempSelection.map((task, i) => (
                <div key={task.id || i} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full shrink-0 mt-1.5"></div>
                  <div>
                    <p className="text-white font-medium break-words">{task.text}</p>
                    <p className="text-slate-500 text-xs mt-0.5">({task.pillar})</p>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-sm text-slate-400 leading-relaxed italic">
              Treat these time blocks like non-negotiable appointments. Your family deserves the same commitment as your meetings.
            </p>

            {/* Reminder to schedule next planning session */}
            <div className="bg-orange-600/10 border border-orange-600/30 p-5 rounded-xl mt-6">
              <div className="flex items-start gap-3">
                <Calendar className="text-orange-500 shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="text-white font-bold text-sm mb-2">Don't Forget:</p>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    Also schedule your <strong className="text-orange-500">next Sunday planning time</strong> in your calendar right now. Make this weekly ritual non-negotiable. Come back here next week to continue the process.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => onStepChange(2)}
              className="flex-1 border border-slate-800 text-slate-500 font-bold py-4 rounded-xl uppercase tracking-widest text-sm"
            >
              Back
            </button>
            <button
              onClick={onCompleteWizard}
              className="flex-1 bg-orange-600 text-white font-black py-4 rounded-xl uppercase tracking-widest text-sm"
            >
              Commit Mission
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
