export interface User {
  id: string;
  email: string;
  identificationNumber: string;
  fullName: string;
  phone: string;
  role: 'admin' | 'user';
  createdAt: string;
  isActive: boolean;
}

export interface PaymentMethod {
  label: string;
  accountNumber: string;
}

export interface Space {
  id: string;
  name: string;
  type: 'deportivo' | 'social' | 'cultural' | 'bbq' | 'auditorio' | 'salon';
  capacity: number;
  description: string;
  operatingHours: {
    start: string;
    end: string;
  };
  rules: string[];
  isActive: boolean;
  imageUrl?: string;
  requiresPayment: boolean;
  paymentMethods: PaymentMethod[];
}

export type PaymentStatus = 'not_required' | 'pending' | 'submitted' | 'verified';

export interface Reservation {
  id: string;
  spaceId: string;
  spaceName: string;
  userId: string;
  userName: string;
  userContact: string;
  date: string;
  startTime: string;
  endTime: string;
  event: string;
  status: 'confirmed' | 'upcoming' | 'in-progress' | 'completed' | 'cancelled';
  createdAt: string;
  requiresPayment: boolean;
  paymentStatus: PaymentStatus;
  paymentProofUrl?: string;
  paymentVerifiedAt?: string | null;
  paymentVerifiedBy?: string | null;
}

export interface AddReservationPayload {
  spaceId: string;
  spaceName: string;
  userId: string;
  userName: string;
  userContact: string;
  date: string;
  startTime: string;
  endTime: string;
  event: string;
  requiresPayment: boolean;
}

export interface AuthContextType {
  user: User | null;
  login: (
    identificationNumber: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  register: (userData: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
  updateProfile: (updates: UpdateProfilePayload) => Promise<{ success: boolean; error?: string }>;
}

export interface RegisterData {
  email: string;
  identificationNumber: string;
  fullName: string;
  phone: string;
  password: string;
}

export interface UpdateProfilePayload {
  fullName: string;
  email: string;
  phone: string;
  identificationNumber?: string;
  password?: string;
}

export interface SpaceContextType {
  spaces: Space[];
  spacesError: string | null;
  loadSpaces: () => Promise<void>;
  addSpace: (space: Omit<Space, 'id'>) => Promise<boolean>;
  updateSpace: (id: string, space: Partial<Space>) => Promise<boolean>;
  deleteSpace: (id: string) => void;
  getSpace: (id: string) => Space | undefined;
  isLoadingSpaces: boolean;
}

export interface ReservationContextType {
  reservations: Reservation[];
  reservationsError: string | null;
  reloadReservations: () => Promise<void>;
  addReservation: (reservation: AddReservationPayload) => Promise<boolean>;
  cancelReservation: (id: string) => void;
  getUserReservations: (userId: string) => Reservation[];
  getSpaceReservations: (spaceId: string, date?: string) => Reservation[];
  fetchSpaceSchedule: (spaceId: string, date: string) => Promise<Reservation[]>;
  isTimeSlotAvailable: (spaceId: string, date: string, startTime: string, endTime: string) => Promise<boolean>;
  maxAdvanceDays: number | null;
  maxConcurrentReservations: number | null;
  isSettingsLoading: boolean;
  settingsError: string | null;
  updateReservationPayment: (
    id: string,
    updates: {
      paymentStatus?: PaymentStatus;
      paymentProofUrl?: string | null;
    }
  ) => Promise<void>;
  uploadPaymentProof: (reservationId: string, file: File) => Promise<string>;
}
