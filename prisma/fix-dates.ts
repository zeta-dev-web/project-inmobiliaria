import prisma from '../src/lib/prisma';

async function fixDates() {
  await prisma.rental.updateMany({
    data: {
      startDate: new Date(2025, 0, 1, 12, 0, 0), // Enero 1, 2025 12:00 (mediodía)
    },
  });
  
  console.log('Fechas actualizadas');
}

fixDates()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
