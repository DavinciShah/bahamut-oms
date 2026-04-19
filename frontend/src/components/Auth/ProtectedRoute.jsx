import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../Common/LoadingSpinner';

function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (requiredRole === 'admin' && !isAdmin) return <Navigate to="/unauthorized" replace />;

  return children;
}

export default ProtectedRoute;
