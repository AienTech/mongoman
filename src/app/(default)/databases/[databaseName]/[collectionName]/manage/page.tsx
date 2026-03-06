// app/databases/[databaseName]/[collectionName]/manage/page.tsx
import { PageParamsWithCollection } from '@/lib/types';
import { Separator } from '@/components/ui/separator';
import { CollectionActions } from './collection-actions';
import { CollectionStats } from './collection-stats';
import { IndexManagement } from './index-management';
import { ImportExport } from '@/components/import-export';
import { Settings } from 'lucide-react';
import {
  getCollectionStats,
  getCollectionIndexes,
  renameCollection,
  reindexCollection,
  compactCollection,
  clearCollection,
  createCollectionIndex,
  dropCollectionIndex,
  importDocuments,
} from '@/lib/mongodb';

export default async function Page({ params }: PageParamsWithCollection) {
  const { collectionName, databaseName } = await params;
  const stats = await getCollectionStats(databaseName, collectionName);
  const indexes = await getCollectionIndexes(databaseName, collectionName);

  return (
    <div className='p-6 space-y-6'>
      <div className='flex items-center gap-3'>
        <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10'>
          <Settings className='h-5 w-5 text-orange-500' />
        </div>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>{collectionName}</h1>
          <p className='text-sm text-muted-foreground'>
            Manage collection in {databaseName}
          </p>
        </div>
      </div>
      <Separator />

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <CollectionStats stats={stats} />

        <CollectionActions
          databaseName={databaseName}
          collectionName={collectionName}
          renameCollection={renameCollection}
          reindexCollection={reindexCollection}
          compactCollection={compactCollection}
          clearCollection={clearCollection}
        />

        <ImportExport
          databaseName={databaseName}
          collectionName={collectionName}
          importDocuments={importDocuments}
        />
      </div>

      <div className='space-y-6'>
        <IndexManagement
          databaseName={databaseName}
          collectionName={collectionName}
          indexes={indexes}
          createIndex={createCollectionIndex}
          deleteIndex={dropCollectionIndex}
        />
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';
