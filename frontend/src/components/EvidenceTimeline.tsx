"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useTheme } from "next-themes";
import { Activity } from "lucide-react";

export function EvidenceTimeline({ supporting_evidence, opposing_evidence }: { supporting_evidence: any[], opposing_evidence: any[] }) {
  const { theme } = useTheme();

  const chartData = useMemo(() => {
    const yearsMap = new Map<number, { year: number, support: number, oppose: number }>();
    
    // Default range for the last 10 years if data is sparse
    const currentYear = new Date().getFullYear();
    for (let i = currentYear - 10; i <= currentYear; i++) {
        yearsMap.set(i, { year: i, support: 0, oppose: 0 });
    }

    const processClaims = (claims: any[], type: 'support' | 'oppose') => {
      if (!claims) return;
      claims.forEach(c => {
        const yr = c.publication_year || currentYear;
        if (!yearsMap.has(yr)) {
          yearsMap.set(yr, { year: yr, support: 0, oppose: 0 });
        }
        const data = yearsMap.get(yr)!;
        if (type === 'support') data.support += 1;
        else data.oppose += 1;
      });
    };

    processClaims(supporting_evidence, 'support');
    processClaims(opposing_evidence, 'oppose');

    // Sort chronologically
    return Array.from(yearsMap.values()).sort((a, b) => a.year - b.year);
  }, [supporting_evidence, opposing_evidence]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 p-3 rounded-sm shadow-xl">
          <p className="text-slate-700 dark:text-slate-300 font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: <span className="font-bold">{entry.value}</span> claims
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const supportColor = theme === 'dark' ? '#10b981' : '#0891b2';
  const opposeColor = theme === 'dark' ? '#f43f5e' : '#dc2626';
  const gridColor = theme === 'dark' ? '#334155' : '#e2e8f0';

  return (
    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-blue-600 dark:text-blue-400 flex items-center gap-2 text-base font-semibold">
          <Activity className="w-5 h-5" /> Evidence Drift Timeline
        </CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-400">
          Chronological mapping of scientific consensus and conflict.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorSupport" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={supportColor} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={supportColor} stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorOppose" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={opposeColor} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={opposeColor} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis 
                dataKey="year" 
                stroke="#64748b" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Area 
                type="monotone" 
                dataKey="support" 
                name="Supporting Evidence" 
                stroke={supportColor} 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorSupport)" 
              />
              <Area 
                type="monotone" 
                dataKey="oppose" 
                name="Opposing/Conflicting Evidence" 
                stroke={opposeColor} 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorOppose)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
