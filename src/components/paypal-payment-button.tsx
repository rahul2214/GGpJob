"use client";

import { useEffect, useState, useRef } from "react";
import { Loader2 } from "lucide-react";

interface PayPalPaymentButtonProps {
  amount: number;
  currency: string;
  planId: string;
  userId: string;
  couponCode?: string;
  onSuccess: (details: any) => void;
  onError: (err: any) => void;
}

declare global {
  interface Window {
    paypal: any;
  }
}

export function PayPalPaymentButton({
  amount,
  currency,
  planId,
  userId,
  couponCode,
  onSuccess,
  onError
}: PayPalPaymentButtonProps) {
  const [sdkReady, setSdkReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRenderedRef = useRef(false);

  useEffect(() => {
    // 1. Reset rendering state when amount/currency changes
    if (containerRef.current) {
      containerRef.current.innerHTML = "";
    }
    buttonRenderedRef.current = false;

    // 2. Build Paypal SDK URL
    const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "test";
    const scriptId = "paypal-sdk-script";
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    const initPaypalButtons = () => {
      if (window.paypal && containerRef.current && !buttonRenderedRef.current) {
        buttonRenderedRef.current = true;
        window.paypal.Buttons({
          style: {
            layout: 'vertical',
            color:  'gold',
            shape:  'rect',
            label:  'paypal'
          },
          createOrder: (data: any, actions: any) => {
            return actions.order.create({
              purchase_units: [
                {
                  amount: {
                    currency_code: currency.toUpperCase(),
                    value: amount.toFixed(2),
                  },
                  description: `${planId} Plan Purchase`,
                },
              ],
            });
          },
          onApprove: async (data: any, actions: any) => {
            const details = await actions.order.capture();
            onSuccess({
              paypal_order_id: data.orderID,
              paypal_payment_id: details.id,
              userId,
              planId,
              couponCode,
              currency
            });
          },
          onError: (err: any) => {
            console.error("PayPal SDK Button Error:", err);
            onError(err);
          }
        }).render(containerRef.current);
      }
    };

    if (window.paypal) {
      setSdkReady(true);
      initPaypalButtons();
    } else {
      // Load SDK Script dynamically
      if (script) {
        script.remove();
      }
      script = document.createElement("script");
      script.id = scriptId;
      script.src = `https://www.paypal.com/sdk/js?client-id=${paypalClientId}&currency=${currency.toUpperCase()}`;
      script.async = true;
      script.onload = () => {
        setSdkReady(true);
        initPaypalButtons();
      };
      script.onerror = (err) => {
        console.error("Failed to load PayPal SDK:", err);
        onError(err);
      };
      document.body.appendChild(script);
    }

    return () => {
      // Do not clean up script so it can be re-used, but reset rendered flag
      buttonRenderedRef.current = false;
    };
  }, [amount, currency, planId, userId, couponCode]);

  return (
    <div className="w-full min-h-[50px] flex flex-col justify-center relative">
      {!sdkReady && (
        <div className="flex items-center justify-center py-4 text-xs font-bold text-slate-500 gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
          Loading PayPal Secure Checkout...
        </div>
      )}
      <div ref={containerRef} className="w-full z-10" />
    </div>
  );
}
export default PayPalPaymentButton;
