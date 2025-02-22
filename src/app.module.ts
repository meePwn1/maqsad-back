import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { APP_GUARD } from '@nestjs/core'
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'
import { PrismaModule } from 'src/prisma/prisma.module'
import { LoggerMiddleware } from 'src/common/logger/logger.middleware'
import { StudentsModule } from './students/students.module'
import { ManagerModule } from './manager/manager.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    UsersModule,
    PrismaModule,
    StudentsModule,
    ManagerModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  exports: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*')
  }
}
