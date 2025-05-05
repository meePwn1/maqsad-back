import { Module } from '@nestjs/common'
import { GroupService } from './group.service'
import { GroupController } from './group.controller'
import { StudentsService } from 'src/modules/students/students.service'

@Module({
  controllers: [GroupController],
  providers: [GroupService, StudentsService],
})
export class GroupModule {}
