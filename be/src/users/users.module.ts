import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaModule } from 'src/common/libs/prisma/prisma.module';
import { UtilityModule } from 'src/common/utils/utility.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [PrismaModule, UtilityModule, JwtModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
