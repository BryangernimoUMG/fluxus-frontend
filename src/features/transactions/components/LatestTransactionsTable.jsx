import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography,
    useTheme, useMediaQuery, Card, CardContent, Box, Chip
} from '@mui/material';

const TransactionRow = ({ transaction }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
        </TableRow>
    );
};


export default function LatestTransactionsTable({ transactions }) {
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
                        <TransactionRow key={transaction.id} transaction={transaction} />
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
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {sortedTransactions.map((transaction) => (
                                <TransactionRow key={transaction.id} transaction={transaction} />
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
}
