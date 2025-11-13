import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { useSpaces } from '../../context/SpaceContext';
import { Space } from '../../types';

interface SpaceFormProps {
  space?: Space | null;
  onClose: () => void;
}

const SpaceForm: React.FC<SpaceFormProps> = ({ space, onClose }) => {
  const { addSpace, updateSpace } = useSpaces();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    type: 'deportivo' as Space['type'],
    capacity: 10,
    description: '',
    operatingHours: { start: '08:00', end: '18:00' },
    rules: [] as string[],
    isActive: true,
    imageUrl: '',
    requiresPayment: false,
    paymentMethods: [] as { label: string; accountNumber: string }[],
  });

  const [rulesInput, setRulesInput] = useState('');

  const addPaymentMethod = () => {
    setFormData(prev => ({
      ...prev,
      paymentMethods: [...prev.paymentMethods, { label: '', accountNumber: '' }]
    }));
  };

  const updatePaymentMethod = (index: number, field: 'label' | 'accountNumber', value: string) => {
    setFormData(prev => ({
      ...prev,
      paymentMethods: prev.paymentMethods.map((method, idx) =>
        idx === index ? { ...method, [field]: value } : method
      )
    }));
  };

  const removePaymentMethod = (index: number) => {
    setFormData(prev => ({
      ...prev,
      paymentMethods: prev.paymentMethods.filter((_, idx) => idx !== index)
    }));
  };

  useEffect(() => {
    if (space) {
      setFormData({
        name: space.name,
        type: space.type,
        capacity: space.capacity,
        description: space.description,
        operatingHours: space.operatingHours,
        rules: space.rules,
        isActive: space.isActive,
        imageUrl: space.imageUrl || '',
        requiresPayment: space.requiresPayment,
        paymentMethods: space.paymentMethods.length > 0
          ? space.paymentMethods
          : (space.requiresPayment ? [{ label: '', accountNumber: '' }] : [])
      });
      setRulesInput(space.rules.join('\n'));
    }
  }, [space]);

  const spaceTypes = [
    { value: 'deportivo', label: 'Deportivo' },
    { value: 'social', label: 'Social' },
    { value: 'cultural', label: 'Cultural' },
    { value: 'bbq', label: 'BBQ' },
    { value: 'auditorio', label: 'Auditorio' },
    { value: 'salon', label: 'Salón' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const rules = rulesInput
      .split('\n')
      .map(rule => rule.trim())
      .filter(rule => rule.length > 0);

    const paymentMethods = formData.requiresPayment
      ? formData.paymentMethods
          .map(method => ({
            label: method.label.trim(),
            accountNumber: method.accountNumber.trim()
          }))
          .filter(method => method.label !== '' || method.accountNumber !== '')
      : [];

    const spaceData = {
      ...formData,
      rules,
      paymentMethods,
      requiresPayment: formData.requiresPayment,
    };

    try {
      const wasSuccessful = space
        ? await updateSpace(space.id, spaceData)
        : await addSpace(spaceData);

      if (wasSuccessful) {
        onClose();
      }
    } catch (submissionError) {
      const errorMessage =
        submissionError instanceof Error
          ? submissionError.message
          : 'No se pudo guardar el espacio. Inténtalo nuevamente.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            {space ? 'Editar Espacio' : 'Crear Nuevo Espacio'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Espacio *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Espacio *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as Space['type'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {spaceTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Capacidad (personas) *
              </label>
              <input
                type="number"
                min="1"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hora de Inicio *
              </label>
              <input
                type="time"
                value={formData.operatingHours.start}
                onChange={(e) => setFormData({
                  ...formData,
                  operatingHours: { ...formData.operatingHours, start: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hora de Fin *
              </label>
              <input
                type="time"
                value={formData.operatingHours.end}
                onChange={(e) => setFormData({
                  ...formData,
                  operatingHours: { ...formData.operatingHours, end: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
          </div>
        </div>

          <div className="border border-gray-200 rounded-lg p-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Requiere pago para reservar
                </label>
                <p className="text-xs text-gray-500">
                  Activa esta opción si el espacio necesita que los usuarios realicen un pago previo. Podrás definir los métodos disponibles.
                </p>
              </div>
              <div className="mt-3 sm:mt-0 flex items-center">
                <input
                  type="checkbox"
                  id="requiresPayment"
                  checked={formData.requiresPayment}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setFormData(prev => ({
                      ...prev,
                      requiresPayment: checked,
                      paymentMethods: checked
                        ? (prev.paymentMethods.length > 0
                          ? prev.paymentMethods
                          : [{ label: '', accountNumber: '' }])
                        : []
                    }));
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="requiresPayment" className="ml-2 block text-sm text-gray-700">
                  {formData.requiresPayment ? 'Pago obligatorio' : 'Pago no requerido'}
                </label>
              </div>
            </div>

            {formData.requiresPayment && (
              <div className="space-y-4">
                <div className="space-y-3">
                  {formData.paymentMethods.map((method, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-10 gap-3 items-start">
                      <div className="md:col-span-4">
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Método de pago
                        </label>
                        <input
                          type="text"
                          value={method.label}
                          onChange={(e) => updatePaymentMethod(index, 'label', e.target.value)}
                          placeholder="Banco, Nequi, Efecty, etc."
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div className="md:col-span-5">
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Número o referencia
                        </label>
                        <input
                          type="text"
                          value={method.accountNumber}
                          onChange={(e) => updatePaymentMethod(index, 'accountNumber', e.target.value)}
                          placeholder="Cuenta, celular, referencia de pago"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div className="md:col-span-1 flex md:justify-end">
                        <button
                          type="button"
                          onClick={() => removePaymentMethod(index)}
                          className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                          disabled={formData.paymentMethods.length === 1}
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addPaymentMethod}
                  className="inline-flex items-center px-3 py-2 border border-dashed border-blue-300 text-sm font-medium text-blue-600 rounded-md hover:bg-blue-50"
                >
                  + Agregar método de pago
                </button>

                <p className="text-xs text-gray-500">
                  Estos métodos se mostrarán a los usuarios al reservar el espacio.
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL de Imagen (opcional)
            </label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://ejemplo.com/imagen.jpg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reglas de Uso
            </label>
            <textarea
              value={rulesInput}
              onChange={(e) => setRulesInput(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ingrese cada regla en una línea separada"
            />
            <p className="text-xs text-gray-500 mt-1">
              Ingrese cada regla en una línea separada
            </p>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
              Espacio activo y disponible para reservas
            </label>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>{loading ? 'Guardando...' : 'Guardar'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SpaceForm;