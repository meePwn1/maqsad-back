import { IsDate, IsOptional } from 'class-validator'

export class GetTotalPaymentAndDebtDto {
  @IsDate()
  @IsOptional()
  financeFrom?: Date

  @IsDate()
  @IsOptional()
  financeTo?: Date
}
