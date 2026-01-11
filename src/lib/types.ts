import { Document as Doc } from 'mongodb';

export interface PageParamsWithCollection {
  params: Promise<{ databaseName: string; collectionName: string }>;
}

export interface PageParams {
  params: Promise<{ databaseName: string }>;
}

export interface CollectionStats {
  count: number;
  size: number;
  avgObjSize: number;
  storageSize: number;
  nindexes: number;
  totalIndexSize: number;
  paddingFactor: number;
  nExtents: number;
}

export interface Document extends Doc {
  _id: string;
}

export interface DatabaseInfo {
  databases: Array<{ name: string; sizeOnDisk: number; empty: boolean }>;
  totalSize: number;
  totalSizeMb: number;
  ok: number;
}
