
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthContext } from "@/context/AuthContext";

export const ProtectedRoute = () => {
  const { isAuthenticated, loading, profile } = useAuthContext();
  const location = useLocation();

  console.log('ProtectedRoute check:', { isAuthenticated, loading, profile: profile?.status });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lab-blue mx-auto"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (profile && profile.status !== 'active') {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <Outlet />;
};
