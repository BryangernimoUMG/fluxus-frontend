import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography,
    useTheme, useMediaQuery, Card, CardContent, Box, Chip, IconButton, Tooltip, Stack, Divider
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { deleteTransaction } from '../services/transactionsService';

const TransactionRow = ({ transaction, onDeleted }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const navigate = useNavigate();

    const {
        tipo,
        monto,
        moneda,
        descripcion,
        fecha,
        categorias,
        cuentas_transacciones_cuenta_idTocuentas: cuenta,
    } = transaction;

    const formattedDate = new Date(fecha).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    const amountColor = tipo === 'ingreso' ? 'success.main' : 'error.main';
    const amountSign = tipo === 'ingreso' ? '+' : '-';

    const goToEdit = () => {
        // Navigate to create page in edit mode using query params
        navigate(`/transacciones/crear?tipo=${tipo}&id=${transaction.id}`);
    };

    const confirmDelete = async () => {
        const result = await Swal.fire({
            title: '¿Eliminar transacción?',
            text: 'Esta acción no se puede deshacer.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#d33',
        });

        if (result.isConfirmed) {
            try {
                await deleteTransaction(transaction.id);
                await Swal.fire('Eliminada', 'La transacción fue eliminada.', 'success');
                onDeleted?.(transaction.id);
            } catch (err) {
                console.error(err);
                Swal.fire('Error', 'No se pudo eliminar la transacción.', 'error');
            }
        }
    };

    if (isMobile) {
        return (
            <Card sx={{ mb: 2 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body1" component="div" sx={{ fontWeight: 'bold' }}>
                            {descripcion}
                        </Typography>
                        <Typography variant="body1" sx={{ color: amountColor, fontWeight: 'bold' }}>
                            {amountSign}{monto} {moneda}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', color: 'text.secondary' }}>
                        <Typography variant="body2">
                            {cuenta.nombre}
                        </Typography>
                        <Typography variant="body2">
                            {formattedDate}
                        </Typography>
                    </Box>
                    {categorias && (
                        <Box sx={{ mt: 1 }}>
                            <Chip label={categorias.nombre} size="small" sx={{ backgroundColor: categorias.color || '#ccc' }} />
                        </Box>
                    )}
                    <Divider sx={{ my: 1 }} />
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Tooltip title="Editar">
                            <IconButton color="primary" size="small" onClick={goToEdit}>
                                <EditIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                            <IconButton color="error" size="small" onClick={confirmDelete}>
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </CardContent>
            </Card>
        );
    }

    return (
        <TableRow>
            <TableCell>{descripcion}</TableCell>
            <TableCell>{formattedDate}</TableCell>
            <TableCell>{cuenta.nombre}</TableCell>
            <TableCell>
                {categorias ? <Chip label={categorias.nombre} size="small" sx={{ backgroundColor: categorias.color || '#ccc' }} /> : 'N/A'}
            </TableCell>
            <TableCell align="right">
                <Typography sx={{ color: amountColor, fontWeight: 'bold' }}>
                    {amountSign}{monto} {moneda}
                </Typography>
            </TableCell>
            <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                <Tooltip title="Editar">
                    <IconButton size="small" color="primary" onClick={goToEdit}>
                        <EditIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Eliminar">
                    <IconButton size="small" color="error" onClick={confirmDelete}>
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </TableCell>
        </TableRow>
    );
};


export default function LatestTransactionsTable({ transactions, onDeleted }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const sortedTransactions = transactions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return (
        <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
                Últimas Transacciones
            </Typography>
            {isMobile ? (
                <Box>
                    {sortedTransactions.map((transaction) => (
                        <TransactionRow key={transaction.id} transaction={transaction} onDeleted={onDeleted} />
                    ))}
                </Box>
            ) : (
                <TableContainer component={Paper}>
                    <Table aria-label="latest transactions table">
                        <TableHead>
                            <TableRow>
                                <TableCell>Descripción</TableCell>
                                <TableCell>Fecha</TableCell>
                                <TableCell>Cuenta</TableCell>
                                <TableCell>Categoría</TableCell>
                                <TableCell align="right">Monto</TableCell>
                                <TableCell align="right">Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {sortedTransactions.map((transaction) => (
                                <TransactionRow key={transaction.id} transaction={transaction} onDeleted={onDeleted} />
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
}
