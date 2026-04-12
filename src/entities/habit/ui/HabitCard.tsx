import { Link } from 'react-router-dom'
import type { Habit } from '../model/types'
import styles from './HabitCard.module.scss'

const SLOT_LABELS: Record<Habit['timeSlot'], string> = {
  MORNING: '🌅 Утро', AFTERNOON: '☀️ День', EVENING: '🌙 Вечер', ANYTIME: '',
}

interface HabitCardProps {
  habit:       Habit
  isCompleted: boolean
  onToggle:    () => void
  onEdit?:     () => void
  children?:   React.ReactNode
}

export function HabitCard({ habit, isCompleted, onToggle, onEdit, children }: HabitCardProps) {
  return (
    <article
      className={`${styles.card} ${isCompleted ? styles.completed : ''}`}
      style={{ borderLeftColor: habit.color }}
    >
      <div className={styles.header}>
        <button
          className={`${styles.checkbox} ${isCompleted ? styles.checked : ''}`}
          onClick={onToggle}
          aria-label={isCompleted ? 'Отменить' : 'Выполнить'}
          style={isCompleted ? { borderColor: habit.color, background: habit.color } : { borderColor: habit.color }}
        >
          {isCompleted && <span className={styles.checkmark}>✓</span>}
        </button>
        <div className={styles.titleGroup}>
          <Link to={`/habits/${habit.id}`} className={styles.title}>{habit.title}</Link>
          {habit.description && <p className={styles.description}>{habit.description}</p>}
        </div>
        {onEdit && (
          <button className={styles.editBtn} onClick={onEdit} aria-label="Редактировать">⋯</button>
        )}
      </div>
      <div className={styles.meta}>
        {SLOT_LABELS[habit.timeSlot] && <span className={styles.badge}>{SLOT_LABELS[habit.timeSlot]}</span>}
        {habit.type === 'QUANTITATIVE' && habit.goalValue && (
          <span className={styles.badge}>{habit.goalValue} {habit.goalUnit}</span>
        )}
        {habit.scheduleType === 'INTERVAL' && (
          <span className={styles.badge}>Раз в {habit.scheduleInterval} д.</span>
        )}
      </div>
      {children && <div className={styles.children}>{children}</div>}
    </article>
  )
}
