import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Injectable, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import axios, { AxiosInstance, isAxiosError } from 'axios';
import { ExchangeRateError } from '../errors/exchange-rate-error';
import { ExchangeRateResponseDto } from '../dto/exchange-rate.dto';

@Injectable()
export class ExchangeService {
  private readonly logger = new Logger(ExchangeService.name);
  private readonly httpClient: AxiosInstance;
  private readonly maxRetries: number;
  private readonly retryDelayMs: number;
  private readonly exchangeRateCacheKey: string;

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private configService: ConfigService,
  ) {
    this.httpClient = axios.create({
      baseURL: this.configService.getOrThrow<string>('EXCHANGE_API_URL'),
      headers: {
        'x-api-key': this.configService.getOrThrow<string>('EXCHANGE_API_KEY'),
      },
      timeout: this.configService.get<number>('EXCHANGE_API_TIMEOUT', 1000),
    });

    this.maxRetries = this.configService.get<number>(
      'EXCHANGE_API_MAX_RETRIES',
      3,
    );
    this.retryDelayMs = this.configService.get<number>(
      'EXCHANGE_API_RETRY_DELAY_MS',
      1000,
    );

    this.exchangeRateCacheKey = this.configService.get<string>(
      'EXCHANGE_RATE_CACHE_KEY',
      'exchangeRate',
    );
  }

  @Cron('0 */1 * * * *')
  async handleCachedDataRefresh() {
    this.logger.log('Scheduled task: refreshing exchange rate');
    await this.refreshExchangeRate();
  }

  /**
   * Delays execution for a specified number of milliseconds.
   * @param ms - The number of milliseconds to delay.
   * @returns A promise that resolves after the specified delay.
   */
  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Refreshes the exchange rate from the external API and updates the cache.
   * Retries up to `maxRetries` times with a delay between attempts.
   * @throws {ExchangeRateError} If the exchange rate cannot be refreshed after all attempts.
   */
  async refreshExchangeRate(): Promise<void> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const response =
          await this.httpClient.get<ExchangeRateResponseDto>('/');

        if (
          !response.data ||
          typeof response.data.exchange_rate !== 'number' ||
          isNaN(response.data.exchange_rate)
        ) {
          this.logger.warn(
            'Invalid exchange rate API response structure received.',
            response.data,
          );
          throw new ExchangeRateError('Invalid API response', response.data);
        }

        const exchange_rate = response.data.exchange_rate;

        if (exchange_rate <= 0) {
          this.logger.warn(
            `Received non-positive exchange rate: ${exchange_rate}. This is unexpected.`,
          );
          throw new ExchangeRateError(
            `Received non-positive exchange rate: ${exchange_rate}`,
          );
        }

        await this.cacheManager.set(this.exchangeRateCacheKey, exchange_rate);
        this.logger.log(`Exchange rate updated: EUR to PLN = ${exchange_rate}`);
        return;
      } catch (error: unknown) {
        lastError = error;

        if (isAxiosError(error)) {
          this.logger.error(
            `Attempt ${attempt} - Failed to fetch exchange rate: ${error.message}`,
          );
        } else if (error instanceof ExchangeRateError) {
          this.logger.error(
            `Attempt ${attempt} - ExchangeRateError: ${error.message}`,
          );
        } else {
          this.logger.error(
            `Attempt ${attempt} - Unexpected error: ${
              error instanceof Error ? error.message : 'Unknown error'
            }`,
          );
        }

        if (attempt < this.maxRetries) {
          this.logger.log(
            `Waiting ${this.retryDelayMs}ms before retrying... (attempt ${attempt + 1}/${this.maxRetries})`,
          );

          await this.delay(this.retryDelayMs);
        }
      }
    }

    this.logger.error(
      `All ${this.maxRetries} attempts failed. Unable to refresh exchange rate.`,
    );
    throw new ExchangeRateError(
      `Failed to refresh exchange rate after ${this.maxRetries} attempts`,
      lastError,
    );
  }

  /**
   * Retrieves the exchange rate from cache, or refreshes it if not available.
   * @returns {Promise<number>} The exchange rate from EUR to PLN.
   * @throws {ExchangeRateError} If the exchange rate is unavailable after an on-demand refresh.
   */
  async getExchangeRate(): Promise<number> {
    this.logger.debug(
      `Attempting to retrieve exchange rate from cache with key: ${this.exchangeRateCacheKey}`,
    );

    let exchange_rate = await this.cacheManager.get<number>(
      this.exchangeRateCacheKey,
    );

    if (exchange_rate !== undefined && exchange_rate !== null) {
      this.logger.log(`Exchange rate found in cache: ${exchange_rate}`);
      return exchange_rate;
    }

    this.logger.warn(
      `Exchange rate not found in cache (key: ${this.exchangeRateCacheKey}). Attempting an on-demand refresh.`,
    );

    try {
      await this.refreshExchangeRate();
      exchange_rate = await this.cacheManager.get<number>(
        this.exchangeRateCacheKey,
      );

      if (exchange_rate === undefined || exchange_rate === null) {
        this.logger.error(
          'Exchange rate not found. Cache miss after on-demand refresh.',
        );
        throw new ExchangeRateError(
          'Exchange rate unavailable from cache even after on-demand refresh attempt.',
        );
      }
      this.logger.log(`Exchange rate found in cache: ${exchange_rate}`);

      return exchange_rate;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to get exchange rate: ${message}`);
      throw error;
    }
  }
}
