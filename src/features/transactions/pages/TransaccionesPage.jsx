import { useEffect, useMemo, useState } from "react";
import {
    Box, Button, Checkbox, FormControl, FormControlLabel, FormHelperText,
    Grid, InputAdornment, MenuItem, Select, TextField, Typography, Chip, Stack
} from "@mui/material";
import dayjs from "dayjs";
import { createTransaction, listAccounts, listCategories } from "../services/transactionsService";
// Si tienes budgetsService y quieres que el "Presupuesto" venga de allí, impórtalo:
// import { getBudgets } from "../../budgets/services/budgetsService";

const PERIODICIDADES = [
    { value: "MENSUAL", label: "Mensual" },
    { value: "SEMESTRAL", label: "Semestral" },
    { value: "ANUAL", label: "Anual" },
    { value: "SEMANAL", label: "Semanal" },
];

const ESTADOS = [
    { value: "COMPLETO", label: "Completo", color: "success" },
    { value: "ATRASADO", label: "Atrasado", color: "error" },
    { value: "PENDIENTE", label: "Pendiente", color: "warning" },
];

export default function TransaccionesPage() {
    const [loading, setLoading] = useState(false);
    const [accounts, setAccounts] = useState([]);
    const [categories, setCategories] = useState([]);

    // ---- Form state
    const [form, setForm] = useState({
        titulo: "",              // UI solamente -> lo guardamos en metadatos
        descripcion: "",
        monto: "",
        moneda: "GTQ",
        tipo: "EGRESO",          // "INGRESO" | "EGRESO" (tipo_transaccion)
        cuenta_id: "",
        categoria_id: "",        // Lo usamos para "Presupuesto"
        fecha: dayjs().format("YYYY-MM-DD"),
        estado: "PENDIENTE",     // UI -> metadatos
        recurrente: false,       // UI -> metadatos
        periodicidad: "MENSUAL", // UI -> metadatos
    });

    const errors = useMemo(() => {
        const e = {};
        if (!form.descripcion?.trim()) e.descripcion = "Requerido";
        if (!form.monto || Number(form.monto) <= 0) e.monto = "Monto inválido";
        if (!form.cuenta_id) e.cuenta_id = "Selecciona una cuenta";
        if (!form.fecha) e.fecha = "Fecha requerida";
        return e;
    }, [form]);

    useEffect(() => {
        (async () => {
            try {
                const [acc, cat] = await Promise.all([listAccounts(), listCategories()]);
                setAccounts(acc || []);
                setCategories(cat || []);
                // Si en tu proyecto "Presupuesto" proviene de budgets:
                // const budgets = await getBudgets();
                // setCategories(budgets);
            } catch (err) {
                console.error("Error cargando catálogos:", err);
            }
        })();
    }, []);

    const onChange = (key) => (e) => {
        const value = e?.target?.type === "checkbox" ? !!e.target.checked : e.target.value;
        setForm((s) => ({ ...s, [key]: value }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        if (Object.keys(errors).length) return;

        // Construimos payload según tu tabla "transacciones"
        const payload = {
            // id y usuario_id los setea tu backend con el token
            cuenta_id: form.cuenta_id || null,
            categoria_id: form.categoria_id || null, // "Presupuesto"
            deuda_id: null,
            tipo: form.tipo,                 // "INGRESO" | "EGRESO"
            monto: Number(form.monto),
            moneda: form.moneda || "GTQ",
            tasa_cambio: null,               // puedes calcular si usas otras monedas
            monto_base: Number(form.monto),  // si moneda = base, lo mismo que monto
            descripcion: form.descripcion,   // puedes concatenar el título si quieres
            fecha: new Date(form.fecha).toISOString(),
            cuenta_destino_id: null,
            metadatos: {
                titulo: form.titulo || "",
                estado: form.estado,
                recurrente: form.recurrente,
                periodicidad: form.periodicidad,
                ui_version: 1,
            },
        };

        try {
            setLoading(true);
            await createTransaction(payload);
            // Limpieza rápida
            setForm((s) => ({
                ...s,
                titulo: "",
                descripcion: "",
                monto: "",
                categoria_id: "",
                // mantenemos cuenta seleccionada y config si prefieres
            }));
            alert("Transacción guardada ✅");
        } catch (err) {
            console.error(err);
            alert("No se pudo guardar. Revisa consola / network.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box component="form" onSubmit={onSubmit} sx={{ p: 3 }}>
            <Grid container spacing={6}>
                {/* Columna izquierda (campos principales) */}
                <Grid item xs={12} md={6}>
                    <Typography variant="h5" sx={{ mb: 3 }}>Crea un registro</Typography>

                    <TextField
                        label="Título"
                        fullWidth
                        variant="standard"
                        value={form.titulo}
                        onChange={onChange("titulo")}
                        sx={{ mb: 3 }}
                    />

                    <TextField
                        label="Monto"
                        fullWidth
                        variant="standard"
                        value={form.monto}
                        onChange={onChange("monto")}
                        InputProps={{
                            startAdornment: <InputAdornment position="start">Q</InputAdornment>,
                            inputMode: "decimal",
                        }}
                        error={!!errors.monto}
                        helperText={errors.monto}
                        sx={{ mb: 3 }}
                    />

                    <FormControl fullWidth variant="standard" sx={{ mb: 3 }}>
                        <Typography variant="caption" sx={{ color: "text.secondary", mb: 0.5 }}>
                            Presupuesto
                        </Typography>
                        <Select
                            value={form.categoria_id}
                            onChange={onChange("categoria_id")}
                            displayEmpty
                        >
                            <MenuItem value="">
                                <em>Sin presupuesto</em>
                            </MenuItem>
                            {categories.map((c) => (
                                <MenuItem key={c.id} value={c.id}>{c.nombre || c.name || c.title}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Grid container spacing={2} alignItems="center" sx={{ mb: 1 }}>
                        <Grid item xs={8}>
                            <TextField
                                label="Vence"
                                type="date"
                                fullWidth
                                variant="standard"
                                value={form.fecha}
                                onChange={onChange("fecha")}
                                error={!!errors.fecha}
                                helperText={errors.fecha}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                    </Grid>

                    <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 1 }}>
                            Estado
                        </Typography>
                        <Stack direction="row" spacing={1}>
                            {ESTADOS.map((s) => (
                                <Chip
                                    key={s.value}
                                    label={s.label}
                                    color={s.color}
                                    variant={form.estado === s.value ? "filled" : "outlined"}
                                    onClick={() => setForm((f) => ({ ...f, estado: s.value }))}
                                />
                            ))}
                        </Stack>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 1 }}>
                            Tipo de movimiento
                        </Typography>
                        <Stack direction="row" spacing={2}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={form.tipo === "INGRESO"}
                                        onChange={() => setForm((f) => ({ ...f, tipo: "INGRESO" }))}
                                    />
                                }
                                label="Ingreso"
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={form.tipo === "EGRESO"}
                                        onChange={() => setForm((f) => ({ ...f, tipo: "EGRESO" }))}
                                    />
                                }
                                label="Egreso"
                            />
                        </Stack>
                    </Box>

                    <TextField
                        label="Descripción"
                        fullWidth
                        variant="standard"
                        multiline
                        minRows={2}
                        value={form.descripcion}
                        onChange={onChange("descripcion")}
                        error={!!errors.descripcion}
                        helperText={errors.descripcion}
                        sx={{ mb: 4 }}
                    />

                    <Button type="submit" variant="contained" disabled={loading}>
                        {loading ? "Guardando…" : "Guardar"}
                    </Button>
                </Grid>

                {/* Columna derecha (recurrente / cuenta / moneda) */}
                <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" sx={{ color: "primary.main", mb: 1 }}>
                        Este movimiento será recurrente
                    </Typography>
                    <FormControlLabel
                        control={<Checkbox checked={form.recurrente} onChange={onChange("recurrente")} />}
                        label="Sí"
                        sx={{ mb: 2 }}
                    />

                    <FormControl fullWidth variant="standard" sx={{ mb: 4 }}>
                        <Typography variant="caption" sx={{ color: "text.secondary", mb: 0.5 }}>
                            ¿Cuál es su periodicidad?
                        </Typography>
                        <Select
                            value={form.periodicidad}
                            onChange={onChange("periodicidad")}
                            disabled={!form.recurrente}
                        >
                            {PERIODICIDADES.map((p) => (
                                <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>
                            ))}
                        </Select>
                        {!form.recurrente && (
                            <FormHelperText>Activa “recurrente” para seleccionar.</FormHelperText>
                        )}
                    </FormControl>

                    <FormControl fullWidth variant="standard" sx={{ mb: 3 }}>
                        <Typography variant="caption" sx={{ color: "text.secondary", mb: 0.5 }}>
                            Cuenta
                        </Typography>
                        <Select
                            value={form.cuenta_id}
                            onChange={onChange("cuenta_id")}
                            displayEmpty
                            error={!!errors.cuenta_id}
                        >
                            <MenuItem value="">
                                <em>Selecciona una cuenta</em>
                            </MenuItem>
                            {accounts.map((a) => (
                                <MenuItem key={a.id} value={a.id}>{a.nombre || a.name}</MenuItem>
                            ))}
                        </Select>
                        {errors.cuenta_id && <FormHelperText error>{errors.cuenta_id}</FormHelperText>}
                    </FormControl>

                    <TextField
                        label="Moneda"
                        fullWidth
                        variant="standard"
                        value={form.moneda}
                        onChange={onChange("moneda")}
                        placeholder="GTQ, USD…"
                        sx={{ mb: 2 }}
                    />
                </Grid>
            </Grid>
        </Box>
    );
}
