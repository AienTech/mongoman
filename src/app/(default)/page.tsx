import { getServerStatus } from '@/lib/mongodb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatUptime } from '@/lib/utils';
import { Activity, Clock, Globe, Lock, MonitorDot, Server, Wifi, Zap } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default async function Page() {
  const status = await getServerStatus();
  return (
    <div className='p-6 space-y-6'>
      <div className='flex items-center gap-3'>
        <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10'>
          <Activity className='h-5 w-5 text-green-500' />
        </div>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>Server Status</h1>
          <p className='text-sm text-muted-foreground'>
            MongoDB {status.mongoVersion} &middot; up {formatUptime(status.uptime)}
          </p>
        </div>
      </div>

      <Separator />

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='flex items-center gap-2 text-base'>
              <Server className='h-4 w-4 text-muted-foreground' />
              System Information
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            <div className='flex justify-between'>
              <span className='text-sm text-muted-foreground'>Hostname</span>
              <span className='font-mono text-sm'>{status.hostname}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-sm text-muted-foreground'>MongoDB Version</span>
              <span className='font-mono text-sm'>{status.mongoVersion}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-sm text-muted-foreground'>Uptime</span>
              <span className='font-mono text-sm'>{formatUptime(status.uptime)}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-sm text-muted-foreground'>Node Version</span>
              <span className='font-mono text-sm'>{status.nodeVersion}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-sm text-muted-foreground'>Server Time</span>
              <span className='font-mono text-sm'>{status.serverTime.toUTCString()}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-sm text-muted-foreground'>V8 Version</span>
              <span className='font-mono text-sm'>{status.v8Version}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='flex items-center gap-2 text-base'>
              <Wifi className='h-4 w-4 text-muted-foreground' />
              Connections
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            <div className='flex justify-between'>
              <span className='text-sm text-muted-foreground'>Current</span>
              <span className='font-mono text-sm font-medium'>{status.connections.current}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-sm text-muted-foreground'>Available</span>
              <span className='font-mono text-sm'>{status.connections.available}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-sm text-muted-foreground'>Active Clients</span>
              <span className='font-mono text-sm'>{status.connections.activeClients}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-sm text-muted-foreground'>Queued Operations</span>
              <span className='font-mono text-sm'>{status.connections.queuedOperations}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-sm text-muted-foreground'>Clients Reading</span>
              <span className='font-mono text-sm'>{status.connections.clientsReading}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-sm text-muted-foreground'>Clients Writing</span>
              <span className='font-mono text-sm'>{status.connections.clientsWriting}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='flex items-center gap-2 text-base'>
              <Zap className='h-4 w-4 text-muted-foreground' />
              Operations
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            <div className='flex justify-between'>
              <span className='text-sm text-muted-foreground'>Total Inserts</span>
              <span className='font-mono text-sm'>{status.operations.insertCount}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-sm text-muted-foreground'>Total Queries</span>
              <span className='font-mono text-sm'>{status.operations.queryCount}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-sm text-muted-foreground'>Total Updates</span>
              <span className='font-mono text-sm'>{status.operations.updateCount}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-sm text-muted-foreground'>Total Deletes</span>
              <span className='font-mono text-sm'>{status.operations.deleteCount}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='flex items-center gap-2 text-base'>
              <Lock className='h-4 w-4 text-muted-foreground' />
              Lock Queue
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            <div className='flex justify-between'>
              <span className='text-sm text-muted-foreground'>Read Lock Queue</span>
              <span className='font-mono text-sm'>{status.connections.readLockQueue}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-sm text-muted-foreground'>Write Lock Queue</span>
              <span className='font-mono text-sm'>{status.connections.writeLockQueue}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';
