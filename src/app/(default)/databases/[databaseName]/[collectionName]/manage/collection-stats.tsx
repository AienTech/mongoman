'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CollectionStats as ICollectionStats } from '@/lib/types';
import { formatBytes } from '@/lib/utils';
import { FileText, HardDrive, Hash, Layers, Scale, Archive } from 'lucide-react';
import { type LucideIcon } from 'lucide-react';

interface StatsProps {
  stats: ICollectionStats;
}

export function CollectionStats({ stats }: StatsProps) {
  const statItems: { label: string; value: string | number; icon: LucideIcon; color: string }[] = [
    { label: 'Documents', value: stats?.count ?? 0, icon: FileText, color: 'text-blue-500 bg-blue-500/10' },
    { label: 'Total Size', value: formatBytes(stats?.size ?? 0), icon: HardDrive, color: 'text-green-500 bg-green-500/10' },
    { label: 'Avg Doc Size', value: formatBytes(stats?.avgObjSize ?? 0), icon: Scale, color: 'text-purple-500 bg-purple-500/10' },
    { label: 'Storage', value: formatBytes(stats?.storageSize ?? 0), icon: Archive, color: 'text-orange-500 bg-orange-500/10' },
    { label: 'Indexes', value: stats?.nindexes ?? 0, icon: Layers, color: 'text-cyan-500 bg-cyan-500/10' },
    { label: 'Index Size', value: formatBytes(stats?.totalIndexSize ?? 0), icon: Hash, color: 'text-pink-500 bg-pink-500/10' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Collection Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-2 gap-4'>
          {statItems.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className='flex items-center gap-3'>
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${stat.color}`}>
                  <Icon className='h-4 w-4' />
                </div>
                <div className='min-w-0'>
                  <p className='text-sm text-muted-foreground'>{stat.label}</p>
                  <p className='text-lg font-bold font-mono truncate'>{stat.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
