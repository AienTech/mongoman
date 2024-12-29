// lib/mongodb.ts
import { MongoClient, ObjectId } from 'mongodb';
import { CollectionStats } from '@/lib/types';

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
    'use server';
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

  export async function getDatabases() {
    'use server';
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

  export async function getCollections(dbName: string) {
    const client = await clientPromise;
    const db = client.db(dbName);
    const collections = await db.listCollections().toArray();
    return collections;
  }

  export async function createCollection(dbName: string, collectionName: string) {
    'use server';
    const client = await clientPromise;
    const db = client.db(dbName);
    await db.createCollection(collectionName);
  }

  export async function deleteCollection(dbName: string, collectionName: string) {
    'use server';
    const client = await clientPromise;
    const db = client.db(dbName);
    await db.dropCollection(collectionName);
  }

  export async function getCollectionStats(dbName: string, collectionName: string): Promise<CollectionStats> {
    'use server';
    const client = await clientPromise;
    const db = client.db(dbName);
    const stats = await db.command({ collStats: collectionName });

    return {
      count: stats.count,
      size: stats.size,
      avgObjSize: stats.avgObjSize,
      storageSize: stats.storageSize,
      nindexes: stats.nindexes,
      totalIndexSize: stats.totalIndexSize,
      paddingFactor: stats.paddingFactor,
      nExtents: stats.nExtents || 0,
    };
  }

  export async function getCollectionIndexes(dbName: string, collectionName: string) {
    'use server';
    const client = await clientPromise;
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    const indexes = await collection.indexes();
    return indexes;
  }

  export async function createCollectionIndex(
    dbName: string,
    collectionName: string,
    keys: Record<string, number>,
    options?: { name?: string },
  ) {
    'use server';
    const client = await clientPromise;
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    return collection.createIndex(keys, options);
  }

  export async function dropCollectionIndex(dbName: string, collectionName: string, indexName: string) {
    'use server';
    const client = await clientPromise;
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    await collection.dropIndex(indexName);
  }

  export async function getDocuments(dbName: string, collectionName: string, filter?: object) {
    'use server';
    const client = await clientPromise;
    const collection = client.db(dbName).collection(collectionName);
    return collection.find(filter || {}).toArray();
  }

  export async function createDocument(dbName: string, collectionName: string, document: object) {
    'use server';
    const client = await clientPromise;
    const collection = client.db(dbName).collection(collectionName);
    await collection.insertOne(document);
  }

  export async function updateDocument(dbName: string, collectionName: string, id: string, document: object) {
    'use server';
    const client = await clientPromise;
    const collection = client.db(dbName).collection(collectionName);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, ...updateDoc } = document;
    await collection.updateOne({ _id: new ObjectId(id) }, { $set: updateDoc });
  }

  export async function deleteDocument(dbName: string, collectionName: string, id: string) {
    'use server';
    const client = await clientPromise;
    const collection = client.db(dbName).collection(collectionName);
    await collection.deleteOne({ _id: new ObjectId(id) });
  }

  export async function renameCollection(dbName: string, oldName: string, newName: string) {
    'use server';
    const client = await clientPromise;
    const db = client.db(dbName);
    await db.collection(oldName).rename(newName);
  }

  export async function reindexCollection(dbName: string, collectionName: string) {
    'use server';
    const client = await clientPromise;
    const db = client.db(dbName);
    await db.command({ reIndex: collectionName });
  }

  export async function compactCollection(dbName: string, collectionName: string) {
    'use server';
    const client = await clientPromise;
    const db = client.db(dbName);
    await db.command({ compact: collectionName });
  }

  export async function clearCollection(dbName: string, collectionName: string) {
    'use server';
    const client = await clientPromise;
    const db = client.db(dbName);
    await db.collection(collectionName).deleteMany({});
  }
}

export { clientPromise };
