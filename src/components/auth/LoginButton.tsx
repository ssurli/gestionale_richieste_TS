/**
 * Login Button Component
 * Gestisce login/logout con Microsoft SSO
 */

'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LogIn, LogOut, User as UserIcon } from 'lucide-react';

export const LoginButton: React.FC = () => {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg animate-pulse">
        <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
        <div className="w-20 h-4 bg-gray-300 rounded"></div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
          <UserIcon className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-900">
            {user.nome} {user.cognome}
          </span>
          <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
            {user.ruolo.replace('_', ' ')}
          </span>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-medium">Esci</span>
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={login}
      className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
    >
      <LogIn className="w-5 h-5" />
      <span className="font-medium">Accedi con Microsoft</span>
    </button>
  );
};
