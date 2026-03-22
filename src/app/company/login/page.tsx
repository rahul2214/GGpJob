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
import { LoaderCircle, Eye, EyeOff, Briefcase, Building2, Users, TrendingUp, ArrowRight, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/user-context";
import { useEffect, useState } from "react";
import { getAuth, signInWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail } from "firebase/auth";
import { firebaseApp } from "@/firebase/config";
import { motion } from "framer-motion";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

type LoginFormValues = z.infer<typeof formSchema>;

const recruiterStats = [
  { icon: Building2, label: "Post Jobs Free", sub: "No hiring fees ever", color: "from-emerald-500 to-teal-600", delay: 0 },
  { icon: Users, label: "100K+ Candidates", sub: "Ready to be hired", color: "from-sky-500 to-blue-600", delay: 1.5 },
  { icon: TrendingUp, label: "85% Success Rate", sub: "Roles filled faster", color: "from-violet-500 to-purple-600", delay: 3 },
];

export default function CompanyLoginPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { user, loading } = useUser();
  const [showPassword, setShowPassword] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.push('/');
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
        const actionCodeSettings = { url: window.location.origin + "/company/login", handleCodeInApp: true };
        await sendEmailVerification(firebaseUser, actionCodeSettings);
        toast({ title: 'Verification Email Sent', description: 'A new verification link has been sent. Please check your inbox and spam folder.' });
      } else if (firebaseUser?.emailVerified) {
        toast({ title: 'Already Verified', description: 'Your email is already verified. You can log in normally.' });
      }
      await auth.signOut();
    } catch (error: any) {
      let msg = "Failed to resend verification. Please check your credentials.";
      if (error.code === 'auth/too-many-requests') msg = "Too many attempts. Please try again later.";
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    } finally {
      setIsResending(false);
    }
  };

  const onSubmit = async (data: LoginFormValues) => {
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
        if (profile.role !== 'Recruiter' && profile.role !== 'Employee') {
          await auth.signOut();
          let portalName = "Job Seeker Login";
          if (profile.role === 'Admin' || profile.role === 'Super Admin') portalName = "Admin Login";
          toast({ title: "Access Denied", description: `This account is a ${profile.role}. Please use the ${portalName} portal.`, variant: "destructive" });
          return;
        }
      } else {
        await auth.signOut();
        toast({ title: "Access Denied", description: "Company profile not found.", variant: "destructive" });
        return;
      }
      router.push("/");
    } catch (error: any) {
      toast({ title: "Login Failed", description: "Invalid email or password.", variant: "destructive" });
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
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 flex-col justify-between p-12">
        {/* Decorative blobs */}
        <div className="absolute top-0 -left-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -right-20 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[80px]" />

        

        {/* Center content */}
        <div className="relative z-10 space-y-8">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
            <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight mb-4">
              Hire the <br />
              <span className="text-emerald-200">Best Talent</span> Fast
            </h1>
            <p className="text-emerald-100 text-lg leading-relaxed max-w-sm">
              Post jobs for free, receive referrals from insiders, and connect with qualified candidates in minutes.
            </p>
          </motion.div>

          {/* Floating stat cards */}
          <div className="space-y-4">
            {recruiterStats.map((card, idx) => (
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
                  <p className="text-emerald-200 text-xs">{card.sub}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom switch link */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="relative z-10">
          <p className="text-emerald-100 text-sm">
            Looking for jobs instead?{" "}
            <Link href="/login" className="text-white font-semibold underline underline-offset-2 hover:text-emerald-100 transition-colors">
              Candidate Login →
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
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4">
              <Zap className="w-3 h-3" /> Recruiter Portal
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Welcome back 🏢</h2>
            <p className="text-slate-500">Sign in to manage your jobs and candidates.</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-semibold">Work Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="you@company.com"
                        className="h-12 rounded-xl border-slate-200 focus:border-emerald-400 focus:ring-emerald-100 bg-slate-50 focus:bg-white transition-colors"
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
                          <Button variant="link" type="button" className="p-0 h-auto text-sm text-emerald-600 hover:text-emerald-700">Forgot Password?</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Reset Password</AlertDialogTitle>
                            <AlertDialogDescription>
                              Enter your email address. If an account exists, we'll send you a reset link.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <div className="py-4">
                            <Input id="reset-email" type="email" placeholder="your.email@company.com" defaultValue={form.getValues("email")} onChange={(e) => form.setValue("email", e.target.value)} />
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
                          className="h-12 rounded-xl border-slate-200 focus:border-emerald-400 focus:ring-emerald-100 bg-slate-50 focus:bg-white transition-colors pr-12"
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
                  className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-lg shadow-emerald-200 transition-all"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <LoaderCircle className="mr-2 h-5 w-5 animate-spin" /> : <ArrowRight className="mr-2 h-5 w-5" />}
                  {isSubmitting ? "Signing in..." : "Sign In as Recruiter"}
                </Button>
              </motion.div>
            </form>
          </Form>

          <p className="mt-6 text-center text-sm text-slate-500">
            New recruiter?{" "}
            <Link href="/company/signup" className="text-emerald-600 font-semibold hover:text-emerald-700 transition-colors">
              Create a company account
            </Link>
          </p>

        
        </motion.div>
      </div>
    </div>
  );
}
