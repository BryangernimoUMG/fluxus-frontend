import { Box, List, ListItem, ListItemIcon, ListItemText, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { checkPasswordCriteria, getCriteriaMessages } from '../utils/passwordValidation';

export function PasswordRequirements({ password }) {
  const criteria = checkPasswordCriteria(password);
  const messages = getCriteriaMessages();

  const items = [
    { key: 'lengthOk', ok: criteria.lengthOk, text: messages.lengthOk },
    { key: 'hasUpper', ok: criteria.hasUpper, text: messages.hasUpper },
    { key: 'hasLower', ok: criteria.hasLower, text: messages.hasLower },
    { key: 'hasNumber', ok: criteria.hasNumber, text: messages.hasNumber },
    { key: 'hasSpecial', ok: criteria.hasSpecial, text: messages.hasSpecial },
  ];

  const allOk = items.every(i => i.ok);

  return (
    <Box sx={{ mt: 1 }}>
      <Typography variant="caption" color={allOk ? 'success.main' : 'text.secondary'} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <InfoOutlinedIcon fontSize="inherit" /> Tu contraseña debe cumplir con:
      </Typography>
      <List dense sx={{ py: 0 }}>
        {items.map(item => (
          <ListItem key={item.key} sx={{ py: 0 }}>
            <ListItemIcon sx={{ minWidth: 28 }}>
              {item.ok ? (
                <CheckCircleIcon fontSize="small" color="success" />
              ) : (
                <CancelIcon fontSize="small" color="disabled" />
              )}
            </ListItemIcon>
            <ListItemText
              primaryTypographyProps={{ variant: 'caption', color: item.ok ? 'success.main' : 'text.secondary' }}
              primary={item.text}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

export default PasswordRequirements;
