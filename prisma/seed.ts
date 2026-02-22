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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
