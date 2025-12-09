import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

function ProtectedRoute({ children, requiredRole = null }) {
    const { isAuthenticated, user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl text-gray-600 dark:text-gray-400">Загрузка...</div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/auth/login" replace />;
    }

    if (requiredRole && user?.role !== requiredRole) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl text-red-600 dark:text-red-400">
                    ❌ У вас нет доступа к этой странице
                </div>
            </div>
        );
    }

    return children;
}

export default ProtectedRoute;