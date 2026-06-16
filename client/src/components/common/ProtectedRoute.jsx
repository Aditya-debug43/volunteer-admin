import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Spinner from './Spinner';

// Guards routes by auth + optional role list.
export default function ProtectedRoute({ children, roles, loginPath = '/login' }) {
  const { user, isReady } = useAuth();
  if (!isReady) return <Spinner />;
  if (!user) return <Navigate to={loginPath} replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}
