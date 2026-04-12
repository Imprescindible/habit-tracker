import type { HabitState } from './habitStore'
import type { Habit, HabitCompletion } from './types'

export const selectActiveHabits = (s: HabitState): Habit[] =>
  s.habits.filter((h) => !h.isArchived)

export const selectHabitById = (id: string) => (s: HabitState): Habit | undefined =>
  s.habits.find((h) => h.id === id)

export const selectCompletionsByDate = (date: string) => (s: HabitState): HabitCompletion[] =>
  s.completions.filter((c) => c.date === date)

export const selectIsCompleted = (habitId: string, date: string) => (s: HabitState): boolean =>
  s.completions.some((c) => c.habitId === habitId && c.date === date)

export const selectTodayCompletions = (s: HabitState): HabitCompletion[] => {
  const today = new Date().toISOString().split('T')[0]
  return s.completions.filter((c) => c.date === today)
}
