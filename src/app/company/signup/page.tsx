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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { LoaderCircle, AlertCircle, Briefcase, Eye, EyeOff, CheckCircle2, Users, Clock, ArrowRight, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/user-context";
import { useEffect, useState } from "react";
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { firebaseApp } from "@/firebase/config";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { motion } from "framer-motion";

const DISALLOWED_DOMAINS = [
  'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 
  'icloud.com', 'mail.com', 'aol.com', 'zoho.com', 'yandex.com',
  'protonmail.com', 'gmx.com', 'lycos.com'
];

const formSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  phone: z.string().min(10, "Phone number must be at least 10 digits."),
  role: z.enum(["Recruiter", "Employee"]),
  password: z.string().min(8, "Password must be at least 8 characters."),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
}).refine((data) => {
  if (data.role === 'Recruiter') {
    const domain = data.email.split('@')[1]?.toLowerCase();
    return !DISALLOWED_DOMAINS.includes(domain);
  }
  return true;
}, {
  message: "Recruiters must use a corporate email address (Personal domains like Gmail/Yahoo are not allowed).",
  path: ["email"],
});

type SignupFormValues = z.infer<typeof formSchema>;

const recruiterBenefits = [
  { icon: CheckCircle2, text: "Post unlimited jobs for free", color: "text-emerald-300" },
  { icon: Users, text: "Access 200K+ verified candidates", color: "text-sky-300" },
  { icon: Clock, text: "Fill roles up to 3x faster", color: "text-amber-300" },
];

export default function CompanySignupPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { user, loading } = useUser();
  const [emailError, setEmailError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!loading && user) router.push('/');
  }, [user, loading, router]);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", phone: "", password: "", confirmPassword: "" },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (data: SignupFormValues) => {
    setEmailError(null);
    try {
      const auth = getAuth(firebaseApp);
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const firebaseUser = userCredential.user;
      const actionCodeSettings = { url: window.location.origin + "/company/login", handleCodeInApp: true };
      try {
        await sendEmailVerification(firebaseUser, actionCodeSettings);
      } catch (err: any) {
        setEmailError("Account created, but we couldn't send the verification email. Try resending from the login page.");
      }
      const profileData = { id: firebaseUser.uid, name: data.name, email: data.email, role: data.role, phone: `+91${data.phone}` };
      const response = await fetch("/api/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(profileData) });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create user profile.");
      }
      await auth.signOut();
      toast({ title: "Account Created!", description: "A verification email has been sent. Please verify to complete registration." });
      router.push("/company/login");
    } catch (error: any) {
      let errorMessage = "An unexpected error occurred.";
      if (error.code === 'auth/email-already-in-use') errorMessage = 'This email address is already in use.';
      else if (error.code === 'auth/weak-password') errorMessage = 'The password is too weak.';
      else if (error.message) errorMessage = error.message;
      toast({ title: "Signup Failed", description: errorMessage, variant: "destructive" });
    }
  };

  if (loading || user) return null;

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-[42%] relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 flex-col justify-between p-12">
        <div className="absolute top-0 -left-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -right-20 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl" />

      

        <div className="relative z-10 space-y-8">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
            <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight mb-4">
              Build Your <br />
              <span className="text-emerald-200">Dream Team</span>
            </h1>
            <p className="text-emerald-100 text-lg leading-relaxed max-w-sm">
              Join thousands of recruiters who find exceptional talent through our platform — completely free.
            </p>
          </motion.div>

          <div className="space-y-4">
            {recruiterBenefits.map((b, idx) => (
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
              "We filled 3 senior engineering roles in under 10 days using referral listings. Incredible platform!"
            </p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold">R</div>
              <div>
                <p className="text-white text-sm font-semibold">Rahul M.</p>
                <p className="text-emerald-200 text-xs">HR Manager, TechCorp India</p>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="relative z-10">
          <p className="text-emerald-100 text-sm">
            Looking for a job instead?{" "}
            <Link href="/signup" className="text-white font-semibold underline underline-offset-2 hover:text-emerald-100 transition-colors">
              Candidate Sign Up →
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right Panel — Form */}
      <div className="w-full lg:w-[58%] flex items-center justify-center px-6 py-10 lg:px-16">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-md">

         

          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4">
              <Zap className="w-3 h-3" /> Recruiter Sign Up
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1">Create recruiter account 🏢</h2>
            <p className="text-slate-500 text-sm">Free forever. Start posting jobs in minutes.</p>
          </div>

          {emailError && (
            <Alert variant="destructive" className="mb-5 rounded-xl">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Email Warning</AlertTitle>
              <AlertDescription>{emailError}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-semibold text-sm">Full Name</FormLabel>
                  <FormControl><Input placeholder="John Doe" className="h-11 rounded-xl border-slate-200 focus:border-emerald-400 bg-slate-50 focus:bg-white transition-colors" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-semibold text-sm">Work Email</FormLabel>
                    <FormControl><Input type="email" placeholder="you@company.com" className="h-11 rounded-xl border-slate-200 focus:border-emerald-400 bg-slate-50 focus:bg-white transition-colors" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-semibold text-sm">Phone Number</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <div className="flex items-center justify-center px-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-bold text-sm select-none animate-in fade-in slide-in-from-left-2 duration-300">
                          +91
                        </div>
                        <Input placeholder="9876543210" className="h-11 rounded-xl border-slate-200 focus:border-emerald-400 bg-slate-50 focus:bg-white transition-colors flex-1" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="role" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-semibold text-sm">Your Role</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-11 rounded-xl border-slate-200 focus:border-emerald-400 bg-slate-50 focus:bg-white transition-colors">
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Recruiter">Recruiter — Post & manage job listings</SelectItem>
                      <SelectItem value="Employee">Employee — Share referral opportunities</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField control={form.control} name="password" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-semibold text-sm">Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input type={showPassword ? "text" : "password"} placeholder="Min. 8 characters" className="h-11 rounded-xl border-slate-200 focus:border-emerald-400 bg-slate-50 focus:bg-white transition-colors pr-10" {...field} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-semibold text-sm">Confirm Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input type={showConfirm ? "text" : "password"} placeholder="Re-enter password" className="h-11 rounded-xl border-slate-200 focus:border-emerald-400 bg-slate-50 focus:bg-white transition-colors pr-10" {...field} />
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
                <Button type="submit" className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-lg shadow-emerald-200 transition-all" disabled={isSubmitting}>
                  {isSubmitting ? <LoaderCircle className="mr-2 h-5 w-5 animate-spin" /> : <ArrowRight className="mr-2 h-5 w-5" />}
                  {isSubmitting ? "Creating Account..." : "Create Recruiter Account"}
                </Button>
              </motion.div>
            </form>
          </Form>

          <p className="mt-4 text-center text-xs text-slate-400">
            By signing up, you agree to our{" "}
            <Link href="/terms" className="text-emerald-600 hover:underline">Terms of Service</Link>
            {" "}and{" "}
            <Link href="/privacy" className="text-emerald-600 hover:underline">Privacy Policy</Link>.
          </p>

          <p className="mt-4 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link href="/company/login" className="text-emerald-600 font-semibold hover:text-emerald-700 transition-colors">Sign in</Link>
          </p>

          
        </motion.div>
      </div>
    </div>
  );
}
