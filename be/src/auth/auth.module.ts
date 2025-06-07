import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/common/libs/prisma/prisma.module';
import { UtilityModule } from 'src/common/utils/utility.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [PrismaModule, UtilityModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
