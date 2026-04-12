import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Habit, HabitCompletion, HabitStats, CreateHabitDTO } from './types'

const genId = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36)

export interface HabitState {
  habits:      Habit[]
  completions: HabitCompletion[]
  stats:       Record<string, HabitStats>
  isLoading:   boolean
  error:       string | null

  setHabits:        (habits: Habit[]) => void
  createHabit:      (dto: CreateHabitDTO) => Habit
  updateHabit:      (updated: Habit) => void
  archiveHabit:     (id: string) => void
  deleteHabit:      (id: string) => void
  setCompletions:   (completions: HabitCompletion[]) => void
  addCompletion:    (c: HabitCompletion) => void
  removeCompletion: (habitId: string, date: string) => void
  setStats:         (habitId: string, stats: HabitStats) => void
  setLoading:       (v: boolean) => void
  setError:         (e: string | null) => void
}

export const useHabitStore = create<HabitState>()(
  persist(
    (set) => ({
      habits: [], completions: [], stats: {}, isLoading: false, error: null,

      setHabits: (habits) => set({ habits }),

      createHabit: (dto) => {
        const now = new Date().toISOString()
        const habit: Habit = { ...dto, id: genId(), userId: 'local', isArchived: false, createdAt: now, updatedAt: now }
        set((s) => ({ habits: [...s.habits, habit] }))
        return habit
      },

      updateHabit: (updated) =>
        set((s) => ({ habits: s.habits.map((h) => h.id === updated.id ? { ...updated, updatedAt: new Date().toISOString() } : h) })),

      archiveHabit: (id) =>
        set((s) => ({ habits: s.habits.map((h) => h.id === id ? { ...h, isArchived: true } : h) })),

      deleteHabit: (id) =>
        set((s) => ({ habits: s.habits.filter((h) => h.id !== id), completions: s.completions.filter((c) => c.habitId !== id) })),

      setCompletions: (completions) => set({ completions }),

      addCompletion: (c) => set((s) => ({ completions: [...s.completions, c] })),

      removeCompletion: (habitId, date) =>
        set((s) => ({ completions: s.completions.filter((c) => !(c.habitId === habitId && c.date === date)) })),

      setStats:   (habitId, stats) => set((s) => ({ stats: { ...s.stats, [habitId]: stats } })),
      setLoading: (v) => set({ isLoading: v }),
      setError:   (e) => set({ error: e }),
    }),
    {
      name: 'habit-tracker-v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ habits: s.habits, completions: s.completions }),
    }
  )
)
