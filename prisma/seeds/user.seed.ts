import { PrismaClient, Role } from '@prisma/client'
import * as bcrypt from 'bcrypt'

export const seedUsers = async (prisma: PrismaClient) => {
  console.log('👤 Seeding users...')

  const password = bcrypt.hashSync('Sagesage1!', 10)

  const users = [
    {
      email: 'admin@example.com',
      firstName: 'Djafar',
      lastName: 'Kazakov',
      role: Role.ADMIN,
    },
    {
      email: 'manager@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: Role.MANAGER,
    },
    {
      email: 'curator@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      role: Role.CURATOR,
    },
    {
      email: 'manager1@example.com',
      firstName: 'Alex',
      lastName: 'Johnson',
      role: Role.MANAGER,
    },
    {
      email: 'curator1@example.com',
      firstName: 'Sarah',
      lastName: 'Lee',
      role: Role.CURATOR,
    },
  ]

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        password,
        role: user.role,
      },
    })
  }

  console.log('✅ Users seeded successfully!')
}
