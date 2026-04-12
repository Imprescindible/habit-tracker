// ─── entities/habit/api/habitApi.ts ──────────────────────────────────────────
// Все HTTP-запросы к серверу, связанные с привычками.
// Возвращает данные — НЕ обновляет стор напрямую.
// Стор обновляется в features-слое после вызова этих функций.

import type {
  Habit,
  HabitCompletion,
  CreateHabitDTO,
  UpdateHabitDTO,
} from '../model/types'

// Базовый URL берётся из env-переменной (через shared/config/env.ts)
const BASE = '/api/habits'

// ── Вспомогательная функция: fetch + проверка статуса + JSON-парсинг
async function request<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  if (!res.ok) {
    // Достаём сообщение из тела ответа, если есть
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message ?? `HTTP ${res.status}`)
  }

  return res.json() as Promise<T>
}

// ── CRUD ─────────────────────────────────────────────────────────────────────

export const habitApi = {
  // Получить все привычки текущего пользователя
  getAll: () =>
    request<Habit[]>(BASE),

  // Получить одну привычку по id
  getById: (id: string) =>
    request<Habit>(`${BASE}/${id}`),

  // Создать новую привычку
  create: (dto: CreateHabitDTO) =>
    request<Habit>(BASE, {
      method: 'POST',
      body: JSON.stringify(dto),
    }),

  // Обновить существующую (частичное обновление — PATCH)
  update: ({ id, ...dto }: UpdateHabitDTO) =>
    request<Habit>(`${BASE}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    }),

  // Архивировать привычку (не удаляем, а прячем)
  archive: (id: string) =>
    request<Habit>(`${BASE}/${id}/archive`, {
      method: 'POST',
    }),

  // ── Выполнения ─────────────────────────────────────────────────────────

  // Отметить привычку выполненной за дату (формат "YYYY-MM-DD")
  complete: (habitId: string, date: string, value?: number) =>
    request<HabitCompletion>(`${BASE}/${habitId}/completions`, {
      method: 'POST',
      body: JSON.stringify({ date, value }),
    }),

  // Отменить выполнение
  uncomplete: (habitId: string, date: string) =>
    request<void>(`${BASE}/${habitId}/completions/${date}`, {
      method: 'DELETE',
    }),

  // Получить выполнения за период (для тепловой карты)
  getCompletions: (habitId: string, from: string, to: string) =>
    request<HabitCompletion[]>(
      `${BASE}/${habitId}/completions?from=${from}&to=${to}`
    ),
}
