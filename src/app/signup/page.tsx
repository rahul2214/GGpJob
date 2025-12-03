
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { LoaderCircle } from "lucide-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Domain } from "@/lib/types";

// Google Icon Component
const GoogleIcon = () => (
  <svg className="mr-2 h-4 w-4" viewBox="0 0 48 48">
    <path
      fill="#FFC107"
      d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8
      c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154
      7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24
      4C12.955 4 4 12.955 4 24s8.955 20 20
      20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
    />
    <path
      fill="#FF3D00"
      d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24
      12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046
      6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306
      14.691z"
    />
    <path
      fill="#4CAF50"
      d="M24 44c5.166 0 9.86-1.977
      13.409-5.192l-6.19-5.238A8 8 0 0 1 24
      36c-5.222 0-9.61-3.868-11.28-8.892l-6.522
      5.025C9.505 39.556 16.227 44 24 44z"
    />
    <path
      fill="#1976D2"
      d="M43.611 20.083H42V20H24v8h11.303c-1.649
      4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12
      12-12c3.059 0 5.842 1.154 7.961
      3.039l5.657-5.657C34.046 6.053 29.268
      4 24 4C12.955 4 4 12.955 4
      24s8.955 20 20 20s20-8.955
      20-20c0-1.341-.138-2.65-.389-3.917z"
    />
  </svg>
);

// ✅ Validation Schema
const formSchema = z
  .object({
    name: z.string().min(2, "Full name must be at least 2 characters."),
    email: z.string().email("Please enter a valid email address."),
    phone: z
      .string()
      .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian phone number."),
    domainId: z.string().min(1, "Please select your domain."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignupFormValues = z.infer<typeof formSchema>;

export default function SignupPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { user, loading } = useUser();
  const [domains, setDomains] = useState<Domain[]>([]);

  useEffect(() => {
    const fetchDomains = async () => {
        try {
            const res = await fetch('/api/domains');
            if (res.ok) {
                setDomains(await res.json());
            }
        } catch (error) {
            console.error("Failed to fetch domains", error);
        }
    }
    fetchDomains();
  }, []);

  useEffect(() => {
    if (!loading && user) {
      router.push("/");
    }
  }, [user, loading, router]);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      domainId: "",
      password: "",
      confirmPassword: "",
    },
  });

  const { isSubmitting } = form.formState;

  // ✅ Email/Password Signup
  const onSubmit = async (data: SignupFormValues) => {
    try {
      const auth = getAuth(firebaseApp);
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      const firebaseUser = userCredential.user;
      
      // Create profile in Firestore
      const profileData = {
        id: firebaseUser.uid,
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: "Job Seeker",
        domainId: data.domainId,
      };

      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create user profile.");
      }

      await sendEmailVerification(firebaseUser);
      
      // We sign out here to force the user to log in and verify their email
      await auth.signOut();

      toast({
        title: "Account Created!",
        description: "A verification email has been sent to your inbox. Please verify your email to log in.",
      });

      router.push("/login");

    } catch (error: any) {
      let errorMessage = "An unexpected error occurred.";
      if (error.code) {
        switch (error.code) {
          case "auth/email-already-in-use":
            errorMessage = "This email address is already in use.";
            break;
          case "auth/weak-password":
            errorMessage = "The password is too weak.";
            break;
          default:
            errorMessage = error.message;
        }
      } else {
        errorMessage = error.message;
      }
      toast({
        title: "Signup Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // ✅ Google Signup
  const handleGoogleSignUp = async () => {
    const auth = getAuth(firebaseApp);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // The onAuthStateChanged listener will handle profile creation and redirect
    } catch (error: any) {
       if (error.code === 'auth/popup-closed-by-user') {
        return;
      }
      console.error(error);
      toast({
        title: "Google Sign-Up Failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  if (loading || user) {
    return null;
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-128px)] bg-gray-50 py-12">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle>Create your Job Seeker Account</CardTitle>
          <CardDescription>
            Join our platform to find your next opportunity.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="your.email@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* ✅ Only +91 Phone Number Input */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <div className="flex items-center">
                        <span className="px-3 py-2 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md text-gray-600 text-sm">
                          +91
                        </span>
                        <Input
                          type="tel"
                          maxLength={10}
                          placeholder="Enter 10-digit phone number"
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, "");
                            field.onChange(value);
                          }}
                          value={field.value}
                          className="rounded-l-none"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="domainId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Domain</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your primary job domain" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {domains.map(domain => (
                          <SelectItem key={domain.id} value={domain.id}>
                            {domain.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && (
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Account
              </Button>
            </form>
          </Form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <Button variant="google" className="w-full" onClick={handleGoogleSignUp}>
            <GoogleIcon />
            Sign up with Google
          </Button>

          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
