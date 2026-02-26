'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import PageHeader from '@/components/shared/page-header';
import { notificationApi, Notification } from '@/lib/api/notifications';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Loader2, CheckCheck, Check, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Pagination } from '@/components/ui/pagination';
import { NotificationFilterForm } from '@/components/entities/notifications/filters/notification-filter';
import { useAuth } from '@/context/auth.context';
import { useRegistrarList } from '@/hooks/query/use-registrars';

const PAGE_SIZE = 20;

type Filters = {
  search?: string;
  startDate?: string;
  endDate?: string;
  type?: string;
  status?: string;
  workflowStatus?: string;
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const currentPage = Number(searchParams.get('page') || '1');

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [paginationMeta, setPaginationMeta] = useState({
    total: 0,
    totalPages: 1,
  });

  const [filters, setFilters] = useState<Filters>({});

  // WIP dialog
  const [wipDialogOpen, setWipDialogOpen] = useState(false);
  const [wipTarget, setWipTarget] = useState<Notification | null>(null);
  const [selectedAssignee, setSelectedAssignee] = useState<string>('');

  // Confirm dialog (resolve / ignore)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<Notification | null>(null);
  const [confirmAction, setConfirmAction] = useState<'resolved' | 'ignored' | null>(null);

  // Contact dialog
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [contactTarget, setContactTarget] = useState<Notification | null>(null);

  // Fetch all registrars for WIP assignee dropdown
  const { data: registrarsData } = useRegistrarList({ limit: 100 });
  const registrars = registrarsData?.registrars ?? [];

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const apiFilters: any = {};
        if (filters.search) apiFilters.search = filters.search;
        if (filters.startDate) apiFilters.startDate = filters.startDate;
        if (filters.endDate) apiFilters.endDate = filters.endDate;
        if (filters.type && filters.type !== 'all') apiFilters.type = filters.type;
        if (filters.status && filters.status !== 'all') apiFilters.isRead = filters.status === 'read';
        if (filters.workflowStatus && filters.workflowStatus !== 'all') {
          apiFilters.workflowStatus = filters.workflowStatus;
        }

        const data = await notificationApi.getAll(currentPage, PAGE_SIZE, apiFilters);
        setNotifications(data.items);
        setPaginationMeta({
          total: data.meta.total,
          totalPages: data.meta.totalPages,
        });
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [currentPage, filters]);

  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
    // Reset to page 1 when filters change
    const params = new URLSearchParams(searchParams.toString());
    params.delete('page');
    router.replace(`${pathname}?${params.toString()}`);
  };

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

    const { studentId, sessionId } = notification.data || {};

    if (studentId != null && sessionId != null) {
      router.push(`/student/${studentId}/session/${sessionId}`);
      return;
    }

    if (notification.type === 'schedule_cancelled' || notification.type === 'schedule_confirmed') {
      router.push('/schedule');
    } else if (notification.type === 'feedback_submitted') {
      router.push('/feedback');
    }
  };

  const handleWorkflowStatus = async (
    notification: Notification,
    status: 'wip' | 'resolved' | 'ignored',
    wipBy?: string,
  ) => {
    try {
      await notificationApi.updateWorkflowStatus(notification.id, status, wipBy);
      setNotifications(prev =>
        prev.map(n =>
          n.id === notification.id
            ? { ...n, workflowStatus: status, wipBy: wipBy ?? n.wipBy, isRead: true }
            : n
        )
      );
    } catch (error) {
      console.error('Failed to update workflow status:', error);
    }
  };

  const handleOpenConfirm = (
    notification: Notification,
    action: 'resolved' | 'ignored',
  ) => {
    setConfirmTarget(notification);
    setConfirmAction(action);
    setConfirmDialogOpen(true);
  };

  const handleConfirmAction = () => {
    if (confirmTarget && confirmAction) {
      handleWorkflowStatus(confirmTarget, confirmAction);
    }
    setConfirmDialogOpen(false);
    setConfirmTarget(null);
    setConfirmAction(null);
  };

  const handleOpenWipDialog = (notification: Notification) => {
    // Pre-select current user if they're in the registrar list, otherwise leave empty
    const match = registrars.find(r => r.name === user?.name);
    setSelectedAssignee(match ? String(match.id) : '');
    setWipTarget(notification);
    setWipDialogOpen(true);
  };

  const handleWipConfirm = () => {
    if (wipTarget && selectedAssignee) {
      const assignee = registrars.find(r => String(r.id) === selectedAssignee);
      handleWorkflowStatus(wipTarget, 'wip', assignee?.name ?? '');
    }
    setWipDialogOpen(false);
    setSelectedAssignee('');
    setWipTarget(null);
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
        {loading ? (
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
          <>
            <div className="w-full overflow-x-auto bg-white rounded-lg shadow-sm border" style={{ maxWidth: '100vw' }}>
              <div className="overflow-x-auto">
                <Table className="min-w-max w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="border h-30 text-center whitespace-nowrap min-w-[50px] font-semibold">No.</TableHead>
                      <TableHead className="border h-30 text-center whitespace-nowrap min-w-[130px] font-semibold">Status</TableHead>
                      <TableHead className="border h-30 text-center whitespace-nowrap min-w-[150px] font-semibold">Type</TableHead>
                      <TableHead className="border h-30 text-center whitespace-nowrap min-w-[300px] font-semibold">Message</TableHead>
                      <TableHead className="border h-30 text-center whitespace-nowrap min-w-[150px] font-semibold">Date</TableHead>
                      <TableHead className="border h-30 text-center whitespace-nowrap min-w-[150px] font-semibold">Student Name</TableHead>
                      <TableHead className="border h-30 text-center whitespace-nowrap min-w-[120px] font-semibold">Contact</TableHead>
                      <TableHead className="border h-30 text-center whitespace-nowrap min-w-[150px] font-semibold">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {notifications.map((notification, index) => (
                      <TableRow
                        key={notification.id}
                        className={cn(
                          'cursor-pointer transition-colors',
                          notification.workflowStatus === 'incoming' ? 'bg-blue-50/50 hover:bg-blue-50' :
                          notification.workflowStatus === 'wip' ? 'bg-yellow-50/50 hover:bg-yellow-50' :
                          'hover:bg-gray-50'
                        )}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <TableCell className="border h-30 text-center whitespace-nowrap px-2">
                          {(currentPage - 1) * PAGE_SIZE + index + 1}
                        </TableCell>
                        <TableCell className="border h-30 text-center whitespace-nowrap px-2">
                          {notification.workflowStatus === 'incoming' && (
                            <Badge className="bg-blue-500 hover:bg-blue-600">Incoming</Badge>
                          )}
                          {notification.workflowStatus === 'wip' && (
                            <div className="flex flex-col items-center gap-1">
                              <Badge className="bg-yellow-500 hover:bg-yellow-600">WIP</Badge>
                              {notification.wipBy && (
                                <span className="text-xs text-gray-500">{notification.wipBy}</span>
                              )}
                            </div>
                          )}
                          {notification.workflowStatus === 'resolved' && (
                            <Badge className="bg-green-500 hover:bg-green-600">Resolved</Badge>
                          )}
                          {notification.workflowStatus === 'ignored' && (
                            <Badge variant="secondary">Ignored</Badge>
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
                          {notification.data?.studentName ?? '—'}
                        </TableCell>
                        <TableCell className="border h-30 text-center whitespace-nowrap px-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setContactTarget(notification);
                              setContactDialogOpen(true);
                            }}
                          >
                            Contact
                          </Button>
                        </TableCell>
                        <TableCell className="border h-30 text-center whitespace-nowrap px-2">
                          {(notification.workflowStatus === 'incoming' || notification.workflowStatus === 'wip') && (
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                title="Mark as resolved"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenConfirm(notification, 'resolved');
                                }}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 text-xs font-semibold"
                                title="Assign to staff"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenWipDialog(notification);
                                }}
                              >
                                WIP
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                title="Ignore"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenConfirm(notification, 'ignored');
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={paginationMeta.totalPages}
              totalCount={paginationMeta.total}
              hasNext={currentPage < paginationMeta.totalPages}
              hasPrev={currentPage > 1}
              itemsPerPage={PAGE_SIZE}
              itemName="notifications"
            />
          </>
        )}
      </div>

      {/* Resolve / Ignore Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>
              {confirmAction === 'resolved' ? 'Mark as Resolved' : 'Ignore Notification'}
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 text-sm text-muted-foreground">
            {confirmAction === 'resolved'
              ? 'Are you sure you want to mark this notification as resolved? This indicates the issue has been handled.'
              : 'Are you sure you want to ignore this notification? It will be archived and no further action will be taken.'}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setConfirmDialogOpen(false);
                setConfirmTarget(null);
                setConfirmAction(null);
              }}
            >
              Cancel
            </Button>
            <Button
              className={confirmAction === 'resolved'
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-red-500 hover:bg-red-600 text-white'}
              onClick={handleConfirmAction}
            >
              {confirmAction === 'resolved' ? 'Resolve' : 'Ignore'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* WIP / Assign Dialog */}
      <Dialog open={wipDialogOpen} onOpenChange={setWipDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Assign Work In Progress</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label>Assign to</Label>
            <Select value={selectedAssignee} onValueChange={setSelectedAssignee}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select staff member..." />
              </SelectTrigger>
              <SelectContent>
                {registrars.map((r) => (
                  <SelectItem key={r.id} value={String(r.id)}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setWipDialogOpen(false);
                setSelectedAssignee('');
                setWipTarget(null);
              }}
            >
              Cancel
            </Button>
            <Button
              className="bg-yellow-500 hover:bg-yellow-600 text-white"
              disabled={!selectedAssignee}
              onClick={handleWipConfirm}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Contact Dialog */}
      <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Parent / Contact Info</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2 text-sm">
            <div>
              <span className="font-semibold">Parent Name: </span>
              {contactTarget?.data?.parentName ?? '—'}
            </div>
            <div>
              <span className="font-semibold">Phone: </span>
              {contactTarget?.data?.parentPhone ?? '—'}
            </div>
            <div>
              <span className="font-semibold">LINE ID: </span>
              {contactTarget?.data?.parentLine ?? '—'}
            </div>
            <div>
              <span className="font-semibold">Student: </span>
              {contactTarget?.data?.studentName ?? '—'}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
