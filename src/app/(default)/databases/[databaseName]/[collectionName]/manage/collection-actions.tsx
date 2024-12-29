'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { useToast } from '@/hooks/use-toast';

interface ActionsProps {
  databaseName: string;
  collectionName: string;
  renameCollection: (dbName: string, oldName: string, newName: string) => Promise<void>;
  reindexCollection: (dbName: string, collectionName: string) => Promise<void>;
  compactCollection: (dbName: string, collectionName: string) => Promise<void>;
  clearCollection: (dbName: string, collectionName: string) => Promise<void>;
}

export function CollectionActions({
  databaseName,
  collectionName,
  renameCollection,
  reindexCollection,
  compactCollection,
  clearCollection,
}: ActionsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleRename = async () => {
    if (!newName || newName === collectionName) return;

    setIsLoading('rename');
    try {
      await renameCollection(databaseName, collectionName, newName);
      setRenameDialogOpen(false);
      toast({
        title: 'Collection renamed',
        description: `Successfully renamed collection to ${newName}`,
      });
      router.push(`/databases/${databaseName}/${newName}`);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to rename collection',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(null);
    }
  };

  const handleReindex = async () => {
    setIsLoading('reindex');
    try {
      await reindexCollection(databaseName, collectionName);
      toast({
        title: 'Collection reindexed',
        description: 'Successfully reindexed collection',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to reindex collection',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(null);
    }
  };

  const handleCompact = async () => {
    setIsLoading('compact');
    try {
      await compactCollection(databaseName, collectionName);
      toast({
        title: 'Collection compacted',
        description: 'Successfully compacted collection',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to compact collection',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(null);
    }
  };

  const handleClearData = async () => {
    setIsLoading('clear');
    try {
      await clearCollection(databaseName, collectionName);
      toast({
        title: 'Collection cleared',
        description: 'Successfully cleared all documents from collection',
      });
      router.refresh();
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to clear collection',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Collection Actions</CardTitle>
      </CardHeader>
      <CardContent className='grid grid-cols-2 gap-4'>
        <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
          <DialogTrigger asChild>
            <Button variant='outline' className='w-full'>
              Rename Collection
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rename Collection</DialogTitle>
            </DialogHeader>
            <div className='grid gap-4 py-4'>
              <div className='grid gap-2'>
                <Label htmlFor='name'>New Name</Label>
                <Input
                  id='name'
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder={collectionName}
                />
              </div>
            </div>
            <div className='flex justify-end gap-2'>
              <Button variant='secondary' onClick={() => setRenameDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleRename}
                disabled={!newName || newName === collectionName || isLoading === 'rename'}
              >
                {isLoading === 'rename' ? 'Renaming...' : 'Rename'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Button variant='outline' className='w-full' onClick={handleReindex} disabled={isLoading === 'reindex'}>
          {isLoading === 'reindex' ? 'Reindexing...' : 'Reindex'}
        </Button>

        <Button variant='outline' className='w-full' onClick={handleCompact} disabled={isLoading === 'compact'}>
          {isLoading === 'compact' ? 'Compacting...' : 'Compact'}
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant='outline' className='w-full text-red-600 hover:text-red-600'>
              Clear Data
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete all documents in the collection.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleClearData}
                className='bg-red-600 hover:bg-red-700'
                disabled={isLoading === 'clear'}
              >
                {isLoading === 'clear' ? 'Clearing...' : 'Clear Data'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
