import { useCallback, useState } from 'react';
import './ToastProvider.css';
import { ToastContext } from './toastContext';

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'error') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((previous) => [...previous, { id, message, type }]);
    window.setTimeout(() => setToasts((previous) => previous.filter((toast) => toast.id !== id)), 5000);
  }, []);

  const dismissToast = (id) => setToasts((previous) => previous.filter((toast) => toast.id !== id));

  return <ToastContext.Provider value={showToast}>
    {children}
    <div className="toast-stack" aria-live="polite">
      {toasts.map((toast) => <button className={`toast toast-${toast.type}`} type="button" onClick={() => dismissToast(toast.id)} key={toast.id}>{toast.message}</button>)}
    </div>
  </ToastContext.Provider>;
}
