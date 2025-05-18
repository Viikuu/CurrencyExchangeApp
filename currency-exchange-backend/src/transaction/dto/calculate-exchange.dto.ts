import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class TransactionDto {
  @ApiProperty({ example: 'uuid-v4-id' })
  id!: string;

  @ApiProperty({ example: 100.0 })
  amountEUR!: number;

  @ApiProperty({ example: 470.5 })
  amountPLN!: number;

  @ApiProperty({ example: 4.705 })
  exchange_rate!: number;

  @ApiProperty({ type: String, format: 'date-time' })
  timestamp!: Date;
}

export class CalculateExchangeRequestDto {
  @ApiProperty({ description: 'Amount in euro' })
  @Type(() => Number)
  @IsNumber({}, { message: 'amountEUR must be a number' })
  amountEUR!: number;
}
