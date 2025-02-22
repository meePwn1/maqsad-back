import { Controller, Get, Post, Body, UseGuards, Req, Param } from '@nestjs/common'
import { StudentsService } from './students.service'
import { CreateStudentDto } from './dto/create-student.dto'
import { Role } from '@prisma/client'
import { RolesGuard } from 'src/auth/guards/roles.guard'
import { Roles } from 'src/auth/decorators/roles.decorator'
import { RequestWithUser } from 'src/common/types/request-with-user.type'
import { GetTotalPaymentAndDebtDto } from 'src/students/dto/get-total-payment-and-debt.dto'
import { GetAllStudentsDto } from 'src/students/dto/get-all-students.dto'

@Controller('students')
@UseGuards(RolesGuard)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER)
  createStudent(@Body() createStudentDto: CreateStudentDto, @Req() req: RequestWithUser) {
    if (req.user.role === Role.MANAGER) {
      createStudentDto.managerId = req.user.id
    }
    return this.studentsService.create(createStudentDto)
  }

  @Get()
  @Roles(Role.ADMIN)
  getAllStudents(@Param() query: GetAllStudentsDto) {
    return this.studentsService.findAllStudents(query)
  }

  @Get()
  @Roles(Role.ADMIN)
  getTotalPaymentAndDebt(@Param() param: GetTotalPaymentAndDebtDto) {
    return this.studentsService.getTotalPaymentAndDebt(param)
  }

  @Get('manager')
  @Roles(Role.MANAGER)
  getStudentsForManager(@Req() req: RequestWithUser) {
    return this.studentsService.findStudentsForManager(req.user.id)
  }
}
