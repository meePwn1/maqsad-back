import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiOperation, ApiConsumes, ApiTags, ApiResponse, ApiBody } from '@nestjs/swagger'
import { Role } from '@prisma/client'
import { RequestWithUser } from 'src/common/types/request-with-user.type'
import { Roles } from 'src/modules/auth/decorators/roles.decorator'
import { ChangePasswordDto } from 'src/modules/users/dto/change-password.dto'
import { CreateUserDto } from 'src/modules/users/dto/create-user.dto'
import { GetUserDto } from 'src/modules/users/dto/get-user.dto'
import { UpdateProfileDto } from 'src/modules/users/dto/update-profile.dto'
import { UpdateUserFromAdminDto } from 'src/modules/users/dto/update-user-from-admin.dto'
import { UsersService } from 'src/modules/users/users.service'

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Создать менеджера' })
  @ApiResponse({ status: 201, description: 'Менеджер успешно создан' })
  @Roles(Role.ADMIN)
  @Post('manager')
  createManager(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createManager(createUserDto)
  }

  @ApiOperation({ summary: 'Создать куратора' })
  @ApiResponse({ status: 201, description: 'Куратор успешно создан' })
  @Roles(Role.ADMIN)
  @Post('curator')
  createCurator(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createCurator(createUserDto)
  }

  @ApiOperation({ summary: 'Получить текущего пользователя' })
  @ApiResponse({ status: 200, description: 'Текущий пользователь' })
  @Roles(Role.ADMIN, Role.CURATOR, Role.MANAGER)
  @Get('me')
  getMe(@Req() req: RequestWithUser) {
    return req.user
  }

  @ApiOperation({ summary: 'Обновление профиля пользователя' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateProfileDto })
  @Roles(Role.ADMIN, Role.CURATOR, Role.MANAGER)
  @Patch('profile')
  @UseInterceptors(FileInterceptor('avatar'))
  updateProfile(
    @Req() req: RequestWithUser,
    @Body() updateProfileDto: UpdateProfileDto,
    @UploadedFile() avatar?: Express.Multer.File,
  ) {
    return this.usersService.updateProfile(req.user.id, { ...updateProfileDto, avatar })
  }

  @ApiOperation({ summary: 'Смена пароля' })
  @ApiResponse({ status: 200, description: 'Пароль успешно изменен' })
  @Roles(Role.ADMIN, Role.CURATOR, Role.MANAGER)
  @Patch('password')
  changePassword(@Req() req: RequestWithUser, @Body() changePasswordDto: ChangePasswordDto) {
    return this.usersService.changePassword(req.user.id, changePasswordDto)
  }

  @ApiOperation({ summary: 'Получить список менеджеров' })
  @ApiResponse({ status: 200, description: 'Список менеджеров' })
  @Roles(Role.ADMIN)
  @Get('managers')
  getManagers(@Query() query: GetUserDto) {
    return this.usersService.getManagers(query)
  }

  @ApiOperation({ summary: 'Получить список кураторов' })
  @ApiResponse({ status: 200, description: 'Список кураторов' })
  @Roles(Role.ADMIN)
  @Get('curators')
  getCurators(@Query() query: GetUserDto) {
    return this.usersService.getCurators(query)
  }

  @ApiOperation({ summary: 'Обновить пользователя (Админ)' })
  @ApiResponse({ status: 200, description: 'Пользователь обновлен' })
  @Roles(Role.ADMIN)
  @Patch(':id')
  updateUserFromAdmin(@Param('id') id: string, @Body() updateUserDto: UpdateUserFromAdminDto) {
    return this.usersService.updateUserFromAdmin(id, updateUserDto)
  }

  @ApiOperation({ summary: 'Удалить пользователя' })
  @ApiResponse({ status: 200, description: 'Пользователь удален' })
  @Roles(Role.ADMIN)
  @Delete(':id')
  deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id)
  }
}
