export default async function Page({ params }: { params: Promise<{ databaseName: string; collectionName: string }> }) {
  const { collectionName, databaseName } = await params;
  return (
    <p>
      Database: {databaseName}, Collection: {collectionName}
    </p>
  );
}
