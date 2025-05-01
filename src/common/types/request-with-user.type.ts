import { Request } from 'express'
import { JwtPayload } from 'src/modules/auth/types/jwt-payload.type'

export interface RequestWithUser extends Request {
  user: JwtPayload
}
