// lib/mongodb.ts
import { MongoClient } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

const uri = process.env.MONGODB_URI;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Functions {
  export async function getServerStatus() {
    const client = await clientPromise;
    const admin = client.db().admin();
    const status = await admin.serverStatus();
    const buildInfo = await admin.buildInfo();

    return {
      hostname: status.host,
      mongoVersion: buildInfo.version,
      uptime: Math.floor(status.uptime),
      nodeVersion: process.version,
      v8Version: status.version,
      serverTime: new Date(Date.now()),
      connections: {
        current: status.connections.current,
        available: status.connections.available,
        activeClients: status.globalLock?.activeClients?.total || 0,
        queuedOperations: status.globalLock?.currentQueue?.total || 0,
        clientsReading: status.globalLock?.activeClients?.readers || 0,
        clientsWriting: status.globalLock?.activeClients?.writers || 0,
        readLockQueue: status.globalLock?.currentQueue?.readers || 0,
        writeLockQueue: status.globalLock?.currentQueue?.writers || 0,
      },
      operations: {
        insertCount: status.opcounters?.insert || 0,
        queryCount: status.opcounters?.query || 0,
        updateCount: status.opcounters?.update || 0,
        deleteCount: status.opcounters?.delete || 0,
      },
      // Note: Flush info might not be available in all MongoDB setups
      flushInfo: {
        flushes: status.backgroundFlushing?.flushes,
        totalMs: status.backgroundFlushing?.total_ms,
        averageMs: status.backgroundFlushing?.average_ms,
        lastMs: status.backgroundFlushing?.last_ms,
        lastFinished: status.backgroundFlushing?.last_finished,
      },
    };
  }

  export async function getDatabaseStats(dbName: string) {
    const client = await clientPromise;
    const db = client.db(dbName);
    const stats = await db.stats();

    return {
      collections: stats.collections,
      dataSize: stats.dataSize,
      storageSize: stats.storageSize,
      avgObjSize: stats.avgObjSize,
      indexes: stats.indexes,
      indexSize: stats.indexSize,
    };
  }

  export async function getCollections(dbName: string) {
    const client = await clientPromise;
    const db = client.db(dbName);
    const collections = await db.listCollections().toArray();
    return collections;
  }

  export async function getDatabases() {
    const client = await clientPromise;
    const admin = client.db().admin();
    const result = await admin.listDatabases();
    return result;
  }

  export async function createDatabase(name: string) {
    'use server';
    const client = await clientPromise;
    await client.db(name).createCollection('_init');
  }

  export async function deleteDatabase(name: string) {
    'use server';
    const client = await clientPromise;
    await client.db(name).dropDatabase();
  }
}

export { clientPromise };
