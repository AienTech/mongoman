'use client';

// components/database-table.tsx
import { DataTable } from '@/components/data-table';
import { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import { Database } from 'lucide-react';
import { formatBytes } from '@/lib/utils';

interface DatabaseStats {
  name: string;
  sizeOnDisk?: number;
  collections: number;
  empty: boolean;
}

export function DatabaseTable({ data }: { data: DatabaseStats[] }) {
  const columns: ColumnDef<DatabaseStats>[] = [
    {
      accessorKey: 'name',
      header: 'Database Name',
      cell: ({ row }) => {
        const name = row.getValue('name') as string;
        return (
          <Link href={`/databases/${name}`} className='flex items-center gap-2 font-medium hover:underline'>
            <Database className='h-4 w-4 text-muted-foreground' />
            {name}
          </Link>
        );
      },
    },
    {
      accessorKey: 'collections',
      header: 'Collections',
    },
    {
      accessorKey: 'sizeOnDisk',
      header: 'Size',
      cell: ({ row }) => {
        const size = row.getValue('sizeOnDisk') as number;
        return formatBytes(size);
      },
    },
    {
      accessorKey: 'empty',
      header: 'Status',
      cell: ({ row }) => {
        const isEmpty = row.getValue('empty') as boolean;
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              isEmpty
                ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
                : 'bg-green-500/10 text-green-600 dark:text-green-400'
            }`}
          >
            <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${isEmpty ? 'bg-yellow-500' : 'bg-green-500'}`} />
            {isEmpty ? 'Empty' : 'Active'}
          </span>
        );
      },
    },
  ];

  return <DataTable columns={columns} data={data} defaultSorting={[{ id: 'name', desc: false }]} emptyMessage='No databases found. Create one from the sidebar.' />;
}
