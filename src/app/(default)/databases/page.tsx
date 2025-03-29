// app/databases/page.tsx
import { Functions } from '@/lib/mongodb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { DatabaseTable } from './table';

export default async function DatabasesPage() {
  // Get all databases and their stats
  const { databases } = await Functions.getDatabases();

  const databaseStats = await Promise.all(
    databases.map(async (db) => {
      try {
        const stats = await Functions.getDatabaseStats(db.name);
        return {
          name: db.name,
          sizeOnDisk: db.sizeOnDisk,
          collections: stats.collections,
          empty: stats.collections === 0,
        };
      } catch (error) {
        console.error(`Error getting stats for ${db.name}:`, error);
        return {
          name: db.name,
          sizeOnDisk: db.sizeOnDisk,
          collections: 0,
          empty: true,
        };
      }
    }),
  );

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Databases</h1>
          <p className='text-muted-foreground'>Manage your MongoDB databases</p>
        </div>
        <Button asChild>
          <Link href='/databases/create'>Create Database</Link>
        </Button>
      </div>

      <div className='grid gap-4'>
        <Card>
          <CardHeader>
            <CardTitle>System Overview</CardTitle>
            <CardDescription>Your MongoDB instance currently has {databases.length} databases</CardDescription>
          </CardHeader>
          <CardContent>
            <DatabaseTable data={databaseStats} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';
