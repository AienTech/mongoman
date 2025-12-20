// app/databases/[databaseName]/[collectionName]/manage/page.tsx
import { PageParamsWithCollection } from '@/lib/types';
import { Separator } from '@/components/ui/separator';
import { CollectionActions } from './collection-actions';
import { CollectionStats } from './collection-stats';
import { IndexManagement } from './index-management';
import {
  getCollectionStats,
  getCollectionIndexes,
  renameCollection,
  reindexCollection,
  compactCollection,
  clearCollection,
  createCollectionIndex,
  dropCollectionIndex,
} from '@/lib/mongodb';

export default async function Page({ params }: PageParamsWithCollection) {
  const { collectionName, databaseName } = await params;
  const stats = await getCollectionStats(databaseName, collectionName);
  const indexes = await getCollectionIndexes(databaseName, collectionName);

  return (
    <div className='p-6 space-y-6'>
      <div className='space-y-0.5'>
        <h2 className='text-2xl font-bold tracking-tight'>Collection Management</h2>
        <p className='text-muted-foreground'>
          Manage {collectionName} collection in {databaseName} database
        </p>
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
