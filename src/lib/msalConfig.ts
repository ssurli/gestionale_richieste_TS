/**
 * Microsoft Authentication Library (MSAL) Configuration
 * Per autenticazione SSO con Microsoft Entra ID (ex Azure AD)
 */

import { Configuration, LogLevel } from '@azure/msal-browser';

const clientId = process.env.NEXT_PUBLIC_AZURE_AD_CLIENT_ID;
const tenantId = process.env.NEXT_PUBLIC_AZURE_AD_TENANT_ID;
const dataverseUrl = process.env.NEXT_PUBLIC_DATAVERSE_URL;
const redirectUri = process.env.NEXT_PUBLIC_AZURE_AD_REDIRECT_URI || 'http://localhost:3000';

/**
 * Modalità demo esplicita: consente di usare la UI senza Entra ID/Dataverse.
 * Va attivata deliberatamente (NEXT_PUBLIC_AUTH_DISABLED=true); una
 * configurazione mancante NON degrada mai in accesso libero.
 */
export const AUTH_DISABLED = process.env.NEXT_PUBLIC_AUTH_DISABLED === 'true';

/**
 * Diagnostica di configurazione: elenca le variabili mancanti invece di
 * ripiegare in silenzio su valori insicuri (clientId vuoto, authority
 * multi-tenant 'common' che accetta account di qualunque tenant).
 */
export const msalConfigProblems: string[] = [];
if (!clientId) msalConfigProblems.push('NEXT_PUBLIC_AZURE_AD_CLIENT_ID non impostata');
if (!tenantId) msalConfigProblems.push('NEXT_PUBLIC_AZURE_AD_TENANT_ID non impostata');
if (!dataverseUrl) msalConfigProblems.push('NEXT_PUBLIC_DATAVERSE_URL non impostata');

export const isMsalConfigured = msalConfigProblems.length === 0;

/**
 * Configurazione MSAL per Entra ID.
 * NB: valida solo se isMsalConfigured è true; getMsalInstance() (msalInstance.ts)
 * rifiuta di creare l'istanza in caso contrario.
 */
export const msalConfig: Configuration = {
  auth: {
    clientId: clientId || '',
    authority: `https://login.microsoftonline.com/${tenantId || 'organizations'}`,
    redirectUri,
    postLogoutRedirectUri: redirectUri,
  },
  cache: {
    cacheLocation: 'sessionStorage', // "sessionStorage" o "localStorage"
    storeAuthStateInCookie: false,   // Set to true per IE11/Edge
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) return;

        switch (level) {
          case LogLevel.Error:
            console.error(message);
            return;
          case LogLevel.Info:
            console.info(message);
            return;
          case LogLevel.Verbose:
            console.debug(message);
            return;
          case LogLevel.Warning:
            console.warn(message);
            return;
        }
      },
    },
  },
};

/**
 * Scopes richiesti per accedere a Dataverse
 */
export const loginRequest = {
  scopes: [
    `${dataverseUrl}/user_impersonation`,
    'User.Read', // Microsoft Graph - leggere profilo utente
  ],
};

/**
 * Scopes per silent token acquisition
 */
export const tokenRequest = {
  scopes: [`${dataverseUrl}/user_impersonation`],
};
