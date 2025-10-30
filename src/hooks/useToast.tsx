import React, { createContext, useCallback, useContext, useState } from 'react';
import ToastContainer, { ToastMessage } from '../components/Common/ToastContainer';
import { ToastType } from '../components/Common/Toast';

type ToastInput = string | { message: string; type?: ToastType };

interface ToastContextValue {
  addToast: (toast: ToastInput, type?: ToastType) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const useToastState = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((toast: ToastInput, defaultType: ToastType = 'info') => {
    const { message, type } = typeof toast === 'string'
      ? { message: toast, type: defaultType }
      : { message: toast.message, type: toast.type ?? 'info' };

    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return {
    toasts,
    addToast,
    removeToast,
  };
};

export const ToastProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { toasts, addToast, removeToast } = useToastState();

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  return context;
};
