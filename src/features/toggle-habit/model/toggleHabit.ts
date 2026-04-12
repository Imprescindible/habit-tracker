import { useHabitStore } from "@entities/habit";
import { habitApi } from "@entities/habit";
import type { HabitCompletion } from "@entities/habit";

const fmtDate = (d: Date) => d.toISOString().split("T")[0];

export function useToggleHabit() {
  const { addCompletion, removeCompletion } = useHabitStore();

  const toggle = async (habitId: string, value?: number, date = new Date()) => {
    const dateStr = fmtDate(date);
    const completions = useHabitStore.getState().completions;
    const exists = completions.some(
      (c) => c.habitId === habitId && c.date === dateStr,
    );

    if (exists) {
      removeCompletion(habitId, dateStr);
      try {
        await habitApi.uncomplete(habitId, dateStr);
      } catch {
        const original = useHabitStore
          .getState()
          .completions.find((c) => c.habitId === habitId && c.date === dateStr);
        if (original) addCompletion(original);
      }
    } else {
      const temp: HabitCompletion = {
        id: `temp_${Date.now()}`,
        habitId,
        date: dateStr,
        value: value ?? null,
      };
      addCompletion(temp);
      try {
        const real = await habitApi.complete(habitId, dateStr, value);
        removeCompletion(habitId, dateStr);
        addCompletion(real);
      } catch {
        removeCompletion(habitId, dateStr);
      }
    }
  };

  const isCompleted = (habitId: string, date = new Date()) =>
    useHabitStore
      .getState()
      .completions.some(
        (c) => c.habitId === habitId && c.date === fmtDate(date),
      );

  return { toggle, isCompleted };
}
