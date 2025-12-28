import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

type ModalType = 'export' | 'settings' | 'help' | 'auth' | 'confirm' | 'keyboard-shortcuts' | null;
type SidebarTab = 'text' | 'format' | 'export' | 'ai';

interface UIStore {
  // Modal State
  modalType: ModalType;
  modalData: unknown;
  isModalOpen: boolean;
  
  openModal: (type: ModalType, data?: unknown) => void;
  closeModal: () => void;

  // Sidebar State
  isSidebarOpen: boolean;
  sidebarTab: SidebarTab;
  
  toggleSidebar: () => void;
  setSidebarTab: (tab: SidebarTab) => void;

  // Loading States
  isFFmpegLoading: boolean;
  ffmpegLoadProgress: number;
  isVideoLoading: boolean;
  
  setFFmpegLoading: (isLoading: boolean, progress?: number) => void;
  setVideoLoading: (isLoading: boolean) => void;

  // Timeline State
  timelineZoom: number;
  isTimelineDragging: boolean;
  
  setTimelineZoom: (zoom: number) => void;
  setTimelineDragging: (isDragging: boolean) => void;

  // Canvas State
  isCanvasEditing: boolean;
  setCanvasEditing: (isEditing: boolean) => void;

  // Notifications
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;

  // Responsive
  isMobile: boolean;
  setIsMobile: (isMobile: boolean) => void;

  // Preferences
  showKeyboardShortcuts: boolean;
  toggleKeyboardShortcuts: () => void;
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

let notificationId = 0;

export const useUIStore = create<UIStore>()(
  devtools(
    (set) => ({
      // Modal State
      modalType: null,
      modalData: null,
      isModalOpen: false,

      openModal: (type, data) => set({
        modalType: type,
        modalData: data,
        isModalOpen: true,
      }),

      closeModal: () => set({
        modalType: null,
        modalData: null,
        isModalOpen: false,
      }),

      // Sidebar State
      isSidebarOpen: true,
      sidebarTab: 'text',

      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      setSidebarTab: (tab) => set({ sidebarTab: tab, isSidebarOpen: true }),

      // Loading States
      isFFmpegLoading: false,
      ffmpegLoadProgress: 0,
      isVideoLoading: false,

      setFFmpegLoading: (isLoading, progress = 0) => set({
        isFFmpegLoading: isLoading,
        ffmpegLoadProgress: progress,
      }),

      setVideoLoading: (isLoading) => set({ isVideoLoading: isLoading }),

      // Timeline State
      timelineZoom: 1,
      isTimelineDragging: false,

      setTimelineZoom: (zoom) => set({ timelineZoom: Math.max(0.5, Math.min(3, zoom)) }),
      setTimelineDragging: (isDragging) => set({ isTimelineDragging: isDragging }),

      // Canvas State
      isCanvasEditing: false,
      setCanvasEditing: (isEditing) => set({ isCanvasEditing: isEditing }),

      // Notifications
      notifications: [],

      addNotification: (notification) => {
        const id = `notification-${++notificationId}`;
        set((state) => ({
          notifications: [...state.notifications, { ...notification, id }],
        }));

        // Auto-remove after duration
        const duration = notification.duration ?? 5000;
        if (duration > 0) {
          setTimeout(() => {
            set((state) => ({
              notifications: state.notifications.filter((n) => n.id !== id),
            }));
          }, duration);
        }
      },

      removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      })),

      clearNotifications: () => set({ notifications: [] }),

      // Responsive
      isMobile: false,
      setIsMobile: (isMobile) => set({ isMobile }),

      // Preferences
      showKeyboardShortcuts: false,
      toggleKeyboardShortcuts: () => set((state) => ({
        showKeyboardShortcuts: !state.showKeyboardShortcuts,
      })),
    }),
    { name: 'UIStore' }
  )
);

