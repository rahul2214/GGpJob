
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
import { LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/user-context";
import { useEffect, useState } from "react";
import { getAuth, signInWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail } from "firebase/auth";
import { firebaseApp } from "@/firebase/config";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

type LoginFormValues = z.infer<typeof formSchema>;

export default function CompanyLoginPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { user, loading } = useUser();
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [isResending, setIsResending] = useState(false);

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
    setIsResending(true);
    try {
        const auth = getAuth(firebaseApp);
        const { password } = form.getValues();
        
        if (!password) {
            toast({ title: 'Password Required', description: 'Please enter your password in the login form to resend the verification email.', variant: 'destructive' });
            return;
        }

        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;

        if (firebaseUser && !firebaseUser.emailVerified) {
            const actionCodeSettings = {
                url: window.location.origin + "/company/login",
                handleCodeInApp: true,
            };
            await sendEmailVerification(firebaseUser, actionCodeSettings);
            toast({ title: 'Verification Email Sent', description: 'A new verification link has been sent. Please check your inbox and spam folder.' });
        } else if (firebaseUser?.emailVerified) {
            toast({ title: 'Already Verified', description: 'Your email is already verified. You can log in normally.' });
        }
        
        await auth.signOut();
    } catch (error: any) {
        console.error("Company resend error:", error);
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
          description: "Please verify your email address before logging in. Check your inbox for the link.",
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

  const handlePasswordReset = async () => {
    const email = form.getValues("email");
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address in the form to reset your password.",
        variant: "destructive",
      });
      return false;
    }

    setIsResettingPassword(true);
    try {
      const auth = getAuth(firebaseApp);
      await sendPasswordResetEmail(auth, email);
      toast({
        title: "Password Reset Email Sent",
        description: "Check your inbox for a link to reset your password.",
      });
      return true;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send password reset email.",
        variant: "destructive",
      });
      return false;
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
          <CardTitle>Company Login</CardTitle>
          <CardDescription>
            Recruiter & Employee access.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="your.email@company.com"
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
                                        placeholder="your.email@company.com"
                                        defaultValue={form.getValues("email")}
                                        onChange={(e) => form.setValue("email", e.target.value)}
                                    />
                                </div>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={async (e) => {
                                    e.preventDefault();
                                    const success = await handlePasswordReset();
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
                Sign In
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            Don't have an account?{" "}
            <Link href="/company/signup" className="underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
