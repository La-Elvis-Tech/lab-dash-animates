
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthContext } from "@/context/AuthContext";

export const ProtectedRoute = () => {
  const { isAuthenticated, loading, profile, user } = useAuthContext();
  const location = useLocation();

  console.log('ProtectedRoute check:', { 
    isAuthenticated, 
    loading, 
    profile: profile?.status,
    hasUser: !!user,
    hasProfile: !!profile 
  });

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

  // Se não está autenticado ou não tem usuário
  if (!isAuthenticated || !user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Se tem usuário mas não tem perfil ou perfil não está ativo
  if (!profile || profile.status !== 'active') {
    console.log('ProtectedRoute: redirecting due to profile status:', profile?.status);
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <Outlet />;
};
