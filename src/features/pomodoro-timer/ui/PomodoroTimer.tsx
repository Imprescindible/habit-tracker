import { useState, useEffect, useCallback } from 'react'
import styles from './PomodoroTimer.module.scss'

const WORK_SEC  = 25 * 60
const BREAK_SEC = 5 * 60

type Phase = 'work' | 'break'

interface Props {
  habitTitle?: string
}

export function PomodoroTimer({ habitTitle }: Props) {
  const [phase,     setPhase]     = useState<Phase>('work')
  const [timeLeft,  setTimeLeft]  = useState(WORK_SEC)
  const [isRunning, setIsRunning] = useState(false)
  const [sessions,  setSessions]  = useState(0)

  // Основной тик
  useEffect(() => {
    if (!isRunning) return
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          // Переключаем фазу
          setPhase((p) => {
            const next = p === 'work' ? 'break' : 'work'
            if (p === 'work') setSessions((s) => s + 1)
            setTimeLeft(next === 'work' ? WORK_SEC : BREAK_SEC)
            return next
          })
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [isRunning])

  const reset = useCallback(() => {
    setIsRunning(false)
    setPhase('work')
    setTimeLeft(WORK_SEC)
  }, [])

  const total    = phase === 'work' ? WORK_SEC : BREAK_SEC
  const progress = ((total - timeLeft) / total) * 100
  const mins     = String(Math.floor(timeLeft / 60)).padStart(2, '0')
  const secs     = String(timeLeft % 60).padStart(2, '0')

  // Цвет дуги: красный в работе, синий в перерыве
  const strokeColor = phase === 'work' ? '#E94560' : '#06BCC1'
  const r = 26
  const circ = 2 * Math.PI * r
  const dash = circ * (1 - progress / 100)

  return (
    <div className={styles.timer}>
      <div className={styles.ring}>
        <svg width="68" height="68" viewBox="0 0 68 68">
          {/* Трек */}
          <circle cx="34" cy="34" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="3" />
          {/* Прогресс */}
          <circle
            cx="34" cy="34" r={r}
            fill="none"
            stroke={strokeColor}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={`${circ}`}
            strokeDashoffset={dash}
            transform="rotate(-90 34 34)"
            style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease' }}
          />
        </svg>
        <div className={styles.time}>
          <span className={styles.digits}>{mins}:{secs}</span>
          <span className={styles.phaseLabel}>{phase === 'work' ? 'Фокус' : 'Пауза'}</span>
        </div>
      </div>

      <div className={styles.controls}>
        <button
          className={`${styles.btn} ${isRunning ? styles.pause : styles.play}`}
          onClick={() => setIsRunning((v) => !v)}
          aria-label={isRunning ? 'Пауза' : 'Старт'}
        >
          {isRunning ? '⏸' : '▶'}
        </button>
        <button className={`${styles.btn} ${styles.reset}`} onClick={reset} aria-label="Сбросить">↺</button>
      </div>

      {sessions > 0 && (
        <div className={styles.sessions}>
          {Array.from({ length: Math.min(sessions, 8) }).map((_, i) => (
            <span key={i} className={styles.dot} />
          ))}
        </div>
      )}
    </div>
  )
}
