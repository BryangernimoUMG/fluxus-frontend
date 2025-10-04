import { useEffect, useState } from "react";
import { Box, Container, Grid, Card, CardContent, Typography, Divider, LinearProgress, Skeleton } from "@mui/material";
import { useAuth } from "../../../contexts/AuthContext";
import PeriodSelector from "../components/PeriodSelector";
import StatCard from "../components/StatCard";
import RecentList from "../components/RecentList";
import { getDashboardSummary, getRecentTransactions, getUserProfile } from "../services/dashboardService";

export default function DashboardPage() {
  const { user } = useAuth(); // Firebase user (uid, email, etc.)
  const [summary, setSummary] = useState({ incomeBase: 0, expensesBase: 0, balanceBase: 0 });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(false);
  const [range, setRange] = useState(() => {
    const d = new Date();
    const first = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0,10);
    const last  = new Date(d.getFullYear(), d.getMonth()+1, 0).toISOString().slice(0,10);
    return { from: first, to: last };
  });
  const [currency, setCurrency] = useState("GTQ");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        // 1) Perfil → moneda_base
        if (user?.uid) {
          const me = await getUserProfile(user.uid);
          if (!cancel && me?.moneda_base) setCurrency(me.moneda_base);
        }
        // 2) Datos del dashboard
        const [s, r] = await Promise.all([
          getDashboardSummary(range.from, range.to),
          getRecentTransactions(5),
        ]);
        if (cancel) return;
        setSummary(s);
        setRecent(r);
      } catch (e) {
        if (!cancel) setError(e?.message || "Error al cargar el dashboard");
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, [range, user?.uid]);

  const money = (n) =>
    n == null ? "—" : new Intl.NumberFormat("es-GT", { style: "currency", currency }).format(Number(n));

  const emptyPeriod = !loading && summary && Number(summary.incomeBase) === 0 && Number(summary.expensesBase) === 0;

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {loading && (
        <Box sx={{ position: "sticky", top: 0, left: 0, right: 0, zIndex: 10, mb: 2 }}>
          <LinearProgress />
        </Box>
      )}
      <Box sx={{ display:"flex", justifyContent:"space-between", alignItems:"center", mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Dashboard</Typography>
        <PeriodSelector value={range} onChange={setRange} />
      </Box>

      {error && (
        <Box sx={{ color: "error.main", border: "1px solid", borderColor: "error.light", p: 2, borderRadius: 2, mb: 2 }}>
          {error}
        </Box>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <StatCard title="Balance"  value={loading ? "—" : money(summary.balanceBase)} loading={loading} />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard title="Ingresos" value={loading ? "—" : money(summary.incomeBase)} loading={loading} />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard title="Gastos"   value={loading ? "—" : money(summary.expensesBase)} danger loading={loading} />
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Recientes</Typography>
              <RecentList items={recent} loading={loading} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, minHeight: 164, display:"flex", alignItems:"center", justifyContent:"center", p:2 }}>
            {loading ? (
              <Box sx={{ width: "100%" }}>
                <Skeleton variant="text" width={180} height={20} />
                <Skeleton variant="rounded" height={120} sx={{ borderRadius: 2 }} />
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">Próximamente: Gráfica de flujo por día</Typography>
            )}
          </Card>
        </Grid>
      </Grid>

      {emptyPeriod && (
        <>
          <Divider sx={{ my: 3 }} />
          <Box sx={{ textAlign:"center", color:"text.secondary", border:"1px dashed #cfd8dc", p:3, borderRadius:3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Sin datos en este período</Typography>
            <Typography variant="body2">
              No registraste ingresos ni gastos entre <b>{range.from}</b> y <b>{range.to}</b>.
              Cambiá el rango o agregá tu primera transacción.
            </Typography>
          </Box>
        </>
      )}
    </Container>
  );
}
