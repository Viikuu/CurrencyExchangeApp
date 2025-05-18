import { Module } from '@nestjs/common';
import { ExchangeService } from './service/exchange.service';
import { ExchangeController } from './controller/exchange.controller';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [CacheModule.register({ ttl: 60 * 1000 })],
  providers: [ExchangeService],
  controllers: [ExchangeController],
  exports: [ExchangeService],
})
export class ExchangeModule {}
