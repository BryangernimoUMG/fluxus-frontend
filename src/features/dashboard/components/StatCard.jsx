import { Card, CardContent, Typography, Skeleton, Box } from "@mui/material";

export default function StatCard({ title, value, danger, loading = false }) {
  return (
    <Card sx={{ borderRadius: 3, border: danger ? "1px solid #ffcdd2" : "1px solid #e0e0e0" }}>
      <CardContent>
        {loading ? (
          <>
            <Skeleton variant="text" width={80} height={18} sx={{ mb: 0.5 }} />
            <Skeleton variant="rounded" height={32} sx={{ borderRadius: 1 }} />
          </>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary">{title}</Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5 }}>
              {value ?? "—"}
            </Typography>
          </>
        )}
      </CardContent>
    </Card>
  );
}
