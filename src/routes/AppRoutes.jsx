import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import RegisterPage from '../features/auth/pages/RegisterPage';
import LoginPage from '../features/auth/pages/LoginPage';
import ForgotPage from '../features/auth/pages/ForgotPage';

import { ProtectedRoute } from './ProtectedRoute';

// Páginas
import DashboardPage from '../features/dashboard/pages/DashboardPage';
import WalletsPage from '../features/wallets/pages/WalletsPage';
import PresupuestosPage from '../features/budgets/pages/PresupuestosPage';
import TransaccionesPage from '../features/transactions/pages/TransaccionesPage';
import ReportesPage from '../features/reports/pages/ReportesPage';
import ConfiguracionPage from '../features/settings/pages/ConfiguracionPage';
import CreateTransactionPage from '../features/transactions/pages/CreateTransactionPage';

export function AppRoutes() {
  return (
    <Routes>
      {/* Rutas Públicas */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot" element={<ForgotPage />} />

      {/* Rutas Protegidas */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/wallets" element={<WalletsPage />} />
        <Route path="/transacciones" element={<TransaccionesPage />} />
        <Route
          path="/transacciones/crear"
          element={<CreateTransactionPage />}
        />
        <Route path="/presupuestos" element={<PresupuestosPage />} />
        <Route path="/reportes" element={<ReportesPage />} />
        <Route path="/configuracion" element={<ConfiguracionPage />} />
      </Route>

      {/* Redirección para rutas no encontradas */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

