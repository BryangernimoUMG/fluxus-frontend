import { Box, Button, Container, Paper, TextField, Typography, Link as MLink } from '@mui/material';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { forgotPassword } from '../services/authService';
import { ErrorBanner } from '../../../components/ErrorBanner';
import { Link } from 'react-router-dom';

const schema = z.object({ email: z.string().email('Email inválido') });

function ForgotForm() {
  const [apiError, setApiError] = useState('');
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm({ resolver: zodResolver(schema) });

  const onSubmit = async ({ email }) => {
    setApiError('');
    try {
      await forgotPassword(email);
      setSent(true); // mensaje neutro
    } catch (e) {
      // mantener respuesta neutra por seguridad
      setSent(true);
    }
  };

  return (
    <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)}>
      <Typography variant="h4" component="h2" fontWeight="bold" gutterBottom>
        Recuperar contraseña
      </Typography>

      {sent ? (
        <ErrorBanner severity="success" message="Si el email está registrado, enviamos instrucciones para restablecer tu contraseña." />
      ) : (
        <>
          <TextField
            fullWidth label="Correo electrónico" autoComplete="email"
            error={!!errors.email} helperText={errors.email?.message}
            {...register('email')}
          />
          <Button type="submit" variant="contained" sx={{ mt: 2 }} disabled={isSubmitting}>
            {isSubmitting ? 'Enviando…' : 'Enviar instrucciones'}
          </Button>
        </>
      )}

      {apiError && <ErrorBanner message={apiError} />}

      <Typography variant="body2" sx={{ mt: 3 }}>
        <MLink component={Link} to="/login" underline="hover">Volver a inicio de sesión</MLink>
      </Typography>
    </Box>
  );
}

export default function ForgotPage() {
  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 6 }}>
        <ForgotForm />
      </Paper>
    </Container>
  );
}
