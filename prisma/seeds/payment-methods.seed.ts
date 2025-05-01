import { PrismaClient } from '@prisma/client'

export const seedPaymentMethods = async (prisma: PrismaClient) => {
  console.log('💳 Seeding payment methods...')
  await prisma.payment.deleteMany()
  await prisma.paymentMethod.deleteMany()

  const paymentMethods = [
    { nameRu: 'Наличные', nameUz: 'Naqd pul' },
    { nameRu: 'Карта P2P', nameUz: 'Karta P2P' },
    { nameRu: 'Внутренная рассрочка (2)', nameUz: "Ichki muddatli to'lov (2)" },
    { nameRu: 'Внутренная рассрочка (3)', nameUz: "Ichki muddatli to'lov (3)" },
    { nameRu: 'Uzum Pay', nameUz: 'Uzum Pay' },
    { nameRu: 'Uzum Nasiya', nameUz: 'Uzum Nasiya' },
    { nameRu: 'Anorbank', nameUz: 'Anorbank' },
    { nameRu: 'Alif Nasiya', nameUz: 'Alif Nasiya' },
    { nameRu: 'Click', nameUz: 'Click' },
    { nameRu: 'Перечисление', nameUz: "Pul o'tkazish" },
    { nameRu: 'Payme', nameUz: 'Payme' },
  ]

  await prisma.paymentMethod.createMany({
    data: paymentMethods,
  })
}
