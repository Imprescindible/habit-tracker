import { useEffect } from 'react'
import { useHabitStore, habitApi } from '@entities/habit'
import { HabitList }      from '@widgets/habit-list'
import { AnalyticsPanel } from '@widgets/analytics-panel'
import styles from './DashboardPage.module.scss'

export function DashboardPage() {
  const { setHabits, setCompletions, setLoading, setError, isLoading, error } = useHabitStore()

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const habits = await habitApi.getAll()
        setHabits(habits)

        // Загружаем выполнения за последние 90 дней
        const to   = new Date().toISOString().split('T')[0]
        const from = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

        const allCompletions = await Promise.all(
          habits.map((h) => habitApi.getCompletions(h.id, from, to))
        )
        setCompletions(allCompletions.flat())
      } catch (e) {
        setError('Не удалось подключиться к серверу. Убедитесь что сервер запущен.')
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  if (isLoading) {
    return (
      <div className={styles.state}>
        <div className={styles.spinner} />
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.state}>
        <p className={styles.error}>{error}</p>
        <p className={styles.hint}>Запустите сервер: <code>npm run server:dev</code></p>
      </div>
    )
  }

  return (
    <main className={styles.page}>
      <div className={styles.layout}>
        <div className={styles.main}>
          <HabitList />
        </div>
        <div className={styles.sidebar}>
          <AnalyticsPanel />
        </div>
      </div>
    </main>
  )
}
