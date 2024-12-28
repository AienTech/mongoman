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
