import { Metadata } from 'next';
import { Footer } from '@/components/ui/footer';
import { WhatsAppFloat } from '@/components/ui/whatsapp-float';
import { Home, DollarSign, FileText, TrendingUp, Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Servicios',
  description:
    'Polar Inmobiliaria ofrece servicios de alquiler, venta, administración de propiedades, tasaciones y contratos en Tafí Viejo, Tucumán. Más de 30 años de experiencia.',
};

export default function ServiciosPage() {
  const services = [
    {
      icon: Home,
      title: 'Alquileres',
      description:
        'Gestionamos alquileres de casas y departamentos en Tafí Viejo. Contratos, administración y cobro de alquileres.',
    },
    {
      icon: DollarSign,
      title: 'Ventas',
      description:
        'Asesoramiento integral en compra y venta de propiedades. Tasaciones y gestión de documentación.',
    },
    {
      icon: Shield,
      title: 'Administración',
      description:
        'Administramos tu propiedad: cobro de alquileres, mantenimiento, y gestión de inquilinos.',
    },
    {
      icon: TrendingUp,
      title: 'Tasaciones',
      description:
        'Valuaciones profesionales de propiedades para compra, venta, alquiler o trámites legales.',
    },
    {
      icon: FileText,
      title: 'Contratos',
      description:
        'Elaboración de contratos de alquiler y venta con asesoramiento legal completo.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Nuestros Servicios
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Más de 30 años brindando servicios inmobiliarios en Tafí Viejo,
            Tucumán. Raíces familiares, soluciones profesionales.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <service.icon className="w-6 h-6 text-[#600096]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {service.title}
              </h3>
              <p className="text-gray-600">{service.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Contactanos
          </h2>
          <div className="space-y-2 text-gray-600">
            <p>
              <strong>Dirección:</strong> Monteagudo 563, Tafí Viejo, Tucumán
            </p>
            <p>
              <strong>Teléfono:</strong> +54 381 662-5078
            </p>
            <p>
              <strong>Horario:</strong> Lunes a Viernes de 9:00 a 12:30
            </p>
          </div>
        </div>
      </main>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
