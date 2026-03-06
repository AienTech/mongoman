import { getDatabaseStats, getCollections, createCollection, deleteCollection, restoreDatabase } from '@/lib/mongodb';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatBytes } from '@/lib/utils';
import { Table } from '@/app/(default)/databases/[databaseName]/table';
import { BackupRestore } from '@/components/backup-restore';
import { PageParams } from '@/lib/types';
import { EJSON } from 'bson';
import { Database, HardDrive, Layers, FileText } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default async function Page({ params }: PageParams) {
  const { databaseName } = await params;

  const stats = await getDatabaseStats(databaseName);
  const collections = await getCollections(databaseName);
  // Serialize collections for Client Component
  const serializedCollections = EJSON.serialize(collections);

  return (
    <div className='p-6 space-y-6'>
      <div className='flex items-center gap-3'>
        <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10'>
          <Database className='h-5 w-5 text-primary' />
        </div>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>{databaseName}</h1>
          <p className='text-sm text-muted-foreground'>
            {stats.collections} collections &middot; {formatBytes(stats.dataSize)}
          </p>
        </div>
      </div>

      <Separator />

      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center gap-3'>
              <div className='flex h-9 w-9 items-center justify-center rounded-md bg-blue-500/10'>
                <Layers className='h-4 w-4 text-blue-500' />
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Collections</p>
                <p className='text-xl font-bold font-mono'>{stats.collections}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center gap-3'>
              <div className='flex h-9 w-9 items-center justify-center rounded-md bg-green-500/10'>
                <HardDrive className='h-4 w-4 text-green-500' />
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Data Size</p>
                <p className='text-xl font-bold font-mono'>{formatBytes(stats.dataSize)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center gap-3'>
              <div className='flex h-9 w-9 items-center justify-center rounded-md bg-orange-500/10'>
                <FileText className='h-4 w-4 text-orange-500' />
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Indexes</p>
                <p className='text-xl font-bold font-mono'>{stats.indexes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center gap-3'>
              <div className='flex h-9 w-9 items-center justify-center rounded-md bg-purple-500/10'>
                <HardDrive className='h-4 w-4 text-purple-500' />
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Storage</p>
                <p className='text-xl font-bold font-mono'>{formatBytes(stats.storageSize)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Collections</CardTitle>
          <CardDescription>{(serializedCollections as unknown[]).length} collections in this database</CardDescription>
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

      <BackupRestore databaseName={databaseName} restoreDatabase={restoreDatabase} />
    </div>
  );
}

export const dynamic = 'force-dynamic';
