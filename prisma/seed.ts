// Example of a correct seed script structure

import { PrismaClient } from '@prisma/client'
// Assuming your data file is in the same directory and named 'data.ts'
import { region, status, user, event } from './data'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding simple models...')
  // 1. Seed the independent data first
  for (const r of region) {
    await prisma.region.upsert({ where: { name: r.name }, update: {}, create: r })
  }
  for (const s of status) {
    await prisma.eventStatus.upsert({ where: { name: s.name }, update: {}, create: s })
  }
  for (const u of user) {
    await prisma.user.upsert({ where: { handle: u.handle }, update: {}, create: u })
  }

  console.log('Seeding complex models...')
  // 2. Now that the simple data exists, seed the event data that connects to it
  for (const e of event) {
    await prisma.event.create({
      data: e,
    })
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })