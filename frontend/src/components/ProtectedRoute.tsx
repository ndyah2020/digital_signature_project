import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole
}) => {
  const {
    isAuthenticated,
    loading,
    user
  } = useAuth();
  if (loading) {
    return <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  // Check if user has required role
  if (requiredRole && user?.role !== requiredRole && user?.role !== 'admin') {
    return <div className="flex h-screen flex-col items-center justify-center">
        <h1 className="text-3xl font-bold">Không có quyền truy cập</h1>
        <p className="mt-2 text-gray-600">
          Bạn không có quyền truy cập trang này.
        </p>
      </div>;
  }
  return <>{children}</>;
};
export default ProtectedRoute;