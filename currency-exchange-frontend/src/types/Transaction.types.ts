export type TransactionInput = { amountEUR: number };

export type TransactionResponse = {
  id: string;
  amountEUR: number;
  amountPLN: number;
  exchange_rate: number;
  timestamp: string;
};