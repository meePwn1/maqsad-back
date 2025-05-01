import { PaymentMethod } from './payment_method'
import { Student } from './student'
import { ApiProperty } from '@nestjs/swagger'

export class Payment {
  @ApiProperty({ type: String })
  id: string

  @ApiProperty({ type: Number })
  amount: number

  @ApiProperty({ type: Date })
  payment_at: Date

  @ApiProperty({ type: Number })
  paymentMethodId: number

  @ApiProperty({ type: () => PaymentMethod })
  paymentMethod: PaymentMethod

  @ApiProperty({ type: () => Student })
  student: Student

  @ApiProperty({ type: String })
  studentId: string
}
