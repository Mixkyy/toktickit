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

  // ---------------------------------------------------------------------------
  // Lab 4: Seed Tickets with 0, 1, and Multiple Actions Taken
  // ---------------------------------------------------------------------------
  const jennifer = await prisma.user.findUnique({ where: { email: 'jennifer.anderson@example.com' } })
  const michael = await prisma.user.findUnique({ where: { email: 'michael.brown@example.com' } })
  const it1 = await prisma.user.findUnique({ where: { email: 'it1@example.com' } })
  const it2 = await prisma.user.findUnique({ where: { email: 'it2@example.com' } })

  const hardware = await prisma.category.findUnique({ where: { name: 'Hardware' } })
  const software = await prisma.category.findUnique({ where: { name: 'Software' } })
  const network = await prisma.category.findUnique({ where: { name: 'Network' } })
  const access = await prisma.category.findUnique({ where: { name: 'Account and Access' } })

  const laptop = await prisma.relatedSystem.findUnique({ where: { name: 'Corporate Laptop' } })
  const vpn = await prisma.relatedSystem.findUnique({ where: { name: 'VPN' } })
  const leb2 = await prisma.relatedSystem.findUnique({ where: { name: 'LEB2 App' } })
  const printer = await prisma.relatedSystem.findUnique({ where: { name: 'Printer' } })
  const emailSys = await prisma.relatedSystem.findUnique({ where: { name: 'Email' } })

  if (jennifer && michael && it1 && it2 && hardware && software && network && access && laptop && vpn && leb2 && printer && emailSys) {
    // Ticket 1: Multiple actions taken by different IT Staff members (In Progress)
    const t1 = await prisma.ticket.upsert({
      where: { ticketNumber: 'TKT-2026-L4-001' },
      update: {
        currentStatus: 'In Progress',
        itPriority: 'HIGH',
        ownerId: it1.id,
      },
      create: {
        ticketNumber: 'TKT-2026-L4-001',
        requesterId: jennifer.id,
        ownerId: it1.id,
        categoryId: hardware.id,
        relatedSystemId: laptop.id,
        summary: 'Laptop screen flickers intermittently',
        description: 'The screen flickers when opening and closing the display lid.',
        requestedPriority: 'HIGH',
        itPriority: 'HIGH',
        currentStatus: 'In Progress',
        version: 1,
      },
    })

    const existingActionsT1 = await prisma.actionTaken.count({ where: { ticketId: t1.id } })
    if (existingActionsT1 === 0) {
      await prisma.actionTaken.createMany({
        data: [
          {
            ticketId: t1.id,
            actionDate: new Date(Date.now() - 48 * 3600 * 1000),
            description: 'Ran display diagnostics and updated GPU firmware.',
            result: 'Flickering still occurs intermittently under load.',
            performedById: it1.id,
            followUpRequired: true,
            followUpNote: 'Order replacement display LVDS cable.',
            attachmentNotes: 'See attached GPU diagnostic logs.',
          },
          {
            ticketId: t1.id,
            actionDate: new Date(Date.now() - 12 * 3600 * 1000),
            description: 'Replaced LVDS video cable and reseated motherboard connection.',
            result: 'Display stable across 20 lid tilt cycles. Running continuous soak test.',
            performedById: it2.id, // Different IT staff member!
            followUpRequired: false,
            followUpNote: null,
            attachmentNotes: null,
          },
        ],
      })
    }

    // Ticket 2: Single action taken (Resolved)
    const t2 = await prisma.ticket.upsert({
      where: { ticketNumber: 'TKT-2026-L4-002' },
      update: {
        currentStatus: 'Resolved',
        itPriority: 'MEDIUM',
        ownerId: it1.id,
      },
      create: {
        ticketNumber: 'TKT-2026-L4-002',
        requesterId: jennifer.id,
        ownerId: it1.id,
        categoryId: network.id,
        relatedSystemId: vpn.id,
        summary: 'Unable to connect to campus VPN from home',
        description: 'Authentication error 412 when connecting from external ISP.',
        requestedPriority: 'MEDIUM',
        itPriority: 'MEDIUM',
        currentStatus: 'Resolved',
        version: 1,
      },
    })

    const existingActionsT2 = await prisma.actionTaken.count({ where: { ticketId: t2.id } })
    if (existingActionsT2 === 0) {
      await prisma.actionTaken.create({
        data: {
          ticketId: t2.id,
          actionDate: new Date(Date.now() - 6 * 3600 * 1000),
          description: 'Re-synchronized LDAP security certificate profile on VPN gateway.',
          result: 'Requester confirmed tunnel established successfully.',
          performedById: it1.id,
          followUpRequired: false,
          followUpNote: null,
          attachmentNotes: null,
        },
      })
    }

    // Ticket 3: Zero actions taken (New, Unassigned)
    await prisma.ticket.upsert({
      where: { ticketNumber: 'TKT-2026-L4-003' },
      update: {
        currentStatus: 'New',
        ownerId: null,
      },
      create: {
        ticketNumber: 'TKT-2026-L4-003',
        requesterId: michael.id,
        ownerId: null,
        categoryId: software.id,
        relatedSystemId: leb2.id,
        summary: 'Course syllabus gives 404 error on LEB2',
        description: 'Enrolled students report broken link when clicking syllabus PDF.',
        requestedPriority: 'MEDIUM',
        itPriority: 'MEDIUM',
        currentStatus: 'New',
        version: 1,
      },
    })

    // Ticket 4: Single action with Follow-Up required (Waiting for Requester)
    const t4 = await prisma.ticket.upsert({
      where: { ticketNumber: 'TKT-2026-L4-004' },
      update: {
        currentStatus: 'Waiting for Requester',
        itPriority: 'LOW',
        ownerId: it2.id,
      },
      create: {
        ticketNumber: 'TKT-2026-L4-004',
        requesterId: michael.id,
        ownerId: it2.id,
        categoryId: access.id,
        relatedSystemId: emailSys.id,
        summary: 'Password reset assistance for department email',
        description: 'Locked out of mailbox after multiple attempts on mobile device.',
        requestedPriority: 'LOW',
        itPriority: 'LOW',
        currentStatus: 'Waiting for Requester',
        version: 1,
      },
    })

    const existingActionsT4 = await prisma.actionTaken.count({ where: { ticketId: t4.id } })
    if (existingActionsT4 === 0) {
      await prisma.actionTaken.create({
        data: {
          ticketId: t4.id,
          actionDate: new Date(Date.now() - 3 * 3600 * 1000),
          description: 'Issued one-time password reset SMS to user telephone.',
          result: 'Awaiting user sign-in and initial password update confirmation.',
          performedById: it2.id,
          followUpRequired: true,
          followUpNote: 'Check tomorrow 10:00 AM if user successfully signed in.',
          attachmentNotes: null,
        },
      })
    }

    // Ticket 5: Closed ticket with Action Taken
    const t5 = await prisma.ticket.upsert({
      where: { ticketNumber: 'TKT-2026-L4-005' },
      update: {
        currentStatus: 'Closed',
        itPriority: 'LOW',
        ownerId: it1.id,
      },
      create: {
        ticketNumber: 'TKT-2026-L4-005',
        requesterId: jennifer.id,
        ownerId: it1.id,
        categoryId: hardware.id,
        relatedSystemId: printer.id,
        summary: 'Paper jam in 3rd floor HP LaserJet',
        description: 'Tray 2 pickup roller jammed.',
        requestedPriority: 'LOW',
        itPriority: 'LOW',
        currentStatus: 'Closed',
        version: 1,
      },
    })

    const existingActionsT5 = await prisma.actionTaken.count({ where: { ticketId: t5.id } })
    if (existingActionsT5 === 0) {
      await prisma.actionTaken.create({
        data: {
          ticketId: t5.id,
          actionDate: new Date(Date.now() - 72 * 3600 * 1000),
          description: 'Cleared roller path and replaced pickup roller assembly.',
          result: 'Clean print test pass.',
          performedById: it1.id,
          followUpRequired: false,
          followUpNote: null,
          attachmentNotes: null,
        },
      })
    }
  }

  console.log('Lab 4 Tickets and Actions Taken seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })