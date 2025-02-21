import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
import { json, urlencoded } from 'express'
import multer from 'multer'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.use(json())
  app.use(urlencoded({ extended: true }))
  app.useGlobalPipes(new ValidationPipe({ transform: true }))
  app.use(multer().any())
  app.enableShutdownHooks()
  await app.listen(process.env.PORT ?? 3000)
}
bootstrap()
