'use client';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useParams, usePathname } from 'next/navigation';

export function DynamicBreadcrumb() {
  const pathname = usePathname();
  const params = useParams();

  // Function to generate breadcrumb items
  const generateBreadcrumbs = () => {
    const segments = pathname.split('/').filter(Boolean);

    const items = segments.map((segment, index) => {
      const url = `/${segments.slice(0, index + 1).join('/')}`;

      let displayText = segment;
      if (segment === params.databaseName) {
        displayText = `Database: ${segment}`;
      } else if (segment === params.collectionName) {
        displayText = `Collection: ${segment}`;
      } else if (segment === 'databases') {
        displayText = 'Databases';
      }

      if (index === segments.length - 1) {
        return (
          <BreadcrumbItem key={url}>
            <BreadcrumbPage>{displayText}</BreadcrumbPage>
          </BreadcrumbItem>
        );
      }

      return (
        <BreadcrumbItem key={url}>
          <BreadcrumbLink href={url}>{displayText}</BreadcrumbLink>
        </BreadcrumbItem>
      );
    });

    return items.reduce((acc: React.ReactNode[], item, i) => {
      if (i !== 0 && i !== items.length) {
        acc.push(<BreadcrumbSeparator key={`separator-${i}`} />);
      }
      acc.push(item);
      return acc;
    }, []);
  };

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href='/'>Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        {generateBreadcrumbs()}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
