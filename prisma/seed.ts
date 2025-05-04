import { PrismaClient } from '@prisma/client'
import { seedDeleteReasons } from './seeds/delete-reasons.seed'
import { seedPaymentMethods } from './seeds/payment-methods.seed'
import { seedUsers } from './seeds/user.seed'
import { courseSeed } from './seeds/course.seed'
import { groupSeed } from './seeds/group.seed'
import { studentSeed } from './seeds/student.seed'
import { paymentSeed } from './seeds/payment.seed'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  await seedUsers(prisma)
  await seedPaymentMethods(prisma)
  await seedDeleteReasons(prisma)
  await courseSeed(prisma)
  await groupSeed(prisma)
  await studentSeed(prisma)
  await paymentSeed(prisma)

  console.log('✅ Seeding completed!')
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
