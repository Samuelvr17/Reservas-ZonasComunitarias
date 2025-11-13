import React from 'react';
import { MapPin, Users, Clock, Calendar, Edit, Trash2, CreditCard } from 'lucide-react';
import { Space } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface SpaceCardProps {
  space: Space;
  onReserve?: (spaceId: string) => void;
  onEdit?: (space: Space) => void;
  onDelete?: (spaceId: string) => void;
}

const SpaceCard: React.FC<SpaceCardProps> = ({ space, onReserve, onEdit, onDelete }) => {
  const { user } = useAuth();

  const getTypeColor = (type: string) => {
    const colors = {
      deportivo: 'bg-blue-100 text-blue-800',
      social: 'bg-green-100 text-green-800',
      cultural: 'bg-purple-100 text-purple-800',
      bbq: 'bg-orange-100 text-orange-800',
      auditorio: 'bg-indigo-100 text-indigo-800',
      salon: 'bg-pink-100 text-pink-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
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
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {space.imageUrl && (
        <div className="h-48 overflow-hidden">
          <img
            src={space.imageUrl}
            alt={space.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{space.name}</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(space.type)}`}>
              {getTypeName(space.type)}
            </span>
          </div>
          
          {user?.role === 'admin' && (
            <div className="flex space-x-2">
              {onEdit && (
                <button
                  onClick={() => onEdit(space)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                  title="Editar espacio"
                >
                  <Edit className="h-4 w-4" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(space.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  title="Eliminar espacio"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        </div>

        <p className="text-gray-600 mb-4 line-clamp-2">{space.description}</p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-500">
            <Users className="h-4 w-4 mr-2" />
            <span>Capacidad: {space.capacity} personas</span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="h-4 w-4 mr-2" />
            <span>Horario: {space.operatingHours.start} - {space.operatingHours.end}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <MapPin className="h-4 w-4 mr-2" />
            <span className={`px-2 py-1 rounded-full text-xs ${
              space.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {space.isActive ? 'Disponible' : 'No disponible'}
            </span>
          </div>
        </div>

        {space.requiresPayment && (
          <div className="mb-4 rounded-lg border border-blue-100 bg-blue-50 p-4">
            <div className="flex items-center mb-3">
              <CreditCard className="h-4 w-4 text-blue-600 mr-2" />
              <h4 className="text-sm font-semibold text-blue-800">Este espacio requiere pago previo</h4>
            </div>
            {space.paymentMethods.length > 0 ? (
              <ul className="text-xs text-blue-800 space-y-2">
                {space.paymentMethods.map((method, index) => (
                  <li key={`${method.label}-${index}`} className="flex flex-col">
                    <span className="font-medium">{method.label}</span>
                    <span className="font-mono tracking-wide">{method.accountNumber}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-blue-700">
                Comunícate con la administración para conocer los métodos de pago disponibles.
              </p>
            )}
          </div>
        )}

        {space.rules && space.rules.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Reglas principales:</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              {space.rules.slice(0, 2).map((rule, index) => (
                <li key={index} className="flex items-start">
                  <span className="inline-block w-1 h-1 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                  <span>{rule}</span>
                </li>
              ))}
              {space.rules.length > 2 && (
                <li className="text-blue-600">+{space.rules.length - 2} más...</li>
              )}
            </ul>
          </div>
        )}

        {space.isActive && onReserve && (
          <button
            onClick={() => onReserve(space.id)}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            <Calendar className="h-4 w-4" />
            <span>Reservar</span>
          </button>
        )}

        {!space.isActive && (
          <div className="w-full bg-gray-100 text-gray-500 py-2 px-4 rounded-md text-center">
            Espacio no disponible
          </div>
        )}
      </div>
    </div>
  );
};

export default SpaceCard;