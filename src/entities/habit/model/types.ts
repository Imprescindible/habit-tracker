// ─── entities/habit/model/types.ts ───────────────────────────────────────────
// Единственный источник правды о структуре данных привычки.
// Все слои выше импортируют типы только отсюда (через index.ts).

// ── Перечисления (зеркалят schema.prisma)

export type HabitType = 'BINARY' | 'QUANTITATIVE'

export type TimeSlot = 'MORNING' | 'AFTERNOON' | 'EVENING' | 'ANYTIME'

export type ScheduleType = 'DAILY' | 'SPECIFIC_DAYS' | 'INTERVAL'

// ── Основная модель привычки (то, что приходит с сервера)

export interface Habit {
  id:               string
  userId:           string
  title:            string
  description:      string | null
  type:             HabitType
  goalValue:        number | null   // Для QUANTITATIVE
  goalUnit:         string | null   // "литры", "страницы", "км"
  timeSlot:         TimeSlot
  scheduleType:     ScheduleType
  scheduleDays:     number[]        // [1,2,3] = пн, вт, ср
  scheduleInterval: number | null   // Раз в N дней
  color:            string          // hex, например "#E94560"
  isArchived:       boolean
  createdAt:        string          // ISO строка
  updatedAt:        string
}

// ── Выполнение привычки за конкретный день

export interface HabitCompletion {
  id:       string
  habitId:  string
  date:     string   // "YYYY-MM-DD"
  value:    number | null
}

// ── День заморозки

export interface FreezeDay {
  id:     string
  userId: string
  date:   string
  reason: string | null
}

// ── DTO для создания привычки (то, что отправляем на сервер)
// Omit убирает поля, которые генерирует сервер сам

export type CreateHabitDTO = Omit<Habit,
  'id' | 'userId' | 'createdAt' | 'updatedAt' | 'isArchived'
>

// ── DTO для обновления — все поля опциональны, кроме id

export type UpdateHabitDTO = Partial<CreateHabitDTO> & { id: string }

// ── Статистика привычки (считается на фронте или приходит с сервера)

export interface HabitStats {
  habitId:          string
  currentStreak:    number   // Текущая серия дней
  longestStreak:    number   // Рекорд
  completionRate:   number   // % за последние 7 дней (0–100)
  prevWeekRate:     number   // % за предыдущие 7 дней
  totalCompletions: number
}
