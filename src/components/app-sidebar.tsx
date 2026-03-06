'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { Database, GalleryVerticalEnd, LogOut, MoreHorizontal, Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
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
import camelCase from 'next/dist/build/webpack/loaders/css-loader/src/camelcase';
import { DEBOUNCE_DEFAULT_INTERVAL } from '@/lib/utils';
import Link from 'next/link';
import { DatabaseInfo } from '@/lib/types';

const CreateDatabaseSchema = z.object({
  name: z.string().min(1, 'Database name is required'),
  useConvention: z.boolean().default(true),
});

type CreateDatabaseForm = z.infer<typeof CreateDatabaseSchema>;

export interface AppSidebarProps {
  databases: DatabaseInfo;
  dbHost: string;
  createDatabase: (name: string) => Promise<void>;
  deleteDatabase: (name: string) => Promise<void>;
  authEnabled?: boolean;
  username?: string;
}

export function AppSidebar({
  databases,
  createDatabase,
  deleteDatabase,
  dbHost,
  authEnabled,
  username,
  ...props
}: React.ComponentProps<typeof Sidebar> & AppSidebarProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [deletingDb, setDeletingDb] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);

  const form = useForm({
    resolver: zodResolver(CreateDatabaseSchema),
    defaultValues: {
      name: '',
      useConvention: true,
    },
  });

  // Watch for name changes to apply convention
  const nameValue = form.watch('name');
  const useConvention = form.watch('useConvention');

  useEffect(() => {
    if (!nameValue || !useConvention) return;

    const timeoutId = setTimeout(() => {
      let newName = camelCase(nameValue);

      if (!newName.endsWith('Db')) {
        newName = nameValue + 'Db';
      }

      form.setValue('name', newName);
    }, DEBOUNCE_DEFAULT_INTERVAL);

    return () => clearTimeout(timeoutId);
  }, [nameValue, form.setValue, useConvention]);

  async function onSubmit(data: CreateDatabaseForm) {
    setIsLoading(true);
    try {
      await createDatabase(data.name);
      setIsOpen(false);
      window.location.reload();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size='lg' asChild>
              <Link href='/'>
                <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground'>
                  <GalleryVerticalEnd className='size-4' />
                </div>
                <div className='flex flex-col gap-0.5 leading-none'>
                  <span className='font-semibold'>Mongoman</span>
                  <span className='text-xs text-sidebar-foreground/60 font-mono'>{dbHost}</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Databases</SidebarGroupLabel>
          <SidebarMenu>
            {databases.databases.length
              ? databases.databases.map((database) => {
                  return (
                    <SidebarMenuItem key={database.name}>
                      <SidebarMenuButton asChild>
                        <a href={`/databases/${database.name}`} className='font-medium'>
                          <Database />
                          {database.name}
                        </a>
                      </SidebarMenuButton>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <SidebarMenuAction>
                            <MoreHorizontal />
                          </SidebarMenuAction>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side={'right'} align={'start'}>
                          <DropdownMenuItem asChild>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button className='w-full justify-start' variant='ghost'>
                                  Delete
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete your database and remove
                                    all your data.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel disabled={deletingDb === database.name}>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    disabled={deletingDb === database.name}
                                    onClick={async (e) => {
                                      e.preventDefault();
                                      setDeletingDb(database.name);
                                      try {
                                        await deleteDatabase(database.name);
                                        window.location.reload();
                                      } finally {
                                        setDeletingDb(null);
                                      }
                                    }}
                                  >
                                    {deletingDb === database.name ? 'Deleting...' : 'Continue'}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </SidebarMenuItem>
                  );
                })
              : (
                  <p className='px-2 py-4 text-sm text-sidebar-foreground/50'>No databases yet</p>
                )}
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Dialog onOpenChange={setIsOpen} open={isOpen} modal={true}>
                  <DialogTrigger asChild>
                    <Button variant='ghost' size='sm' className='w-full border border-dashed'>
                      <Plus /> Create new database
                    </Button>
                  </DialogTrigger>
                  <DialogContent className='sm:max-w-[425px]'>
                    <DialogHeader>
                      <DialogTitle>Create new database</DialogTitle>
                      <DialogDescription>Give a name to your new database and click save.</DialogDescription>
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
                                  Automatically transforms database names to follow MongoDB naming conventions
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
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      {authEnabled && (
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                disabled={isLoggingOut}
                onClick={async () => {
                  setIsLoggingOut(true);
                  try {
                    await fetch('/api/auth/logout', { method: 'POST' });
                  } finally {
                    window.location.href = '/login';
                  }
                }}
              >
                <LogOut className='h-4 w-4' />
                <span>{isLoggingOut ? 'Logging out...' : `Logout${username ? ` (${username})` : ''}`}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      )}
      <SidebarRail />
    </Sidebar>
  );
}
