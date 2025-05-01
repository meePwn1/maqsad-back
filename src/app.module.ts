import { Logger, Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { AcceptLanguageResolver, HeaderResolver, I18nModule, QueryResolver } from 'nestjs-i18n'
import * as path from 'path'
import { PrismaModule } from 'src/common/services/prisma/prisma.module'
import { TranslationModule } from 'src/common/services/translation/translation.module'
import { AuthModule } from 'src/modules/auth/auth.module'
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard'
import { DeleteReasonModule } from 'src/modules/delete-reason/delete-reason.module'
import { GroupModule } from 'src/modules/group/group.module'
import { PaymentMethodModule } from 'src/modules/payment-method/payment-method.module'
import { PaymentsModule } from 'src/modules/payments/payments.module'
import { StudentsModule } from 'src/modules/students/students.module'
import { UsersModule } from 'src/modules/users/users.module'
import configuration, { AppConfig, LoggerConfig, LoggerFormat } from 'src/config/configuration'
import { LoggerModule } from 'nestjs-pino'
import { FileModule } from 'src/common/services/file/file.module'
import { CourseModule } from 'src/modules/course/course.module'
import { ServeStaticModule } from '@nestjs/serve-static'
import { join } from 'path'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    I18nModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<AppConfig>) => ({
        fallbackLanguage: config.get('defaultLanguage') as string,
        loaderOptions: {
          path: path.join(__dirname, '/i18n/'),
          watch: true,
        },
        typesOutputPath: path.join(process.cwd(), 'src/common/types/i18n.generated.ts'),
      }),
      resolvers: [new HeaderResolver(['x-lang']), new QueryResolver(['lang']), new AcceptLanguageResolver()],
    }),
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService<AppConfig>) => {
        const loggerConfig = config.get<LoggerConfig>('logger')

        return {
          pinoHttp: {
            level: loggerConfig?.level,
            transport: loggerConfig?.format === LoggerFormat.Pretty ? { target: 'pino-pretty' } : undefined,
            useLevelLabels: true,
            formatters: {
              level: (label: string) => {
                return { level: label }
              },
            },
            autoLogging: false,
          },
        }
      },
    }),
    AuthModule,
    UsersModule,
    PrismaModule,
    StudentsModule,
    TranslationModule,
    FileModule,
    PaymentsModule,
    PaymentMethodModule,
    DeleteReasonModule,
    GroupModule,
    CourseModule,
  ],
  providers: [
    Logger,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
