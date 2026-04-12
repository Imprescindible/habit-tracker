import { useState } from 'react'
import { useHabitStore, selectActiveHabits, HabitCard } from '@entities/habit'
import type { Habit, TimeSlot } from '@entities/habit'
import { useToggleHabit }  from '@features/toggle-habit'
import { AddHabitForm }    from '@features/add-habit'
import { EditHabitModal }  from '@features/edit-habit'
import { PomodoroTimer }   from '@features/pomodoro-timer'
import { Button }          from '@shared/ui/Button'
import { Modal }           from '@shared/ui/Modal'
import styles              from './HabitList.module.scss'

const SLOT_META: Record<TimeSlot, { label: string; icon: string }> = {
  MORNING:   { label: 'Утро',     icon: '🌅' },
  AFTERNOON: { label: 'День',     icon: '☀️' },
  EVENING:   { label: 'Вечер',   icon: '🌙' },
  ANYTIME:   { label: 'Весь день', icon: '📅' },
}
const SLOT_ORDER: TimeSlot[] = ['MORNING', 'AFTERNOON', 'EVENING', 'ANYTIME']

export function HabitList() {
  const habits           = useHabitStore(selectActiveHabits)
  const { toggle, isCompleted } = useToggleHabit()

  const [showAdd,      setShowAdd]      = useState(false)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)

  if (habits.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>🌱</div>
        <h3 className={styles.emptyTitle}>Привычек пока нет</h3>
        <p className={styles.emptyText}>Создайте первую привычку и начните отслеживать прогресс</p>
        <Button variant="primary" onClick={() => setShowAdd(true)}>
          + Добавить первую привычку
        </Button>

        <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Новая привычка">
          <AddHabitForm onClose={() => setShowAdd(false)} />
        </Modal>
      </div>
    )
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.toolbar}>
        <h2 className={styles.sectionTitle}>Сегодня</h2>
        <Button variant="primary" size="sm" onClick={() => setShowAdd(true)}>
          + Привычка
        </Button>
      </div>

      {SLOT_ORDER.map((slot) => {
        const group = habits.filter((h) => h.timeSlot === slot)
        if (!group.length) return null
        const meta = SLOT_META[slot]

        return (
          <section key={slot} className={styles.group}>
            <div className={styles.groupHeader}>
              <span className={styles.groupIcon}>{meta.icon}</span>
              <span className={styles.groupLabel}>{meta.label}</span>
              <span className={styles.groupCount}>{group.length}</span>
            </div>

            <div className={styles.cards}>
              {group.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  isCompleted={isCompleted(habit.id)}
                  onToggle={() => toggle(habit.id)}
                  onEdit={() => setEditingHabit(habit)}
                >
                  {slot !== 'ANYTIME' && (
                    <PomodoroTimer habitTitle={habit.title} />
                  )}
                </HabitCard>
              ))}
            </div>
          </section>
        )
      })}

      {/* Модалки */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Новая привычка">
        <AddHabitForm onClose={() => setShowAdd(false)} />
      </Modal>

      {editingHabit && (
        <EditHabitModal habit={editingHabit} onClose={() => setEditingHabit(null)} />
      )}
    </div>
  )
}
