import { getDatabaseStats, getCollections, createCollection, deleteCollection } from '@/lib/mongodb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatBytes } from '@/lib/utils';
import { Table } from '@/app/(default)/databases/[databaseName]/table';
import { PageParams } from '@/lib/types';
import { EJSON } from 'bson';

export default async function Page({ params }: PageParams) {
  const { databaseName } = await params;

  const stats = await getDatabaseStats(databaseName);
  const collections = await getCollections(databaseName);
  // Serialize collections for Client Component
  const serializedCollections = EJSON.serialize(collections);

  return (
    <div className='p-6 space-y-6'>
      <div className='space-y-6'>
        <Card>
          <CardHeader>
            <CardTitle>Collections</CardTitle>
          </CardHeader>
          <CardContent>
            <Table
              createCollection={createCollection}
              deleteCollection={deleteCollection}
              databaseName={databaseName}
              collections={JSON.stringify(serializedCollections)}
            />
          </CardContent>
        </Card>

        <div className='grid grid-cols-1 md:grid-cols-1 gap-4 w-full'>
          <Card className='w-full'>
            <CardHeader>
              <CardTitle>Database Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <div className='text-sm text-muted-foreground'>Collections</div>
                  <div className='font-mono'>{stats.collections}</div>
                </div>
                <div>
                  <div className='text-sm text-muted-foreground'>Data Size</div>
                  <div className='font-mono'>{formatBytes(stats.dataSize)}</div>
                </div>
                <div>
                  <div className='text-sm text-muted-foreground'>Storage Size</div>
                  <div className='font-mono'>{formatBytes(stats.storageSize)}</div>
                </div>
                <div>
                  <div className='text-sm text-muted-foreground'>Avg Object Size</div>
                  <div className='font-mono'>{formatBytes(stats.avgObjSize)}</div>
                </div>
                <div>
                  <div className='text-sm text-muted-foreground'>Indexes</div>
                  <div className='font-mono'>{stats.indexes}</div>
                </div>
                <div>
                  <div className='text-sm text-muted-foreground'>Index Size</div>
                  <div className='font-mono'>{formatBytes(stats.indexSize)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';
