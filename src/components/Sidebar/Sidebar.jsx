import React from 'react';
import {
    Drawer, Box, List, ListItemButton, ListItemIcon, ListItemText,
    Toolbar, Avatar, Typography, Divider
} from '@mui/material';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useTheme, alpha } from '@mui/material/styles';

import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';

import { NAV_ITEMS } from '../../constants/navItems';
import { useAuth } from '../../contexts/AuthContext';
import { logout } from '../../features/auth/services/authService';

const DRAWER_WIDTH = 240;

const iconByLabel = {
    Dashboard: DashboardOutlinedIcon,
    Wallets: AccountBalanceWalletOutlinedIcon,
    Transacciones: ReceiptLongOutlinedIcon,
    Presupuestos: AccountBalanceWalletOutlinedIcon,
    Reportes: AssessmentOutlinedIcon,
    Configuración: SettingsOutlinedIcon,
};

export const Sidebar = ({ variant = 'permanent', open, onClose }) => {
    const theme = useTheme();
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();

    const isOnSettings = location.pathname.startsWith('/configuracion');

    const handleNavigation = (path) => {
        navigate(path);
        if (variant === 'temporary' && onClose) {
            onClose();
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            if (onClose) onClose();
            navigate('/login');
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    };

    const drawerContent = (
        <>
            <Toolbar />

            {/* Bloque usuario -> link a Configuración */}
            <Box
                onClick={() => handleNavigation('/configuracion')}
                role="button"
                tabIndex={0}
                sx={{
                    cursor: 'pointer',
                    px: 2,
                    py: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    mx: 2,
                    mb: 1,
                    borderRadius: 2,
                    textDecoration: 'none',
                    color: 'inherit',
                    backgroundColor: isOnSettings ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                    '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.06),
                    },
                }}
            >
                <Avatar alt={user?.displayName || user?.email} src={user?.photoURL} sx={{ width: 40, height: 40 }} />
                <Box>
                    <Typography variant="subtitle1" fontWeight={600}>
                        {user?.displayName || 'Usuario'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {user?.email}
                    </Typography>
                </Box>
            </Box>

            {/* Menú principal */}
            <List sx={{ px: 1 }}>
                {NAV_ITEMS.filter(i => i.label !== 'Configuración').map((item) => {
                    const Icon = iconByLabel[item.label] || DashboardOutlinedIcon;
                    return (
                        <ListItemButton
                            key={item.to}
                            component={NavLink}
                            to={item.to}
                            onClick={onClose} // Cierra el menú en mobile al hacer clic
                            end
                            className={({ isActive }) => (isActive ? 'Mui-selected' : undefined)}
                            sx={{
                                borderRadius: 1.5,
                                mb: 0.5,
                                '&.Mui-selected': {
                                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                                    color: theme.palette.texts.default,
                                },
                                '&.Mui-selected .MuiListItemIcon-root': {
                                    color: theme.palette.texts.default,
                                },
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 36 }}>
                                <Icon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText
                                primary={item.label}
                                primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }}
                            />
                        </ListItemButton>
                    );
                })}
            </List>

            <Divider sx={{ my: 1.5 }} />

            {/* Configuración (en lista) */}
            <List sx={{ px: 1 }}>
                <ListItemButton
                    component={NavLink}
                    to="/configuracion"
                    onClick={onClose} // Cierra el menú en mobile al hacer clic
                    end
                    className={({ isActive }) => (isActive ? 'Mui-selected' : undefined)}
                    sx={{
                        borderRadius: 1.5,
                        mb: 0.5,
                        '&.Mui-selected': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.08),
                            color: theme.palette.primary.main,
                        },
                        '&.Mui-selected .MuiListItemIcon-root': {
                            color: theme.palette.primary.main,
                        },
                    }}
                >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                        <SettingsOutlinedIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                        primary="Configuración"
                        primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }}
                    />
                </ListItemButton>

                {/* Cerrar sesión (no debe marcarse como 'selected') */}
                <ListItemButton
                    onClick={handleLogout}
                    sx={{
                        borderRadius: 1.5,
                        mb: 0.5,
                        color: 'error.main',
                        '& .MuiListItemIcon-root': { color: 'error.main' },
                        '&:hover': { backgroundColor: alpha(theme.palette.error.main, 0.06) },
                    }}
                >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                        <LogoutOutlinedIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                        primary="Cerrar Sesión"
                        primaryTypographyProps={{ fontSize: 14, fontWeight: 600 }}
                    />
                </ListItemButton>
            </List>
        </>
    );

    return (
        <Drawer
            variant={variant}
            open={open}
            onClose={onClose}
            sx={{
                width: DRAWER_WIDTH,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: DRAWER_WIDTH,
                    boxSizing: 'border-box',
                    borderRight: 'none',
                    backgroundColor: '#fff',
                    overflowY: 'auto', // Permite scroll si el contenido es muy largo
                },
            }}
        >
            {drawerContent}
        </Drawer>
    );
};
