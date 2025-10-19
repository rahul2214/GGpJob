
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
import { LoaderCircle, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/user-context";
import { useEffect, useState } from "react";
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { firebaseApp } from "@/firebase/config";
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

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
        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
);

export default function LoginPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { user, loading, login } = useUser();
  const [showPassword, setShowPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'email' | 'otp'>('email');
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [isOtpLoading, setIsOtpLoading] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.push('/');
    }
  }, [user, loading, router]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { isSubmitting } = form.formState;

  const onEmailSubmit = async (data: LoginFormValues) => {
    try {
      const auth = getAuth(firebaseApp);
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      
      await login(userCredential.user);

      toast({
        title: "Login Successful!",
        description: "Welcome back!",
      });

      router.push("/");
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
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleGoogleSignIn = async () => {
    const auth = getAuth(firebaseApp);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      // Check if user profile exists in our DB
      const profileRes = await fetch(`/api/users?uid=${firebaseUser.uid}`);
      
      if (profileRes.status === 404) {
        // User does not exist, create a profile
        const profileData = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'New User',
          email: firebaseUser.email,
          role: 'Job Seeker',
        };
        const createProfileRes = await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profileData),
        });
        if (!createProfileRes.ok) {
            throw new Error('Failed to create user profile.');
        }
      }

      await login(firebaseUser);
      
      toast({
        title: "Signed In with Google!",
        description: "Welcome to Job Portal!",
      });
      router.push("/");

    } catch (error: any) {
      console.error(error);
      toast({
        title: "Google Sign-In Failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const onCaptchVerify = () => {
    const auth = getAuth(firebaseApp);
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response: any) => {
          onSignup();
        },
        'expired-callback': () => {
        }
      });
    }
  }

  const onSignup = () => {
    setIsOtpLoading(true);
    onCaptchVerify();

    const auth = getAuth(firebaseApp);
    const appVerifier = (window as any).recaptchaVerifier;

    signInWithPhoneNumber(auth, phone, appVerifier)
      .then((confirmationResult) => {
        (window as any).confirmationResult = confirmationResult;
        setIsOtpLoading(false);
        setShowOtpInput(true);
        toast({ title: "OTP Sent!", description: "An OTP has been sent to your phone number." });
      }).catch((error) => {
        console.log(error);
        setIsOtpLoading(false);
        toast({ title: "OTP Send Failed", description: "Failed to send OTP. Please try again.", variant: "destructive" });
      });
  }

  const onOTPVerify = async () => {
    setIsOtpLoading(true);
    (window as any).confirmationResult.confirm(otp).then(async (result: any) => {
      const firebaseUser = result.user;
      
      const profileRes = await fetch(`/api/users?uid=${firebaseUser.uid}`);
      if (profileRes.status === 404) {
        const profileData = { id: firebaseUser.uid, name: 'New User', email: firebaseUser.email, role: 'Job Seeker', phone: firebaseUser.phoneNumber };
        await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profileData),
        });
      }

      await login(firebaseUser);
      setIsOtpLoading(false);
      toast({ title: "Login Successful!", description: "Welcome back!" });
      router.push("/");
    }).catch((error: any) => {
      setIsOtpLoading(false);
      toast({ title: "OTP Verification Failed", description: "Invalid OTP. Please try again.", variant: "destructive" });
    });
  }


  if (loading || user) {
    return null;
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-128px)] bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Job Seeker Login</CardTitle>
          <CardDescription>
            Access your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div id="recaptcha-container"></div>
          {loginMethod === 'email' ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onEmailSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email ID</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter your active Email ID"
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
                          <FormLabel>Password</FormLabel>
                          <Link href="#" className="text-sm text-primary hover:underline">
                              Forgot Password?
                          </Link>
                      </div>
                      <FormControl>
                        <div className="relative">
                          <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter your password"
                              {...field}
                          />
                          <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                          >
                              {showPassword ? (
                                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                              ) : (
                                  <Eye className="h-4 w-4" aria-hidden="true" />
                              )}
                              <span className="sr-only">
                                  {showPassword ? "Hide password" : "Show password"}
                              </span>
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting && (
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Login
                </Button>
              </form>
            </Form>
          ) : (
            <div className="space-y-4">
              {showOtpInput ? (
                <>
                  <FormLabel>Enter OTP</FormLabel>
                  <Input 
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter OTP"
                  />
                  <Button onClick={onOTPVerify} className="w-full" disabled={isOtpLoading}>
                     {isOtpLoading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                     Verify OTP
                  </Button>
                </>
              ) : (
                 <>
                  <FormLabel>Phone Number</FormLabel>
                  <PhoneInput
                    defaultCountry="IN"
                    value={phone}
                    onChange={setPhone}
                    placeholder="Enter phone number"
                  />
                   <Button onClick={onSignup} className="w-full" disabled={isOtpLoading || !phone}>
                     {isOtpLoading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                     Send OTP
                   </Button>
                 </>
              )}
               <Button variant="link" className="w-full" onClick={() => setLoginMethod('email')}>
                    Login with Email
                </Button>
            </div>
          )}

           <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                    Or
                    </span>
                </div>
            </div>
            
            <div className="space-y-4">
                 <Button variant="outline" className="w-full" onClick={handleGoogleSignIn}>
                    <GoogleIcon />
                    Sign in with Google
                </Button>
                 {loginMethod === 'email' && (
                    <Button variant="link" className="w-full" onClick={() => setLoginMethod('otp')}>
                        Use OTP to Login
                    </Button>
                 )}
            </div>


          <div className="mt-4 text-center text-sm">
            Don't have an account?{" "}
            <Link href="/signup" className="underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
