import React, { useState } from 'react';
import { Settings, BarChart3, Users, MapPin, Calendar, Plus, ArrowRight } from 'lucide-react';
import { useSpaces } from '../../context/SpaceContext';
import { useReservations } from '../../context/ReservationContext';
import { getTodayLocalISO, parseLocalDate } from '../../utils/dateUtils';
import SpaceForm from '../Spaces/SpaceForm';
import Breadcrumb from '../Common/Breadcrumb';

type AdminPanelProps = {
  onManageUsers?: () => void;
  onShowReports?: () => void;
  onOpenAdvancedSettings?: () => void;
};

const AdminPanel: React.FC<AdminPanelProps> = ({
  onManageUsers,
  onShowReports,
  onOpenAdvancedSettings,
}) => {
  const { spaces } = useSpaces();
  const { reservations } = useReservations();
  const [showSpaceForm, setShowSpaceForm] = useState(false);

  const activeSpaces = spaces.filter(space => space.isActive);
  const inactiveSpaces = spaces.filter(space => !space.isActive);
  const totalReservations = reservations.filter(r => r.status !== 'cancelled').length;
  const todayReservations = reservations.filter(r =>
    r.date === getTodayLocalISO() && r.status !== 'cancelled'
  ).length;

  const spaceTypeStats = spaces.reduce((acc, space) => {
    acc[space.type] = (acc[space.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const monthlyReservations = reservations.reduce((acc, reservation) => {
    const reservationDate = parseLocalDate(reservation.date);
    const monthKey = `${reservationDate.getFullYear()}-${String(reservationDate.getMonth() + 1).padStart(2, '0')}`;
    acc[monthKey] = (acc[monthKey] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const getTypeColor = (type: string) => {
    const colors = {
      deportivo: 'bg-blue-500',
      social: 'bg-green-500',
      cultural: 'bg-purple-500',
      bbq: 'bg-orange-500',
      auditorio: 'bg-indigo-500',
      salon: 'bg-pink-500',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-500';
  };

  const getTypeName = (type: string) => {
    const names = {
      deportivo: 'Deportivo',
      social: 'Social',
      cultural: 'Cultural',
      bbq: 'BBQ',
      auditorio: 'Auditorio',
      salon: 'Salón',
    };
    return names[type as keyof typeof names] || type;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb
        items={[
          { label: 'Inicio', onClick: () => window.location.reload() },
          { label: 'Panel Administrativo' },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Panel Administrativo</h1>
          <p className="text-gray-600 mt-2">
            Gestiona espacios, configuración y revisa estadísticas del sistema
          </p>
        </div>

        <button
          onClick={() => setShowSpaceForm(true)}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 smooth-transition flex items-center space-x-2 shadow-sm hover:shadow-md"
        >
          <Plus className="h-5 w-5" />
          <span className="font-medium">Nuevo Espacio</span>
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md smooth-transition p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-blue-500 shadow-sm">
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Espacios Activos</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{activeSpaces.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm hover:shadow-md smooth-transition p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-green-500 shadow-sm">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Reservas</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalReservations}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm hover:shadow-md smooth-transition p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-orange-500 shadow-sm">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Reservas Hoy</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{todayReservations}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm hover:shadow-md smooth-transition p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-red-500 shadow-sm">
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Espacios Inactivos</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{inactiveSpaces.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Space Types Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
            Distribución por Tipo
          </h2>
          <div className="space-y-3">
            {Object.entries(spaceTypeStats).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded ${getTypeColor(type)}`}></div>
                  <span className="text-gray-700">{getTypeName(type)}</span>
                </div>
                <span className="font-medium text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Reservations */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-green-600" />
            Reservas por Mes
          </h2>
          <div className="space-y-3">
            {Object.entries(monthlyReservations)
              .sort(([a], [b]) => b.localeCompare(a))
              .slice(0, 6)
              .map(([month, count]) => (
                <div key={month} className="flex items-center justify-between">
                  <span className="text-gray-700">
                    {parseLocalDate(`${month}-01`).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long'
                    })}
                  </span>
                  <span className="font-medium text-gray-900">{count} reservas</span>
                </div>
              ))}
          </div>
        </div>

        {/* System Configuration */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center">
            <Settings className="h-5 w-5 mr-2 text-slate-600" />
            Configuración del Sistema
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b">
              <div>
                <h3 className="font-medium text-gray-900">Tiempo mínimo de anticipación</h3>
                <p className="text-sm text-gray-600">Para hacer reservas</p>
              </div>
              <span className="text-blue-600 font-medium">24 horas</span>
            </div>
            
            <div className="flex justify-between items-center py-3 border-b">
              <div>
                <h3 className="font-medium text-gray-900">Duración máxima</h3>
                <p className="text-sm text-gray-600">Por reserva</p>
              </div>
              <span className="text-blue-600 font-medium">4 horas</span>
            </div>
            
            <div className="flex justify-between items-center py-3">
              <div>
                <h3 className="font-medium text-gray-900">Cancelación mínima</h3>
                <p className="text-sm text-gray-600">Anticipación requerida</p>
              </div>
              <span className="text-blue-600 font-medium">24 horas</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center">
            <Users className="h-5 w-5 mr-2 text-amber-600" />
            Acciones Rápidas
          </h2>
          <div className="space-y-3">
            <button
              onClick={onManageUsers}
              className="w-full text-left p-4 rounded-xl border-2 border-gray-100 hover:border-blue-500 hover:bg-blue-50 smooth-transition group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Gestionar Usuarios</h3>
                  <p className="text-sm text-gray-500">Ver y administrar usuarios registrados</p>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 smooth-transition" />
              </div>
            </button>

            <button
              onClick={onShowReports}
              className="w-full text-left p-4 rounded-xl border-2 border-gray-100 hover:border-green-500 hover:bg-green-50 smooth-transition group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Reportes</h3>
                  <p className="text-sm text-gray-500">Generar reportes de uso y ocupación</p>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-green-600 smooth-transition" />
              </div>
            </button>

            <button
              onClick={onOpenAdvancedSettings}
              className="w-full text-left p-4 rounded-xl border-2 border-gray-100 hover:border-amber-500 hover:bg-amber-50 smooth-transition group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Configuración Avanzada</h3>
                  <p className="text-sm text-gray-500">Ajustar reglas y parámetros del sistema</p>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-amber-600 smooth-transition" />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showSpaceForm && (
        <SpaceForm onClose={() => setShowSpaceForm(false)} />
      )}
    </div>
  );
};

export default AdminPanel;