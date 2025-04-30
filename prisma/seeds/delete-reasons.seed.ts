import { PrismaClient } from '@prisma/client'

export const seedDeleteReasons = async (prisma: PrismaClient) => {
  console.log('💳 Seeding delete reasons...')
  await prisma.deleteReason.deleteMany()

  const refundReasons = [
    { nameRu: 'Отказ от обучения', nameUz: "O'qishdan voz kechish" },
    { nameRu: 'Окончил обучение', nameUz: "O'qishni tugatdi" },
    { nameRu: 'Не закрыл долг', nameUz: 'Qarzini yopmadi' },
    { nameRu: 'Нарушение оферты', nameUz: 'Oferta shartlarini buzish' },
    { nameRu: 'Передал другому', nameUz: 'Boshqaga topshirdi' },
  ]

  await prisma.deleteReason.createMany({
    data: refundReasons,
  })
}
