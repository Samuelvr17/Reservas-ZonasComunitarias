import React, { useEffect, useState } from 'react';
import { Calendar, Clock, MapPin, Users, UserCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSpaces } from '../../context/SpaceContext';
import { useReservations } from '../../context/ReservationContext';
import { formatDate, isToday, isTomorrow, parseLocalDate } from '../../utils/dateUtils';
import { supabase } from '../../lib/supabase';
import EmptyState from '../Common/EmptyState';

interface DashboardProps {
  onViewChange: (view: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onViewChange }) => {
  const { user } = useAuth();
  const { spaces } = useSpaces();
  const { reservations, reservationsError, reloadReservations, getUserReservations } = useReservations();
  const [userCount, setUserCount] = useState<number | null>(null);
  const [isLoadingUserCount, setIsLoadingUserCount] = useState<boolean>(true);
  const [userCountError, setUserCountError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchUserCount = async () => {
      setIsLoadingUserCount(true);
      try {
        const { error, count } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        if (error) throw error;

        if (isMounted) {
          setUserCount(count ?? 0);
          setUserCountError(null);
        }
      } catch (error) {
        if (isMounted) {
          setUserCountError('No se pudo obtener el total de usuarios registrados.');
        }
      } finally {
        if (isMounted) {
          setIsLoadingUserCount(false);
        }
      }
    };

    fetchUserCount();

    return () => {
      isMounted = false;
    };
  }, []);

  if (!user) return null;

  const activeSpaces = spaces.filter(space => space.isActive);
  const userReservations = getUserReservations(user.id);
  const todayReservations = reservations.filter(res => isToday(res.date) && res.status !== 'cancelled');
  const now = new Date();
  const upcomingReservations = userReservations
    .filter(res => {
      const reservationDate = parseLocalDate(res.date);
      return reservationDate >= now && res.status !== 'cancelled';
    })
    .slice(0, 3);

  const stats = user.role === 'admin' 
    ? [
        { label: 'Espacios Activos', value: activeSpaces.length, icon: MapPin, color: 'blue' },
        { label: 'Reservas Hoy', value: todayReservations.length, icon: Calendar, color: 'green' },
        { label: 'Total Reservas', value: reservations.filter(r => r.status !== 'cancelled').length, icon: Users, color: 'purple' },
        {
          label: 'Usuarios Registrados',
          value: isLoadingUserCount ? '...' : userCount ?? 0,
          icon: Users,
          color: 'orange',
        },
      ]
    : [
        { label: 'Mis Reservas', value: userReservations.length, icon: Calendar, color: 'blue' },
        { label: 'Próximas', value: upcomingReservations.length, icon: Clock, color: 'green' },
        { label: 'Espacios Disponibles', value: activeSpaces.length, icon: MapPin, color: 'purple' },
      ];

  const getStatColor = (color: string) => {
    const colors = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      purple: 'bg-purple-500',
      orange: 'bg-orange-500',
    };
    return colors[color as keyof typeof colors];
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Bienvenido, {user.fullName}
        </h1>
        <p className="text-gray-600 mt-2">
          {user.role === 'admin' 
            ? 'Panel de administración de espacios comunitarios' 
            : 'Gestiona tus reservas de espacios comunitarios'
          }
        </p>
      </div>

      {reservationsError && (
        <div className="mb-8 bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
          <p className="font-medium">{reservationsError}</p>
          <button
            onClick={reloadReservations}
            className="mt-3 inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      )}

      {userCountError && (
        <div className="mb-8 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg p-4">
          <p className="font-medium">{userCountError}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm hover:shadow-md smooth-transition p-6 border border-gray-100">
              <div className="flex items-center">
                <div className={`p-3 rounded-xl ${getStatColor(stat.color)} shadow-sm`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-5">Acciones Rápidas</h2>
          <div className="space-y-3">
            <button
              onClick={() => onViewChange('spaces')}
              className="w-full text-left p-4 rounded-xl border-2 border-gray-100 hover:border-blue-500 hover:bg-blue-50 smooth-transition group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-blue-100 group-hover:bg-blue-200 smooth-transition">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="font-semibold text-gray-900">Ver Espacios</h3>
                    <p className="text-sm text-gray-500">Explora los espacios disponibles</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 smooth-transition" />
              </div>
            </button>

            <button
              onClick={() => onViewChange('calendar')}
              className="w-full text-left p-4 rounded-xl border-2 border-gray-100 hover:border-sky-500 hover:bg-sky-50 smooth-transition group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-sky-100 group-hover:bg-sky-200 smooth-transition">
                    <Calendar className="h-5 w-5 text-sky-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="font-semibold text-gray-900">Calendario de reservas</h3>
                    <p className="text-sm text-gray-500">Visualiza disponibilidad mensual y semanal</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-sky-600 smooth-transition" />
              </div>
            </button>

            <button
              onClick={() => onViewChange(user.role === 'admin' ? 'all-reservations' : 'my-reservations')}
              className="w-full text-left p-4 rounded-xl border-2 border-gray-100 hover:border-green-500 hover:bg-green-50 smooth-transition group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-green-100 group-hover:bg-green-200 smooth-transition">
                    <Clock className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="font-semibold text-gray-900">
                      {user.role === 'admin' ? 'Gestionar Reservas' : 'Mis Reservas'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {user.role === 'admin' ? 'Ver todas las reservas del sistema' : 'Administra tus reservas'}
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-green-600 smooth-transition" />
              </div>
            </button>

            <button
              onClick={() => onViewChange('profile')}
              className="w-full text-left p-4 rounded-xl border-2 border-gray-100 hover:border-slate-500 hover:bg-slate-50 smooth-transition group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-slate-100 group-hover:bg-slate-200 smooth-transition">
                    <UserCircle className="h-5 w-5 text-slate-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="font-semibold text-gray-900">Mi Perfil</h3>
                    <p className="text-sm text-gray-500">Actualiza tus datos personales y de contacto</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-slate-600 smooth-transition" />
              </div>
            </button>

            {user.role === 'admin' && (
              <button
                onClick={() => onViewChange('admin-panel')}
                className="w-full text-left p-4 rounded-xl border-2 border-gray-100 hover:border-amber-500 hover:bg-amber-50 smooth-transition group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2 rounded-lg bg-amber-100 group-hover:bg-amber-200 smooth-transition">
                      <Users className="h-5 w-5 text-amber-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="font-semibold text-gray-900">Panel Administrativo</h3>
                      <p className="text-sm text-gray-500">Gestionar espacios y configuración</p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-amber-600 smooth-transition" />
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-5">
            {user.role === 'admin' ? 'Actividad Reciente' : 'Próximas Reservas'}
          </h2>
          
          {user.role === 'admin' ? (
            <div className="space-y-4">
              {todayReservations.slice(0, 5).map((reservation) => (
                <div key={reservation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">{reservation.spaceName}</h3>
                    <p className="text-sm text-gray-500">
                      {reservation.userName} - {reservation.startTime} - {reservation.endTime}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    reservation.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    reservation.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {reservation.status === 'confirmed' ? 'Confirmada' :
                     reservation.status === 'upcoming' ? 'Próxima' : 'En progreso'}
                  </span>
                </div>
              ))}
              {todayReservations.length === 0 && (
                <EmptyState
                  icon={Calendar}
                  title="Sin actividad hoy"
                  description="No hay reservas programadas para hoy"
                />
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingReservations.map((reservation) => (
                <div key={reservation.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-900">{reservation.spaceName}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      isToday(reservation.date) ? 'bg-red-100 text-red-800' :
                      isTomorrow(reservation.date) ? 'bg-orange-100 text-orange-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {isToday(reservation.date) ? 'Hoy' :
                       isTomorrow(reservation.date) ? 'Mañana' :
                       formatDate(reservation.date)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    {reservation.startTime} - {reservation.endTime}
                  </p>
                  <p className="text-sm text-gray-500">{reservation.event}</p>
                </div>
              ))}
              {upcomingReservations.length === 0 && (
                <EmptyState
                  icon={Calendar}
                  title="No tienes reservas próximas"
                  description="Explora los espacios disponibles y haz tu primera reserva"
                  actionLabel="Explorar espacios"
                  onAction={() => onViewChange('spaces')}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;