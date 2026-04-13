import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')
  
  const passwordHash = await bcrypt.hash('Password123', 12)
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@wish2skill.com' },
    update: {},
    create: {
      email: 'admin@wish2skill.com',
      name: 'System Admin',
      passwordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  })
  
  console.log({ admin })
  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
