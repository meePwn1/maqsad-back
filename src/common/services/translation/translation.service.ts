import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { I18nContext, I18nService } from 'nestjs-i18n'
import { I18nTranslations } from 'src/common/types/i18n.generated'
import { AppConfig } from 'src/config/configuration'

type NestedKeyOf<Obj extends object> = {
  [Key in keyof Obj & (string | number)]: Obj[Key] extends object ? `${Key}.${NestedKeyOf<Obj[Key]>}` : `${Key}`
}[keyof Obj & (string | number)]

export type TranslationKeys = NestedKeyOf<I18nTranslations>

@Injectable()
export class TranslationService {
  constructor(
    private readonly i18n: I18nService,
    private readonly configService: ConfigService<AppConfig>,
  ) {}

  t(key: TranslationKeys, args?: Parameters<I18nService['t']>[1]) {
    const lang = I18nContext.current()?.lang || this.configService.get<string>('defaultLanguage')
    return this.i18n.t(key, { ...args, lang })
  }
}
