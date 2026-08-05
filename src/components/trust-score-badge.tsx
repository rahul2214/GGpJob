import { Badge } from "@/components/ui/badge";
import { ShieldCheck, ShieldAlert, Shield } from "lucide-react";

interface TrustScoreBadgeProps {
  score: number;
  showLevel?: boolean;
}

export function TrustScoreBadge({ score = 100, showLevel = false }: TrustScoreBadgeProps) {
  const getLevel = (s: number) => {
    if (s >= 90) return { label: 'High Trust', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: ShieldCheck };
    if (s >= 60) return { label: 'Good Trust', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Shield };
    return { label: 'Low Trust', color: 'bg-rose-100 text-rose-800 border-rose-200', icon: ShieldAlert };
  };

  const level = getLevel(score);
  const Icon = level.icon;

  return (
    <div className="flex flex-col gap-1 items-start">
        <Badge variant="outline" className={`${level.color} flex items-center gap-1 px-2 py-0.5 font-bold`}>
            <Icon className="w-3 h-3" />
            {score}
        </Badge>
        {showLevel && <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider pl-0.5">{level.label}</span>}
    </div>
  );
}
