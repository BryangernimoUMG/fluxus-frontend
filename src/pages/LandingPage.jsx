
import { Button, Container, Typography, Box, Card, CardContent, Grid, Chip, Divider, AppBar, Toolbar, Link, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SecurityIcon from '@mui/icons-material/Security';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import StarIcon from '@mui/icons-material/Star';

function LandingPage() {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login');
  };

  const handleRegister = () => {
    navigate('/register');
  };

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Box>
      <AppBar position="sticky" color="inherit" sx={{ boxShadow: 1 }}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <img src="https://cdn-icons-png.flaticon.com/512/567/567627.png" alt="Fluxus Logo" style={{ height: 40, marginRight: 16 }} />
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
              Fluxus
            </Typography>
          </Box>
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 3 }}>
            <Link component="button" variant="body1" onClick={() => scrollToSection('inicio')} sx={{ textDecoration: 'none', color: 'text.primary', fontWeight: 500 }}>
              Inicio
            </Link>
            <Link component="button" variant="body1" onClick={() => scrollToSection('planes')} sx={{ textDecoration: 'none', color: 'text.primary', fontWeight: 500 }}>
              Planes
            </Link>
            <Link component="button" variant="body1" onClick={() => scrollToSection('contactanos')} sx={{ textDecoration: 'none', color: 'text.primary', fontWeight: 500 }}>
              Contáctanos
            </Link>
          </Box>
        </Toolbar>
      </AppBar>

      <Container component="main" maxWidth="md" sx={{ py: 8 }}>
        <Grid container spacing={8} alignItems="center" justifyContent="center" id="inicio">
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'center', md: 'flex-start' }, textAlign: { xs: 'center', md: 'left' }, gap: 3 }}>
              <Chip icon={<SecurityIcon />} label="Seguridad de nivel bancario" color="primary" sx={{ fontWeight: 'bold', mb: 1 }} />
              <Typography component="h1" variant="h3" fontWeight={700} gutterBottom>
                Fluxus: Controla tus Finanzas con Seguridad Total
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                Gestiona tus gastos, ahorros e inversiones en una plataforma moderna, intuitiva y ultra segura. Tus datos están protegidos con cifrado de grado bancario y autenticación avanzada.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={handleLogin}
                  sx={{
                    px: 4,
                    py: 1.5,
                    borderRadius: 3,
                    boxShadow: 3,
                    fontWeight: 'bold',
                    textTransform: 'none',
                    fontSize: '1.1rem',
                    letterSpacing: 1,
                  }}
                  startIcon={<LockOutlinedIcon />}
                >
                  Iniciar sesión
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  size="large"
                  onClick={handleRegister}
                  sx={{
                    px: 4,
                    py: 1.5,
                    borderRadius: 3,
                    fontWeight: 'bold',
                    textTransform: 'none',
                    fontSize: '1.1rem',
                    borderWidth: 2,
                    letterSpacing: 1,
                    '&:hover': {
                      borderWidth: 2,
                    },
                  }}
                  startIcon={<MonetizationOnIcon />}
                >
                  Crear cuenta
                </Button>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={6} id="planes">
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Card sx={{ borderRadius: 4, boxShadow: 6, background: 'linear-gradient(135deg, #e3f2fd 60%, #fff 100%)' }}>
                <CardContent>
                  <Typography variant="h5" fontWeight={600} gutterBottom>
                    Elige tu plan
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ p: 2, border: '2px solid #90caf9', borderRadius: 3, background: '#f5fafd', minHeight: 170 }}>
                        <Typography variant="subtitle1" fontWeight={700} color="primary">
                          Gratuito
                        </Typography>
                        <Typography variant="h4" fontWeight={700} color="primary.main">
                          $0
                        </Typography>
                        <ul style={{ margin: 0, paddingLeft: 18 }}>
                          <li>Gestión básica de gastos e ingresos</li>
                          <li>Reportes mensuales</li>
                          <li>Seguridad avanzada</li>
                        </ul>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ p: 2, border: '2px solid #ffd600', borderRadius: 3, background: '#fffde7', minHeight: 170 }}>
                        <Typography variant="subtitle1" fontWeight={700} color="warning.main">
                          Premium <StarIcon fontSize="small" sx={{ verticalAlign: 'middle', ml: 0.5 }} />
                        </Typography>
                        <Typography variant="h4" fontWeight={700} color="warning.main">
                          $4.99 <span style={{ fontSize: 16 }}>/mes</span>
                        </Typography>
                        <ul style={{ margin: 0, paddingLeft: 18 }}>
                          <li>Todo lo del plan gratuito</li>
                          <li>Sincronización bancaria automática</li>
                          <li>Alertas inteligentes y presupuestos</li>
                          <li>Soporte prioritario</li>
                        </ul>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SecurityIcon color="primary" />
                <Typography variant="body1" color="text.secondary">
                  Tus datos están protegidos con cifrado AES-256 y autenticación de dos factores. En Fluxus, la seguridad es nuestra prioridad.
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 8 }} />

        <Grid container spacing={4} justifyContent="center" id="contactanos">
          <Grid item xs={12} md={8}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                Contáctanos
              </Typography>
              <Typography variant="h6" color="text.secondary">
                ¿Tienes alguna pregunta? No dudes en escribirnos.
              </Typography>
            </Box>
            <Card sx={{ p: { xs: 2, sm: 4 }, borderRadius: 4, boxShadow: 6, backgroundColor: 'rgba(255, 255, 255, 0.7)' }}>
              <form noValidate autoComplete="off">
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Nombre" variant="filled" sx={{ backgroundColor: 'rgba(241, 243, 244, 0.5)' }} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Correo electrónico" variant="filled" sx={{ backgroundColor: 'rgba(241, 243, 244, 0.5)' }} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField fullWidth label="Mensaje" variant="filled" multiline rows={4} sx={{ backgroundColor: 'rgba(241, 243, 244, 0.5)' }} />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      color="primary"
                      size="large"
                      fullWidth
                      sx={{
                        py: 1.5,
                        borderRadius: 3,
                        fontWeight: 'bold',
                        transition: 'transform 0.2s',
                        '&:hover': { transform: 'scale(1.02)' }
                      }}
                    >
                      Enviar Mensaje
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Card>
          </Grid>
        </Grid>
      </Container>

      <Box component="footer" sx={{ bgcolor: 'background.paper', py: 6, mt: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" align="center">
            {'Copyright © '}
            <Link color="inherit" href="https://mui.com/">
              Fluxus
            </Link>{' '}
            {new Date().getFullYear()}
            {'.'}
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}

export default LandingPage;
