import { Card, CardContent, CardHeader, IconButton, Typography, Box, Chip, Tooltip } from '@mui/material';
import EditOutlined from '@mui/icons-material/EditOutlined';
import DeleteOutline from '@mui/icons-material/DeleteOutline';

function format(amount, currency) {
  if (amount == null) return '—';
  const n = Number(amount);
  if (!Number.isFinite(n)) return '—';
  try { return n.toLocaleString('es-GT', { style: 'currency', currency }); }
  catch { return `${currency} ${n.toFixed(2)}`; }
}

export default function WalletCard({ wallet, balance, onEdit, onDelete }) {
  return (
    <Card elevation={2} sx={{ borderRadius: 3 }}>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>{wallet.nombre}</Typography>
            <Chip size="small" label={wallet.moneda} />
          </Box>
        }
        action={
          <Box>
            <Tooltip title="Editar">
              <IconButton onClick={() => onEdit?.(wallet)}><EditOutlined /></IconButton>
            </Tooltip>
            <Tooltip title="Eliminar">
              <IconButton color="error" onClick={() => onDelete?.(wallet)}><DeleteOutline /></IconButton>
            </Tooltip>
          </Box>
        }
      />
      <CardContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: .5 }}>
          Tipo: <b>{wallet.tipo}</b>
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          {format(balance?.saldo_actual ?? null, wallet.moneda)}
        </Typography>
        {wallet.descripcion && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {wallet.descripcion}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
