import { useAuth } from '../context/AuthContext'
import EmployeeDashboard from './EmployeeDashboard'
import AnalyticsDashboard from './AnalyticsDashboard'

export default function HomeRedirect() {
  const { isAdmin, loading } = useAuth()
  if (loading) return null
  return isAdmin ? <AnalyticsDashboard /> : <EmployeeDashboard />
}
