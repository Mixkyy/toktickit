import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const categories = ['Account and Access', 'Hardware', 'Software', 'Network']

  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    })
  }
  console.log('Categories seeded successfully!')

  const requesters = [
    { name: 'Jennifer Anderson', email: 'jennifer.anderson@example.com', isActive: true },
    { name: 'Michael Brown', email: 'michael.brown@example.com', isActive: true },
    { name: 'Sarah Johnson', email: 'sarah.johnson@example.com', isActive: true },
    { name: 'David Lee', email: 'david.lee@example.com', isActive: true },
    { name: 'Inactive User', email: 'inactive@example.com', isActive: false },
  ]

  for (const req of requesters) {
    await prisma.requesterUser.upsert({
      where: { email: req.email },
      update: {},
      create: req,
    })
  }
  console.log('Requesters seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })