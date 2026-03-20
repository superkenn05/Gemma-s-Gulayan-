
"use client";

import { useRouter } from 'next/navigation';
import { ChevronLeft, MapPin, Plus, Trash2, Home, Briefcase, Map, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  useUser, 
  useFirestore, 
  useCollection, 
  useMemoFirebase, 
  deleteDocumentNonBlocking,
  addDocumentNonBlocking
} from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { UserAddress } from '@/types';
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';

interface PSGCItem {
  code: string;
  name: string;
}

export default function AddressesPage() {
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  
  // PSGC State
  const [regions, setRegions] = useState<PSGCItem[]>([]);
  const [provinces, setProvinces] = useState<PSGCItem[]>([]);
  const [cities, setCities] = useState<PSGCItem[]>([]);
  const [barangays, setBarangays] = useState<PSGCItem[]>([]);

  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedBarangay, setSelectedBarangay] = useState('');

  const addressesQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return collection(db, 'userProfiles', user.uid, 'deliveryAddresses');
  }, [db, user]);

  const { data: addresses, isLoading } = useCollection<UserAddress>(addressesQuery);

  // Fetch initial regions with error handling
  useEffect(() => {
    fetch('https://psgc.gitlab.io/api/regions/')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch regions');
        return res.json();
      })
      .then(data => setRegions(data))
      .catch(err => {
        console.error("Error fetching regions:", err);
        setRegions([]);
      });
  }, []);

  // Fetch Provinces based on Region with error handling
  useEffect(() => {
    if (!selectedRegion) {
      setProvinces([]);
      return;
    }
    const isNCR = selectedRegion === '130000000';
    const endpoint = isNCR ? 'districts' : 'provinces';
    fetch(`https://psgc.gitlab.io/api/regions/${selectedRegion}/${endpoint}/`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch provinces');
        return res.json();
      })
      .then(data => setProvinces(data))
      .catch(err => {
        console.error("Error fetching provinces:", err);
        setProvinces([]);
      });
  }, [selectedRegion]);

  // Fetch Cities with error handling
  useEffect(() => {
    if (!selectedProvince) {
      setCities([]);
      return;
    }
    const isNCR = selectedRegion === '130000000';
    const endpoint = isNCR ? 'districts' : 'provinces';
    fetch(`https://psgc.gitlab.io/api/${endpoint}/${selectedProvince}/cities-municipalities/`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch cities');
        return res.json();
      })
      .then(data => setCities(data))
      .catch(err => {
        console.error("Error fetching cities:", err);
        setCities([]);
      });
  }, [selectedProvince, selectedRegion]);

  // Fetch Barangays with error handling
  useEffect(() => {
    if (!selectedCity) {
      setBarangays([]);
      return;
    }
    fetch(`https://psgc.gitlab.io/api/cities-municipalities/${selectedCity}/barangays/`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch barangays');
        return res.json();
      })
      .then(data => setBarangays(data))
      .catch(err => {
        console.error("Error fetching barangays:", err);
        setBarangays([]);
      });
  }, [selectedCity]);

  const handleAddAddress = () => {
    if (!user || !db || !newLabel || !selectedBarangay || !streetAddress) return;

    const regionName = regions.find(r => r.code === selectedRegion)?.name;
    const provinceName = provinces.find(p => p.code === selectedProvince)?.name;
    const cityName = cities.find(c => c.code === selectedCity)?.name;
    const barangayName = barangays.find(b => b.code === selectedBarangay)?.name;
    
    const fullAddressString = `${streetAddress}, Brgy. ${barangayName}, ${cityName}, ${provinceName}, ${regionName}`;

    const colRef = collection(db, 'userProfiles', user.uid, 'deliveryAddresses');
    addDocumentNonBlocking(colRef, {
      userId: user.uid,
      label: newLabel,
      fullAddress: fullAddressString,
      isDefault: addresses?.length === 0,
    });

    toast({ title: "Address Saved", description: "Your new address has been added to your profile." });
    
    // Reset form
    setNewLabel('');
    setSelectedRegion('');
    setSelectedProvince('');
    setSelectedCity('');
    setSelectedBarangay('');
    setStreetAddress('');
    setIsAddDialogOpen(false);
  };

  const handleDelete = (addressId: string) => {
    if (!user || !db) return;
    const docRef = doc(db, 'userProfiles', user.uid, 'deliveryAddresses', addressId);
    deleteDocumentNonBlocking(docRef);
  };

  const getIcon = (label: string) => {
    const l = label.toLowerCase();
    if (l.includes('home')) return Home;
    if (l.includes('office') || l.includes('work')) return Briefcase;
    return Map;
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur p-4 flex items-center justify-between border-b">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-xl font-black font-headline">Saved Addresses</h1>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="icon" variant="ghost" className="text-primary">
              <Plus className="w-6 h-6" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[450px] max-h-[90vh] overflow-y-auto rounded-3xl p-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-black">Add New Address</DialogTitle>
            </DialogHeader>
            <div className="grid gap-5 py-4">
              <div className="grid gap-2">
                <Label htmlFor="label" className="font-bold">Address Label</Label>
                <Input 
                  id="label" 
                  placeholder="e.g. Home, Office, School" 
                  className="h-12 rounded-xl"
                  value={newLabel} 
                  onChange={(e) => setNewLabel(e.target.value)}
                />
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="font-bold">Region</Label>
                  <Select value={selectedRegion} onValueChange={(val) => {
                    setSelectedRegion(val);
                    setSelectedProvince('');
                    setSelectedCity('');
                    setSelectedBarangay('');
                  }}>
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue placeholder="Select Region" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {regions.map(r => <SelectItem key={r.code} value={r.code}>{r.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="font-bold">Province / District</Label>
                  <Select 
                    value={selectedProvince} 
                    onValueChange={(val) => {
                      setSelectedProvince(val);
                      setSelectedCity('');
                      setSelectedBarangay('');
                    }}
                    disabled={!selectedRegion}
                  >
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue placeholder="Select Province" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {provinces.map(p => <SelectItem key={p.code} value={p.code}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="font-bold">City / Municipality</Label>
                  <Select 
                    value={selectedCity} 
                    onValueChange={(val) => {
                      setSelectedCity(val);
                      setSelectedBarangay('');
                    }}
                    disabled={!selectedProvince}
                  >
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue placeholder="Select City" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {cities.map(c => <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="font-bold">Barangay</Label>
                  <Select 
                    value={selectedBarangay} 
                    onValueChange={setSelectedBarangay}
                    disabled={!selectedCity}
                  >
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue placeholder="Select Barangay" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {barangays.map(b => <SelectItem key={b.code} value={b.code}>{b.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="font-bold">Street/House No.</Label>
                  <Input 
                    placeholder="House No., Street" 
                    className="h-12 rounded-xl"
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                  />
                </div>
              </div>

              <Button 
                className="w-full h-12 rounded-xl font-bold mt-4" 
                onClick={handleAddAddress} 
                disabled={!newLabel || !selectedBarangay || !streetAddress}
              >
                Save Address
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </header>

      <main className="p-4 space-y-4">
        {isLoading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">Loading addresses...</p>
          </div>
        ) : !addresses || addresses.length === 0 ? (
          <div className="py-20 text-center space-y-6">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto">
              <MapPin className="w-10 h-10 text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-bold">No saved addresses</h2>
              <p className="text-muted-foreground text-sm max-w-[200px] mx-auto">Add a delivery address to speed up your checkout process.</p>
            </div>
            <Button onClick={() => setIsAddDialogOpen(true)} className="rounded-xl px-8 h-12">Add Address</Button>
          </div>
        ) : (
          addresses.map((address) => {
            const Icon = getIcon(address.label);
            return (
              <div key={address.id} className="bg-white rounded-2xl p-4 shadow-sm border flex items-start space-x-4">
                <div className="bg-primary/10 p-3 rounded-xl">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-base">{address.label}</h3>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive h-8 w-8 hover:bg-destructive/10 -mt-1 -mr-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(address.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">{address.fullAddress}</p>
                  {address.isDefault && (
                    <span className="inline-block mt-2 text-[10px] font-black bg-accent text-accent-foreground px-2 py-0.5 rounded-full uppercase tracking-tighter">Default</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </main>
    </div>
  );
}
