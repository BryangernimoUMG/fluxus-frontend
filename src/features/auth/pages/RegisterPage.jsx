import { Box, Button, Container, Paper, TextField, Typography, MenuItem, InputLabel, FormControl, Select, Link as MLink } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import RegisterImage from '../assets/image-register.jpeg';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { register as registerService } from '../services/authService';
import { ErrorBanner } from '../../../components/ErrorBanner';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const schema = z.object({
  fullName: z.string().min(2, 'Tu nombre es requerido'),
  email: z.string().email('Email inválido'),
  password: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Incluye una mayúscula')
    .regex(/[0-9]/, 'Incluye un número'),
  birthDate: z.string().min(1, 'Selecciona tu fecha'),
  experience: z.enum(['beginner', 'intermediate', 'advanced'], {
    required_error: 'Selecciona tu experiencia',
  }),
  currency: z.string().length(3, 'Código de moneda (3 letras, ej. GTQ, USD)'),
});

function RegisterForm() {
  const navigate = useNavigate();
  const [apiError, setApiError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { experience: '' },
  });

  const onSubmit = async (values) => {
    setApiError('');
    try {
      const userData = {
        nombre: values.fullName,
        moneda_base: values.currency.toUpperCase(),
        configuraciones: {
          experience: values.experience,
          birthDate: values.birthDate,
        },
      };
      await registerService(values.email, values.password, userData);
      // Informamos que se envió correo de verificación
      await Swal.fire({
        icon: 'success',
        title: 'Cuenta creada',
        text: 'Te enviamos un correo para verificar tu cuenta. Revisa tu bandeja de entrada y la carpeta de spam.',
        confirmButtonText: 'Continuar',
      });
      navigate('/dashboard');
    } catch (e) {
      setApiError(e.message || 'No se pudo crear la cuenta');
    }
  };

  return (
    <Box component="form" noValidate sx={{ width: '100%' }} onSubmit={handleSubmit(onSubmit)}>
      <Typography variant="h4" component="h2" fontWeight="bold" gutterBottom>
        Crea tu cuenta
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Empieza a transformar tus finanzas hoy mismo.
      </Typography>

      <ErrorBanner message={apiError} />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          fullWidth
          label="Nombre completo"
          error={!!errors.fullName}
          helperText={errors.fullName?.message}
          {...register('fullName')}
        />
        <TextField
          fullWidth
          label="Correo electrónico"
          autoComplete="email"
          error={!!errors.email}
          helperText={errors.email?.message}
          {...register('email')}
        />
        <TextField
          fullWidth
          label="Contraseña"
          type="password"
          autoComplete="new-password"
          error={!!errors.password}
          helperText={errors.password?.message}
          {...register('password')}
        />
        <TextField
          fullWidth
          label="Fecha de nacimiento"
          type="date"
          InputLabelProps={{ shrink: true }}
          error={!!errors.birthDate}
          helperText={errors.birthDate?.message}
          {...register('birthDate')}
        />
        <FormControl fullWidth error={!!errors.experience}>
          <InputLabel id="experience-label">Experiencia en gestión de gastos</InputLabel>
          <Select
            labelId="experience-label"
            label="Experiencia en gestión de gastos"
            value={watch('experience')}
            onChange={(e) => setValue('experience', e.target.value, { shouldValidate: true })}
          >
            <MenuItem value="beginner">Principiante</MenuItem>
            <MenuItem value="intermediate">Intermedio</MenuItem>
            <MenuItem value="advanced">Avanzado</MenuItem>
          </Select>
          <Typography variant="caption" color="error">
            {errors.experience?.message}
          </Typography>
        </FormControl>

        <TextField
          fullWidth
          label="Moneda base (GTQ, USD, MXN, etc.)"
          placeholder="GTQ"
          error={!!errors.currency}
          helperText={errors.currency?.message}
          {...register('currency')}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          sx={{ py: 1.5, fontWeight: 'bold', mt: 2 }}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creando…' : 'Registrarse'}
        </Button>
        <Button fullWidth variant="outlined" startIcon={<GoogleIcon />} sx={{ py: 1.5 }}>
          Registrarse con Google
        </Button>
      </Box>

      <Typography variant="body2" align="center" sx={{ mt: 3 }}>
        ¿Ya tienes una cuenta?{' '}
        <MLink component={Link} to="/login" fontWeight="bold" underline="hover">
          Inicia sesión
        </MLink>
      </Typography>
    </Box>
  );
}

const RegisterPage = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#f0f2f5',
        '@media (min-width: 900px)': {
          background: 'linear-gradient(to top, #003153, #ffffff)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        },
      }}
    >
      {/* MOBILE */}
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        <Box
          sx={{
            height: '35vh',
            backgroundImage: `url(${RegisterImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            textAlign: 'center',
            p: 2,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backgroundBlendMode: 'overlay',
            borderBottomLeftRadius: 25,
            borderBottomRightRadius: 25,
          }}
        >
          <Typography variant="h4" component="h1" fontWeight="bold">
            Toma el control de tu futuro financiero.
          </Typography>
        </Box>
        <Container maxWidth="sm" sx={{ p: 3 }}>
          <RegisterForm />
        </Container>
      </Box>

      {/* DESKTOP */}
      <Container maxWidth="lg" sx={{ display: { xs: 'none', md: 'flex' }, height: '100vh', alignItems: 'center' }}>
        <Paper elevation={12} sx={{ borderRadius: 4, overflow: 'hidden', width: '100%', height: '80vh', display: 'flex' }}>
          <Box sx={{ width: '50%', height: '100%', p: { xs: 2, sm: 4, md: 6 }, display: 'flex', flexDirection: 'column', justifyContent: 'center', overflowY: 'auto' }}>
            <RegisterForm />
          </Box>
          <Box sx={{ width: '50%', height: '100%', backgroundImage: `url(${RegisterImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        </Paper>
      </Container>
    </Box>
  );
};

export default RegisterPage;
