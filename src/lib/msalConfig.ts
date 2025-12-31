/**
 * Microsoft Authentication Library (MSAL) Configuration
 * Per autenticazione SSO con Microsoft Entra ID (ex Azure AD)
 */

import { Configuration, LogLevel } from '@azure/msal-browser';

/**
 * Configurazione MSAL per Entra ID
 */
export const msalConfig: Configuration = {
  auth: {
    clientId: process.env.NEXT_PUBLIC_AZURE_AD_CLIENT_ID || '',
    authority: `https://login.microsoftonline.com/${process.env.NEXT_PUBLIC_AZURE_AD_TENANT_ID || 'common'}`,
    redirectUri: process.env.NEXT_PUBLIC_AZURE_AD_REDIRECT_URI || 'http://localhost:3000',
    postLogoutRedirectUri: process.env.NEXT_PUBLIC_AZURE_AD_REDIRECT_URI || 'http://localhost:3000',
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
    `${process.env.NEXT_PUBLIC_DATAVERSE_URL}/user_impersonation`,
    'User.Read', // Microsoft Graph - leggere profilo utente
  ],
};

/**
 * Scopes per silent token acquisition
 */
export const tokenRequest = {
  scopes: [`${process.env.NEXT_PUBLIC_DATAVERSE_URL}/user_impersonation`],
};
