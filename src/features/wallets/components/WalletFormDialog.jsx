import { useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, TextField, MenuItem } from '@mui/material';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const tipos = ['efectivo', 'banco', 'tarjeta_credito', 'inversion', 'otro'];
const monedas = ['GTQ', 'USD'];

const schema = z.object({
  nombre: z.string().min(1, 'Requerido'),
  tipo: z.enum(tipos, { required_error: 'Selecciona un tipo' }),
  moneda: z.enum(monedas, { required_error: 'Selecciona una moneda' }),
  saldo_inicial: z
    .union([z.string(), z.number()])
    .optional()
    .transform(v => (v === '' || v == null ? undefined : Number(v)))
    .refine(v => v == null || Number.isFinite(v), 'Número inválido'),
  descripcion: z.string().max(300).optional(),
});

export default function WalletFormDialog({ open, onClose, onSubmit, initialValues }) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { nombre: '', tipo: '', moneda: '', saldo_inicial: '', descripcion: '' },
  });

  useEffect(() => { reset(initialValues || {}); }, [initialValues, reset]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{initialValues ? 'Editar Wallet' : 'Nueva Wallet'}</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: 0 }}>
          <Grid item xs={12} md={6}>
            <TextField label="Nombre" fullWidth error={!!errors.nombre} helperText={errors.nombre?.message} {...register('nombre')} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField select label="Tipo" fullWidth error={!!errors.tipo} helperText={errors.tipo?.message} {...register('tipo')}>
              {tipos.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField select label="Moneda" fullWidth error={!!errors.moneda} helperText={errors.moneda?.message} {...register('moneda')}>
              {monedas.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField label="Saldo inicial" type="number" fullWidth
              error={!!errors.saldo_inicial} helperText={errors.saldo_inicial?.message} {...register('saldo_inicial')} />
          </Grid>
          <Grid item xs={12}>
            <TextField label="Descripción" fullWidth multiline minRows={2} {...register('descripcion')} />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
          {initialValues ? 'Guardar cambios' : 'Crear'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
