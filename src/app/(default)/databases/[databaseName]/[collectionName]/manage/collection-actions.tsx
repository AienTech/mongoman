'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ActionsProps {
  databaseName: string;
  collectionName: string;
}

export function CollectionActions({ databaseName, collectionName }: ActionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Collection Actions</CardTitle>
      </CardHeader>
      <CardContent className='grid grid-cols-2 gap-4'>
        <Dialog>
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
                <Input id='name' />
              </div>
            </div>
            <div className='flex justify-end'>
              <Button>Rename</Button>
            </div>
          </DialogContent>
        </Dialog>

        <Button variant='outline' className='w-full'>
          Reindex
        </Button>
        <Button variant='outline' className='w-full'>
          Compact
        </Button>
        <Button variant='outline' className='w-full'>
          Clear Data
        </Button>
      </CardContent>
    </Card>
  );
}
