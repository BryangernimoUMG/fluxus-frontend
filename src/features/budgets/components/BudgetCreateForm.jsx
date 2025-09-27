import { useState } from 'react';
import {
    Box, Paper, Grid, TextField, InputLabel, FormControl,
    Select, MenuItem, Button, Typography
} from '@mui/material';

const COLOR_OPTIONS = [
    { value: '#8CCDEB', label: 'Celeste' },
    { value: '#725CAD', label: 'Morado' },
    { value: '#E62727', label: 'Rojo' },
    { value: '#2F80ED', label: 'Azul' },
    { value: '#3DB36B', label: 'Verde' },
    { value: '#F5C044', label: 'Amarillo' }
];

// NUEVO: opciones de tipo
const TIPO_OPTIONS = [
    { value: 'ingreso', label: 'Ingreso' },
    { value: 'egreso', label: 'Egreso' },
    { value: 'transferencia', label: 'Transferencia' },
];

export default function BudgetCreateForm({ onCreate }) {
    const [nombre, setNombre] = useState('');
    const [tipo, setTipo] = useState('');
    const [color, setColor] = useState('');

    const isValid =
        nombre.trim().length > 0 &&
        tipo.trim().length > 0 &&
        color;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!isValid) return;

        onCreate?.({
            nombre: nombre.trim(),
            tipo: tipo.trim(),      // 'ingreso' | 'egreso' | 'transferencia'
            color,
            // icono lo agregamos luego
        });

        // Limpieza opcional
        setNombre('');
        setTipo('');
        setColor('');
    };

    return (
        <Paper
            elevation={0}
            sx={{ p: 3, borderRadius: 2, bgcolor: '#fff' }}
            component="form"
            onSubmit={handleSubmit}
        >
            <Grid container alignItems="center" spacing={3}>
                {/* Nombre */}
                <Grid item xs={12} md={4}>
                    <InputLabel sx={{ color: 'primary.main', mb: 0.5 }}>
                        Nombre de nuevo presupuesto
                    </InputLabel>

                    <TextField
                        variant="standard"
                        fullWidth
                        placeholder="Presupuesto..."
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        inputProps={{ maxLength: 50 }}
                        autoComplete="off"
                        sx={{
                            '& .MuiInputBase-input::placeholder': { color: '#c2cfe0', opacity: 1 },
                            '& .MuiInputBase-input': { color: '#334d6e' },
                        }}
                    />
                </Grid>

                {/* Tipo (Select) */}
                <Grid item xs={12} md={3}>
                    <InputLabel sx={{ color: 'primary.main', mb: 0.5 }}>
                        Tipo
                    </InputLabel>

                    <FormControl variant="standard" fullWidth>
                        <Select
                            value={tipo}
                            onChange={(e) => setTipo(e.target.value)}
                            displayEmpty
                            renderValue={(selected) => {
                                if (!selected) return <Typography sx={{ color: '#c2cfe0' }}>Tipo...</Typography>;
                                const opt = TIPO_OPTIONS.find(o => o.value === selected);
                                return <Typography sx={{ color: '#334d6e' }}>{opt?.label ?? selected}</Typography>;
                            }}
                            sx={{ '& .MuiSvgIcon-root': { color: 'primary.main' } }}
                        >
                            {TIPO_OPTIONS.map(opt => (
                                <MenuItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>

                {/* Color */}
                <Grid item xs={12} md={3}>
                    <InputLabel sx={{ color: 'primary.main', mb: 0.5 }}>
                        Color
                    </InputLabel>

                    <FormControl variant="standard" fullWidth>
                        <Select
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            displayEmpty
                            renderValue={(selected) => {
                                if (!selected) {
                                    return (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: '#9e9e9e' }} />
                                            <Typography sx={{ color: '#c2cfe0' }}>Color...</Typography>
                                        </Box>
                                    );
                                }
                                const opt = COLOR_OPTIONS.find(o => o.value === selected);
                                return (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: selected }} />
                                        <Typography sx={{ color: '#334d6e' }}>{opt?.label}</Typography>
                                    </Box>
                                );
                            }}
                            sx={{ '& .MuiSvgIcon-root': { color: 'primary.main' } }}
                        >
                            {COLOR_OPTIONS.map(opt => (
                                <MenuItem key={opt.value} value={opt.value}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: opt.value }} />
                                        <Typography>{opt.label}</Typography>
                                    </Box>
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>

                {/* Botón Crear */}
                <Grid item xs={12} md={2} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                    <Button type="submit" variant="contained" size="medium" disabled={!isValid}>
                        Crear
                    </Button>
                </Grid>
            </Grid>
        </Paper>
    );
}
