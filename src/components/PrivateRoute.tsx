import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Loading from './common/Loading';

export default function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <Loading fullScreen />;
  }

  return currentUser ? <>{children}</> : <Navigate to="/login" />;
}
