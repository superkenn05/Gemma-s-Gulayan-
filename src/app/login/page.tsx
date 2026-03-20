"use client";

import { useRouter } from 'next/navigation';
import { Github, Facebook, Mail, Lock, Eye, EyeOff, Leaf, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  useAuth, 
  useUser, 
  initiateGitHubSignIn, 
  initiateGoogleSignIn, 
  initiateFacebookSignIn, 
  initiateTikTokSignIn,
} from '@/firebase';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [authError, setAuthError] = useState<{ title: string; message: string; code: string } | null>(null);

  // Forgot Password State
  const [resetEmail, setResetEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  // Automatic redirect if already logged in
  useEffect(() => {
    if (user && !isUserLoading && !isRedirecting) {
      setIsRedirecting(true);
      router.replace('/');
    }
  }, [user, isUserLoading, router, isRedirecting]);

  const validateEmail = (email: string) => {
    return email.trim().match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    
    const cleanEmail = email.trim();
    if (!validateEmail(cleanEmail)) {
      toast({
        variant: "destructive",
        title: "Invalid Email",
        description: "Please enter a valid email address.",
      });
      return;
    }

    setIsLoading(true);

    if (isSignUp) {
      if (password !== confirmPassword) {
        toast({
          variant: "destructive",
          title: "Password Mismatch",
          description: "Your passwords do not match. Please try again.",
        });
        setIsLoading(false);
        return;
      }
      
      try {
        await createUserWithEmailAndPassword(auth, cleanEmail, password);
        toast({
          title: "Account Created!",
          description: "Welcome to Gemma's Gulayan!",
        });
      } catch (error: any) {
        console.error("Sign up error:", error);
        let errorTitle = "Sign Up Failed";
        let errorMessage = error.message || "Could not create account.";

        if (error.code === 'auth/operation-not-allowed') {
          errorTitle = "Email Login Disabled";
          errorMessage = "The Email/Password provider is not enabled in your Firebase Console.";
        } else if (error.code === 'auth/email-already-in-use') {
          errorTitle = "Account Exists";
          errorMessage = "This email is already registered. Try signing in instead.";
        } else if (error.code === 'auth/weak-password') {
          errorTitle = "Weak Password";
          errorMessage = "Password should be at least 6 characters.";
        }

        setAuthError({ title: errorTitle, message: errorMessage, code: error.code });
        toast({
          variant: "destructive",
          title: errorTitle,
          description: errorMessage,
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      try {
        await signInWithEmailAndPassword(auth, cleanEmail, password);
      } catch (error: any) {
        console.error("Sign in error:", error);
        let errorTitle = "Sign In Failed";
        let errorMessage = error.message || "Invalid email or password.";

        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
          errorMessage = "Invalid email or password. Please try again.";
        }

        setAuthError({ title: errorTitle, message: errorMessage, code: error.code });
        toast({
          variant: "destructive",
          title: errorTitle,
          description: errorMessage,
        });
        setIsLoading(false);
      }
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanResetEmail = resetEmail.trim();
    
    if (!cleanResetEmail || !validateEmail(cleanResetEmail)) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a valid email address.",
      });
      return;
    }

    setIsResetting(true);
    try {
      await sendPasswordResetEmail(auth, cleanResetEmail);
      toast({
        title: "Reset Link Sent",
        description: `If an account exists for ${cleanResetEmail}, a reset link has been sent.`,
      });
      setIsResetDialogOpen(false);
      setResetEmail('');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Reset Failed",
        description: error.message || "Failed to send reset email.",
      });
    } finally {
      setIsResetting(false);
    }
  };

  const handleSocialLogin = async (providerFn: (auth: any) => Promise<any>) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      await providerFn(auth);
    } catch (error: any) {
      if (error.code !== 'auth/popup-closed-by-user') {
        console.error("Social login error:", error);
      }

      if (error.code === 'auth/popup-closed-by-user') {
        toast({
          title: "Sign In Cancelled",
          description: "The sign-in window was closed. Please try again.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Sign In Failed",
          description: error.message || "An error occurred during social sign-in.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isRedirecting) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-bold text-primary uppercase tracking-widest">Taking you home...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <div className="flex flex-col items-center mb-8">
        <div className="w-20 h-20 bg-primary rounded-[2rem] flex items-center justify-center mb-4 shadow-xl shadow-primary/20 rotate-3">
          <Leaf className="w-10 h-10 text-white -rotate-12" />
        </div>
        <h2 className="text-2xl font-black text-primary font-headline tracking-tighter uppercase">Gemma's Gulayan</h2>
      </div>
      
      <div className="space-y-2 mb-8">
        <h1 className="text-3xl font-black font-headline tracking-tight text-foreground">
          {isSignUp ? 'Create an Account' : 'Welcome Back'}
        </h1>
        <p className="text-muted-foreground font-medium text-sm max-w-xs mx-auto">
          {isSignUp 
            ? 'Join us for the freshest produce delivered to your door.' 
            : 'Sign in to access your fresh favorites and orders.'}
        </p>
      </div>

      <div className="w-full max-w-sm space-y-6">
        {authError && (
          <Alert variant="destructive" className="text-left bg-destructive/10 border-destructive/20 mb-4 animate-in slide-in-from-top-2">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="font-bold">{authError.title}</AlertTitle>
            <AlertDescription className="text-xs font-medium mt-1">
              {authError.message}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleEmailAuth} className="space-y-4 text-left">
          <div className="space-y-2">
            <Label htmlFor="email" className="font-bold">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                id="email"
                type="email"
                placeholder="name@example.com"
                className="pl-10 h-12 rounded-xl border-border bg-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" title="password" className="font-bold">Password</Label>
              {!isSignUp && (
                <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                  <DialogTrigger asChild>
                    <button 
                      type="button"
                      className="text-xs font-bold text-primary hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </DialogTrigger>
                  <DialogContent className="rounded-3xl sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-black">Reset Password</DialogTitle>
                      <DialogDescription className="font-medium">
                        Enter your email address to reset your password.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleForgotPassword} className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="resetEmail" className="font-bold">Email Address</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input 
                            id="resetEmail"
                            type="email"
                            placeholder="name@example.com"
                            className="pl-10 h-12 rounded-xl"
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full h-12 rounded-xl font-bold"
                        disabled={isResetting || !resetEmail}
                      >
                        {isResetting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Reset Link'}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="pl-10 pr-10 h-12 rounded-xl border-border bg-white"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 hover:bg-transparent text-muted-foreground"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {isSignUp && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
              <Label htmlFor="confirmPassword" title="confirm-password" className="font-bold">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 h-12 rounded-xl border-border bg-white"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full h-14 rounded-2xl font-bold text-lg shadow-lg shadow-primary/20 mt-2 transition-transform active:scale-95"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isSignUp ? 'Create Account' : 'Sign In')}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground font-bold">Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button 
            onClick={() => handleSocialLogin(initiateGoogleSignIn)}
            variant="outline"
            className="h-12 rounded-xl bg-white hover:bg-gray-50 border-border shadow-sm flex items-center justify-center gap-2"
            disabled={isLoading}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google
          </Button>
          <Button 
            onClick={() => handleSocialLogin(initiateFacebookSignIn)}
            className="h-12 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white shadow-sm flex items-center justify-center gap-2"
            disabled={isLoading}
          >
            <Facebook className="w-5 h-5 fill-current" />
            Facebook
          </Button>
        </div>
        
        <div className="pt-4 flex flex-col gap-2">
          <button 
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setConfirmPassword('');
              setAuthError(null);
            }}
            className="text-primary font-bold hover:bg-primary/5 h-12 rounded-xl"
            disabled={isLoading}
          >
            {isSignUp ? 'Already have an account? Sign In' : 'New here? Create an Account'}
          </button>
        </div>
      </div>

      <p className="mt-8 text-[10px] text-muted-foreground/60 px-8">
        By continuing, you agree to Gemma's Gulayan Terms of Service and Privacy Policy.
      </p>
    </div>
  );
}
