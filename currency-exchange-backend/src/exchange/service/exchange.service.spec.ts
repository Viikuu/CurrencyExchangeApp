import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { ExchangeService } from './exchange.service';
import { ExchangeRateError } from '../errors/exchange-rate-error';
import { AxiosInstance, AxiosResponse } from 'axios';
import { ExchangeRateResponseDto } from '../dto/exchange-rate.dto';

describe('ExchangeService', () => {
  let service: ExchangeService;
  let cacheManager: jest.Mocked<Cache>;
  let configService: jest.Mocked<ConfigService>;
  let httpClientMock: jest.Mocked<Pick<AxiosInstance, 'get'>>;

  beforeEach(async () => {
    const cacheMockPartial = {
      get: jest.fn(),
      set: jest.fn(),
    };
    const configMockPartial = {
      getOrThrow: jest.fn(),
      get: jest.fn(),
    };

    cacheManager = cacheMockPartial as unknown as jest.Mocked<Cache>;
    configService = configMockPartial as unknown as jest.Mocked<ConfigService>;

    configService.getOrThrow.mockImplementation((key: string) => {
      if (key === 'EXCHANGE_API_URL') return 'https://api.test/';
      if (key === 'EXCHANGE_API_KEY') return 'apikey';
      throw new Error(`Unexpected key: ${key}`);
    });
    configService.get.mockImplementation((key: string, defaultValue: any) => {
      switch (key) {
        case 'EXCHANGE_API_TIMEOUT':
          return 500;
        case 'EXCHANGE_API_MAX_RETRIES':
          return 2;
        case 'EXCHANGE_API_RETRY_DELAY_MS':
          return 0;
        case 'EXCHANGE_RATE_CACHE_KEY':
          return 'exchangeRate';
        default:
          return defaultValue;
      }
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExchangeService,
        { provide: CACHE_MANAGER, useValue: cacheManager },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get(ExchangeService);
    cacheManager = module.get(CACHE_MANAGER);
    configService = module.get(ConfigService);

    httpClientMock = { get: jest.fn() };
    Reflect.set(service, 'httpClient', httpClientMock);
  });

  describe('refreshExchangeRate', () => {
    it('fetches and caches a valid exchange_rate', async () => {
      const mockResponse = {
        data: { exchange_rate: 4.5 },
      } as AxiosResponse<ExchangeRateResponseDto>;

      httpClientMock.get.mockResolvedValue(mockResponse);

      await service.refreshExchangeRate();

      expect(httpClientMock.get).toHaveBeenCalledWith('/');
      expect(cacheManager.set).toHaveBeenCalledWith('exchangeRate', 4.5);
    });

    it('throws when response has no exchange_rate', async () => {
      const bad = { foo: 1 };
      httpClientMock.get.mockResolvedValue({
        data: bad,
      } as unknown as AxiosResponse<ExchangeRateResponseDto>);

      await expect(service.refreshExchangeRate()).rejects.toBeInstanceOf(
        ExchangeRateError,
      );
      expect(cacheManager.set).not.toHaveBeenCalled();
    });

    it('throws when exchange_rate ≤ 0', async () => {
      httpClientMock.get.mockResolvedValue({
        data: { exchange_rate: 0 },
      } as unknown as AxiosResponse<ExchangeRateResponseDto>);

      await expect(service.refreshExchangeRate()).rejects.toBeInstanceOf(
        ExchangeRateError,
      );
      expect(cacheManager.set).not.toHaveBeenCalled();
    });

    it('retries on axios error then fails', async () => {
      const axiosError = Object.assign(new Error('network fail'), {
        isAxiosError: true,
      });
      httpClientMock.get.mockRejectedValue(axiosError);

      await expect(service.refreshExchangeRate()).rejects.toThrow(
        /Failed to refresh exchange rate after 2 attempts/,
      );
      expect(httpClientMock.get).toHaveBeenCalledTimes(2);
    });
  });

  describe('getExchangeRate', () => {
    it('returns cached value when present', async () => {
      cacheManager.get.mockResolvedValue(4.2);
      const exchange_rate = await service.getExchangeRate();
      expect(exchange_rate).toBe(4.2);
      expect(cacheManager.get).toHaveBeenCalledWith('exchangeRate');
    });

    it('on cache miss, refreshes then returns new exchange_rate', async () => {
      cacheManager.get
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce(5.1);

      jest
        .spyOn(service, 'refreshExchangeRate')
        .mockImplementation(async () => {
          await cacheManager.set('exchangeRate', 5.1);
        });

      const exchange_rate = await service.getExchangeRate();
      expect(exchange_rate).toBe(5.1);
    });

    it('propagates errors from on-demand refresh', async () => {
      cacheManager.get.mockResolvedValue(undefined);
      const err = new ExchangeRateError('oops');
      jest.spyOn(service, 'refreshExchangeRate').mockRejectedValue(err);

      await expect(service.getExchangeRate()).rejects.toBe(err);
    });
  });

  describe('handleCachedDataRefresh', () => {
    it('calls refreshExchangeRate()', async () => {
      const spy = jest
        .spyOn(service, 'refreshExchangeRate')
        .mockResolvedValue();
      await service.handleCachedDataRefresh();
      expect(spy).toHaveBeenCalled();
    });
  });
});
