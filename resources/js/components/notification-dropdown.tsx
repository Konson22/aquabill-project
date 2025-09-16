import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Bell, Check, CheckCheck, MoreHorizontal, X } from 'lucide-react';
import { useState } from 'react';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    timestamp: string;
    read: boolean;
    actionUrl?: string;
}

interface NotificationDropdownProps {
    className?: string;
}

// Mock notifications data - in a real app, this would come from props or API
const mockNotifications: Notification[] = [
    {
        id: '1',
        title: 'New Bill Generated',
        message: 'Bill #12345 has been generated for customer John Doe',
        type: 'success',
        timestamp: '2 minutes ago',
        read: false,
        actionUrl: '/billing/12345'
    },
    {
        id: '2',
        title: 'Payment Received',
        message: 'Payment of $150.00 received from Jane Smith',
        type: 'info',
        timestamp: '1 hour ago',
        read: false,
        actionUrl: '/payments'
    },
    {
        id: '3',
        title: 'Meter Reading Due',
        message: 'Meter readings are due for Area A customers',
        type: 'warning',
        timestamp: '3 hours ago',
        read: true,
        actionUrl: '/readings'
    },
    {
        id: '4',
        title: 'System Maintenance',
        message: 'Scheduled maintenance will occur tonight from 2-4 AM',
        type: 'info',
        timestamp: '1 day ago',
        read: true
    },
    {
        id: '5',
        title: 'Low Inventory Alert',
        message: 'Water meters inventory is running low',
        type: 'error',
        timestamp: '2 days ago',
        read: true,
        actionUrl: '/inventory'
    }
];

const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
        case 'success':
            return '✅';
        case 'warning':
            return '⚠️';
        case 'error':
            return '❌';
        case 'info':
        default:
            return 'ℹ️';
    }
};

const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
        case 'success':
            return 'text-green-600 dark:text-green-400';
        case 'warning':
            return 'text-yellow-600 dark:text-yellow-400';
        case 'error':
            return 'text-red-600 dark:text-red-400';
        case 'info':
        default:
            return 'text-blue-600 dark:text-blue-400';
    }
};

export function NotificationDropdown({ className }: NotificationDropdownProps) {
    const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
    const [isOpen, setIsOpen] = useState(false);

    const unreadCount = notifications.filter(n => !n.read).length;

    const markAsRead = (id: string) => {
        setNotifications(prev =>
            prev.map(notification =>
                notification.id === id
                    ? { ...notification, read: true }
                    : notification
            )
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev =>
            prev.map(notification => ({ ...notification, read: true }))
        );
    };

    const removeNotification = (id: string) => {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
    };

    const handleNotificationClick = (notification: Notification) => {
        markAsRead(notification.id);
        if (notification.actionUrl) {
            // In a real app, you'd navigate to the URL
            console.log('Navigate to:', notification.actionUrl);
        }
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                        "relative h-9 w-9 cursor-pointer group hover:bg-slate-100 dark:hover:bg-slate-800",
                        className
                    )}
                >
                    <Bell className="h-5 w-5 opacity-80 group-hover:opacity-100" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-80 rounded-xl border border-slate-200/60 bg-white/95 backdrop-blur-xl shadow-xl dark:border-slate-800/60 dark:bg-slate-900/95"
                align="end"
            >
                <div className="flex items-center justify-between p-4 pb-2">
                    <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100">Notifications</h3>
                        {unreadCount > 0 && (
                            <Badge variant="secondary" className="text-xs">
                                {unreadCount} new
                            </Badge>
                        )}
                    </div>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={markAllAsRead}
                            className="h-8 px-2 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                        >
                            <CheckCheck className="h-3 w-3 mr-1" />
                            Mark all read
                        </Button>
                    )}
                </div>

                <DropdownMenuSeparator />

                <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-8 text-center">
                            <Bell className="h-8 w-8 text-slate-400 mb-2" />
                            <p className="text-sm text-slate-500 dark:text-slate-400">No notifications</p>
                        </div>
                    ) : (
                        <div className="p-1">
                            {notifications.map((notification) => (
                                <DropdownMenuItem
                                    key={notification.id}
                                    className={cn(
                                        "flex items-start space-x-3 p-3 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 group",
                                        !notification.read && "bg-blue-50 dark:bg-blue-900/20"
                                    )}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div className="flex-shrink-0 mt-0.5">
                                        <span className="text-lg">
                                            {getNotificationIcon(notification.type)}
                                        </span>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 min-w-0">
                                                <p className={cn(
                                                    "text-sm font-medium truncate",
                                                    !notification.read && "font-semibold",
                                                    getNotificationColor(notification.type)
                                                )}>
                                                    {notification.title}
                                                </p>
                                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 overflow-hidden text-ellipsis" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                                    {notification.message}
                                                </p>
                                                <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                                                    {notification.timestamp}
                                                </p>
                                            </div>

                                            <div className="flex items-center space-x-1 ml-2">
                                                {!notification.read && (
                                                    <div className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0" />
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        removeNotification(notification.id);
                                                    }}
                                                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-slate-200 dark:hover:bg-slate-700"
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </DropdownMenuItem>
                            ))}
                        </div>
                    )}
                </div>

                {notifications.length > 0 && (
                    <>
                        <DropdownMenuSeparator />
                        <div className="p-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                            >
                                View all notifications
                            </Button>
                        </div>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
