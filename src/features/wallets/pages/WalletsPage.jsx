import { useEffect, useMemo, useState } from 'react';
import { Box, Typography, Grid, Button, Snackbar, Alert, Paper, Stack, Divider } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import WalletCard from '../components/WalletCard';
import WalletFormDialog from '../components/WalletFormDialog';
import { listWallets, createWallet, updateWallet, deleteWallet, getAllBalances } from '../services/walletsService';

function useBalancesMap(balances) {
  return useMemo(() => {
    const byId = new Map();
    (balances?.cuentas || []).forEach(b => { byId.set(b.cuenta_id, b); });
    return byId;
  }, [balances]);
}

export default function WalletsPage() {
  const [items, setItems] = useState([]);
  const [balances, setBalances] = useState(null);
  const [dialog, setDialog] = useState({ open: false, initial: null });
  const [snack, setSnack] = useState({ open: false, type: 'success', msg: '' });
  const balancesMap = useBalancesMap(balances);

  const show = (type, msg) => setSnack({ open: true, type, msg });

  async function fetchAll() {
    const [a, b] = await Promise.all([listWallets({ pageSize: 100 }), getAllBalances()]);
    if (!a.ok) show('error', a.error.message);
    else setItems(a.data);
    if (!b.ok) show('error', b.error.message);
    else setBalances(b.data);
  }

  useEffect(() => { fetchAll(); }, []);

  const handleCreate = async (payload) => {
    const res = await createWallet(payload);
    if (!res.ok) return show('error', res.error.message);
    show('success', 'Wallet creada');
    setDialog({ open: false, initial: null });
    fetchAll();
  };

  const handleEdit = async (payload) => {
    const res = await updateWallet(dialog.initial.id, payload);
    if (!res.ok) return show('error', res.error.message);
    show('success', 'Wallet actualizada');
    setDialog({ open: false, initial: null });
    fetchAll();
  };

  const handleDelete = async (wallet) => {
    if (!window.confirm(`¿Eliminar la wallet "${wallet.nombre}"?`)) return;
    const res = await deleteWallet(wallet.id);
    if (!res.ok) return show('error', res.error.message);
    show('success', 'Wallet eliminada');
    fetchAll();
  };

  const totals = balances?.totales || [];

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4">Wallets</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialog({ open: true, initial: null })}>
          Nueva Wallet
        </Button>
      </Box>

      {/* (Deseable) ResumenBalances */}
      <Paper sx={{ p: 2, borderRadius: 3, mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Resumen de saldos por moneda</Typography>
        {totals.length === 0 ? (
          <Typography color="text.secondary">Sin saldos aún.</Typography>
        ) : (
          <Stack direction="row" divider={<Divider orientation="vertical" flexItem />} spacing={2}>
            {totals.map(t => (
              <Box key={t.moneda}>
                <Typography variant="caption" color="text.secondary">Total en</Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  {new Intl.NumberFormat('es-GT', { style: 'currency', currency: t.moneda }).format(Number(t.total))}
                </Typography>
              </Box>
            ))}
          </Stack>
        )}
      </Paper>

      <Grid container spacing={2}>
        {items.length === 0 ? (
          <Grid item xs={12}><Typography color="text.secondary">No hay wallets creadas.</Typography></Grid>
        ) : (
          items.map(w => (
            <Grid key={w.id} item xs={12} sm={6} md={4} lg={3}>
              <WalletCard
                wallet={w}
                balance={balancesMap.get(w.id)}
                onEdit={(it) => setDialog({ open: true, initial: it })}
                onDelete={handleDelete}
              />
            </Grid>
          ))
        )}
      </Grid>

      <WalletFormDialog
        open={dialog.open}
        initialValues={dialog.initial}
        onClose={() => setDialog({ open: false, initial: null })}
        onSubmit={dialog.initial ? handleEdit : handleCreate}
      />

      <Snackbar open={snack.open} autoHideDuration={2800} onClose={() => setSnack(s => ({ ...s, open: false }))}>
        <Alert severity={snack.type} onClose={() => setSnack(s => ({ ...s, open: false }))}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
