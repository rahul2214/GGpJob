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
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { LoaderCircle, AlertCircle, Briefcase, Eye, EyeOff, CheckCircle2, Rocket, ShieldCheck, ArrowRight, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/user-context";
import { useEffect, useState } from "react";
import {
  getAuth,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification,
} from "firebase/auth";
import { firebaseApp } from "@/firebase/config";
import type { Domain } from "@/lib/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { motion } from "framer-motion";

const GoogleIcon = () => (
  <svg className="mr-2 h-4 w-4" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
    <path fill="#FF3D00" d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z" />
    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A8 8 0 0 1 24 36c-5.222 0-9.61-3.868-11.28-8.892l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
  </svg>
);

const benefits = [
  { icon: Rocket, text: "Get hired 5x faster with referrals", color: "text-amber-400" },
  { icon: CheckCircle2, text: "Free forever — no hidden charges", color: "text-emerald-400" },
  { icon: ShieldCheck, text: "Your data is always private & secure", color: "text-sky-400" },
];

const formSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type SignupFormValues = z.infer<typeof formSchema>;

export default function SignupPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { user, loading, fetchUserProfile, createNewUserProfile, setUser } = useUser();
  const [emailError, setEmailError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'Job Seeker' && (!user.domainId || !user.resumeUrl || !user.phone)) {
        router.push('/onboarding');
      } else {
        router.push('/');
      }
    }
  }, [user, loading, router]);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (data: SignupFormValues) => {
    setEmailError(null);
    try {
      const auth = getAuth(firebaseApp);
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const firebaseUser = userCredential.user;
      const actionCodeSettings = { url: window.location.origin + "/login", handleCodeInApp: true };
      try {
        await sendEmailVerification(firebaseUser, actionCodeSettings);
      } catch (err: any) {
        setEmailError("Account created, but verification email failed. Try resending from the login page.");
      }
      const profileData = { id: firebaseUser.uid, name: data.name, email: data.email, role: "Job Seeker", domainId: null };
      const response = await fetch("/api/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(profileData) });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create user profile.");
      }

      await auth.signOut();
      toast({ title: "Account Created!", description: "A verification email has been sent. Please verify before logging in." });
      router.push("/login");
    } catch (error: any) {
      let errorMessage = "An unexpected error occurred.";
      if (error.code === "auth/email-already-in-use") errorMessage = "This email is already in use.";
      else if (error.code === "auth/weak-password") errorMessage = "The password is too weak.";
      else if (error.message) errorMessage = error.message;
      
      toast({ title: "Signup Failed", description: errorMessage, variant: "destructive" });
    }
  };

  const handleGoogleSignUp = async () => {
    const auth = getAuth(firebaseApp);
    const provider = new GoogleAuthProvider();
    try {
      const userCredential = await signInWithPopup(auth, provider);
      const firebaseUser = userCredential.user;
      let profile = await fetchUserProfile(firebaseUser.uid);
      if (!profile) profile = await createNewUserProfile(firebaseUser);
      if (profile) {
        setUser(profile);
        if (profile.domainId && profile.resumeUrl && profile.phone) {
          router.push("/");
        } else {
          router.push("/onboarding");
        }
      }
      else toast({ title: "Error", description: "Failed to initialize user profile.", variant: "destructive" });
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') return;
      toast({ title: "Google Sign-Up Failed", description: error.message || "An unexpected error occurred.", variant: "destructive" });
    }
  };

  if (loading || user) return null;

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-[42%] relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 flex-col justify-between p-12">
        <div className="absolute top-0 -left-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -right-20 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl" />

       

        <div className="relative z-10 space-y-8">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
            <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight mb-4">
              Start Your <br />
              <span className="text-indigo-200">Career Journey</span>
            </h1>
            <p className="text-indigo-200 text-lg leading-relaxed max-w-sm">
              Create a free account and unlock thousands of job opportunities from top companies, today.
            </p>
          </motion.div>

          <div className="space-y-4">
            {benefits.map((b, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + idx * 0.12 }}
                className="flex items-center gap-3"
              >
                <b.icon className={`w-5 h-5 shrink-0 ${b.color}`} />
                <span className="text-white/90 text-sm font-medium">{b.text}</span>
              </motion.div>
            ))}
          </div>

          {/* Testimonial card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5"
          >
            <p className="text-white/90 text-sm italic leading-relaxed mb-3">
              "I got my dream job through a referral posted here. The whole process took less than 2 weeks!"
            </p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white text-xs font-bold">P</div>
              <div>
                <p className="text-white text-sm font-semibold">Priya S.</p>
                <p className="text-indigo-200 text-xs">Software Engineer, Bangalore</p>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="relative z-10">
          <p className="text-indigo-200 text-sm">
            Are you a recruiter?{" "}
            <Link href="/company/signup" className="text-white font-semibold underline underline-offset-2 hover:text-indigo-100 transition-colors">
              Recruiter Sign Up →
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right Panel — Form */}
      <div className="w-full lg:w-[58%] flex items-start justify-center px-6 py-10 lg:px-16 overflow-y-auto">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-lg py-4">

         

          <div className="mb-7">
            <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4">
              <Zap className="w-3 h-3" /> Candidate Sign Up
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1">Create your account ✨</h2>
            <p className="text-slate-500 text-sm">Free forever. No credit card required.</p>
          </div>

          {emailError && (
            <Alert variant="destructive" className="mb-5 rounded-xl">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Email Warning</AlertTitle>
              <AlertDescription>{emailError}</AlertDescription>
            </Alert>
          )}

          {/* Google Sign Up */}
          <motion.button
            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
            type="button"
            onClick={handleGoogleSignUp}
            className="w-full flex items-center justify-center gap-3 border-2 border-slate-200 hover:border-indigo-300 bg-white hover:bg-indigo-50/40 text-slate-700 font-semibold py-3 rounded-xl transition-all duration-200 shadow-sm mb-5"
          >
            <GoogleIcon />
            Continue with Google
          </motion.button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">or fill in details</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Name + Email row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-semibold text-sm">Full Name</FormLabel>
                    <FormControl><Input placeholder="John Doe" className="h-11 rounded-xl border-slate-200 focus:border-indigo-400 bg-slate-50 focus:bg-white transition-colors" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-semibold text-sm">Email Address</FormLabel>
                    <FormControl><Input type="email" placeholder="you@example.com" className="h-11 rounded-xl border-slate-200 focus:border-indigo-400 bg-slate-50 focus:bg-white transition-colors" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              {/* Password + Confirm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField control={form.control} name="password" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-semibold text-sm">Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input type={showPassword ? "text" : "password"} placeholder="Min. 8 characters" className="h-11 rounded-xl border-slate-200 focus:border-indigo-400 bg-slate-50 focus:bg-white transition-colors pr-10" {...field} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              {/* Confirm Password */}
              <div className="grid grid-cols-1 gap-4">
                <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-semibold text-sm">Confirm Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input type={showConfirm ? "text" : "password"} placeholder="Re-enter password" className="h-11 rounded-xl border-slate-200 focus:border-indigo-400 bg-slate-50 focus:bg-white transition-colors pr-10" {...field} />
                        <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                          {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                <Button type="submit" className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base shadow-lg shadow-indigo-200 transition-all" disabled={isSubmitting}>
                  {isSubmitting ? <LoaderCircle className="mr-2 h-5 w-5 animate-spin" /> : <ArrowRight className="mr-2 h-5 w-5" />}
                  {isSubmitting ? "Creating Account..." : "Create Free Account"}
                </Button>
              </motion.div>
            </form>
          </Form>

          <p className="mt-4 text-center text-xs text-slate-400">
            By signing up, you agree to our{" "}
            <Link href="/terms" className="text-indigo-600 hover:underline">Terms of Service</Link>
            {" "}and{" "}
            <Link href="/privacy" className="text-indigo-600 hover:underline">Privacy Policy</Link>.
          </p>

          <p className="mt-4 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors">Sign in</Link>
          </p>

         
        </motion.div>
      </div>
    </div>
  );
}
