"use client";

import { useRouter } from 'next/navigation';
import { ChevronLeft, ShoppingBag, Clock, CheckCircle2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Order } from '@/types';
import { Badge } from '@/components/ui/badge';

export default function OrdersPage() {
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();

  const ordersQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'userProfiles', user.uid, 'orders'), orderBy('createdAt', 'desc'));
  }, [db, user]);

  const { data: orders, isLoading } = useCollection<Order>(ordersQuery);

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur p-4 flex items-center space-x-4 border-b">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-xl font-black font-headline">My Orders</h1>
      </header>

      <main className="p-4 space-y-4">
        {isLoading ? (
          <div className="py-20 text-center space-y-4">
            <Clock className="w-12 h-12 text-muted-foreground animate-pulse mx-auto" />
            <p className="text-muted-foreground font-medium">Loading your orders...</p>
          </div>
        ) : !orders || orders.length === 0 ? (
          <div className="py-20 text-center space-y-6">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto">
              <ShoppingBag className="w-10 h-10 text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-bold">No orders yet</h2>
              <p className="text-muted-foreground text-sm max-w-[200px] mx-auto">You haven't placed any orders yet. Start shopping to see them here!</p>
            </div>
            <Button onClick={() => router.push('/products')} className="rounded-xl px-8 h-12">Browse Products</Button>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl p-4 shadow-sm border space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Order ID</p>
                  <p className="font-black text-sm">#{order.id.slice(0, 8).toUpperCase()}</p>
                </div>
                <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'} className="capitalize">
                  {order.status}
                </Badge>
              </div>
              
              <div className="space-y-2">
                {order.items.map((item, idx) => {
                  const itemPrice = Number(item.pricePerUnit) || 0;
                  return (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-muted-foreground font-medium">{item.name} x{item.quantity}</span>
                      <span className="font-bold">₱{(itemPrice * item.quantity).toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-dashed flex justify-between items-center">
                <span className="text-sm font-bold">Total Amount</span>
                <span className="text-lg font-black text-primary">₱{(Number(order.total) || 0).toFixed(2)}</span>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}