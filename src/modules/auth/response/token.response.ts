import { ApiProperty } from '@nestjs/swagger';

export class TokenResponse {
  @ApiProperty({
    description: '액세스 토큰',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJ0ZXN0QGVkdWFwcy5jb20iLCJpYXQiOjE2OTY3NzY4MDAsImV4cCI6MTY5Njc3NzQwMH0.7g8k9f8j9f8j9f8j9f8j9f8j9f8j9f8j9f8j9f8j9f8j9f8j9f8j9f8j9f8j9f8j',
  })
  accessToken: string;
  @ApiProperty({
    description: '리프레시 토큰',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJ0ZXN0QGVkdWFwcy5jb20iLCJpYXQiOjE2OTY3NzY4MDAsImV4cCI6MTY5Njc3NzQwMH0.7g8k9f8j9f8j9f8j9f8j9f8j9f8j9f8j9f8j9f8j9f8j9f8j9f8j9f8j9f8j9f8j',
  })
  refreshToken: string;
}
