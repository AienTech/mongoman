import { PageParamsWithCollection } from '@/lib/types';
import { runAggregation } from '@/lib/mongodb';
import { AggregationPipeline } from '@/components/aggregation-pipeline';
import { EJSON } from 'bson';
import { Layers } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default async function Page({ params }: PageParamsWithCollection) {
  const { collectionName, databaseName } = await params;

  const runSerializedAggregation = async (
    dbName: string,
    collName: string,
    pipeline: object[],
  ) => {
    'use server';
    const results = await runAggregation(dbName, collName, pipeline);
    return results.map((doc) => EJSON.serialize(doc));
  };

  return (
    <div className='p-6 space-y-6'>
      <div className='flex items-center gap-3'>
        <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10'>
          <Layers className='h-5 w-5 text-purple-500' />
        </div>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>Aggregation Pipeline</h1>
          <p className='text-sm text-muted-foreground'>
            Build and run pipelines on {collectionName} in {databaseName}
          </p>
        </div>
      </div>

      <Separator />

      <AggregationPipeline
        databaseName={databaseName}
        collectionName={collectionName}
        runAggregation={runSerializedAggregation}
      />
    </div>
  );
}

export const dynamic = 'force-dynamic';
