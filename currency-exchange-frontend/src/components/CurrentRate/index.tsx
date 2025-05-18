import { BASE_URL } from "@/consts";
import { ExchangeRate } from "@/types/ExchangeRate.types";
import {
  Box,
  Button,
  CircularProgress,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useState, useEffect, useRef } from "react";

const INTERVAL_MS = 60_000;
const MANUAL_COOLDOWN = 10;

export default function CurrentRate() {
  const {
    data: exchange_rate,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useQuery<number>({
    queryKey: ["exchangeRate"],
    queryFn: async () => {
      const res = await axios.get<ExchangeRate>(
        `${BASE_URL}/exchange-rate`
      );
      return res.data.exchange_rate;
    },
    refetchInterval: INTERVAL_MS,
    refetchOnWindowFocus: true,
  });

  const [countdown, setCountdown] = useState(INTERVAL_MS / 1000);
  const wasFetching = useRef(isFetching);

  useEffect(() => {
    if (wasFetching.current && !isFetching) {
      setCountdown(INTERVAL_MS / 1000);
    }
    wasFetching.current = isFetching;
  }, [isFetching]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((currentTimer) => Math.max(currentTimer - 1, 0));
    }, 1_000);
    return () => clearInterval(timer);
  }, []);

  const [manualCooldown, setManualCooldown] = useState(0);
  
  useEffect(() => {
    if (manualCooldown <= 0) return;

    const timer = setInterval(() => {
      setManualCooldown((currentManualCooldown) => Math.max(currentManualCooldown - 1, 0));
    }, 1_000);
    return () => clearInterval(timer);
  }, [manualCooldown]);

  const handleManualRefresh = async () => {
    if (manualCooldown > 0 || isFetching) return;
    setManualCooldown(MANUAL_COOLDOWN);
    await refetch();
  };

  return (
    <Box mb={2} textAlign="center">
      <Typography variant="h6">Current Rate</Typography>

      {isLoading ? (
        <CircularProgress size={24} sx={{ mt: 1 }} />
      ) : isError ? (
        <Typography color="error" sx={{ mt: 1 }}>
          Service Unavailable. Please try again later.
        </Typography>
      ) : (
        <>
          <Typography sx={{ mt: 1, fontSize: "1.25rem" }}>
            {exchange_rate?.toFixed(4)} PLN / EUR
          </Typography>

          <Typography
            variant="caption"
            sx={{ display: "block", mt: 0.5 }}
          >
            Rate reload in {countdown}s
          </Typography>

          <Button
            variant="outlined"
            size="small"
            onClick={handleManualRefresh}
            disabled={isFetching || manualCooldown > 0}
            sx={{
              mt: 1,
              px: 1,
              py: 0.5,
              minWidth: 0,
              fontSize: '0.75rem',
            }}
          >
            {manualCooldown > 0
              ? `Wait ${manualCooldown}s`
              : "Refresh Now"}
          </Button>
        </>
      )}
    </Box>
  );
}
