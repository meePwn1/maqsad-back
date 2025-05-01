import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { I18nValidationExceptionFilter, I18nValidationPipe } from 'nestjs-i18n'
import multer from 'multer'
import { ConfigService } from '@nestjs/config'
import { AppConfig } from 'src/config/configuration'
import { Logger } from 'nestjs-pino'
import { VersioningType } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { PrismaModel } from 'prisma/generated/classes'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    snapshot: true,
  })

  const configService = app.get<ConfigService<AppConfig>>(ConfigService)
  const port = configService.get<number>('port')
  const logger = app.get(Logger)
  const corsMaxAge = configService.get<number>('corsMaxAge')

  app.useLogger(app.get(Logger))
  app.enableCors({
    maxAge: corsMaxAge,
  })
  app.enableVersioning({
    type: VersioningType.URI,
  })
  app.setGlobalPrefix('api')
  app.enableShutdownHooks()
  app.use(multer().any())

  app.useGlobalPipes(
    new I18nValidationPipe({
      transform: true,
      forbidNonWhitelisted: true,
      whitelist: true,
    }),
  )

  app.useGlobalFilters(
    new I18nValidationExceptionFilter({
      detailedErrors: false,
    }),
  )

  const openApiConfig = new DocumentBuilder()
    .setTitle('Maqsad LMS API')
    .setDescription('API для управления курсами, пользователями и ролями в Maqsad LMS')
    .setVersion('1.0')
    .addServer(`http://localhost:${port}`, 'Local')
    .addServer(`https://api.maqsad.com`, 'Production')
    .addBearerAuth()
    .build()

  const documentFactory = () =>
    SwaggerModule.createDocument(app, openApiConfig, {
      deepScanRoutes: true,
      extraModels: [...PrismaModel.extraModels],
    })
  SwaggerModule.setup('api-docs', app, documentFactory, {
    jsonDocumentUrl: 'api-docs/json',
    raw: ['json'],
  })

  await app.listen(port ?? 3001, () => {
    logger.log(`Application started at port:${port}`)
  })
}
bootstrap()
