import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'src/common/services/prisma/prisma.service'
import { TranslationService } from 'src/common/services/translation/translation.service'
import { CreatePaymentDto } from 'src/modules/payments/dto/create-payment.dto'
import { UpdatePaymentDto } from 'src/modules/payments/dto/update-payment.dto'

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name)

  constructor(
    private prisma: PrismaService,
    private readonly i18n: TranslationService,
  ) {}

  async createPayment(studentId: string, createPaymentDto: CreatePaymentDto) {
    try {
      const { paymentMethodId } = createPaymentDto

      const [student, method] = await Promise.all([
        this.prisma.student.findUnique({ where: { id: studentId } }),
        this.prisma.paymentMethod.findUnique({ where: { id: paymentMethodId } }),
      ])

      if (!student) {
        throw new NotFoundException(this.i18n.t('errors.STUDENT.NOT_FOUND'))
      }

      if (!method) {
        throw new NotFoundException(this.i18n.t('errors.PAYMENT.METHOD_NOT_FOUND'))
      }

      const payment = await this.prisma.payment.create({
        data: { ...createPaymentDto, studentId },
      })

      return payment
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`Ошибка при добавления платежа: ${error.message}`, error.stack)
      } else {
        this.logger.error('Неизвестная ошибка при добавлении платежа', error)
      }
      throw new InternalServerErrorException(this.i18n.t('errors.PAYMENT.CREATE_FAILED'))
    }
  }

  async updatePayment(paymentId: string, updatePaymentDto: UpdatePaymentDto) {
    try {
      const payment = await this.prisma.payment.update({
        where: { id: paymentId },
        data: updatePaymentDto,
      })
      return payment
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`Ошибка при обновлении платежа: ${error.message}`, error.stack)
      } else {
        this.logger.error('Неизвестная ошибка при обновлении платежа', error)
      }
      throw new InternalServerErrorException(this.i18n.t('errors.PAYMENT.UPDATE_FAILED'))
    }
  }

  async deletePayment(paymentId: string) {
    try {
      const deletedPayment = await this.prisma.payment.delete({
        where: { id: paymentId },
      })
      return deletedPayment
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`Ошибка при удалении платежа: ${error.message}`, error.stack)
      } else {
        this.logger.error('Неизвестная ошибка при удалении платежа', error)
      }
      throw new InternalServerErrorException(this.i18n.t('errors.PAYMENT.DELETE_FAILED'))
    }
  }
}
