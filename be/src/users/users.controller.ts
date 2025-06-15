import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from 'src/common/decorators/roles.decorator';
import { ApiResponse as IApiResponse } from 'src/common/types/api-response.type';
import { RequestWithUser } from 'src/common/types/request-with-user.type';
import { AuthGuard } from 'src/guards/auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { CreateUserDto } from 'src/users/schema/create-user.schema';
import { GetUsersQueryDto } from 'src/users/schema/get-users.schema';
import { UpdateUserStatusBodyDto } from 'src/users/schema/update-user-status.schema';
import { UsersService } from './users.service';
import { SkipThrottle } from '@nestjs/throttler';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @SkipThrottle()
  @Get('me')
  @UseGuards(AuthGuard)
  //#region api documentation
  @ApiOperation({
    summary: 'Get current user profile',
    description:
      'This endpoint retrieves the profile of the currently authenticated user.',
  })
  @ApiResponse({
    status: 200,
    example: {
      message: 'Successfully retrieved current user profile',
      data: {
        message: 'Successfully retrieved current user profile',
        data: {
          id: 'cmbbryx6g0000xr7x4wg2cb9o',
          username: 'exampleuser',
          email: 'example@example.com',
          role: 'USER',
        },
      },
    },
  })
  //#endregion
  async getCurrentProfile(@Req() req: RequestWithUser): Promise<IApiResponse> {
    const user = await this.usersService.getCurrentProfile(req.user.sub);
    return {
      message: 'Successfully retrieved current user profile',
      data: user,
    } satisfies IApiResponse;
  }

  @Post()
  @UseGuards(AuthGuard)
  //#region api documentation
  @ApiOperation({
    summary: 'Create a new user',
    description:
      'This endpoint allows you to create a new user with the provided details.',
  })
  @ApiResponse({
    status: 201,
    example: {
      message: 'User created successfully',
      data: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'user@example.com',
        createdAt: '2023-10-01T12:00:00Z',
      },
    },
  })
  //#endregion
  async create(@Body() createUserDto: CreateUserDto): Promise<IApiResponse> {
    const result = await this.usersService.createUser(createUserDto);
    return {
      message: 'User created successfully',
      data: result,
    } satisfies IApiResponse;
  }

  @Get()
  @UseGuards(AuthGuard)
  //#region api documentation
  @ApiOperation({
    summary: 'Get all users',
    description:
      'This endpoint retrieves all users with optional pagination, search, and sorting.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number for pagination',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page',
    example: 10,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search term for filtering users by username and email',
    example: 'john',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    description: 'Fields to sort by (can specify multiple)',
    example: ['username', 'createdAt'],
    isArray: true,
    explode: true, // This allows multiple values: ?sortBy=username&sortBy=email
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    type: [String],
    description: 'Sort order for each field (defaults to asc if not provided)',
    example: ['asc', 'desc'],
    isArray: true,
    explode: true, // This allows multiple values: ?sortOrder=asc&sortOrder=desc
  })
  @ApiQuery({
    name: 'status',
    required: false,
    type: [String],
    description: 'Filter users by status (can specify multiple)',
    example: ['ACTIVE', 'INACTIVE'],
    isArray: true,
    explode: true, // This allows multiple values: ?status=ACTIVE&status=INACTIVE
  })
  @ApiResponse({
    status: 200,
    example: {
      message: 'Successfully retrieved users',
      data: [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          username: 'user123',
          email: 'user@example.com',
          createdAt: '2023-10-01T12:00:00Z',
          updatedAt: '2023-10-01T12:00:00Z',
          status: 'ACTIVE',
        },
      ],
    },
  })
  //#endregion
  async getUsers(
    @Query() getUsersDto: GetUsersQueryDto,
  ): Promise<IApiResponse> {
    const result = await this.usersService.findAllUsers(getUsersDto);
    return {
      message: 'Successfully retrieved users',
      ...result,
    } satisfies IApiResponse;
  }

  @Get(':userId')
  @UseGuards(AuthGuard)
  //#region api documentation
  @ApiOperation({
    summary: 'Get user by ID',
    description: 'This endpoint retrieves a user by their unique identifier.',
  })
  @ApiParam({
    name: 'userId',
    type: String,
    description: 'The unique identifier of the user to retrieve',
    example: 'cmbbruim00000xr5wmjwlr1po',
  })
  @ApiResponse({
    status: 200,
    example: {
      message: 'Successfully retrieved user',
      data: {
        id: 'cmbbruim00000xr5wmjwlr1po',
        username: 'user123',
        email: 'user@example.com',
        status: 'ACTIVE',
        createdAt: '2023-10-01T12:00:00Z',
        updatedAt: '2023-10-01T12:00:00Z',
      },
    },
  })
  //#endregion
  async getUserById(@Param('userId') userId: string): Promise<IApiResponse> {
    const result = await this.usersService.findUserById(userId);
    return {
      message: 'Successfully retrieved user',
      data: result,
    } satisfies IApiResponse;
  }

  @Patch(':userId/status')
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  //#region api documentation
  @ApiOperation({
    summary: 'Update user status',
    description:
      'This endpoint allows you to update the status of a user by their unique identifier. Only administrators can perform this action.',
  })
  @ApiParam({
    name: 'userId',
    type: String,
    description: 'The unique identifier of the user to update',
    example: 'cmbbruim00000xr5wmjwlr1po',
  })
  @ApiResponse({
    status: 200,
    example: {
      message: 'User status updated successfully',
    },
  })
  //#endregion
  async updateUserStatus(
    @Param('userId') userId: string,
    @Body() updateUserStatusBodyDto: UpdateUserStatusBodyDto,
  ) {
    await this.usersService.updateUserStatus(
      userId,
      updateUserStatusBodyDto.status,
    );
    return {
      message: 'User status updated successfully',
    } satisfies IApiResponse;
  }

  @Get(':userId/sessions')
  @UseGuards(AuthGuard)
  //#region api documentation
  @ApiOperation({
    summary: 'Get user sessions',
    description:
      'This endpoint retrieves all sessions for a user by their unique identifier.',
  })
  @ApiParam({
    name: 'userId',
    type: String,
    description: 'The unique identifier of the user whose sessions to retrieve',
    example: 'cmbbruim00000xr5wmjwlr1po',
  })
  @ApiResponse({
    status: 200,
    example: {
      message: 'Successfully retrieved user sessions',
      data: [
        {
          id: 'cmbdfe9xw0003xrel230kmnr9',
          userId: 'cmbbryx6g0000xr7x4wg2cb9o',
          deviceInfo: 'Desktop',
          userAgent: 'httpyac',
          expiresAt: '2025-06-08T08:55:36.404Z',
          createdAt: '2025-06-01T08:55:36.404Z',
          lastUsedAt: '2025-06-01T08:55:36.404Z',
        },
      ],
    },
  })
  //#endregion
  async getUserSessions(
    @Param('userId') userId: string,
  ): Promise<IApiResponse> {
    const result = await this.usersService.getUserSessions(userId);
    return {
      message: 'Successfully retrieved user sessions',
      data: result,
    } satisfies IApiResponse;
  }
}
