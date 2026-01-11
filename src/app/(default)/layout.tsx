import { PropsWithChildren } from 'react';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { getDatabases, createDatabase, deleteDatabase } from '@/lib/mongodb';
import { DynamicBreadcrumb } from '@/components/dynamic-breadcrumb';
import { EJSON } from 'bson';
import { DatabaseInfo } from '@/lib/types';

export default async function RootLayout({ children }: PropsWithChildren) {
  const databasesResult = await getDatabases();
  // Serialize MongoDB result to plain objects for Client Component
  const databases = EJSON.serialize(databasesResult) as DatabaseInfo;

  // Parse MongoDB URI to extract host(s) - supports both single host and replica sets
  let dbHost = 'localhost:27017';
  if (process.env.MONGODB_URI) {
    try {
      // Extract host(s) from URI (works for both single host and replica sets)
      // Examples: mongodb://localhost:27017 or mongodb://host1:27017,host2:27017,host3:27017/?replicaSet=rs0
      const uriMatch = process.env.MONGODB_URI.match(/^mongodb:\/\/(?:[^@]+@)?([^\/?]+)/);
      if (uriMatch) {
        dbHost = uriMatch[1].split(',')[0]; // Get first host (for replica sets) or the only host (for single host)
      }
    } catch {
      // Fallback to default if parsing fails
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar
        databases={databases}
        dbHost={dbHost}
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
