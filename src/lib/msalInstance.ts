/**
 * Istanza MSAL condivisa (singleton)
 * Unica PublicClientApplication per tutta l'app: AuthContext (MsalProvider)
 * e DataverseClient devono usare la stessa istanza, altrimenti gli account
 * autenticati non sono visibili tra i due contesti.
 */

import { PublicClientApplication } from '@azure/msal-browser';
import { msalConfig, isMsalConfigured, msalConfigProblems } from './msalConfig';

let instance: PublicClientApplication | null = null;
let initPromise: Promise<void> | null = null;

/**
 * Restituisce l'istanza MSAL condivisa, creandola al primo accesso.
 * Lancia un errore esplicito se la configurazione è incompleta:
 * niente degradazione silenziosa verso authority multi-tenant "common".
 */
export function getMsalInstance(): PublicClientApplication {
  if (!isMsalConfigured) {
    throw new Error(
      `Configurazione Entra ID incompleta: ${msalConfigProblems.join('; ')}`
    );
  }

  if (!instance) {
    instance = new PublicClientApplication(msalConfig);
  }

  return instance;
}

/**
 * Garantisce che initialize() sia stato eseguito (richiesto da msal-browser v3+
 * prima di getAllAccounts/acquireTokenSilent). Idempotente.
 */
export async function ensureMsalInitialized(): Promise<PublicClientApplication> {
  const pca = getMsalInstance();
  if (!initPromise) {
    initPromise = pca.initialize();
  }
  await initPromise;
  return pca;
}
