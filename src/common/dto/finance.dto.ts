import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'

export class FinanceDto {
  @Expose()
  @ApiProperty({ type: Number })
  totalDebt: number

  @Expose()
  @ApiProperty({ type: Number })
  totalPayment: number

  @Expose()
  @ApiProperty({ type: Number })
  totalStudentsCount: number
}
