
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
import { useEffect } from "react";
import { getAuth, signInWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { firebaseApp } from "@/firebase/config";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

type LoginFormValues = z.infer<typeof formSchema>;

export default function CompanyLoginPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { user, loading, login } = useUser();

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
        // To resend, we need to sign the user in temporarily and then sign them out.
        // This is a common pattern for this flow.
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

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const auth = getAuth(firebaseApp);
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      
      if (!userCredential.user.emailVerified) {
        // Sign the user out because they are not verified
        await auth.signOut();
        toast({
          title: "Email Not Verified",
          description: "Please verify your email address before logging in. Check your inbox for the verification link.",
          variant: "destructive",
           action: <Button variant="secondary" size="sm" onClick={() => handleResendVerification(data.email)}>Resend Email</Button>
        });
        return;
      }

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
                    <FormLabel>Password</FormLabel>
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
