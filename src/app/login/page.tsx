
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
import { LoaderCircle, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/user-context";
import { useEffect, useState } from "react";
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendEmailVerification, sendPasswordResetEmail } from "firebase/auth";
import { firebaseApp } from "@/firebase/config";

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

export default function LoginPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { user, loading, fetchUserProfile } = useUser();
  const [showPassword, setShowPassword] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

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

  const handleResendVerification = async (email: string) => {
    try {
        const auth = getAuth(firebaseApp);
        const { password } = form.getValues();
        if (!password) {
            toast({ title: 'Password Required', description: 'Please enter your password to resend verification.', variant: 'destructive' });
            return;
        }
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        if (userCredential.user && !userCredential.user.emailVerified) {
            await sendEmailVerification(userCredential.user);
            toast({ title: 'Verification Email Sent', description: 'A new verification email has been sent to your address.' });
        }
        await auth.signOut(); // Sign out immediately
    } catch (error: any) {
        toast({ title: 'Error', description: 'Failed to resend verification email. Please check your credentials.', variant: 'destructive' });
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
          description: "Please verify your email address before logging in. Check your inbox for the verification link.",
          variant: "destructive",
           action: <Button variant="secondary" size="sm" onClick={() => handleResendVerification(data.email)}>Resend Email</Button>
        });
        return;
      }

      // The onAuthStateChanged listener will handle the redirect
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
      await signInWithPopup(auth, provider);
      // The onAuthStateChanged listener will handle profile creation and redirect
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        return;
      }
      console.error(error);
      toast({
        title: "Google Sign-In Failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const handlePasswordReset = async () => {
    const email = form.getValues("email");
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address in the form to reset your password.",
        variant: "destructive",
      });
      return false; // Indicate failure
    }
    
    setIsResettingPassword(true);
    try {
      const auth = getAuth(firebaseApp);
      await sendPasswordResetEmail(auth, email);
      toast({
        title: "Password Reset Email Sent",
        description: "Check your inbox for a link to reset your password.",
      });
      return true; // Indicate success
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send password reset email.",
        variant: "destructive",
      });
      return false; // Indicate failure
    } finally {
      setIsResettingPassword(false);
    }
  };

  if (loading || user) {
    return null;
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-128px)] bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Job Seeker Login</CardTitle>
          <CardDescription>
            Welcome back! Please sign in to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="link" type="button" className="p-0 h-auto text-sm">Forgot Password?</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Reset Password</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Enter your email address below. If an account exists, we'll send you a link to reset your password.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <div className="py-4">
                                     <Input
                                        id="reset-email"
                                        type="email"
                                        placeholder="your.email@example.com"
                                        defaultValue={form.getValues("email")}
                                        onChange={(e) => form.setValue("email", e.target.value)}
                                    />
                                </div>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={async (e) => {
                                    e.preventDefault();
                                    const success = await handlePasswordReset();
                                    // This is a bit of a hack to keep the dialog open on failure.
                                    // A more robust solution might use a custom Dialog component.
                                    if(success) {
                                      const cancel = document.querySelector('[data-radix-collection-item][aria-label="Cancel"]');
                                      if(cancel instanceof HTMLElement) cancel.click();
                                    }
                                }}
                                disabled={isResettingPassword}>
                                     {isResettingPassword && (
                                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                    )}
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
                 <Button variant="google" className="w-full" onClick={handleGoogleSignIn}>
                    <GoogleIcon />
                    Sign in with Google
                </Button>
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

    

    