// /src/features/budgets/services/budgetsService.js
import api from "../../../lib/axios";

const RESOURCE = "/api/categories";

/* -------- helpers -------- */

// Normaliza cada item para la UI (id/nombre/tipo/color/icono)
const normalize = (it = {}) => ({
  id: it.id ?? it._id ?? it.uuid,
  nombre: it.nombre ?? it.name ?? "—",
  tipo: it.tipo ?? it.type ?? "",
  color: it.color ?? it.hex ?? "#ccc",
  icono: it.icono ?? it.icon ?? null,
  importancia: it.importancia ?? it.priority ?? null,
  // por compatibilidad con tu tabla
  montoIngreso: it.montoIngreso ?? it.monto_ingreso ?? it.income ?? null,
  montoEgreso: it.montoEgreso ?? it.monto_egreso ?? it.expense ?? null,
});

// Extrae arrays de diferentes “shapes” de respuesta
const extractMany = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.categories)) return data.categories;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.categories)) return data.data.categories;
  if (Array.isArray(data?.data?.items)) return data.data.items;
  return [];
};

function normalizeError(error) {
  if (error?.response) {
    const { status, data } = error.response;
    return {
      ok: false,
      error: {
        status,
        code: data?.code || "API_ERROR",
        message: data?.message || "Error al comunicarse con el servidor.",
        details: data || null,
      },
    };
  }
  if (error?.request) {
    return {
      ok: false,
      error: {
        status: 0,
        code: "NETWORK_ERROR",
        message: "No se pudo conectar con el servidor.",
        details: null,
      },
    };
  }
  return {
    ok: false,
    error: {
      status: 0,
      code: "CLIENT_ERROR",
      message: error?.message || "Error desconocido en el cliente.",
      details: null,
    },
  };
}

// Solo envía campos permitidos y definidos
const ALLOWED = ["nombre", "tipo", "color", "icono", "importancia"];
const buildPayload = (obj = {}) =>
  Object.fromEntries(
    Object.entries(obj).filter(
      ([k, v]) => ALLOWED.includes(k) && v !== undefined
    )
  );

/* -------- NEW: listBudgets (array plano) -------- */
export async function listBudgets(params = {}) {
  try {
    const { data } = await api.get(RESOURCE, { params });
    return extractMany(data).map(normalize); // ⬅️ SIEMPRE array normalizado
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(
      "[budgetsService] list failed:",
      err?.response?.status,
      err?.response?.data || err?.message
    );
    return []; // fallback para no romper la tabla
  }
}

/* -------- Alias compatible con tu uso previo {ok, data} -------- */
export async function apiListBudgets(params = {}) {
  try {
    const list = await listBudgets(params);
    return { ok: true, data: list }; // ⬅️ ahora data ya es array
  } catch (error) {
    return normalizeError(error);
  }
}

/* -------- CREATE -------- */
export async function createBudget(payload) {
  try {
    const body = buildPayload(payload);
    // Reglas mínimas (evita 400 de back si faltan):
    if (!body.nombre) throw new Error("El campo 'nombre' es requerido.");
    if (!body.tipo) throw new Error("El campo 'tipo' es requerido.");
    if (!body.color) throw new Error("El campo 'color' es requerido.");

    const { data } = await api.post(RESOURCE, body);
    return { ok: true, data };
  } catch (error) {
    return normalizeError(error);
  }
}

/* -------- UPDATE parcial (PATCH) -------- */
export async function patchBudget(id, patch) {
  try {
    const { data } = await api.patch(`${RESOURCE}/${id}`, buildPayload(patch));
    return { ok: true, data };
  } catch (error) {
    return normalizeError(error);
  }
}

/* -------- UPDATE total (PUT) -------- */
export async function replaceBudget(id, payload) {
  try {
    const { data } = await api.put(`${RESOURCE}/${id}`, buildPayload(payload));
    return { ok: true, data };
  } catch (error) {
    return normalizeError(error);
  }
}

/* -------- DELETE -------- */
export async function deleteBudget(id) {
  try {
    const { data } = await api.delete(`${RESOURCE}/${id}`);
    return { ok: true, data };
  } catch (error) {
    return normalizeError(error);
  }
}
