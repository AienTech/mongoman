'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DataTable } from '@/components/data-table';
import { CellContext, ColumnDef } from '@tanstack/react-table';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Eye, Pencil, Trash } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCallback, useEffect, useState } from 'react';
import { getUniqueKeys } from '@/lib/utils';
import Editor from '@/components/editor';
import { Skeleton } from '@/components/ui/skeleton';
import { QueryBuilder } from '@/components/query-builder';
import { useToast } from '@/hooks/use-toast';
import { Document } from 'mongodb';

// Sub-components
interface DocumentActionsProps {
  document: Document;
  onEdit: (document: Document) => void;
  onView: (document: Document) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

function DocumentActions({ document, onEdit, onView, onDelete, isDeleting }: DocumentActionsProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <div className='flex items-center gap-1'>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant='ghost' size='icon' className='h-8 w-8' onClick={() => onView(document)}>
              <Eye className='h-4 w-4' />
            </Button>
          </TooltipTrigger>
          <TooltipContent>View</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant='ghost' size='icon' className='h-8 w-8' onClick={() => onEdit(document)}>
              <Pencil className='h-4 w-4' />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Edit</TooltipContent>
        </Tooltip>

        <AlertDialog>
          <Tooltip>
            <TooltipTrigger asChild>
              <AlertDialogTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-8 w-8 text-muted-foreground hover:text-red-600'
                  disabled={isDeleting}
                >
                  <Trash className='h-4 w-4' />
                </Button>
              </AlertDialogTrigger>
            </TooltipTrigger>
            <TooltipContent>Delete</TooltipContent>
          </Tooltip>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Document</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this document? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                disabled={isDeleting}
                onClick={(e) => {
                  e.preventDefault();
                  onDelete(document._id);
                }}
                className='bg-red-600 hover:bg-red-700'
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
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
  submittingLabel?: string;
  isSubmitting?: boolean;
}

function DocumentDialog({
  open,
  onOpenChange,
  title,
  initialValue,
  onValueChange,
  onSubmit,
  submitLabel,
  submittingLabel,
  isSubmitting,
}: DocumentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <Editor initialValue={initialValue} onChange={onValueChange} />
        </div>
        <div className='flex justify-end gap-2'>
          <Button disabled={isSubmitting} onClick={onSubmit}>
            {isSubmitting ? (submittingLabel ?? submitLabel) : submitLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Pagination component
interface PaginationProps {
  page: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  isLoading?: boolean;
}

function Pagination({ page, pageSize, totalCount, onPageChange, onPageSizeChange, isLoading }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const startItem = totalCount === 0 ? 0 : page * pageSize + 1;
  const endItem = Math.min((page + 1) * pageSize, totalCount);

  return (
    <div className='flex items-center justify-between gap-4 pt-2'>
      <div className='text-sm text-muted-foreground'>
        {totalCount > 0 ? (
          <>Showing {startItem}-{endItem} of {totalCount.toLocaleString()}</>
        ) : (
          'No documents'
        )}
      </div>

      <div className='flex items-center gap-4'>
        <div className='flex items-center gap-2'>
          <span className='text-sm text-muted-foreground whitespace-nowrap'>Per page</span>
          <Select
            value={String(pageSize)}
            onValueChange={(val) => onPageSizeChange(Number(val))}
          >
            <SelectTrigger className='h-8 w-[70px]'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='50'>50</SelectItem>
              <SelectItem value='100'>100</SelectItem>
              <SelectItem value='500'>500</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className='flex items-center gap-2'>
          <span className='text-sm text-muted-foreground whitespace-nowrap'>
            Page {page + 1} of {totalPages}
          </span>
          <div className='flex items-center gap-1'>
            <Button
              variant='outline'
              size='icon'
              className='h-8 w-8'
              onClick={() => onPageChange(0)}
              disabled={page === 0 || isLoading}
            >
              <ChevronsLeft className='h-4 w-4' />
            </Button>
            <Button
              variant='outline'
              size='icon'
              className='h-8 w-8'
              onClick={() => onPageChange(page - 1)}
              disabled={page === 0 || isLoading}
            >
              <ChevronLeft className='h-4 w-4' />
            </Button>
            <Button
              variant='outline'
              size='icon'
              className='h-8 w-8'
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages - 1 || isLoading}
            >
              <ChevronRight className='h-4 w-4' />
            </Button>
            <Button
              variant='outline'
              size='icon'
              className='h-8 w-8'
              onClick={() => onPageChange(totalPages - 1)}
              disabled={page >= totalPages - 1 || isLoading}
            >
              <ChevronsRight className='h-4 w-4' />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main component
interface DocumentManagementProps {
  databaseName: string;
  collectionName: string;
  getDocuments: (
    dbName: string,
    collectionName: string,
    filter?: object,
    skip?: number,
    limit?: number,
  ) => Promise<{ documents: Document[]; totalCount: number }>;
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
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [documentContent, setDocumentContent] = useState<object>({});
  const [documents, setDocuments] = useState<Document[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingDocId, setDeletingDocId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(50);

  const fetchDocuments = useCallback(
    async (currentPage: number, currentPageSize: number, query?: string) => {
      let filter = {};
      try {
        if (query) filter = JSON.parse(query);
      } catch {
        // ignore
      }

      setIsLoadingDocs(true);
      try {
        const result = await getDocuments(
          databaseName,
          collectionName,
          filter,
          currentPage * currentPageSize,
          currentPageSize,
        );
        setDocuments(result.documents);
        setTotalCount(result.totalCount);
      } finally {
        setIsLoadingDocs(false);
      }
    },
    [databaseName, collectionName, getDocuments],
  );

  useEffect(() => {
    fetchDocuments(page, pageSize, searchQuery);
  }, [page, pageSize, searchQuery, fetchDocuments]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(0); // Reset to first page
  };

  const refreshCurrentPage = () => {
    fetchDocuments(page, pageSize, searchQuery);
  };

  const handleCreateDocument = async () => {
    if (Object.keys(documentContent).length === 0) {
      toast({ title: 'Error', description: 'Document content is empty', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      await createDocument(databaseName, collectionName, documentContent);
      setCreateDialogOpen(false);
      setDocumentContent({});
      toast({ title: 'Document created', description: 'Successfully created new document' });
      refreshCurrentPage();
    } catch {
      toast({ title: 'Error', description: 'Failed to create document', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateDocument = async () => {
    if (!selectedDocument?._id) return;
    setIsSubmitting(true);
    try {
      await updateDocument(databaseName, collectionName, selectedDocument._id, documentContent);
      setEditDialogOpen(false);
      setDocumentContent({});
      setSelectedDocument(null);
      toast({ title: 'Document updated', description: 'Successfully saved changes' });
      refreshCurrentPage();
    } catch {
      toast({ title: 'Error', description: 'Failed to update document', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDocument = useCallback(
    async (id: string) => {
      setDeletingDocId(id);
      try {
        await deleteDocument(databaseName, collectionName, id);
        toast({ title: 'Document deleted', description: 'Successfully deleted document' });
        refreshCurrentPage();
      } catch {
        toast({ title: 'Error', description: 'Failed to delete document', variant: 'destructive' });
      } finally {
        setDeletingDocId(null);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [deleteDocument, databaseName, collectionName, toast],
  );

  const handleEdit = useCallback((document: Document) => {
    setSelectedDocument(document);
    setDocumentContent(document);
    setEditDialogOpen(true);
  }, []);

  const handleView = useCallback((document: Document) => {
    setSelectedDocument(document);
    setDocumentContent(document);
    setViewDialogOpen(true);
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
      header: 'Actions',
      cell: ({ row }) => (
        <DocumentActions
          document={row.original}
          onEdit={handleEdit}
          onView={handleView}
          onDelete={handleDeleteDocument}
          isDeleting={deletingDocId === row.original._id}
        />
      ),
    },
  ];

  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between'>
        <div className='flex items-center gap-3'>
          <CardTitle>Documents</CardTitle>
          {!isLoadingDocs && (
            <span className='text-sm text-muted-foreground'>
              {totalCount.toLocaleString()} {totalCount === 1 ? 'document' : 'documents'}
            </span>
          )}
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>Create Document</Button>
          </DialogTrigger>
        </Dialog>
      </CardHeader>
      <CardContent className='space-y-4'>
        <QueryBuilder
          fields={getUniqueKeys(documents)}
          onQueryChange={(query) => {
            setSearchQuery(query);
            setPage(0); // Reset to first page on new query
          }}
          initialQuery={searchQuery}
        />

        {isLoadingDocs ? (
          <div className='space-y-2'>
            <Skeleton className='h-10 w-full' />
            <Skeleton className='h-10 w-full' />
            <Skeleton className='h-10 w-full' />
            <Skeleton className='h-10 w-full' />
            <Skeleton className='h-10 w-full' />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={documents}
            defaultSorting={[{ id: '_id', desc: false }]}
            emptyMessage={searchQuery ? 'No documents match your query.' : 'This collection is empty. Create your first document.'}
          />
        )}

        <Pagination
          page={page}
          pageSize={pageSize}
          totalCount={totalCount}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          isLoading={isLoadingDocs}
        />

        <DocumentDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          title='Create New Document'
          initialValue={{}}
          onValueChange={setDocumentContent}
          onSubmit={handleCreateDocument}
          submitLabel='Create'
          submittingLabel='Creating...'
          isSubmitting={isSubmitting}
        />

        <DocumentDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          title='Edit Document'
          initialValue={documentContent}
          onValueChange={setDocumentContent}
          onSubmit={handleUpdateDocument}
          submitLabel='Save Changes'
          submittingLabel='Saving...'
          isSubmitting={isSubmitting}
        />

        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle>View Document</DialogTitle>
            </DialogHeader>
            <div className='py-4'>
              <Editor initialValue={documentContent} onChange={() => {}} readOnly />
            </div>
            <div className='flex justify-end gap-2'>
              <Button
                variant='outline'
                onClick={() => {
                  setViewDialogOpen(false);
                  handleEdit(selectedDocument!);
                }}
              >
                <Pencil className='mr-2 h-4 w-4' />
                Edit
              </Button>
              <Button variant='secondary' onClick={() => setViewDialogOpen(false)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
