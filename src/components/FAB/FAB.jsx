import React from 'react';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { SpeedDial, SpeedDialAction, SpeedDialIcon } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';

const StyledSpeedDial = styled(SpeedDial)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(4),
  right: theme.spacing(4),
}));

const FAB = () => {
  const navigate = useNavigate();

  const handleActionClick = (type) => {
    navigate(`/transacciones/crear?tipo=${type}`);
  };

  const actions = [
    {
      icon: <TrendingUpIcon />,
      name: 'Ingreso',
      onClick: () => handleActionClick('ingreso'),
    },
    {
      icon: <TrendingDownIcon />,
      name: 'Egreso',
      onClick: () => handleActionClick('egreso'),
    },
    {
      icon: <CompareArrowsIcon />,
      name: 'Transferencia',
      onClick: () => handleActionClick('transferencia'),
    },
  ];

  return (
    <StyledSpeedDial
      ariaLabel="SpeedDial para transacciones"
      icon={<SpeedDialIcon openIcon={<AddIcon />} />}
    >
      {actions.map((action) => (
        <SpeedDialAction
          key={action.name}
          icon={action.icon}
          tooltipTitle={action.name}
          onClick={action.onClick}
          tooltipOpen
        />
      ))}
    </StyledSpeedDial>
  );
};

export default FAB;
