"use client";

import { useState, useRef } from "react";
import { Download, Trash2, Plus, CheckCircle2, Circle, Info } from "lucide-react";
import { ReservoirItem, CompletedTask } from "@/app/types";

interface ReservoirProps {
  reservoir: ReservoirItem[];
  completedTasks: CompletedTask[];
  onAddTask: (task: ReservoirItem) => void;
  onDeleteTask: (index: number) => void;
  onTaskComplete: (itemId: number, item: ReservoirItem) => void;
  onTaskUncomplete: (itemId: number) => void;
  onDeleteCompleted: (index: number) => void;
  onMoveBackToReservoir: (item: CompletedTask, index: number) => void;
  moveTimeoutsRef: React.MutableRefObject<Record<number, number | null>>;
}

export function Reservoir({
  reservoir,
  completedTasks,
  onAddTask,
  onDeleteTask,
  onTaskComplete,
  onTaskUncomplete,
  onDeleteCompleted,
  onMoveBackToReservoir,
  moveTimeoutsRef,
}: ReservoirProps) {
  const [showReservoirSection, setShowReservoirSection] = useState<"active" | "completed">("active");
  const [tempEntry, setTempEntry] = useState({ text: "", pillar: "Private" });

  const handleExportCSV = () => {
    const headers = "Task,Pillar,Status,Created Date\n";
    const activeRows = reservoir
      .map((item) => {
        const status = item.completed ? "Completed (Pending)" : "Active";
        return `"${item.text.replace(/"/g, '""')}","${item.pillar}","${status}","${new Date(item.createdAt).toLocaleDateString()}"`;
      })
      .join("\n");
    const completedRows = completedTasks
      .map((item) => `"${item.text.replace(/"/g, '""')}","${item.pillar}","Completed","${new Date(item.createdAt || item.completedDate).toLocaleDateString()}"`)
      .join("\n");
    const allRows = activeRows ? (completedRows ? activeRows + "\n" + completedRows : activeRows) : completedRows;
    const blob = new Blob([headers + allRows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Reservoir_Tasks_${new Date().toLocaleDateString()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black uppercase text-white italic">
          The Reservoir{" "}
          <FAQ title="Reservoir" text="Add non-work thoughts here anytime. Don't let them clutter your brain." />
        </h2>
        <button
          onClick={handleExportCSV}
          className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-orange-500 transition-colors"
          title="Export CSV"
        >
          <Download size={20} />
        </button>
      </div>

      {/* Reservoir Section Tabs */}
      <div className="flex gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
        <button
          onClick={() => setShowReservoirSection("active")}
          className={`flex-1 py-3 text-xs uppercase font-black rounded-lg transition ${
            showReservoirSection === "active" ? "bg-orange-600 text-black" : "text-slate-500"
          }`}
        >
          Active Tasks
        </button>
        <button
          onClick={() => setShowReservoirSection("completed")}
          className={`flex-1 py-3 text-xs uppercase font-black rounded-lg transition ${
            showReservoirSection === "completed" ? "bg-orange-600 text-black" : "text-slate-500"
          }`}
        >
          Completed ({completedTasks.length})
        </button>
      </div>

      {/* Active Tasks Section */}
      {showReservoirSection === "active" && (
        <>
          {/* Input form for new reservoir entries */}
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
            <textarea
              className="w-full bg-black border border-slate-700 p-4 rounded-lg text-sm text-white leading-relaxed resize-none"
              placeholder="New duty or idea..."
              value={tempEntry.text}
              onChange={(e) => setTempEntry({ ...tempEntry, text: e.target.value })}
              rows={3}
            />
            {/* Pillar selection buttons */}
            <div className="flex gap-2">
              {["Private", "Creative", "Home Logistical", "Dreams"].map((p) => (
                <button
                  key={p}
                  onClick={() => setTempEntry({ ...tempEntry, pillar: p })}
                  className={`flex-1 py-3 text-[10px] uppercase font-black rounded border transition ${
                    tempEntry.pillar === p
                      ? "bg-orange-600 border-orange-600 text-black"
                      : "border-slate-700 text-slate-500"
                  }`}
                >
                  {p === "Home Logistical" ? "Home Log" : p}
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                if (tempEntry.text.trim()) {
                  const taskObject: ReservoirItem = {
                    id: Date.now(),
                    text: tempEntry.text,
                    pillar: tempEntry.pillar as any,
                    createdAt: Date.now(),
                    category: "active",
                  };
                  onAddTask(taskObject);
                  setTempEntry({ text: "", pillar: "Private" });
                }
              }}
              className="w-full bg-slate-100 text-black font-black py-3 rounded text-xs uppercase hover:bg-white transition-colors"
            >
              Add to Reservoir
            </button>
          </div>

          {/* List of active reservoir tasks */}
          <div className="space-y-2">
            {reservoir.map((item, i) => (
              <div
                key={item.id || i}
                className={`flex items-start justify-between p-4 border rounded-lg group gap-3 transition ${
                  item.completed
                    ? "bg-slate-950/50 border-slate-900 opacity-60"
                    : "bg-slate-900 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <button
                    onClick={() => {
                      const itemId = item.id || Date.now();
                      const willBeCompleted = !item.completed;

                      if (willBeCompleted) {
                        onTaskComplete(itemId, item);
                      } else {
                        onTaskUncomplete(itemId);
                      }
                    }}
                    className={`transition shrink-0 mt-1 ${
                      item.completed ? "text-green-500 hover:text-slate-500" : "text-slate-600 hover:text-green-500"
                    }`}
                  >
                    {item.completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm break-words ${item.completed ? "text-slate-400 line-through" : "text-white"}`}>
                      {item.text}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs px-2 py-1 bg-slate-800 text-slate-300 rounded">{item.pillar}</span>
                      <span className="text-xs text-slate-500">{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onDeleteTask(i)}
                  className="text-slate-800 group-hover:text-red-500 transition shrink-0"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Completed Tasks Section */}
      {showReservoirSection === "completed" && (
        <div className="space-y-2">
          {completedTasks.length === 0 ? (
            <div className="border-2 border-dashed border-slate-800 p-10 rounded-2xl text-center">
              <p className="text-sm text-slate-500">No completed tasks yet. Get to work!</p>
            </div>
          ) : (
            completedTasks.map((item, i) => (
              <div
                key={item.id || i}
                className="flex items-start justify-between bg-slate-950/50 p-4 border border-slate-900 rounded-lg group gap-3 hover:border-green-600/30 transition"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <button
                    onClick={() => onMoveBackToReservoir(item, i)}
                    className="text-green-500 hover:text-slate-500 transition shrink-0 mt-1"
                  >
                    <CheckCircle2 size={18} />
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-400 break-words line-through">{item.text}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs px-2 py-1 bg-green-900/30 text-green-400 rounded">Completed</span>
                      <span className="text-xs px-2 py-1 bg-slate-800 text-slate-300 rounded">{item.pillar}</span>
                      <span className="text-xs text-slate-500">{new Date(item.completedDate || item.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onDeleteCompleted(i)}
                  className="text-slate-800 group-hover:text-red-500 transition shrink-0"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
