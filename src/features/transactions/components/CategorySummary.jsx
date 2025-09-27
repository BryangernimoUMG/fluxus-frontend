import { Box, Card, CardContent, Typography, Grid, Icon } from '@mui/material';
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

const CategoryCard = styled(Card)(({ theme }) => ({
  minWidth: 200,
  marginRight: theme.spacing(2),
}));

export default function CategorySummary({ data }) {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" gutterBottom>
        Resumen por Categoría
      </Typography>
      <ScrollableContainer>
        {data.map((item) => (
          <CategoryCard key={item.categoria.id}>
            <CardContent>
              <Grid container spacing={1} alignItems="center">
                
                <Grid item>
                  <Typography variant="h6">{item.categoria.nombre}</Typography>
                </Grid>
              </Grid>
              <Typography variant="h5" component="div" sx={{ mt: 1 }}>
                ${parseFloat(item.total_base).toFixed(2)}
              </Typography>
              <Typography color="text.secondary">
                {item.count} {item.count === 1 ? 'transacción' : 'transacciones'}
              </Typography>
            </CardContent>
          </CategoryCard>
        ))}
      </ScrollableContainer>
    </Box>
  );
}
