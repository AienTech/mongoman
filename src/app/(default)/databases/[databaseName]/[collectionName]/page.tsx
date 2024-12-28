import { PageParamsWithCollection } from '@/lib/types';
import { Functions } from '@/lib/mongodb';
import { DocumentManagement } from '@/app/(default)/databases/[databaseName]/[collectionName]/manage/document-management';

export default async function Page({ params }: PageParamsWithCollection) {
  const { collectionName, databaseName } = await params;

  const documents = JSON.stringify(await Functions.getDocuments(databaseName, collectionName));

  return (
    <DocumentManagement
      databaseName={databaseName}
      collectionName={collectionName}
      documents={documents}
      createDocument={Functions.createDocument}
      updateDocument={Functions.updateDocument}
      deleteDocument={Functions.deleteDocument}
    />
  );
}
