import { Injectable, Logger, BadRequestException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as fs from 'fs/promises'
import * as path from 'path'
import { existsSync, mkdirSync } from 'fs'
import { TranslationService } from 'src/common/services/translation/translation.service'
import { AppConfig } from 'src/config/configuration'

@Injectable()
export class FileService {
  private readonly logger = new Logger(FileService.name)
  private readonly uploadsDirName = 'uploads'

  constructor(
    private readonly configService: ConfigService<AppConfig>,
    private readonly i18n: TranslationService,
  ) {}

  /**
   * Generates a unique filename without using external libraries
   */
  private generateUniqueFilename(extension: string): string {
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 15)
    return `${timestamp}-${randomStr}${extension}`
  }

  /**
   * Сохраняет файл на диск и возвращает путь к нему
   */
  async saveFile(
    file: Express.Multer.File,
    options: {
      folder?: string
      allowedTypes?: string[]
      maxSize?: number // в байтах
    } = {},
  ): Promise<string | null> {
    if (!file) {
      return null
    }

    const { folder = '', allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'], maxSize = 5 * 1024 * 1024 } = options

    // Валидация типа файла
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        this.i18n.t('errors.FILE.INVALID_FILE_TYPE', {
          args: { types: allowedTypes.join(', ') },
        }),
      )
    }

    // Валидация размера файла
    if (file.size > maxSize) {
      throw new BadRequestException(
        this.i18n.t('errors.FILE.FILE_TOO_LARGE', {
          args: { maxSize: `${Math.round(maxSize / 1024 / 1024)}MB` },
        }),
      )
    }

    // Создаем папку, если её нет
    const uploadsDir = path.join(process.cwd(), this.uploadsDirName, folder)
    if (!existsSync(uploadsDir)) {
      mkdirSync(uploadsDir, { recursive: true })
    }

    // Генерируем уникальное имя файла
    const fileExt = path.extname(file.originalname)
    const fileName = this.generateUniqueFilename(fileExt)
    const filePath = path.join(this.uploadsDirName, folder, fileName)
    const fullPath = path.join(process.cwd(), filePath)

    // Записываем файл (асинхронно)
    try {
      await fs.writeFile(fullPath, file.buffer)
      this.logger.log(`Файл успешно сохранен: ${filePath}`)
      const backendUrl = this.configService.get<string>('backendUrl')
      const normalizedPath = filePath.replace(/\\/g, '/')
      return `${backendUrl}/${normalizedPath}`
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка'
      this.logger.error(`Ошибка при сохранении файла: ${errorMessage}`)
      throw new BadRequestException(this.i18n.t('errors.FILE.SAVE_FAILED'))
    }
  }

  /**
   * Удаляет файл с диска
   */
  async deleteFile(filePath: string): Promise<boolean> {
    if (!filePath) return true

    const fullPath = path.join(process.cwd(), filePath)

    try {
      // Проверяем существование файла
      try {
        await fs.access(fullPath)
        // Если файл существует, удаляем его
        await fs.unlink(fullPath)
        this.logger.log(`Файл успешно удален: ${filePath}`)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (accessError: unknown) {
        // Файл не существует, ничего не делаем
        this.logger.log(`Файл не найден при попытке удаления: ${filePath}`)
      }
      return true
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка'
      this.logger.error(`Ошибка при удалении файла: ${errorMessage}`)
      return false
    }
  }

  /**
   * Заменяет существующий файл на новый с удалением старого
   */
  async replaceFile(
    oldFilePath: string | null,
    newFile: Express.Multer.File,
    options: {
      folder?: string
      allowedTypes?: string[]
      maxSize?: number
    } = {},
  ): Promise<string | null> {
    // Удаляем старый файл, если он существует
    if (oldFilePath) {
      await this.deleteFile(oldFilePath)
    }

    // Сохраняем новый файл
    return this.saveFile(newFile, options)
  }
}
