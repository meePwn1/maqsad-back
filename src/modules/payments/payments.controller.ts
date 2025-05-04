import { Controller, Post, Body, UseGuards, Param, Put, Delete } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiResponse } from '@nestjs/swagger'
import { PaymentsService } from './payments.service'
import { CreatePaymentDto } from './dto/create-payment.dto'
import { Role } from '@prisma/client'
import { RolesGuard } from 'src/modules/auth/guards/roles.guard'
import { Roles } from 'src/modules/auth/decorators/roles.decorator'
import { UpdatePaymentDto } from 'src/modules/payments/dto/update-payment.dto'

@ApiTags('Payments') // Категория в Swagger
@Controller('students/:id/payments')
@UseGuards(RolesGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER, Role.CURATOR)
  @ApiOperation({ summary: 'Создать платеж для студента' })
  @ApiParam({ name: 'id', example: '123', description: 'ID студента' })
  @ApiBody({ type: CreatePaymentDto })
  @ApiResponse({ status: 201, description: 'Платеж успешно создан' })
  createPayment(@Param('id') studentId: string, @Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.createPayment(studentId, createPaymentDto)
  }

  @Put(':paymentId')
  @Roles(Role.ADMIN, Role.MANAGER, Role.CURATOR)
  @ApiOperation({ summary: 'Обновить информацию о платеже' })
  @ApiParam({ name: 'id', example: '123', description: 'ID студента' })
  @ApiParam({ name: 'paymentId', example: '456', description: 'ID платежа' })
  @ApiBody({ type: UpdatePaymentDto })
  @ApiResponse({ status: 200, description: 'Платеж успешно обновлен' })
  updatePayment(@Param('paymentId') paymentId: string, @Body() updatePaymentDto: UpdatePaymentDto) {
    return this.paymentsService.updatePayment(paymentId, updatePaymentDto)
  }

  @Delete(':paymentId')
  @Roles(Role.ADMIN, Role.MANAGER, Role.CURATOR)
  @ApiOperation({ summary: 'Удалить платеж' })
  @ApiParam({ name: 'id', example: '123', description: 'ID студента' })
  @ApiParam({ name: 'paymentId', example: '456', description: 'ID платежа' })
  @ApiResponse({ status: 204, description: 'Платеж успешно удален' })
  deletePayment(@Param('paymentId') paymentId: string) {
    return this.paymentsService.deletePayment(paymentId)
  }
}
