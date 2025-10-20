
import { useState, useEffect, useRef } from 'react';
import { Typography, Box, CircularProgress, Alert, Button } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import { useNavigate } from 'react-router-dom';
//getCategoryReport
import { getAccountReport, getLatestTransactions } from '../services/transactionsService';
//import CategorySummary from '../components/CategorySummary';
import AccountSummary from '../components/AccountSummary';
import LatestTransactionsTable from '../components/LatestTransactionsTable';

export default function TransaccionesPage() {
    const dataFetchedRef = useRef(false);
    const [categoryReport, setCategoryReport] = useState([]);
    const [accountReport, setAccountReport] = useState([]);
    const [latestTransactions, setLatestTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchReports = async () => {
            try {
                setLoading(true);
                const now = new Date();
                const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
                const to = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).toISOString();


                //categoryData, getAccountReport(from, to),
                const [latestData] = await Promise.all([
                    
                    
                    getLatestTransactions()
                ]);

                //getCategoryReport(from, to),
                
                //setCategoryReport(categoryData);
                //setAccountReport(accountData);
                setLatestTransactions(latestData);
                setError(null);
            } catch (err) {
                setError('Error al cargar los resúmenes.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (dataFetchedRef.current) {
            return;
        }
        dataFetchedRef.current = true;
        fetchReports();
    }, []);

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Transacciones
            </Typography>

            {/* Acciones rápidas bajo el título */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
                <Button
                    variant="contained"
                    color="success"
                    startIcon={<TrendingUpIcon />}
                    sx={{ color: '#fff', borderRadius: 8, textTransform: 'none' }}
                    onClick={() => navigate('/transacciones/crear?tipo=ingreso')}
                >
                    Registrar ingreso
                </Button>
                <Button
                    variant="contained"
                    color="error"
                    startIcon={<TrendingDownIcon />}
                    sx={{ color: '#fff', borderRadius: 8, textTransform: 'none' }}
                    onClick={() => navigate('/transacciones/crear?tipo=egreso')}
                >
                    Registrar egreso
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<CompareArrowsIcon />}
                    sx={{ color: '#fff', borderRadius: 8, textTransform: 'none' }}
                    onClick={() => navigate('/transacciones/crear?tipo=transferencia')}
                >
                    Haces transferencia
                </Button>
            </Box>

            {loading && <CircularProgress />}
            {error && <Alert severity="error">{error}</Alert>}
            {!loading && !error && (
                <>
                    {/*<CategorySummary data={categoryReport} />*/}
                    {/*<AccountSummary data={accountReport} /> */}
                    <LatestTransactionsTable
                        transactions={latestTransactions}
                        onDeleted={(id) =>
                            setLatestTransactions((prev) => prev.filter((t) => t.id !== id))
                        }
                    />
                </>
            )}
        </Box>
    );
}
