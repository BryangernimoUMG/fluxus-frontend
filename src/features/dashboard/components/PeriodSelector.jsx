import { useEffect, useState } from "react";
import { Box, Button, TextField } from "@mui/material";

const toISO = (d) => d.toISOString().slice(0,10);
const presets = {
  today: () => { const d = new Date(); return { from: toISO(d), to: toISO(d) }; },
  this_week: () => {
    const d = new Date(); const day = d.getDay();
    const monday = new Date(d); monday.setDate(d.getDate() - ((day + 6) % 7));
    const sunday = new Date(monday); sunday.setDate(monday.getDate() + 6);
    return { from: toISO(monday), to: toISO(sunday) };
  },
  this_month: () => {
    const d = new Date();
    const first = new Date(d.getFullYear(), d.getMonth(), 1);
    const last  = new Date(d.getFullYear(), d.getMonth()+1, 0);
    return { from: toISO(first), to: toISO(last) };
  },
};

export default function PeriodSelector({ value, onChange }) {
  const [range, setRange] = useState(value || presets.this_month());
  useEffect(() => { if (value) setRange(value); }, [value]);
  const apply = (r) => { setRange(r); onChange && onChange(r); };

  return (
    <Box sx={{ display:"flex", flexWrap:"wrap", gap:1.5, alignItems:"center" }}>
      <Button size="small" variant="outlined" onClick={() => apply(presets.today())}>Hoy</Button>
      <Button size="small" variant="outlined" onClick={() => apply(presets.this_week())}>Esta semana</Button>
      <Button size="small" variant="outlined" onClick={() => apply(presets.this_month())}>Este mes</Button>
      <TextField size="small" type="date" label="Desde" InputLabelProps={{ shrink: true }}
        value={range.from} onChange={(e)=>setRange(r=>({ ...r, from: e.target.value }))}/>
      <TextField size="small" type="date" label="Hasta" InputLabelProps={{ shrink: true }}
        value={range.to} onChange={(e)=>setRange(r=>({ ...r, to: e.target.value }))}/>
      <Button size="small" variant="contained" onClick={() => apply(range)}>Aplicar</Button>
    </Box>
  );
}
