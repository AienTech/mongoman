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
import { Download, Edit, Eye, MoreHorizontal, Trash, Upload } from 'lucide-react';
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
import * as React from 'react';
import { useEffect, useState } from 'react';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DEBOUNCE_DEFAULT_INTERVAL } from '@/lib/utils';
import { snake as kebabCase } from 'case';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';

type Column = ColumnDef<CollectionInfo | Pick<CollectionInfo, 'name' | 'type' | 'options' | 'db'>>;

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

      const collectionUrl = `/databases/${collection.db}/${collection.name}`;

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
            <DropdownMenuItem asChild>
              <Link href={`${collectionUrl}/edit`}>
                <Edit className='mr-2 h-4 w-4' />
                Edit Collection
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={collectionUrl}>
                <Eye className='mr-2 h-4 w-4' />
                View Data
              </Link>
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

interface CreateCollectionProps {
  databaseName: string;
  createCollection: (dbName: string, collectionName: string) => Promise<void>;
}

interface Props extends CreateCollectionProps {
  collections: string;
}

const CreateCollectionSchema = z.object({
  name: z.string().min(1, 'Collection name is required'),
  useConvention: z.boolean().default(true),
});

type CreateCollectionForm = z.infer<typeof CreateCollectionSchema>;

function CreateCollectionDialog(props: CreateCollectionProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const form = useForm<CreateCollectionForm>({
    resolver: zodResolver(CreateCollectionSchema),
    defaultValues: {
      name: '',
      useConvention: true,
    },
  });

  const nameValue = form.watch('name');
  const useConvention = form.watch('useConvention');

  useEffect(() => {
    if (!nameValue || !useConvention) return;

    const timeoutId = setTimeout(() => {
      const newName = kebabCase(nameValue);

      form.setValue('name', newName);
    }, DEBOUNCE_DEFAULT_INTERVAL);

    return () => clearTimeout(timeoutId);
  }, [nameValue, form.setValue, useConvention]);

  async function onSubmit(data: CreateCollectionForm) {
    setIsLoading(true);
    try {
      await props.createCollection(props.databaseName, data.name);
      setOpen(false);
      window.location.reload();
    } finally {
      setIsLoading(false);
    }
  }

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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='useConvention'
              render={({ field }) => (
                <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4'>
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className='space-y-1 leading-none'>
                    <FormLabel>Keep default conventions for naming</FormLabel>
                    <FormDescription>
                      Automatically transforms collection names to follow MongoDB naming conventions
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button disabled={isLoading} type='submit'>
                Save
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export function Table({ collections, databaseName, createCollection }: Props) {
  return (
    <div className='space-y-4'>
      <div className='flex justify-end'>
        <CreateCollectionDialog databaseName={databaseName} createCollection={createCollection} />
      </div>
      <DataTable
        columns={columns}
        data={(JSON.parse(collections) as CollectionInfo[]).map((c) => ({
          ...c,
          db: databaseName,
        }))}
        defaultSorting={[{ id: 'name', desc: false }]}
      />
    </div>
  );
}
