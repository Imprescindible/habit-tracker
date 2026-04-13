import type {
  Habit,
  HabitCompletion,
  CreateHabitDTO,
  UpdateHabitDTO,
} from "../model/types";

const BASE = `${import.meta.env.VITE_API_URL ?? ""}/api/habits`;

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export const habitApi = {
  getAll: () => request<Habit[]>(BASE),

  getById: (id: string) => request<Habit>(`${BASE}/${id}`),

  create: (dto: CreateHabitDTO) =>
    request<Habit>(BASE, {
      method: "POST",
      body: JSON.stringify(dto),
    }),

  update: ({ id, ...dto }: UpdateHabitDTO) =>
    request<Habit>(`${BASE}/${id}`, {
      method: "PATCH",
      body: JSON.stringify(dto),
    }),

  archive: (id: string) =>
    request<Habit>(`${BASE}/${id}/archive`, {
      method: "POST",
    }),

  complete: (habitId: string, date: string, value?: number) =>
    request<HabitCompletion>(`${BASE}/${habitId}/completions`, {
      method: "POST",
      body: JSON.stringify({ date, value }),
    }),

  uncomplete: (habitId: string, date: string) =>
    request<void>(`${BASE}/${habitId}/completions/${date}`, {
      method: "DELETE",
    }),

  getCompletions: (habitId: string, from: string, to: string) =>
    request<HabitCompletion[]>(
      `${BASE}/${habitId}/completions?from=${from}&to=${to}`,
    ),
};
