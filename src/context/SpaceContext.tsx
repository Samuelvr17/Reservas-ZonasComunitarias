import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { PaymentMethod, Space, SpaceContextType } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const SpaceContext = createContext<SpaceContextType | undefined>(undefined);

const SPACES_FETCH_TIMEOUT_MS = 8000;

type SupabaseSpaceRecord = {
  id: string;
  name: string;
  type: string;
  capacity: number;
  description: string | null;
  operating_hours_start: string;
  operating_hours_end: string;
  rules: string[] | null;
  is_active: boolean;
  image_url: string | null;
  requires_payment: boolean;
  payment_methods: { label?: string; accountNumber?: string; account_number?: string }[] | null;
};

export const useSpaces = () => {
  const context = useContext(SpaceContext);
  if (context === undefined) {
    throw new Error('useSpaces must be used within a SpaceProvider');
  }
  return context;
};

interface SpaceProviderProps {
  children: ReactNode;
}

export const SpaceProvider: React.FC<SpaceProviderProps> = ({ children }) => {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [spacesError, setSpacesError] = useState<string | null>(null);
  const [isLoadingSpaces, setIsLoadingSpaces] = useState<boolean>(false);
  const { user, isLoading } = useAuth();

  const sanitizePaymentMethods = (methods?: PaymentMethod[]) =>
    (methods ?? [])
      .map(method => ({
        label: method.label.trim(),
        accountNumber: method.accountNumber.trim()
      }))
      .filter(method => method.label !== '' || method.accountNumber !== '');

  const loadSpaces = useCallback(async () => {
    if (!user) {
      setSpaces([]);
      setSpacesError(null);
      setIsLoadingSpaces(false);
      return;
    }

    setIsLoadingSpaces(true);

    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    try {
      const fetchPromise = supabase
        .from('spaces')
        .select('*')
        .order('created_at', { ascending: false });

      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error('timeout'));
        }, SPACES_FETCH_TIMEOUT_MS);
      });

      const response = await Promise.race([fetchPromise, timeoutPromise]) as {
        data: SupabaseSpaceRecord[] | null;
        error: { message?: string } | null;
      };

      const { data, error } = response;

      if (error) {
        setSpacesError(error.message || 'No se pudieron cargar los espacios.');
        return;
      }

      setSpacesError(null);

      if (data) {
        const formattedSpaces: Space[] = data.map(space => ({
          id: space.id,
          name: space.name,
          type: space.type as Space['type'],
          capacity: space.capacity,
          description: space.description ?? '',
          operatingHours: {
            start: space.operating_hours_start,
            end: space.operating_hours_end
          },
          rules: space.rules || [],
          isActive: space.is_active,
          imageUrl: space.image_url || undefined,
          requiresPayment: Boolean(space.requires_payment),
          paymentMethods: (space.payment_methods ?? []).map((method): PaymentMethod => ({
            label: method.label ?? '',
            accountNumber: method.accountNumber ?? method.account_number ?? ''
          })).filter(method => method.label.trim() !== '' || method.accountNumber.trim() !== '')
        }));
        setSpaces(formattedSpaces);
      } else {
        setSpaces([]);
      }
    } catch (err) {
      if (err instanceof Error && err.message === 'timeout') {
        setSpacesError('La carga de espacios está tardando más de lo esperado. Intenta nuevamente.');
      } else {
        console.error('Error loading spaces:', err);
        setSpacesError('Ocurrió un error inesperado al cargar los espacios.');
      }
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      setIsLoadingSpaces(false);
    }
  }, [user]);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!user) {
      setSpaces([]);
      setSpacesError(null);
      setIsLoadingSpaces(false);
      return;
    }

    void loadSpaces();
  }, [user, isLoading, loadSpaces]);

  useEffect(() => {
    const channel = supabase
      .channel('spaces-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'spaces' }, () => {
        if (user) {
          void loadSpaces();
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, loadSpaces]);

  const addSpace = async (spaceData: Omit<Space, 'id'>): Promise<boolean> => {
    const { error } = await supabase
      .from('spaces')
      .insert({
        name: spaceData.name,
        type: spaceData.type,
        capacity: spaceData.capacity,
        description: spaceData.description,
        operating_hours_start: spaceData.operatingHours.start,
        operating_hours_end: spaceData.operatingHours.end,
        rules: spaceData.rules,
        is_active: spaceData.isActive,
        image_url: spaceData.imageUrl,
        requires_payment: spaceData.requiresPayment,
        payment_methods: sanitizePaymentMethods(spaceData.paymentMethods)
      });

    if (error) {
      throw new Error(error.message || 'No se pudo crear el espacio.');
    }

    await loadSpaces();
    return true;
  };

  const updateSpace = async (id: string, spaceData: Partial<Space>): Promise<boolean> => {
    const updateData: Record<string, unknown> = {};

    if (spaceData.name !== undefined) updateData.name = spaceData.name;
    if (spaceData.type !== undefined) updateData.type = spaceData.type;
    if (spaceData.capacity !== undefined) updateData.capacity = spaceData.capacity;
    if (spaceData.description !== undefined) updateData.description = spaceData.description;
    if (spaceData.operatingHours !== undefined) {
      updateData.operating_hours_start = spaceData.operatingHours.start;
      updateData.operating_hours_end = spaceData.operatingHours.end;
    }
    if (spaceData.rules !== undefined) updateData.rules = spaceData.rules;
    if (spaceData.isActive !== undefined) updateData.is_active = spaceData.isActive;
    if (spaceData.imageUrl !== undefined) updateData.image_url = spaceData.imageUrl;
    if (spaceData.requiresPayment !== undefined) updateData.requires_payment = spaceData.requiresPayment;
    if (spaceData.paymentMethods !== undefined) {
      updateData.payment_methods = sanitizePaymentMethods(spaceData.paymentMethods);
    }

    const { error } = await supabase
      .from('spaces')
      .update(updateData)
      .eq('id', id);

    if (error) {
      throw new Error(error.message || 'No se pudo actualizar el espacio.');
    }

    await loadSpaces();
    return true;
  };

  const deleteSpace = async (id: string) => {
    const { error } = await supabase
      .from('spaces')
      .delete()
      .eq('id', id);

    if (!error) {
      await loadSpaces();
    }
  };

  const getSpace = (id: string): Space | undefined => {
    return spaces.find(space => space.id === id);
  };

  const value: SpaceContextType = {
    spaces,
    spacesError,
    loadSpaces,
    addSpace,
    updateSpace,
    deleteSpace,
    getSpace,
    isLoadingSpaces
  };

  return (
    <SpaceContext.Provider value={value}>
      {children}
    </SpaceContext.Provider>
  );
};