import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Role, UserStatus } from '@prisma/client';
import { PrismaService } from 'src/common/libs/prisma/prisma.service';
import {
  calculatePagination,
  PaginationMeta,
} from 'src/common/types/api-response.type';
import { HasherService } from 'src/common/utils/hasher.service';
import { CreateUserDto } from 'src/users/schema/create-user.schema';
import { GetUsersQueryDto } from 'src/users/schema/get-users.schema';

@Injectable()
export class UsersService {
  private readonly userProfilePrefix = 'user_profile:';

  constructor(
    private readonly prisma: PrismaService,
    private readonly hasherService: HasherService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async getCurrentProfile(userId: string): Promise<{
    id: string;
    username: string;
    email: string;
    role: Role;
  }> {
    // Retrieve user profile from cache
    const cacheKey = `${this.userProfilePrefix}${userId}`;
    const cachedProfile = await this.cacheManager.get<string>(cacheKey);
    if (cachedProfile) {
      return JSON.parse(cachedProfile) as {
        id: string;
        username: string;
        email: string;
        role: Role;
      };
    }
    // If not in cache, fetch from database and set cache
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    const expiresIn = 10 * 60 * 1000; // Cache for 10 minutes
    await this.cacheManager.set(cacheKey, JSON.stringify(user), expiresIn);

    return user;
  }

  async createUser(
    dto: CreateUserDto,
  ): Promise<{ id: string; email: string; createdAt: Date }> {
    const emailExists = await this.prisma.user.findFirst({
      where: { email: dto.email },
      select: { id: true },
    });
    if (emailExists) {
      throw new ConflictException('User with this email already exists');
    }
    const usernameExists = await this.prisma.user.findFirst({
      where: { username: dto.username },
      select: { id: true },
    });
    if (usernameExists) {
      throw new ConflictException('User with this username already exists');
    }
    const hashedPassword = await this.hasherService.hash(dto.password);

    const result = await this.prisma.user.create({
      data: {
        username: dto.username,
        email: dto.email,
        passwordHash: hashedPassword,
      },
    });

    return {
      id: result.id,
      email: result.email,
      createdAt: result.createdAt,
    };
  }

  async findAllUsers(dto: GetUsersQueryDto): Promise<{
    data: {
      id: string;
      username: string;
      email: string;
      status: UserStatus;
      createdAt: Date;
      updatedAt: Date;
    }[];
    meta: PaginationMeta;
  }> {
    const { page, limit, search, sortBy, sortOrder, status } = dto;

    // Build the where clause with search and status filters
    const where: Prisma.UserWhereInput = {};

    // Add search filter
    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Add status filter
    if (status && status.length > 0) {
      where.status = {
        in: status,
      };
    }

    // Building the orderBy object based on sortBy and sortOrder
    let orderBy = {};
    if (sortBy && sortBy.length > 0) {
      orderBy = sortBy.map((field, index) => ({
        [field]: sortOrder![index],
      }));
    } else {
      orderBy = { createdAt: 'desc' };
    }

    const [result, totalCount] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          username: true,
          email: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: result,
      meta: calculatePagination(page, limit, totalCount),
    };
  }

  async findUserById(userId: string): Promise<{
    id: string;
    username: string;
    email: string;
    status: UserStatus;
    createdAt: Date;
    updatedAt: Date;
  }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateUserStatus(userId: string, status: UserStatus): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        status: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.status === status) {
      throw new ConflictException('User status is already set to this value');
    }

    if (status !== UserStatus.ACTIVE) {
      await this.prisma.$transaction(async (tx) => {
        // Revoke all user sessions
        await tx.refreshToken.updateMany({
          where: { userId: user.id, isRevoked: false },
          data: { isRevoked: true, revokedAt: new Date() },
        });

        await tx.user.update({
          where: { id: user.id },
          data: { status },
        });
      });
    } else {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { status },
      });
    }
  }

  async getUserSessions(userId: string): Promise<
    {
      id: string;
      userId: string;
      deviceInfo: string | null;
      userAgent: string | null;
      expiresAt: Date;
      createdAt: Date;
      lastUsedAt: Date | null;
    }[]
  > {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const sessions = await this.prisma.refreshToken.findMany({
      where: {
        userId: user.id,
        isRevoked: false,
        expiresAt: { gte: new Date() },
      },
      select: {
        id: true,
        userId: true,
        deviceInfo: true,
        userAgent: true,
        expiresAt: true,
        createdAt: true,
        lastUsedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return sessions;
  }
}
