// app/databases/[databaseName]/[collectionName]/manage/page.tsx
import { PageParamsWithCollection } from '@/lib/types';
import { Separator } from '@/components/ui/separator';
import { CollectionActions } from './collection-actions';
import { CollectionStats } from './collection-stats';
import { IndexManagement } from './index-management';
import { Functions } from '@/lib/mongodb';

export default async function Page({ params }: PageParamsWithCollection) {
  const { collectionName, databaseName } = await params;
  const stats = await Functions.getCollectionStats(databaseName, collectionName);
  const indexes = await Functions.getCollectionIndexes(databaseName, collectionName);

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
          renameCollection={Functions.renameCollection}
          reindexCollection={Functions.reindexCollection}
          compactCollection={Functions.compactCollection}
          clearCollection={Functions.clearCollection}
        />
      </div>

      <div className='space-y-6'>
        <IndexManagement
          databaseName={databaseName}
          collectionName={collectionName}
          indexes={indexes}
          createIndex={Functions.createCollectionIndex}
          deleteIndex={Functions.dropCollectionIndex}
        />
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';