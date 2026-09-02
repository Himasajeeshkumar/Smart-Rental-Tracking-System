import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole: UserRole;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRole }) => {
  const { isAuthenticated, session } = useAuth();

  if (!isAuthenticated || !session) {
    window.location.href = '/login';
    return null;
  }

  if (session.role !== allowedRole) {
    if (session.role === 'customer') {
      window.location.href = '/customer/portal';
      return null;
    } else {
      window.location.href = '/company/overview';
      return null;
    }
  }

  return <>{children}</>;
};
