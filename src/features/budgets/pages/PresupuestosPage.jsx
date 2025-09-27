import { useEffect, useState } from "react";
import { Box, Typography, Snackbar, Alert } from "@mui/material";
import BudgetCreateForm from "../components/BudgetCreateForm";
import BudgetTable from "../components/BudgetTable";
import {
    listBudgets,       // ⬅️ usa la versión que devuelve SIEMPRE un array
    createBudget,
    patchBudget,
    deleteBudget,
} from "../services/budgetsService";

export default function PresupuestosPage() {
    const [rows, setRows] = useState([]);
    const [snack, setSnack] = useState({ open: false, type: "success", msg: "" });

    const show = (type, msg) => setSnack({ open: true, type, msg });

    const fetchRows = async () => {
        try {
            const list = await listBudgets();   // ⬅️ array plano normalizado
            setRows(list);
            // console.debug("[Presupuestos] filas:", list.length);
        } catch (e) {
            const msg = e?.response?.data?.message || "No se pudieron cargar los presupuestos.";
            show("error", msg);
        }
    };

    useEffect(() => {
        fetchRows();
    }, []);

    // CREATE (desde el formulario)
    const handleCreate = async (payload) => {
        try {
            await createBudget(payload);        // ⬅️ si falla, lanza
            show("success", "Presupuesto creado.");
            await fetchRows();
        } catch (e) {
            const msg = e?.response?.data?.message || e.message || "Error al crear presupuesto.";
            show("error", msg);
        }
    };

    // UPDATE (PATCH) desde la tabla
    const handleEdit = async (originalRow, changes) => {
        const id = originalRow.id ?? originalRow._id;
        if (!id) return show("error", "ID no encontrado");

        const diff = {};
        ["nombre", "tipo", "color"].forEach((k) => {
            if (changes[k] !== undefined && changes[k] !== originalRow[k]) diff[k] = changes[k];
        });
        if (Object.keys(diff).length === 0) return;

        try {
            await patchBudget(id, diff);
            show("success", "Presupuesto actualizado.");
            await fetchRows();
        } catch (e) {
            const msg = e?.response?.data?.message || e.message || "Error al actualizar.";
            show("error", msg);
        }
    };

    // DELETE desde la tabla
    const handleDelete = async (row) => {
        const id = row.id ?? row._id;
        if (!id) return show("error", "ID no encontrado");
        try {
            await deleteBudget(id);
            show("success", "Presupuesto eliminado.");
            await fetchRows();
        } catch (e) {
            const msg = e?.response?.data?.message || e.message || "Error al eliminar.";
            show("error", msg);
        }
    };

    return (
        <Box>
            <Typography variant="h4" gutterBottom>Presupuestos</Typography>

            {/* Formulario de creación */}
            <BudgetCreateForm onCreate={handleCreate} />

            {/* Tabla de presupuestos */}
            <Box mt={3}>
                <BudgetTable rows={rows} onEdit={handleEdit} onDelete={handleDelete} />
            </Box>

            <Snackbar
                open={snack.open}
                autoHideDuration={2800}
                onClose={() => setSnack((s) => ({ ...s, open: false }))}
            >
                <Alert
                    onClose={() => setSnack((s) => ({ ...s, open: false }))}
                    severity={snack.type}
                    variant="filled"
                >
                    {snack.msg}
                </Alert>
            </Snackbar>
        </Box>
    );
}
