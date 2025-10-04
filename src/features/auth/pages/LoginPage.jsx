import { Box, Button, Container, Paper, TextField, Typography, Link as MLink } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import AuthImage from '../assets/image-auth.png';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import Swal from 'sweetalert2';
import MfaOtpDialog from '../components/MfaOtpDialog';

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

function LoginForm() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });
  const { user, login } = useAuth();
  const [mfaResolver, setMfaResolver] = useState(null);
  const [mfaOpen, setMfaOpen] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const onSubmit = async (values) => {
    try {
      await login(values.email, values.password);
      navigate('/dashboard');
    } catch (e) {
      if (e?.code === 'mfa-required' && e?.resolver) {
        setMfaResolver(e.resolver);
        setMfaOpen(true);
        return;
      }
      Swal.fire({
        icon: 'error',
        title: 'Error de autenticación',
        text: e.message || 'Ocurrió un error al intentar iniciar sesión.',
      });
    }
  };

  return (
    <>
    <Box component="form" noValidate sx={{ width: '100%' }} onSubmit={handleSubmit(onSubmit)}>
      <Typography variant="h4" component="h2" fontWeight="bold" gutterBottom>
        Iniciar Sesión
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Accede a tu cuenta para continuar.
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 3 }}>
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
          autoComplete="current-password"
          error={!!errors.password}
          helperText={errors.password?.message}
          {...register('password')}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          sx={{ py: 1.5, fontWeight: 'bold', mt: 2 }}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Ingresando…' : 'Iniciar Sesión'}
        </Button>
        
        {/* <Button fullWidth variant="outlined" startIcon={<GoogleIcon />} sx={{ py: 1.5 }}>
          Continuar con Google
        </Button> */}
      </Box>

      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
        <MLink component={Link} to="/forgot" underline="hover">
          ¿Olvidaste tu contraseña?
        </MLink>
        <Typography variant="body2">
          ¿No tienes una cuenta?{' '}
          <MLink component={Link} to="/register" fontWeight="bold" underline="hover">
            Regístrate
          </MLink>
        </Typography>
      </Box>
    </Box>
    <MfaOtpDialog
      open={mfaOpen}
      resolver={mfaResolver}
      onClose={() => setMfaOpen(false)}
      onSuccess={() => {
        setMfaOpen(false);
        navigate('/dashboard');
      }}
    />
    </>
  );
}

const LoginPage = () => {
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
            backgroundImage: `url(${AuthImage})`,
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
            Bienvenido de nuevo.
          </Typography>
        </Box>
        <Container maxWidth="sm" sx={{ p: 3 }}>
          <LoginForm />
        </Container>
      </Box>

      {/* DESKTOP */}
      <Container maxWidth="lg" sx={{ display: { xs: 'none', md: 'flex' }, height: '100vh', alignItems: 'center' }}>
        <Paper elevation={12} sx={{ borderRadius: 4, overflow: 'hidden', width: '100%', height: '80vh', display: 'flex' }}>
          <Box sx={{ width: '50%', height: '100%', backgroundImage: `url(${AuthImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
          <Box sx={{ width: '50%', height: '100%', p: { xs: 2, sm: 4, md: 6 }, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <LoginForm />
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage;
