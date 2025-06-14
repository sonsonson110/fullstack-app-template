import { Request } from 'express';
import { JWTPayload } from 'src/common/types/jwt-payload.type';

export interface RequestWithUser extends Request {
  user: JWTPayload;
}
