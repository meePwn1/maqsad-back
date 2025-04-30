import { PrismaClient, LearningFormat } from '@prisma/client'

export const groupSeed = async (prisma: PrismaClient) => {
  console.log('👥 Seeding groups...')

  const colors = ['#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#A133FF', '#33FFF5']

  const courses = await prisma.course.findMany()

  for (const course of courses) {
    const formats = [LearningFormat.ONLINE, LearningFormat.OFFLINE]

    for (const format of formats) {
      const groupName = `${course.name}-${format}`

      await prisma.group.upsert({
        where: { name: groupName },
        update: {
          learningFormat: format,
          groupColor: colors[Math.floor(Math.random() * colors.length)],
        },
        create: {
          name: groupName,
          learningFormat: format,
          groupColor: colors[Math.floor(Math.random() * colors.length)],
        },
      })
    }
  }

  console.log('✅ Groups seeded successfully!')
}
