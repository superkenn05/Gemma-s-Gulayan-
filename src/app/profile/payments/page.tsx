
"use client";

import { useRouter } from 'next/navigation';
import { ChevronLeft, CreditCard, Plus, Trash2, Wallet, Smartphone, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUser, useFirestore, useDoc, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { UserProfile } from '@/types';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const PAYMENT_METHODS = [
  { id: 'cod', label: 'Cash on Delivery', description: 'Pay when your order arrives', icon: CreditCard },
  { id: 'gcash', label: 'GCash', description: 'Digital Wallet', icon: Smartphone },
  { id: 'maya', label: 'Maya', description: 'Digital Wallet', icon: Smartphone },
];

export default function PaymentsPage() {
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const profileRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'userProfiles', user.uid);
  }, [db, user]);

  const { data: profile, isLoading } = useDoc<UserProfile>(profileRef);

  const setDefaultPayment = (methodId: string) => {
    if (!user || !db || !profileRef) return;
    
    setDocumentNonBlocking(profileRef, {
      defaultPaymentMethodId: methodId
    }, { merge: true });

    toast({
      title: "Default Updated",
      description: "Preferred payment method saved.",
    });
  };

  const selectedDefaultId = profile?.defaultPaymentMethodId || 'cod';

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur p-4 flex items-center space-x-4 border-b">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-xl font-black font-headline">Payment Methods</h1>
      </header>

      <main className="p-4 space-y-4">
        <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10 mb-6">
          <div className="flex items-start space-x-3">
            <Wallet className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <p className="text-sm font-bold text-primary leading-snug">
              Choose your preferred way to pay. Digital payments are processed securely through our mock gateway.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground font-medium">Loading settings...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {PAYMENT_METHODS.map((method) => (
              <div 
                key={method.id} 
                onClick={() => setDefaultPayment(method.id)}
                className={cn(
                  "bg-white rounded-2xl p-4 shadow-sm border transition-all cursor-pointer flex items-center justify-between",
                  selectedDefaultId === method.id ? "border-primary ring-1 ring-primary/20" : "border-border"
                )}
              >
                <div className="flex items-center space-x-4">
                  <div className={cn(
                    "p-3 rounded-xl",
                    selectedDefaultId === method.id ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  )}>
                    <method.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-bold text-base">{method.label}</h3>
                      {selectedDefaultId === method.id && <Badge className="text-[10px] h-4 bg-primary text-white">Default</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">{method.description}</p>
                  </div>
                </div>
                {selectedDefaultId === method.id ? (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                ) : (
                  <Button variant="ghost" size="icon" className="text-muted-foreground opacity-20" disabled title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        <Button variant="outline" className="w-full h-14 rounded-2xl border-dashed border-2 hover:bg-muted/50 font-bold text-primary border-primary/20 mt-4">
          <Plus className="w-5 h-5 mr-2" />
          Add New Payment Method
        </Button>
      </main>
    </div>
  );
}
