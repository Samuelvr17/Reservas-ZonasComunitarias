import React, { useEffect, useMemo, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  User,
  LogOut,
  Calendar,
  Home,
  UserCircle,
  Menu,
  X,
  MapPin,
  ListChecks,
  Users,
  LayoutDashboard,
  BarChart3,
  SlidersHorizontal,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

interface NavigationItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface NavigationGroup {
  id: string;
  label: string;
  items: NavigationItem[];
}

const Header: React.FC<HeaderProps> = ({ currentView, onViewChange }) => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openMobileGroups, setOpenMobileGroups] = useState<Record<string, boolean>>({});

  const handleNavigation = (view: string) => {
    onViewChange(view);
    setMobileMenuOpen(false);
  };

  const navigationGroups = useMemo<NavigationGroup[]>(() => {
    if (!user) {
      return [];
    }

    const reservationId = user.role === 'admin' ? 'all-reservations' : 'my-reservations';
    const reservationLabel = user.role === 'admin' ? 'Todas las Reservas' : 'Mis Reservas';

    const groups: NavigationGroup[] = [
      {
        id: 'primary',
        label: 'Vistas principales',
        items: [
          { id: 'dashboard', label: 'Inicio', icon: Home },
          { id: 'spaces', label: 'Espacios', icon: MapPin },
          { id: 'calendar', label: 'Calendario', icon: Calendar },
          { id: reservationId, label: reservationLabel, icon: ListChecks },
        ],
      },
      {
        id: 'account',
        label: 'Mi cuenta',
        items: [{ id: 'profile', label: 'Mi Perfil', icon: UserCircle }],
      },
    ];

    if (user.role === 'admin') {
      groups.push({
        id: 'admin',
        label: 'Administración',
        items: [
          { id: 'admin-panel', label: 'Panel General', icon: LayoutDashboard },
          { id: 'admin-users', label: 'Gestión de Usuarios', icon: Users },
          { id: 'admin-reports', label: 'Reportes', icon: BarChart3 },
          {
            id: 'admin-advanced-settings',
            label: 'Configuración Avanzada',
            icon: SlidersHorizontal,
          },
        ],
      });
    }

    return groups;
  }, [user]);

  useEffect(() => {
    setOpenMobileGroups((prev) => {
      const nextState: Record<string, boolean> = {};
      navigationGroups.forEach((group) => {
        nextState[group.id] = prev[group.id] ?? true;
      });
      return nextState;
    });
  }, [navigationGroups]);

  if (!user) return null;

  const renderNavGroup = (
    group: NavigationGroup,
    options: { variant: 'desktop' | 'mobile'; isOpen?: boolean; onToggle?: () => void },
  ) => {
    if (options.variant === 'mobile') {
      return (
        <div key={group.id} className="rounded-xl border border-gray-200 bg-gray-50 shadow-sm">
          <button
            type="button"
            onClick={options.onToggle}
            className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold text-gray-800"
          >
            <span>{group.label}</span>
            <ChevronDown
              className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
                options.isOpen ? 'rotate-180' : 'rotate-0'
              }`}
            />
          </button>
          <div className={`${options.isOpen ? 'block' : 'hidden'} border-t border-gray-200 bg-white`}>
            <div className="space-y-1 px-2 py-3">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item.id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`flex w-full items-center space-x-3 rounded-lg px-4 py-3 text-sm font-medium smooth-transition ${
                      isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        key={group.id}
        className="flex min-w-[180px] flex-col space-y-2 border-l border-gray-200 pl-6 first:border-none first:pl-0"
      >
        <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
          {group.label}
        </span>
        <div className="flex items-center space-x-2">
          {group.items.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center space-x-2 rounded-lg px-4 py-2 text-sm font-medium smooth-transition ${
                  isActive ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <Calendar className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">
                Espacios Comunitarios
              </h1>
            </div>

            <nav className="hidden md:flex items-center space-x-6">
              {navigationGroups.map((group) =>
                renderNavGroup(group, { variant: 'desktop' }),
              )}
            </nav>
          </div>

          <div className="flex items-center space-x-3">
            <div className="hidden lg:flex items-center space-x-3">
              <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                user.role === 'admin'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}>
                {user.role === 'admin' ? 'Administrador' : 'Usuario'}
              </div>
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  {user.fullName}
                </span>
              </div>
            </div>

            <button
              onClick={logout}
              className="hidden md:flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 smooth-transition"
            >
              <LogOut className="h-4 w-4" />
              <span>Salir</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 smooth-transition"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white animate-fade-in">
          <div className="px-4 py-3">
            <div className="mb-3 pb-3 border-b border-gray-200">
              <div className="flex items-center space-x-2 mb-2">
                <User className="h-5 w-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-900">{user.fullName}</span>
              </div>
              <div className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                user.role === 'admin'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}>
                {user.role === 'admin' ? 'Administrador' : 'Usuario'}
              </div>
            </div>
            <div className="space-y-3">
              {navigationGroups.map((group) =>
                renderNavGroup(group, {
                  variant: 'mobile',
                  isOpen: openMobileGroups[group.id],
                  onToggle: () =>
                    setOpenMobileGroups((prev) => ({
                      ...prev,
                      [group.id]: !prev[group.id],
                    })),
                }),
              )}
              <button
                onClick={logout}
                className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 smooth-transition"
              >
                <LogOut className="h-5 w-5" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;