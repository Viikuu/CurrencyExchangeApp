import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { TransactionService } from '../service/transaction.service';
import {
  CalculateExchangeRequestDto,
  TransactionDto,
} from '../dto/calculate-exchange.dto';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  BadRequestErrorResponseDto,
  InternalServerErrorResponseDto,
} from '../../common/dto/error-response.dto';
import { TransactionError } from '../errors/transaction-error';

@ApiTags('Transaction')
@Controller('transaction')
export class TransactionController {
  private readonly logger = new Logger(TransactionController.name);
  constructor(private readonly transactionService: TransactionService) {}

  /**
   * Create a new transaction with the given amount in EUR.
   * @param body - The request body containing the amount in EUR.
   * @returns The created transaction.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new transaction' })
  @ApiBody({ type: CalculateExchangeRequestDto, description: 'Amount in EUR' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Transaction created successfully',
    type: TransactionDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid Request Body',
    type: BadRequestErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal Server Error',
    type: InternalServerErrorResponseDto,
  })
  async createTransaction(
    @Body() body: CalculateExchangeRequestDto,
  ): Promise<TransactionDto> {
    try {
      return await this.transactionService.createTransaction(body.amountEUR);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      if (error instanceof TransactionError) {
        throw new BadRequestException(
          `Invalid transaction request: ${message}`,
        );
      }

      this.logger.error(`Failed to create transaction: ${message}`);
      throw new InternalServerErrorException(
        `Failed to create transaction: Ex`,
      );
    }
  }

  /**
   * List all transactions.
   * @returns An array of all transactions.
   */
  @Get()
  @ApiOperation({ summary: 'List all transactions' })
  @ApiResponse({
    status: 200,
    description: 'Array of transaction records',
    type: [TransactionDto],
  })
  async list(): Promise<TransactionDto[]> {
    return this.transactionService.findAll();
  }
}
