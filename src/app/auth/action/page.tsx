
"use client";

import { useEffect, useState } from "react";
import { getAuth, applyActionCode } from "firebase/auth";
import { firebaseApp } from "@/firebase/config";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LoaderCircle, CheckCircle, XCircle } from "lucide-react";

export default function ActionPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Processing your request...");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get("mode");
    const oobCode = urlParams.get("oobCode");
    const auth = getAuth(firebaseApp);

    if (mode === "verifyEmail" && oobCode) {
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
    } else {
        setStatus("error");
        setMessage("Invalid action. Please check the link and try again.");
    }
  }, []);

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
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center items-center gap-4">
          {renderStatus()}
        </CardHeader>
        {status !== 'loading' && (
             <CardFooter>
                <Button asChild className="w-full">
                    <Link href="/login">Proceed to Login</Link>
                </Button>
            </CardFooter>
        )}
      </Card>
    </div>
  );
}
