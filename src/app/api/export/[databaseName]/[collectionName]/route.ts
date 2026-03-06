import { NextResponse } from 'next/server';
import { exportCollection } from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
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
    const serialized = documents.map((doc) => EJSON.serialize(doc));
    const jsonContent = JSON.stringify(serialized, null, 2);

    return new NextResponse(jsonContent, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${collectionName}.json"`,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to export collection' }, { status: 500 });
  }
}
