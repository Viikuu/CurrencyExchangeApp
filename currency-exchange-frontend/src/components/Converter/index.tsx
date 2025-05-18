"use client";

import axios from 'axios';
import { useMutation } from '@tanstack/react-query';
import { useForm, SubmitHandler } from 'react-hook-form';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import FormHelperText from '@mui/material/FormHelperText';
import { TransactionInput, TransactionResponse } from '@/types/Transaction.types';
import CurrentRate from '../CurrentRate';
import { ConversionResult } from '../ConversionResult';
import { BASE_URL } from '@/consts';

export default function Converter() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TransactionInput>({
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  const {
    mutate,
    data: conversion,
    error: convertError,
    isPending: converting,
  } = useMutation<TransactionResponse, Error, TransactionInput>({
    mutationFn: async (input) => {
      const response = await axios
        .post<TransactionResponse>(
          `${BASE_URL}/transaction`,
          input
      )
      return response.data;
    }
  });

  const onSubmit: SubmitHandler<TransactionInput> = data => mutate(data);

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Typography variant="h4" align="center" gutterBottom>
        EUR → PLN Converter
      </Typography>

      <CurrentRate />
      <FormControl fullWidth error={!!errors.amountEUR || !!convertError} sx={{ mb: 2 }}>
        <InputLabel htmlFor="amount-eur">Amount in EUR</InputLabel>
        <OutlinedInput
          id="amount-eur"
          label="Amount in EUR"
          endAdornment={<InputAdornment position="end">€</InputAdornment>}
          disabled={converting}
          inputProps={{ step: 0.01, min: 0.01 }}
          {...register('amountEUR', {
            required: 'Amount is required',
            valueAsNumber: true,
            min: { value: 0.01, message: 'Value must be greater than 0' },
            validate: value => !isNaN(value) || 'Must be a number',
          })}
        />
        <FormHelperText>
          {errors.amountEUR
            ? errors.amountEUR.message
            : convertError
            ? 'Service is currently unavailable. Please try again later.'
            : ' '}
        </FormHelperText>
      </FormControl>

      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        size="medium"
        disabled={converting}
      >
        {converting ? <CircularProgress size={20} /> : 'Convert'}
      </Button>
      
      <ConversionResult conversion={conversion} />
      
    </Box>
  );
}