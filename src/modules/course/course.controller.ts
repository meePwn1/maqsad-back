import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseInterceptors, Query } from '@nestjs/common'
import { CourseService } from './course.service'
import { UpdateCourseDto } from './dto/update-course.dto'
import { FileInterceptor } from '@nestjs/platform-express'
import { Role } from '@prisma/client'
import { Roles } from 'src/modules/auth/decorators/roles.decorator'
import { CreateCourseDto } from 'src/modules/course/dto/create-course.dto'
import { GetCoursesDto } from 'src/modules/course/dto/get-courses.dto'
import { DeleteCourseDto } from 'src/modules/course/dto/delete-course.dto'
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiQuery, ApiParam, ApiResponse } from '@nestjs/swagger'

@ApiTags('Courses')
@Controller('courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post()
  @Roles(Role.ADMIN)
  @UseInterceptors(FileInterceptor('icon'))
  @ApiOperation({ summary: 'Создать курс' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateCourseDto })
  @ApiResponse({ status: 201, description: 'Курс успешно создан' })
  createCourse(@Body() createCourseDto: CreateCourseDto, @UploadedFile() icon: Express.Multer.File) {
    return this.courseService.create({ ...createCourseDto, icon })
  }

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Получить список курсов' })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiResponse({ status: 200, description: 'Список курсов' })
  findAll(@Query() query: GetCoursesDto) {
    return this.courseService.getCourses(query)
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @UseInterceptors(FileInterceptor('icon'))
  @ApiOperation({ summary: 'Обновить курс' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', description: 'ID курса' })
  @ApiBody({ type: UpdateCourseDto })
  @ApiResponse({ status: 200, description: 'Курс обновлён' })
  update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto, @UploadedFile() icon: Express.Multer.File) {
    return this.courseService.update(id, { ...updateCourseDto, icon })
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Удалить курс (с переводом студентов)' })
  @ApiParam({ name: 'id', description: 'ID удаляемого курса' })
  @ApiBody({ type: DeleteCourseDto })
  @ApiResponse({ status: 200, description: 'Курс удалён и студенты перенесены' })
  remove(@Param('id') id: string, @Body() deleteCourseDto: DeleteCourseDto) {
    return this.courseService.remove(id, deleteCourseDto)
  }
}
