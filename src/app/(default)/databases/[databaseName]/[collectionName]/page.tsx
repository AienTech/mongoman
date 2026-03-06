import { PageParamsWithCollection } from '@/lib/types';
import { getDocuments, createDocument, updateDocument, deleteDocument } from '@/lib/mongodb';
import { DocumentManagement } from '@/app/(default)/databases/[databaseName]/[collectionName]/manage/document-management';
import { EJSON } from 'bson';
import { FileText } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default async function Page({ params }: PageParamsWithCollection) {
  const { collectionName, databaseName } = await params;

  const getSerializedDocuments = async (
    dbName: string,
    collectionName: string,
    filter?: object,
    skip?: number,
    limit?: number,
  ) => {
    'use server';
    const { documents, totalCount } = await getDocuments(dbName, collectionName, filter, skip, limit);
    return { documents: documents.map((doc) => EJSON.serialize(doc)), totalCount };
  };

  const createSerializedDocument = async (dbName: string, collectionName: string, document: object) => {
    'use server';
    const deserializedDoc = EJSON.deserialize(document);
    return createDocument(dbName, collectionName, deserializedDoc);
  };

  const updateSerializedDocument = async (dbName: string, collectionName: string, id: string, document: object) => {
    'use server';
    const deserializedDoc = EJSON.deserialize(document);
    return updateDocument(dbName, collectionName, id, deserializedDoc);
  };

  return (
    <div className='p-6 space-y-6'>
      <div className='flex items-center gap-3'>
        <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10'>
          <FileText className='h-5 w-5 text-blue-500' />
        </div>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>{collectionName}</h1>
          <p className='text-sm text-muted-foreground'>
            Browse and manage documents in {databaseName}
          </p>
        </div>
      </div>

      <Separator />

      <DocumentManagement
        databaseName={databaseName}
        collectionName={collectionName}
        getDocuments={getSerializedDocuments}
        createDocument={createSerializedDocument}
        updateDocument={updateSerializedDocument}
        deleteDocument={deleteDocument}
      />
    </div>
  );
}

export const dynamic = 'force-dynamic';
