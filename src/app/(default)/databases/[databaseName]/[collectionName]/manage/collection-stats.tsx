'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CollectionStats as ICollectionStats } from '@/lib/types';
import { formatBytes } from '@/lib/utils';

interface StatsProps {
  stats: ICollectionStats;
}

export function CollectionStats({ stats }: StatsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Collection Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-2 gap-4'>
          {[
            { label: 'Documents Count', value: stats?.count ?? 0 },
            { label: 'Total Size', value: formatBytes(stats?.size ?? 0) },
            { label: 'Average Doc Size', value: formatBytes(stats?.avgObjSize ?? 0) },
            { label: 'Pre-allocated Size', value: formatBytes(stats?.storageSize ?? 0) },
            { label: 'Number of Indexes', value: stats?.nindexes ?? 0 },
            { label: 'Total Index Size', value: formatBytes(stats?.totalIndexSize ?? 0) },
            { label: 'Padding Factor', value: stats?.paddingFactor?.toFixed(2) ?? '1.00' },
            { label: 'Extents', value: stats?.nExtents ?? 0 },
          ].map((stat) => (
            <div key={stat.label}>
              <div className='text-sm text-muted-foreground'>{stat.label}</div>
              <div className='text-lg font-mono'>{stat.value}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
