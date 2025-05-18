import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amountEUR!: number;

  @Column('decimal', { precision: 12, scale: 2 })
  amountPLN!: number;

  @Column('decimal', { precision: 10, scale: 6 })
  exchange_rate!: number;

  @CreateDateColumn()
  timestamp!: Date;
}
