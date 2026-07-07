/**
 * Auth Context con MSAL
 * Gestisce autenticazione SSO Microsoft e stato utente
 */

'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { AccountInfo } from '@azure/msal-browser';
import { MsalProvider, useMsal, useIsAuthenticated } from '@azure/msal-react';
import { msalConfig, loginRequest, AUTH_DISABLED, isMsalConfigured, msalConfigProblems } from '@/lib/msalConfig';
import { getMsalInstance } from '@/lib/msalInstance';
import { dataverseClient } from '@/lib/dataverseClient';
import type { User } from '@/types';
import { UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  /** true quando l'app gira in modalità demo esplicita (NEXT_PUBLIC_AUTH_DISABLED=true) */
  isDemoMode: boolean;
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
    isDemoMode: false,
    login,
    logout,
    account,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Provider per la modalità demo esplicita: nessuna chiamata MSAL/Dataverse,
 * utente fittizio locale. Attivabile SOLO con NEXT_PUBLIC_AUTH_DISABLED=true.
 */
const DemoAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const demoUser: User = useMemo(
    () => ({
      id: 'demo',
      nome: 'Utente',
      cognome: 'Demo',
      email: 'demo@example.invalid',
      ruolo: UserRole.RESPONSABILE_UO,
      attivo: true,
      dataCreazione: new Date(),
    }),
    []
  );

  const value: AuthContextType = {
    user: demoUser,
    isAuthenticated: true,
    isLoading: false,
    isDemoMode: true,
    login: async () => {},
    logout: async () => {},
    account: null,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Schermata di errore configurazione: la mancanza delle variabili d'ambiente
 * blocca l'app in modo visibile invece di lasciarla aperta senza login.
 */
const ConfigErrorScreen: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div className="max-w-lg w-full bg-white border border-red-200 rounded-lg shadow p-6">
      <h1 className="text-lg font-bold text-red-700 mb-2">
        Configurazione autenticazione incompleta
      </h1>
      <p className="text-sm text-gray-700 mb-3">
        L&apos;applicazione richiede l&apos;accesso con Microsoft Entra ID ma la
        configurazione non è completa:
      </p>
      <ul className="list-disc pl-5 text-sm text-gray-700 mb-3">
        {msalConfigProblems.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
      <p className="text-xs text-gray-500">
        Impostare le variabili d&apos;ambiente (vedi <code>.env.example</code>) oppure,
        solo per demo locali senza dati reali, <code>NEXT_PUBLIC_AUTH_DISABLED=true</code>.
      </p>
    </div>
  </div>
);

/**
 * Auth Provider principale con MSAL wrapper
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (AUTH_DISABLED) {
    return <DemoAuthProvider>{children}</DemoAuthProvider>;
  }

  if (!isMsalConfigured) {
    return <ConfigErrorScreen />;
  }

  return (
    <MsalProvider instance={getMsalInstance()}>
      <AuthProviderInner>{children}</AuthProviderInner>
    </MsalProvider>
  );
};
