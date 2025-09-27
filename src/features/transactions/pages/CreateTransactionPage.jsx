import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box, Typography, Paper } from '@mui/material';
import CreateTransactionForm from '../components/CreateTransactionForm';

const CreateTransactionPage = () => {
  const [searchParams] = useSearchParams();
  const tipo = searchParams.get('tipo') || 'ingreso';

  const title = {
    ingreso: 'Registrar Nuevo Ingreso',
    egreso: 'Registrar Nuevo Egreso',
    transferencia: 'Registrar Nueva Transferencia',
  }[tipo];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {title}
      </Typography>
      <Paper elevation={3} sx={{ p: 4 }}>
        <CreateTransactionForm tipo={tipo} />
      </Paper>
    </Box>
  );
};

export default CreateTransactionPage;
