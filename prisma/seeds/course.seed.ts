import { PrismaClient } from '@prisma/client'

export const courseSeed = async (prisma: PrismaClient) => {
  console.log('📚 Seeding courses...')

  const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001'
  const iconPath = `${backendUrl}/uploads/courses/bar_chart.svg`

  const courses = [
    {
      name: 'SMM',
      icon: iconPath,
    },
    {
      name: 'Target',
      icon: iconPath,
    },
  ]

  for (const course of courses) {
    await prisma.course.upsert({
      where: { name: course.name },
      update: course,
      create: course,
    })
  }

  console.log('✅ Courses seeded successfully!')
}
