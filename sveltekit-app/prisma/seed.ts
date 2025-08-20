import { PrismaClient } from '@prisma/client';
import * as data from './data.ts';

const prisma = new PrismaClient();

async function main() {
  console.log(`Seeding started...`);

  // Seed simple models first
  for (const r of data.region) {
    await prisma.region.upsert({ where: { name: r.name }, update: {}, create: r });
  }
  for (const s of data.status) {
    await prisma.eventStatus.upsert({ where: { name: s.name }, update: {}, create: s });
  }
  for (const u of data.user) {
    await prisma.user.upsert({ where: { handle: u.handle }, update: {}, create: u });
  }

  // Seed complex models like Event
  for (const eventData of data.event) {
    const existingEvent = await prisma.event.findFirst({
      where: { name: eventData.name },
    });

    if (!existingEvent) {
      await prisma.event.create({
        data: eventData,
      });
      console.log(`Created event: "${eventData.name}"`);
    } else {
      console.log(`Event "${eventData.name}" already exists, skipping.`);
    }
  }

  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    // process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });