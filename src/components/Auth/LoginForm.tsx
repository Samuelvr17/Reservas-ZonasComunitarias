import React, { useState } from 'react';
import { Calendar, Eye, EyeOff, User, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { RegisterData } from '../../types';
import { useToast } from '../../hooks/useToast';

const LoginForm: React.FC = () => {
  const { login, register } = useAuth();
  const { addToast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginErrors, setLoginErrors] = useState<{ identificationNumber?: string; password?: string }>({});
  const [registerErrors, setRegisterErrors] =
    useState<Partial<Record<keyof RegisterData, string>>>({});

  const [loginData, setLoginData] = useState({
    identificationNumber: '',
    password: ''
  });

  const [registerData, setRegisterData] = useState<RegisterData>({
    email: '',
    identificationNumber: '',
    fullName: '',
    phone: '',
    password: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const trimmedIdentification = loginData.identificationNumber.trim();
    const trimmedPassword = loginData.password.trim();

    const newErrors: { identificationNumber?: string; password?: string } = {};

    if (!trimmedIdentification) {
      newErrors.identificationNumber = 'Ingresa tu número de identificación.';
    }

    if (!trimmedPassword) {
      newErrors.password = 'Ingresa tu contraseña.';
    }

    if (Object.keys(newErrors).length > 0) {
      setLoginErrors(newErrors);
      setLoading(false);
      return;
    }

    setLoginErrors({});

    const result = await login(trimmedIdentification, trimmedPassword);

    if (!result.success) {
      setError(result.error ?? 'No se pudo iniciar sesión. Inténtalo nuevamente.');
    }
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const trimmedData = {
      fullName: registerData.fullName.trim(),
      email: registerData.email.trim(),
      identificationNumber: registerData.identificationNumber.trim(),
      phone: registerData.phone.trim(),
      password: registerData.password
    };

    const newErrors: Partial<Record<keyof RegisterData, string>> = {};

    if (!trimmedData.fullName) {
      newErrors.fullName = 'Ingresa tu nombre completo.';
    }

    if (!trimmedData.email) {
      newErrors.email = 'Ingresa tu correo electrónico.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (trimmedData.email && !emailRegex.test(trimmedData.email)) {
      newErrors.email = 'Ingresa un correo electrónico válido.';
    }

    if (!trimmedData.identificationNumber) {
      newErrors.identificationNumber = 'Ingresa tu número de identificación.';
    } else {
      const idNumberDigits = trimmedData.identificationNumber.replace(/\D/g, '');
      if (idNumberDigits.length < 6) {
        newErrors.identificationNumber = 'El número de identificación debe tener al menos 6 dígitos.';
      }
    }

    if (!trimmedData.phone) {
      newErrors.phone = 'Ingresa tu número de teléfono.';
    } else {
      const phoneDigits = trimmedData.phone.replace(/\D/g, '');
      if (phoneDigits.length < 7) {
        newErrors.phone = 'Ingresa un número de teléfono válido.';
      }
    }

    if (!trimmedData.password) {
      newErrors.password = 'Ingresa una contraseña.';
    } else if (trimmedData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres.';
    }

    if (Object.keys(newErrors).length > 0) {
      setRegisterErrors(newErrors);
      setLoading(false);
      return;
    }

    setRegisterErrors({});

    const result = await register(trimmedData);
    if (!result.success) {
      setError(result.error ?? 'No se pudo crear la cuenta.');
      setLoading(false);
      return;
    }
    addToast({ message: 'Cuenta creada con éxito. Ahora puedes iniciar sesión.', type: 'success' });
    setIsLogin(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <Calendar className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">
            Espacios Comunitarios
          </h1>
          <p className="text-gray-600 mt-2">
            Sistema de Reservas
          </p>
        </div>

        <div className="flex mb-6">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 text-sm font-medium rounded-l-md border transition-colors ${
              isLogin
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            <User className="h-4 w-4 inline mr-2" />
            Iniciar Sesión
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 text-sm font-medium rounded-r-md border-t border-r border-b transition-colors ${
              !isLogin
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            <UserPlus className="h-4 w-4 inline mr-2" />
            Registrarse
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {isLogin ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de identificación
              </label>
              <input
                type="text"
                value={loginData.identificationNumber}
                onChange={(e) => {
                  const value = e.target.value;
                  setLoginData({ ...loginData, identificationNumber: value });
                  setLoginErrors((prev) => ({ ...prev, identificationNumber: undefined }));
                }}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  loginErrors.identificationNumber
                    ? 'border-red-400 focus:ring-red-200'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="Ingrese su número de identificación"
                required
                aria-invalid={Boolean(loginErrors.identificationNumber)}
              />
              {loginErrors.identificationNumber && (
                <p className="mt-1 text-sm text-red-600">{loginErrors.identificationNumber}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={loginData.password}
                  onChange={(e) => {
                    const value = e.target.value;
                    setLoginData({ ...loginData, password: value });
                    setLoginErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    loginErrors.password
                      ? 'border-red-400 focus:ring-red-200'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  placeholder="Ingrese su contraseña"
                  required
                  aria-invalid={Boolean(loginErrors.password)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {loginErrors.password && (
                <p className="mt-1 text-sm text-red-600">{loginErrors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Ingresando...' : 'Iniciar Sesión'}
            </button>

          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre completo
              </label>
              <input
                type="text"
                value={registerData.fullName}
                onChange={(e) => {
                  const value = e.target.value;
                  setRegisterData({ ...registerData, fullName: value });
                  setRegisterErrors((prev) => ({ ...prev, fullName: undefined }));
                }}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  registerErrors.fullName
                    ? 'border-red-400 focus:ring-red-200'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="Ej: Juan Pérez"
                autoComplete="name"
                required
                aria-invalid={Boolean(registerErrors.fullName)}
              />
              {registerErrors.fullName && (
                <p className="mt-1 text-sm text-red-600">{registerErrors.fullName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correo electrónico
              </label>
              <input
                type="email"
                value={registerData.email}
                onChange={(e) => {
                  const value = e.target.value;
                  setRegisterData({ ...registerData, email: value });
                  setRegisterErrors((prev) => ({ ...prev, email: undefined }));
                }}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  registerErrors.email
                    ? 'border-red-400 focus:ring-red-200'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="correo@ejemplo.com"
                autoComplete="email"
                required
                aria-invalid={Boolean(registerErrors.email)}
              />
              <p className="mt-1 text-xs text-gray-500">
                Se almacena solo como dato de contacto; la autenticación usa un correo sintético basado en la identificación.
              </p>
              {registerErrors.email && (
                <p className="mt-1 text-sm text-red-600">{registerErrors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de identificación
              </label>
              <input
                type="text"
                value={registerData.identificationNumber}
                onChange={(e) => {
                  const value = e.target.value;
                  setRegisterData({ ...registerData, identificationNumber: value });
                  setRegisterErrors((prev) => ({ ...prev, identificationNumber: undefined }));
                }}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  registerErrors.identificationNumber
                    ? 'border-red-400 focus:ring-red-200'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="1234567890"
                inputMode="numeric"
                autoComplete="off"
                required
                aria-invalid={Boolean(registerErrors.identificationNumber)}
              />
              {registerErrors.identificationNumber && (
                <p className="mt-1 text-sm text-red-600">{registerErrors.identificationNumber}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <input
                type="tel"
                value={registerData.phone}
                onChange={(e) => {
                  const value = e.target.value;
                  setRegisterData({ ...registerData, phone: value });
                  setRegisterErrors((prev) => ({ ...prev, phone: undefined }));
                }}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  registerErrors.phone
                    ? 'border-red-400 focus:ring-red-200'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="+57 300 123 4567"
                autoComplete="tel"
                required
                aria-invalid={Boolean(registerErrors.phone)}
              />
              {registerErrors.phone && (
                <p className="mt-1 text-sm text-red-600">{registerErrors.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={registerData.password}
                  onChange={(e) => {
                    const value = e.target.value;
                    setRegisterData({ ...registerData, password: value });
                    setRegisterErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    registerErrors.password
                      ? 'border-red-400 focus:ring-red-200'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
                  aria-invalid={Boolean(registerErrors.password)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {registerErrors.password && (
                <p className="mt-1 text-sm text-red-600">{registerErrors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Registrando...' : 'Crear Cuenta'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginForm;