/**
 * Auth Context con MSAL
 * Gestisce autenticazione SSO Microsoft e stato utente
 */

'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { PublicClientApplication, AccountInfo } from '@azure/msal-browser';
import { MsalProvider, useMsal, useIsAuthenticated } from '@azure/msal-react';
import { msalConfig, loginRequest } from '@/lib/msalConfig';
import { dataverseClient } from '@/lib/dataverseClient';
import type { User } from '@/types';

// Inizializza MSAL instance
const msalInstance = new PublicClientApplication(msalConfig);

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  account: AccountInfo | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Hook per usare auth context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve essere usato dentro AuthProvider');
  }
  return context;
};

/**
 * Provider interno che usa MSAL hooks
 */
const AuthProviderInner: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { instance, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const account = accounts[0] || null;

  // Carica utente da Dataverse quando authenticated
  useEffect(() => {
    const loadUser = async () => {
      if (!isAuthenticated || !account) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const dataverseUser = await dataverseClient.getCurrentUser();
        setUser(dataverseUser);
      } catch (error) {
        console.error('Errore caricamento utente:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, [isAuthenticated, account]);

  const login = async () => {
    try {
      await instance.loginPopup(loginRequest);
    } catch (error) {
      console.error('Errore login:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const logoutRequest = {
        account: account || undefined,
        postLogoutRedirectUri: msalConfig.auth.postLogoutRedirectUri,
      };
      await instance.logoutPopup(logoutRequest);
      setUser(null);
    } catch (error) {
      console.error('Errore logout:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    account,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Auth Provider principale con MSAL wrapper
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <MsalProvider instance={msalInstance}>
      <AuthProviderInner>{children}</AuthProviderInner>
    </MsalProvider>
  );
};
