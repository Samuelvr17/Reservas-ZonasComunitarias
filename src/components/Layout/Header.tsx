import React, { useState } from 'react';
import { User, LogOut, Settings, Calendar, Home, UserCircle, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, onViewChange }) => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!user) return null;

  const handleNavigation = (view: string) => {
    onViewChange(view);
    setMobileMenuOpen(false);
  };

  const navigationItems = user.role === 'admin'
    ? [
        { id: 'dashboard', label: 'Inicio', icon: Home },
        { id: 'spaces', label: 'Espacios', icon: Calendar },
        { id: 'calendar', label: 'Calendario', icon: Calendar },
        { id: 'all-reservations', label: 'Todas las Reservas', icon: Calendar },
        { id: 'profile', label: 'Mi Perfil', icon: UserCircle },
        { id: 'admin-panel', label: 'Panel Admin', icon: Settings },
      ]
    : [
        { id: 'dashboard', label: 'Inicio', icon: Home },
        { id: 'spaces', label: 'Espacios', icon: Calendar },
        { id: 'calendar', label: 'Calendario', icon: Calendar },
        { id: 'my-reservations', label: 'Mis Reservas', icon: Calendar },
        { id: 'profile', label: 'Mi Perfil', icon: UserCircle },
      ];

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

            <nav className="hidden md:flex space-x-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium smooth-transition ${
                      currentView === item.id
                        ? 'text-blue-600 bg-blue-50 shadow-sm'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
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
            <div className="space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item.id)}
                    className={`flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-sm font-medium smooth-transition ${
                      currentView === item.id
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
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