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
import { createTransaction, getTransactionById, updateTransaction } from '../services/transactionsService';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const CreateTransactionForm = ({ tipo, transactionId }) => {
  const navigate = useNavigate();
  const dataFetchedRef = useRef(false);
  const [formData, setFormData] = useState({
    tipo,
    monto: '',
    moneda: 'GTQ',
    tasa_cambio: '1',
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
  const isEdit = Boolean(transactionId);

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
        // If editing, fetch transaction and prefill
        if (transactionId) {
          const raw = await getTransactionById(transactionId);
          const tx = raw?.transaction || raw?.data || raw; // normalize common shapes
          // tx may include extra relations; map to our form shape
          setFormData({
            tipo: tx.tipo,
            monto: String(tx.monto),
            moneda: tx.moneda,
            tasa_cambio: tx.tasa_cambio !== undefined && tx.tasa_cambio !== null ? String(tx.tasa_cambio) : '1',
            fecha: new Date(tx.fecha).toISOString().split('T')[0],
            descripcion: tx.descripcion || '',
            cuenta_id: tx.cuenta_id || '',
            categoria_id: tx.categoria_id || '',
            cuenta_destino_id: tx.cuenta_destino_id || '',
          });
        }
      } catch (error) {
        Swal.fire('Error', 'Error al cargar los datos necesarios para el formulario.', 'error');
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
    setFormData((prev) => {
      if (name === 'moneda') {
        // If switching to GTQ, normalize tasa_cambio to '1'
        return { ...prev, [name]: value, tasa_cambio: value === 'USD' ? prev.tasa_cambio : '1' };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones básicas
    if (!formData.monto || parseFloat(formData.monto) <= 0) {
      Swal.fire('Validación', 'El monto debe ser un número positivo.', 'warning');
      return;
    }
    if (!formData.cuenta_id) {
      Swal.fire('Validación', 'Debe seleccionar una cuenta.', 'warning');
      return;
    }
    if (formData.moneda === 'USD') {
      const rate = Number(formData.tasa_cambio);
      if (!rate || rate <= 0) {
        Swal.fire('Validación', 'La tasa de cambio debe ser un número positivo.', 'warning');
        return;
      }
    }
    if (tipo !== 'transferencia' && !formData.categoria_id) {
      Swal.fire('Validación', 'Debe seleccionar una categoría.', 'warning');
      return;
    }
    if (tipo === 'transferencia' && !formData.cuenta_destino_id) {
      Swal.fire('Validación', 'Debe seleccionar una cuenta de destino.', 'warning');
      return;
    }
    if (
      tipo === 'transferencia' &&
      formData.cuenta_id === formData.cuenta_destino_id
    ) {
      Swal.fire('Validación', 'La cuenta de origen y destino no pueden ser la misma.', 'warning');
      return;
    }

    try {
      const dataToSend = {
        ...formData,
        monto: parseFloat(formData.monto),
  tasa_cambio: formData.moneda === 'USD' ? parseFloat(formData.tasa_cambio) : 1,
        fecha: new Date(formData.fecha).toISOString(),
      };

      // No enviar categoria_id si es transferencia
      if (dataToSend.tipo === 'transferencia') {
        delete dataToSend.categoria_id;
      } else {
        delete dataToSend.cuenta_destino_id;
      }

      if (isEdit) {
        await updateTransaction(transactionId, dataToSend);
        await Swal.fire('Actualizada', 'La transacción fue actualizada correctamente.', 'success');
      } else {
        await createTransaction(dataToSend);
        await Swal.fire('Creada', 'La transacción fue creada con éxito.', 'success');
      }
      navigate('/transacciones');
    } catch (error) {
      Swal.fire('Error', 'Ocurrió un error al guardar la transacción.', 'error');
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
              inputProps={{ step: '0.0001', min: '0' }}
              helperText="Tasa de USD a moneda base"
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
              {isEdit ? 'Actualizar Transacción' : 'Crear Transacción'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CreateTransactionForm;
