// src/features/reports/pages/ReportesExportPage.jsx
import { useEffect, useMemo, useState } from "react";
import {
    Box, Paper, Typography, FormControl, InputLabel, Select, MenuItem,
    Button, Stack, Snackbar, Alert, IconButton
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
    listCategories,
    fetchTransactions,
    getCurrentUser
} from "../services/reportsService";
import {
    exportToCSV, makeFilename
} from "../utils/exporters";

/* -------- Meses para selector -------- */
const MESES = [
    { value: 1, label: "Enero" }, { value: 2, label: "Febrero" },
    { value: 3, label: "Marzo" }, { value: 4, label: "Abril" },
    { value: 5, label: "Mayo" }, { value: 6, label: "Junio" },
    { value: 7, label: "Julio" }, { value: 8, label: "Agosto" },
    { value: 9, label: "Septiembre" }, { value: 10, label: "Octubre" },
    { value: 11, label: "Noviembre" }, { value: 12, label: "Diciembre" },
];

/* --------- Limpieza de datos de usuario --------- */
const sanitizeUser = (u) => {
    if (!u || typeof u !== "object") return u;
    const rest = { ...u };
    delete rest.firebase_uid;
    delete rest.firebaseUid;
    delete rest.firebaseUID;
    delete rest.password;
    delete rest.token;
    delete rest.idToken;
    delete rest.refreshToken;
    return rest;
};

/* --------- UI shell --------- */
function CardShell({ title, children }) {
    return (
        <Paper elevation={0} sx={{ borderRadius: 2, overflow: "hidden", mb: 3 }}>
            <Box sx={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                px: 3, py: 2, borderBottom: (t) => `1px solid ${t.palette.divider}`,
                bgcolor: (t) => t.palette.background.paper
            }}>
                <Typography variant="h6">{title}</Typography>
                <IconButton size="small"><MoreVertIcon /></IconButton>
            </Box>
            <Box sx={{ p: 3 }}>{children}</Box>
            <Box sx={{ borderTop: (t) => `1px solid ${t.palette.divider}`, height: 48 }} />
        </Paper>
    );
}

export default function ReportesExportPage() {
    const [cats, setCats] = useState([]);
    const [mes, setMes] = useState("");
    const [snack, setSnack] = useState({ open: false, type: "success", msg: "" });

    useEffect(() => {
        (async () => {
            try {
                const c = await listCategories();
                setCats(Array.isArray(c) ? c : []);
            } catch (err) {
                console.error("[reportes] listCategories", err?.response?.data || err);
            }
        })();
    }, []);

    const catsMap = useMemo(
        () => Object.fromEntries((cats || []).map((c) => [c.id, c.nombre])),
        [cats]
    );

    /* ---------- Helpers ---------- */
    const toTxRow = (t) => ({
        id: t.id,
        fecha: t.fecha ? new Date(t.fecha).toISOString() : "",
        tipo: t.tipo ?? "",
        categoria_id: t.categoria_id ?? "",
        categoria_nombre: catsMap[t.categoria_id] || "",
        descripcion: t.descripcion || "",
        monto: t.monto ?? "",
        moneda: t.moneda ?? "",
        tasa_cambio: t.tasa_cambio ?? "",
        monto_base: t.monto_base ?? "",
        cuenta_id: t.cuenta_id ?? "",
        cuenta_destino_id: t.cuenta_destino_id ?? "",
        deuda_id: t.deuda_id ?? "",
        created_at: t.created_at ?? "",
    });

    /* ---------- Acciones ---------- */

    // 1) Exportar reporte mensual (solo transacciones) → CSV
    async function exportMensual() {
        if (!mes) {
            setSnack({ open: true, type: "warning", msg: "Selecciona un mes." });
            return;
        }

        // Dentro de exportMensual()
        const year = new Date().getFullYear();

        // Inicio del mes en UTC
        const from = new Date(Date.UTC(year, Number(mes) - 1, 1, 0, 0, 0, 0)).toISOString();

        // Fin del mes en UTC (23:59:59.999)
        const to = new Date(Date.UTC(year, Number(mes), 0, 23, 59, 59, 999)).toISOString();


        try {
            const filas = await fetchTransactions({ from, to });
            if (!Array.isArray(filas) || !filas.length) {
                setSnack({ open: true, type: "info", msg: "No hay transacciones para ese mes." });
                return;
            }

            const rows = filas.map(toTxRow);
            const filename = makeFilename("reporte_mensual", "csv", { from, to });
            exportToCSV(rows, filename);

            setSnack({ open: true, type: "success", msg: `Exportado ${rows.length} registro(s) en CSV.` });
        } catch (err) {
            const msg = err?.response?.data?.message || "No se pudo obtener el reporte mensual.";
            setSnack({ open: true, type: "error", msg });
            console.error("[exportMensual]", err?.response?.data || err);
        }
    }

    // 2) Exportar información del usuario (sin firebase_uid) → CSV
    async function exportUsuario() {
        try {
            const user = await getCurrentUser();
            if (!user) {
                setSnack({ open: true, type: "info", msg: "No se encontró información de usuario." });
                return;
            }

            const limpio = sanitizeUser(user);

            // exportToCSV espera un arreglo de filas (objetos). Usamos 1 fila con las claves del usuario.
            const filename = `usuario_info_${new Date().toISOString().slice(0, 10)}.csv`;
            exportToCSV([limpio], filename);

            setSnack({ open: true, type: "success", msg: "Información de usuario exportada (CSV)." });
        } catch (err) {
            const msg = err?.response?.data?.message || "No se pudo exportar la información del usuario.";
            setSnack({ open: true, type: "error", msg });
            console.error("[exportUsuario]", err?.response?.data || err);
        }
    }

    /* ---------- UI ---------- */
    const labelSx = { color: "primary.main", mb: 0.5 };
    const selectStandard = { "& .MuiSvgIcon-root": { color: "primary.main" }, minWidth: 220 };

    return (
        <Box>
            <Typography variant="h4" gutterBottom>Reportes</Typography>

            {/* Card 1: Reporte mensual (solo transacciones) */}
            <CardShell title="Exportar reporte mensual (CSV)">
                <Stack spacing={3} maxWidth={560}>
                    <Box>
                        <InputLabel sx={labelSx}>Seleccionar mes</InputLabel>
                        <FormControl variant="standard" fullWidth>
                            <Select
                                value={mes}
                                onChange={(e) => setMes(e.target.value)}
                                displayEmpty
                                renderValue={(sel) =>
                                    sel ? MESES.find((m) => m.value === sel)?.label : <span style={{ color: "#c2cfe0" }}>mes</span>
                                }
                                sx={selectStandard}
                            >
                                {MESES.map((m) => (
                                    <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>

                    <Box>
                        <Button variant="contained" onClick={exportMensual} disabled={!mes}>
                            Descargar CSV
                        </Button>
                    </Box>
                </Stack>
            </CardShell>

            {/* Card 2: Información del usuario */}
            <CardShell title="Exportar información del usuario (CSV)">
                <Stack spacing={3} maxWidth={560}>
                    <Typography variant="body2" color="text.secondary">
                        Exporta 1 archivo CSV con tus datos de usuario.
                    </Typography>
                    <Box>
                        <Button variant="contained" onClick={exportUsuario}>
                            Descargar CSV
                        </Button>
                    </Box>
                </Stack>
            </CardShell>

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
