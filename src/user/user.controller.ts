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
import { GetUsersQueryDto } from './dto/get-users-query.dto';
import { UserService } from './user.service';
import { UpdatePasswordDto } from './dto/update-password.dto';

@ApiTags('User')
@Controller('user')
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
  create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @ApiUpdateUserPassword()
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdatePasswordDto,
  ) {
    return this.userService.update(id, dto);
  }

  @ApiDeleteUser()
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.userService.remove(id);
  }
}
