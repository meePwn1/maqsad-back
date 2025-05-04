import { cleanEnv, num, port, str, url } from 'envalid'

export interface AppConfig {
  port: number
  database: DatabaseConfig
  jwt: JwtConfig
  logger: LoggerConfig
  isDevEnv: boolean
  corsMaxAge: number
  defaultLanguage: string
  bcryptSalt: number
  backendUrl: string
}

export interface DatabaseConfig {
  url: string
  host: string
  port: number
  name: string
  schema: string
  poolSize: number
}

export interface JwtConfig {
  accessSecret: string
  refreshSecret: string
  expiresIn: string
  refreshIn: string
}

export enum LoggerFormat {
  Json = 'json',
  Pretty = 'pretty',
}

export interface LoggerConfig {
  level: string
  format: LoggerFormat
}

export default (): AppConfig => {
  const env = cleanEnv(process.env, {
    PORT: port({ default: 3001 }),
    CORS_MAX_AGE: num({ default: 86400 }),

    DATABASE_URL: url(),
    DB_HOST: str({ default: 'localhost' }),
    DB_PORT: num({ default: 5432 }),
    POSTGRES_DB: str({ default: 'maqsad' }),
    DB_SCHEMA: str({ default: 'public' }),
    POOL_SIZE: num({ default: 15 }),

    JWT_ACCESS_SECRET: str(),
    JWT_REFRESH_SECRET: str(),
    JWT_EXPIRES_IN: str({ default: '5m' }),
    JWT_REFRESH_IN: str({ default: '7d' }),

    LOGGER_LEVEL: str({
      choices: ['info', 'debug', 'error', 'warn'],
      default: 'info',
    }),
    LOGGER_FORMAT: str({ choices: ['json', 'pretty'], default: 'json' }),
    DEFAULT_LANGUAGE: str({ default: 'ru' }),
    BCRYPT_SALT: num({ default: 10 }),
    BACKEND_URL: str({ default: 'http://localhost:3001' }),
  })

  return {
    port: env.PORT,
    database: {
      url: env.DATABASE_URL,
      host: env.DB_HOST,
      port: env.DB_PORT,
      name: env.POSTGRES_DB,
      schema: env.DB_SCHEMA,
      poolSize: env.POOL_SIZE,
    },
    jwt: {
      accessSecret: env.JWT_ACCESS_SECRET,
      refreshSecret: env.JWT_REFRESH_SECRET,
      expiresIn: env.JWT_EXPIRES_IN,
      refreshIn: env.JWT_REFRESH_IN,
    },
    logger: {
      level: env.LOGGER_LEVEL,
      format: (env.LOGGER_FORMAT as LoggerFormat) || LoggerFormat.Json,
    },
    isDevEnv: env.isDev,
    corsMaxAge: env.CORS_MAX_AGE,
    defaultLanguage: env.DEFAULT_LANGUAGE,
    bcryptSalt: env.BCRYPT_SALT,
    backendUrl: env.BACKEND_URL,
  }
}
