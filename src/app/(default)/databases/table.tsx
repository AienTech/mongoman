'use client';

// components/database-table.tsx
import { DataTable } from '@/components/data-table';
import { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
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
          <Link href={`/databases/${name}`} className='hover:underline'>
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
            className={`px-2 py-1 rounded-full text-xs ${
              isEmpty ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
            }`}
          >
            {isEmpty ? 'Empty' : 'Active'}
          </span>
        );
      },
    },
  ];

  return <DataTable columns={columns} data={data} defaultSorting={[{ id: 'name', desc: false }]} />;
}
