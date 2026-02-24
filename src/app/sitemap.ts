import { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://polarinmobiliaria.com.ar';

  const properties = await prisma.property.findMany({
    where: {
      published: true,
      status: 'AVAILABLE',
    },
    select: {
      id: true,
      updatedAt: true,
    },
  });

  const propertyUrls = properties.map((property) => ({
    url: `${baseUrl}/property/${property.id}`,
    lastModified: property.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/properties`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/properties?type=RENT`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/properties?type=SALE`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/servicios`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    ...propertyUrls,
  ];
}
