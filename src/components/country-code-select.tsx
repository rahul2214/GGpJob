"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { COUNTRY_CODES } from "@/utils/country-codes";

interface CountryCodeSelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function CountryCodeSelect({ value, onChange, className }: CountryCodeSelectProps) {
  const selectedCountry = COUNTRY_CODES.find(c => c.dial_code === value) || COUNTRY_CODES[0];

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={className || "h-11 min-w-[115px] max-w-[130px] rounded-xl border border-slate-200 bg-slate-100 text-slate-700 font-bold text-sm focus:ring-2 focus:ring-indigo-400 select-none cursor-pointer"}>
        <SelectValue>
          <span className="flex items-center gap-1.5 font-bold text-slate-700">
            <span className="text-base">{selectedCountry.flag}</span>
            <span>{selectedCountry.dial_code}</span>
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="max-h-[195px] overflow-y-auto min-w-[210px] rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
        {COUNTRY_CODES.map((c) => (
          <SelectItem key={`${c.code}-${c.dial_code}`} value={c.dial_code} className="cursor-pointer py-2 px-3 focus:bg-slate-100 rounded-lg">
            <span className="flex items-center gap-2">
              <span className="text-base">{c.flag}</span>
              <span className="font-bold text-slate-800 text-sm">{c.dial_code}</span>
              <span className="text-xs text-slate-400 font-medium truncate">({c.name})</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
