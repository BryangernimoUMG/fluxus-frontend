import { Box, Card, CardContent, Typography, Grid } from '@mui/material';
import { styled } from '@mui/system';

const ScrollableContainer = styled(Box)({
  display: 'flex',
  overflowX: 'auto',
  paddingBottom: '16px',
  '&::-webkit-scrollbar': {
    height: '8px',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: '4px',
  },
});

const AccountCard = styled(Card)(({ theme }) => ({
  minWidth: 220,
  marginRight: theme.spacing(2),
}));

export default function AccountSummary({ data }) {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" gutterBottom>
        Resumen por Cuenta
      </Typography>
      <ScrollableContainer>
        {data.map((item) => (
          <AccountCard key={item.cuenta.id}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item>
                  <Typography variant="h6">{item.cuenta.nombre}</Typography>
                </Grid>
              </Grid>
              <Typography variant="h5" component="div" sx={{ mt: 1 }}>
                {item.cuenta.moneda} {parseFloat(item.total_base).toFixed(2)}
              </Typography>
              <Typography color="text.secondary">
                {item.count} {item.count === 1 ? 'transacción' : 'transacciones'}
              </Typography>
            </CardContent>
          </AccountCard>
        ))}
      </ScrollableContainer>
    </Box>
  );
}
