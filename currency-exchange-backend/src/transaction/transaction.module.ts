import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExchangeModule } from '../exchange/exchange.module';
import { Transaction } from './entity/transaction.entity';
import { TransactionService } from './service/transaction.service';
import { TransactionController } from './controller/transaction.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction]), ExchangeModule],
  providers: [TransactionService],
  controllers: [TransactionController],
})
export class TransactionModule {}
