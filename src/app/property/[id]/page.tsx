'use client';

import { Footer } from '@/components/ui/footer';
import { WhatsAppFloat } from '@/components/ui/whatsapp-float';
import prisma from '@/lib/prisma';
import { Metadata, ResolvingMetadata } from 'next';
import { PropertyView } from './components/PropertyView';
import { notFound } from 'next/navigation';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Product, WithContext } from 'schema-dts';
import { useEffect, useState } from 'react';

type PropertyPageProps = {
  params: Promise<{
    id: string;
  }>;
};

async function getProperty(id: string) {
  const property = await prisma.property.findUnique({
    where: {
      id,
      published: true,
      status: 'AVAILABLE',
    },
    include: {
      photos: true,
    },
  });

  if (!property) {
    notFound();
  }

  return property;
}

export default function PropertyPage({ params }: PropertyPageProps) {
  const [property, setProperty] = useState<any>(null);

  useEffect(() => {
    params.then(({ id }) => getProperty(id)).then(setProperty);
  }, [params]);

  if (!property) {
    return <div>Cargando...</div>;
  }

  const breadcrumbItems = [
    { label: 'Propiedades', href: '/properties' },
    { label: property.name },
  ];

  const jsonLd: WithContext<Product> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: property.name,
    description: property.description || undefined,
    image: property.photos.map((photo: { url: string }) => photo.url),
    offers: {
      '@type': 'Offer',
      price: property.price.toString(),
      priceCurrency: 'ARS',
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: 'Polar Inmobiliaria',
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Header */}
      <header className="bg-white shadow-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-3">
            <img
              src="/favicon-32x32.png"
              alt="Polar Inmobiliaria"
              className="w-8 h-8"
            />
            <h1 className="text-xl font-bold text-gray-900">
              Polar Inmobiliaria
            </h1>
          </div>
        </div>
      </header>

      <Breadcrumb items={breadcrumbItems} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <PropertyView property={property} />
      </main>

      <Footer />
      <WhatsAppFloat
        propertyName={property.name}
        propertyAddress={property.address}
        propertyPrice={property.price}
        propertyUrl={`${process.env.NEXT_PUBLIC_BASE_URL}/property/${property.id}`}
      />
    </div>
  );
}
