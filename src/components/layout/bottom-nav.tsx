"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingBag, ShoppingCart, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/hooks/use-cart';

export function BottomNav() {
  const pathname = usePathname();
  const { totalItems } = useCart();

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Products', href: '/products', icon: ShoppingBag },
    { label: 'Cart', href: '/cart', icon: ShoppingCart, badge: totalItems },
    { label: 'Profile', href: '/profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border px-4 py-2 flex justify-between items-center md:hidden pb-safe shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center space-y-1 transition-all duration-300 relative px-4 py-1 rounded-2xl",
              isActive ? "text-primary bg-primary/5" : "text-muted-foreground hover:text-primary/70"
            )}
          >
            <div className="relative">
              <Icon className={cn("w-6 h-6", isActive && "scale-110")} />
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white animate-in zoom-in duration-300 shadow-sm">
                  {item.badge}
                </span>
              )}
            </div>
            <span className={cn("text-[10px] font-black uppercase tracking-tighter", isActive ? "opacity-100" : "opacity-70")}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
