import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { CreateCourseDto } from './dto/create-course.dto'
import { UpdateCourseDto } from './dto/update-course.dto'
import { PrismaService } from 'src/common/services/prisma/prisma.service'
import { TranslationService } from 'src/common/services/translation/translation.service'
import { FileService } from 'src/common/services/file/file.service'
import { GetCoursesDto } from 'src/modules/course/dto/get-courses.dto'
import { buildPaginationMeta } from 'src/common/utils/build-pagination-meta'
import { DeleteCourseDto } from 'src/modules/course/dto/delete-course.dto'

@Injectable()
export class CourseService {
  private readonly logger = new Logger(CourseService.name)
  private readonly coursePath = 'courses'

  constructor(
    private prisma: PrismaService,
    private readonly i18n: TranslationService,
    private readonly fileService: FileService,
  ) {}

  async create(createCourseDto: CreateCourseDto) {
    const iconPath = await this.fileService.saveFile(createCourseDto.icon as Express.Multer.File, {
      folder: this.coursePath,
    })

    return await this.prisma.course.create({
      data: {
        name: createCourseDto.name,
        icon: iconPath || '',
      },
    })
  }

  async getCourses(query: GetCoursesDto) {
    const { page = 1, limit = 20 } = query

    const safeLimit = Math.min(limit, 100)
    const skip = (page - 1) * safeLimit
    const [paginatedCourses, totalCourses] = await Promise.all([
      this.prisma.course.findMany({
        include: {
          _count: {
            select: {
              students: true,
            },
          },
        },
        skip,
        take: safeLimit,
      }),
      this.prisma.course.count(),
    ])

    return {
      data: paginatedCourses,
      pagination: buildPaginationMeta(totalCourses, page, safeLimit),
    }
  }

  async update(id: string, updateCourseDto: UpdateCourseDto) {
    const course = await this.prisma.course.findUnique({ where: { id } })

    if (!course) throw new NotFoundException(this.i18n.t('errors.COMMON.COURSE_NOT_FOUND'))

    if (updateCourseDto.icon === null) {
      if (course.icon) {
        await this.fileService.deleteFile(course.icon)
      }
    } else {
      const newIconPath = await this.fileService.replaceFile(course.icon, updateCourseDto.icon as Express.Multer.File, {
        folder: this.coursePath,
      })
      updateCourseDto.icon = newIconPath
    }

    return await this.prisma.course.update({ where: { id }, data: updateCourseDto })
  }

  async remove(id: string, deleteCourseDto: DeleteCourseDto) {
    return this.prisma.$transaction(async (tx) => {
      const newCourse = await tx.course.findUnique({
        where: { id: deleteCourseDto.courseId },
      })

      if (!newCourse) {
        throw new NotFoundException(this.i18n.t('errors.COMMON.COURSE_NOT_FOUND'))
      }

      await tx.student.updateMany({
        where: { courseId: id },
        data: { courseId: deleteCourseDto.courseId },
      })

      await tx.course.delete({
        where: { id },
      })
    })
  }
}
