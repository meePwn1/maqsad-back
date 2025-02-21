import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const password = bcrypt.hashSync('Sagesage1!', 10)
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      firstName: 'Djafar',
      lastName: 'Kazakov',
      password,
      role: 'ADMIN',
      refreshToken: null,
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
