
import { useState, useEffect, useRef } from 'react';
import { Typography, Box, CircularProgress, Alert } from '@mui/material';
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

    useEffect(() => {
        const fetchReports = async () => {
            try {
                setLoading(true);
                const now = new Date();
                const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
                const to = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).toISOString();


                //categoryData, 
                const [accountData, latestData] = await Promise.all([
                    
                    getAccountReport(from, to),
                    getLatestTransactions()
                ]);

                //getCategoryReport(from, to),
                
                //setCategoryReport(categoryData);
                setAccountReport(accountData);
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

            {loading && <CircularProgress />}
            {error && <Alert severity="error">{error}</Alert>}
            {!loading && !error && (
                <>
                    {/*<CategorySummary data={categoryReport} />*/}
                    <AccountSummary data={accountReport} />
                    <LatestTransactionsTable transactions={latestTransactions} />
                </>
            )}
        </Box>
    );
}
