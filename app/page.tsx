"use client";

import { useState, useEffect, useRef } from "react";
import {
  Shield,
  Target,
  Users,
  BookOpen,
  Plus,
  Info,
  ChevronDown,
  ChevronUp,
  Trash2,
  ArrowRight,
  Lock,
  Sparkles,
  Wrench,
  CheckCircle2,
  Settings,
  X,
  Calendar,
  Carrot,
  Download,
  Circle,
} from "lucide-react";

import { useLocalStorage } from "@/app/hooks/useLocalStorage";
import {
  Task,
  Mission,
  BibleNote,
  Lifesong,
  Wingman,
  ReservoirItem,
  CompletedTask,
  PlanningSchedule,
  AppState,
} from "@/app/types";
import { Dashboard } from "@/app/components/Dashboard";
import { Reservoir } from "@/app/components/Reservoir";
import { BibleSection } from "@/app/components/BibleSection";
import { SundayWizard } from "@/app/components/SundayWizard";
import { WingmanSection } from "@/app/components/WingmanSection";
import { MissionComplete } from "@/app/components/MissionComplete";

// --- FAQ COMPONENT ---
const FAQ = ({ title, text }: { title: string; text: string }) => (
  <button
    onClick={() => alert(`${title.toUpperCase()}: ${text}`)}
    className="inline-block ml-1 text-slate-500 hover:text-orange-500 transition"
  >
    <Info size={14} />
  </button>
);

export default function IntentionalFatherhoodApp() {
  const [isMounted, setIsMounted] = useState(false);

  // Persistent state
  const [onboardingStep, setOnboardingStep] = useLocalStorage("df_onboarding_step", 0);
  const [onboarded, setOnboarded] = useLocalStorage("df_onboarded", false);
  const [lifesong, setLifesong] = useLocalStorage<Lifesong>("df_lifesong", { full: "", chorus: "" });
  const [wingman, setWingman] = useLocalStorage<Wingman>("df_wingman", { name: "", phone: "" });
  const [encouragingMessages, setEncouragingMessages] = useLocalStorage<string[]>("df_encouraging_messages", []);
  const [reservoir, setReservoir] = useLocalStorage<ReservoirItem[]>("df_reservoir", []);
  const [activeMission, setActiveMission] = useLocalStorage<Mission | null>("df_active_mission", null);
  const [completedTasks, setCompletedTasks] = useLocalStorage<CompletedTask[]>("df_completed_tasks", []);
  const [planningSchedule, setPlanningSchedule] = useLocalStorage<PlanningSchedule>("df_planning_schedule", {
    day: "Sunday",
    time: "19:00",
  });
  const [bibleTakeaways, setBibleTakeaways] = useLocalStorage<BibleNote[]>("df_bible_notes", []);

  // UI state
  const [view, setView] = useState("dashboard");
  const [isExpanded, setIsExpanded] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [showEncouragement, setShowEncouragement] = useState(false);
  const [encouragementVerse, setEncouragementVerse] = useState("");
  const [staleTaskExplanations, setStaleTaskExplanations] = useState<Record<number, string>>({});
  const [tempEncouragingMessage, setTempEncouragingMessage] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [newEncouragingMessage, setNewEncouragingMessage] = useState("");
  const [editingLifesong, setEditingLifesong] = useState(false);
  const [tempLifesong, setTempLifesong] = useState({ full: "", chorus: "" });

  // Wizard state
  const [tempSelection, setTempSelection] = useState<ReservoirItem[]>([]);
  const [tempSuccess, setTempSuccess] = useState("");
  const [tempDate, setTempDate] = useState(new Date().toISOString());
  const [tempEntry, setTempEntry] = useState({ text: "", pillar: "Private" });

  // Wingman state
  const [tempWingman, setTempWingman] = useState({ name: "", phone: "" });
  const [tempNote, setTempNote] = useState({ book: "", passage: "", note: "" });

  // Track pending timeouts
  const moveTimeoutsRef = useRef<Record<number, number | null>>({});

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      const completedInReservoir = reservoir.filter((item) => item.completed);
      if (completedInReservoir.length > 0) {
        setCompletedTasks((prev) => [
          ...completedInReservoir.map((item) => ({
            ...item,
            completed: true as true,
            completedDate: item.completedDate || new Date().toISOString(),
          } as CompletedTask)),
          ...prev,
        ]);
        setReservoir((prev) => prev.filter((item) => !item.completed));
      }
    }
  }, [isMounted]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [onboardingStep, wizardStep, view]);

  if (!isMounted) {
    return null;
  }

  // --- HELPER FUNCTIONS ---
  const getStaleTasks = () => {
    const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000;
    return reservoir
      .map((task, index) => ({ task, index }))
      .filter(
        ({ task }) =>
          task.createdAt && Date.now() - task.createdAt > TWO_WEEKS_MS && task.category !== "dream"
      );
  };

  const handleCompleteTask = (taskIndex: number) => {
    if (!activeMission) return;

    const randomMessage =
      encouragingMessages.length > 0
        ? encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)]
        : "Well done! Keep moving forward.";

    setEncouragementVerse(randomMessage);
    setShowEncouragement(true);

    const completedTask: CompletedTask = {
      ...activeMission.tasks[taskIndex],
      completed: true,
      completedDate: new Date().toISOString(),
      missionDate: activeMission.date,
    };

    setCompletedTasks((prev) => [completedTask, ...prev]);

    setActiveMission((prev) =>
      prev
        ? {
            ...prev,
            tasks: prev.tasks.map((t, i) => (i === taskIndex ? completedTask : t)),
          }
        : prev
    );

    if (completedTask.id) {
      setReservoir((prev) => prev.filter((r) => r.id !== completedTask.id));
    } else {
      setReservoir((prev) =>
        prev.filter((r) => !(r.text === completedTask.text && r.pillar === completedTask.pillar))
      );
    }

    setTimeout(() => setShowEncouragement(false), 15000);
  };

  const handleUncheckTask = (taskIndex: number) => {
    if (!activeMission) return;

    const taskToUncheck = activeMission.tasks[taskIndex];
    if (!taskToUncheck) return;

    const updatedTask = { ...taskToUncheck, completed: false, completedDate: undefined };

    setActiveMission((prev) =>
      prev
        ? {
            ...prev,
            tasks: prev.tasks.map((t, i) => (i === taskIndex ? updatedTask : t)),
          }
        : prev
    );

    setCompletedTasks((prev) =>
      prev.filter((ct) => {
        if (updatedTask.id && ct.id) return ct.id !== updatedTask.id;
        return !(ct.text === updatedTask.text && ct.pillar === updatedTask.pillar);
      })
    );

    setReservoir((prev) => {
      const exists = updatedTask.id
        ? prev.some((r) => r.id === updatedTask.id)
        : prev.some((r) => r.text === updatedTask.text && r.pillar === updatedTask.pillar);
      if (exists) return prev;
      return [
        ...prev,
        {
          id: updatedTask.id || Date.now(),
          text: updatedTask.text,
          pillar: updatedTask.pillar,
          createdAt: updatedTask.createdAt || Date.now(),
          category: "active",
        },
      ];
    });
  };

  const handleCompleteWizard = () => {
    // If this is called before the Share step (step 4), advance to step 4 instead
    if (wizardStep !== 4) {
      setWizardStep(4);
      return;
    }

    // Finalize the mission and navigate to dashboard when called from the final step
    setActiveMission({ tasks: tempSelection, date: tempDate, visionAlignment: tempSuccess });
    setView("dashboard");
    setWizardStep(1);
    setTempSelection([]);
    setTempSuccess("");
    setStaleTaskExplanations({});
  };

  const canActivate =
    typeof lifesong.full === "string" &&
    typeof lifesong.chorus === "string" &&
    lifesong.full.trim().length > 0 &&
    lifesong.chorus.trim().length > 0;

  // --- ONBOARDING FLOW ---
  if (!onboarded) {
    // Step 0: Welcome & Privacy
    if (onboardingStep === 0) {
      return (
        <div className="min-h-screen bg-[#0B1120] text-slate-200 p-4 flex flex-col items-center justify-center">
          <div className="max-w-md w-full space-y-6 pb-20">
            <div className="flex items-center justify-center mb-2">
              <Target className="text-orange-500" size={64} />
            </div>

            <div className="text-center space-y-2">
              <h1 className="text-5xl font-black tracking-tighter text-white uppercase italic">LIFESONG</h1>

              <FAQ
                title="Lifesong"
                text={`What is a lifesong?
              In one sense, it is a song summarizing a great leader of antiquity's impact, what they did, what they cared about.
              In another sense, it is a phrase/song line you come back to and sing to your soul when discouraged in need of reminder.

              The phrase I have chosen as my lifesong for this app is Ezra 7:10:
              Ezra set his heart to study the Law of the LORD, and to do it, and to teach His laws and statutes in Israel.

              This phrase will shape how you approach everything in life and will be the driving force for being a disciple, husband, father, and neighbor.`}
              />

              <p className="text-orange-500 font-bold text-sm tracking-wide"> Intentional Fatherhood Operating System Onboarding &#40;7-10 min&#41; </p>

              <p className="text-slate-400 text-sm leading-relaxed px-4 pt-2">
                A life orientation app to help you live your priorities: God, Wife, Children, Neighbor (suggested). Stay
                oriented in non-work areas of life. Think of it as a dad's companion to the family calendar. The
                Reservoir, Sunday Wizard, Wingman, and Bible Takeaways are the core components to keeping things
                oriented (see below)
              </p>
            </div>

            <div className="bg-slate-900/80 border-2 border-orange-600/30 p-6 rounded-2xl space-y-4 mt-8">
              <div className="flex items-center gap-3 mb-4">
                <Lock className="text-orange-500 shrink-0" size={28} />
                <h2 className="text-xl font-black text-white uppercase tracking-tight">Privacy by Design</h2>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Your vision, goals, prayers, and reflections stay on <strong className="text-orange-500">this device only</strong>.
                Everything is locally isolated and protected. No cloud storage. No servers. No one can see your intimate inputs.
                <strong className="text-orange-500"> This is something that is truly unique about this app.</strong>
              </p>
            </div>

            <div className="text-center space-y-2">
              <p className="text-orange-500 font-bold text-sm tracking-wide">Core Components of This App:</p>
            </div>

            <div className="space-y-3 mt-8">
              <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="bg-orange-600 rounded-lg px-3 py-1 shrink-0">
                    <span className="text-black font-black text-lg">01</span>
                  </div>
                  <div>
                    <h3 className="text-orange-500 font-black uppercase text-sm tracking-wide mb-1">THE RESERVOIR</h3>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      Capture all personal, spiritual, and family/creative tasks and ideas in one place. Never lose
                      track of what matters.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="bg-orange-600 rounded-lg px-3 py-1 shrink-0">
                    <span className="text-black font-black text-lg">02</span>
                  </div>
                  <div>
                    <h3 className="text-orange-500 font-black uppercase text-sm tracking-wide mb-1">SUNDAY PLANNING</h3>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      Weekly ritual to select your mission. Align every week with your vision.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="bg-orange-600 rounded-lg px-3 py-1 shrink-0">
                    <span className="text-black font-black text-lg">03</span>
                  </div>
                  <div>
                    <h3 className="text-orange-500 font-black uppercase text-sm tracking-wide mb-1">WINGMAN ACCOUNTABILITY</h3>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      Partner with someone who will ask the hard questions and keep you honest.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="bg-orange-600 rounded-lg px-3 py-1 shrink-0">
                    <span className="text-black font-black text-lg">04</span>
                  </div>
                  <div>
                    <h3 className="text-orange-500 font-black uppercase text-sm tracking-wide mb-1">BIBLE TAKEAWAYS</h3>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      Capture and reflect on scripture passages that speak to you. Record what God shows you, questions
                      that arise, and insights to return to. I've been keeping track of my bible takeaways for the
                      long-term goal of compiling them into a study-bible for my children.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setOnboardingStep(1)}
              className="w-full bg-orange-600 text-white font-black py-5 rounded-xl uppercase tracking-widest shadow-xl shadow-orange-900/20 flex items-center justify-center gap-2 mt-8"
            >
              Let's build your operating system <ArrowRight size={20} />
            </button>
          </div>
        </div>
      );
    }

    // Step 1: Stewardship Categories
    if (onboardingStep === 1) {
      return (
        <div className="min-h-screen bg-[#0B1120] text-slate-200 p-4 flex flex-col">
          <div className="max-w-md w-full mx-auto space-y-6 pt-12 pb-20">
            <div className="flex items-center justify-center mb-6">
              <div className="border-2 border-orange-500 rounded-full p-6">
                <Shield className="text-orange-500" size={48} />
              </div>
            </div>

            <div className="text-center space-y-2 mb-8">
              <h1 className="text-3xl font-black tracking-tight text-white uppercase">STEWARDSHIP CATEGORIES</h1>
              <p className="text-orange-500 font-bold text-base">How you categorize your RESERVOIR tasks</p>
              <p className="text-slate-400 text-sm leading-relaxed px-2 pt-2">
                These define the types of non-work tasks you track. While work is important and a key part of our roles
                as disciples, fathers and husbands, it is not a complete picture of our identity. Our primary role in
                life is{" "}
                <span className="text-orange-500 font-bold">
                  {" "}
                  child of God, tasked with working and protecting God's kingdom.
                </span>
                . Everything flows from this.
              </p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-5">
              <p className="text-sm text-slate-300 mb-3">
                These are <span className="text-orange-500 font-bold">Stewardship Categories</span> - not work
                categories. Work is important but not what we are dealing with here. This app is about orienting life's
                priorities properly and stewarding non-work responsibilities properly:
              </p>

              <div className="bg-black/40 p-4 rounded-lg mb-4">
                <div className="flex flex-wrap items-center justify-center gap-2 text-orange-500 font-black text-base mb-2">
                  <span>God</span>
                  <ArrowRight size={16} />
                  <span>Wife</span>
                  <ArrowRight size={16} />
                  <span>Children</span>
                  <ArrowRight size={16} />
                  <span>Neighbor</span>
                </div>
                <p className="text-center text-slate-500 text-xs italic mt-2">Your suggested priority order</p>
              </div>
              <div>
                <p className="text-sm text-slate-300 mb-3">
                  What types of tasks will you be adding into the Reservoir?
                </p>
              </div>
              <div className="space-y-4 mt-5">
                <div className="flex gap-3">
                  <Shield className="text-orange-500 shrink-0 mt-1" size={20} />
                  <div>
                    <p className="text-white font-bold text-sm mb-1">Private:</p>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      Time for God—prayer, reflection, scripture, spiritual disciplines. Non-negotiable time that must
                      be carved out.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Sparkles className="text-orange-500 shrink-0 mt-1" size={20} />
                  <div>
                    <p className="text-white font-bold text-sm mb-1">Creative:</p>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      Projects for wife, kids, community. Building a backyard slide, painting a mural, planning a
                      special date, serving neighbors. Not work projects.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Wrench className="text-orange-500 shrink-0 mt-1" size={20} />
                  <div>
                    <p className="text-white font-bold text-sm mb-1">Home Logistical:</p>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      Honey-do list items. Fix the leaky faucet, organize the garage, yard work. Important maintenance
                      that keeps the household running smoothly.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Target className="text-orange-500 shrink-0 mt-1" size={20} />
                  <div>
                    <p className="text-white font-bold text-sm mb-1">Dreams:</p>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      Big picture aspirations that may take months or years. Write a book, start a ministry, build a
                      legacy project. These can sit in your reservoir while you work toward them incrementally.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setOnboardingStep(2)}
              className="w-full bg-orange-600 text-white font-black py-5 rounded-xl uppercase tracking-widest shadow-xl shadow-orange-900/20 mt-8"
            >
              Continue <ArrowRight className="inline ml-2" size={20} />
            </button>
          </div>
        </div>
      );
    }

    // Step 2: Encouragement Message
    if (onboardingStep === 2) {
      return (
        <div className="min-h-screen bg-[#0B1120] text-slate-200 p-4 flex flex-col items-center justify-center">
          <div className="max-w-md w-full space-y-6 pb-20">
            <div className="text-center space-y-2 mb-6">
              <Carrot className="text-orange-500 mx-auto mb-4" size={56} />
              <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">Encouragement</h1>
              <p className="text-slate-400 text-sm leading-relaxed px-4">
                Set a message that appears when you complete tasks. You can add more messages in settings later.
              </p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-5">
              <div>
                <label className="text-xs uppercase font-bold text-slate-500 mb-2 block tracking-wide">
                  Your Encouraging Message
                </label>
                <textarea
                  className="w-full bg-black border border-slate-700 p-4 rounded-lg text-sm text-white leading-relaxed resize-none"
                  placeholder="e.g., Ecclesiastes 2:24 - There is nothing better for a person than that he should eat and drink and find enjoyment in his toil. This also, I saw, is from the hand of God."
                  value={tempEncouragingMessage}
                  onChange={(e) => setTempEncouragingMessage(e.target.value)}
                  rows={4}
                />
              </div>
            </div>

            <button
              disabled={!tempEncouragingMessage.trim()}
              onClick={() => {
                setEncouragingMessages([tempEncouragingMessage.trim()]);
                setTempEncouragingMessage("");
                setOnboardingStep(3);
              }}
              className="w-full bg-orange-600 text-white font-black py-5 rounded-xl uppercase tracking-widest shadow-xl shadow-orange-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              Continue <ArrowRight size={20} />
            </button>
          </div>
        </div>
      );
    }

    // Step 3: Wingman Info
    if (onboardingStep === 3) {
      return (
        <div className="min-h-screen bg-[#0B1120] text-slate-200 p-4 flex flex-col items-center justify-center">
          <div className="max-w-md w-full space-y-6">
            <div className="text-center space-y-2 mb-6">
              <Users className="text-orange-500 mx-auto mb-4" size={56} />
              <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">The Wingman</h1>
              <p className="text-slate-400 text-sm leading-relaxed px-4">
                You weren't meant to do this alone.  Identify one man who will hold you to your mission.
              </p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-4">
              <input
                className="w-full bg-black border border-slate-700 p-4 rounded-lg text-sm text-white"
                placeholder="Wingman Name"
                value={wingman.name}
                onChange={(e) => setWingman({ ...wingman, name: e.target.value })}
              />
              <input
                className="w-full bg-black border border-slate-700 p-4 rounded-lg text-sm text-white"
                placeholder="Phone Number"
                value={wingman.phone}
                onChange={(e) => setWingman({ ...wingman, phone: e.target.value })}
              />
            </div>

            <button
              disabled={!wingman.name.trim() || !wingman.phone.trim()}
              onClick={() => setOnboardingStep(4)}
              className="w-full bg-orange-600 text-white font-black py-4 rounded-xl uppercase tracking-widest text-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              Continue to Lifesong <ArrowRight size={20} />
            </button>
          </div>
        </div>
      );
    }

    // Step 4: Lifesong
    if (onboardingStep === 4) {
      return (
        <div className="min-h-screen bg-[#0B1120] text-slate-200 p-4 flex flex-col items-center justify-center">
          <div className="max-w-md w-full space-y-6 pb-20">
            <div className="text-center space-y-2 mb-6">
              <Target className="text-orange-500 mx-auto mb-4" size={56} />
              <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">Your Lifesong</h1>
              <p className="text-slate-400 text-sm leading-relaxed px-4">
                Define your North Star. This phrase will be anchored at the top of your dashboard.
              </p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-5">
              <div>
                <label className="text-xs uppercase font-bold text-slate-500 mb-2 block tracking-wide">
                  Full Vision Statement
                </label>
                <textarea
                  className="w-full bg-black border border-slate-700 p-4 rounded-lg text-sm text-white leading-relaxed resize-none"
                  placeholder="What is a summary of your life's purpose? What keeps you going? What is your life's heartbeat?"
                  value={lifesong.full}
                  onChange={(e) => setLifesong({ ...lifesong, full: e.target.value })}
                  rows={4}
                />
              </div>
              <div>
                <label className="text-xs uppercase font-bold text-slate-500 mb-2 block tracking-wide">
                  Lifesong in 2-3 Words
                </label>
                <input
                  className="w-full bg-black border border-slate-700 p-4 rounded-lg text-sm text-white font-bold"
                  placeholder="e.g., Study, Do, Teach"
                  value={lifesong.chorus}
                  onChange={(e) => setLifesong({ ...lifesong, chorus: e.target.value })}
                />
              </div>
            </div>

            <button
              disabled={!canActivate}
              onClick={() => {
                setOnboarded(true);
                setOnboardingStep(5);
              }}
              className="w-full bg-orange-600 text-white font-black py-5 rounded-xl uppercase tracking-widest shadow-xl shadow-orange-900/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              Activate Operating System <ArrowRight size={20} />
            </button>
          </div>
        </div>
      );
    }
  }

  // --- VIEW SWITCHING WITH LOOKUP OBJECT ---
  const viewComponents: Record<string, React.ReactNode> = {
    dashboard: (
      <Dashboard
        activeMission={activeMission}
        lifesong={lifesong}
        planningSchedule={planningSchedule}
        onTaskComplete={handleCompleteTask}
        onTaskUncomplete={handleUncheckTask}
        onNavigate={setView}
        showEncouragement={showEncouragement}
        encouragementVerse={encouragementVerse}
        onDismissEncouragement={() => setShowEncouragement(false)}
      />
    ),
    reservoir: (
      <Reservoir
        reservoir={reservoir}
        completedTasks={completedTasks}
        onAddTask={(task) => setReservoir([...reservoir, task])}
        onDeleteTask={(i) => setReservoir(reservoir.filter((_, idx) => idx !== i))}
        onTaskComplete={(itemId, item) => {
          const willBeCompleted = !item.completed;
          setReservoir((prev) =>
            prev.map((t) => (t.id === itemId ? { ...t, completed: willBeCompleted } : t))
          );

          if (willBeCompleted) {
            const existing = moveTimeoutsRef.current[itemId];
            if (existing) {
              clearTimeout(existing);
              delete moveTimeoutsRef.current[itemId];
            }

            const timeoutId = window.setTimeout(() => {
              setReservoir((current) => {
                const found = current.find((task) => task.id === itemId && task.completed);
                if (!found) return current;
                return current.filter((task) => task.id !== itemId);
              });

              setCompletedTasks((prev) => [
                ({
                  ...item,
                  id: itemId,
                  completed: true as true,
                  completedDate: new Date().toISOString(),
                } as CompletedTask),
                ...prev,
              ]);

              delete moveTimeoutsRef.current[itemId];
            }, 10000);

            moveTimeoutsRef.current[itemId] = timeoutId as unknown as number;
          }
        }}
        onTaskUncomplete={(itemId) => {
          const existing = moveTimeoutsRef.current[itemId];
          if (existing) {
            clearTimeout(existing);
            delete moveTimeoutsRef.current[itemId];
          }
          setReservoir((prev) =>
            prev.map((t) => (t.id === itemId ? { ...t, completed: false } : t))
          );
        }}
        onDeleteCompleted={(i) => setCompletedTasks(completedTasks.filter((_, idx) => idx !== i))}
        onMoveBackToReservoir={(item, i) => {
          const reservoirItem: ReservoirItem = {
            id: item.id || Date.now(),
            text: item.text,
            pillar: item.pillar,
            createdAt: item.createdAt || Date.now(),
            category: "active",
          };
          setReservoir((prev) => [reservoirItem, ...prev]);
          setCompletedTasks(completedTasks.filter((_, idx) => idx !== i));
        }}
        moveTimeoutsRef={moveTimeoutsRef}
      />
    ),
    bible: (
      <BibleSection
        bibleTakeaways={bibleTakeaways}
        onAddNote={(note) => setBibleTakeaways([note, ...bibleTakeaways])}
        onDeleteNote={(id) => setBibleTakeaways(bibleTakeaways.filter((t) => t.id !== id))}
      />
    ),
    wizard: (
      <SundayWizard
        wizardStep={wizardStep}
        tempSelection={tempSelection}
        tempSuccess={tempSuccess}
        tempEntry={tempEntry}
        staleTaskExplanations={staleTaskExplanations}
        reservoir={reservoir}
        lifesong={lifesong}
        onStepChange={setWizardStep}
        onSelectionChange={setTempSelection}
        onSuccessChange={setTempSuccess}
        onEntryChange={setTempEntry}
        onStaleExplanationChange={setStaleTaskExplanations}
        onAddNewTask={(task) => setReservoir([...reservoir, task])}
        onCompleteWizard={handleCompleteWizard}
        getStaleTasks={getStaleTasks}
      />
    ),
    wingman: (
      <WingmanSection
        wingman={wingman}
        tempWingman={tempWingman}
        onWingmanChange={setWingman}
        onTempWingmanChange={setTempWingman}
      />
    ),
  };

  // --- MAIN APPLICATION UI ---
  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-200 font-sans">
      {/* HEADER */}
      <header className="bg-slate-900/90 backdrop-blur-md border-b border-orange-600/30 p-4 sticky top-0 z-50">
        <div className="max-w-md mx-auto">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full text-left flex items-center justify-between"
          >
            <div>
              <p className="text-xs text-slate-600 uppercase font-bold tracking-widest">
                Your Lifesong{" "}
                <FAQ
                  title="Lifesong"
                  text="What is a lifesong? As someone who likes music, I understand matters of life from a musical perspective. In one sense, a lifesong could be understood as, if someone sang a song about you, after death, that summarized your life, your focus, your impact, what was important to you. In another sense, a lifesong can be a phrase or a song that helps get you through the day, a reminder of why you are doing it. Like a little song that you sing to your soul every time you are discouraged. Your north star. Every action flows from this legacy statement."
                />
              </p>
              <h2 className="text-xl font-black uppercase text-white tracking-tighter leading-none italic">
                {lifesong.chorus}
              </h2>
            </div>
            {isExpanded ? <ChevronUp className="text-slate-600" /> : <ChevronDown className="text-slate-600" />}
          </button>
          {isExpanded && (
            <div className="mt-4 p-4 bg-black/40 rounded border border-slate-800 animate-in fade-in slide-in-from-top-2">
              <p className="text-sm italic text-slate-400 leading-relaxed break-words">"{lifesong.full}"</p>
              <button
                onClick={() => {
                  setEditingLifesong(true);
                  setTempLifesong(lifesong);
                }}
                className="mt-4 text-xs uppercase text-orange-500 font-bold flex items-center gap-1"
              >
                <Settings size={12} /> Edit Lifesong
              </button>
              <button
                onClick={() => {
                  setOnboarded(false);
                  setOnboardingStep(0);
                }}
                className="mt-2 text-[10px] uppercase text-orange-500 font-bold flex items-center gap-1"
              >
                <Trash2 size={10} /> Reset Vision
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-md mx-auto p-5 pt-8 pb-32">
        {/* RENDER VIEW BASED ON STATE */}
        {viewComponents[view]}
      </main>

      {/* BOTTOM NAVIGATION BAR */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-t border-orange-600/30 px-4 py-3 z-40">
        <div className="max-w-md mx-auto flex items-center justify-around gap-1">
          {[
            { icon: Target, id: "dashboard", label: "Dash" },
            { icon: Plus, id: "reservoir", label: "Res" },
            { icon: BookOpen, id: "bible", label: "Bible" },
            { icon: Wrench, id: "wizard", label: "Wizard" },
            { icon: Users, id: "wingman", label: "Wingman" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setView(item.id);
                setWizardStep(1);
              }}
              className={`flex flex-col items-center gap-1 transition-all duration-200 ${
                view === item.id ? "text-orange-500 scale-110" : "text-slate-600 hover:text-slate-400"
              }`}
            >
              <item.icon size={20} />
              <span className="text-[8px] uppercase font-black tracking-tighter">{item.label}</span>
            </button>
          ))}
          {/* Settings button */}
          <button
            onClick={() => setShowSettings(true)}
            className="flex flex-col items-center gap-1 text-slate-600 transition hover:text-orange-500"
          >
            <Settings size={20} />
            <span className="text-[8px] uppercase font-black tracking-tighter">Set</span>
          </button>
        </div>
      </nav>

      {/* SETTINGS MODAL */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-orange-600/30 rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black uppercase text-white tracking-tight">Settings</h2>
              <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Planning Schedule Section */}
              <div>
                <h3 className="text-sm font-bold uppercase text-orange-500 mb-3 tracking-wide">Planning Schedule</h3>
                <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                  Set your weekly planning time so you stay consistent.
                </p>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs uppercase font-bold text-slate-500 mb-2 block tracking-wide">
                      Day of Week
                    </label>
                    <select
                      className="w-full bg-black border border-slate-700 p-3 rounded-lg text-sm text-white"
                      value={planningSchedule.day}
                      onChange={(e) => setPlanningSchedule({ ...planningSchedule, day: e.target.value })}
                    >
                      <option value="Sunday">Sunday</option>
                      <option value="Monday">Monday</option>
                      <option value="Tuesday">Tuesday</option>
                      <option value="Wednesday">Wednesday</option>
                      <option value="Thursday">Thursday</option>
                      <option value="Friday">Friday</option>
                      <option value="Saturday">Saturday</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs uppercase font-bold text-slate-500 mb-2 block tracking-wide">Time</label>
                    <input
                      type="time"
                      className="w-full bg-black border border-slate-700 p-3 rounded-lg text-sm text-white"
                      value={planningSchedule.time}
                      onChange={(e) => setPlanningSchedule({ ...planningSchedule, time: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Encouraging Messages Section */}
              <div className="border-t border-slate-800 pt-6">
                <h3 className="text-sm font-bold uppercase text-orange-500 mb-3 tracking-wide">Encouraging Messages</h3>
                <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                  Add multiple messages that will randomly appear when you complete tasks.
                </p>
                <div className="space-y-3 mb-4">
                  {encouragingMessages.map((msg, index) => (
                    <div
                      key={index}
                      className="bg-black/40 border border-slate-800 p-3 rounded-lg flex justify-between items-start gap-2"
                    >
                      <p className="text-xs text-slate-300 leading-relaxed break-words flex-1">{msg}</p>
                      <button
                        onClick={() => {
                          const updated = encouragingMessages.filter((_, i) => i !== index);
                          setEncouragingMessages(updated);
                        }}
                        className="text-red-500 hover:text-red-400 shrink-0"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <textarea
                    className="w-full bg-black border border-slate-700 p-3 rounded-lg text-xs text-white leading-relaxed resize-none"
                    placeholder="Add new encouraging message..."
                    value={newEncouragingMessage}
                    onChange={(e) => setNewEncouragingMessage(e.target.value)}
                    rows={3}
                  />
                  <button
                    disabled={!newEncouragingMessage.trim()}
                    onClick={() => {
                      setEncouragingMessages([...encouragingMessages, newEncouragingMessage.trim()]);
                      setNewEncouragingMessage("");
                    }}
                    className="w-full bg-orange-600 text-white font-bold py-2 rounded-lg text-xs uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add Message
                  </button>
                </div>
              </div>

              {/* THE RAW DATA VAULT */}
              <div className="border-t border-slate-800 pt-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-bold uppercase text-orange-500 tracking-wide">Raw Data Engine</h3>
                  <button
                    onClick={() => {
                      const allData = {
                        df_active_mission: activeMission,
                        df_bible_notes: bibleTakeaways,
                        df_completed_tasks: completedTasks,
                        df_encouraging_messages: encouragingMessages,
                        df_lifesong: lifesong,
                        df_onboarded: onboarded,
                        df_onboarding_step: onboardingStep,
                        df_planning_schedule: planningSchedule,
                        df_reservoir: reservoir,
                        df_wingman: wingman
                      }
                      const blob = new Blob([JSON.stringify(allData, null, 2)], { type: "application/json" })
                      const url = window.URL.createObjectURL(blob)
                      const a = document.createElement("a")
                      a.href = url
                      a.download = `LifesongOS_AllData_${new Date().toLocaleDateString()}.json`
                      a.click()
                      window.URL.revokeObjectURL(url)
                    }}
                    className="px-3 py-1 bg-orange-600 text-white text-[10px] font-bold rounded hover:bg-orange-500 transition"
                  >
                    EXPORT ALL
                  </button>
                </div>
                <div className="space-y-3">
                  {/* RESERVOIR TABLE */}
                  <details className="border border-slate-700 rounded-lg overflow-hidden group">
                    <summary className="px-4 py-3 bg-slate-800/50 cursor-pointer hover:bg-slate-800 flex items-center justify-between font-bold text-[10px] text-slate-300 uppercase tracking-widest">
                      <span>📦 RESERVOIR ({reservoir.length})</span>
                      <span className="text-orange-400 group-open:rotate-180 transition">▼</span>
                    </summary>
                    <div className="p-4 bg-slate-900/30 overflow-x-auto">
                      <table className="w-full text-[9px]">
                        <thead className="bg-slate-800/50 border-b border-slate-700">
                          <tr>
                            <th className="px-2 py-2 text-left text-orange-400 font-bold">Task</th>
                            <th className="px-2 py-2 text-left text-orange-400 font-bold">Pillar</th>
                            <th className="px-2 py-2 text-left text-orange-400 font-bold">Status</th>
                            <th className="px-2 py-2 text-left text-orange-400 font-bold">Created</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                          {reservoir.length === 0 ? (
                            <tr><td colSpan={4} className="px-2 py-2 text-slate-500 text-center">No tasks</td></tr>
                          ) : (
                            reservoir.map((item: any, i: number) => (
                              <tr key={i} className="hover:bg-slate-800/30">
                                <td className="px-2 py-2 text-slate-300 break-words max-w-xs">{item.text}</td>
                                <td className="px-2 py-2 text-slate-400">{item.pillar}</td>
                                <td className="px-2 py-2 text-slate-400">{item.completed ? "Pending" : "Active"}</td>
                                <td className="px-2 py-2 text-slate-500">{new Date(item.createdAt).toLocaleDateString()}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </details>

                  {/* BIBLE TAKEAWAYS TABLE */}
                  <details className="border border-slate-700 rounded-lg overflow-hidden group">
                    <summary className="px-4 py-3 bg-slate-800/50 cursor-pointer hover:bg-slate-800 flex items-center justify-between font-bold text-[10px] text-slate-300 uppercase tracking-widest">
                      <span>📖 BIBLE_TAKEAWAYS ({bibleTakeaways.length})</span>
                      <span className="text-orange-400 group-open:rotate-180 transition">▼</span>
                    </summary>
                    <div className="p-4 bg-slate-900/30 overflow-x-auto">
                      <table className="w-full text-[9px]">
                        <thead className="bg-slate-800/50 border-b border-slate-700">
                          <tr>
                            <th className="px-2 py-2 text-left text-orange-400 font-bold">Book</th>
                            <th className="px-2 py-2 text-left text-orange-400 font-bold">Passage</th>
                            <th className="px-2 py-2 text-left text-orange-400 font-bold">Takeaway</th>
                            <th className="px-2 py-2 text-left text-orange-400 font-bold">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                          {bibleTakeaways.length === 0 ? (
                            <tr><td colSpan={4} className="px-2 py-2 text-slate-500 text-center">No takeaways</td></tr>
                          ) : (
                            bibleTakeaways.map((item: any, i: number) => (
                              <tr key={i} className="hover:bg-slate-800/30">
                                <td className="px-2 py-2 text-slate-300">{item.book}</td>
                                <td className="px-2 py-2 text-slate-400">{item.passage}</td>
                                <td className="px-2 py-2 text-slate-300 break-words max-w-xs">{item.note}</td>
                                <td className="px-2 py-2 text-slate-500">{item.createdTime}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </details>

                  {/* COMPLETED TASKS TABLE */}
                  <details className="border border-slate-700 rounded-lg overflow-hidden group">
                    <summary className="px-4 py-3 bg-slate-800/50 cursor-pointer hover:bg-slate-800 flex items-center justify-between font-bold text-[10px] text-slate-300 uppercase tracking-widest">
                      <span>✅ COMPLETED_TASKS ({completedTasks.length})</span>
                      <span className="text-orange-400 group-open:rotate-180 transition">▼</span>
                    </summary>
                    <div className="p-4 bg-slate-900/30 overflow-x-auto">
                      <table className="w-full text-[9px]">
                        <thead className="bg-slate-800/50 border-b border-slate-700">
                          <tr>
                            <th className="px-2 py-2 text-left text-orange-400 font-bold">Task</th>
                            <th className="px-2 py-2 text-left text-orange-400 font-bold">Pillar</th>
                            <th className="px-2 py-2 text-left text-orange-400 font-bold">Completed</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                          {completedTasks.length === 0 ? (
                            <tr><td colSpan={3} className="px-2 py-2 text-slate-500 text-center">No completed tasks</td></tr>
                          ) : (
                            completedTasks.map((item: any, i: number) => (
                              <tr key={i} className="hover:bg-slate-800/30">
                                <td className="px-2 py-2 text-slate-300 break-words max-w-xs line-through">{item.text}</td>
                                <td className="px-2 py-2 text-slate-400">{item.pillar}</td>
                                <td className="px-2 py-2 text-slate-500">{new Date(item.completedDate).toLocaleDateString()}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </details>

                  {/* ACTIVE MISSION TABLE */}
                  <details className="border border-slate-700 rounded-lg overflow-hidden group">
                    <summary className="px-4 py-3 bg-slate-800/50 cursor-pointer hover:bg-slate-800 flex items-center justify-between font-bold text-[10px] text-slate-300 uppercase tracking-widest">
                      <span>🎯 ACTIVE_MISSION ({activeMission?.tasks?.length || 0})</span>
                      <span className="text-orange-400 group-open:rotate-180 transition">▼</span>
                    </summary>
                    <div className="p-4 bg-slate-900/30 overflow-x-auto">
                      <table className="w-full text-[9px]">
                        <thead className="bg-slate-800/50 border-b border-slate-700">
                          <tr>
                            <th className="px-2 py-2 text-left text-orange-400 font-bold">Task</th>
                            <th className="px-2 py-2 text-left text-orange-400 font-bold">Pillar</th>
                            <th className="px-2 py-2 text-left text-orange-400 font-bold">Completed</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                          {!activeMission || !activeMission.tasks || activeMission.tasks.length === 0 ? (
                            <tr><td colSpan={3} className="px-2 py-2 text-slate-500 text-center">No active mission</td></tr>
                          ) : (
                            activeMission.tasks.map((task: any, i: number) => (
                              <tr key={i} className="hover:bg-slate-800/30">
                                <td className="px-2 py-2 text-slate-300 break-words max-w-xs">{task.text}</td>
                                <td className="px-2 py-2 text-slate-400">{task.pillar}</td>
                                <td className="px-2 py-2 text-slate-400">{task.completed ? "✓" : "—"}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </details>

                  {/* LIFESONG & WINGMAN (single records) */}
                  <details className="border border-slate-700 rounded-lg overflow-hidden group">
                    <summary className="px-4 py-3 bg-slate-800/50 cursor-pointer hover:bg-slate-800 flex items-center justify-between font-bold text-[10px] text-slate-300 uppercase tracking-widest">
                      <span>🎵 LIFESONG & WINGMAN</span>
                      <span className="text-orange-400 group-open:rotate-180 transition">▼</span>
                    </summary>
                    <div className="p-4 bg-slate-900/30">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold mb-2 tracking-widest">LIFESONG</p>
                          <div className="border border-slate-700 rounded-lg p-3 bg-slate-800/20 text-[9px] space-y-1">
                            <div><span className="text-orange-400 font-bold">Full:</span> <span className="text-slate-300 break-words">{lifesong.full || "—"}</span></div>
                            <div><span className="text-orange-400 font-bold">Chorus:</span> <span className="text-slate-300">{lifesong.chorus || "—"}</span></div>
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold mb-2 tracking-widest">WINGMAN</p>
                          <div className="border border-slate-700 rounded-lg p-3 bg-slate-800/20 text-[9px] space-y-1">
                            <div><span className="text-orange-400 font-bold">Name:</span> <span className="text-slate-300">{wingman.name || "—"}</span></div>
                            <div><span className="text-orange-400 font-bold">Phone:</span> <span className="text-slate-300">{wingman.phone || "—"}</span></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </details>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT LIFESONG MODAL */}
      {editingLifesong && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-orange-600/30 rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black uppercase text-white tracking-tight">Edit Lifesong</h2>
              <button onClick={() => setEditingLifesong(false)} className="text-slate-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs uppercase font-bold text-slate-500 mb-2 block tracking-wide">
                  Full Vision Statement
                </label>
                <textarea
                  className="w-full bg-black border border-slate-700 p-4 rounded-lg text-sm text-white leading-relaxed resize-none"
                  value={tempLifesong.full}
                  onChange={(e) => setTempLifesong({ ...tempLifesong, full: e.target.value })}
                  rows={4}
                />
              </div>
              <div>
                <label className="text-xs uppercase font-bold text-slate-500 mb-2 block tracking-wide">
                  Lifesong in 2-3 Words
                </label>
                <input
                  className="w-full bg-black border border-slate-700 p-4 rounded-lg text-sm text-white font-bold"
                  value={tempLifesong.chorus}
                  onChange={(e) => setTempLifesong({ ...tempLifesong, chorus: e.target.value })}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setEditingLifesong(false)}
                  className="flex-1 border border-slate-800 text-slate-400 font-bold py-3 rounded-xl uppercase tracking-widest text-sm"
                >
                  Cancel
                </button>
                <button
                  disabled={!tempLifesong.full.trim() || !tempLifesong.chorus.trim()}
                  onClick={() => {
                    setLifesong(tempLifesong);
                    setEditingLifesong(false);
                  }}
                  className="flex-1 bg-orange-600 text-white font-black py-3 rounded-xl uppercase tracking-widest text-sm disabled:opacity-50"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
