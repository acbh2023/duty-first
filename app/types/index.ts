// TypeScript interfaces for the Intentional Fatherhood OS App

export interface Task {
  id: number;
  text: string;
  pillar: "Private" | "Creative" | "Home Logistical" | "Dreams";
  createdAt: number;
  category: string;
  completed?: boolean;
  completedDate?: string;
  missionDate?: string;
  dateAdded?: string;
}

export interface Mission {
  tasks: Task[];
  date: string;
  visionAlignment: string;
  success?: string; // Fallback for older data
}

export interface BibleNote {
  id: number;
  book: string;
  passage: string;
  note: string;
  createdTime: string;
}

export interface Lifesong {
  full: string;
  chorus: string;
}

export interface Wingman {
  name: string;
  phone: string;
}

export interface ReservoirItem extends Task {
  completed?: boolean;
  completedDate?: string;
}

export interface CompletedTask extends Task {
  completed: true;
  completedDate: string;
  missionDate?: string;
}

export interface PlanningSchedule {
  day: string;
  time: string;
}

export interface AppState {
  onboardingStep: number;
  onboarded: boolean;
  lifesong: Lifesong;
  wingman: Wingman;
  encouragingMessages: string[];
  reservoir: ReservoirItem[];
  activeMission: Mission | null;
  completedTasks: CompletedTask[];
  planningSchedule: PlanningSchedule;
  bibleTakeaways: BibleNote[];
}
