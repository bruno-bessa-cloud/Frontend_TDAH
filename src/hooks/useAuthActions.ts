import { useAuth } from '../context/AuthContext';

export function useAuthActions() {
  const { login, register, logout } = useAuth();
  return { login, register, logout };
}
