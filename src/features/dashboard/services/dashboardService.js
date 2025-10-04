import api from '../../../lib/axios';

// La API del back valida formato ISO DateTime en query (zod.datetime())
const toStartISO = (d) => new Date(`${d}T00:00:00.000Z`).toISOString();
const toEndISO   = (d) => new Date(`${d}T23:59:59.999Z`).toISOString();

/** Resumen por período (usa monto_base y devuelve strings de Decimal) */
export const getDashboardSummary = async (fromYmd, toYmd) => {
  const params = { from: toStartISO(fromYmd), to: toEndISO(toYmd) };
  const { data } = await api.get("api/transactions/reports/summary", { params });
  // El back devuelve { ingresos, egresos, neto } como strings (Decimal).
  const p = (v) => (v == null ? 0 : Number(v));
  return {
    incomeBase: p(data.ingresos),
    expensesBase: p(data.egresos),
    balanceBase: p(data.neto),
  };
};

/** Transacciones recientes (últimas N) */
export const getRecentTransactions = async (limit = 5) => {
  const { data } = await api.get("api/transactions/latest", { params: { limit } });
  // Normalizamos para la UI
  return (Array.isArray(data) ? data : []).map((tx) => ({
    id: tx.id,
    date: tx.fecha,
    type: tx.tipo === "egreso" ? "expense" : tx.tipo === "ingreso" ? "income" : "transfer",
    category: tx.categorias?.nombre || (tx.tipo === "transferencia" ? "Transferencia" : "Sin categoría"),
    amount: Number(tx.monto),
    currency: tx.moneda,
    note: tx.descripcion || "",
  }));
};

/** Perfil para obtener moneda_base */
export const getUserProfile = async (uid) => {
  const { data } = await api.get(`api/users/${uid}`);
  return data?.user || data; // el back responde { user: {...} }
};
