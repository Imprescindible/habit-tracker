import { Router } from 'express'
import { prisma }  from '../prisma'

export const habitsRouter = Router()

// Временный userId — в реальном проекте берётся из JWT
const DEFAULT_USER_ID = 'local-user'

// Создаём пользователя если нет (для demo без авторизации)
async function ensureUser() {
  return prisma.user.upsert({
    where:  { id: DEFAULT_USER_ID },
    update: {},
    create: { id: DEFAULT_USER_ID, email: 'user@local.dev', name: 'Local User' },
  })
}

// ── GET /api/habits — все привычки
habitsRouter.get('/', async (_req, res) => {
  try {
    await ensureUser()
    const habits = await prisma.habit.findMany({
      where:   { userId: DEFAULT_USER_ID },
      orderBy: { createdAt: 'asc' },
    })
    res.json(habits)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})

// ── GET /api/habits/:id — одна привычка
habitsRouter.get('/:id', async (req, res) => {
  try {
    const habit = await prisma.habit.findFirst({
      where: { id: req.params.id, userId: DEFAULT_USER_ID },
    })
    if (!habit) return res.status(404).json({ message: 'Не найдено' })
    res.json(habit)
  } catch (err) {
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})

// ── POST /api/habits — создать привычку
habitsRouter.post('/', async (req, res) => {
  try {
    await ensureUser()
    const {
      title, description, type, goalValue, goalUnit,
      timeSlot, scheduleType, scheduleDays, scheduleInterval, color,
    } = req.body

    if (!title?.trim()) {
      return res.status(400).json({ message: 'Название обязательно' })
    }

    const habit = await prisma.habit.create({
      data: {
        userId:           DEFAULT_USER_ID,
        title:            title.trim(),
        description:      description?.trim() || null,
        type:             type       ?? 'BINARY',
        goalValue:        goalValue  ?? null,
        goalUnit:         goalUnit   ?? null,
        timeSlot:         timeSlot   ?? 'ANYTIME',
        scheduleType:     scheduleType ?? 'DAILY',
        scheduleDays:     scheduleDays ?? [],
        scheduleInterval: scheduleInterval ?? null,
        color:            color ?? '#E94560',
      },
    })
    res.status(201).json(habit)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})

// ── PATCH /api/habits/:id — обновить привычку
habitsRouter.patch('/:id', async (req, res) => {
  try {
    const existing = await prisma.habit.findFirst({
      where: { id: req.params.id, userId: DEFAULT_USER_ID },
    })
    if (!existing) return res.status(404).json({ message: 'Не найдено' })

    const habit = await prisma.habit.update({
      where: { id: req.params.id },
      data:  req.body,
    })
    res.json(habit)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})

// ── POST /api/habits/:id/archive — архивировать
habitsRouter.post('/:id/archive', async (req, res) => {
  try {
    const habit = await prisma.habit.update({
      where: { id: req.params.id },
      data:  { isArchived: true },
    })
    res.json(habit)
  } catch (err) {
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})

// ── DELETE /api/habits/:id — удалить
habitsRouter.delete('/:id', async (req, res) => {
  try {
    await prisma.habit.delete({ where: { id: req.params.id } })
    res.status(204).send()
  } catch (err) {
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})
