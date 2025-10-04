import { List, ListItem, ListItemText, Typography, Box, Skeleton } from "@mui/material";

export default function RecentList({ items = [], loading }) {
  if (loading) {
    return (
      <List sx={{ py: 0 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <ListItem key={i} sx={{ px: 0 }}>
            <Box sx={{ width: "100%" }}>
              <Skeleton variant="text" width="60%" height={20} />
              <Skeleton variant="text" width="40%" height={16} />
            </Box>
          </ListItem>
        ))}
      </List>
    );
  }
  if (!items.length) return <Typography variant="body2" color="text.secondary">Sin transacciones recientes.</Typography>;

  return (
    <List sx={{ py: 0 }}>
      {items.map((tx) => (
        <ListItem key={tx.id} sx={{ px: 0 }}>
          <ListItemText
            primary={
              <Box sx={{ display:"flex", justifyContent:"space-between", gap:2 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                  {tx.category}{tx.note ? ` — ${tx.note}` : ""}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: tx.type === "expense" ? "error.main" : "success.main" }}>
                  {tx.type === "expense" ? "-" : "+"}{Number(tx.amount).toFixed(2)} {tx.currency}
                </Typography>
              </Box>
            }
            secondary={new Date(tx.date).toLocaleDateString()}
            secondaryTypographyProps={{ color:"text.secondary" }}
          />
        </ListItem>
      ))}
    </List>
  );
}
