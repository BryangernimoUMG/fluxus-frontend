import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box, Typography, Paper } from '@mui/material';
import CreateTransactionForm from '../components/CreateTransactionForm';

const CreateTransactionPage = () => {
  const [searchParams] = useSearchParams();
  const tipo = searchParams.get('tipo') || 'ingreso';
  const id = searchParams.get('id');

  const title = id
    ? {
        ingreso: 'Editar Ingreso',
        egreso: 'Editar Egreso',
        transferencia: 'Editar Transferencia',
      }[tipo]
    : {
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
        <CreateTransactionForm tipo={tipo} transactionId={id || undefined} />
      </Paper>
    </Box>
  );
};

export default CreateTransactionPage;
