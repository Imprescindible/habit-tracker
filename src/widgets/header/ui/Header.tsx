import { Link, useLocation } from "react-router-dom";
import styles from "./Header.module.scss";

const today = new Date().toLocaleDateString("ru-RU", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

export function Header() {
  const { pathname } = useLocation();

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to="/dashboard" className={styles.logo}>
          <span className={styles.logoIcon}>🔥</span>
          <span className={styles.logoText}>HabitFlow</span>
        </Link>

        <nav className={styles.nav}>
          <Link
            to="/dashboard"
            className={`${styles.link} ${pathname === "/dashboard" ? styles.active : ""}`}
          >
            Дашборд
          </Link>
        </nav>
        <nav className={styles.nav}>
          <Link
            to="/dashboard"
            className={`${styles.link} ${pathname === "/dashboard" ? styles.active : ""}`}
          >
            Дашборд
          </Link>
          <Link
            to="/archive"
            className={`${styles.link} ${pathname === "/archive" ? styles.active : ""}`}
          >
            Архив
          </Link>
        </nav>

        <div className={styles.date}>{today}</div>
      </div>
    </header>
  );
}
