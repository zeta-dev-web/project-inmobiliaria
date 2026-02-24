import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Servicios',
  description:
    'Polar Inmobiliaria ofrece servicios de alquiler, venta, administración de propiedades, tasaciones y contratos en Tafí Viejo, Tucumán. Más de 30 años de experiencia.',
};

export default function ServiciosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
