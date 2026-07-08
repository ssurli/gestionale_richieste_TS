/**
 * BFF — POST /api/richieste/[id]/transizioni
 * Transizione di stato con enforcement dei ruoli lato server (ruolo da
 * ts_utentis), timestamp server e audit obbligatorio con compensazione.
 */

import { NextResponse } from 'next/server';
import { getServerContext, ApiAuthError } from '@/lib/server/auth';
import { transitionSchema, guidSchema } from '@/lib/server/schemas';
import { executeServerTransition, TransitionError } from '@/lib/server/transitions';
import { DataverseError } from '@/lib/dataverseClient';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const ctx = await getServerContext(request);

    const idParsed = guidSchema.safeParse(params.id);
    if (!idParsed.success) {
      return NextResponse.json({ error: 'ID richiesta non valido' }, { status: 400 });
    }

    let json: unknown;
    try {
      json = await request.json();
    } catch {
      return NextResponse.json({ error: 'Body JSON non valido' }, { status: 400 });
    }

    const parsed = transitionSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Payload non valido',
          dettagli: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
        },
        { status: 400 }
      );
    }

    const esito = await executeServerTransition(
      ctx.client,
      ctx.user,
      idParsed.data,
      parsed.data.toStatus,
      parsed.data.note
    );

    return NextResponse.json(esito);
  } catch (err) {
    if (err instanceof ApiAuthError || err instanceof TransitionError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    if (err instanceof DataverseError) {
      return NextResponse.json({ error: err.message }, { status: 502 });
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
