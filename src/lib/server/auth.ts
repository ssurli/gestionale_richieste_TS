/**
 * AUTENTICAZIONE LATO SERVER (BFF)
 *
 * Il client inoltra il proprio access token Dataverse (Authorization: Bearer).
 * Il server NON valida la firma del JWT in proprio: ogni chiamata Dataverse
 * eseguita con quel token è essa stessa la prova di validità (un token
 * contraffatto o scaduto viene rifiutato da Dataverse con 401, e con esso
 * l'intera operazione). L'email dell'utente viene letta dal payload del
 * token e usata SOLO come filtro insieme al token stesso: alterare il payload
 * invalida la firma e quindi il token verso Dataverse.
 *
 * NB: il BFF riduce la superficie e centralizza le validazioni, ma
 * l'enforcement definitivo restano le security role Dataverse.
 */

import { User } from '@/types';
import { DataverseClient } from '@/lib/dataverseClient';

export class ApiAuthError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = 'ApiAuthError';
  }
}

/** Estrae il bearer token dall'header Authorization */
export function extractBearer(request: Request): string {
  const header = request.headers.get('authorization') || '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    throw new ApiAuthError('Token mancante: header Authorization Bearer richiesto', 401);
  }
  return match[1];
}

/** Decodifica il payload di un JWT senza verificarne la firma (vedi header del file) */
export function decodeJwtPayload(token: string): Record<string, unknown> {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new ApiAuthError('Token non valido (formato JWT atteso)', 401);
  }
  try {
    const payload = Buffer.from(parts[1], 'base64url').toString('utf8');
    return JSON.parse(payload);
  } catch {
    throw new ApiAuthError('Token non valido (payload non decodificabile)', 401);
  }
}

export interface ServerContext {
  client: DataverseClient;
  user: User;
  token: string;
}

/**
 * Costruisce il contesto server: client Dataverse con il token inoltrato e
 * utente applicativo risolto da ts_utentis (ruolo NON fidato dal client).
 */
export async function getServerContext(request: Request): Promise<ServerContext> {
  const token = extractBearer(request);
  const payload = decodeJwtPayload(token);

  const email =
    (payload.upn as string) ||
    (payload.preferred_username as string) ||
    (payload.unique_name as string);
  if (!email) {
    throw new ApiAuthError('Token senza identità utente (upn/preferred_username)', 401);
  }

  const client = new DataverseClient(async () => token);

  // Prima chiamata Dataverse col token inoltrato: se il token è contraffatto
  // o scaduto fallisce qui (la getUserByEmail ritorna null anche su 401)
  const user = await client.getUserByEmail(email);
  if (!user) {
    throw new ApiAuthError(
      'Utente non autorizzato: token non valido o utente non registrato in ts_utentis',
      403
    );
  }
  if (!user.attivo) {
    throw new ApiAuthError('Utente disattivato', 403);
  }

  return { client, user, token };
}
