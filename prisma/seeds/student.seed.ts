import { PrismaClient } from '@prisma/client'
import { faker } from '@faker-js/faker'

export const studentSeed = async (prisma: PrismaClient) => {
  console.log('🎓 Cleaning up students...')
  await prisma.student.deleteMany()

  console.log('🎓 Seeding students...')

  const groups = await prisma.group.findMany({ include: { students: true } })
  const courses = await prisma.course.findMany()
  const managers = await prisma.user.findMany({ where: { role: 'MANAGER' } })
  const curators = await prisma.user.findMany({ where: { role: 'CURATOR' } })

  if (!managers.length || !curators.length) {
    console.warn('⚠️ Нет доступных менеджеров или кураторов. Пропускаем студентов.')
    return
  }

  for (const group of groups) {
    const course = courses.find((c) => group.name.startsWith(c.name))
    if (!course) continue

    const count = faker.number.int({ min: 10, max: 15 })

    for (let i = 0; i < count; i++) {
      const firstName = faker.person.firstName()
      const lastName = faker.person.lastName()
      const phone = faker.phone.number({ style: 'international' })
      const coursePrice = 1500000

      const manager = faker.helpers.arrayElement(managers)
      const curator = faker.helpers.arrayElement(curators)

      await prisma.student.create({
        data: {
          firstName,
          lastName,
          phone,
          coursePrice,
          groupId: group.id,
          courseId: course.id,
          managerId: manager.id,
          curatorId: curator.id,
        },
      })
    }
  }

  console.log('✅ Students seeded successfully!')
}
