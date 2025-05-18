import { ExchangeController } from './exchange.controller';
import { ExchangeService } from '../service/exchange.service';
import { InternalServerErrorException } from '@nestjs/common';
import { ExchangeRateResponseDto } from '../dto/exchange-rate.dto';

describe('ExchangeController', () => {
  let controller: ExchangeController;
  let serviceMock: {
    getExchangeRate: jest.Mock<Promise<number>, []>;
  };

  beforeEach(() => {
    serviceMock = {
      getExchangeRate: jest.fn<Promise<number>, []>(),
    };

    controller = new ExchangeController(
      serviceMock as unknown as ExchangeService,
    );
  });

  describe('getExchangeRate', () => {
    it('should return the exchange rate wrapped in DTO on success', async () => {
      serviceMock.getExchangeRate.mockResolvedValue(4.5);

      await expect(
        controller.getExchangeRate(),
      ).resolves.toEqual<ExchangeRateResponseDto>({
        exchange_rate: 4.5,
      });

      expect(serviceMock.getExchangeRate).toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException when service throws', async () => {
      serviceMock.getExchangeRate.mockRejectedValue(new Error('upstream fail'));

      await expect(controller.getExchangeRate()).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );
      await expect(controller.getExchangeRate()).rejects.toThrow(
        'Failed to fetch exchange rate: Service unavailable.',
      );

      expect(serviceMock.getExchangeRate).toHaveBeenCalled();
    });
  });
});
