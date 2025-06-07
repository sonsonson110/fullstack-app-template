import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ZodValidationPipe } from 'nestjs-zod';
import jwtConfig, { JwtConfig } from 'src/common/config/jwt.config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [jwtConfig] }),
    CacheModule.register({ isGlobal: true }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const jwtConfig = configService.get<JwtConfig>('jwt')!;
        return {
          secret: jwtConfig.secret,
          signOptions: {
            expiresIn: jwtConfig.expiresIn,
            issuer: jwtConfig.issuer,
            audience: jwtConfig.audience,
          },
        };
      },
      inject: [ConfigService],
      global: true,
    }),
    UsersModule,
    AuthModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
  ],
})
export class AppModule {}
