'use client';

import { ColumnDef } from '@tanstack/react-table';
import { CollectionInfo } from 'mongodb';
import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, Eye, MoreHorizontal, Trash, Upload } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

type Column = ColumnDef<CollectionInfo | Pick<CollectionInfo, 'name' | 'type' | 'options'>>;

const columns: Column[] = [
  {
    accessorKey: 'name',
    header: 'Collection Name',
  },
  {
    accessorKey: 'type',
    header: 'Type',
  },
  {
    accessorKey: 'options',
    header: 'Options',
    cell: ({ row }) => {
      const options = row.original.options;
      if (!options) return;
      return (
        <code className='text-sm'>{Object.keys(options).length > 0 ? JSON.stringify(options, null, 2) : '-'}</code>
      );
    },
  },
  {
    id: 'actions',
    size: 20,
    maxSize: 20,
    cell: ({ row }) => {
      const collection = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <span className='sr-only'>Open menu</span>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => console.log('view', collection.name)}>
              <Eye className='mr-2 h-4 w-4' />
              View Data
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => console.log('export', collection.name)}>
              <Download className='mr-2 h-4 w-4' />
              Export Data
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => console.log('import', collection.name)}>
              <Upload className='mr-2 h-4 w-4' />
              Import Data
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => console.log('delete', collection.name)} className='text-red-600'>
              <Trash className='mr-2 h-4 w-4' />
              Delete Collection
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

interface Props {
  collections: string;
  databaseName: string;
}

function CreateCollectionDialog() {
  const [open, setOpen] = useState(false);
  const [collectionName, setCollectionName] = useState('');

  const handleCreate = async () => {
    console.log('Creating collection:', collectionName);
    setOpen(false);
    setCollectionName('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create Collection</Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Create New Collection</DialogTitle>
          <DialogDescription>Enter the name for your new collection.</DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='name' className='text-right'>
              Name
            </Label>
            <Input
              id='name'
              value={collectionName}
              onChange={(e) => setCollectionName(e.target.value)}
              className='col-span-3'
              placeholder='my_collection'
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleCreate} disabled={!collectionName.trim()}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function Table({ collections, databaseName }: Props) {
  return (
    <div className='space-y-4'>
      <div className='flex justify-end'>
        <CreateCollectionDialog />
      </div>
      <DataTable columns={columns} data={JSON.parse(collections)} defaultSorting={[{ id: 'name', desc: false }]} />
    </div>
  );
}
