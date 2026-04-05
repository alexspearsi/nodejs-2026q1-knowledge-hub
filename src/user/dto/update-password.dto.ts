import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class UpdatePasswordDto {
  @ApiProperty({
    example: 'StrongPassword123',
    description: 'Current user password',
  })
  @IsString()
  @IsNotEmpty()
  oldPassword: string;

  @ApiProperty({
    example: 'NewStrongPassword123',
    description: 'New password to replace the current one',
  })
  @IsString()
  @IsNotEmpty()
  newPassword: string;
}
