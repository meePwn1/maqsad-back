import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common'
import { CreateStudentDto } from './dto/create-student.dto'
import { PrismaService } from 'src/prisma/prisma.service'
import { GetTotalPaymentAndDebtDto } from 'src/students/dto/get-total-payment-and-debt.dto'
import { GetAllStudentsDto } from 'src/students/dto/get-all-students.dto'
import { Prisma } from '@prisma/client'

@Injectable()
export class StudentsService {
  private readonly logger = new Logger(StudentsService.name)

  constructor(private prisma: PrismaService) {}

  async create(createStudentDto: CreateStudentDto) {
    const { firstName, lastName, phone, courseId, groupId, managerId, curatorId, coursePrice, addedAt } =
      createStudentDto

    try {
      const [course, group, manager, curator] = await Promise.all([
        courseId ? this.prisma.course.findUnique({ where: { id: courseId } }) : null,
        groupId ? this.prisma.group.findUnique({ where: { id: groupId } }) : null,
        managerId ? this.prisma.user.findUnique({ where: { id: managerId } }) : null,
        curatorId ? this.prisma.user.findUnique({ where: { id: curatorId } }) : null,
      ])

      if (courseId && !course) throw new BadRequestException('Курс не найден.')
      if (groupId && !group) throw new BadRequestException('Группа не найдена.')
      if (managerId && !manager) throw new BadRequestException('Менеджер не найден.')
      if (curatorId && !curator) throw new BadRequestException('Куратор не найден.')

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
          addedAt,
        },
      })

      return student
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`Ошибка при создании студента: ${error.message}`, error.stack)
      } else {
        this.logger.error('Неизвестная ошибка при создании студента', error)
      }
      throw new InternalServerErrorException('Не удалось создать студента.')
    }
  }

  async findAllStudents(query: GetAllStudentsDto) {
    try {
      const { curators, groups, managers, page = 1, limit = 10, studentFrom, studentTo, sortByDebt, search } = query

      // Фильтр по дате добавления
      const whereCondition: Prisma.StudentWhereInput = {}
      if (studentFrom && studentTo) {
        whereCondition.addedAt = {
          gte: studentFrom,
          lte: studentTo,
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

      // Пагинация
      const skip = (page - 1) * limit
      const take = limit

      const students = await this.prisma.student.findMany({
        where: whereCondition,
        include: {
          course: true,
          curator: true,
          group: true,
          manager: true,
          payment: true,
        },
        skip,
        take,
      })
      const transformedStudents = students.map((student) => {
        const totalPaid = student.payment.reduce((acc, payment) => acc + payment.amount, 0)
        const debt = student.coursePrice - totalPaid
        return {
          ...student,
          totalPaid,
          debt,
        }
      })

      // Сортируем по долгу
      if (sortByDebt && (sortByDebt === 'asc' || sortByDebt === 'desc')) {
        transformedStudents.sort((a, b) => (sortByDebt === 'asc' ? a.debt - b.debt : b.debt - a.debt))
      }

      const paginatedStudents = transformedStudents.slice(skip, skip + take)

      return paginatedStudents
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`Ошибка при получении студентов: ${error.message}`, error.stack)
      } else {
        this.logger.error('Неизвестная ошибка при получении студентов', error)
      }
      throw new InternalServerErrorException('Не удалось получить студентов.')
    }
  }

  async getTotalPaymentAndDebt(query: GetTotalPaymentAndDebtDto) {
    try {
      const whereCondition: { addedAt?: { gte?: Date; lte?: Date } } = {}

      if (query.financeFrom && query.financeTo) {
        whereCondition.addedAt = {
          gte: query.financeFrom,
          lte: query.financeTo,
        }
      }

      const students = await this.prisma.student.findMany({
        where: whereCondition,
        include: {
          payment: true,
        },
      })

      const totalStudents = students.length
      const totalPayment = students.reduce(
        (acc, student) => acc + student.payment.reduce((acc, payment) => acc + payment.amount, 0),
        0,
      )
      const totalDebt = students.reduce(
        (acc, student) => acc + student.coursePrice - student.payment.reduce((acc, payment) => acc + payment.amount, 0),
        0,
      )
      return {
        totalStudents,
        totalPayment,
        totalDebt,
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`Ошибка при получении общей оплаты и долга студентов: ${error.message}`, error.stack)
      } else {
        this.logger.error('Неизвестная ошибка при получении общей оплаты и долга студентов', error)
      }
      throw new InternalServerErrorException('Не удалось получить общую оплату и долгу студентов.')
    }
  }

  async findStudentsForManager(managerId: string) {
    try {
      const students = await this.prisma.student.findMany({
        where: { managerId },
        include: {
          course: true,
          curator: true,
          group: true,
          payment: true,
        },
      })
      const transformedStudent = students.map((student) => {
        const totalPaid = student.payment.reduce((acc, payment) => acc + payment.amount, 0)
        const debt = student.coursePrice - totalPaid
        return {
          ...student,
          totalPaid,
          debt,
        }
      })
      return transformedStudent
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`Ошибка при получении студентов для менеджера: ${error.message}`, error.stack)
      } else {
        this.logger.error('Неизвестная ошибка при получении студентов для менеджера', error)
      }
      throw new InternalServerErrorException('Не удалось получить студентов для менеджера.')
    }
  }

  async getStudentsForCurator(curatorId: string) {
    try {
      const students = await this.prisma.student.findMany({
        where: { curatorId },
        include: {
          course: true,
          group: true,
          manager: true,
          payment: true,
        },
      })
      const transformedStudent = students.map((student) => {
        const totalPaid = student.payment.reduce((acc, payment) => acc + payment.amount, 0)
        const debt = student.coursePrice - totalPaid
        return {
          ...student,
          totalPaid,
          debt,
        }
      })
      return transformedStudent
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`Ошибка при получении студентов для куратора: ${error.message}`, error.stack)
      } else {
        this.logger.error('Неизвестная ошибка при получении студентов для куратора', error)
      }
      throw new InternalServerErrorException('Не удалось получить студентов для куратора.')
    }
  }
}
