import { PrismaClient } from '@prisma/client'
import { faker } from '@faker-js/faker'

export const paymentSeed = async (prisma: PrismaClient) => {
  console.log('💵 Cleaning up payments...')
  await prisma.payment.deleteMany()

  console.log('💵 Seeding payments...')

  const students = await prisma.student.findMany({
    where: { isDeleted: false },
  })
  const paymentMethods = await prisma.paymentMethod.findMany()

  if (!paymentMethods.length) {
    console.warn('⚠️ Нет доступных методов оплаты.')
    return
  }

  for (const student of students) {
    const isFullyPaid = faker.datatype.boolean()
    const totalAmount = isFullyPaid
      ? student.coursePrice
      : faker.number.int({ min: 50000, max: Math.floor(student.coursePrice * 0.9) }) // до 90% от курса

    const paymentCount = faker.number.int({ min: 1, max: 3 })
    const payments: number[] = []
    let remaining = totalAmount

    for (let i = 0; i < paymentCount; i++) {
      const isLast = i === paymentCount - 1
      const amount = isLast ? remaining : faker.number.int({ min: 10000, max: Math.floor(remaining / 2) })
      payments.push(amount)
      remaining -= amount
    }

    for (const amount of payments) {
      await prisma.payment.create({
        data: {
          amount,
          studentId: student.id,
          paymentMethodId: faker.helpers.arrayElement(paymentMethods).id,
          payment_at: faker.date.recent({ days: 90 }),
        },
      })
    }
  }

  console.log('✅ Payments seeded successfully!')
}
