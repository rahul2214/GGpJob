"use client";

import { useState, useEffect } from "react";
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

interface CurrencySelectorProps {
  /** Restrict the dropdown to these currency codes (skips the full DB list). */
  options?: string[];
  /** Controlled selection; defaults to the global currency from the user context. */
  value?: string;
  /** Controlled change handler; defaults to updating the global currency. */
  onChange?: (code: string) => void;
}

export function CurrencySelector({ options, value, onChange }: CurrencySelectorProps = {}) {
  const { currency, setCurrency } = useUser();
  const restricted = Array.isArray(options) && options.length > 0;
  const [currenciesList, setCurrenciesList] = useState(() =>
    restricted
      ? options!
          .map(code => SUPPORTED_CURRENCIES.find(c => c.code.toUpperCase() === code.toUpperCase()))
          .filter(Boolean) as typeof SUPPORTED_CURRENCIES
      : SUPPORTED_CURRENCIES
  );

  useEffect(() => {
    // A restricted selector is a fixed list — no need to merge the DB currencies.
    if (restricted) return;

    fetch('/api/currencies')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const merged = data.map((dbItem: any) => {
            const match = SUPPORTED_CURRENCIES.find(c => c.code.toUpperCase() === dbItem.code.toUpperCase());
            return {
              code: dbItem.code,
              symbol: dbItem.symbol || match?.symbol || '$',
              label: match?.label || `${dbItem.code} (${dbItem.symbol || ''})`,
              flag: match?.flag || '🌐'
            };
          });
          setCurrenciesList(merged);
        }
      })
      .catch(() => {});
  }, [restricted]);

  const selected = (value ?? currency) || '';
  const handleSelect = onChange ?? setCurrency;

  const currentSelection = currenciesList.find(
    (c) => c.code.toUpperCase() === selected.toUpperCase()
  ) || currenciesList[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="h-10 px-3.5 rounded-xl border-slate-200 hover:bg-slate-50 font-bold text-xs uppercase tracking-wider text-slate-700 gap-2 shadow-sm transition-all hover:scale-[1.01] active:scale-95 bg-white"
        >
          <span className="text-base leading-none">{currentSelection?.flag || '🌐'}</span>
          <span>{currentSelection?.code || selected}</span>
          <Globe className="w-3.5 h-3.5 text-slate-400" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="rounded-2xl border-slate-100 shadow-xl p-1.5 w-[180px] max-h-72 overflow-y-auto bg-white">
        {currenciesList.map((item) => (
          <DropdownMenuItem
            key={item.code}
            onClick={() => handleSelect(item.code)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 focus:bg-indigo-50 focus:text-indigo-700 cursor-pointer"
          >
            <span className="text-base leading-none">{item.flag}</span>
            <span>{item.code} ({item.symbol})</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
export default CurrencySelector;
