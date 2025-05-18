import { ApiProperty } from '@nestjs/swagger';

export class ExchangeRateResponseDto {
  @ApiProperty({ description: 'Amount in euro' })
  exchange_rate!: number;
}
