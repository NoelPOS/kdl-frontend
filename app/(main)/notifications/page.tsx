'use client';

import { useState, useEffect, useCallback } from 'react';
import PageHeader from '@/components/shared/page-header';
import { notificationApi, Notification } from '@/lib/api/notifications';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Loader2, CheckCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// ... (other imports)
import { NotificationFilterForm } from '@/components/entities/notifications/filters/notification-filter';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // Store filter values in a single state object to pass to fetch
  const [filters, setFilters] = useState<{
    search?: string;
    startDate?: string;
    endDate?: string;
    type?: string;
    status?: string;
  }>({});

  const router = useRouter();

  // Unified fetch function
  const fetchNotifications = useCallback(async (pageNum: number, currentFilters = filters) => {
    setLoading(true);
    try {
      const apiFilters: any = {
        limit: 20,
        page: pageNum,
      };
      
      if (currentFilters.search) apiFilters.search = currentFilters.search;
      if (currentFilters.startDate) apiFilters.startDate = currentFilters.startDate;
      if (currentFilters.endDate) apiFilters.endDate = currentFilters.endDate;
      if (currentFilters.type && currentFilters.type !== 'all') apiFilters.type = currentFilters.type;
      if (currentFilters.status !== 'all' && currentFilters.status) apiFilters.isRead = currentFilters.status === 'read';

      const data = await notificationApi.getAll(pageNum, 20, apiFilters);
      
      if (pageNum === 1) {
        setNotifications(data.items);
      } else {
        setNotifications(prev => [...prev, ...data.items]);
      }
      setHasMore(data.meta.page < data.meta.totalPages);
      setPage(pageNum);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Initial fetch
  useEffect(() => {
    fetchNotifications(1);
  }, [fetchNotifications]);

  const loadMore = () => {
    fetchNotifications(page + 1);
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    // Reset to page 1 and fetch immediately with new filters
    // use setTimeout to ensure state update has propagated or just use the passed value
    // In this case, since fetch is now useCallback'd on 'filters', setting filters will trigger it? 
    // No, we want to trigger it explicitly but safely.
    // Actually, simply calling fetchNotifications(1, newFilters) is correct.
    fetchNotifications(1, newFilters);
  };
  
  // ... markAllAsRead and handleNotificationClick methods remain same ...
  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      try {
        await notificationApi.markAsRead(notification.id);
        setNotifications(prev => 
          prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
        );
      } catch (error) {
        console.error('Failed to mark as read:', error);
      }
    }
    
    // Navigation logic
    if (notification.type === 'schedule_cancelled' || notification.type === 'schedule_confirmed') {
      const { studentId, sessionId, scheduleId } = notification.data || {};
      if (studentId && sessionId) {
         router.push(`/student/${studentId}/session/${sessionId}`);
      } else if (scheduleId) {
        // Fallback for old notifications/data without session info
        router.push(`/schedules/${scheduleId}`); 
      }
    } else if (notification.type === 'feedback_submitted') {
       // Always redirect to feedback page as per user request
       router.push(`/feedback`);
    }
  };

  return (
    <div className="p-6">
      <PageHeader title="Notifications">
         <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
          <CheckCheck className="w-4 h-4 mr-2" />
          Mark all read
        </Button>
      </PageHeader>
      
      <NotificationFilterForm onFilter={handleFilterChange} />

      <div className="space-y-4">
        {loading && page === 1 ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : notifications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <p>No notifications found.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="w-full overflow-x-auto bg-white rounded-lg shadow-sm border mb-10 relative" style={{ maxWidth: '100vw' }}>
            <div className="overflow-x-auto">
              <Table className="min-w-max w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="border h-30 text-center whitespace-nowrap min-w-[50px] font-semibold">No.</TableHead>
                  <TableHead className="border h-30 text-center whitespace-nowrap min-w-[100px] font-semibold">Status</TableHead>
                  <TableHead className="border h-30 text-center whitespace-nowrap min-w-[150px] font-semibold">Type</TableHead>
                  <TableHead className="border h-30 text-center whitespace-nowrap min-w-[300px] font-semibold">Message</TableHead>
                  <TableHead className="border h-30 text-center whitespace-nowrap min-w-[150px] font-semibold">Date</TableHead>
                  <TableHead className="border h-30 text-center whitespace-nowrap min-w-[100px] font-semibold">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notifications.map((notification, index) => (
                  <TableRow 
                    key={notification.id}
                    className={cn(
                      "cursor-pointer transition-colors",
                      !notification.isRead ? "bg-blue-50/50 hover:bg-blue-50" : "hover:bg-gray-50"
                    )}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <TableCell className="border h-30 text-center whitespace-nowrap px-2">
                       {(page - 1) * 20 + index + 1}
                    </TableCell>
                    <TableCell className="border h-30 text-center whitespace-nowrap px-2">
                      {!notification.isRead ? (
                         <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">New</Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">Read</span>
                      )}
                    </TableCell>
                    <TableCell className="border h-30 text-center whitespace-nowrap px-2 font-medium">
                      {notification.title}
                    </TableCell>
                    <TableCell className="border h-30 text-center px-2 text-muted-foreground max-w-md whitespace-normal">
                      {notification.message}
                    </TableCell>
                    <TableCell className="border h-30 text-center whitespace-nowrap px-2 text-muted-foreground">
                      {format(new Date(notification.createdAt), 'MMM d, yyyy HH:mm')}
                    </TableCell>
                    <TableCell className="border h-30 text-center whitespace-nowrap px-2">
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNotificationClick(notification);
                          }}
                          title="Mark as read"
                        >
                          <CheckCheck className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              </Table>
            </div>
          </div>
        )}

        {hasMore && !loading && (
          <div className="flex justify-center pt-4">
            <Button variant="ghost" onClick={loadMore}>
              Load More
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
