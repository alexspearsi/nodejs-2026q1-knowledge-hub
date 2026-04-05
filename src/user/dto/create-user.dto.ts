import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export enum UserRole {
  ADMIN = 'admin',
  EDITOR = 'editor',
  VIEWER = 'viewer',
}

export class CreateUserDto {
  @ApiProperty({ example: 'alex123', description: 'Unique user login name' })
  @IsString()
  @IsNotEmpty()
  login: string;

  @ApiProperty({
    example: 'StrongPassword123',
    description: 'User password',
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    enum: UserRole,
    example: UserRole.VIEWER,
    description: 'Role assigned to the user',
    required: false,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
