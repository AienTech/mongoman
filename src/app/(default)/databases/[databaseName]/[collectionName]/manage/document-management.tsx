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
import { useCallback, useEffect, useState } from 'react';
import { getUniqueKeys } from '@/lib/utils';
import Editor from '@/components/editor';
import { Document } from 'mongodb';

// Sub-components
interface DocumentActionsProps {
  document: Document;
  onEdit: (document: Document) => void;
  onView: (document: Document) => void;
  onDelete: (id: string) => void;
}

function DocumentActions({ document, onEdit, onView, onDelete }: DocumentActionsProps) {
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
        <DropdownMenuItem onClick={() => onEdit(document)}>
          <Pencil className='mr-2 h-4 w-4' />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onView(document)}>
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
              <AlertDialogAction onClick={() => onDelete(document._id)} className='bg-red-600 hover:bg-red-700'>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface DocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  initialValue: object;
  onValueChange: (value: object) => void;
  onSubmit: () => Promise<void>;
  submitLabel: string;
}

function DocumentDialog({
  open,
  onOpenChange,
  title,
  initialValue,
  onValueChange,
  onSubmit,
  submitLabel,
}: DocumentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-3xl'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <Editor initialValue={initialValue} onChange={onValueChange} />
        </div>
        <div className='flex justify-end gap-2'>
          <Button onClick={onSubmit}>{submitLabel}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Main component
interface DocumentManagementProps {
  databaseName: string;
  collectionName: string;
  getDocuments: (dbName: string, collectionName: string, filter?: object) => Promise<Document[]>;
  createDocument: (dbName: string, collectionName: string, document: Omit<Document, '_id'>) => Promise<void>;
  updateDocument: (
    dbName: string,
    collectionName: string,
    id: string,
    document: Omit<Document, '_id'>,
  ) => Promise<void>;
  deleteDocument: (dbName: string, collectionName: string, id: string) => Promise<void>;
  onDocumentsChange?: () => void;
}

export function DocumentManagement({
  databaseName,
  collectionName,
  createDocument,
  updateDocument,
  deleteDocument,
  getDocuments,
}: DocumentManagementProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [documentContent, setDocumentContent] = useState<object>({});
  const [documents, setDocuments] = useState<Document[]>([]);

  useEffect(() => {
    let query = {};
    try {
      query = JSON.parse(searchQuery);
    } catch {
      // ignore
    }

    getDocuments(databaseName, collectionName, query).then((docs) => {
      setDocuments(docs);
    });
  }, [searchQuery, databaseName, collectionName, getDocuments]);

  const handleCreateDocument = async () => {
    try {
      if (Object.keys(documentContent).length === 0) {
        console.error('Document content is empty');
        return;
      }

      await createDocument(databaseName, collectionName, documentContent);
      setCreateDialogOpen(false);
      setDocumentContent({});
      getDocuments(databaseName, collectionName).then(setDocuments);
    } catch (error) {
      console.error('Failed to create document:', error);
    }
  };

  const handleUpdateDocument = async () => {
    if (!selectedDocument?._id) return;
    try {
      await updateDocument(databaseName, collectionName, selectedDocument._id, documentContent);
      setEditDialogOpen(false);
      setDocumentContent({});
      setSelectedDocument(null);
      getDocuments(databaseName, collectionName).then(setDocuments);
    } catch (error) {
      console.error('Failed to update document:', error);
    }
  };

  const handleDeleteDocument = useCallback(
    async (id: string) => {
      try {
        await deleteDocument(databaseName, collectionName, id);
        getDocuments(databaseName, collectionName).then(setDocuments);
      } catch (error) {
        console.error('Failed to delete document:', error);
      }
    },
    [deleteDocument, databaseName, collectionName, getDocuments],
  );

  const handleEdit = useCallback((document: Document) => {
    setSelectedDocument(document);
    setDocumentContent(document);
    setEditDialogOpen(true);
  }, []);

  const handleView = useCallback((document: Document) => {
    setSelectedDocument(document);
    setDocumentContent(document);
  }, []);

  // Generate columns configuration
  const cols = getUniqueKeys(documents);
  const columns: ColumnDef<Document>[] = [
    {
      accessorKey: '_id',
      header: 'ID',
      cell: ({ row }) => {
        const id = row.getValue('_id');
        // Convert ObjectId to string for display
        // @ts-expect-error $oid might actually exist
        return <code className='text-sm'>{id?.$oid || id}</code>;
      },
    },
    ...cols
      .filter((key) => key !== '_id')
      .map((key) => ({
        accessorKey: key,
        header: key,
        cell: ({ row }: CellContext<Document, unknown>) => {
          const value = row.getValue(key);
          // Handle special EJSON types when displaying
          if (value && typeof value === 'object' && '$date' in value) {
            return <code className='text-sm'>{new Date(value.$date as string).toISOString()}</code>;
          }
          if (value && typeof value === 'object' && '$oid' in value) {
            return <code className='text-sm'>{value.$oid as string}</code>;
          }
          return <code className='text-sm'>{JSON.stringify(value, null, 2)}</code>;
        },
      })),
    {
      id: 'actions',
      cell: ({ row }) => (
        <DocumentActions
          document={row.original}
          onEdit={handleEdit}
          onView={handleView}
          onDelete={handleDeleteDocument}
        />
      ),
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

        <DocumentDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          title='Create New Document'
          initialValue={{}}
          onValueChange={setDocumentContent}
          onSubmit={handleCreateDocument}
          submitLabel='Create'
        />

        <DocumentDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          title='Edit Document'
          initialValue={documentContent}
          onValueChange={setDocumentContent}
          onSubmit={handleUpdateDocument}
          submitLabel='Save Changes'
        />
      </CardContent>
    </Card>
  );
}
