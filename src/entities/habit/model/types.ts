export type HabitType = "BINARY" | "QUANTITATIVE";

export type TimeSlot = "MORNING" | "AFTERNOON" | "EVENING" | "ANYTIME";

export type ScheduleType = "DAILY" | "SPECIFIC_DAYS" | "INTERVAL";

export interface Habit {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  type: HabitType;
  goalValue: number | null;
  goalUnit: string | null;
  timeSlot: TimeSlot;
  scheduleType: ScheduleType;
  scheduleDays: number[];
  scheduleInterval: number | null;
  color: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  date: string;
  value: number | null;
}

export interface FreezeDay {
  id: string;
  userId: string;
  date: string;
  reason: string | null;
}

export type CreateHabitDTO = Omit<
  Habit,
  "id" | "userId" | "createdAt" | "updatedAt" | "isArchived"
>;

export type UpdateHabitDTO = Partial<CreateHabitDTO> & {
  id: string;
  isArchived?: boolean;
};

export interface HabitStats {
  habitId: string;
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
  prevWeekRate: number;
  totalCompletions: number;
}
