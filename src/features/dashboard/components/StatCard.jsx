import { Card, CardContent, Typography } from "@mui/material";

export default function StatCard({ title, value, danger }) {
  return (
    <Card sx={{ borderRadius: 3, border: danger ? "1px solid #ffcdd2" : "1px solid #e0e0e0" }}>
      <CardContent>
        <Typography variant="body2" color="text.secondary">{title}</Typography>
        <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5 }}>
          {value ?? "—"}
        </Typography>
      </CardContent>
    </Card>
  );
}
