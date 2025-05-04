import { Injectable, Logger } from '@nestjs/common'
import { CreateDeleteReasonDto } from './dto/create-delete-reason.dto'
import { UpdateDeleteReasonDto } from './dto/update-delete-reason.dto'
import { PrismaService } from 'src/common/services/prisma/prisma.service'
import { TranslationService } from 'src/common/services/translation/translation.service'

@Injectable()
export class DeleteReasonService {
  private readonly logger = new Logger(DeleteReasonService.name)

  constructor(
    private prisma: PrismaService,
    private readonly i18n: TranslationService,
  ) {}

  async create(createRefundReasonDto: CreateDeleteReasonDto) {
    try {
      const newRefundReason = await this.prisma.deleteReason.create({
        data: createRefundReasonDto,
      })
      return newRefundReason
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`Ошибка при добавлении причины возврата: ${error.message}`, error.stack)
      } else {
        this.logger.error('Неизвестная ошибка при добавлении причины возврата', error)
      }
      throw new Error(this.i18n.t('errors.DELETE_REASON.CREATE_FAILED'))
    }
  }

  async findAll() {
    try {
      const refundReasons = await this.prisma.deleteReason.findMany()
      return refundReasons
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`Ошибка при загрузке списка причин возврата: ${error.message}`, error.stack)
      } else {
        this.logger.error('Неизвестная ошибка при загрузке списка причин возврата', error)
      }
      throw new Error(this.i18n.t('errors.DELETE_REASON.GET_ALL_FAILED'))
    }
  }

  async update(id: number, updateRefundReasonDto: UpdateDeleteReasonDto) {
    try {
      const refundReason = await this.prisma.deleteReason.update({
        where: { id },
        data: updateRefundReasonDto,
      })
      return refundReason
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`Ошибка при обновлении причины возврата: ${error.message}`, error.stack)
      } else {
        this.logger.error('Неизвестная ошибка при обновлении причины возврата', error)
      }
      throw new Error(this.i18n.t('errors.DELETE_REASON.UPDATE_FAILED'))
    }
  }

  async remove(id: number) {
    try {
      const deletedRefundReason = await this.prisma.deleteReason.delete({
        where: { id },
      })
      return deletedRefundReason
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`Ошибка при удалении причины возврата: ${error.message}`, error.stack)
      } else {
        this.logger.error('Неизвестная ошибка при удалении причины возврата', error)
      }
      throw new Error(this.i18n.t('errors.DELETE_REASON.DELETE_FAILED'))
    }
  }
}
