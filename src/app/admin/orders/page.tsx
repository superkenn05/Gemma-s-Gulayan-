
"use client";

import { useRouter } from 'next/navigation';
import { ChevronLeft, Loader2, Package, Search, Truck, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  useFirestore, 
  useCollection, 
  useMemoFirebase, 
  updateDocumentNonBlocking,
  addDocumentNonBlocking 
} from '@/firebase';
import { collectionGroup, query, orderBy, doc, collection, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { Order, UserProfile } from '@/types';
import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { sendOrderEmail } from '@/lib/email-service';

export default function AdminOrdersPage() {
  const router = useRouter();
  const db = useFirestore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');

  // We use collectionGroup to find all orders across all user profiles
  const ordersQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collectionGroup(db, 'orders'), orderBy('createdAt', 'desc'));
  }, [db]);

  const { data: orders, isLoading } = useCollection<Order>(ordersQuery);

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    return orders.filter(o => 
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [orders, searchTerm]);

  const updateOrderStatus = async (order: Order, newStatus: Order['status']) => {
    if (!db) return;

    // The order document is nested under userProfiles/{userId}/orders/{orderId}
    const orderRef = doc(db, 'userProfiles', order.userId, 'orders', order.id);
    
    updateDocumentNonBlocking(orderRef, { status: newStatus });

    // 1. Create Internal Notification
    const notifyColRef = collection(db, 'userProfiles', order.userId, 'notifications');
    addDocumentNonBlocking(notifyColRef, {
      title: 'Order Status Update',
      message: `Your order #${order.id.slice(0, 8)} is now ${newStatus.toUpperCase()}.`,
      type: newStatus === 'delivered' ? 'success' : 'info',
      isRead: false,
      createdAt: serverTimestamp(),
    });

    // 2. Fetch user profile for email
    try {
      const userDoc = await getDocs(query(collection(db, 'userProfiles'), where('id', '==', order.userId)));
      const profile = userDoc.docs[0]?.data() as UserProfile;

      if (profile?.email) {
        // Map data to match the screenshot template structure
        await sendOrderEmail({
          email: profile.email,
          order_id: order.id.toUpperCase(),
          orders: order.items.map(i => ({
            name: i.name,
            price: `₱${(Number(i.pricePerUnit) || 0).toFixed(2)}`,
            units: `${i.quantity} units`
          })),
          cost: {
            shipping: '0.00',
            tax: '0.00',
            total: order.total.toFixed(2)
          },
          // Keep additional context for status update
          message: `Your harvest status: ${newStatus.toUpperCase()}.`
        });
      }
    } catch (e) {
      console.error('Failed to notify via email:', e);
    }

    toast({
      title: "Order Updated",
      description: `Order status set to ${newStatus}. User has been notified.`,
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur p-4 border-b">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-xl font-black font-headline tracking-tight">Order Management</h1>
        </div>
      </header>

      <main className="p-4 space-y-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search by Order ID or Status..." 
            className="pl-9 h-12 rounded-2xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <div className="py-20 text-center space-y-4">
              <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
              <p className="text-sm font-bold text-muted-foreground uppercase">Fetching Orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-20 text-center space-y-4 bg-white rounded-3xl border border-dashed">
              <Package className="w-12 h-12 text-muted-foreground/20 mx-auto" />
              <p className="text-sm text-muted-foreground font-bold">No orders found</p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-3xl p-5 border shadow-sm space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Order ID</p>
                    <p className="font-black text-sm">#{order.id.slice(0, 8).toUpperCase()}</p>
                  </div>
                  <Badge className={cn(
                    "capitalize",
                    order.status === 'delivered' ? "bg-green-500" : "bg-primary"
                  )}>
                    {order.status}
                  </Badge>
                </div>

                <div className="space-y-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{item.name} x{item.quantity}</span>
                      <span className="font-bold">₱{(item.pricePerUnit * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-dashed flex justify-between items-center">
                  <span className="text-xs font-bold">Total Payable</span>
                  <span className="text-lg font-black text-primary">₱{order.total.toFixed(2)}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="rounded-xl h-10 font-bold"
                    onClick={() => updateOrderStatus(order, 'shipped')}
                    disabled={order.status === 'shipped' || order.status === 'delivered'}
                  >
                    <Truck className="w-4 h-4 mr-2" />
                    Ship
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="rounded-xl h-10 font-bold"
                    onClick={() => updateOrderStatus(order, 'delivered')}
                    disabled={order.status === 'delivered'}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Complete
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
