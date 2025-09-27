import React from 'react';
import { AppBar, Toolbar, IconButton, Typography, Box, Avatar } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useAuth } from '../../contexts/AuthContext';

export const Header = ({ onMenuClick }) => {
    const { user } = useAuth();

    return (
        <AppBar
            position="fixed"
            sx={{
                backgroundColor: '#fff',
                color: 'text.primary',
                boxShadow: '0 1px 4px 0 rgba(0,0,0,0.1)',
            }}
        >
            <Toolbar>
                <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    edge="start"
                    onClick={onMenuClick}
                    sx={{ mr: 2 }}
                >
                    <MenuIcon />
                </IconButton>
                <Box sx={{ flexGrow: 1 }} />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar alt={user?.displayName || user?.email} src={user?.photoURL} sx={{ width: 32, height: 32 }} />
                    <Typography variant="subtitle2" fontWeight={600}>
                        {user?.displayName || user?.email}
                    </Typography>
                </Box>
            </Toolbar>
        </AppBar>
    );
};
