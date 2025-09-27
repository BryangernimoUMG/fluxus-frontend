import React, { useState } from 'react';
import { Box, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../Sidebar/sidebar';
import { Header } from '../Header/Header';

const DRAWER_WIDTH = 240;
const MOBILE_BREAKPOINT = 'md'; // Umbral para cambiar a mobile (lg = 1200px, md = 960px, sm = 600px)

export const Layout = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down(MOBILE_BREAKPOINT));
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleMobileMenuToggle = () => {
        setMobileMenuOpen(!isMobileMenuOpen);
    };

    const handleMobileMenuClose = () => {
        setMobileMenuOpen(false);
    };

    return (
        <Box sx={{ display: 'flex' }}>
            {isMobile && <Header onMenuClick={handleMobileMenuToggle} />}

            <Sidebar
                variant={isMobile ? 'temporary' : 'permanent'}
                open={isMobile ? isMobileMenuOpen : true}
                onClose={handleMobileMenuClose}
            />

            {/* Contenido principal */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: '25px', // Padding de 25px en todos los lados
                    width: {
                        [theme.breakpoints.up(MOBILE_BREAKPOINT)]: `calc(100% - ${DRAWER_WIDTH}px)`,
                    },
                    ml: {
                        [theme.breakpoints.up(MOBILE_BREAKPOINT)]: `${DRAWER_WIDTH}px`,
                    },
                }}
            >
                {/* Este Toolbar compensa la altura del Header en mobile */}
                {isMobile && <Toolbar />}
                <Outlet />
            </Box>
        </Box>
    );
};
