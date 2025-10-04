import { Box, Button, Container, Paper, TextField, Typography, MenuItem, InputLabel, FormControl, Select, Link as MLink } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import RegisterImage from '../assets/image-register.jpeg';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState } from 'react';
import { register as registerService } from '../services/authService';
import { ErrorBanner } from '../../../components/ErrorBanner';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import PasswordRequirements from '../../../components/PasswordRequirements';
import { isPasswordStrong } from '../../../utils/passwordValidation';

const passwordRequirements = {
  minLength: 12,
  messages: {
    minLength: 'Debe tener al menos 12 caracteres',
    upper: 'Debe incluir al menos una letra mayúscula',
    lower: 'Debe incluir al menos una letra minúscula',
    number: 'Debe incluir al menos un número',
    special: 'Debe incluir al menos un caracter especial',
  },
};

const schema = z.object({
  fullName: z.string().min(2, 'Tu nombre es requerido'),
  email: z.string().email('Email inválido'),
  password: z
    .string()
    .superRefine((val, ctx) => {
      if (!val || val.length < passwordRequirements.minLength) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: passwordRequirements.messages.minLength,
          path: ['password'],
        });
      }
      if (!/[A-Z]/.test(val)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: passwordRequirements.messages.upper, path: ['password'] });
      }
      if (!/[a-z]/.test(val)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: passwordRequirements.messages.lower, path: ['password'] });
      }
      if (!/[0-9]/.test(val)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: passwordRequirements.messages.number, path: ['password'] });
      }
      if (!/[^A-Za-z0-9]/.test(val)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: passwordRequirements.messages.special, path: ['password'] });
      }
    }),
  birthDate: z.string().min(1, 'Selecciona tu fecha'),
  experience: z.enum(['beginner', 'intermediate', 'advanced'], {
    required_error: 'Selecciona tu experiencia',
  }),
  currency: z.enum(['GTQ', 'USD'], { required_error: 'Selecciona tu moneda' }),
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
    defaultValues: { experience: '', currency: '' },
  });

  const passwordValue = watch('password') || '';
  const canSubmit = useMemo(() => isPasswordStrong(passwordValue), [passwordValue]);

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
        <PasswordRequirements password={passwordValue} />
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

        <FormControl fullWidth error={!!errors.currency}>
          <InputLabel id="currency-label">Moneda base</InputLabel>
          <Select
            labelId="currency-label"
            label="Moneda base"
            value={watch('currency')}
            onChange={(e) => setValue('currency', e.target.value, { shouldValidate: true })}
          >
            <MenuItem value="GTQ">GTQ</MenuItem>
            <MenuItem value="USD">USD</MenuItem>
          </Select>
          <Typography variant="caption" color="error">
            {errors.currency?.message}
          </Typography>
        </FormControl>

        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          sx={{ py: 1.5, fontWeight: 'bold', mt: 2 }}
          disabled={isSubmitting || !canSubmit}
        >
          {isSubmitting ? 'Creando…' : 'Registrarse'}
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
          {/* Start the form at the top on desktop to avoid initial mid-content scroll */}
          <Box sx={{ width: '50%', height: '100%', p: { xs: 2, sm: 4, md: 6 }, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', overflowY: 'auto' }}>
            <RegisterForm />
          </Box>
          <Box sx={{ width: '50%', height: '100%', backgroundImage: `url(${RegisterImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        </Paper>
      </Container>
    </Box>
  );
};

export default RegisterPage;
