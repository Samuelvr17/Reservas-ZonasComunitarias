import { Space, User, Reservation } from '../types';

export const initialSpaces: Space[] = [
  {
    id: '1',
    name: 'Cancha de Fútbol Principal',
    type: 'deportivo',
    capacity: 22,
    description: 'Cancha de césped sintético con iluminación nocturna, ideal para partidos de fútbol.',
    operatingHours: { start: '07:00', end: '22:00' },
    rules: [
      'Usar zapatos deportivos adecuados',
      'Máximo 2 horas por reserva',
      'Dejar el espacio limpio después del uso',
      'No fumar en las instalaciones'
    ],
    isActive: true,
    imageUrl: 'https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg',
    requiresPayment: false,
    paymentMethods: [],
  },
  {
    id: '2',
    name: 'Salón de Eventos Aurora',
    type: 'social',
    capacity: 100,
    description: 'Amplio salón para celebraciones, reuniones familiares y eventos sociales.',
    operatingHours: { start: '10:00', end: '23:00' },
    rules: [
      'Capacidad máxima 100 personas',
      'Decoración permitida con previa autorización',
      'Limpieza obligatoria al finalizar',
      'No se permite música después de las 22:00'
    ],
    isActive: true,
    imageUrl: 'https://images.pexels.com/photos/1395967/pexels-photo-1395967.jpeg',
    requiresPayment: true,
    paymentMethods: [
      {
        label: 'Transferencia bancaria - Banco Nacional',
        accountNumber: 'Cuenta Corriente 0123456789'
      },
      {
        label: 'Nequi',
        accountNumber: '+57 300 987 6543'
      }
    ],
  },
  {
    id: '3',
    name: 'Zona BBQ Los Pinos',
    type: 'bbq',
    capacity: 30,
    description: 'Área al aire libre con parrillas, mesas y zona verde para asados familiares.',
    operatingHours: { start: '08:00', end: '20:00' },
    rules: [
      'Traer carbón y utensilios propios',
      'Limpiar parrillas después del uso',
      'No dejar brasas encendidas',
      'Depositar basura en contenedores'
    ],
    isActive: true,
    imageUrl: 'https://images.pexels.com/photos/1260968/pexels-photo-1260968.jpeg',
    requiresPayment: false,
    paymentMethods: [],
  },
  {
    id: '4',
    name: 'Auditorio Central',
    type: 'auditorio',
    capacity: 150,
    description: 'Moderno auditorio con sistema de sonido profesional y proyección.',
    operatingHours: { start: '09:00', end: '21:00' },
    rules: [
      'Solicitar capacitación para uso del equipo',
      'Máximo 4 horas por reserva',
      'Prohibido consumir alimentos',
      'Uso de micrófono solo con autorización'
    ],
    isActive: true,
    imageUrl: 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg',
    requiresPayment: true,
    paymentMethods: [
      {
        label: 'Pago en ventanilla - Cuenta de ahorros 5566778899',
        accountNumber: 'Banco Comunitario'
      }
    ],
  }
];

export const initialAdminUser: User = {
  id: 'admin-001',
  email: 'admin@comunidad.com',
  identificationNumber: '900123456',
  fullName: 'Administrador Principal',
  phone: '+57 300 123 4567',
  role: 'admin',
  createdAt: new Date().toISOString(),
  isActive: true
};

export const sampleReservations: Reservation[] = [
  {
    id: 'res-001',
    spaceId: '1',
    spaceName: 'Cancha de Fútbol Principal',
    userId: 'admin-001',
    userName: 'Administrador Principal',
    userContact: '+57 300 123 4567',
    date: new Date().toISOString().split('T')[0],
    startTime: '10:00',
    endTime: '12:00',
    event: 'Partido de fútbol vecinos',
    status: 'confirmed',
    createdAt: new Date().toISOString(),
    requiresPayment: false,
    paymentStatus: 'not_required',
    paymentProofUrl: undefined,
    paymentVerifiedAt: null,
    paymentVerifiedBy: null,
  }
];