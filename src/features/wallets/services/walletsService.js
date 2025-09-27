import api from '../../../lib/axios';

const RESOURCE = '/api/accounts';

function normalizeError(error) {
  if (error?.response) {
    const { status, data } = error.response;
    return { ok: false, error: { status, message: data?.message || 'Error del servidor' } };
  }
  return { ok: false, error: { status: 0, message: error?.message || 'Error de red/cliente' } };
}

const ALLOWED = ['nombre', 'tipo', 'moneda', 'saldo_inicial', 'descripcion'];
const build = (obj = {}) =>
  Object.fromEntries(Object.entries(obj).filter(([k, v]) => ALLOWED.includes(k) && v !== undefined));

export async function listWallets(params = {}) {
  try {
    const { data } = await api.get(RESOURCE, { params });
    // backend: { status, items, page, ... } o similar
    return { ok: true, data: data?.items ?? data?.data?.items ?? [] };
  } catch (e) {
    return normalizeError(e);
  }
}

export async function createWallet(payload) {
  try {
    const { data } = await api.post(RESOURCE, build(payload));
    return { ok: true, data: data?.data?.account ?? data };
  } catch (e) {
    return normalizeError(e);
  }
}

export async function updateWallet(id, payload) {
  try {
    const { data } = await api.patch(`${RESOURCE}/${id}`, build(payload));
    return { ok: true, data: data?.data?.account ?? data };
  } catch (e) {
    return normalizeError(e);
  }
}

export async function deleteWallet(id) {
  try {
    await api.delete(`${RESOURCE}/${id}`);
    return { ok: true, data: null };
  } catch (e) {
    return normalizeError(e);
  }
}

export async function getAllBalances() {
  try {
    const { data } = await api.get(`${RESOURCE}/balances`);
    // backend: { status:'success', data:{ cuentas:[...], totales:[{moneda,total}] } }
    const payload = data?.data ?? data;
    return { ok: true, data: payload };
  } catch (e) {
    return normalizeError(e);
  }
}
