import { Router } from 'express'
import { prisma }  from '../prisma'

export const completionsRouter = Router()

// ── GET /api/habits/:habitId/completions?from=&to=
completionsRouter.get('/:habitId/completions', async (req, res) => {
  try {
    const { habitId } = req.params
    const { from, to } = req.query as { from?: string; to?: string }

    const where: Record<string, unknown> = { habitId }

    if (from || to) {
      where.date = {
        ...(from ? { gte: new Date(from) } : {}),
        ...(to   ? { lte: new Date(to)   } : {}),
      }
    }

    const completions = await prisma.habitCompletion.findMany({
      where,
      orderBy: { date: 'asc' },
    })

    // Отдаём date как строку "YYYY-MM-DD"
    const result = completions.map((c) => ({
      ...c,
      date: c.date.toISOString().split('T')[0],
    }))

    res.json(result)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})

// ── POST /api/habits/:habitId/completions — отметить выполнение
completionsRouter.post('/:habitId/completions', async (req, res) => {
  try {
    const { habitId } = req.params
    const { date, value } = req.body

    if (!date) return res.status(400).json({ message: 'date обязателен' })

    // upsert — если уже есть запись за этот день, обновляем value
    const completion = await prisma.habitCompletion.upsert({
      where:  { habitId_date: { habitId, date: new Date(date) } },
      update: { value: value ?? null },
      create: { habitId, date: new Date(date), value: value ?? null },
    })

    res.status(201).json({
      ...completion,
      date: completion.date.toISOString().split('T')[0],
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})

// ── DELETE /api/habits/:habitId/completions/:date — отменить выполнение
completionsRouter.delete('/:habitId/completions/:date', async (req, res) => {
  try {
    const { habitId, date } = req.params

    await prisma.habitCompletion.delete({
      where: { habitId_date: { habitId, date: new Date(date) } },
    })

    res.status(204).send()
  } catch (err) {
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})
