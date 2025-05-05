import { Injectable, Logger } from '@nestjs/common'
import { CreateGroupDto } from './dto/create-group.dto'
import { UpdateGroupDto } from './dto/update-group.dto'
import { PrismaService } from 'src/common/services/prisma/prisma.service'
import { StudentsService } from 'src/modules/students/students.service'
import { GetGroupsDto } from 'src/modules/group/dto/get-groups.dto'
import { Prisma } from '@prisma/client'
import { GetStudentsDto } from 'src/modules/students/dto/request/get-students.dto'

@Injectable()
export class GroupService {
  private readonly logger = new Logger(GroupService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly studentsService: StudentsService,
  ) {}

  async create(createGroupDto: CreateGroupDto) {
    return await this.prisma.group.create({ data: createGroupDto })
  }

  async getAllGroups(query: GetGroupsDto) {
    const { from, to, search, page = 1, limit = 20, debt, studentsCount } = query

    // Безопасное ограничение на количество записей
    const safeLimit = Math.min(limit, 100)
    const skip = (page - 1) * safeLimit

    // Создаем базовое условие поиска
    const whereCondition: Prisma.GroupWhereInput = {}

    // Фильтр по дате создания
    if (from && to) {
      whereCondition.createdAt = {
        gte: from,
        lte: to,
      }
    }

    // Поиск по названию группы
    if (search) {
      whereCondition.name = {
        contains: search,
        mode: 'insensitive',
      }
    }

    // Получаем общее количество групп для пагинации
    const totalGroups = await this.prisma.group.count({
      where: whereCondition,
    })

    // Получаем группы с учетом фильтров и пагинации
    const groups = await this.prisma.group.findMany({
      where: whereCondition,
      skip,
      take: safeLimit,
      include: {
        students: {
          include: {
            payment: true,
          },
        },
        _count: {
          select: {
            students: true,
          },
        },
      },
    })

    // Преобразуем и рассчитываем финансовые показатели
    let processedGroups = groups.map((group) => {
      const { totalDebt, totalPayment } = this.studentsService.calculateTotalPaymentAndDebt(group.students)
      return {
        ...group,
        totalDebt,
        totalPayment,
      }
    })

    // Сортировка по долгу
    if (debt) {
      processedGroups = processedGroups.sort((a, b) => {
        return debt === 'asc' ? a.totalDebt - b.totalDebt : b.totalDebt - a.totalDebt
      })
    }

    // Сортировка по количеству студентов
    if (studentsCount) {
      processedGroups = processedGroups.sort((a, b) => {
        return studentsCount === 'asc' ? a._count.students - b._count.students : b._count.students - a._count.students
      })
    }

    return {
      data: processedGroups,
      pagination: {
        totalPages: Math.ceil(totalGroups / safeLimit),
        currentPage: page,
        itemsPerPage: safeLimit,
        totalItems: totalGroups,
      },
    }
  }

  async getStudentsByGroup(groupId: string, query: GetStudentsDto) {
    return await this.studentsService.getStudentsByGroup(groupId, query)
  }

  async update(id: string, updateGroupDto: UpdateGroupDto) {
    return await this.prisma.group.update({ where: { id }, data: updateGroupDto })
  }

  remove(id: number) {
    return `This action removes a #${id} group`
  }
}
