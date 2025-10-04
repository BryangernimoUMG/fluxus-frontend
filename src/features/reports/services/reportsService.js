import api from "../../../lib/axios";
import { auth } from "../../../lib/firebase";
import { getUserProfile } from "../../dashboard/services/dashboardService";

// Ajusta paths si tu API usa otros
const TX_RESOURCE = "/api/transactions";
const CAT_RESOURCE = "/api/categories";
const ACC_RESOURCE = "/api/accounts";
const RTX_RESOURCE = "/api/transactions/recurring";
// Obtenemos el usuario actual reutilizando la lógica del dashboard

/** Robust: extrae array de varias formas frecuentes */
const xMany = (data, keys = []) => {
  if (Array.isArray(data)) return data;
  for (const k of keys) {
    const val = k
      .split(".")
      .reduce((acc, p) => (acc ? acc[p] : undefined), data);
    if (Array.isArray(val)) return val;
  }
  return [];
};

/** Carga categorías (id, nombre) */
export async function listCategories() {
  const { data } = await api.get(CAT_RESOURCE);
  const arr = xMany(data, [
    "data.categories",
    "categories",
    "items",
    "data.items",
    "data",
  ]);
  return arr.map((it) => ({
    id: it.id ?? it._id ?? it.uuid,
    nombre: it.nombre ?? it.name ?? "—",
  }));
}

/** Carga cuentas (id, nombre, moneda, tipo, saldo_inicial…) */
export async function listAccounts() {
  const { data } = await api.get(ACC_RESOURCE);
  const arr = xMany(data, [
    "data.cuentas",
    "cuentas",
    "items",
    "data.items",
    "data",
  ]);
  return arr.map((it) => ({
    id: it.id ?? it._id ?? it.uuid,
    nombre: it.nombre ?? it.name ?? "—",
    tipo: it.tipo ?? it.type ?? "",
    moneda: it.moneda ?? "",
    saldo_inicial: it.saldo_inicial ?? null,
    descripcion: it.descripcion ?? "",
    created_at: it.created_at ?? null,
  }));
}

/** Usuario actual (intenta /auth/me y /api/users/me) */
export async function getCurrentUser() {

  try {
    const uid = auth.currentUser?.uid;
    if (!uid) return null;
    const profile = await getUserProfile(uid);
    // Dashboard service puede devolver { user: {...} } o el objeto directo
    return profile?.user ?? profile ?? null;

  } catch {
    return null;

  }
}

/** Transacciones con filtros { from, to, categoryIds } */
export async function fetchTransactions({ from, to, categoryIds = [] } = {}) {
  const params = {};
  if (from) params.from = from; // YYYY-MM-DD
  if (to) params.to = to;
  if (categoryIds?.length) params.categorias = categoryIds.join(",");

  const { data } = await api.get(TX_RESOURCE, { params });
  const items = xMany(data, [
    "data.transacciones",
    "transacciones",
    "items",
    "data.items",
    "data",
  ]);

  return items.map((t) => ({
    id: t.id ?? t._id ?? t.uuid,
    tipo: t.tipo,
    monto: t.monto,
    moneda: t.moneda,
    tasa_cambio: t.tasa_cambio,
    monto_base: t.monto_base,
    descripcion: t.descripcion ?? "",
    fecha: t.fecha,
    categoria_id: t.categoria_id ?? null,
    cuenta_id: t.cuenta_id ?? null,
    cuenta_destino_id: t.cuenta_destino_id ?? null,
    deuda_id: t.deuda_id ?? null,
    metadatos: t.metadatos ?? null,
    created_at: t.created_at ?? null,
  }));
}

/** Transacciones recurrentes (todas) */
export async function fetchRecurringTransactions() {
  const { data } = await api.get(RTX_RESOURCE);
  const items = xMany(data, [
    "data.transacciones_recurrentes",
    "transacciones_recurrentes",
    "items",
    "data.items",
    "data",
  ]);

  return items.map((t) => ({
    id: t.id ?? t._id ?? t.uuid,
    tipo: t.tipo,
    monto: t.monto,
    moneda: t.moneda,
    descripcion: t.descripcion ?? "",
    frecuencia: t.frecuencia ?? "",
    intervalo: t.intervalo ?? null,
    fecha_inicio: t.fecha_inicio ?? null,
    fecha_fin: t.fecha_fin ?? null,
    proxima_ejecucion: t.proxima_ejecucion ?? null,
    cuenta_id: t.cuenta_id ?? null,
    categoria_id: t.categoria_id ?? null,
    deuda_id: t.deuda_id ?? null,
    is_active: t.is_active ?? null,
  }));
}
