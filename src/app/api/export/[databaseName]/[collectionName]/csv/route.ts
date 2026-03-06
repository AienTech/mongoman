import { NextResponse } from 'next/server';
import { exportCollection } from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import { jsonToCsv } from '@/lib/utils';
import { EJSON } from 'bson';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ databaseName: string; collectionName: string }> },
) {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { databaseName, collectionName } = await params;

  try {
    const documents = await exportCollection(databaseName, collectionName);
    const serialized = documents.map((doc) => EJSON.serialize(doc)) as Record<string, unknown>[];
    const csv = jsonToCsv(serialized);

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${collectionName}.csv"`,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to export collection as CSV' }, { status: 500 });
  }
}
