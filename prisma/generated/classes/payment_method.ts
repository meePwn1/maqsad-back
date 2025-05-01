import { Payment } from './payment'
import { ApiProperty } from '@nestjs/swagger'

export class PaymentMethod {
  @ApiProperty({ type: Number })
  id: number

  @ApiProperty({ type: String })
  nameUz: string

  @ApiProperty({ type: String })
  nameRu: string

  @ApiProperty({ isArray: true, type: () => Payment })
  payments: Payment[]
}
