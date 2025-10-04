import { Card, CardContent, CardHeader, Box, Skeleton } from '@mui/material';

export default function WalletCardSkeleton() {
  return (
    <Card elevation={2} sx={{ borderRadius: 3 }}>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
            <Skeleton variant="text" width="60%" height={28} />
            <Skeleton variant="rounded" width={44} height={22} sx={{ borderRadius: 999 }} />
          </Box>
        }
        action={<Skeleton variant="circular" width={32} height={32} />}
      />
      <CardContent>
        <Skeleton variant="text" width={120} height={18} sx={{ mb: 0.5 }} />
        <Skeleton variant="text" width={160} height={30} />
        <Skeleton variant="text" width="90%" height={18} sx={{ mt: 1 }} />
      </CardContent>
    </Card>
  );
}
