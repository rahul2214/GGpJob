"use client";

import { useUser } from "@/contexts/user-context";
import { getBillingCurrency, getPaymentGateway, BillingCurrency } from "@/utils/currency";

/**
 * Pricing/checkout pages only ever deal with INR or USD. The profile currency
 * decides which one: INR profiles pay in INR via Razorpay, every other profile
 * currency is billed in USD via PayPal.
 */
export function useBillingCurrency() {
  const { currency, setCurrency, exchangeRates } = useUser();

  const billingCurrency: BillingCurrency = getBillingCurrency(currency);

  const setBillingCurrency = (code: string) => setCurrency(getBillingCurrency(code));

  return {
    billingCurrency,
    setBillingCurrency,
    gateway: getPaymentGateway(billingCurrency),
    exchangeRates,
  };
}
