"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { LoaderCircle, Eye, EyeOff, Briefcase, Search, Star, ArrowRight, Users, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/user-context";
import { useEffect, useState } from "react";
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendEmailVerification, sendPasswordResetEmail } from "firebase/auth";
import { firebaseApp } from "@/firebase/config";
import { motion } from "framer-motion";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

type LoginFormValues = z.infer<typeof formSchema>;

const GoogleIcon = () => (
  <svg className="mr-2 h-4 w-4" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
    <path fill="#FF3D00" d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z" />
    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A8 8 0 0 1 24 36c-5.222 0-9.61-3.868-11.28-8.892l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
  </svg>
);

const floatingCards = [
  { icon: Search, label: "50K+ Jobs", sub: "Browse opportunities", color: "from-blue-500 to-indigo-600", delay: 0 },
  { icon: Star, label: "Top Referrals", sub: "Get hired 5x faster", color: "from-amber-400 to-orange-500", delay: 1.5 },
  { icon: Users, label: "200K+ Users", sub: "Active job seekers", color: "from-emerald-500 to-teal-600", delay: 3 },
];

export default function LoginPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { user, loading, fetchUserProfile, createNewUserProfile, setUser } = useUser();
  const [showPassword, setShowPassword] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'Job Seeker' && (!user.domainId || !user.resumeUrl)) {
        router.push('/onboarding');
      } else {
        router.push('/');
      }
    }
  }, [user, loading, router]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  const { isSubmitting } = form.formState;

  const handleResendVerification = async (email: string) => {
    setIsResending(true);
    try {
      const auth = getAuth(firebaseApp);
      const { password } = form.getValues();
      if (!password) {
        toast({ title: 'Password Required', description: 'Please enter your password to resend the verification email.', variant: 'destructive' });
        return;
      }
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      if (firebaseUser && !firebaseUser.emailVerified) {
        const actionCodeSettings = { url: window.location.origin + "/login", handleCodeInApp: true };
        await sendEmailVerification(firebaseUser, actionCodeSettings);
        toast({ title: 'Verification Email Sent', description: 'A new verification link has been sent. Please check your inbox and spam folder.' });
      } else if (firebaseUser?.emailVerified) {
        toast({ title: 'Already Verified', description: 'Your email is already verified. You can log in normally.' });
      }
      await auth.signOut();
    } catch (error: any) {
      let msg = "Failed to resend verification. Please check your password.";
      if (error.code === 'auth/too-many-requests') msg = "Too many attempts. Please try again later.";
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    } finally {
      setIsResending(false);
    }
  };

  const onEmailSubmit = async (data: LoginFormValues) => {
    try {
      const auth = getAuth(firebaseApp);
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      const firebaseUser = userCredential.user;
      if (!firebaseUser.emailVerified) {
        await auth.signOut();
        toast({
          title: "Email Not Verified",
          description: "Please verify your email address before logging in.",
          variant: "destructive",
          duration: 10000,
          action: (
            <Button variant="outline" size="sm" onClick={() => handleResendVerification(data.email)} disabled={isResending}>
              {isResending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : "Resend Email"}
            </Button>
          )
        });
        return;
      }
      const res = await fetch(`/api/users?uid=${firebaseUser.uid}`);
      if (res.ok) {
        const profile = await res.json();
        if (profile.role !== 'Job Seeker') {
          await auth.signOut();
          let portalName = "Company Login";
          if (profile.role === 'Admin' || profile.role === 'Super Admin') portalName = "Admin Login";
          toast({ title: "Access Denied", description: `This account is a ${profile.role}. Please use the ${portalName} page.`, variant: "destructive" });
          return;
        }
      }
    } catch (error: any) {
      let errorMessage = "An unexpected error occurred.";
      if (error.code) {
        switch (error.code) {
          case 'auth/user-not-found':
          case 'auth/wrong-password':
          case 'auth/invalid-credential':
            errorMessage = 'Invalid email or password.';
            break;
          default:
            errorMessage = error.message;
        }
      }
      toast({ title: "Login Failed", description: errorMessage, variant: "destructive" });
    }
  };

  const handleGoogleSignIn = async () => {
    const auth = getAuth(firebaseApp);
    const provider = new GoogleAuthProvider();
    try {
      const userCredential = await signInWithPopup(auth, provider);
      const firebaseUser = userCredential.user;
      let profile = await fetchUserProfile(firebaseUser.uid);
      if (!profile) profile = await createNewUserProfile(firebaseUser);
      if (profile) {
        if (profile.role !== 'Job Seeker') {
          await auth.signOut();
          toast({ title: "Access Denied", description: "Google Sign-In is only available for job seekers.", variant: "destructive" });
          return;
        }
        setUser(profile);
        if (profile.domainId && profile.resumeUrl) {
          router.push("/");
        } else {
          router.push("/onboarding");
        }
      } else {
        toast({ title: "Error", description: "Failed to load user profile.", variant: "destructive" });
      }
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') return;
      toast({ title: "Google Sign-In Failed", description: error.message || "An unexpected error occurred.", variant: "destructive" });
    }
  };

  const handlePasswordReset = async () => {
    const email = form.getValues("email");
    if (!email) {
      toast({ title: "Email Required", description: "Please enter your email address to reset your password.", variant: "destructive" });
      return false;
    }
    setIsResettingPassword(true);
    try {
      const auth = getAuth(firebaseApp);
      await sendPasswordResetEmail(auth, email);
      toast({ title: "Password Reset Email Sent", description: "Check your inbox for a link to reset your password." });
      return true;
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to send password reset email.", variant: "destructive" });
      return false;
    } finally {
      setIsResettingPassword(false);
    }
  };

  if (loading || user) return null;

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Panel — Brand side */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 flex-col justify-between p-12">
        {/* Decorative blobs */}
        <div className="absolute top-0 -left-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -right-20 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[80px]" />

       

        {/* Center content */}
        <div className="relative z-10 space-y-8">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
            <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight mb-4">
              Find Your <br />
              <span className="text-indigo-200">Dream Job</span> Today
            </h1>
            <p className="text-indigo-200 text-lg leading-relaxed max-w-sm">
              Access thousands of opportunities from top companies. Your next big career move is just one login away.
            </p>
          </motion.div>

          {/* Floating stat cards */}
          <div className="space-y-4">
            {floatingCards.map((card, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0, y: [0, -6, 0] }}
                transition={{ opacity: { duration: 0.5, delay: 0.4 + idx * 0.15 }, x: { duration: 0.5, delay: 0.4 + idx * 0.15 }, y: { duration: 3 + idx, repeat: Infinity, ease: "easeInOut", delay: card.delay } }}
                className="flex items-center gap-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-5 py-4 w-fit"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-lg`}>
                  <card.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">{card.label}</p>
                  <p className="text-indigo-200 text-xs">{card.sub}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom switch link */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="relative z-10">
          <p className="text-indigo-200 text-sm">
            Are you a recruiter?{" "}
            <Link href="/company/login" className="text-white font-semibold underline underline-offset-2 hover:text-indigo-100 transition-colors">
              Recruiter Login →
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right Panel — Form side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
         

          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4">
              <Zap className="w-3 h-3" /> Candidate Login
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Welcome back 👋</h2>
            <p className="text-slate-500">Sign in to continue your job search journey.</p>
          </div>

          {/* Google Sign In */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 border-2 border-slate-200 hover:border-indigo-300 bg-white hover:bg-indigo-50/40 text-slate-700 font-semibold py-3 rounded-xl transition-all duration-200 shadow-sm mb-6"
          >
            <GoogleIcon />
            Continue with Google
          </motion.button>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">or email</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onEmailSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-semibold">Email Address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        className="h-12 rounded-xl border-slate-200 focus:border-indigo-400 focus:ring-indigo-100 bg-slate-50 focus:bg-white transition-colors"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-slate-700 font-semibold">Password</FormLabel>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="link" type="button" className="p-0 h-auto text-sm text-indigo-600 hover:text-indigo-700">Forgot Password?</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Reset Password</AlertDialogTitle>
                            <AlertDialogDescription>
                              Enter your email address. If an account exists, we'll send you a reset link.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <div className="py-4">
                            <Input id="reset-email" type="email" placeholder="your.email@example.com" defaultValue={form.getValues("email")} onChange={(e) => form.setValue("email", e.target.value)} />
                          </div>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={async (e) => {
                              e.preventDefault();
                              const success = await handlePasswordReset();
                              if (success) {
                                const cancel = document.querySelector('[data-radix-collection-item][aria-label="Cancel"]');
                                if (cancel instanceof HTMLElement) cancel.click();
                              }
                            }} disabled={isResettingPassword}>
                              {isResettingPassword && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                              Send Reset Link
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="h-12 rounded-xl border-slate-200 focus:border-indigo-400 focus:ring-indigo-100 bg-slate-50 focus:bg-white transition-colors pr-12"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base shadow-lg shadow-indigo-200 transition-all"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <LoaderCircle className="mr-2 h-5 w-5 animate-spin" /> : <ArrowRight className="mr-2 h-5 w-5" />}
                  {isSubmitting ? "Signing in..." : "Sign In"}
                </Button>
              </motion.div>
            </form>
          </Form>

          <p className="mt-6 text-center text-sm text-slate-500">
            New here?{" "}
            <Link href="/signup" className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors">
              Create a free account
            </Link>
          </p>

        
        </motion.div>
      </div>
    </div>
  );
}
