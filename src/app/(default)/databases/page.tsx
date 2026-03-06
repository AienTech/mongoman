// app/databases/page.tsx
import { getDatabases, getDatabaseStats } from '@/lib/mongodb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DatabaseTable } from './table';
import { EJSON } from 'bson';
import { Database } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default async function DatabasesPage() {
  // Get all databases and their stats
  const databasesResult = await getDatabases();
  const { databases } = EJSON.serialize(databasesResult) as { databases: Array<{ name: string; sizeOnDisk: number }> };

  const databaseStats = await Promise.all(
    databases.map(async (db) => {
      try {
        const stats = await getDatabaseStats(db.name);
        return {
          name: db.name,
          sizeOnDisk: Number(db.sizeOnDisk), // Convert Long to number
          collections: stats.collections,
          empty: stats.collections === 0,
        };
      } catch (error) {
        console.error(`Error getting stats for ${db.name}:`, error);
        return {
          name: db.name,
          sizeOnDisk: Number(db.sizeOnDisk), // Convert Long to number
          collections: 0,
          empty: true,
        };
      }
    }),
  );

  return (
    <div className='p-6 space-y-6'>
      <div className='flex items-center gap-3'>
        <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10'>
          <Database className='h-5 w-5 text-primary' />
        </div>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>Databases</h1>
          <p className='text-sm text-muted-foreground'>
            {databases.length} {databases.length === 1 ? 'database' : 'databases'} on this instance
          </p>
        </div>
      </div>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>All Databases</CardTitle>
          <CardDescription>Click a database name to manage its collections</CardDescription>
        </CardHeader>
        <CardContent>
          <DatabaseTable data={databaseStats} />
        </CardContent>
      </Card>
    </div>
  );
}

export const dynamic = 'force-dynamic';
