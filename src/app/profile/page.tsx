
"use client";

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ChevronRight, Settings, ShoppingBag, MapPin, CreditCard, LogOut, Star, PackageSearch, MessageSquare, Loader2, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BottomNav } from '@/components/layout/bottom-nav';
import { useAuth, useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { useEffect, useMemo } from 'react';
import { doc } from 'firebase/firestore';
import { UserProfile } from '@/types';
import { cn } from '@/lib/utils';

export default function ProfilePage() {
  const router = useRouter();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const db = useFirestore();

  const staffQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'staffUsers', user.uid);
  }, [db, user]);
  
  const { data: staffData } = useDoc(staffQuery);
  const isAdmin = useMemo(() => {
    return staffData?.role === 'Admin' || staffData?.role === 'Superadmin';
  }, [staffData]);

  const menuItems = [
    { label: 'My Orders', icon: ShoppingBag, color: 'bg-blue-100 text-blue-600', path: '/profile/orders' },
    { label: 'My Reviews', icon: MessageSquare, color: 'bg-purple-100 text-purple-600', path: '/profile/reviews' },
    { label: 'Priority List', icon: Star, color: 'bg-yellow-100 text-yellow-600', path: '/profile/wishlist' },
    { label: 'Delivery Address', icon: MapPin, color: 'bg-green-100 text-green-600', path: '/profile/addresses' },
    { label: 'Payment Methods', icon: CreditCard, color: 'bg-orange-100 text-orange-600', path: '/profile/payments' },
    { label: 'Settings', icon: Settings, color: 'bg-gray-100 text-gray-600', path: '/profile/settings' },
  ];

  const profileRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'userProfiles', user.uid);
  }, [db, user]);

  const { data: profile, isLoading: isProfileLoading } = useDoc<UserProfile>(profileRef);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary w-8 h-8" />
      </div>
    );
  }

  const displayName = profile 
    ? `${profile.firstName} ${profile.lastName}`.trim() 
    : (user?.displayName || "Gemma's Member");
    
  const displayPhoto = profile?.profileImageUrl || user?.photoURL || "https://picsum.photos/seed/user/200/200";

  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="bg-primary pt-12 pb-24 px-6 rounded-b-[40px] relative">
        <div className="relative z-10 flex items-center space-x-4">
          <div className="relative w-20 h-20 rounded-3xl border-4 border-white overflow-hidden bg-white shadow-xl">
            <Image src={displayPhoto} alt="User" fill className="object-cover" />
          </div>
          <div className="text-white">
            <h1 className="text-2xl font-black font-headline">{isProfileLoading ? "..." : displayName}</h1>
            <p className="text-white/80 font-medium text-sm">{user.email}</p>
          </div>
        </div>
      </header>

      <main className="px-6 -mt-10 space-y-6 relative z-10">
        {isAdmin && (
          <section className="bg-accent rounded-3xl p-2 shadow-lg border-2 border-white space-y-2">
            <button 
              onClick={() => router.push('/admin/inventory')}
              className="w-full flex items-center justify-between p-4 bg-white rounded-2xl active:bg-muted/50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="bg-accent/10 p-2.5 rounded-2xl text-accent"><PackageSearch className="w-5 h-5" /></div>
                <span className="font-bold text-base">Inventory Console</span>
              </div>
              <ChevronRight className="w-5 h-5 text-accent" />
            </button>
            <button 
              onClick={() => router.push('/admin/orders')}
              className="w-full flex items-center justify-between p-4 bg-white rounded-2xl active:bg-muted/50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="bg-blue-500/10 p-2.5 rounded-2xl text-blue-600"><ClipboardList className="w-5 h-5" /></div>
                <span className="font-bold text-base">Order Management</span>
              </div>
              <ChevronRight className="w-5 h-5 text-blue-600" />
            </button>
          </section>
        )}

        <section className="bg-white rounded-3xl p-2 shadow-sm border">
          {menuItems.map((item, idx) => (
            <button 
              key={item.label}
              onClick={() => router.push(item.path)}
              className={cn(
                "w-full flex items-center justify-between p-4 active:bg-muted/50 transition-colors group",
                idx !== menuItems.length - 1 && "border-b border-border/30"
              )}
            >
              <div className="flex items-center space-x-4">
                <div className={`${item.color} p-2.5 rounded-2xl`}><item.icon className="w-5 h-5" /></div>
                <span className="font-bold text-base">{item.label}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground/40" />
            </button>
          ))}
        </section>

        <section className="bg-white rounded-3xl p-2 shadow-sm border">
          <button 
            onClick={() => auth.signOut()}
            className="w-full flex items-center justify-between p-4 rounded-2xl active:bg-red-50 transition-colors text-left group"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-red-100 text-red-600 p-2.5 rounded-2xl group-active:scale-95 transition-transform">
                <LogOut className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base text-red-600">Sign Out</span>
                <span className="text-[10px] text-red-400 font-bold uppercase tracking-widest">End Session</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-red-200" />
          </button>
        </section>

        <p className="text-center text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] pt-4">Gemma's Gulayan v1.0</p>
      </main>

      <BottomNav />
    </div>
  );
}
