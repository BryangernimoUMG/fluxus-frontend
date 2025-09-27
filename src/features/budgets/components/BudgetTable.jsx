import { useState, useEffect } from "react";
import {
    Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Checkbox, IconButton, Typography, Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, InputLabel, FormControl, Select, MenuItem
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

const COLOR_OPTIONS = [
    { value: "#8CCDEB", label: "Celeste" },
    { value: "#725CAD", label: "Morado" },
    { value: "#E62727", label: "Rojo" },
    { value: "#2F80ED", label: "Azul" },
    { value: "#3DB36B", label: "Verde" },
    { value: "#F5C044", label: "Amarillo" },
];

/* ---------- Utils ---------- */
function formatGTQ(n) {
    if (n === undefined || n === null) return "—";
    const num = Number(n);
    if (Number.isNaN(num)) return "—";
    try {
        return num.toLocaleString("es-GT", { style: "currency", currency: "GTQ" });
    } catch {
        return `Q ${num.toFixed(2)}`;
    }
}

// Convierte cualquier “shape” común a array
function toArray(rows) {
    if (Array.isArray(rows)) return rows;
    if (!rows || typeof rows !== "object") return [];
    // casos frecuentes
    if (Array.isArray(rows.data)) return rows.data;
    if (Array.isArray(rows.items)) return rows.items;
    if (Array.isArray(rows.results)) return rows.results;
    // { ok:true, data:[...] }
    if (rows.ok && Array.isArray(rows.data)) return rows.data;
    // { data: { items: [...] } }
    if (Array.isArray(rows?.data?.items)) return rows.data.items;
    // nada conocido
    return [];
}

// Normaliza campos para la UI
function normalizeRow(it = {}) {
    return {
        id: it.id ?? it._id ?? it.uuid ?? it.key ?? it.nombre ?? undefined,
        nombre: it.nombre ?? it.name ?? it.titulo ?? "—",
        tipo: it.tipo ?? it.type ?? "",
        color: it.color ?? it.hex ?? "#ccc",
        montoIngreso: it.montoIngreso ?? it.monto_ingreso ?? it.income ?? null,
        montoEgreso: it.montoEgreso ?? it.monto_egreso ?? it.expense ?? null,
    };
}

/* ---------- Edit Dialog ---------- */
function EditDialog({ open, onClose, item, onSave }) {
    const [nombre, setNombre] = useState("");
    const [tipo, setTipo] = useState("");
    const [color, setColor] = useState("");

    useEffect(() => {
        if (item) {
            setNombre(item.nombre || "");
            setTipo(item.tipo || "");
            setColor(item.color || "");
        }
    }, [item]);

    const canSave = nombre.trim() && tipo.trim() && color;
    const handleSave = () => {
        if (!canSave) return;
        onSave?.({ nombre: nombre.trim(), tipo: tipo.trim(), color });
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Editar presupuesto</DialogTitle>
            <DialogContent sx={{ pt: 1 }}>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                    <Box>
                        <InputLabel sx={{ color: "primary.main", mb: 0.5 }}>Nombre</InputLabel>
                        <TextField
                            variant="standard"
                            fullWidth
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            placeholder="Presupuesto..."
                            inputProps={{ maxLength: 50 }}
                            sx={{
                                "& .MuiInputBase-input::placeholder": { color: "#c2cfe0", opacity: 1 },
                                "& .MuiInputBase-input": { color: "#334d6e" },
                            }}
                        />
                    </Box>

                    <Box>
                        <InputLabel sx={{ color: "primary.main", mb: 0.5 }}>Tipo</InputLabel>
                        <TextField
                            variant="standard"
                            fullWidth
                            value={tipo}
                            onChange={(e) => setTipo(e.target.value)}
                            placeholder="Tipo..."
                            inputProps={{ maxLength: 30 }}
                            sx={{
                                "& .MuiInputBase-input::placeholder": { color: "#c2cfe0", opacity: 1 },
                                "& .MuiInputBase-input": { color: "#334d6e" },
                            }}
                        />
                    </Box>

                    <Box>
                        <InputLabel sx={{ color: "primary.main", mb: 0.5 }}>Color</InputLabel>
                        <FormControl variant="standard" fullWidth>
                            <Select
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                displayEmpty
                                renderValue={(selected) => {
                                    if (!selected) return <Typography sx={{ color: "#c2cfe0" }}>Color...</Typography>;
                                    const opt = COLOR_OPTIONS.find((o) => o.value === selected);
                                    return (
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                            <Box sx={{ width: 14, height: 14, borderRadius: "50%", bgcolor: selected }} />
                                            <Typography sx={{ color: "#334d6e" }}>{opt?.label}</Typography>
                                        </Box>
                                    );
                                }}
                            >
                                {COLOR_OPTIONS.map((opt) => (
                                    <MenuItem key={opt.value} value={opt.value}>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                            <Box sx={{ width: 14, height: 14, borderRadius: "50%", bgcolor: opt.value }} />
                                            <Typography>{opt.label}</Typography>
                                        </Box>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancelar</Button>
                <Button onClick={handleSave} variant="contained" disabled={!canSave}>
                    Guardar
                </Button>
            </DialogActions>
        </Dialog>
    );
}

/* ---------- Table ---------- */
export default function BudgetTable({ rows = [], onEdit, onDelete }) {
    const [editOpen, setEditOpen] = useState(false);
    const [current, setCurrent] = useState(null);

    const handleOpenEdit = (row) => {
        setCurrent(row);
        setEditOpen(true);
    };
    const handleCloseEdit = () => setEditOpen(false);
    const handleSaveEdit = async (changes) => {
        await onEdit?.(current, changes);
        setEditOpen(false);
    };

    const handleDelete = async (row) => {
        const ok = window.confirm(`¿Eliminar el presupuesto "${row.nombre}"?`);
        if (!ok) return;
        await onDelete?.(row);
    };

    // ✅ Defensa fuerte: coerción a array + normalización
    const safeRows = toArray(rows).map(normalizeRow);

    return (
        <>
            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell padding="checkbox">
                                <Checkbox />
                            </TableCell>
                            <TableCell>Color</TableCell>
                            <TableCell>Presupuesto</TableCell>
                            <TableCell>Monto ingreso</TableCell>
                            <TableCell>Monto egreso</TableCell>
                            <TableCell>Tipo</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {safeRows.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6}>
                                    <Typography color="text.secondary">Sin presupuestos.</Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            safeRows.map((row, idx) => (
                                <TableRow
                                    key={row.id ?? `row-${idx}`}
                                    hover
                                    sx={{ "&:hover .row-actions": { opacity: 1, visibility: "visible" } }}
                                >
                                    <TableCell padding="checkbox">
                                        <Checkbox />
                                    </TableCell>

                                    <TableCell>
                                        <Box sx={{ width: 16, height: 16, borderRadius: "50%", bgcolor: row.color || "#ccc" }} />
                                    </TableCell>

                                    <TableCell sx={{ position: "relative" }}>
                                        <Typography sx={{ color: "#334d6e" }}>{row.nombre}</Typography>
                                        <Box
                                            className="row-actions"
                                            sx={{
                                                position: "absolute",
                                                left: 110,
                                                top: "50%",
                                                transform: "translateY(-50%)",
                                                display: "flex",
                                                gap: 0.5,
                                                opacity: 0,
                                                visibility: "hidden",
                                                transition: "opacity .15s ease",
                                            }}
                                        >
                                            <IconButton size="small" onClick={() => handleOpenEdit(row)}>
                                                <EditOutlinedIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton size="small" onClick={() => handleDelete(row)}>
                                                <DeleteOutlineOutlinedIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </TableCell>

                                    <TableCell>{formatGTQ(row.montoIngreso)}</TableCell>
                                    <TableCell>{formatGTQ(row.montoEgreso)}</TableCell>
                                    <TableCell>{row.tipo || "—"}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Modal de edición */}
            <EditDialog open={editOpen} onClose={handleCloseEdit} item={current} onSave={handleSaveEdit} />
        </>
    );
}
