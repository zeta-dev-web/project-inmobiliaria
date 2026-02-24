import { Footer } from '@/components/ui/footer';
import { WhatsAppFloat } from '@/components/ui/whatsapp-float';
import { PropertiesView } from './components/PropertiesView';
import prisma from '@/lib/prisma';
import { Metadata } from 'next';

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

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const type = params.type as string;
  let title = 'Propiedades Disponibles';
  if (type === 'RENT') {
    title = 'Propiedades en Alquiler';
  } else if (type === 'SALE') {
    title = 'Propiedades en Venta';
  }
  return {
    title,
    description: `Encuentra las mejores propiedades en ${type === 'RENT' ? 'alquiler' : type === 'SALE' ? 'venta' : ''} en Tafí Viejo, Tucumán.`,
  };
}

export default async function PropiedadesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const { properties, totalPages, currentPage } =
    await getProperties(params);

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
          </div>
        </div>
      </header>

      <main>
        <PropertiesView
          properties={properties}
          totalPages={totalPages}
          currentPage={currentPage}
          isLoading={false}
        />
      </main>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
