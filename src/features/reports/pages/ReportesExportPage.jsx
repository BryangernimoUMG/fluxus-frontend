import { useEffect, useMemo, useState } from "react";
import {
    Box, Paper, Typography, FormControl, InputLabel, Select, MenuItem,
    Button, Stack, Chip, Snackbar, Alert, IconButton
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
    listCategories, listAccounts, fetchTransactions, fetchRecurringTransactions, getCurrentUser
} from "../services/reportsService";
import {
    exportToCSV, exportToXLSX, exportMultipleSheetsXLSX, makeFilename
} from "../utils/exporters";

const MESES = [
    { value: 1, label: "Enero" }, { value: 2, label: "Febrero" },
    { value: 3, label: "Marzo" }, { value: 4, label: "Abril" },
    { value: 5, label: "Mayo" }, { value: 6, label: "Junio" },
    { value: 7, label: "Julio" }, { value: 8, label: "Agosto" },
    { value: 9, label: "Septiembre" }, { value: 10, label: "Octubre" },
    { value: 11, label: "Noviembre" }, { value: 12, label: "Diciembre" },
];

const FORMATOS = [
    { value: "csv", label: "CSV (.csv)" },
    { value: "xlsx", label: "Excel (.xlsx)" },
];

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
    // Catálogo para mostrar nombres de categorías en exports
    const [cats, setCats] = useState([]);

    // ---- Card 1: Reporte mensual
    const [mes, setMes] = useState("");
    const [formatoMes, setFormatoMes] = useState("");

    // ---- Card 2: Información de cuenta
    const [formatoCuenta, setFormatoCuenta] = useState("");

    const [snack, setSnack] = useState({ open: false, type: "success", msg: "" });

    useEffect(() => {
        (async () => {
            try {
                const c = await listCategories();
                setCats(c);
            } catch (err) {
                // eslint-disable-next-line no-console
                console.error("[reportes] listCategories", err?.response?.data || err);
            }
        })();
    }, []);

    const catsMap = useMemo(() => Object.fromEntries(cats.map((c) => [c.id, c.nombre])), [cats]);

    /* ----------------- Acciones ----------------- */

    async function exportMensual() {
        if (!mes || !formatoMes) {
            setSnack({ open: true, type: "warning", msg: "Selecciona mes y formato." });
            return;
        }
        // Rango del mes (año actual)
        const year = new Date().getFullYear();
        const from = new Date(year, Number(mes) - 1, 1).toISOString().slice(0, 10);
        const to = new Date(year, Number(mes), 0).toISOString().slice(0, 10);

        const filas = await fetchTransactions({ from, to });

        if (!filas.length) {
            setSnack({ open: true, type: "info", msg: "No hay transacciones para ese mes." });
            return;
        }

        const rows = filas.map((t) => ({
            id: t.id,
            fecha: t.fecha ? new Date(t.fecha).toISOString() : "",
            tipo: t.tipo,
            categoria_id: t.categoria_id || "",
            categoria_nombre: catsMap[t.categoria_id] || "",
            descripcion: t.descripcion || "",
            monto: t.monto,
            moneda: t.moneda,
            tasa_cambio: t.tasa_cambio,
            monto_base: t.monto_base,
            cuenta_id: t.cuenta_id || "",
            cuenta_destino_id: t.cuenta_destino_id || "",
            deuda_id: t.deuda_id || "",
            created_at: t.created_at || "",
        }));

        const filename = makeFilename("reporte_mensual", formatoMes, { from, to });

        if (formatoMes === "csv") exportToCSV(rows, filename);
        else await exportToXLSX(rows, filename, "Transacciones");

        setSnack({ open: true, type: "success", msg: `Exportado ${rows.length} registro(s).` });
    }

    async function exportCuenta() {
        if (!formatoCuenta) {
            setSnack({ open: true, type: "warning", msg: "Selecciona un formato." });
            return;
        }

        // Cargar todo lo relevante
        const [user, cuentas, categorias, tx, rtx] = await Promise.all([
            getCurrentUser(),
            listAccounts(),
            listCategories(),
            fetchTransactions({}),          // todas (ajusta en back si necesitas paginación)
            fetchRecurringTransactions(),
        ]);

        // Armamos datasets planos
        const usuarioRows = user ? [user] : [];
        const cuentasRows = cuentas;
        const categoriasRows = categorias;
        const txRows = tx.map((t) => ({
            id: t.id, tipo: t.tipo, monto: t.monto, moneda: t.moneda,
            tasa_cambio: t.tasa_cambio, monto_base: t.monto_base,
            descripcion: t.descripcion || "", fecha: t.fecha || "",
            categoria_id: t.categoria_id || "", categoria_nombre: catsMap[t.categoria_id] || "",
            cuenta_id: t.cuenta_id || "", cuenta_destino_id: t.cuenta_destino_id || "",
            deuda_id: t.deuda_id || "", created_at: t.created_at || "",
        }));
        const rtxRows = rtx.map((t) => ({
            id: t.id, tipo: t.tipo, monto: t.monto, moneda: t.moneda,
            descripcion: t.descripcion || "",
            frecuencia: t.frecuencia || "", intervalo: t.intervalo ?? "",
            fecha_inicio: t.fecha_inicio || "", fecha_fin: t.fecha_fin || "",
            proxima_ejecucion: t.proxima_ejecucion || "",
            cuenta_id: t.cuenta_id || "", categoria_id: t.categoria_id || "",
            deuda_id: t.deuda_id || "", is_active: t.is_active ?? "",
        }));

        const filename = `informacion_cuenta.${formatoCuenta}`;

        if (formatoCuenta === "csv") {
            // Genera múltiples archivos CSV (uno por dataset)
            const make = (rows, name) => {
                if (!rows.length) return;
                const headers = Object.keys(rows[0]);
                const lines = [
                    headers.join(","),
                    ...rows.map((r) => headers.map((h) => {
                        const v = r[h] ?? "";
                        const s = String(v);
                        return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
                    }).join(",")),
                ];
                const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
                // descarga cada uno con sufijo
                const f = name.replace(".csv", "");
                const a = `${f}_${new Date().toISOString().slice(0, 10)}.csv`;
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = a;
                document.body.appendChild(link); link.click(); link.remove();
                URL.revokeObjectURL(url);
            };

            make(usuarioRows, "usuario.csv");
            make(cuentasRows, "cuentas.csv");
            make(categoriasRows, "categorias.csv");
            make(txRows, "transacciones.csv");
            make(rtxRows, "transacciones_recurrentes.csv");
            setSnack({ open: true, type: "success", msg: "Archivos CSV descargados." });
        } else {
            // Un solo XLSX con múltiples hojas
            const sheets = [];
            if (usuarioRows.length) sheets.push({ name: "Usuario", headers: Object.keys(usuarioRows[0]), rows: usuarioRows });
            if (cuentasRows.length) sheets.push({ name: "Cuentas", headers: Object.keys(cuentasRows[0]), rows: cuentasRows });
            if (categoriasRows.length) sheets.push({ name: "Categorias", headers: Object.keys(categoriasRows[0]), rows: categoriasRows });
            if (txRows.length) sheets.push({ name: "Transacciones", headers: Object.keys(txRows[0]), rows: txRows });
            if (rtxRows.length) sheets.push({ name: "Transacciones_recurrentes", headers: Object.keys(rtxRows[0]), rows: rtxRows });

            if (!sheets.length) {
                setSnack({ open: true, type: "info", msg: "No hay datos para exportar." });
                return;
            }

            await exportMultipleSheetsXLSX(sheets, filename);
            setSnack({ open: true, type: "success", msg: "Excel exportado." });
        }
    }

    /* ----------------- UI ----------------- */

    const labelSx = { color: "primary.main", mb: 0.5 };
    const selectStandard = { "& .MuiSvgIcon-root": { color: "primary.main" }, minWidth: 220 };

    return (
        <Box>
            <Typography variant="h4" gutterBottom>Reportes</Typography>

            {/* Card 1: Exportar reporte mensual */}
            <CardShell title="Exportar reporte mensual">
                <Stack spacing={3} maxWidth={560}>
                    {/* Mes */}
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

                    {/* Formato */}
                    <Box>
                        <InputLabel sx={labelSx}>Seleccionar formato</InputLabel>
                        <FormControl variant="standard" fullWidth>
                            <Select
                                value={formatoMes}
                                onChange={(e) => setFormatoMes(e.target.value)}
                                displayEmpty
                                renderValue={(sel) =>
                                    sel ? FORMATOS.find((f) => f.value === sel)?.label : <span style={{ color: "#c2cfe0" }}>formato</span>
                                }
                                sx={selectStandard}
                            >
                                {FORMATOS.map((f) => (
                                    <MenuItem key={f.value} value={f.value}>{f.label}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>

                    <Box>
                        <Button variant="contained" onClick={exportMensual} disabled={!mes || !formatoMes}>
                            Descargar
                        </Button>
                    </Box>
                </Stack>
            </CardShell>

            {/* Card 2: Exportar información de cuenta */}
            <CardShell title="Exportar información de cuenta">
                <Stack spacing={3} maxWidth={560}>
                    <Box>
                        <InputLabel sx={labelSx}>Seleccionar formato</InputLabel>
                        <FormControl variant="standard" fullWidth>
                            <Select
                                value={formatoCuenta}
                                onChange={(e) => setFormatoCuenta(e.target.value)}
                                displayEmpty
                                renderValue={(sel) =>
                                    sel ? FORMATOS.find((f) => f.value === sel)?.label : <span style={{ color: "#c2cfe0" }}>formato</span>
                                }
                                sx={selectStandard}
                            >
                                {FORMATOS.map((f) => (
                                    <MenuItem key={f.value} value={f.value}>{f.label}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>

                    <Box>
                        <Button variant="contained" onClick={exportCuenta} disabled={!formatoCuenta}>
                            Descargar
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
