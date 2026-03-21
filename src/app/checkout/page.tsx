
"use client";

import { useRouter } from 'next/navigation';
import { ChevronLeft, MapPin, CreditCard, CheckCircle2, Loader2, Smartphone, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import { useState, useEffect } from 'react';
import { 
  useUser, 
  useFirestore, 
  useCollection, 
  useDoc,
  useMemoFirebase,
  addDocumentNonBlocking,
  setDocumentNonBlocking,
  useFunctions
} from '@/firebase';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserAddress, UserProfile } from '@/types';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { sendOrderEmail } from '@/lib/email-service';

const PAYMENT_METHODS = [
  { id: 'cod', label: 'Cash on Delivery', description: 'Pay at your doorstep', icon: CreditCard, type: 'manual' },
  { id: 'gcash', label: 'GCash', description: 'Pay via GCash app', icon: Smartphone, type: 'digital' },
  { id: 'maya', label: 'Maya', description: 'Pay via Maya app', icon: Smartphone, type: 'digital' },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { totalPrice, clearCart, cart } = useCart();
  const { user } = useUser();
  const db = useFirestore();
  const functions = useFunctions();
  const { toast } = useToast();
  
  const [isOrdered, setIsOrdered] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [selectedPaymentId, setSelectedPaymentId] = useState('cod');
  
  const [profileFirstName, setProfileFirstName] = useState('');
  const [profileLastName, setProfileLastName] = useState('');
  const [profilePhoneNumber, setProfilePhoneNumber] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    if (!isOrdered && !isProcessing && cart.length === 0) {
      router.replace('/');
    }
  }, [cart.length, isOrdered, isProcessing, router]);

  const profileRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'userProfiles', user.uid);
  }, [db, user]);

  const { data: profile, isLoading: isProfileLoading } = useDoc<UserProfile>(profileRef);

  useEffect(() => {
    if (profile) {
      setProfileFirstName(profile.firstName || '');
      setProfileLastName(profile.lastName || '');
      setProfilePhoneNumber(profile.phoneNumber || '');
      if (profile.defaultPaymentMethodId) {
        setSelectedPaymentId(profile.defaultPaymentMethodId);
      }
    }
  }, [profile]);

  const addressesQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return collection(db, 'userProfiles', user.uid, 'deliveryAddresses');
  }, [db, user]);

  const { data: addresses } = useCollection<UserAddress>(addressesQuery);

  useEffect(() => {
    if (addresses && addresses.length > 0 && !selectedAddressId) {
      const defaultAddr = addresses.find(a => a.isDefault) || addresses[0];
      setSelectedAddressId(defaultAddr.id);
    }
  }, [addresses, selectedAddressId]);

  const selectedAddress = addresses?.find(a => a.id === selectedAddressId);
  const selectedPayment = PAYMENT_METHODS.find(p => p.id === selectedPaymentId) || PAYMENT_METHODS[0];
  const isProfileComplete = profile?.firstName && profile?.lastName && profile?.phoneNumber;

  const handleSaveProfile = () => {
    if (!user || !db || !profileRef || !profileFirstName || !profileLastName || !profilePhoneNumber) return;
    setIsSavingProfile(true);
    const updatedData: Partial<UserProfile> = {
      id: user.uid,
      firstName: profileFirstName,
      lastName: profileLastName,
      phoneNumber: profilePhoneNumber,
      email: user.email || '',
    };
    setDocumentNonBlocking(profileRef, updatedData, { merge: true });
    setTimeout(() => {
      setIsSavingProfile(false);
      toast({ title: "Profile Saved", description: "You can now proceed with your order." });
    }, 500);
  };

  const handleOrder = async () => {
    if (!selectedAddress || !user || !db || !isProfileComplete) return;

    // Common email mapping for both manual and digital payments
    const emailData = {
      email: user.email || '',
      customer_name: `${profileFirstName} ${profileLastName}`.trim(),
      order_date: new Date().toLocaleDateString(),
      items: cart.map(item => ({
        name: item.name,
        units: item.quantity,
        price: Number(item.pricePerUnit) || 0
      })),
      shipping: 5.00, // Matching the "Service Fee" in UI
      tax: 0.00,
      total: totalPrice + 5.00
    };

    if (selectedPayment.type === 'digital') {
      setIsProcessing(true);
      try {
        const createPaymongoSession = httpsCallable(functions, 'createCheckoutSession');
        const result = await createPaymongoSession({
          items: cart.map(item => ({
            name: item.name,
            quantity: item.quantity,
            pricePerUnit: Number(item.pricePerUnit) || 0
          })),
          firstName: profileFirstName,
          lastName: profileLastName,
          email: user.email,
          phoneNumber: profilePhoneNumber
        });

        const { checkoutUrl } = result.data as { checkoutUrl: string };
        
        // Notify and Send Email before redirecting
        if (user.email) {
          try {
            await sendOrderEmail({
              ...emailData,
              order_id: 'ONLINE-PAYMENT',
            });
          } catch (e) {
            console.error('Email failed but proceeding:', e);
          }
        }

        clearCart();
        window.location.href = checkoutUrl;
        return;
      } catch (error: any) {
        setIsProcessing(false);
        toast({
          variant: "destructive",
          title: "Payment Error",
          description: error.message || "Failed to initiate PayMongo checkout."
        });
        return;
      }
    }
    
    setIsProcessing(true);
    const orderId = Math.random().toString(36).substring(2, 9).toUpperCase();
    const orderColRef = collection(db, 'userProfiles', user.uid, 'orders');
    
    addDocumentNonBlocking(orderColRef, {
      id: orderId,
      userId: user.uid,
      total: totalPrice + 5,
      status: 'pending',
      paymentStatus: 'pending',
      createdAt: serverTimestamp(),
      paymentMethod: selectedPayment.label,
      items: cart.map(item => ({
        productId: item.id,
        name: item.name,
        quantity: item.quantity,
        pricePerUnit: Number(item.pricePerUnit) || 0
      })),
      address: selectedAddress.fullAddress
    });

    // Send Confirmation Email
    if (user.email) {
      try {
        await sendOrderEmail({
          ...emailData,
          order_id: orderId,
        });
      } catch (emailError) {
        console.error('Confirmation email failed:', emailError);
      }
    }

    setIsOrdered(true);
    clearCart();
    setTimeout(() => { router.replace('/profile/orders'); }, 3000);
  };

  if (isOrdered) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="w-24 h-24 bg-accent/20 rounded-full flex items-center justify-center animate-bounce">
          <CheckCircle2 className="w-16 h-16 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-black font-headline mb-2">Order Confirmed!</h1>
          <p className="text-muted-foreground font-medium text-lg">Thank you for choosing Gemma's Gulayan.</p>
        </div>
      </div>
    );
  }

  if (!isProfileLoading && !isProfileComplete) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="w-full max-sm space-y-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center rotate-3">
              <User className="w-10 h-10 text-primary -rotate-3" />
            </div>
            <h1 className="text-2xl font-black font-headline">Finish Your Profile</h1>
          </div>
          <div className="bg-white rounded-3xl p-6 shadow-sm border space-y-4 text-left">
            <div className="space-y-2">
              <Label className="font-bold">First Name</Label>
              <Input 
                placeholder="Juan" 
                value={profileFirstName} 
                onChange={(e) => setProfileFirstName(e.target.value)} 
                className="h-12 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-bold">Last Name</Label>
              <Input 
                placeholder="Dela Cruz" 
                value={profileLastName} 
                onChange={(e) => setProfileLastName(e.target.value)} 
                className="h-12 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-bold">Phone Number</Label>
              <Input 
                placeholder="0917 XXX XXXX" 
                value={profilePhoneNumber} 
                onChange={(e) => setProfilePhoneNumber(e.target.value)} 
                className="h-12 rounded-xl"
              />
            </div>
            <Button className="w-full h-14 rounded-2xl font-bold" onClick={handleSaveProfile} disabled={isSavingProfile}>
              {isSavingProfile ? <Loader2 className="animate-spin" /> : 'Continue to Order'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      {isProcessing && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white space-y-4 text-center p-6">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <h2 className="text-xl font-bold">Processing Order...</h2>
          <p className="text-white/70 text-sm">Wait as we prepare your secure payment.</p>
        </div>
      )}

      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur p-4 flex items-center space-x-4 border-b">
        <Button variant="ghost" size="icon" onClick={() => router.back()}><ChevronLeft className="w-6 h-6" /></Button>
        <h1 className="text-xl font-black font-headline">Checkout</h1>
      </div>

      <main className="p-4 space-y-6">
        <section className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg">Delivery Address</h3>
            <Button variant="link" className="text-primary font-bold p-0" onClick={() => setIsAddressDialogOpen(true)}>Change</Button>
          </div>
          {selectedAddress ? (
            <div className="flex items-start space-x-3 bg-primary/5 p-4 rounded-2xl border border-primary/10">
              <MapPin className="w-5 h-5 text-primary shrink-0" />
              <div>
                <p className="font-black text-sm uppercase">{selectedAddress.label}</p>
                <p className="text-xs text-muted-foreground font-medium">{selectedAddress.fullAddress}</p>
              </div>
            </div>
          ) : <p className="text-sm text-muted-foreground">Please set a delivery address.</p>}
        </section>

        <section className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg">Payment Method</h3>
            <Button variant="link" className="text-primary font-bold p-0" onClick={() => setIsPaymentDialogOpen(true)}>Change</Button>
          </div>
          <div className="flex items-center space-x-3">
            <selectedPayment.icon className="w-5 h-5 text-primary" />
            <div>
              <p className="font-black text-sm uppercase">{selectedPayment.label}</p>
              <p className="text-xs text-muted-foreground font-medium">{selectedPayment.description}</p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-lg">Order Breakdown</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-bold">₱{totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Service Fee</span>
              <span className="font-bold">₱5.00</span>
            </div>
            <div className="pt-3 border-t border-dashed flex justify-between items-center">
              <span className="text-base font-bold">Total Payable</span>
              <span className="text-2xl font-black text-primary">₱{(totalPrice + 5).toFixed(2)}</span>
            </div>
          </div>
        </section>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t pb-safe">
        <Button 
          className="w-full h-14 rounded-2xl text-lg font-bold shadow-lg"
          onClick={handleOrder}
          disabled={!selectedAddress || cart.length === 0 || isProcessing || !isProfileComplete}
        >
          {isProcessing ? <Loader2 className="animate-spin" /> : `Place Order • ₱${(totalPrice + 5).toFixed(2)}`}
        </Button>
      </div>

      <div className="hidden">
        <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
          <DialogContent className="rounded-3xl p-6">
            <DialogHeader><DialogTitle>Select Address</DialogTitle></DialogHeader>
            <div className="space-y-3 py-4 max-h-[60vh] overflow-y-auto pr-1">
              {addresses?.map(addr => (
                <div key={addr.id} onClick={() => { setSelectedAddressId(addr.id); setIsAddressDialogOpen(false); }} className={cn("p-4 rounded-2xl border-2 cursor-pointer transition-all", selectedAddressId === addr.id ? "border-primary bg-primary/5" : "border-border")}>
                  <p className="font-bold text-sm">{addr.label}</p>
                  <p className="text-xs text-muted-foreground">{addr.fullAddress}</p>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
          <DialogContent className="rounded-3xl p-6">
            <DialogHeader><DialogTitle>Payment Method</DialogTitle></DialogHeader>
            <div className="space-y-3 py-4">
              {PAYMENT_METHODS.map(method => (
                <div key={method.id} onClick={() => { setSelectedPaymentId(method.id); setIsPaymentDialogOpen(false); }} className={cn("p-4 rounded-2xl border-2 cursor-pointer transition-all", selectedPaymentId === method.id ? "border-primary bg-primary/5" : "border-border")}>
                  <p className="font-bold text-sm">{method.label}</p>
                  <p className="text-xs text-muted-foreground">{method.description}</p>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
