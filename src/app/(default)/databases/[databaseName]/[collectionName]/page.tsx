import { PageParamsWithCollection } from '@/lib/types';
import { Functions } from '@/lib/mongodb';
import { DocumentManagement } from '@/app/(default)/databases/[databaseName]/[collectionName]/manage/document-management';
import { EJSON } from 'bson';

export default async function Page({ params }: PageParamsWithCollection) {
  const { collectionName, databaseName } = await params;

  const getSerializedDocuments = async (dbName: string, collectionName: string, filter?: object) => {
    'use server';
    const docs = await Functions.getDocuments(dbName, collectionName, filter);
    return docs.map((doc) => EJSON.serialize(doc));
  };

  const createSerializedDocument = async (dbName: string, collectionName: string, document: object) => {
    'use server';
    const deserializedDoc = EJSON.deserialize(document);
    return Functions.createDocument(dbName, collectionName, deserializedDoc);
  };

  const updateSerializedDocument = async (dbName: string, collectionName: string, id: string, document: object) => {
    'use server';
    const deserializedDoc = EJSON.deserialize(document);
    return Functions.updateDocument(dbName, collectionName, id, deserializedDoc);
  };

  return (
    <DocumentManagement
      databaseName={databaseName}
      collectionName={collectionName}
      getDocuments={getSerializedDocuments}
      createDocument={createSerializedDocument}
      updateDocument={updateSerializedDocument}
      deleteDocument={Functions.deleteDocument}
    />
  );
}
