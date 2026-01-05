import api from './config';

export interface Notification {
  id: number;
  userId: number;
  type: string;
  title: string;
  message: string;
  data: any;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsResponse {
  items: Notification[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UnreadCountResponse {
  count: number;
}

export interface NotificationFilters {
  startDate?: string;
  endDate?: string;
  type?: string;
  isRead?: boolean;
  search?: string;
}

export interface NotificationApi {
  getAll: (page?: number, limit?: number, filters?: NotificationFilters) => Promise<NotificationsResponse>;
  getUnreadCount: () => Promise<UnreadCountResponse>;
  markAsRead: (id: number) => Promise<Notification>;
  markAllAsRead: () => Promise<{ success: boolean }>;
}

export const notificationApi: NotificationApi = {
  getAll: async (page = 1, limit = 20, filters) => {
    const params: any = { page, limit };
    
    if (filters) {
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.type) params.type = filters.type;
      if (filters.isRead !== undefined) params.isRead = filters.isRead;
      if (filters.search) params.search = filters.search;
    }

    const response = await api.get<NotificationsResponse>('/notifications', {
      params,
    });
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await api.get<UnreadCountResponse>('/notifications/unread-count');
    return response.data;
  },

  markAsRead: async (id: number) => {
    const response = await api.patch<Notification>(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.patch<{ success: boolean }>('/notifications/read-all');
    return response.data;
  },
};
