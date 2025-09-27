import { Alert } from '@mui/material';

export function ErrorBanner({ message, severity = 'error', sx }) {
  if (!message) return null;
  return <Alert severity={severity} sx={{ mb: 2, ...sx }}>{message}</Alert>;
}
