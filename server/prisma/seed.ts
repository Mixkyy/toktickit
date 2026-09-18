import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

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

  const defaultPasswordHash = await bcrypt.hash('Changeme123!', 10)

  const users = [
    { name: 'Jennifer Anderson', email: 'jennifer.anderson@example.com', role: 'REQUESTER', isActive: true },
    { name: 'Michael Brown', email: 'michael.brown@example.com', role: 'REQUESTER', isActive: true },
    { name: 'Sarah Johnson', email: 'sarah.johnson@example.com', role: 'REQUESTER', isActive: true },
    { name: 'David Lee', email: 'david.lee@example.com', role: 'REQUESTER', isActive: true },
    { name: 'Inactive Requester', email: 'inactive.req@example.com', role: 'REQUESTER', isActive: false },
    { name: 'IT Staff Active 1', email: 'it1@example.com', role: 'IT_STAFF', isActive: true },
    { name: 'IT Staff Active 2', email: 'it2@example.com', role: 'IT_STAFF', isActive: true },
    { name: 'IT Staff Active 3', email: 'it3@example.com', role: 'IT_STAFF', isActive: true },
    { name: 'IT Staff Inactive', email: 'it.inactive@example.com', role: 'IT_STAFF', isActive: false },
    { name: 'System Admin', email: 'admin@example.com', role: 'ADMINISTRATOR', isActive: true },
  ]

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { role: u.role as any, isActive: u.isActive },
      create: { 
        ...u, 
        role: u.role as any, 
        passwordHash: defaultPasswordHash, 
        requiresPasswordChange: true 
      },
    })
  }
  console.log('Users seeded successfully!')

  const relatedSystems = [
    'Email',
    'Campus Wi-Fi',
    'VPN',
    'LEB2 App',
    'Grade Submission App',
    'Printer',
    'Corporate Laptop',
  ]

  for (const name of relatedSystems) {
    await prisma.relatedSystem.upsert({
      where: { name },
      update: {},
      create: { name },
    })
  }
  console.log('Related Systems seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })