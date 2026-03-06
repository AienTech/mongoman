'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Upload, FileJson, FileSpreadsheet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { parseCsv } from '@/lib/utils';

interface ImportExportProps {
  databaseName: string;
  collectionName: string;
  importDocuments: (dbName: string, collectionName: string, documents: object[]) => Promise<{ insertedCount: number }>;
  onImportComplete?: () => void;
}

export function ImportExport({
  databaseName,
  collectionName,
  importDocuments,
  onImportComplete,
}: ImportExportProps) {
  const { toast } = useToast();
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportJSON = () => {
    window.open(`/api/export/${databaseName}/${collectionName}`, '_blank');
  };

  const handleExportCSV = () => {
    window.open(`/api/export/${databaseName}/${collectionName}/csv`, '_blank');
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);

    try {
      const text = await file.text();
      let documents: object[];

      if (file.name.endsWith('.csv')) {
        documents = parseCsv(text);
      } else {
        const parsed = JSON.parse(text);
        documents = Array.isArray(parsed) ? parsed : [parsed];
      }

      if (documents.length === 0) {
        toast({ title: 'Error', description: 'No documents found in file', variant: 'destructive' });
        return;
      }

      const result = await importDocuments(databaseName, collectionName, documents);
      toast({
        title: 'Import successful',
        description: `Imported ${result.insertedCount} documents`,
      });
      setImportDialogOpen(false);
      onImportComplete?.();
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to import file',
        variant: 'destructive',
      });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import / Export</CardTitle>
      </CardHeader>
      <CardContent className='grid grid-cols-2 gap-4'>
        <Button variant='outline' className='w-full' onClick={handleExportJSON}>
          <FileJson className='mr-2 h-4 w-4' />
          Export JSON
        </Button>

        <Button variant='outline' className='w-full' onClick={handleExportCSV}>
          <FileSpreadsheet className='mr-2 h-4 w-4' />
          Export CSV
        </Button>

        <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
          <DialogTrigger asChild>
            <Button variant='outline' className='w-full col-span-2'>
              <Upload className='mr-2 h-4 w-4' />
              Import Documents
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Import Documents</DialogTitle>
              <DialogDescription>
                Upload a JSON or CSV file to import documents into {collectionName}.
              </DialogDescription>
            </DialogHeader>
            <div className='space-y-4'>
              <div className='flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6'>
                <Upload className='mb-2 h-8 w-8 text-muted-foreground' />
                <p className='mb-2 text-sm text-muted-foreground'>
                  Select a JSON or CSV file to import
                </p>
                <Input
                  ref={fileInputRef}
                  type='file'
                  accept='.json,.csv'
                  onChange={handleImport}
                  className='cursor-pointer max-w-xs'
                  disabled={isImporting}
                />
              </div>
              {isImporting && <p className='text-center text-sm text-muted-foreground'>Importing...</p>}
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
