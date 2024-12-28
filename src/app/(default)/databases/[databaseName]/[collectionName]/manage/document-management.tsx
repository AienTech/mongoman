'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DataTable } from '@/components/data-table';
import { CellContext, ColumnDef } from '@tanstack/react-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Eye, MoreHorizontal, Pencil, Trash } from 'lucide-react';
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
import { Document } from '@/lib/types';
import { getUniqueKeys } from '@/lib/utils';
import Editor from '@/components/editor';

interface DocumentProps {
  databaseName: string;
  collectionName: string;
  documents: string;
  createDocument: (dbName: string, collectionName: string, document: Document) => Promise<void>;
  updateDocument: (dbName: string, collectionName: string, id: string, document: Document) => Promise<void>;
  deleteDocument: (dbName: string, collectionName: string, id: string) => Promise<void>;
}

export function DocumentManagement({
  databaseName,
  collectionName,
  documents: docs,
  createDocument,
  updateDocument,
  deleteDocument,
}: DocumentProps) {
  const documents = JSON.parse(docs);
  const [searchQuery, setSearchQuery] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [documentContent, setDocumentContent] = useState('');

  const handleCreateDocument = async () => {
    try {
      console.log(documentContent);
      const document = JSON.parse(documentContent);
      await createDocument(databaseName, collectionName, document);
      setCreateDialogOpen(false);
      setDocumentContent('');
      window.location.reload();
    } catch (error) {
      console.error('Failed to create document:', error);
    }
  };

  const handleUpdateDocument = async () => {
    if (!selectedDocument || !selectedDocument._id) return;
    try {
      const document = JSON.parse(documentContent);
      await updateDocument(databaseName, collectionName, selectedDocument._id, document);
      setEditDialogOpen(false);
      setDocumentContent('');
      setSelectedDocument(null);
      window.location.reload();
    } catch (error) {
      console.error('Failed to update document:', error);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    try {
      await deleteDocument(databaseName, collectionName, id);
      window.location.reload();
    } catch (error) {
      console.error('Failed to delete document:', error);
    }
  };

  const formatJSON = () => {
    try {
      const parsed = JSON.parse(documentContent);
      setDocumentContent(JSON.stringify(parsed, null, 2));
    } catch (error) {
      console.error('Invalid JSON', error);
    }
  };

  const cols = getUniqueKeys(documents);

  const columns: ColumnDef<Document>[] = [
    {
      accessorKey: '_id',
      header: 'ID',
      cell: ({ row }) => <code className='text-sm'>{row.getValue('_id')}</code>,
    },
    ...cols
      .filter((key) => key !== '_id')
      .map((key) => ({
        accessorKey: key,
        header: key,
        cell: ({ row }: CellContext<Document, unknown>) => {
          const value = row.getValue(key);
          return <code className='text-sm'>{JSON.stringify(value, null, 2)}</code>;
        },
      })),
    {
      id: 'actions',
      cell: ({ row }) => {
        const document = row.original;

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
              <DropdownMenuItem
                onClick={() => {
                  setSelectedDocument(document);
                  setDocumentContent(JSON.stringify(document, null, 2));
                  setEditDialogOpen(true);
                }}
              >
                <Pencil className='mr-2 h-4 w-4' />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedDocument(document);
                  setDocumentContent(JSON.stringify(document, null, 2));
                }}
              >
                <Eye className='mr-2 h-4 w-4' />
                View
              </DropdownMenuItem>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem className='text-red-600' onSelect={(e) => e.preventDefault()}>
                    <Trash className='mr-2 h-4 w-4' />
                    Delete
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Document</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this document? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDeleteDocument(document._id)}
                      className='bg-red-600 hover:bg-red-700'
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between'>
        <CardTitle>Document Management</CardTitle>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>Create Document</Button>
          </DialogTrigger>
          <DialogContent className='max-w-3xl'>
            <DialogHeader>
              <DialogTitle>Create New Document</DialogTitle>
            </DialogHeader>
            <div className='grid gap-4 py-4'>
              <Editor initialValue={documentContent} onChange={setDocumentContent} />
            </div>
            <div className='flex justify-end gap-2'>
              <Button variant='outline' onClick={formatJSON}>
                Format JSON
              </Button>
              <Button onClick={handleCreateDocument}>Create</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='flex gap-2'>
          <Input
            placeholder="Search documents... (e.g. {'field': 'value'})"
            className='font-mono'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button variant='secondary'>Search</Button>
        </div>

        <DataTable columns={columns} data={documents} defaultSorting={[{ id: '_id', desc: false }]} />

        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className='max-w-3xl'>
            <DialogHeader>
              <DialogTitle>Edit Document</DialogTitle>
            </DialogHeader>
            <div className='grid gap-4 py-4'>
              <Editor initialValue={documentContent} onChange={setDocumentContent} />
            </div>
            <div className='flex justify-end gap-2'>
              <Button variant='outline' onClick={formatJSON}>
                Format JSON
              </Button>
              <Button onClick={handleUpdateDocument}>Save Changes</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
