import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Header } from "@widgets/header";
import { DashboardPage } from "@pages/dashboard";

const HabitDetailPage = lazy(() =>
  import("@pages/habit-detail").then((m) => ({ default: m.HabitDetailPage })),
);
const ArchivePage = lazy(() =>
  import("@pages/archive").then((m) => ({ default: m.ArchivePage })),
);

function Spinner() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "50vh",
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          border: "3px solid rgba(255,255,255,0.08)",
          borderTopColor: "#E94560",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <Header />
      <Suspense fallback={<Spinner />}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/habits/:id" element={<HabitDetailPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
          <Route path="/archive" element={<ArchivePage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
