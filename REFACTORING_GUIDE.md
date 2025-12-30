# Refactored Code Overview

## Quick Navigation Guide

### 1. **Types Definition** (`app/types/index.ts`)
All TypeScript interfaces in one place for:
- Type safety across the app
- Easier refactoring
- Clear data structure contracts

**Key exports:**
- `Task`, `Mission` - Core task/mission types
- `BibleNote`, `Lifesong`, `Wingman` - Feature-specific types
- `ReservoirItem`, `CompletedTask` - Task variants
- `AppState` - Overall app shape (reference)

---

### 2. **useLocalStorage Hook** (`app/hooks/useLocalStorage.ts`)

**Pattern:** Generic React hook for localStorage persistence

```typescript
// Usage in page.tsx:
const [reservoir, setReservoir] = useLocalStorage<ReservoirItem[]>("df_reservoir", []);
```

**Why this works:**
- Two-phase loading prevents hydration mismatch
- Initial state from client-side localStorage
- Automatic saving on state change
- Generic typing `<T>` for any data type

---

### 3. **Dashboard Component** (`app/components/Dashboard.tsx`)

**Responsibilities:**
- Display active mission with selected tasks
- Show mission completion state with victory UI
- Provide quick navigation to other views
- Handle task completion/unchecking

**Props:**
```typescript
interface DashboardProps {
  activeMission: Mission | null;
  lifesong: Lifesong;
  planningSchedule: PlanningSchedule;
  onTaskComplete: (index: number) => void;
  onTaskUncomplete: (index: number) => void;
  onNavigate: (view: string) => void;
  showEncouragement: boolean;
  encouragementVerse: string;
}
```

---

### 4. **Reservoir Component** (`app/components/Reservoir.tsx`)

**Responsibilities:**
- Capture new tasks/ideas with pillar selection
- Display active task list with delete/complete buttons
- Show completed tasks history
- Export to CSV

**Key Features:**
- Auto-moves completed tasks after 10 seconds
- CSV export with timestamp
- Toggle between active/completed views
- Pillar badge display

---

### 5. **BibleSection Component** (`app/components/BibleSection.tsx`)

**Responsibilities:**
- Capture Bible notes (Book, Passage, Takeaway)
- Display takeaway history
- Export notes to CSV for compilation

**Data Structure:**
```typescript
{
  id: number;
  book: "Proverbs";
  passage: "3:5-6";
  note: "Trust in the Lord...";
  createdTime: "12/29/2025, 2:30:45 PM";
}
```

---

### 6. **SundayWizard Component** (`app/components/SundayWizard.tsx`)

**3-Step Process:**

**Step 1: Alignment**
- Select tasks from reservoir
- Quick-add new tasks
- Stale task warnings (2+ weeks old)
- Forced explanations for old tasks

**Step 2: Vision Alignment**
- Write how selected tasks connect to lifesong
- Display selected mission preview
- Vision statement reminder

**Step 3: Scheduling**
- Scheduling reminder (open calendar)
- Next planning session reminder
- Final mission commitment

---

### 7. **WingmanSection Component** (`app/components/WingmanSection.tsx`)

**Features:**
- Add/edit accountability partner
- One-click SMS button (`sms:{phone}`)
- Display weekly check-in questions
- Form validation

**Check-in Questions:**
- Did you complete your mission?
- Did you protect your Private time?
- Did you serve wife/kids well?
- What's next week's mission?

---

### 8. **MissionComplete Component** (`app/components/MissionComplete.tsx`)

**Reusable Victory Component**
- Displayed when all active mission tasks are completed
- Shows lifesong reminder
- Next planning session info
- Plan next week button

**Can be used in:**
- Dashboard mission complete state
- Custom celebration screens
- Any "victory achieved" moment

---

## View Switching Pattern (Main page.tsx)

### Before (Monolithic):
```typescript
// 2000+ lines with nested if statements
if (view === "dashboard") {
  return (
    <div>
      // 400 lines of dashboard JSX
    </div>
  );
} else if (view === "reservoir") {
  return (
    <div>
      // 300 lines of reservoir JSX
    </div>
  );
}
// ... repeat for each view
```

### After (Component-Based):
```typescript
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
    />
  ),
  reservoir: (
    <Reservoir
      reservoir={reservoir}
      completedTasks={completedTasks}
      // ... other props
    />
  ),
  // ... other views
};

// Render:
<main>
  {viewComponents[view]}
</main>
```

**Benefits:**
- Declarative and clear
- Easy to add/remove views
- Props explicitly listed
- Component logic separated

---

## State Management Hierarchy

```
page.tsx (Main App)
├── Persistent State (useLocalStorage)
│   ├── onboardingStep, onboarded
│   ├── lifesong, wingman
│   ├── encouragingMessages
│   ├── reservoir, activeMission
│   ├── completedTasks, bibleTakeaways
│   └── planningSchedule
│
├── UI State
│   ├── view (current view)
│   ├── wizardStep (wizard progress)
│   ├── showEncouragement, encouragementVerse
│   ├── showSettings, editingLifesong
│   └── tempXxx states (form inputs)
│
└── Helper Functions
    ├── getStaleTasks()
    ├── handleCompleteTask()
    ├── handleUncheckTask()
    ├── handleCompleteWizard()
    └── canActivate (computed)
```

---

## Data Flow Example: Completing a Task

1. **User clicks task checkbox** in Dashboard
2. **Dashboard calls** `onTaskComplete(index)`
3. **page.tsx handler** `handleCompleteTask(index)` executes:
   - Creates completedTask object
   - Updates activeMission.tasks[index]
   - Adds to completedTasks array
   - Removes from reservoir
   - Shows encouragement message
4. **State updates** trigger re-renders
5. **Dashboard** displays updated task state (strikethrough, green checkmark)

---

## Styling Notes

All components use consistent Tailwind styling:
- **Dark theme:** `bg-[#0B1120]` (very dark blue)
- **Accent color:** Orange (`text-orange-500`, `bg-orange-600`)
- **Neutral grays:** `slate-*` palette
- **Responsive:** Single column `max-w-md` layout
- **Bottom nav:** Fixed positioning with z-index management
- **Animations:** Tailwind animation utilities (`animate-in`, `fade-in`, etc.)

---

## Testing Considerations

### Component Testing
Each component can be tested independently with mock props:
```typescript
<Dashboard
  activeMission={mockMission}
  lifesong={mockLifesong}
  onTaskComplete={jest.fn()}
  // ... etc
/>
```

### Hook Testing
`useLocalStorage` can be tested with localStorage mock:
```typescript
const { result } = renderHook(() => useLocalStorage("test", initialValue));
// Test loading, saving, updating
```

### Integration Testing
Test data flow through main app:
- Verify state updates propagate to views
- Check view switching works
- Validate localStorage persistence

---

## Performance Optimizations (Future)

1. **Memoization:** Wrap components with `React.memo()` to prevent unnecessary re-renders
2. **Context API:** Move deeply-nested props to context if needed
3. **Code Splitting:** Dynamic imports for wizard/settings modals
4. **Lazy Loading:** Defer non-critical component loading
5. **State Selectors:** Extract only needed state per component

---

## Migration Notes

This refactoring is **backwards compatible** with existing localStorage data because:
- All keys remain the same (`df_*` prefix)
- Data structures haven't changed
- Persistence logic unchanged

Users upgrading will seamlessly continue with existing data!
