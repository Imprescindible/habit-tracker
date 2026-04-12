import { useMemo } from 'react'
import { useHabitStore, selectActiveHabits, selectTodayCompletions } from '@entities/habit'
import styles from './AnalyticsPanel.module.scss'

// Генерируем последние N дней
function getLastDays(n: number): string[] {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (n - 1 - i))
    return d.toISOString().split('T')[0]
  })
}

function getIntensity(count: number, max: number): number {
  if (count === 0 || max === 0) return 0
  const ratio = count / max
  if (ratio < 0.25) return 1
  if (ratio < 0.5)  return 2
  if (ratio < 0.75) return 3
  return 4
}

const DAY_LABELS = ['Пн','','Ср','','Пт','','Вс']
const MONTH_NAMES = ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек']

export function AnalyticsPanel() {
  const habits          = useHabitStore(selectActiveHabits)
  const allCompletions  = useHabitStore((s) => s.completions)
  const todayDone       = useHabitStore(selectTodayCompletions)

  const days = useMemo(() => getLastDays(35), [])

  // Считаем количество выполненных привычек по каждому дню
  const completionMap = useMemo(() => {
    const map: Record<string, number> = {}
    allCompletions.forEach((c) => {
      map[c.date] = (map[c.date] ?? 0) + 1
    })
    return map
  }, [allCompletions])

  const maxPerDay = useMemo(
    () => Math.max(1, ...Object.values(completionMap)),
    [completionMap]
  )

  // Текущий стрик (дней подряд хоть одна привычка выполнена)
  const currentStreak = useMemo(() => {
    let streak = 0
    const today = new Date()
    for (let i = 0; i < 365; i++) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const key = d.toISOString().split('T')[0]
      if (completionMap[key]) streak++
      else break
    }
    return streak
  }, [completionMap])

  // Прогресс сегодня
  const totalToday = habits.length
  const doneToday  = todayDone.length

  // Всего выполнений за всё время
  const totalAll = allCompletions.length

  // Недельный процент (текущая vs прошлая)
  const thisWeek = useMemo(() => {
    const today = new Date()
    let count = 0
    for (let i = 0; i < 7; i++) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      count += completionMap[d.toISOString().split('T')[0]] ?? 0
    }
    return count
  }, [completionMap])

  // Сетка для тепловой карты: 5 строк × 7 столбцов
  const grid = useMemo(() => {
    const rows: { date: string; count: number; intensity: number }[][] = []
    for (let row = 0; row < 5; row++) {
      rows.push(days.slice(row * 7, row * 7 + 7).map((date) => ({
        date,
        count:     completionMap[date] ?? 0,
        intensity: getIntensity(completionMap[date] ?? 0, maxPerDay),
      })))
    }
    return rows
  }, [days, completionMap, maxPerDay])

  // Метки месяцев
  const monthLabel = useMemo(() => {
    const first  = new Date(days[0])
    const last   = new Date(days[days.length - 1])
    if (first.getMonth() === last.getMonth()) return MONTH_NAMES[first.getMonth()]
    return `${MONTH_NAMES[first.getMonth()]} — ${MONTH_NAMES[last.getMonth()]}`
  }, [days])

  return (
    <aside className={styles.panel}>

      {/* Прогресс сегодня */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardLabel}>Сегодня</span>
          <span className={styles.cardValue}>{doneToday} / {totalToday}</span>
        </div>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: totalToday ? `${(doneToday / totalToday) * 100}%` : '0%' }}
          />
        </div>
        <p className={styles.hint}>
          {totalToday === 0 ? 'Добавьте привычки' :
           doneToday === totalToday ? '🎉 Все выполнено!' :
           `Осталось ${totalToday - doneToday}`}
        </p>
      </div>

      {/* Стрик */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>🔥</span>
          <span className={styles.statNum}>{currentStreak}</span>
          <span className={styles.statLabel}>Серия дней</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>⭐</span>
          <span className={styles.statNum}>{totalAll}</span>
          <span className={styles.statLabel}>Всего</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>📅</span>
          <span className={styles.statNum}>{thisWeek}</span>
          <span className={styles.statLabel}>Неделя</span>
        </div>
      </div>

      {/* Тепловая карта */}
      <div className={styles.heatmap}>
        <div className={styles.heatmapHeader}>
          <span className={styles.cardLabel}>Активность</span>
          <span className={styles.monthLabel}>{monthLabel}</span>
        </div>

        <div className={styles.dayLabels}>
          {DAY_LABELS.map((d, i) => (
            <span key={i} className={styles.dayLabel}>{d}</span>
          ))}
        </div>

        <div className={styles.grid}>
          {grid.map((row, ri) =>
            row.map((cell, ci) => (
              <div
                key={`${ri}-${ci}`}
                className={`${styles.cell} ${styles[`i${cell.intensity}`]}`}
                title={`${cell.date}: ${cell.count} выполнений`}
              />
            ))
          )}
        </div>

        <div className={styles.legend}>
          <span className={styles.legendLabel}>Меньше</span>
          {[0,1,2,3,4].map((i) => (
            <div key={i} className={`${styles.cell} ${styles[`i${i}`]}`} />
          ))}
          <span className={styles.legendLabel}>Больше</span>
        </div>
      </div>

      {/* Список активных привычек */}
      {habits.length > 0 && (
        <div className={styles.habitsList}>
          <span className={styles.cardLabel}>Привычки ({habits.length})</span>
          {habits.map((h) => (
            <div key={h.id} className={styles.habitRow}>
              <span className={styles.habitDot} style={{ background: h.color }} />
              <span className={styles.habitName}>{h.title}</span>
            </div>
          ))}
        </div>
      )}
    </aside>
  )
}
