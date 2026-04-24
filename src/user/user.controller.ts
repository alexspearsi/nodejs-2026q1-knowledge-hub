import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  ApiCreateUser,
  ApiDeleteUser,
  ApiGetUserById,
  ApiGetUsers,
  ApiUpdateUserPassword,
} from '../common/decorators/user.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetUsersQueryDto } from './dto/get-users-query.dto';
import { UserService } from './user.service';
import {
  ForbiddenError,
  ValidationError,
} from '../common/errors/app.error';
import { JwtGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../generated/prisma/enums';
import { User } from './user.interface';

@ApiTags('User')
@Controller('user')
@UseGuards(JwtGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiGetUsers()
  @Get()
  findAll(@Query() query: GetUsersQueryDto) {
    return this.userService.findAll(query);
  }

  @ApiGetUserById()
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.userService.findById(id);
  }

  @ApiCreateUser()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.admin)
  create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @ApiUpdateUserPassword()
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() currentUser: User,
  ) {
    if (currentUser.role !== UserRole.admin && currentUser.id !== id) {
      throw new ForbiddenError(
        'You do not have permission to update this user',
      );
    }
    if (dto.role && currentUser.role !== UserRole.admin) {
      throw new ForbiddenError('Only admins can update user roles');
    }
    if (!dto.role && !dto.oldPassword && !dto.newPassword) {
      throw new ValidationError('At least one field must be provided');
    }
    return this.userService.update(id, dto);
  }

  @ApiDeleteUser()
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.admin)
  remove(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.userService.remove(id);
  }
}
