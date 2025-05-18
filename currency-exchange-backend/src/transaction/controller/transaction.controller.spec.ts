import { TransactionController } from './transaction.controller';
import { TransactionService } from '../service/transaction.service';
import { TransactionError } from '../errors/transaction-error';
import {
  CalculateExchangeRequestDto,
  TransactionDto,
} from '../dto/calculate-exchange.dto';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';

describe('TransactionController', () => {
  let controller: TransactionController;
  let serviceMock: {
    createTransaction: jest.Mock<Promise<TransactionDto>, [number]>;
    findAll: jest.Mock<Promise<TransactionDto[]>, []>;
  };

  beforeEach(() => {
    serviceMock = {
      createTransaction: jest.fn<Promise<TransactionDto>, [number]>(),
      findAll: jest.fn<Promise<TransactionDto[]>, []>(),
    };

    controller = new TransactionController(
      serviceMock as unknown as TransactionService,
    );
  });

  describe('createTransaction', () => {
    const validBody: CalculateExchangeRequestDto = { amountEUR: 10 };

    it('returns the created TransactionDto on success', async () => {
      const dto: TransactionDto = {
        id: 'tx1',
        amountEUR: 10,
        amountPLN: 45,
        exchange_rate: 4.5,
        timestamp: new Date(),
      };
      serviceMock.createTransaction.mockResolvedValue(dto);

      await expect(controller.createTransaction(validBody)).resolves.toEqual(
        dto,
      );
      expect(serviceMock.createTransaction).toHaveBeenCalledWith(10);
    });

    it('throws BadRequestException if TransactionService throws TransactionError', async () => {
      serviceMock.createTransaction.mockRejectedValue(
        new TransactionError('invalid amount'),
      );

      await expect(
        controller.createTransaction(validBody),
      ).rejects.toBeInstanceOf(BadRequestException);
      await expect(controller.createTransaction(validBody)).rejects.toThrow(
        'Invalid transaction request: invalid amount',
      );
    });

    it('throws InternalServerErrorException on any other error', async () => {
      serviceMock.createTransaction.mockRejectedValue(new Error('DB down'));

      await expect(
        controller.createTransaction(validBody),
      ).rejects.toBeInstanceOf(InternalServerErrorException);
      await expect(controller.createTransaction(validBody)).rejects.toThrow(
        'Failed to create transaction: Ex',
      );
    });
  });

  describe('list', () => {
    it('returns an array of TransactionDto', async () => {
      const list: TransactionDto[] = [
        {
          id: 'tx1',
          amountEUR: 5,
          amountPLN: 22.5,
          exchange_rate: 4.5,
          timestamp: new Date(),
        },
      ];
      serviceMock.findAll.mockResolvedValue(list);

      await expect(controller.list()).resolves.toEqual(list);
      expect(serviceMock.findAll).toHaveBeenCalled();
    });
  });
});
