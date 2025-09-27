import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import { getWallets } from '../services/walletService';
import { getCategories } from '../../categoria/services/categoryService';
import { createTransaction } from '../services/transactionsService';
import { useNavigate } from 'react-router-dom';

const CreateTransactionForm = ({ tipo }) => {
  const navigate = useNavigate();
  const dataFetchedRef = useRef(false);
  const [formData, setFormData] = useState({
    tipo,
    monto: '',
    moneda: 'GTQ',
    tasa_cambio: 1,
    fecha: new Date().toISOString().split('T')[0],
    descripcion: '',
    cuenta_id: '',
    categoria_id: '',
    cuenta_destino_id: '', // Para transferencias
  });

  const [wallets, setWallets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [walletsData, categoriesData] = await Promise.all([
          getWallets(),
          getCategories(),
        ]);

        setWallets(walletsData.items);
        setCategories(categoriesData.data.categories);
      } catch (error) {
        alert('Error al cargar los datos necesarios para el formulario.');
      } finally {
        setLoading(false);
      }
    };

    if (dataFetchedRef.current) {
      return;
    }
    dataFetchedRef.current = true;
    fetchData();
  }, []);

  useEffect(() => {
    const newFiltered =
      tipo === 'ingreso' || tipo === 'egreso'
        ? categories.filter((cat) => cat.tipo === tipo)
        : [];
    setFilteredCategories(newFiltered);

    // Si el tipo cambia, resetea la categoría.
    // Esto no afectará la carga inicial, solo los cambios de prop.
    setFormData((prev) => ({
      ...prev,
      tipo, // Asegura que el tipo en el estado del formulario esté sincronizado
      categoria_id: '',
    }));
  }, [tipo, categories]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones básicas
    if (!formData.monto || parseFloat(formData.monto) <= 0) {
      alert('El monto debe ser un número positivo.');
      return;
    }
    if (!formData.cuenta_id) {
      alert('Debe seleccionar una cuenta.');
      return;
    }
    if (tipo !== 'transferencia' && !formData.categoria_id) {
      alert('Debe seleccionar una categoría.');
      return;
    }
    if (tipo === 'transferencia' && !formData.cuenta_destino_id) {
      alert('Debe seleccionar una cuenta de destino.');
      return;
    }
    if (
      tipo === 'transferencia' &&
      formData.cuenta_id === formData.cuenta_destino_id
    ) {
      alert('La cuenta de origen y destino no pueden ser la misma.');
      return;
    }

    try {
      const dataToSend = {
        ...formData,
        monto: parseFloat(formData.monto),
        tasa_cambio: parseFloat(formData.tasa_cambio),
        fecha: new Date(formData.fecha).toISOString(),
      };

      // No enviar categoria_id si es transferencia
      if (dataToSend.tipo === 'transferencia') {
        delete dataToSend.categoria_id;
      } else {
        delete dataToSend.cuenta_destino_id;
      }

      await createTransaction(dataToSend);
      alert('Transacción creada con éxito');
      navigate('/transacciones');
    } catch (error) {
      alert('Error al crear la transacción. Por favor, intente de nuevo.');
    }
  };

  if (loading) {
    return <p>Cargando formulario...</p>;
  }

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Grid container spacing={3}>
        {/* Tipo de Transacción */}
        <Grid xs={12}>
          <FormControl fullWidth>
            <InputLabel>Tipo de Transacción</InputLabel>
            <Select name="tipo" value={formData.tipo} label="Tipo de Transacción" onChange={handleChange}>
              <MenuItem value="ingreso">Ingreso</MenuItem>
              <MenuItem value="egreso">Egreso</MenuItem>
              <MenuItem value="transferencia">Transferencia</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Monto y Moneda */}
        <Grid xs={12} md={6}>
          <TextField
            name="monto"
            label="Monto"
            type="number"
            value={formData.monto}
            onChange={handleChange}
            fullWidth
            required
            inputProps={{ step: '0.01' }}
          />
        </Grid>
        <Grid xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Moneda</InputLabel>
            <Select name="moneda" value={formData.moneda} label="Moneda" onChange={handleChange}>
              <MenuItem value="GTQ">GTQ</MenuItem>
              <MenuItem value="USD">USD</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Tasa de Cambio (condicional) */}
        {formData.moneda === 'USD' && (
          <Grid xs={12} md={6}>
            <TextField
              name="tasa_cambio"
              label="Tasa de Cambio"
              type="number"
              value={formData.tasa_cambio}
              onChange={handleChange}
              fullWidth
              required
              inputProps={{ step: '0.01' }}
            />
          </Grid>
        )}

        {/* Fecha */}
        <Grid xs={12} md={6}>
          <TextField
            name="fecha"
            label="Fecha"
            type="date"
            value={formData.fecha}
            onChange={handleChange}
            fullWidth
            required
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        {/* Cuenta de Origen */}
        <Grid xs={12} md={tipo === 'transferencia' ? 6 : 12}>
          <FormControl fullWidth>
            <InputLabel>
              {tipo === 'transferencia' ? 'Cuenta de Origen' : 'Cuenta'}
            </InputLabel>
            <Select
              name="cuenta_id"
              value={formData.cuenta_id}
              label={tipo === 'transferencia' ? 'Cuenta de Origen' : 'Cuenta'}
              onChange={handleChange}
              required
            >
              {wallets.map((wallet) => (
                <MenuItem key={wallet.id} value={wallet.id}>
                  {wallet.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Cuenta de Destino (para transferencias) */}
        {tipo === 'transferencia' && (
          <Grid xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Cuenta de Destino</InputLabel>
              <Select
                name="cuenta_destino_id"
                value={formData.cuenta_destino_id}
                label="Cuenta de Destino"
                onChange={handleChange}
                required
              >
                {wallets.map((wallet) => (
                  <MenuItem key={wallet.id} value={wallet.id}>
                    {wallet.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}

        {/* Categoría (condicional) */}
        {(formData.tipo === 'ingreso' || formData.tipo === 'egreso') && (
          <Grid xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Categoría</InputLabel>
              <Select
                name="categoria_id"
                value={formData.categoria_id}
                label="Categoría"
                onChange={handleChange}
                required
                disabled={filteredCategories.length === 0}
              >
                {filteredCategories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>
                    {cat.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}

        {/* Descripción */}
        <Grid xs={12}>
          <TextField
            name="descripcion"
            label="Descripción"
            value={formData.descripcion}
            onChange={handleChange}
            fullWidth
            multiline
            rows={3}
          />
        </Grid>

        {/* Botón de Envío */}
        <Grid xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="submit" variant="contained" color="primary">
              Crear Transacción
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CreateTransactionForm;
