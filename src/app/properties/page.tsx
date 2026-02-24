'use client';

import { Footer } from '@/components/ui/footer';
import { WhatsAppFloat } from '@/components/ui/whatsapp-float';
import { PropertiesView } from './components/PropertiesView';
import prisma from '@/lib/prisma';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

function useAsyncSearchParams() {
  const searchParams = useSearchParams();
  return Object.fromEntries(searchParams.entries());
}

async function getProperties(searchParams: {
  [key: string]: string | string[] | undefined;
}) {
  try {
    const page = parseInt((searchParams.page as string) || '1');
    const limit = parseInt((searchParams.limit as string) || '12');
    const search = searchParams.search as string;
    const type = searchParams.type as string;
    const order = (searchParams.order as string) || 'asc';
    const view = (searchParams.view as string) || 'grid';

    const skip = (page - 1) * limit;

    const where: any = {
      published: true,
      status: 'AVAILABLE',
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' as const } },
        { address: { contains: search, mode: 'insensitive' as const } },
      ];
    }

    if (type && type !== 'all') {
      where.type = type;
    }

    const orderBy = { price: order as 'asc' | 'desc' };

    const [properties, totalRecords] = await Promise.all([
      prisma.property.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          photos: true,
        },
      }),
      prisma.property.count({ where }),
    ]);

    const totalPages = Math.ceil(totalRecords / limit);

    return {
      properties,
      totalPages,
      currentPage: page,
    };
  } catch (error) {
    console.error(error);
    return {
      properties: [],
      totalPages: 1,
      currentPage: 1,
    };
  }
}

function PropertiesContent() {
  const searchParams = useAsyncSearchParams();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    getProperties(searchParams).then(setData);
  }, [searchParams]);

  if (!data) {
    return <div>Cargando...</div>;
  }

  const { properties, totalPages, currentPage } = data;

  return (
    <main>
      <PropertiesView
        properties={properties}
        totalPages={totalPages}
        currentPage={currentPage}
        isLoading={false}
      />
    </main>
  );
}

export default function PropiedadesPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'ADMIN';

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
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
            {isAdmin ? (
              <Link
                href="/admin"
                className="px-4 py-2 bg-[#600096] hover:bg-[#500080] text-white rounded-lg transition-colors"
              >
                Panel Admin
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 bg-[#600096] hover:bg-[#500080] text-white rounded-lg transition-colors"
              >
                Iniciar Sesión
              </Link>
            )}
          </div>
        </div>
      </header>

      <Suspense fallback={<div>Cargando...</div>}>
        <PropertiesContent />
      </Suspense>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
