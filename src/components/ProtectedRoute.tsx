// src/components/ProtectedRoute.tsx
import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

interface Props {
  requireAdmin?: boolean;
}

export const ProtectedRoute = ({ requireAdmin = false }: Props) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    // enquanto conferimos o storage, exibe um spinner ou tela em branco
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
};
