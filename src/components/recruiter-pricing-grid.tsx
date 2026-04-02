"use client";

import { RECRUITER_PLANS } from "@/lib/pricing-constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { CheckCircle2, Lock, ArrowRight, LoaderCircle } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface RecruiterPricingGridProps {
  onPlanSelect?: (plan: any) => void;
  isMarketing?: boolean;
  processingId?: string | null;
  disabled?: boolean;
}

export default function RecruiterPricingGrid({ onPlanSelect, isMarketing = false, processingId = null, disabled = false }: RecruiterPricingGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {RECRUITER_PLANS.map((plan, idx) => (
        <motion.div
          key={plan.id}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: idx * 0.1, duration: 0.5 }}
          className="flex"
        >
          <Card className={cn(
            "relative flex flex-col w-full border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white transition-all hover:scale-[1.02]",
            plan.popular && "ring-4 ring-amber-400/30 shadow-amber-200/40"
          )}>
            {plan.popular && (
              <div className="absolute top-0 right-0 bg-amber-500 text-white px-6 py-2 rounded-bl-[1.5rem] text-xs font-bold tracking-widest uppercase z-20">
                Most Popular
              </div>
            )}
            
            <div className={cn(
              "p-8 text-white",
              plan.color === 'emerald' && "bg-gradient-to-br from-emerald-600 to-teal-700",
              plan.color === 'amber' && "bg-gradient-to-br from-amber-500 to-orange-600",
              plan.color === 'sky' && "bg-gradient-to-br from-sky-500 to-blue-600",
              plan.color === 'indigo' && "bg-gradient-to-br from-indigo-600 to-purple-700"
            )}>
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6">
                <plan.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-1">{plan.name}</h3>
              <p className="text-white/80 text-sm leading-relaxed mb-6">{plan.description}</p>
              
              <div className="flex items-center flex-wrap gap-2.5 mb-2">
                {plan.originalPrice && (
                  <>
                    <span className="text-white/60 font-medium text-xl line-through decoration-white/40 pt-1">₹{plan.originalPrice}</span>
                    <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider mt-1">
                      Save {Math.round((1 - plan.price / plan.originalPrice) * 100)}%
                    </span>
                  </>
                )}
                <span className="text-4xl font-black tracking-tighter pt-1 ml-auto">₹{plan.price}</span>
              </div>
            </div>

            <CardContent className="p-8 flex-grow">
              <div className="space-y-4">
                <p className="text-sm font-bold text-slate-400 tracking-widest uppercase">What's included:</p>
                <ul className="space-y-4">
                  {plan.features.map((feature: string, fIdx: number) => (
                    <li key={fIdx} className="flex items-start gap-3">
                      <CheckCircle2 className={cn(
                        "w-5 h-5 mt-0.5 shrink-0",
                        plan.color === 'emerald' && "text-emerald-500",
                        plan.color === 'amber' && "text-amber-500",
                        plan.color === 'sky' && "text-sky-500",
                        plan.color === 'indigo' && "text-indigo-500"
                      )} />
                      <span className="text-slate-600 text-sm font-medium leading-snug">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>

            <CardFooter className="p-8 pt-0">
              {isMarketing ? (
                <Link href="/company/signup" className="w-full">
                  <Button
                    className={cn(
                      "w-full h-14 rounded-2xl font-bold text-lg shadow-lg transition-all group",
                      plan.color === 'emerald' && "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200",
                      plan.color === 'amber' && "bg-amber-500 hover:bg-amber-600 shadow-amber-200",
                      plan.color === 'sky' && "bg-sky-500 hover:bg-sky-600 shadow-sky-200",
                      plan.color === 'indigo' && "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200",
                      "text-white"
                    )}
                  >
                    Get Started <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              ) : (
                <Button
                  onClick={() => onPlanSelect?.(plan)}
                  disabled={disabled || !!processingId}
                  className={cn(
                    "w-full h-14 rounded-2xl font-bold text-lg shadow-lg transition-all group",
                    plan.color === 'emerald' && "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200",
                    plan.color === 'amber' && "bg-amber-500 hover:bg-amber-600 shadow-amber-200",
                    plan.color === 'sky' && "bg-sky-500 hover:bg-sky-600 shadow-sky-200",
                    plan.color === 'indigo' && "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200",
                    "text-white"
                  )}
                >
                  {processingId === plan.id ? (
                    <LoaderCircle className="w-6 h-6 animate-spin" />
                  ) : (
                    <span className="flex items-center gap-2">
                      Get {plan.name} <Lock className="w-4 h-4 opacity-30 group-hover:opacity-100 transition-opacity" />
                    </span>
                  )}
                </Button>
              )}
            </CardFooter>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
