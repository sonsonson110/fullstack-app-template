import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { JWTPayload } from 'src/common/types/jwt-payload.type';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const request = context.switchToHttp().getRequest();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    let token = this.extractTokenFromHeader(request);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    token ??= this.extractTokenFromCookie(request);
    if (!token) {
      throw new UnauthorizedException('No access token provided');
    }
    try {
      const payload = await this.jwtService.verifyAsync<JWTPayload>(token);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException('Invalid access token');
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private extractTokenFromCookie(request: Request): string | undefined {
    return request.cookies?.['accessToken'] as string | undefined;
  }
}
