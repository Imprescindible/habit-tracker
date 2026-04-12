// ─── app/providers/StoreProvider.tsx ─────────────────────────────────────────
// Zustand не требует провайдера как Redux, но этот файл —
// место для будущих провайдеров (React Query, Auth и т.д.)

import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

export function StoreProvider({ children }: Props) {
  // Здесь будут обёртки: QueryClientProvider, AuthProvider и т.д.
  return <>{children}</>
}
