import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AppShell from './components/AppShell'
import Login from './pages/Login'
import Register from './pages/Register'
import HomeRedirect from './pages/HomeRedirect'
import Knowledge from './pages/Knowledge'
import KnowledgeDetail from './pages/KnowledgeDetail'
import MyTips from './pages/MyTips'
import Saved from './pages/Saved'
import Printers from './pages/Printers'
import Parts from './pages/Parts'
import Issues from './pages/Issues'
import Jobs from './pages/Jobs'
import Ink from './pages/Ink'
import Maintenance from './pages/Maintenance'
import Content from './pages/Content'
import AnalyticsDashboard from './pages/AnalyticsDashboard'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route path="/app" element={<HomeRedirect />} />
              <Route path="/app/knowledge" element={<Knowledge />} />
              <Route path="/app/knowledge/:id" element={<KnowledgeDetail />} />
              <Route path="/app/tutorials" element={<Knowledge forcedType="tutorial" />} />
              <Route path="/app/troubleshooting" element={<Knowledge forcedType="troubleshooting" />} />
              <Route path="/app/tips" element={<MyTips />} />
              <Route path="/app/saved" element={<Saved />} />
              <Route path="/app/equipment" element={<Printers />} />
              <Route path="/app/issues" element={<Issues />} />
              <Route path="/app/jobs" element={<Jobs />} />
              <Route element={<ProtectedRoute adminOnly />}>
                <Route path="/app/analytics" element={<AnalyticsDashboard />} />
                <Route path="/app/parts" element={<Parts />} />
                <Route path="/app/ink" element={<Ink />} />
                <Route path="/app/maintenance" element={<Maintenance />} />
                <Route path="/app/content" element={<Content />} />
              </Route>
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/app" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
