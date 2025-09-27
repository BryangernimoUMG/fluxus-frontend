import api from "../../../lib/axios";

const BASE = "/transactions";

export const createTransaction = async (payload) => {
  // payload debe calzar con la tabla "transacciones"
  const { data } = await api.post(`${BASE}`, payload);
  return data;
};

export const listAccounts = async () => {
  const { data } = await api.get(`/accounts`); // si manejas cuentas
  return data;
};

export const listCategories = async () => {
  const { data } = await api.get(`/categories`); // si tus "presupuestos" vienen de acá, cámbialo
  return data;
};

// Si tus presupuestos vienen del módulo budgets, puedes reusar tu budgetsService:
// import { getBudgets } from "../../budgets/services/budgetsService";
// …y llamar getBudgets() en el componente.
