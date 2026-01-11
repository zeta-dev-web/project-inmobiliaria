import prisma from '../src/lib/prisma';
import { hash } from 'argon2';
import { USER_ROLES } from '../src/constants/roles.constants';

async function main() {
  // Crear usuario Leonardo
  const leonardoPassword = await hash('admin123');
  
  const leonardo = await prisma.user.upsert({
    where: { dni: 35523278 },
    update: {},
    create: {
      name: 'Leonardo',
      email: 'leonardo@inmobiliaria.com',
      password: leonardoPassword,
      dni: 35523278,
      role: USER_ROLES.ADMIN,
    },
  });

  // Crear usuario Dámaris
  const damarisPassword = await hash('polar123');
  
  const damaris = await prisma.user.upsert({
    where: { dni: 37503342 },
    update: {},
    create: {
      name: 'Dámaris',
      email: 'damaris@inmobiliaria.com',
      password: damarisPassword,
      dni: 37503342,
      role: USER_ROLES.ADMIN,
    },
  });

  console.log('Users created:', { leonardo, damaris });

  // Crear 5 clientes ficticios
  const clients = await Promise.all([
    prisma.client.upsert({
      where: { email: 'juan.perez@email.com' },
      update: {},
      create: { name: 'Juan Pérez', email: 'juan.perez@email.com', phone: '381-4567890' },
    }),
    prisma.client.upsert({
      where: { email: 'maria.gomez@email.com' },
      update: {},
      create: { name: 'María Gómez', email: 'maria.gomez@email.com', phone: '381-4567891' },
    }),
    prisma.client.upsert({
      where: { email: 'carlos.rodriguez@email.com' },
      update: {},
      create: { name: 'Carlos Rodríguez', email: 'carlos.rodriguez@email.com', phone: '381-4567892' },
    }),
    prisma.client.upsert({
      where: { email: 'ana.martinez@email.com' },
      update: {},
      create: { name: 'Ana Martínez', email: 'ana.martinez@email.com', phone: '381-4567893' },
    }),
    prisma.client.upsert({
      where: { email: 'luis.fernandez@email.com' },
      update: {},
      create: { name: 'Luis Fernández', email: 'luis.fernandez@email.com', phone: '381-4567894' },
    }),
  ]);

  console.log('Clients created:', clients.length);

  // Crear propiedades en Tafí Viejo
  const vivienda = await prisma.property.create({
    data: {
      name: 'Casa 3 Dormitorios Tafí Viejo',
      address: 'Av. Perón 1250, Tafí Viejo',
      type: 'RENT',
      price: 180000,
      propertyUse: 'VIVIENDA',
      description: 'Amplia casa de 3 dormitorios, 2 baños, cocina comedor, patio con parrilla. Zona tranquila cerca de escuelas.',
      status: 'RENTED',
      published: true,
      requirements: 'Garante con recibo de sueldo',
      lastEditedById: leonardo.id,
      clientId: clients[0].id,
    },
  });

  const localComercial = await prisma.property.create({
    data: {
      name: 'Local Comercial Céntrico Tafí Viejo',
      address: 'Av. Alem 890, Tafí Viejo',
      type: 'RENT',
      price: 250000,
      propertyUse: 'LOCAL_COMERCIAL',
      description: 'Local comercial de 80m2 sobre avenida principal. Ideal para cualquier rubro. Baño y depósito.',
      status: 'AVAILABLE',
      published: true,
      requirements: 'Depósito de garantía',
      lastEditedById: damaris.id,
      clientId: clients[1].id,
    },
  });

  console.log('Properties created');

  // Crear alquiler para la vivienda
  const rental = await prisma.rental.create({
    data: {
      propertyId: vivienda.id,
      tenantId: clients[2].id,
      landlordId: clients[0].id,
      rentalPrice: 180000,
      updateFrequency: 6,
      startDate: new Date(2025, 0, 1), // Enero 2025
      endDate: new Date(2026, 11, 31), // Diciembre 2026
      paymentDueDay: 10,
      lateFee: 500,
      administrationAmount: 10,
      administrationType: 'PERCENTAGE',
      guarantors: {
        create: [{ clientId: clients[3].id }, { clientId: clients[4].id }],
      },
      pricePeriods: {
        create: [
          { startMonth: 1, endMonth: 6, price: 180000 },
          { startMonth: 7, endMonth: 12, price: null },
          { startMonth: 13, endMonth: 18, price: null },
          { startMonth: 19, endMonth: 24, price: null },
        ],
      },
    },
  });

  console.log('Rental created with price periods');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });