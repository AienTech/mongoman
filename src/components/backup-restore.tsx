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
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, Upload, HardDrive } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BackupRestoreProps {
  databaseName: string;
  restoreDatabase: (dbName: string, backup: Record<string, object[]>) => Promise<Record<string, number>>;
}

export function BackupRestore({ databaseName, restoreDatabase }: BackupRestoreProps) {
  const { toast } = useToast();
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [pendingBackup, setPendingBackup] = useState<Record<string, object[]> | null>(null);
  const [backupInfo, setBackupInfo] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBackup = () => {
    window.open(`/api/backup/${databaseName}`, '_blank');
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const backup = JSON.parse(text);

      if (typeof backup !== 'object' || Array.isArray(backup)) {
        toast({
          title: 'Error',
          description: 'Invalid backup file format. Expected a JSON object with collection names as keys.',
          variant: 'destructive',
        });
        return;
      }

      const collections = Object.keys(backup);
      const totalDocs = Object.values(backup).reduce(
        (sum: number, docs) => sum + (Array.isArray(docs) ? docs.length : 0),
        0,
      );

      setPendingBackup(backup);
      setBackupInfo(`${collections.length} collections, ${totalDocs} total documents`);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to parse backup file. Ensure it is valid JSON.',
        variant: 'destructive',
      });
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRestore = async () => {
    if (!pendingBackup) return;

    setIsRestoring(true);

    try {
      const results = await restoreDatabase(databaseName, pendingBackup);
      const totalInserted = Object.values(results).reduce((sum, count) => sum + count, 0);
      toast({
        title: 'Restore successful',
        description: `Restored ${totalInserted} documents across ${Object.keys(results).length} collections`,
      });
      setRestoreDialogOpen(false);
      setPendingBackup(null);
      window.location.reload();
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to restore database',
        variant: 'destructive',
      });
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <HardDrive className='h-5 w-5' />
          Backup & Restore
        </CardTitle>
      </CardHeader>
      <CardContent className='grid grid-cols-2 gap-4'>
        <Button variant='outline' className='w-full' onClick={handleBackup}>
          <Download className='mr-2 h-4 w-4' />
          Backup Database
        </Button>

        <Dialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
          <DialogTrigger asChild>
            <Button variant='outline' className='w-full'>
              <Upload className='mr-2 h-4 w-4' />
              Restore Database
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Restore Database</DialogTitle>
              <DialogDescription>
                Upload a backup JSON file to restore collections into {databaseName}.
                Existing collections with the same names will have documents appended.
              </DialogDescription>
            </DialogHeader>
            <div className='space-y-4'>
              <div className='flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6'>
                <Upload className='mb-2 h-8 w-8 text-muted-foreground' />
                <p className='mb-2 text-sm text-muted-foreground'>Select a backup JSON file</p>
                <Input
                  ref={fileInputRef}
                  type='file'
                  accept='.json'
                  onChange={handleFileSelect}
                  className='cursor-pointer max-w-xs'
                  disabled={isRestoring}
                />
              </div>

              {pendingBackup && (
                <div className='space-y-3'>
                  <Alert>
                    <AlertDescription>Ready to restore: {backupInfo}</AlertDescription>
                  </Alert>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button className='w-full' disabled={isRestoring}>
                        {isRestoring ? 'Restoring...' : 'Restore Now'}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Restore</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will insert documents from the backup into {databaseName}.
                          This action may create new collections and add documents. Continue?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleRestore}>Restore</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
