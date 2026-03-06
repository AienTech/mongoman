import { NextResponse } from 'next/server';
import { backupDatabase } from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import { EJSON } from 'bson';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ databaseName: string }> },
) {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { databaseName } = await params;

  try {
    const backup = await backupDatabase(databaseName);
    const serialized = Object.fromEntries(
      Object.entries(backup).map(([name, docs]) => [name, docs.map((doc) => EJSON.serialize(doc))]),
    );
    const jsonContent = JSON.stringify(serialized, null, 2);

    return new NextResponse(jsonContent, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${databaseName}-backup-${Date.now()}.json"`,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to backup database' }, { status: 500 });
  }
}
