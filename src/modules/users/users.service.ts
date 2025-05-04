import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Prisma, Role } from '@prisma/client'
import * as bcrypt from 'bcrypt'
import { FileService } from 'src/common/services/file/file.service'
import { PrismaService } from 'src/common/services/prisma/prisma.service'
import { TranslationService } from 'src/common/services/translation/translation.service'
import { AppConfig } from 'src/config/configuration'
import { ChangePasswordDto } from 'src/modules/users/dto/change-password.dto'
import { CreateUserDto } from 'src/modules/users/dto/create-user.dto'
import { GetUserDto } from 'src/modules/users/dto/get-user.dto'
import { UpdateProfileDto } from 'src/modules/users/dto/update-profile.dto'
import { UpdateUserFromAdminDto } from 'src/modules/users/dto/update-user-from-admin.dto'

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name)

  private readonly userSelect = {
    avatar: true,
    createdAt: true,
    updatedAt: true,
    curatedStudents: true,
    email: true,
    firstName: true,
    lastName: true,
    role: true,
    refreshToken: false,
    id: true,
    managedStudents: true,
    password: false,
  } satisfies Prisma.UserSelect

  constructor(
    private prisma: PrismaService,
    private readonly i18n: TranslationService,
    private readonly config: ConfigService<AppConfig>,
    private readonly fileService: FileService,
  ) {}

  async createManager(user: CreateUserDto) {
    const { password, ...managerData } = user
    const saltRounds = this.config.get<number>('bcryptSalt')!
    try {
      const hashedPassword = bcrypt.hashSync(password, saltRounds)
      return await this.prisma.user.create({
        data: { ...managerData, role: Role.MANAGER, password: hashedPassword },
      })
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`Ошибка при создании менеджера: ${error.message}`, error.stack)
      } else {
        this.logger.error('Неизвестная ошибка при создании менеджера', error)
      }
      throw new InternalServerErrorException(this.i18n.t('errors.USER.CREATE_MANAGER_FAILED'))
    }
  }

  async createCurator(user: CreateUserDto) {
    const { password, ...curatorData } = user
    const saltRounds = this.config.get<number>('bcryptSalt')!
    try {
      const hashedPassword = bcrypt.hashSync(password, saltRounds)
      return await this.prisma.user.create({
        data: { ...curatorData, role: Role.CURATOR, password: hashedPassword },
      })
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`Ошибка при создании куратора: ${error.message}`, error.stack)
      } else {
        this.logger.error('Неизвестная ошибка при создании куратора', error)
      }
      throw new InternalServerErrorException(this.i18n.t('errors.USER.CREATE_CURATOR_FAILED'))
    }
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) throw new NotFoundException(this.i18n.t('errors.USER.NOT_FOUND'))

    if (updateProfileDto.avatar === null) {
      if (user.avatar) {
        await this.fileService.deleteFile(user.avatar)
      }
    } else {
      const newAvatarPath = await this.fileService.replaceFile(
        user.avatar,
        updateProfileDto.avatar as Express.Multer.File,
        { folder: 'avatars' },
      )
      updateProfileDto.avatar = newAvatarPath
    }

    return await this.prisma.user.update({
      where: { id: userId },
      data: updateProfileDto,
      select: this.userSelect,
    })
  }

  async changePassword(userId: string, { oldPassword, newPassword }: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new NotFoundException(this.i18n.t('errors.USER.NOT_FOUND'))

    const passwordMatch = await bcrypt.compare(oldPassword, user.password)
    if (!passwordMatch) throw new BadRequestException(this.i18n.t('errors.USER.WRONG_PASSWORD'))

    const hashedPassword = await bcrypt.hash(newPassword, this.config.get<number>('bcryptSalt')!)

    return this.prisma.user
      .update({
        where: { id: userId },
        data: { password: hashedPassword },
      })
      .catch((error) => {
        this.logger.error(`Ошибка при смене пароля: ${error instanceof Error ? error.message : error}`)
        throw new InternalServerErrorException(this.i18n.t('errors.USER.CHANGE_PASSWORD_FAILED'))
      })
  }

  async updateUserFromAdmin(id: string, user: UpdateUserFromAdminDto) {
    const { password, ...managerData } = user
    const saltRounds = this.config.get<number>('bcryptSalt')!
    try {
      const hashedPassword = password ? bcrypt.hashSync(password, saltRounds) : undefined
      return await this.prisma.user.update({
        where: { id },
        data: { ...managerData, password: hashedPassword },
      })
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`Ошибка при обновлении данных пользователя: ${error.message}`, error.stack)
      } else {
        this.logger.error('Неизвестная ошибка при обновлении данных пользователя', error)
      }
      throw new InternalServerErrorException(this.i18n.t('errors.USER.UPDATE_USER_FAILED'))
    }
  }

  async deleteUser(id: string) {
    try {
      return await this.prisma.user.delete({ where: { id } })
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`Ошибка при удалении пользователя: ${error.message}`, error.stack)
      } else {
        this.logger.error('Неизвестная ошибка при удалении пользователя', error)
      }
      throw new InternalServerErrorException(this.i18n.t('errors.USER.DELETE_USER_FAILED'))
    }
  }

  async getManagers(query: GetUserDto) {
    try {
      return await this.getUsers(query, Role.MANAGER)
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`Ошибка при получении менеджеров: ${error.message}`, error.stack)
      } else {
        this.logger.error('Неизвестная ошибка при получении менеджеров', error)
      }
      throw new InternalServerErrorException(this.i18n.t('errors.USER.GET_MANAGERS_FAILED'))
    }
  }
  async getCurators(query: GetUserDto) {
    try {
      return await this.getUsers(query, Role.CURATOR)
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`Ошибка при получении кураторов: ${error.message}`, error.stack)
      } else {
        this.logger.error('Неизвестная ошибка при получении кураторов', error)
      }
      throw new InternalServerErrorException(this.i18n.t('errors.USER.GET_CURATORS_FAILED'))
    }
  }

  async getUsers(query: GetUserDto, role: Role) {
    const { limit = 20, page = 1, search } = query
    const safeLimit = Math.min(limit, 100)
    const skip = (page - 1) * safeLimit
    const whereCondition: Prisma.UserWhereInput = { role }

    if (search) {
      whereCondition.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ]
    }

    try {
      return await this.prisma.user.findMany({
        take: safeLimit,
        skip,
        where: whereCondition,
        omit: { refreshToken: true, password: true, role: true },
        include: {
          ...(role === Role.CURATOR && { curatedStudents: true }),
          ...(role === Role.MANAGER && { managedStudents: true }),
        },
      })
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`Ошибка при получении пользователей: ${error.message}`, error.stack)
      } else {
        this.logger.error('Неизвестная ошибка при получении пользователей', error)
      }
    }
  }

  getByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } })
  }

  async updateUserToken(id: string, refreshToken: string | null) {
    await this.prisma.user.update({ where: { id }, data: { refreshToken } })
  }
}
