import { ApiProperty } from '@nestjs/swagger';

export class EmailResponse {
  @ApiProperty({
    description: '이메일',
    example: 'eduops@example.com',
  })
  email: string;
}
