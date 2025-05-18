"use client";

import React from 'react';
import { TransactionResponse } from '@/types/Transaction.types';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { formatRate } from '@/utils/formatRate';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';

type ConversionResultProps = {
  conversion?: TransactionResponse;
};

export function ConversionResult({ conversion }: ConversionResultProps) {
  if (!conversion) {
    return null;
  }

  const { amountEUR, amountPLN, exchange_rate, timestamp } = conversion;

  return (
    <Paper elevation={2} sx={{ mt: 3, p: 3, bgcolor: 'background.paper' }}>
      <Typography variant="body1" gutterBottom>
        {"PLN: "}<strong>{formatCurrency(amountPLN, 'PLN')}</strong>
        <br/>
        {"Euro: "} <strong>{formatCurrency(amountEUR, 'EUR')}</strong>
        <br />
        {"Exchange rate: "}<strong>{formatRate(exchange_rate)}</strong>.
      </Typography>

      <Typography variant="caption" color="text.secondary">
        {`Converted on ${formatDate(timestamp)}`}
        <br/>
        Transaction ID: {conversion.id}
      </Typography>
    </Paper>
  );
}
