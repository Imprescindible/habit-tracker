import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useHabitStore, selectHabitById } from "@entities/habit";
import { useToggleHabit } from "@features/toggle-habit";
import { EditHabitModal } from "@features/edit-habit";
import { PomodoroTimer } from "@features/pomodoro-timer";
import { Button } from "@shared/ui/Button";
import styles from "./HabitDetailPage.module.scss";

const MONTH_NAMES = [
  "Янв",
  "Фев",
  "Мар",
  "Апр",
  "Май",
  "Июн",
  "Июл",
  "Авг",
  "Сен",
  "Окт",
  "Ноя",
  "Дек",
];
const DAY_SHORT = ["", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

function getLast84Days(): string[] {
  return Array.from({ length: 84 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (83 - i));
    return d.toISOString().split("T")[0];
  });
}

export function HabitDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const habit = useHabitStore(selectHabitById(id ?? ""));
  const completions = useHabitStore((s) =>
    s.completions.filter((c) => c.habitId === id),
  );
  const { toggle, isCompleted } = useToggleHabit();
  const [showEdit, setShowEdit] = useState(false);

  const days = useMemo(() => getLast84Days(), []);

  const completedSet = useMemo(
    () => new Set(completions.map((c) => c.date)),
    [completions],
  );

  const stats = useMemo(() => {
    let currentStreak = 0;
    let longestStreak = 0;
    let temp = 0;
    const sorted = [...completedSet].sort();

    for (let i = 0; i < sorted.length; i++) {
      const prev = i === 0 ? null : sorted[i - 1];
      if (prev) {
        const diff =
          (new Date(sorted[i]).getTime() - new Date(prev).getTime()) / 86400000;
        temp = diff === 1 ? temp + 1 : 1;
      } else {
        temp = 1;
      }
      longestStreak = Math.max(longestStreak, temp);
    }

    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      if (completedSet.has(d.toISOString().split("T")[0])) currentStreak++;
      else break;
    }

    const thisWeek = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split("T")[0];
    }).filter((d) => completedSet.has(d)).length;

    return { currentStreak, longestStreak, total: completedSet.size, thisWeek };
  }, [completedSet]);

  if (!habit) {
    return (
      <div className={styles.notFound}>
        <p>Привычка не найдена</p>
        <Button onClick={() => navigate("/dashboard")}>← На дашборд</Button>
      </div>
    );
  }

  const firstDate = new Date(days[0]);
  const weekOffset = (firstDate.getDay() + 6) % 7; // 0=Пн

  const monthMarkers = useMemo(() => {
    const markers: { col: number; label: string }[] = [];
    days.forEach((d, i) => {
      const date = new Date(d);
      if (date.getDate() === 1 || i === 0) {
        markers.push({
          col: Math.floor((i + weekOffset) / 7) + 1,
          label: MONTH_NAMES[date.getMonth()],
        });
      }
    });
    return markers;
  }, [days, weekOffset]);

  const totalCols = Math.ceil((days.length + weekOffset) / 7);

  const today = new Date().toISOString().split("T")[0];
  const todayDone = isCompleted(habit.id);

  return (
    <main className={styles.page}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/dashboard")}
        className={styles.back}
      >
        ← Назад
      </Button>

      <div className={styles.hero} style={{ borderColor: habit.color }}>
        <div className={styles.heroLeft}>
          <div
            className={styles.colorDot}
            style={{ background: habit.color }}
          />
          <div>
            <h1 className={styles.title}>{habit.title}</h1>
            {habit.description && (
              <p className={styles.desc}>{habit.description}</p>
            )}
            <div className={styles.tags}>
              <span className={styles.tag}>
                {habit.type === "BINARY"
                  ? "✓ Бинарная"
                  : `📊 ${habit.goalValue} ${habit.goalUnit}`}
              </span>
              <span className={styles.tag}>
                {habit.timeSlot === "MORNING"
                  ? "🌅 Утро"
                  : habit.timeSlot === "AFTERNOON"
                    ? "☀️ День"
                    : habit.timeSlot === "EVENING"
                      ? "🌙 Вечер"
                      : "📅 Весь день"}
              </span>
              <span className={styles.tag}>
                {habit.scheduleType === "DAILY"
                  ? "Каждый день"
                  : habit.scheduleType === "SPECIFIC_DAYS"
                    ? `Дни: ${habit.scheduleDays.map((d) => DAY_SHORT[d]).join(", ")}`
                    : `Раз в ${habit.scheduleInterval} д.`}
              </span>
            </div>
          </div>
        </div>
        <div className={styles.heroRight}>
          <button
            className={`${styles.toggleBtn} ${todayDone ? styles.done : ""}`}
            style={{
              borderColor: habit.color,
              ...(todayDone ? { background: habit.color } : {}),
            }}
            onClick={() => toggle(habit.id)}
          >
            {todayDone ? "✓ Выполнено" : "Отметить сегодня"}
          </button>
          <Button variant="ghost" size="sm" onClick={() => setShowEdit(true)}>
            Изменить
          </Button>
        </div>
      </div>

      <div className={styles.statsRow}>
        {[
          { icon: "🔥", val: stats.currentStreak, label: "Серия сейчас" },
          { icon: "🏆", val: stats.longestStreak, label: "Рекорд" },
          { icon: "⭐", val: stats.total, label: "Всего выполнений" },
          { icon: "📅", val: stats.thisWeek, label: "На этой неделе" },
        ].map((s) => (
          <div key={s.label} className={styles.statCard}>
            <span className={styles.statIcon}>{s.icon}</span>
            <span className={styles.statNum}>{s.val}</span>
            <span className={styles.statLabel}>{s.label}</span>
          </div>
        ))}
      </div>

      <div className={styles.heatmapCard}>
        <h2 className={styles.sectionTitle}>История — последние 12 недель</h2>

        <div className={styles.heatmapWrap}>
          <div
            className={styles.monthRow}
            style={{ gridTemplateColumns: `repeat(${totalCols}, 1fr)` }}
          >
            {monthMarkers.map((m) => (
              <span
                key={m.col}
                className={styles.monthLabel}
                style={{ gridColumnStart: m.col }}
              >
                {m.label}
              </span>
            ))}
          </div>

          <div className={styles.heatmapBody}>
            <div className={styles.weekLabels}>
              {["Пн", "", "Ср", "", "Пт", "", "Вс"].map((d, i) => (
                <span key={i} className={styles.weekLabel}>
                  {d}
                </span>
              ))}
            </div>

            <div
              className={styles.grid}
              style={{ gridTemplateColumns: `repeat(${totalCols}, 1fr)` }}
            >
              {Array.from({ length: weekOffset }).map((_, i) => (
                <div key={`pad-${i}`} className={styles.cellEmpty} />
              ))}
              {days.map((date) => {
                const done = completedSet.has(date);
                const isToday = date === today;
                return (
                  <div
                    key={date}
                    className={`${styles.cell} ${done ? styles.cellDone : ""} ${isToday ? styles.cellToday : ""}`}
                    style={
                      done
                        ? {
                            background: "#22c55e",
                            boxShadow: "0 0 6px rgba(34,197,94,0.4)",
                          }
                        : undefined
                    }
                    title={`${date}${done ? " — выполнено" : ""}`}
                    onClick={() =>
                      toggle(habit.id, undefined, new Date(date + "T12:00:00"))
                    }
                  />
                );
              })}
            </div>
          </div>
        </div>

        <div className={styles.legendRow}>
          <div
            className={styles.cellEmpty}
            style={{
              width: 12,
              height: 12,
              borderRadius: 2,
              display: "inline-block",
              marginRight: 4,
            }}
          />
          <span className={styles.legendText}>Не выполнено</span>
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: 2,
              background: "#22c55e",
              display: "inline-block",
              margin: "0 4px 0 12px",
            }}
          />
          <span className={styles.legendText}>
            Выполнено (нажмите на ячейку чтобы отметить)
          </span>
        </div>
      </div>

      {habit.timeSlot !== "ANYTIME" && (
        <div className={styles.pomodoroCard}>
          <h2 className={styles.sectionTitle}>Таймер Помодоро</h2>
          <PomodoroTimer habitTitle={habit.title} />
        </div>
      )}

      {showEdit && (
        <EditHabitModal habit={habit} onClose={() => setShowEdit(false)} />
      )}
    </main>
  );
}
