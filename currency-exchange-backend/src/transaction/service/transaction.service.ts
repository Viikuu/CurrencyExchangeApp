import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExchangeService } from '../../exchange/service/exchange.service';
import { Transaction } from '../entity/transaction.entity';
import { TransactionDto } from '../dto/calculate-exchange.dto';
import { TransactionError } from '../errors/transaction-error';

@Injectable()
export class TransactionService {
  constructor(
    private readonly exchangeService: ExchangeService,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  /**
   * Creates a transaction: fetch exchange_rate, compute PLN, save to DB
   * @param amountEUR - The amount in EUR to be converted.
   * @returns The created transaction as a TransactionDto.
   * @throws TransactionError if the amount in EUR is not greater than zero.
   */
  async createTransaction(amountEUR: number): Promise<TransactionDto> {
    if (amountEUR <= 0) {
      throw new TransactionError(
        'Amount in EUR must be greater than zero',
        amountEUR,
      );
    }

    const exchange_rate = await this.exchangeService.getExchangeRate();
    const amountPLN = parseFloat((amountEUR * exchange_rate).toFixed(2));

    const transaction = this.transactionRepository.create({
      amountEUR,
      amountPLN,
      exchange_rate,
    });
    return this.transactionRepository.save(transaction);
  }

  /** List past transactions
   * @return Promise<Transaction[]>
   * @return All transactions ordered by timestamp descending
   */
  findAll(): Promise<Transaction[]> {
    return this.transactionRepository.find({ order: { timestamp: 'DESC' } });
  }
}
