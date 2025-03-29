import { Functions } from '@/lib/mongodb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatUptime } from '@/lib/utils';

export default async function Page() {
  const status = await Functions.getServerStatus();
  return (
    <div className='p-6 space-y-6'>
      <h1 className='text-2xl font-bold mb-4'>Server Status</h1>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <div className='text-sm text-muted-foreground'>Hostname</div>
                <div className='font-mono'>{status.hostname}</div>
              </div>
              <div>
                <div className='text-sm text-muted-foreground'>MongoDB Version</div>
                <div className='font-mono'>{status.mongoVersion}</div>
              </div>
              <div>
                <div className='text-sm text-muted-foreground'>Uptime</div>
                <div className='font-mono'>{formatUptime(status.uptime)}</div>
              </div>
              <div>
                <div className='text-sm text-muted-foreground'>Node Version</div>
                <div className='font-mono'>{status.nodeVersion}</div>
              </div>
              <div>
                <div className='text-sm text-muted-foreground'>Server Time</div>
                <div className='font-mono'>{status.serverTime.toUTCString()}</div>
              </div>
              <div>
                <div className='text-sm text-muted-foreground'>V8 Version</div>
                <div className='font-mono'>{status.v8Version}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Connections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <div className='text-sm text-muted-foreground'>Current Connections</div>
                <div className='font-mono'>{status.connections.current}</div>
              </div>
              <div>
                <div className='text-sm text-muted-foreground'>Available Connections</div>
                <div className='font-mono'>{status.connections.available}</div>
              </div>
              <div>
                <div className='text-sm text-muted-foreground'>Active Clients</div>
                <div className='font-mono'>{status.connections.activeClients}</div>
              </div>
              <div>
                <div className='text-sm text-muted-foreground'>Queued Operations</div>
                <div className='font-mono'>{status.connections.queuedOperations}</div>
              </div>
              <div>
                <div className='text-sm text-muted-foreground'>Clients Reading</div>
                <div className='font-mono'>{status.connections.clientsReading}</div>
              </div>
              <div>
                <div className='text-sm text-muted-foreground'>Clients Writing</div>
                <div className='font-mono'>{status.connections.clientsWriting}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Operations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <div className='text-sm text-muted-foreground'>Total Inserts</div>
                <div className='font-mono'>{status.operations.insertCount}</div>
              </div>
              <div>
                <div className='text-sm text-muted-foreground'>Total Queries</div>
                <div className='font-mono'>{status.operations.queryCount}</div>
              </div>
              <div>
                <div className='text-sm text-muted-foreground'>Total Updates</div>
                <div className='font-mono'>{status.operations.updateCount}</div>
              </div>
              <div>
                <div className='text-sm text-muted-foreground'>Total Deletes</div>
                <div className='font-mono'>{status.operations.deleteCount}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lock Queue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <div className='text-sm text-muted-foreground'>Read Lock Queue</div>
                <div className='font-mono'>{status.connections.readLockQueue}</div>
              </div>
              <div>
                <div className='text-sm text-muted-foreground'>Write Lock Queue</div>
                <div className='font-mono'>{status.connections.writeLockQueue}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';
