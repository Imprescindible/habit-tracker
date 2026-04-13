import { useState } from "react";
import { useHabitStore } from "@entities/habit";
import { EditHabitModal } from "@features/edit-habit";
import { habitApi } from "@entities/habit";
import type { Habit } from "@entities/habit";
import styles from "./ArchivePage.module.scss";

export function ArchivePage() {
  const habits = useHabitStore((s) => s.habits.filter((h) => h.isArchived));
  const { updateHabit } = useHabitStore();
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  const restore = async (habit: Habit) => {
    await habitApi.update({ id: habit.id, isArchived: false });
    updateHabit({ ...habit, isArchived: false });
  };

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Архив</h1>

      {habits.length === 0 ? (
        <p className={styles.empty}>Архив пуст</p>
      ) : (
        <div className={styles.list}>
          {habits.map((habit) => (
            <div
              key={habit.id}
              className={styles.card}
              style={{ borderLeftColor: habit.color }}
            >
              <div className={styles.info}>
                <span
                  className={styles.dot}
                  style={{ background: habit.color }}
                />
                <div>
                  <p className={styles.name}>{habit.title}</p>
                  {habit.description && (
                    <p className={styles.desc}>{habit.description}</p>
                  )}
                </div>
              </div>
              <div className={styles.actions}>
                <button
                  className={styles.restoreBtn}
                  onClick={() => restore(habit)}
                >
                  Восстановить
                </button>
                <button
                  className={styles.editBtn}
                  onClick={() => setEditingHabit(habit)}
                >
                  ⋯
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingHabit && (
        <EditHabitModal
          habit={editingHabit}
          onClose={() => setEditingHabit(null)}
        />
      )}
    </main>
  );
}
