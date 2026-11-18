import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { useAuth } from './auth/AuthProvider'
import { AppShell } from './components/AppShell'
import { FullScreenMessage } from './components/ui'
import { BoardProvider } from './data/BoardProvider'
import { DashboardPage } from './pages/DashboardPage'
import { GoalDetailPage } from './pages/GoalDetailPage'
import { GoalsPage } from './pages/GoalsPage'
import { LoginPage } from './pages/LoginPage'
import { ProjectsPage } from './pages/ProjectsPage'
import { WeekPage } from './pages/WeekPage'

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route element={<AppShell />}>
          <Route index element={<DashboardPage />} />
          <Route path="mal" element={<GoalsPage />} />
          <Route path="mal/:goalId" element={<GoalDetailPage />} />
          <Route path="projekt" element={<ProjectsPage />} />
          <Route path="vecka" element={<WeekPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function RequireAuth() {
  const auth = useAuth()
  if (!auth.configured) {
    return <FullScreenMessage title="Koppla Neon innan du fortsätter" body={auth.configMessage ?? ''} />
  }
  if (auth.loading) {
    return <FullScreenMessage title="Kontrollerar sessionen" body="Ett ögonblick." />
  }
  if (!auth.user || !auth.client) return <Navigate to="/login" replace />
  return (
    <BoardProvider client={auth.client}>
      <Outlet />
    </BoardProvider>
  )
}
