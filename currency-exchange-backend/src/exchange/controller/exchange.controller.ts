import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ExchangeService } from '../service/exchange.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ExchangeRateResponseDto } from '../dto/exchange-rate.dto';
import { InternalServerErrorResponseDto } from '../../common/dto/error-response.dto';

@Controller()
export class ExchangeController {
  private readonly logger = new Logger(ExchangeController.name);
  constructor(private readonly exchangeService: ExchangeService) {}

  /**
   * Get the current exchange rate from EUR to PLN.
   * @returns The current exchange rate.
   */
  @Get('exchange-rate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Fetch exchange rate of EUR to PLN' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Exchange rate fetched successfully',
    type: ExchangeRateResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal Server Error',
    type: InternalServerErrorResponseDto,
  })
  async getExchangeRate(): Promise<ExchangeRateResponseDto> {
    try {
      const exchange_rate = await this.exchangeService.getExchangeRate();
      return { exchange_rate };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to fetch exchange rate: ${message}`);

      throw new InternalServerErrorException(
        `Failed to fetch exchange rate: Service unavailable.`,
      );
    }
  }
}
