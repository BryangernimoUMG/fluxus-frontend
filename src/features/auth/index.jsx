import { Box, Button, Container, Grid, Paper, Select, TextField, Typography, MenuItem, InputLabel, FormControl } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import AuthImage from './assets/image-auth.png';

const AuthPage = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        // Mobile background
        backgroundColor: '#f0f2f5',
        // Desktop background with gradient
        '@media (min-width: 900px)': {
          background: 'linear-gradient(to top, #003153, #ffffff)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        },
      }}
    >
      {/* --- MOBILE VIEW --- */}
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

      {/* --- DESKTOP VIEW --- */}
      <Container maxWidth="lg" sx={{ display: { xs: 'none', md: 'flex' } }}>
        <Paper
          elevation={12}
          sx={{
            display: 'flex',
            borderRadius: 4,
            overflow: 'hidden',
            width: '100%',
            minHeight: '80vh',
          }}
        >
          <Grid container>
            <Grid
              item
              md={6}
              sx={{
                backgroundImage: `url(${AuthImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
            <Grid item xs={12} md={6} sx={{ p: { xs: 2, sm: 4, md: 6 }, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <RegisterForm />
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};

const RegisterForm = () => {
  return (
    <Box component="form" noValidate>
      <Typography variant="h4" component="h2" fontWeight="bold" gutterBottom>
        Crea tu cuenta
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Empieza a transformar tus finanzas hoy mismo.
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            required
            label="Nombre completo"
            name="fullName"
            autoComplete="name"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            required
            label="Correo electrónico"
            name="email"
            autoComplete="email"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            required
            label="Contraseña"
            name="password"
            type="password"
            autoComplete="new-password"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            required
            label="Fecha de nacimiento"
            name="birthDate"
            type="date"
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth required>
            <InputLabel id="experience-label">Experiencia en gestión de gastos</InputLabel>
            <Select
              labelId="experience-label"
              label="Experiencia en gestión de gastos"
              defaultValue=""
            >
              <MenuItem value="beginner">Principiante</MenuItem>
              <MenuItem value="intermediate">Intermedio</MenuItem>
              <MenuItem value="advanced">Avanzado</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ py: 1.5, fontWeight: 'bold', mt: 2 }}
          >
            Registrarse
          </Button>
        </Grid>
        <Grid item xs={12}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<GoogleIcon />}
            sx={{ py: 1.5 }}
          >
            Registrarse con Google
          </Button>
        </Grid>
      </Grid>
      <Typography variant="body2" align="center" sx={{ mt: 3 }}>
        ¿Ya tienes una cuenta?{' '}
        <Typography component="a" href="/login" fontWeight="bold" sx={{ textDecoration: 'none' }}>
          Inicia sesión
        </Typography>
      </Typography>
    </Box>
  );
};

export default AuthPage;
