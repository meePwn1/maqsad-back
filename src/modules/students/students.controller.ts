import { Controller, Get, Post, Body, UseGuards, Query, Param, Patch } from '@nestjs/common'
import { StudentsService } from './students.service'
import { CreateStudentDto } from './dto/request/create-student.dto'
import { Role } from '@prisma/client'
import { Roles } from 'src/modules/auth/decorators/roles.decorator'
import { RolesGuard } from 'src/modules/auth/guards/roles.guard'
import { DeleteStudentDto } from 'src/modules/students/dto/request/delete-student.dto'
import { GetStudentsDto } from 'src/modules/students/dto/request/get-students.dto'
import { UpdateStudentDto } from 'src/modules/students/dto/request/update-student.dto'
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiResponse,
  ApiExtraModels,
  getSchemaPath,
} from '@nestjs/swagger'
import { Student } from 'prisma/generated/classes/student'
import { PaginatedResponseDto } from 'src/common/dto/pagination.dto'
import { StudentsWithFinanceResponseDto } from 'src/modules/students/dto/response/student-wtih-finance.dto'
import { StudentDetailDto } from 'src/modules/students/dto/response/student-by-id.dto'

@ApiTags('Students')
@Controller({ version: '1', path: 'students' })
@UseGuards(RolesGuard)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Создать студента' })
  @ApiBody({ type: CreateStudentDto })
  @ApiResponse({ status: 201, description: 'Студент успешно создан', type: Student })
  createStudent(@Body() createStudentDto: CreateStudentDto) {
    return this.studentsService.createStudent(createStudentDto)
  }

  @Get('active')
  @Roles(Role.ADMIN)
  @ApiExtraModels(PaginatedResponseDto, StudentsWithFinanceResponseDto)
  @ApiOperation({ summary: 'Получить активных студентов' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'search', required: false, example: 'Иванов' })
  @ApiResponse({
    status: 200,
    description: 'Список активных студентов',
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginatedResponseDto) },
        {
          properties: {
            data: { $ref: getSchemaPath(StudentsWithFinanceResponseDto) },
          },
        },
      ],
    },
  })
  getActiveStudents(@Query() query: GetStudentsDto) {
    return this.studentsService.getActiveStudents(query)
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Получить студента по ID' })
  @ApiParam({ name: 'id', required: true, example: 'uuid' })
  @ApiResponse({ status: 200, description: 'Информация о студенте', type: StudentDetailDto })
  getStudentById(@Param('id') id: string) {
    return this.studentsService.getStudentById(id)
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Обновить данные студента' })
  @ApiParam({ name: 'id', required: true, example: 'uuid' })
  @ApiBody({ type: UpdateStudentDto })
  @ApiResponse({ status: 200, description: 'Студент успешно обновлён' })
  updateStudent(@Param('id') id: string, @Body() updateStudentDto: UpdateStudentDto) {
    return this.studentsService.updateStudent(id, updateStudentDto)
  }

  @Patch(':id/delete')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Удалить студента' })
  @ApiParam({ name: 'id', required: true, example: 'uuid' })
  @ApiBody({ type: DeleteStudentDto })
  @ApiResponse({ status: 200, description: 'Студент успешно удалён' })
  deleteStudent(@Param('id') id: string, @Body() deleteStudentDto: DeleteStudentDto) {
    return this.studentsService.deleteStudent(id, deleteStudentDto)
  }
}
