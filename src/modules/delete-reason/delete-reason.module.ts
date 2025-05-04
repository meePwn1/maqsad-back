import { Module } from '@nestjs/common'
import { DeleteReasonService } from './delete-reason.service'
import { DeleteReasonController } from './delete-reason.controller'

@Module({
  controllers: [DeleteReasonController],
  providers: [DeleteReasonService],
})
export class DeleteReasonModule {}
