import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      firstName: 'Djafar',
      lastName: 'Kazakov',
      password: 'sagesage',
      role: 'ADMIN',
      createdAt: new Date(),
    },
  })

  console.log({ admin })
}

// execute the main function
main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => {
    prisma.$disconnect()
  })
