import Converter from '@/components/Converter';
import { Box, Paper } from '@mui/material';
import React from 'react';

export default function HomePage() {
  return (
    <Box
      component="main"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Paper elevation={3} sx={{ p: 3, maxWidth: 400, width: '100%' }}>
        <Converter />
      </Paper>
    </Box>
  );
}


