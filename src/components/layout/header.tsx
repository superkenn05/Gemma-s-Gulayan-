
"use client";

import { MapPin, Search, Bell, Leaf } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { UserAddress, Notification } from '@/types';
import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

export function Header() {
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [searchQueryInput, setSearchQueryInput] = useState(searchParams.get('q') || '');

  useEffect(() => {
    setSearchQueryInput(searchParams.get('q') || '');
  }, [searchParams]);

  const addressesQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return collection(db, 'userProfiles', user.uid, 'deliveryAddresses');
  }, [db, user]);

  const { data: addresses, isLoading: isAddressesLoading } = useCollection<UserAddress>(addressesQuery);

  const notificationsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'userProfiles', user.uid, 'notifications'), where('isRead', '==', false));
  }, [db, user]);

  const { data: unreadNotifications } = useCollection<Notification>(notificationsQuery);
  const unreadCount = unreadNotifications?.length || 0;

  const displayLocation = useMemo(() => {
    if (!user) return "Sign in to set address";
    if (isAddressesLoading) return "Loading...";
    if (!addresses || addresses.length === 0) return "Set delivery address";
    
    const activeAddress = addresses.find(a => a.isDefault) || addresses[0];
    const parts = activeAddress.fullAddress.split(', ');
    
    if (parts.length >= 4) {
      const city = parts[2];
      const province = parts[3];
      return `${city}, ${province}`;
    }
    
    return activeAddress.label || activeAddress.fullAddress.split(',')[0];
  }, [user, addresses, isAddressesLoading]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQueryInput.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQueryInput.trim())}`);
    } else {
      router.push('/products');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg px-4 pt-4 pb-2 space-y-3 border-b border-border/40">
      <div className="flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2 group">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 rotate-3 transition-transform group-hover:rotate-0">
            <Leaf className="w-5 h-5 text-white -rotate-12" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-black text-primary font-headline tracking-tighter uppercase leading-none">Gemma's</h1>
            <h1 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Gulayan</h1>
          </div>
        </Link>

        <div className="flex items-center space-x-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative hover:bg-primary/5 rounded-full h-14 w-14"
            onClick={() => router.push('/notifications')}
          >
            <Bell className="w-8 h-8 text-foreground" />
            {unreadCount > 0 && (
              <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-600 rounded-full border-2 border-white shadow-sm" />
            )}
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <Link href={user ? "/profile/addresses" : "/login"} className="flex items-center space-x-1.5 flex-1 min-w-0 bg-muted/50 py-1.5 px-3 rounded-full hover:bg-muted transition-colors">
          <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
          <span className="text-xs font-bold text-foreground truncate">{displayLocation}</span>
        </Link>
        
        <form onSubmit={handleSearch} className="relative flex-[1.5]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            className="pl-9 h-9 bg-white border-border/50 shadow-sm focus-visible:ring-primary rounded-full text-xs" 
            placeholder="Search fresh harvest..." 
            value={searchQueryInput}
            onChange={(e) => setSearchQueryInput(e.target.value)}
          />
        </form>
      </div>
    </header>
  );
}
