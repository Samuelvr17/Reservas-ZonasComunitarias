import React, { useState } from 'react';
import { Calendar, Clock, MapPin, X, Filter, Search, User, CreditCard, UploadCloud, CheckCircle2, AlertCircle } from 'lucide-react';
import { useReservations } from '../../context/ReservationContext';
import { useAuth } from '../../context/AuthContext';
import { formatDate, isToday, isTomorrow, isWithin24Hours, parseLocalDate } from '../../utils/dateUtils';
import { PaymentStatus } from '../../types';

interface ReservationsListProps {
  isAdminView?: boolean;
}

const ReservationsList: React.FC<ReservationsListProps> = ({ isAdminView = false }) => {
  const { user } = useAuth();
  const {
    reservations,
    reservationsError,
    reloadReservations,
    cancelReservation,
    getUserReservations,
    updateReservationPayment,
    uploadPaymentProof,
  } = useReservations();
  const [paymentProofs, setPaymentProofs] = useState<Record<string, File | null>>({});
  const [paymentMessages, setPaymentMessages] = useState<Record<string, { type: 'success' | 'error'; message: string }>>({});
  const [processingPaymentId, setProcessingPaymentId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  if (!user) return null;

  const userReservations = isAdminView ? reservations : getUserReservations(user.id);

  const filteredReservations = userReservations
    .filter(reservation => {
      const eventName = reservation.event ?? '';
      const matchesSearch = !searchTerm ||
        reservation.spaceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (isAdminView && reservation.userName.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = !statusFilter || reservation.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => parseLocalDate(b.date).getTime() - parseLocalDate(a.date).getTime());

  const paymentStatusConfig: Record<PaymentStatus, { label: string; badge: string; description: string }> = {
    not_required: {
      label: 'Pago no requerido',
      badge: 'bg-gray-100 text-gray-800',
      description: 'Este espacio no requiere pagos para confirmar la reserva.',
    },
    pending: {
      label: 'Pago pendiente',
      badge: 'bg-yellow-100 text-yellow-800',
      description: 'Aún no se ha registrado un comprobante de pago para esta reserva.',
    },
    submitted: {
      label: 'Comprobante recibido',
      badge: 'bg-blue-100 text-blue-800',
      description: 'Se cargó un comprobante de pago y está pendiente de verificación.',
    },
    verified: {
      label: 'Pago verificado',
      badge: 'bg-green-100 text-green-800',
      description: 'El administrador verificó el pago asociado a la reserva.',
    },
  };

  const clearPaymentMessage = (reservationId: string) => {
    setPaymentMessages(prev => {
      const updatedMessages = { ...prev };
      delete updatedMessages[reservationId];
      return updatedMessages;
    });
  };

  const handlePaymentFileChange = (reservationId: string, files: FileList | null) => {
    const file = files && files.length > 0 ? files[0] : null;
    setPaymentProofs(prev => ({
      ...prev,
      [reservationId]: file,
    }));
    clearPaymentMessage(reservationId);
  };

  const setPaymentMessage = (reservationId: string, type: 'success' | 'error', message: string) => {
    setPaymentMessages(prev => ({
      ...prev,
      [reservationId]: { type, message },
    }));
  };

  const handleVerifyPayment = async (reservation: typeof filteredReservations[number]) => {
    setProcessingPaymentId(reservation.id);
    clearPaymentMessage(reservation.id);

    try {
      let proofUrl = reservation.paymentProofUrl ?? null;
      const selectedFile = paymentProofs[reservation.id] ?? null;

      if (!selectedFile && !proofUrl) {
        setPaymentMessage(
          reservation.id,
          'error',
          isAdminView
            ? 'Aún no hay un comprobante cargado para esta reserva.'
            : 'Adjunta un comprobante antes de verificar el pago.'
        );
        setProcessingPaymentId(null);
        return;
      }

      if (selectedFile && !isAdminView) {
        proofUrl = await uploadPaymentProof(reservation.id, selectedFile);
        setPaymentProofs(prev => ({ ...prev, [reservation.id]: null }));
      }

      await updateReservationPayment(reservation.id, {
        paymentStatus: 'verified',
        paymentProofUrl: proofUrl,
      });

      setPaymentMessage(reservation.id, 'success', 'Pago verificado correctamente.');
    } catch (error) {
      console.error(error);
      setPaymentMessage(
        reservation.id,
        'error',
        error instanceof Error ? error.message : 'No se pudo verificar el pago.'
      );
    } finally {
      setProcessingPaymentId(null);
    }
  };

  const handleSubmitPaymentProof = async (reservation: typeof filteredReservations[number]) => {
    setProcessingPaymentId(reservation.id);
    clearPaymentMessage(reservation.id);

    try {
      const selectedFile = paymentProofs[reservation.id] ?? null;

      if (!selectedFile) {
        setPaymentMessage(reservation.id, 'error', 'Selecciona un archivo para adjuntar como comprobante.');
        setProcessingPaymentId(null);
        return;
      }

      const proofUrl = await uploadPaymentProof(reservation.id, selectedFile);

      await updateReservationPayment(reservation.id, {
        paymentStatus: 'submitted',
        paymentProofUrl: proofUrl,
      });

      setPaymentProofs(prev => ({ ...prev, [reservation.id]: null }));
      setPaymentMessage(reservation.id, 'success', 'Comprobante enviado correctamente. Espera la validación del administrador.');
    } catch (error) {
      console.error(error);
      setPaymentMessage(
        reservation.id,
        'error',
        error instanceof Error ? error.message : 'No se pudo subir el comprobante. Intenta nuevamente.'
      );
    } finally {
      setProcessingPaymentId(null);
    }
  };

  const handleMarkPaymentPending = async (reservationId: string) => {
    setProcessingPaymentId(reservationId);
    clearPaymentMessage(reservationId);

    try {
      await updateReservationPayment(reservationId, { paymentStatus: 'pending' });
      setPaymentMessage(reservationId, 'success', 'El pago se marcó como pendiente nuevamente.');
    } catch (error) {
      console.error(error);
      setPaymentMessage(
        reservationId,
        'error',
        error instanceof Error ? error.message : 'No se pudo actualizar el estado del pago.'
      );
    } finally {
      setProcessingPaymentId(null);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      confirmed: 'bg-green-100 text-green-800',
      upcoming: 'bg-blue-100 text-blue-800',
      'in-progress': 'bg-yellow-100 text-yellow-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      confirmed: 'Confirmada',
      upcoming: 'Próxima',
      'in-progress': 'En progreso',
      completed: 'Completada',
      cancelled: 'Cancelada',
    };
    return labels[status as keyof typeof labels] || status;
  };

  const canCancelReservation = (reservation: any) => {
    if (reservation.status === 'cancelled' || reservation.status === 'completed') {
      return false;
    }
    
    // Can't cancel if within 24 hours
    return !isWithin24Hours(reservation.date, reservation.startTime);
  };

  const handleCancelReservation = (reservationId: string) => {
    if (window.confirm('¿Está seguro de que desea cancelar esta reserva?')) {
      cancelReservation(reservationId);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {isAdminView ? 'Todas las Reservas' : 'Mis Reservas'}
        </h1>
        <p className="text-gray-600 mt-2">
          {isAdminView
            ? 'Gestiona todas las reservas del sistema'
            : 'Administra tus reservas de espacios comunitarios'
          }
        </p>
      </div>

      {reservationsError && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
          <p className="font-medium">{reservationsError}</p>
          <button
            onClick={reloadReservations}
            className="mt-3 inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={isAdminView ? "Buscar por espacio, evento o usuario..." : "Buscar reservas..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
            >
              <option value="">Todos los estados</option>
              <option value="confirmed">Confirmada</option>
              <option value="upcoming">Próxima</option>
              <option value="in-progress">En progreso</option>
              <option value="completed">Completada</option>
              <option value="cancelled">Cancelada</option>
            </select>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          Mostrando {filteredReservations.length} de {userReservations.length} reservas
        </div>
      </div>

      {/* Reservations List */}
      {filteredReservations.length > 0 ? (
        <div className="space-y-4">
          {filteredReservations.map(reservation => {
            const eventName = reservation.event ?? '';
            const paymentInfo = paymentStatusConfig[reservation.paymentStatus] ?? paymentStatusConfig.pending;
            const selectedFile = paymentProofs[reservation.id] ?? null;
            const paymentMessage = paymentMessages[reservation.id];
            const hasPaymentProof = Boolean(reservation.paymentProofUrl);

            return (
              <div key={reservation.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-gray-900">
                      {reservation.spaceName}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        isToday(reservation.date) ? 'bg-red-100 text-red-800' :
                        isTomorrow(reservation.date) ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {isToday(reservation.date) ? 'Hoy' :
                         isTomorrow(reservation.date) ? 'Mañana' :
                         formatDate(reservation.date)}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(reservation.status)}`}>
                        {getStatusLabel(reservation.status)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{formatDate(reservation.date)}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{reservation.startTime} - {reservation.endTime}</span>
                    </div>

                    {isAdminView && (
                      <div className="flex items-center text-sm text-gray-600">
                        <User className="h-4 w-4 mr-2" />
                        <span>{reservation.userName}</span>
                      </div>
                    )}

                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{eventName}</span>
                    </div>
                  </div>

                  {isAdminView && (
                    <div className="text-sm text-gray-600 mb-2">
                      <strong>Contacto:</strong> {reservation.userContact}
                    </div>
                  )}

                  <div className="text-xs text-gray-500">
                    Reservado el {formatDate(reservation.createdAt)}
                  </div>
                </div>

                {reservation.requiresPayment && (
                  <div className="mt-4 border-t border-gray-100 pt-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${paymentInfo.badge}`}>
                          <CreditCard className="h-3 w-3 mr-2" />
                          {paymentInfo.label}
                        </span>
                        {reservation.paymentVerifiedAt && (
                          <span className="text-xs text-gray-500">
                            Verificado el {new Date(reservation.paymentVerifiedAt).toLocaleString('es-ES')}
                          </span>
                        )}
                      </div>
                      {reservation.paymentProofUrl && (
                        <a
                          href={reservation.paymentProofUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Ver comprobante cargado
                        </a>
                      )}
                    </div>

                    <p className="text-sm text-gray-600">{paymentInfo.description}</p>

                    {isAdminView ? (
                      <div className="space-y-3">
                        <p className="text-sm text-gray-600">
                          El comprobante de pago debe ser cargado por la persona que realizó la reserva.
                        </p>

                        {!hasPaymentProof && (
                          <div className="text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-md p-3">
                            Aún no se ha recibido un comprobante para esta reserva.
                          </div>
                        )}

                        <div className="flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={() => handleVerifyPayment(reservation)}
                            disabled={!hasPaymentProof || processingPaymentId === reservation.id}
                            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            {processingPaymentId === reservation.id ? 'Guardando...' : 'Verificar pago'}
                          </button>
                          {reservation.paymentStatus !== 'pending' && (
                            <button
                              type="button"
                              onClick={() => handleMarkPaymentPending(reservation.id)}
                              disabled={processingPaymentId === reservation.id}
                              className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50"
                            >
                              <AlertCircle className="h-4 w-4 mr-2" />
                              Marcar como pendiente
                            </button>
                          )}
                        </div>

                        {paymentMessage && (
                          <div
                            className={`text-sm ${
                              paymentMessage.type === 'success'
                                ? 'text-green-700'
                                : 'text-red-600'
                            }`}
                          >
                            {paymentMessage.message}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {reservation.paymentStatus !== 'verified' && (
                          <>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 space-y-3 sm:space-y-0">
                              <label className="flex items-center space-x-2 text-sm text-gray-700">
                                <UploadCloud className="h-4 w-4" />
                                <span>Sube tu comprobante (imagen o PDF)</span>
                              </label>
                              <input
                                type="file"
                                accept="image/*,application/pdf"
                                onChange={(e) => handlePaymentFileChange(reservation.id, e.target.files)}
                                className="text-sm"
                              />
                              {selectedFile && (
                                <span className="text-xs text-gray-500 truncate max-w-xs">
                                  Archivo seleccionado: {selectedFile.name}
                                </span>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => handleSubmitPaymentProof(reservation)}
                              disabled={processingPaymentId === reservation.id}
                              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                            >
                              <UploadCloud className="h-4 w-4 mr-2" />
                              {processingPaymentId === reservation.id ? 'Enviando...' : 'Enviar comprobante'}
                            </button>
                          </>
                        )}

                        <p className="text-sm text-gray-600">
                          {reservation.paymentStatus === 'verified'
                            ? 'Tu pago fue verificado. ¡Gracias!'
                            : 'El administrador verificará tu comprobante de pago para completar la reserva.'}
                        </p>

                        {paymentMessage && (
                          <div
                            className={`text-sm ${
                              paymentMessage.type === 'success'
                                ? 'text-green-700'
                                : 'text-red-600'
                            }`}
                          >
                            {paymentMessage.message}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {canCancelReservation(reservation) && (
                  <button
                    onClick={() => handleCancelReservation(reservation.id)}
                    className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    title="Cancelar reserva"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>

              {isWithin24Hours(reservation.date, reservation.startTime) && 
               reservation.status !== 'cancelled' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Esta reserva está dentro de las próximas 24 horas y no puede ser cancelada.
                  </p>
                </div>
              )}
            </div>
          );
        })}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="bg-gray-50 rounded-lg p-8 max-w-md mx-auto">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || statusFilter ? 'No se encontraron reservas' : 'No hay reservas'}
            </h3>
            <p className="text-gray-600 mb-4">
              {isAdminView 
                ? searchTerm || statusFilter 
                  ? 'Intenta cambiar los filtros de búsqueda'
                  : 'No hay reservas registradas en el sistema'
                : searchTerm || statusFilter
                  ? 'Intenta cambiar los filtros de búsqueda'
                  : 'No has hecho ninguna reserva aún'
              }
            </p>
            {(searchTerm || statusFilter) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('');
                }}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationsList;