'use client';

import { ColumnDef } from '@tanstack/react-table';
import { CollectionInfo } from 'mongodb';
import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, Eye, FileSpreadsheet, MoreHorizontal, Settings, Trash, Layers } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

type Column = ColumnDef<CollectionInfo | Pick<CollectionInfo, 'name' | 'type' | 'options' | 'db'>>;

interface CreateCollectionProps {
  databaseName: string;
  createCollection: (dbName: string, collectionName: string) => Promise<void>;
}

interface Props extends CreateCollectionProps {
  collections: string;
  deleteCollection: (dbName: string, collectionName: string) => Promise<void>;
}

const CreateCollectionSchema = z.object({
  name: z.string().min(1, 'Collection name is required'),
  useConvention: z.boolean().default(true),
});

type CreateCollectionForm = z.infer<typeof CreateCollectionSchema>;

function CreateCollectionDialog(props: CreateCollectionProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const form = useForm({
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

export function Table({ collections, databaseName, createCollection, deleteCollection }: Props) {
  const [deletingCollection, setDeletingCollection] = useState<string | null>(null);

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
      header: 'Actions',
      cell: ({ row }) => {
        const collection = row.original;
        const collectionUrl = `/databases/${databaseName}/${collection.name}`;

        return (
          <TooltipProvider delayDuration={300}>
            <div className='flex items-center gap-1'>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant='ghost' size='icon' className='h-8 w-8' asChild>
                    <Link href={collectionUrl}>
                      <Eye className='h-4 w-4' />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>View Data</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant='ghost' size='icon' className='h-8 w-8' asChild>
                    <Link href={`${collectionUrl}/manage`}>
                      <Settings className='h-4 w-4' />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Manage</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant='ghost' size='icon' className='h-8 w-8' asChild>
                    <Link href={`${collectionUrl}/aggregate`}>
                      <Layers className='h-4 w-4' />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Aggregation</TooltipContent>
              </Tooltip>

              <DropdownMenu>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button variant='ghost' size='icon' className='h-8 w-8'>
                        <MoreHorizontal className='h-4 w-4' />
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent>More</TooltipContent>
                </Tooltip>
                <DropdownMenuContent align='end'>
                  <DropdownMenuItem onClick={() => window.open(`/api/export/${databaseName}/${collection.name}`, '_blank')}>
                    <Download className='mr-2 h-4 w-4' />
                    Export JSON
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => window.open(`/api/export/${databaseName}/${collection.name}/csv`, '_blank')}>
                    <FileSpreadsheet className='mr-2 h-4 w-4' />
                    Export CSV
                  </DropdownMenuItem>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem className='text-red-600' onSelect={(e) => e.preventDefault()}>
                        <Trash className='mr-2 h-4 w-4' />
                        Delete Collection
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the collection &quot;{collection.name}
                          &quot; and remove all its data.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={deletingCollection === collection.name}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          disabled={deletingCollection === collection.name}
                          onClick={async (e) => {
                            e.preventDefault();
                            setDeletingCollection(collection.name);
                            try {
                              await deleteCollection(databaseName, collection.name);
                              window.location.reload();
                            } finally {
                              setDeletingCollection(null);
                            }
                          }}
                        >
                          {deletingCollection === collection.name ? 'Deleting...' : 'Continue'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </TooltipProvider>
        );
      },
    },
  ];

  return (
    <div className='space-y-4'>
      <div className='flex justify-end'>
        <CreateCollectionDialog databaseName={databaseName} createCollection={createCollection} />
      </div>
      <DataTable columns={columns} data={JSON.parse(collections)} defaultSorting={[{ id: 'name', desc: false }]} emptyMessage='No collections in this database. Create one above.' />
    </div>
  );
}
