import { useState } from "react";
import { useHabitStore, habitApi } from "@entities/habit";
import type { Habit, HabitType, TimeSlot, ScheduleType } from "@entities/habit";
import { Button } from "@shared/ui/Button";
import { Input, Textarea, Select } from "@shared/ui/Input";
import { Modal } from "@shared/ui/Modal";
import styles from "./EditHabitModal.module.scss";

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
  habit: Habit;
  onClose: () => void;
}

export function EditHabitModal({ habit, onClose }: Props) {
  const { updateHabit, archiveHabit, deleteHabit } = useHabitStore();

  const [title, setTitle] = useState(habit.title);
  const [description, setDescription] = useState(habit.description ?? "");
  const [type, setType] = useState<HabitType>(habit.type);
  const [goalValue, setGoalValue] = useState(String(habit.goalValue ?? ""));
  const [goalUnit, setGoalUnit] = useState(habit.goalUnit ?? "");
  const [timeSlot, setTimeSlot] = useState<TimeSlot>(habit.timeSlot);
  const [scheduleType, setScheduleType] = useState<ScheduleType>(
    habit.scheduleType,
  );
  const [scheduleDays, setScheduleDays] = useState<number[]>(
    habit.scheduleDays,
  );
  const [scheduleInterval, setScheduleInterval] = useState(
    String(habit.scheduleInterval ?? 2),
  );
  const [color, setColor] = useState(habit.color);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleDay = (day: number) =>
    setScheduleDays((p) =>
      p.includes(day) ? p.filter((d) => d !== day) : [...p, day],
    );

  const handleSave = async () => {
    if (!title.trim()) return;
    setLoading(true);
    try {
      const updated = await habitApi.update({
        id: habit.id,
        title: title.trim(),
        description: description.trim() || null,
        type,
        goalValue: type === "QUANTITATIVE" ? Number(goalValue) : null,
        goalUnit: type === "QUANTITATIVE" ? goalUnit.trim() || null : null,
        timeSlot,
        scheduleType,
        scheduleDays:
          scheduleType === "SPECIFIC_DAYS" ? scheduleDays.sort() : [],
        scheduleInterval:
          scheduleType === "INTERVAL" ? Number(scheduleInterval) : null,
        color,
      });
      updateHabit(updated);
      onClose();
    } catch {
      // можно добавить toast
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async () => {
    try {
      await habitApi.archive(habit.id);
      archiveHabit(habit.id);
      onClose();
    } catch {
      /* ignore */
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    try {
      await habitApi.delete(habit.id);
      deleteHabit(habit.id);
      onClose();
    } catch {
      /* ignore */
    }
  };

  return (
    <Modal isOpen title="Редактировать привычку" onClose={onClose}>
      <div className={styles.form}>
        <Input
          label="Название"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
        />
        <Textarea
          label="Описание"
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
              value={goalValue}
              onChange={(e) => setGoalValue(e.target.value)}
            />
            <Input
              label="Единица"
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
          <div className={styles.danger}>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleArchive}
              disabled={loading}
            >
              Архивировать
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDelete}
              disabled={loading}
            >
              {confirmDelete ? "Подтвердить удаление" : "Удалить"}
            </Button>
          </div>
          <div className={styles.main}>
            <Button variant="ghost" onClick={onClose} disabled={loading}>
              Отмена
            </Button>
            <Button variant="primary" onClick={handleSave} disabled={loading}>
              {loading ? "Сохранение..." : "Сохранить"}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
