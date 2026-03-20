
"use client";

import { useRouter } from 'next/navigation';
import { ChevronLeft, Bell, Trash2, CheckCircle2, Info, AlertCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  useUser, 
  useFirestore, 
  useCollection, 
  useMemoFirebase, 
  updateDocumentNonBlocking,
  deleteDocumentNonBlocking 
} from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { Notification } from '@/types';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationsPage() {
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();

  const notificationsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'userProfiles', user.uid, 'notifications'),
      orderBy('createdAt', 'desc')
    );
  }, [db, user]);

  const { data: notifications, isLoading } = useCollection<Notification>(notificationsQuery);

  const markAsRead = (id: string) => {
    if (!db || !user) return;
    const docRef = doc(db, 'userProfiles', user.uid, 'notifications', id);
    updateDocumentNonBlocking(docRef, { isRead: true });
  };

  const deleteNotification = (id: string) => {
    if (!db || !user) return;
    const docRef = doc(db, 'userProfiles', user.uid, 'notifications', id);
    deleteDocumentNonBlocking(docRef);
  };

  const markAllAsRead = () => {
    if (!notifications || !db || !user) return;
    notifications.forEach(n => {
      if (!n.isRead) markAsRead(n.id);
    });
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'alert': return <AlertCircle className="w-5 h-5 text-destructive" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur p-4 flex items-center justify-between border-b">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-xl font-black font-headline">Notifications</h1>
        </div>
        {notifications && notifications.length > 0 && (
          <Button variant="ghost" size="sm" className="text-primary font-bold text-xs" onClick={markAllAsRead}>
            Mark all read
          </Button>
        )}
      </header>

      <main className="p-4 space-y-3">
        {isLoading ? (
          <div className="py-20 text-center space-y-4">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-muted-foreground font-medium">Checking for updates...</p>
          </div>
        ) : !notifications || notifications.length === 0 ? (
          <div className="py-20 text-center space-y-6">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto">
              <Bell className="w-10 h-10 text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-bold">No notifications yet</h2>
              <p className="text-muted-foreground text-sm max-w-[250px] mx-auto">
                We'll notify you about your orders, promos, and fresh arrivals here.
              </p>
            </div>
            <Button onClick={() => router.push('/')} className="rounded-xl px-8 h-12">Continue Shopping</Button>
          </div>
        ) : (
          notifications.map((n) => (
            <div 
              key={n.id} 
              className={cn(
                "bg-white rounded-2xl p-4 shadow-sm border flex items-start space-x-4 transition-colors relative group",
                !n.isRead ? "border-primary/30 bg-primary/5" : "border-border/50"
              )}
              onClick={() => !n.isRead && markAsRead(n.id)}
            >
              <div className={cn(
                "p-2.5 rounded-xl shrink-0",
                n.type === 'success' ? "bg-green-100" : n.type === 'alert' ? "bg-red-100" : "bg-blue-100"
              )}>
                {getIcon(n.type)}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex justify-between items-start">
                  <h3 className={cn("text-sm font-bold leading-tight", !n.isRead ? "text-foreground" : "text-muted-foreground")}>
                    {n.title}
                  </h3>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(n.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <p className={cn("text-xs leading-relaxed", !n.isRead ? "text-muted-foreground font-medium" : "text-muted-foreground/60")}>
                  {n.message}
                </p>
                <div className="flex items-center space-x-1 pt-1">
                  <Clock className="w-3 h-3 text-muted-foreground/40" />
                  <span className="text-[10px] text-muted-foreground/60 font-bold">
                    {n.createdAt?.seconds ? formatDistanceToNow(new Date(n.createdAt.seconds * 1000), { addSuffix: true }) : 'Just now'}
                  </span>
                </div>
              </div>
              {!n.isRead && (
                <div className="absolute top-4 right-4 w-2 h-2 bg-primary rounded-full" />
              )}
            </div>
          ))
        )}
      </main>
    </div>
  );
}
