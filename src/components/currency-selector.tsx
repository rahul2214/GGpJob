"use client";

import { useUser } from "@/contexts/user-context";
import { SUPPORTED_CURRENCIES } from "@/utils/currency";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

export function CurrencySelector() {
  const { currency, setCurrency } = useUser();

  const currentSelection = SUPPORTED_CURRENCIES.find(
    (c) => c.code.toUpperCase() === currency.toUpperCase()
  ) || SUPPORTED_CURRENCIES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="h-10 px-3.5 rounded-xl border-slate-200 hover:bg-slate-50 font-bold text-xs uppercase tracking-wider text-slate-700 gap-2 shadow-sm transition-all hover:scale-[1.01] active:scale-95 bg-white"
        >
          <span className="text-base leading-none">{currentSelection.flag}</span>
          <span>{currentSelection.code}</span>
          <Globe className="w-3.5 h-3.5 text-slate-400" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="rounded-2xl border-slate-100 shadow-xl p-1.5 w-[160px] bg-white">
        {SUPPORTED_CURRENCIES.map((item) => (
          <DropdownMenuItem
            key={item.code}
            onClick={() => setCurrency(item.code)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 focus:bg-indigo-50 focus:text-indigo-700 cursor-pointer"
          >
            <span className="text-base leading-none">{item.flag}</span>
            <span>{item.code}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
export default CurrencySelector;
