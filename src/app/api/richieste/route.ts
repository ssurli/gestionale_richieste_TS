/**
 * BFF — POST /api/richieste
 * Sottomissione richiesta con validazione Zod server-side, utente risolto
 * da ts_utentis e audit trail obbligatorio (vedi requestService).
 */

import { NextResponse } from 'next/server';
import { getServerContext, ApiAuthError } from '@/lib/server/auth';
import { submitRequestSchema } from '@/lib/server/schemas';
import { submitTechnologyRequest } from '@/lib/requestService';
import { DataverseError } from '@/lib/dataverseClient';
import type { TechnologyRequest } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const ctx = await getServerContext(request);

    let json: unknown;
    try {
      json = await request.json();
    } catch {
      return NextResponse.json({ error: 'Body JSON non valido' }, { status: 400 });
    }

    const parsed = submitRequestSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Payload non valido',
          dettagli: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
        },
        { status: 400 }
      );
    }

    const esito = await submitTechnologyRequest(parsed.data as Partial<TechnologyRequest>, {
      client: ctx.client,
      user: ctx.user,
    });

    return NextResponse.json(esito, { status: 201 });
  } catch (err) {
    if (err instanceof ApiAuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    if (err instanceof DataverseError) {
      return NextResponse.json({ error: err.message }, { status: 502 });
    }
    // Errori di validazione di dominio (DGR 306/2024, budget, coerenza)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 422 }
    );
  }
}
