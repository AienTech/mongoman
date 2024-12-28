// components/index-management.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
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
import { useState } from 'react';
import { formatBytes } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { IndexDescriptionInfo } from 'mongodb';

interface IndexProps {
  databaseName: string;
  collectionName: string;
  indexes: IndexDescriptionInfo[];
  createIndex: (
    dbName: string,
    collectionName: string,
    keys: Record<string, number>,
    options?: { name?: string },
  ) => Promise<string>;
  deleteIndex: (dbName: string, collectionName: string, indexName: string) => Promise<void>;
}

const CreateIndexSchema = z.object({
  fields: z.string().min(1, 'Fields are required'),
  name: z.string().optional(),
});

type CreateIndexForm = z.infer<typeof CreateIndexSchema>;

export function IndexManagement({ databaseName, collectionName, indexes, createIndex, deleteIndex }: IndexProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const form = useForm<CreateIndexForm>({
    resolver: zodResolver(CreateIndexSchema),
    defaultValues: {
      fields: '',
      name: '',
    },
  });

  const handleCreateIndex = async (data: CreateIndexForm) => {
    try {
      setIsCreating(true);
      const fields = data.fields.split(',').reduce((acc, field) => {
        const [key, value] = field.trim().split(':');
        return { ...acc, [key]: parseInt(value || '1') };
      }, {});

      const options = data.name ? { name: data.name } : undefined;

      await createIndex(databaseName, collectionName, fields, options);
      setCreateDialogOpen(false);
      form.reset();
      window.location.reload();
    } catch (error) {
      console.error('Failed to create index:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteIndex = async (indexName: string) => {
    try {
      setIsDeleting(true);
      await deleteIndex(databaseName, collectionName, indexName);
      window.location.reload();
    } catch (error) {
      console.error('Failed to delete index:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between'>
        <CardTitle>Indexes</CardTitle>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>Create Index</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Index</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleCreateIndex)} className='space-y-4'>
                <FormField
                  control={form.control}
                  name='fields'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fields</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder='field1:1, field2:-1' />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Index Name (optional)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className='flex justify-end'>
                  <Button type='submit' disabled={isCreating}>
                    {isCreating ? 'Creating...' : 'Create'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Fields</TableHead>
              <TableHead>Size</TableHead>
              <TableHead className='w-[100px]'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {indexes.map((index) => (
              <TableRow key={index.name}>
                <TableCell className='font-mono'>{index.name}</TableCell>
                <TableCell>{JSON.stringify(index.key)}</TableCell>
                <TableCell>{index.size ? formatBytes(index.size) : 'N/A'}</TableCell>
                <TableCell>
                  {index.name !== '_id_' && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant='destructive' size='sm' disabled={isDeleting}>
                          {isDeleting ? 'Deleting...' : 'Delete'}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Index</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete the index &#34;{index.name}&#34;? This action cannot be
                            undone and may impact query performance.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => index.name && handleDeleteIndex(index.name)}
                            className='bg-red-600 hover:bg-red-700'
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
