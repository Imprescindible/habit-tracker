import { useState } from "react";
import { useHabitStore, habitApi } from "@entities/habit";
import type {
  CreateHabitDTO,
  HabitType,
  TimeSlot,
  ScheduleType,
} from "@entities/habit";
import { Button } from "@shared/ui/Button";
import { Input, Textarea, Select } from "@shared/ui/Input";
import styles from "./AddHabitForm.module.scss";

const COLORS = [
  "#E94560",
  "#7C3AED",
  "#06BCC1",
  "#F59E0B",
  "#10B981",
  "#3B82F6",
];
const DAYS_RU = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

interface Props {
  onClose: () => void;
}

export function AddHabitForm({ onClose }: Props) {
  const { habits, setHabits } = useHabitStore();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<HabitType>("BINARY");
  const [goalValue, setGoalValue] = useState("");
  const [goalUnit, setGoalUnit] = useState("");
  const [timeSlot, setTimeSlot] = useState<TimeSlot>("ANYTIME");
  const [scheduleType, setScheduleType] = useState<ScheduleType>("DAILY");
  const [scheduleDays, setScheduleDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [scheduleInterval, setScheduleInterval] = useState("2");
  const [color, setColor] = useState(COLORS[0]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const toggleDay = (day: number) =>
    setScheduleDays((p) =>
      p.includes(day) ? p.filter((d) => d !== day) : [...p, day],
    );

  const validate = () => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = "Название обязательно";
    if (type === "QUANTITATIVE" && Number(goalValue) <= 0)
      e.goalValue = "Укажите цель > 0";
    if (scheduleType === "SPECIFIC_DAYS" && scheduleDays.length === 0)
      e.days = "Выберите хотя бы один день";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }

    const dto: CreateHabitDTO = {
      title: title.trim(),
      description: description.trim() || null,
      type,
      goalValue: type === "QUANTITATIVE" ? Number(goalValue) : null,
      goalUnit: type === "QUANTITATIVE" ? goalUnit.trim() || null : null,
      timeSlot,
      scheduleType,
      scheduleDays: scheduleType === "SPECIFIC_DAYS" ? scheduleDays.sort() : [],
      scheduleInterval:
        scheduleType === "INTERVAL" ? Number(scheduleInterval) : null,
      color,
    };

    setLoading(true);
    try {
      const habit = await habitApi.create(dto);
      setHabits([...habits, habit]);

      onClose();
    } catch {
      setErrors({ title: "Ошибка сервера. Попробуйте снова." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.form}>
      <Input
        label="Название"
        placeholder="Выпить 2 литра воды"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        error={errors.title}
        autoFocus
      />

      <Textarea
        label="Описание (необязательно)"
        placeholder="Подробности..."
        rows={2}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <div className={styles.field}>
        <span className={styles.label}>Тип</span>
        <div className={styles.toggleGroup}>
          {(["BINARY", "QUANTITATIVE"] as HabitType[]).map((t) => (
            <button
              key={t}
              className={`${styles.toggleBtn} ${type === t ? styles.active : ""}`}
              onClick={() => setType(t)}
            >
              {t === "BINARY" ? "✓ Выполнено/Нет" : "📊 Количество"}
            </button>
          ))}
        </div>
      </div>

      {type === "QUANTITATIVE" && (
        <div className={styles.row}>
          <Input
            label="Цель"
            type="number"
            placeholder="2"
            value={goalValue}
            onChange={(e) => setGoalValue(e.target.value)}
            error={errors.goalValue}
          />
          <Input
            label="Единица"
            placeholder="литра"
            value={goalUnit}
            onChange={(e) => setGoalUnit(e.target.value)}
          />
        </div>
      )}

      <Select
        label="Время дня"
        value={timeSlot}
        onChange={(e) => setTimeSlot(e.target.value as TimeSlot)}
      >
        <option value="ANYTIME">📅 Весь день</option>
        <option value="MORNING">🌅 Утро</option>
        <option value="AFTERNOON">☀️ День</option>
        <option value="EVENING">🌙 Вечер</option>
      </Select>

      <Select
        label="Расписание"
        value={scheduleType}
        onChange={(e) => setScheduleType(e.target.value as ScheduleType)}
      >
        <option value="DAILY">Каждый день</option>
        <option value="SPECIFIC_DAYS">Конкретные дни</option>
        <option value="INTERVAL">Раз в N дней</option>
      </Select>

      {scheduleType === "SPECIFIC_DAYS" && (
        <div className={styles.field}>
          <span className={styles.label}>Дни недели</span>
          <div className={styles.daysGrid}>
            {DAYS_RU.map((day, i) => (
              <button
                key={i}
                className={`${styles.dayBtn} ${scheduleDays.includes(i + 1) ? styles.dayActive : ""}`}
                onClick={() => toggleDay(i + 1)}
              >
                {day}
              </button>
            ))}
          </div>
          {errors.days && <span className={styles.error}>{errors.days}</span>}
        </div>
      )}

      {scheduleType === "INTERVAL" && (
        <Input
          label="Раз в N дней"
          type="number"
          min={1}
          value={scheduleInterval}
          onChange={(e) => setScheduleInterval(e.target.value)}
        />
      )}

      <div className={styles.field}>
        <span className={styles.label}>Цвет</span>
        <div className={styles.colorRow}>
          {COLORS.map((c) => (
            <button
              key={c}
              className={`${styles.colorSwatch} ${color === c ? styles.colorActive : ""}`}
              style={{ background: c }}
              onClick={() => setColor(c)}
            />
          ))}
        </div>
      </div>

      <div className={styles.actions}>
        <Button variant="ghost" onClick={onClose} disabled={loading}>
          Отмена
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={loading}>
          {loading ? "Сохранение..." : "Создать привычку"}
        </Button>
      </div>
    </div>
  );
}
