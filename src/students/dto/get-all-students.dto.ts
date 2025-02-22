import { Transform, Type } from 'class-transformer'
import { IsDate, IsEnum, IsInt, IsOptional, IsString, IsUUID } from 'class-validator'

export class GetAllStudentsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number = 1

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number = 10

  @IsOptional()
  @IsDate()
  studentFrom?: Date

  @IsOptional()
  @IsDate()
  studentTo?: Date

  @IsOptional()
  @Transform(({ value }: { value: string }) => value.split(','))
  @IsUUID(4, { each: true })
  groups?: string[]

  @IsOptional()
  @Transform(({ value }: { value: string }) => value.split(','))
  @IsUUID(4, { each: true })
  managers?: string[]

  @IsOptional()
  @Transform(({ value }: { value: string }) => value.split(','))
  @IsUUID(4, { each: true })
  curators?: string[]

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortByDebt?: 'asc' | 'desc'

  @IsOptional()
  @IsString()
  search?: string
}
