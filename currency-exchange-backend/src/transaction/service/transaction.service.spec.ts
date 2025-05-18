import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TransactionService } from './transaction.service';
import { Transaction } from '../entity/transaction.entity';
import { TransactionError } from '../errors/transaction-error';
import { ExchangeService } from '../../exchange/service/exchange.service';

describe('TransactionService', () => {
  let service: TransactionService;
  let exchangeService: Partial<ExchangeService>;
  let repository: Partial<Repository<Transaction>>;

  beforeEach(async () => {
    exchangeService = {
      getExchangeRate: jest.fn(),
    };

    repository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        { provide: ExchangeService, useValue: exchangeService },
        { provide: getRepositoryToken(Transaction), useValue: repository },
      ],
    }).compile();

    service = module.get<TransactionService>(TransactionService);
  });

  describe('createTransaction', () => {
    it('should throw TransactionError if amountEUR is <= 0', async () => {
      await expect(service.createTransaction(0)).rejects.toBeInstanceOf(
        TransactionError,
      );
      await expect(service.createTransaction(-5)).rejects.toBeInstanceOf(
        TransactionError,
      );
    });

    it('should create and save a transaction correctly', async () => {
      const amountEUR = 100;
      const mockRate = 4.5;
      const mockPLN = +(amountEUR * mockRate).toFixed(2);
      const mockEntity = {
        id: '1',
        amountEUR,
        amountPLN: mockPLN,
        exchange_rate: mockRate,
        timestamp: new Date(),
      } as Transaction;

      (exchangeService.getExchangeRate as jest.Mock).mockResolvedValue(
        mockRate,
      );
      (repository.create as jest.Mock).mockReturnValue(mockEntity);
      (repository.save as jest.Mock).mockResolvedValue(mockEntity);

      const result = await service.createTransaction(amountEUR);

      expect(exchangeService.getExchangeRate).toHaveBeenCalled();
      expect(repository.create).toHaveBeenCalledWith({
        amountEUR,
        amountPLN: mockPLN,
        exchange_rate: mockRate,
      });
      expect(repository.save).toHaveBeenCalledWith(mockEntity);
      expect(result).toEqual(mockEntity);
    });
  });

  describe('findAll', () => {
    it('should return all transactions ordered by timestamp DESC', async () => {
      const mockList: Transaction[] = [
        {
          id: '1',
          amountEUR: 10,
          amountPLN: 45,
          exchange_rate: 4.5,
          timestamp: new Date(),
        },
      ];
      (repository.find as jest.Mock).mockResolvedValue(mockList);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalledWith({
        order: { timestamp: 'DESC' },
      });
      expect(result).toEqual(mockList);
    });
  });
});
