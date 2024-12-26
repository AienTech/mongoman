// lib/mongodb.ts
import { MongoClient } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your Mongo URI to .env.local");
}

const uri = process.env.MONGODB_URI;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
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
  export async function getDatabases() {
    const client = await clientPromise;
    const admin = client.db().admin();
    const result = await admin.listDatabases();
    return result;
  }

  export async function createDatabase(name: string) {
    "use server";
    const client = await clientPromise;
    await client.db(name).createCollection("_init");
  }

  export async function deleteDatabase(name: string) {
    "use server";
    const client = await clientPromise;
    await client.db(name).dropDatabase();
  }
}

export { clientPromise };
