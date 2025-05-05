import { Controller, Get, Post, Body, Patch, Param, Query } from '@nestjs/common'
import { GroupService } from './group.service'
import { CreateGroupDto } from './dto/create-group.dto'
import { UpdateGroupDto } from './dto/update-group.dto'
import { GetGroupsDto } from 'src/modules/group/dto/get-groups.dto'
import { GetStudentsDto } from 'src/modules/students/dto/request/get-students.dto'
import { Role } from '@prisma/client'
import { Roles } from 'src/modules/auth/decorators/roles.decorator'
import { ApiTags, ApiOperation, ApiBody, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger'

@ApiTags('Groups')
@Controller('groups')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Создать новую группу' })
  @ApiBody({ type: CreateGroupDto })
  @ApiResponse({ status: 201, description: 'Группа успешно создана' })
  create(@Body() createGroupDto: CreateGroupDto) {
    return this.groupService.create(createGroupDto)
  }

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Получить все группы' })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiResponse({ status: 200, description: 'Список групп' })
  getAllGroups(@Query() query: GetGroupsDto) {
    return this.groupService.getAllGroups(query)
  }

  @Get(':id/students')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Получить студентов по ID группы' })
  @ApiParam({ name: 'id', description: 'ID группы' })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiResponse({ status: 200, description: 'Список студентов группы' })
  getStudentsByGroup(@Param('id') id: string, @Query() query: GetStudentsDto) {
    return this.groupService.getStudentsByGroup(id, query)
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Обновить группу' })
  @ApiParam({ name: 'id', description: 'ID группы' })
  @ApiBody({ type: UpdateGroupDto })
  @ApiResponse({ status: 200, description: 'Группа успешно обновлена' })
  update(@Param('id') id: string, @Body() updateGroupDto: UpdateGroupDto) {
    return this.groupService.update(id, updateGroupDto)
  }
}
