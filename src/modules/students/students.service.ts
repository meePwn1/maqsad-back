import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common'
import { CreateStudentDto } from './dto/request/create-student.dto'
import { Prisma } from '@prisma/client'
import { PrismaService } from 'src/common/services/prisma/prisma.service'
import { TranslationService } from 'src/common/services/translation/translation.service'
import { DeleteStudentDto } from 'src/modules/students/dto/request/delete-student.dto'
import { GetStudentsDto } from 'src/modules/students/dto/request/get-students.dto'
import { UpdateStudentDto } from 'src/modules/students/dto/request/update-student.dto'
import { plainToInstance } from 'class-transformer'
import { Student } from 'prisma/generated/classes/student'
import { StudentsWithFinanceResponseDto } from 'src/modules/students/dto/response/student-wtih-finance.dto'
import { createPaginatedResponse, PaginatedResponseDto } from 'src/common/dto/pagination.dto'
import { StudentDetailDto } from 'src/modules/students/dto/response/student-by-id.dto'

@Injectable()
export class StudentsService {
  private readonly logger = new Logger(StudentsService.name)

  private readonly studentInclude = {
    course: true,
    curator: true,
    group: true,
    manager: true,
    payment: true,
  } satisfies Prisma.StudentInclude

  constructor(
    private prisma: PrismaService,
    private readonly i18n: TranslationService,
  ) {}

  async createStudent(createStudentDto: CreateStudentDto): Promise<Student> {
    const { firstName, lastName, phone, courseId, groupId, managerId, curatorId, coursePrice, addedAt } =
      createStudentDto

    try {
      const [course, group, manager, curator] = await Promise.all([
        courseId ? this.prisma.course.findUnique({ where: { id: courseId } }) : null,
        groupId ? this.prisma.group.findUnique({ where: { id: groupId } }) : null,
        managerId ? this.prisma.user.findUnique({ where: { id: managerId } }) : null,
        curatorId ? this.prisma.user.findUnique({ where: { id: curatorId } }) : null,
      ])

      if (courseId && !course) throw new NotFoundException(this.i18n.t('errors.COMMON.COURSE_NOT_FOUND'))
      if (groupId && !group) throw new NotFoundException(this.i18n.t('errors.COMMON.GROUP_NOT_FOUND'))
      if (managerId && !manager) throw new NotFoundException(this.i18n.t('errors.COMMON.MANAGER_NOT_FOUND'))
      if (curatorId && !curator) throw new NotFoundException(this.i18n.t('errors.COMMON.CURATOR_NOT_FOUND'))

      const student = await this.prisma.student.create({
        data: {
          firstName,
          lastName,
          phone,
          courseId,
          groupId,
          managerId,
          curatorId,
          coursePrice,
          ...(addedAt && { addedAt }),
        },
      })

      return plainToInstance(Student, student)
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`Ошибка при создании студента: ${error.message}`, error.stack)
      } else {
        this.logger.error('Неизвестная ошибка при создании студента', error)
      }
      throw new InternalServerErrorException(this.i18n.t('errors.STUDENT.CREATE_FAILED'))
    }
  }

  async getActiveStudents(query: GetStudentsDto): Promise<PaginatedResponseDto<StudentsWithFinanceResponseDto>> {
    try {
      const whereCondition = this.buildWhereCondition(query, { isDeleted: false })

      const { safeLimit, transformedStudents } = await this.paginatedStudents(query, whereCondition)

      const allActiveStudents = await this.prisma.student.findMany({
        where: {
          addedAt: whereCondition.addedAt,
          isDeleted: whereCondition.isDeleted,
        },
        include: {
          payment: true,
        },
      })

      const { totalPayment, totalDebt } = this.calculateTotalPaymentAndDebt(allActiveStudents)
      const inputData = {
        students: transformedStudents,
        finance: { totalPayment, totalDebt, totalStudentsCount: allActiveStudents.length },
      }
      const mappedStudents = plainToInstance(StudentsWithFinanceResponseDto, inputData, {
        excludeExtraneousValues: true,
      })

      const currentPage = query.page
      const itemsPerPage = safeLimit
      const totalItems = allActiveStudents.length
      return createPaginatedResponse(mappedStudents, totalItems, currentPage, itemsPerPage)
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`Ошибка при получении студентов: ${error.message}`, error.stack)
      } else {
        this.logger.error('Неизвестная ошибка при получении студентов', error)
      }
      throw new InternalServerErrorException(this.i18n.t('errors.STUDENT.GET_ALL_FAILED'))
    }
  }

  async getStudentById(id: string): Promise<StudentDetailDto> {
    try {
      const student = await this.prisma.student.findUnique({
        where: { id },
        include: this.studentInclude,
      })
      if (!student) throw new NotFoundException(this.i18n.t('errors.STUDENT.NOT_FOUND'))

      const { totalPaid, debt } = this.calculateStudentFinances(student)

      return plainToInstance(StudentDetailDto, { ...student, totalPaid, debt }, { excludeExtraneousValues: true })
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`Ошибка при получении студента по id: ${error.message}`, error.stack)
      } else {
        this.logger.error('Неизвестная ошибка при получении студента по id', error)
      }
      throw new InternalServerErrorException(this.i18n.t('errors.STUDENT.GET_BY_ID_FAILED'))
    }
  }

  async getStudentsByGroup(groupId: string, query: GetStudentsDto) {
    const whereCondition = this.buildWhereCondition(query, { groupId, isDeleted: false })
    const { safeLimit, transformedStudents } = await this.paginatedStudents(query, whereCondition)

    const allStudentsInGroup = await this.prisma.student.findMany({
      where: {
        isDeleted: false,
        groupId,
      },
      include: {
        payment: true,
      },
    })

    const { totalPayment, totalDebt } = this.calculateTotalPaymentAndDebt(allStudentsInGroup)

    return {
      data: {
        students: transformedStudents,
        finance: { totalPayment, totalDebt, totalStudentsInGroup: allStudentsInGroup.length },
      },
      pagination: {
        totalPages: Math.ceil(allStudentsInGroup.length / safeLimit),
        currentPage: query.page || 1,
        itemsPerPage: safeLimit,
        totalItems: allStudentsInGroup.length,
      },
    }
  }

  async updateStudent(id: string, updateStudentDto: UpdateStudentDto) {
    try {
      const student = await this.prisma.student.update({
        where: { id },
        data: updateStudentDto,
        include: this.studentInclude,
      })

      const { totalPaid, debt } = this.calculateStudentFinances(student)

      return {
        ...student,
        totalPaid,
        debt,
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`Ошибка при обновлении студента: ${error.message}`, error.stack)
      } else {
        this.logger.error('Неизвестная ошибка при обновлении студента', error)
      }
      throw new InternalServerErrorException(this.i18n.t('errors.STUDENT.UPDATE_FAILED'))
    }
  }

  async deleteStudent(id: string, deleteStudentDto: DeleteStudentDto) {
    const { deleteReasonId, amount, comment, isRefund } = deleteStudentDto
    try {
      return await this.prisma.$transaction(async (tx) => {
        const student = await tx.student.update({
          where: { id },
          data: {
            isDeleted: true,
            deletedAt: new Date(),
            isRefund,
            deleteReasonId,
          },
          include: {
            ...this.studentInclude,
            refund: true,
            deleteReason: true,
          },
        })
        if (isRefund) {
          await tx.refund.create({
            data: {
              studentId: id,
              amount,
              comment,
            },
          })
        }
        return student
      })
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`Ошибка при удалении студента: ${error.message}`, error.stack)
      } else {
        this.logger.error('Неизвестная ошибка при удалении студента', error)
      }
      throw new InternalServerErrorException(this.i18n.t('errors.STUDENT.DELETE_FAILED'))
    }
  }

  calculateTotalPaymentAndDebt(students: Prisma.StudentGetPayload<{ include: { payment: true } }>[]) {
    return students.reduce(
      (acc, student) => {
        const { totalPaid, debt } = this.calculateStudentFinances(student)
        acc.totalPayment += totalPaid
        acc.totalDebt += debt
        return acc
      },
      { totalPayment: 0, totalDebt: 0 },
    )
  }

  calculateStudentFinances(student: Prisma.StudentGetPayload<{ include: { payment: true } }>) {
    const totalPaid = student.payment.reduce((acc, payment) => acc + payment.amount, 0)
    const debt = student.coursePrice - totalPaid

    return {
      totalPaid,
      debt,
    }
  }

  async paginatedStudents(query: GetStudentsDto, whereCondition: Prisma.StudentWhereInput) {
    const { page = 1, limit = 20, sortByDebt } = query
    // Пагинация
    const safeLimit = Math.min(limit, 100)
    const skip = (page - 1) * safeLimit

    const students = await this.prisma.student.findMany({
      where: whereCondition,
      skip,
      include: this.studentInclude,
      take: safeLimit,
    })

    const transformedStudents = students.map((student) => ({
      ...student,
      ...this.calculateStudentFinances(student),
    }))

    // Сортируем по долгу
    if (sortByDebt === 'asc') {
      transformedStudents.sort((a, b) => a.debt - b.debt)
    } else if (sortByDebt === 'desc') {
      transformedStudents.sort((a, b) => b.debt - a.debt)
    }

    return {
      transformedStudents,
      safeLimit,
    }
  }

  buildWhereCondition(query: GetStudentsDto, additionalCondition: Prisma.StudentWhereInput = {}) {
    const { curators, groups, managers, from, to, search } = query

    // Фильтр по дате добавления
    const whereCondition: Prisma.StudentWhereInput = {
      ...additionalCondition,
    }

    // Фильтр по дате добавления
    if (from && to) {
      whereCondition.addedAt = {
        gte: from,
        lte: to,
      }
    }

    // Фильтр по группам
    if (groups?.length) {
      whereCondition.groupId = { in: groups }
    }

    // Фильтр по менеджерам
    if (managers?.length) {
      whereCondition.managerId = { in: managers }
    }

    // Фильтр по кураторам
    if (curators?.length) {
      whereCondition.curatorId = { in: curators }
    }

    // Фильтр по поиску (по имени, фамилии и номеру телефона)
    if (search) {
      whereCondition.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ]
    }

    return whereCondition
  }
}
