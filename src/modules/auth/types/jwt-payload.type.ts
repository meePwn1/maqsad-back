import { User } from '@prisma/client'

export type JwtPayload = Omit<User, 'password' | 'refreshToken'>
