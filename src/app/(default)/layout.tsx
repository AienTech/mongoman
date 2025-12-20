import { PropsWithChildren } from 'react';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { getDatabases, createDatabase, deleteDatabase } from '@/lib/mongodb';
import { DynamicBreadcrumb } from '@/components/dynamic-breadcrumb';

export default async function RootLayout({ children }: PropsWithChildren) {
  const databases = await getDatabases();
  const url = new URL('', process.env.MONGODB_URI);

  return (
    <SidebarProvider>
      <AppSidebar
        databases={databases}
        dbHost={url.host}
        createDatabase={createDatabase}
        deleteDatabase={deleteDatabase}
      />
      <SidebarInset>
        <header className='flex h-16 shrink-0 items-center gap-2 border-b'>
          <div className='flex items-center gap-2 px-3'>
            <SidebarTrigger />
            <Separator orientation='vertical' className='mr-2 h-4' />
            <DynamicBreadcrumb />
          </div>
        </header>
        <div className='flex flex-1 flex-col gap-4 p-4'>{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export const dynamic = 'force-dynamic';
