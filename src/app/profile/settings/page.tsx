
"use client";

import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, User, Mail, Save, Loader2, Camera, Phone, AlertCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useUser, useFirestore, useDoc, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { UserProfile } from '@/types';
import axios from 'axios';

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [configError, setConfigError] = useState<{title: string, message: string} | null>(null);

  // Cloudinary Configuration
  const cloudinaryCloudName = 'dzytzdamb';
  const uploadPreset = 'firebase_upload';

  // Fetch existing profile
  const profileRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'userProfiles', user.uid);
  }, [db, user]);

  const { data: profile, isLoading } = useDoc<UserProfile>(profileRef);

  // Populate form when data is loaded
  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName || '');
      setLastName(profile.lastName || '');
      setPhoneNumber(profile.phoneNumber || '');
      setUploadedImageUrl(profile.profileImageUrl || null);
    } else if (user) {
      const names = user.displayName?.split(' ') || [];
      if (names.length > 0) {
        setFirstName(names[0]);
        setLastName(names.slice(1).join(' '));
      }
    }
  }, [profile, user]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
      });
      return;
    }

    setIsUploading(true);
    setConfigError(null);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload`,
        formData
      );

      setUploadedImageUrl(response.data.secure_url);
      
      toast({
        title: "Image Uploaded",
        description: "Your new photo is ready. Click Save Profile to apply changes.",
      });
    } catch (error: any) {
      console.error('Full Upload Error:', error);
      let errorTitle = 'Upload Failed';
      let errorMessage = 'An unexpected error occurred during upload.';
      
      if (error.response) {
        const errorData = error.response.data;
        const serverMsg = errorData.error?.message || '';
        
        if (serverMsg.toLowerCase().includes('upload preset not found')) {
          errorTitle = 'Technical Name Mismatch';
          errorMessage = `Cloudinary cannot find a preset named "${uploadPreset}". Please verify the "Technical Name" in your Cloudinary Settings > Upload > Upload Presets.`;
        } else if (serverMsg.toLowerCase().includes('must provide a signature')) {
          errorTitle = 'Signing Mode Issue';
          errorMessage = `Your preset "${uploadPreset}" is set to "Signed". It MUST be set to "Unsigned" to allow uploads from this screen.`;
        } else {
          errorMessage = serverMsg || `Server responded with status ${error.response.status}`;
        }
      } else {
        errorMessage = error.message;
      }

      setConfigError({ title: errorTitle, message: errorMessage });
      toast({
        variant: "destructive",
        title: errorTitle,
        description: "Check the alert at the top of the page for details.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = () => {
    if (!user || !db || !profileRef) return;
    
    setIsSaving(true);
    
    const updatedData: Partial<UserProfile> = {
      id: user.uid,
      firstName,
      lastName,
      phoneNumber,
      email: user.email || '',
      profileImageUrl: uploadedImageUrl || profile?.profileImageUrl || user.photoURL || `https://picsum.photos/seed/${user.uid}/200/200`,
    };

    setDocumentNonBlocking(profileRef, updatedData, { merge: true });
    
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Profile Updated",
        description: "Your settings have been saved successfully.",
      });
    }, 500);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div className="space-y-4">
          <p className="text-muted-foreground">Please sign in to access settings.</p>
          <Button onClick={() => router.push('/login')}>Sign In</Button>
        </div>
      </div>
    );
  }

  const currentDisplayName = profile 
    ? `${profile.firstName} ${profile.lastName}`.trim() 
    : (user.displayName || "Gemma's Member");

  const displayPhoto = uploadedImageUrl || profile?.profileImageUrl || user.photoURL || `https://picsum.photos/seed/${user.uid}/200/200`;

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur p-4 flex items-center space-x-4 border-b">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-xl font-black font-headline">Profile Settings</h1>
      </header>

      <main className="p-6 space-y-8 max-w-md mx-auto">
        {configError && (
          <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive animate-in slide-in-from-top-2 duration-300">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="font-bold">{configError.title}</AlertTitle>
            <AlertDescription className="text-xs font-medium space-y-2">
              <p>{configError.message}</p>
              <div className="pt-2 border-t border-destructive/20">
                <p className="font-black">REQUIRED ACTION:</p>
                <ol className="list-decimal pl-4 space-y-1">
                  <li>Go to Cloudinary Settings &gt; Upload</li>
                  <li>Find the preset you created</li>
                  <li>Ensure the <strong>Technical Name</strong> is exactly: <code className="bg-destructive/20 px-1 rounded">{uploadPreset}</code></li>
                  <li>Ensure <strong>Signing Mode</strong> is set to: <code className="bg-destructive/20 px-1 rounded">Unsigned</code></li>
                </ol>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg bg-muted relative group">
              <Image 
                src={displayPhoto}
                alt="Profile"
                fill
                className="object-cover"
                unoptimized
              />
              {isUploading && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-white" />
                </div>
              )}
            </div>
            
            <input 
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full shadow-md hover:scale-110 transition-transform disabled:opacity-50"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <div className="text-center">
            <h2 className="font-bold text-lg">{isLoading ? "..." : currentDisplayName}</h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-border/50 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="font-bold">First Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter your first name"
                  className="pl-10 h-12 rounded-xl"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName" className="font-bold">Last Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Enter your last name"
                  className="pl-10 h-12 rounded-xl"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="font-bold">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g. 0917 XXX XXXX"
                  className="pl-10 h-12 rounded-xl"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-bold opacity-50">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-50" />
                <Input 
                  value={user.email || ''}
                  disabled
                  className="pl-10 h-12 rounded-xl bg-muted/30 cursor-not-allowed opacity-50"
                />
              </div>
              <p className="text-[10px] text-muted-foreground">Email cannot be changed here for security reasons.</p>
            </div>
          </div>

          <Button 
            className="w-full h-14 rounded-2xl font-bold text-lg shadow-lg shadow-primary/20"
            onClick={handleSave}
            disabled={isSaving || isLoading || isUploading}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Saving Changes...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Save Profile
              </>
            )}
          </Button>
        </div>

        <div className="text-center space-y-1">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Member Since</p>
          <p className="text-xs font-bold">{user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'Unknown'}</p>
        </div>
      </main>
    </div>
  );
}
