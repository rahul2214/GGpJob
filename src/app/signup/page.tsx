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
import { LoaderCircle, AlertCircle, Eye, EyeOff, CheckCircle2, Rocket, ShieldCheck, ArrowRight, Zap, Star, Search, Crown } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/user-context";
import { isOnboardingComplete } from "@/lib/onboarding";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client"; // still used for Google OAuth

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { motion } from "framer-motion";
import { JOB_SEEKER_PLANS } from "@/lib/pricing-constants";

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
  phone: z.string().min(10, "Phone number must be at least 10 digits."),
  password: z.string()
    .min(8, "Password must be at least 8 characters.")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
    .regex(/[0-9]/, "Password must contain at least one number.")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character."),
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
      if (user.role === 'Job Seeker' && !isOnboardingComplete(user)) {
        router.push('/onboarding');
      } else {
        router.push('/');
      }
    }
  }, [user, loading, router]);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", phone: "", password: "", confirmPassword: "" },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (data: SignupFormValues) => {
    setEmailError(null);
    try {
      // Call our server-side API which uses Supabase Admin to create the user
      // WITHOUT triggering Supabase's own verification email.
      // Firebase will send the verification email instead.
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          role: 'Job Seeker',
          phone: data.phone,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Signup failed.');
      }

      toast({
        title: "Account Created!",
        description: "A verification email has been sent. Please check your inbox and verify before logging in.",
      });
      router.push("/login");
    } catch (error: any) {
      toast({ title: "Signup Failed", description: error.message || "An unexpected error occurred.", variant: "destructive" });
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          redirectTo: window.location.origin + '/auth/callback?role=Job+Seeker',
        }
      });
      if (error) throw error;
    } catch (error: any) {
      toast({ title: "Google Sign-Up Failed", description: error.message || "An unexpected error occurred.", variant: "destructive" });
    }
  };

  if (loading || user) return null;

  return (
    <div className="min-h-screen bg-white">
      {/* Top Split Signup Section */}
      <div className="flex">
        {/* Left Panel */}
        <div className="hidden lg:flex lg:w-[42%] relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 flex-col justify-between p-12" style={{ minHeight: '100vh' }}>
        <div className="absolute top-0 -left-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -right-20 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl" />
        <div className="relative z-10 space-y-8">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
            <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight mb-4">
              Start Your <br />
              <span className="text-indigo-200">Career Journey</span>
            </h1>
            <p className="text-indigo-200 text-base leading-relaxed max-w-sm">
              Create a free account and unlock thousands of job opportunities from top companies, today.
            </p>
          </motion.div>

          <div className="space-y-4">
            {benefits.map((b, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + idx * 0.12 }}
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
            transition={{ duration: 0.6, delay: 0.8 }}
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5"
          >
            <p className="text-white/90 text-sm italic leading-relaxed mb-3">
              "Thanks to JobsDart, I got referred at one of the top tech companies and secured a job within 2 weeks!"
            </p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold">A</div>
              <div>
                <p className="text-white text-sm font-semibold">Ananya K.</p>
                <p className="text-indigo-200 text-xs">Software Engineer, Amazon</p>
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

              {/* Phone Number Field */}
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-semibold text-sm">Phone Number</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      <div className="flex items-center justify-center px-4 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-bold text-sm select-none">
                        +91
                      </div>
                      <Input placeholder="9876543210" className="h-11 rounded-xl border-slate-200 focus:border-indigo-400 bg-slate-50 focus:bg-white transition-colors flex-1" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

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

      {/* ============ PRICING SECTION ============ */}
      <div className="bg-slate-950 text-white pb-20 pt-16 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-900/50 border border-indigo-700/40 text-indigo-400 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4">
            <Zap className="w-3 h-3" /> Jobseeker Plans
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3 tracking-tight">
            Accelerate Your Job Search
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-12">
            Get referred by verified industry insiders, unlock priority visibility, and access premium dashboard insights.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {JOB_SEEKER_PLANS.map((plan, idx) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`flex flex-col bg-slate-900 border rounded-3xl overflow-hidden text-left transition-all duration-300 hover:scale-[1.01] ${
                  plan.popular 
                    ? 'border-indigo-500 ring-2 ring-indigo-500/30 shadow-xl shadow-indigo-500/10' 
                    : 'border-slate-800'
                }`}
              >
                {plan.popular && (
                  <div className="bg-indigo-600 text-white text-center py-1.5 text-xs font-bold tracking-widest uppercase">
                    Recommended Plan
                  </div>
                )}
                
                <div className="p-8 flex-grow flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        plan.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-400' :
                        plan.color === 'sky' ? 'bg-sky-500/10 text-sky-400' :
                        plan.color === 'amber' ? 'bg-amber-500/10 text-amber-400' :
                        'bg-indigo-500/10 text-indigo-400'
                      }`}>
                        <plan.icon className="w-5 h-5" />
                      </div>
                      <h3 className="font-extrabold text-white text-xl">{plan.name}</h3>
                    </div>
                    
                    <p className="text-slate-400 text-xs leading-relaxed mb-6">{plan.description}</p>
                    
                    <div className="flex items-baseline gap-2 mb-6">
                      <span className="text-4xl font-black text-white">₹{plan.price}</span>
                      {plan.price > 0 && <span className="text-slate-400 text-xs">/ 4 months</span>}
                      {plan.originalPrice && plan.price > 0 && (
                        <span className="text-slate-500 line-through text-sm ml-2">₹{plan.originalPrice}</span>
                      )}
                    </div>

                    <div className="space-y-4 mb-8">
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Features Include:</div>
                      <ul className="space-y-3">
                        {plan.features.map((feature, fIdx) => (
                          <li key={fIdx} className="flex items-start gap-2.5">
                            <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                            <span className="text-slate-300 text-xs leading-relaxed">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <Button 
                    onClick={() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                      toast({
                        title: "Sign Up First",
                        description: "Please create your account to activate or purchase this plan.",
                      });
                    }}
                    className={`w-full h-11 rounded-xl font-bold text-xs transition-all ${
                      plan.popular
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20'
                        : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                    }`}
                  >
                    {plan.price === 0 ? 'Sign Up & Get Started' : 'Upgrade After Sign Up'}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
