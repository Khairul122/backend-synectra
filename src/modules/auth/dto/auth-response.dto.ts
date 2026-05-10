import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'John Doe' })
  fullName: string;

  @ApiProperty({ example: 'https://example.com/avatar.jpg', required: false })
  avatarUrl?: string;

  @ApiProperty({ example: 'client', enum: ['client', 'admin', 'staff'] })
  role: string;
}

export class AuthResponseDto {
  @ApiProperty({ description: 'Data user yang berhasil login' })
  user: UserDto;
}
