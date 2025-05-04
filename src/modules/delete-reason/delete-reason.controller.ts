import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { DeleteReasonService } from './delete-reason.service'
import { CreateDeleteReasonDto } from './dto/create-delete-reason.dto'
import { UpdateDeleteReasonDto } from './dto/update-delete-reason.dto'

@ApiTags('Delete Reasons')
@Controller('delete-reason')
export class DeleteReasonController {
  constructor(private readonly deleteReasonService: DeleteReasonService) {}

  @ApiOperation({ summary: 'Создать причину удаления' })
  @ApiResponse({ status: 201, description: 'Причина удаления успешно создана' })
  @Post()
  create(@Body() createDeleteReasonDto: CreateDeleteReasonDto) {
    return this.deleteReasonService.create(createDeleteReasonDto)
  }

  @ApiOperation({ summary: 'Получить список причин удаления' })
  @ApiResponse({ status: 200, description: 'Возвращает массив причин удаления' })
  @Get()
  findAll() {
    return this.deleteReasonService.findAll()
  }

  @ApiOperation({ summary: 'Обновить причину удаления' })
  @ApiResponse({ status: 200, description: 'Причина удаления успешно обновлена' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDeleteReasonDto: UpdateDeleteReasonDto) {
    return this.deleteReasonService.update(+id, updateDeleteReasonDto)
  }

  @ApiOperation({ summary: 'Удалить причину удаления' })
  @ApiResponse({ status: 200, description: 'Причина удаления успешно удалена' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.deleteReasonService.remove(+id)
  }
}
