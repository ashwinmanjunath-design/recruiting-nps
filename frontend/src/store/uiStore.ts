import { create } from 'zustand';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface UIState {
  // Toast notifications
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  
  // Loading states
  isGlobalLoading: boolean;
  setGlobalLoading: (loading: boolean) => void;
  
  // Sidebar
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  
  // Modals
  openModals: string[];
  openModal: (modalId: string) => void;
  closeModal: (modalId: string) => void;
  isModalOpen: (modalId: string) => boolean;
}

export const useUIStore = create<UIState>((set, get) => ({
  toasts: [],
  
  addToast: (toast) => {
    const id = Math.random().toString(36).substring(7);
    const newToast: Toast = { ...toast, id };
    
    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));
    
    // Auto-remove after duration
    if (toast.duration !== 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, toast.duration || 5000);
    }
  },
  
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
  
  isGlobalLoading: false,
  setGlobalLoading: (loading) => set({ isGlobalLoading: loading }),
  
  isSidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  
  openModals: [],
  
  openModal: (modalId) => {
    set((state) => ({
      openModals: [...state.openModals, modalId],
    }));
  },
  
  closeModal: (modalId) => {
    set((state) => ({
      openModals: state.openModals.filter((id) => id !== modalId),
    }));
  },
  
  isModalOpen: (modalId) => {
    return get().openModals.includes(modalId);
  },
}));

