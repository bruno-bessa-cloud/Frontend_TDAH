import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '@/pages/auth/Login';
import Register from '../pages/auth/Register';
import Onboarding from '@/pages/onboarding/Onboarding';
import Dashboard from '../pages/dashboard/Dashboard';
import Achievements from '@/pages/dashboard/Achievements';
import Statistics from '@/pages/dashboard/Statistics';
import WeeklyRoutine from '../pages/schedule/WeeklyRoutine';
import MyWeek from '@/pages/schedule/MyWeek';
import TasksNotionView from '@/pages/tasks/TasksNotionView';
import Settings, {
  SettingsNotificacoes,
  SettingsAparencia,
} from '@/pages/settings/Settings';
import Profile from '@/pages/settings/Profile';
import TDAHPreferences from '@/pages/settings/TDAHPreferences';
import ProtectedRoute from '../components/layout/ProtectedRoute';
import TestLogin from '@/pages/test/TestLogin';
import TestRegister from '@/pages/test/TestRegister';
import TestDashboard from '@/pages/test/TestDashboard';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/onboarding" element={<Onboarding />} />

      {/* Testes */}
      <Route path="/test-login" element={<TestLogin />} />
      <Route path="/test-register" element={<TestRegister />} />
      <Route path="/test-dashboard" element={<TestDashboard />} />
      {/* Fim dos testes */}

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/statistics" element={<Statistics />} />
        <Route path="/schedule/routine" element={<WeeklyRoutine />} />
        <Route path="/schedule/week" element={<MyWeek />} />
        <Route path="/tasks/notion" element={<TasksNotionView />} />
        <Route path="/horarios" element={<Navigate to="/schedule/routine" replace />} />

        {/* Configurações com nested routes */}
        <Route path="/configuracoes" element={<Settings />}>
          <Route index element={<Navigate to="/configuracoes/perfil" replace />} />
          <Route path="perfil" element={<Profile />} />
          <Route path="notificacoes" element={<SettingsNotificacoes />} />
          <Route path="aparencia" element={<SettingsAparencia />} />
          <Route path="tdah" element={<TDAHPreferences />} />
        </Route>
      </Route>

      <Route path="*" element={<div>Not Found</div>} />
    </Routes>
  );
}
