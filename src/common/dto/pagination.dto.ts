import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsInt, Min, Max } from 'class-validator'
import { Type } from 'class-transformer'

export class PaginationRequestDto {
  @ApiPropertyOptional({
    description: 'Номер страницы (начиная с 1)',
    default: 1,
    minimum: 1,
    type: Number,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1

  @ApiPropertyOptional({
    description: 'Количество элементов на странице',
    default: 20,
    minimum: 1,
    maximum: 100,
    type: Number,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 20
}

export class PaginationResponseDto {
  @ApiProperty({ type: Number })
  totalPages: number

  @ApiProperty({ type: Number })
  currentPage: number

  @ApiProperty({ type: Number })
  itemsPerPage: number

  @ApiProperty({ type: Number })
  totalItems: number

  constructor(totalItems: number, currentPage: number, itemsPerPage: number) {
    this.totalItems = totalItems
    this.currentPage = currentPage
    this.itemsPerPage = itemsPerPage
    this.totalPages = Math.ceil(totalItems / itemsPerPage)
  }
}

export class PaginatedResponseDto<T> {
  @ApiProperty({ type: Object })
  data: T

  @ApiProperty({ type: PaginationResponseDto })
  pagination: PaginationResponseDto

  constructor(data: T, pagination: PaginationResponseDto) {
    this.data = data
    this.pagination = pagination
  }
}

export function createPaginatedResponse<T>(
  data: T,
  totalItems: number,
  currentPage: number = 1,
  itemsPerPage: number = 20,
): PaginatedResponseDto<T> {
  const pagination = new PaginationResponseDto(totalItems, currentPage, itemsPerPage)
  return new PaginatedResponseDto(data, pagination)
}
