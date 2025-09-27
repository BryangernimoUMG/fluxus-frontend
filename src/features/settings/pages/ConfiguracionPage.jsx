import { Typography, Box, Divider } from '@mui/material';
import ChangePasswordForm from '../components/ChangePasswordForm';
import UpdateProfileForm from '../components/UpdateProfileForm';

export default function ConfiguracionPage() {
    return (
        <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
            <Typography variant="h4" gutterBottom>
                Configuración
            </Typography>
            <UpdateProfileForm />
            
            <Divider sx={{ my: 4 }} />
            <ChangePasswordForm />
            
        </Box>
    );
}
