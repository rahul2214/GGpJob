
"use client";

import { useEffect, useState } from "react";
import { 
  getAuth, 
  applyActionCode, 
  verifyPasswordResetCode, 
  confirmPasswordReset 
} from "firebase/auth";
import { firebaseApp } from "@/firebase/config";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LoaderCircle, CheckCircle, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ActionPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error" | "resetForm">("loading");
  const [message, setMessage] = useState("Processing your request...");
  const [resetEmail, setResetEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get("mode");
    const oobCode = urlParams.get("oobCode");
    const auth = getAuth(firebaseApp);

    if (!mode || !oobCode) {
      setStatus("error");
      setMessage("Invalid action link.");
      return;
    }

    if (mode === "verifyEmail") {
      applyActionCode(auth, oobCode)
        .then(() => {
          setStatus("success");
          setMessage("Your email has been verified successfully! You can now log in.");
        })
        .catch((error) => {
          setStatus("error");
          let friendlyMessage = "Failed to verify email.";
          switch (error.code) {
            case 'auth/expired-action-code':
              friendlyMessage = "This verification link has expired. Please request a new one.";
              break;
            case 'auth/invalid-action-code':
              friendlyMessage = "This verification link is invalid. It may have already been used or is malformed.";
              break;
            case 'auth/user-disabled':
              friendlyMessage = "Your account has been disabled. Please contact support.";
              break;
            default:
              friendlyMessage = "An unexpected error occurred. Please try again.";
              break;
          }
          setMessage(friendlyMessage);
          console.error(error);
        });
        return;
    }

    if (mode === "resetPassword") {
      verifyPasswordResetCode(auth, oobCode)
        .then((email) => {
          setResetEmail(email);
          setStatus("resetForm");
          setMessage(`Create a new password for ${email}`);
        })
        .catch((error) => {
          setStatus("error");
          setMessage("The password reset link is invalid or has expired. Please try requesting a new one.");
        });
      return;
    }

    setStatus("error");
    setMessage("Invalid action. Please check the link and try again.");
  }, []);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const urlParams = new URLSearchParams(window.location.search);
    const oobCode = urlParams.get("oobCode");
    const auth = getAuth(firebaseApp);

    if (!oobCode) {
      setStatus("error");
      setMessage("Invalid or missing action code.");
      return;
    }
    if (newPassword.length < 8) {
      setMessage("Password must be at least 8 characters long.");
      return;
    }

    setIsSubmitting(true);
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setStatus("success");
      setMessage("Your password has been reset successfully! You can now log in.");
    } catch (error) {
      setStatus("error");
      setMessage("Failed to reset password. The link may have expired. Please try requesting a new reset link.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStatus = () => {
    switch (status) {
        case "loading":
            return (
                <>
                    <LoaderCircle className="h-12 w-12 text-muted-foreground animate-spin" />
                    <CardTitle>Processing...</CardTitle>
                    <CardDescription>{message}</CardDescription>
                </>
            );
        case "success":
            return (
                 <>
                    <CheckCircle className="h-12 w-12 text-green-500" />
                    <CardTitle>Success!</CardTitle>
                    <CardDescription>{message}</CardDescription>
                </>
            );
        case "error":
            return (
                 <>
                    <XCircle className="h-12 w-12 text-destructive" />
                    <CardTitle>Error</CardTitle>
                    <CardDescription>{message}</CardDescription>
                </>
            );
        case "resetForm":
            return (
                 <>
                    <CardTitle>Reset Password</CardTitle>
                    <CardDescription>{message}</CardDescription>
                </>
            )
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center items-center gap-4">
          {renderStatus()}
        </CardHeader>

        {status === 'resetForm' && (
            <CardContent>
                <form onSubmit={handlePasswordReset} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="password">New Password</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="Enter new password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            minLength={8}
                            required
                        />
                         {message && newPassword.length > 0 && newPassword.length < 8 && <p className="text-sm text-destructive">Password must be at least 8 characters long.</p>}
                    </div>
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                         {isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                        Set New Password
                    </Button>
                </form>
            </CardContent>
        )}

        {status === 'success' || status === 'error' ? (
             <CardFooter>
                <Button asChild className="w-full">
                    <Link href="/login">Proceed to Login</Link>
                </Button>
            </CardFooter>
        ) : null}
      </Card>
    </div>
  );
}

