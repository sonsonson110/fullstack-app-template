import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { ForgotPasswordDto } from 'src/auth/schema/forgot-password.schema';
import { LoginDto } from 'src/auth/schema/login.schema';
import { ResetPasswordDto } from 'src/auth/schema/reset-password.schema';
import { SessionInfo } from 'src/auth/types/session-info.type';
import { ApiResponse as IApiResponse } from 'src/common/types/api-response.type';
import { JWTPayload } from 'src/common/types/jwt-payload.type';
import { AuthGuard } from 'src/guards/auth.guard';
import { AuthService } from './auth.service';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  private readonly accessTokenExpiresIn: number = 15 * 60 * 1000;
  private readonly refreshTokenExpiresIn: number = 7 * 24 * 60 * 60 * 1000;
  constructor(private readonly authService: AuthService) {}

  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('login')
  //#region api documentation
  @ApiOperation({
    summary: 'User login',
    description:
      'This endpoint allows users to log in with their credentials. It supports both cookie and token-based responses.',
  })
  @ApiResponse({
    status: 201,
    description: 'Login successful',
    example: {
      message: 'Login successfully',
      data: {
        accessToken: 'your-access-token',
        refreshToken: 'your-refresh-token',
        role: 'USER',
      },
    },
  })
  //#endregion
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<IApiResponse> {
    const sessionInfo: SessionInfo = {
      ipAddress: req.ip || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
      deviceInfo: this.extractDeviceInfo(req.headers['user-agent']),
    };
    const result = await this.authService.login(loginDto, sessionInfo);
    const responseDataBase = { role: result.role };
    if (loginDto.responseType === 'cookie') {
      response.cookie('accessToken', result.accessToken, {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: this.accessTokenExpiresIn,
      });
      response.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: this.refreshTokenExpiresIn,
      });
      return {
        message: 'Login successfully',
        data: responseDataBase,
      } satisfies IApiResponse;
    } else {
      return {
        message: 'Login successfully',
        data: {
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          ...responseDataBase,
        },
      } satisfies IApiResponse;
    }
  }

  private extractDeviceInfo(userAgent?: string): string | undefined {
    if (!userAgent) return undefined;
    if (userAgent.includes('Mobile')) return 'Mobile';
    if (userAgent.includes('Tablet')) return 'Tablet';
    return 'Desktop';
  }

  @UseGuards(AuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  //#region api documentation
  @ApiOperation({
    summary: 'User logout',
    description:
      'This endpoint allows users to log out and clear their session.',
  })
  @ApiResponse({
    status: 200,
    description: 'Logout successful',
  })
  //#endregion
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<IApiResponse> {
    const refreshToken = request.cookies['refreshToken'] as string;
    const { sub } = request['user'] as JWTPayload;
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token provided');
    }
    await this.authService.logout(sub, refreshToken);
    response.clearCookie('accessToken');
    response.clearCookie('refreshToken');
    return { message: 'Logout successfully' } satisfies IApiResponse;
  }

  @Post('refresh-token')
  //#region api documentation
  @ApiOperation({
    summary: 'Refresh access token',
    description:
      'This endpoint allows users to refresh their access token using a valid refresh token.',
  })
  @ApiResponse({
    status: 201,
    description: 'Access token refreshed successfully',
  })
  //#endregion
  async refreshToken(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<IApiResponse> {
    const refreshToken = request.cookies['refreshToken'] as string;
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token provided');
    }
    const newAccessToken =
      await this.authService.refreshAccessToken(refreshToken);
    response.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: this.accessTokenExpiresIn,
    });
    return {
      message: 'Access token refreshed successfully',
    } satisfies IApiResponse;
  }

  @Throttle({ default: { limit: 1, ttl: 8.64e7 } }) // 1 request per day
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  //#region api documentation
  @ApiOperation({
    summary: 'Forgot password',
    description:
      'This endpoint allows users to request a password reset link by providing their email address.',
  })
  @ApiResponse({
    status: 200,
    description: "Password reset link sent to the user's email",
  })
  //#endregion
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<IApiResponse> {
    await this.authService.forgotPasswordAction(forgotPasswordDto.email);
    return {
      message: 'Password reset link sent to your email',
    } satisfies IApiResponse;
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  //#region api documentation
  @ApiOperation({
    summary: 'Reset password',
    description:
      'This endpoint allows users to reset their password using a valid reset token and new password. This also revokes the all user sessions.',
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully',
  })
  //#endregion
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<IApiResponse> {
    await this.authService.resetPassword(resetPasswordDto);
    return { message: 'Password reset successfully' } satisfies IApiResponse;
  }

  @Get('reset-password/verify/:resetToken')
  //#region api documentation
  @ApiOperation({
    summary: 'Verify reset token',
    description:
      'This endpoint verifies the validity of a password reset token. It returns a success message if the token is valid.',
  })
  @ApiResponse({
    status: 200,
    description: 'Reset token is valid',
  })
  //#endregion
  async verifyResetToken(
    @Param('resetToken') resetToken: string,
  ): Promise<IApiResponse> {
    await this.authService.verifyResetToken(resetToken);
    return { message: 'Reset token is valid' } satisfies IApiResponse;
  }
}
