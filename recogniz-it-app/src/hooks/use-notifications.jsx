import { toast } from "sonner";

export const useNotifications = () => {
  const showSuccess = (title, message) => {
    toast.success(title, {
      description: message,
      duration: 4000,
      style: {
        background: '#10b981',
        color: 'white',
        border: '1px solid #059669',
      },
    });
  };

  const showError = (title, message) => {
    toast.error(title, {
      description: message,
      duration: 5000,
      style: {
        background: '#ef4444',
        color: 'white',
        border: '1px solid #dc2626',
      },
    });
  };

  const showInfo = (title, message) => {
    toast.info(title, {
      description: message,
      duration: 4000,
      style: {
        background: '#3b82f6',
        color: 'white',
        border: '1px solid #2563eb',
      },
    });
  };

  const showWarning = (title, message) => {
    toast.warning(title, {
      description: message,
      duration: 4000,
      style: {
        background: '#f59e0b',
        color: 'white',
        border: '1px solid #d97706',
      },
    });
  };

  const showLoading = (title, message) => {
    return toast.loading(title, {
      description: message,
      style: {
        background: '#6b7280',
        color: 'white',
        border: '1px solid #4b5563',
      },
    });
  };

  return {
    showSuccess,
    showError,
    showInfo,
    showWarning,
    showLoading,
  };
}; 