import { ApiProperty } from '@nestjs/swagger';

export class BadRequestErrorResponseDto {
  @ApiProperty({ example: 400, description: 'HTTP status code' })
  statusCode!: number;

  @ApiProperty({
    example: 'Bad Request',
    description: 'Short description of the error',
  })
  message!: string;

  @ApiProperty({
    type: [String],
    example: ['email must be an email', 'password should not be empty'],
    description: 'Validation error details (if any)',
  })
  errors?: string[];
}

export class InternalServerErrorResponseDto {
  @ApiProperty({ example: 500, description: 'HTTP status code' })
  statusCode!: number;

  @ApiProperty({
    example: 'Internal Server Error',
  })
  errors?: string;

  @ApiProperty({
    example: 'Service unavailable',
    description: 'Short description of the error',
  })
  message!: string;
}
