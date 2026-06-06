"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Scale, Target, Activity, Zap } from "lucide-react";
import { toast } from "sonner";
import { StabilityCard } from "./StabilityCard";

export function CompareView() {
  const [queryA, setQueryA] = useState("Osimertinib");
  const [queryB, setQueryB] = useState("Erlotinib");
  const [isLoading, setIsLoading] = useState(false);
  const [resultA, setResultA] = useState<any>(null);
  const [resultB, setResultB] = useState<any>(null);

  const handleCompare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryA.trim() || !queryB.trim()) return;

    setIsLoading(true);
    try {
      const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const [resA, resB] = await Promise.all([
        fetch(`${API}/query`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: queryA }),
        }),
        fetch(`${API}/query`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: queryB }),
        })
      ]);

      if (!resA.ok || !resB.ok) throw new Error("Failed to fetch comparisons");
      
      const [dataA, dataB] = await Promise.all([resA.json(), resB.json()]);
      setResultA(dataA);
      setResultB(dataB);
      toast.success("Comparison complete");
    } catch (err) {
      toast.error("Failed to connect to AxiomGraph engine.");
    } finally {
      setIsLoading(false);
    }
  };

  const getAvgStability = (result: any) => {
    if (!result || !result.supporting_evidence || result.supporting_evidence.length === 0) return 0;
    const total = result.supporting_evidence.reduce((acc: number, c: any) => acc + (c.stability_score || 0), 0);
    return total / result.supporting_evidence.length;
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Scale className="w-6 h-6 text-cyan-600 dark:text-emerald-400" />
        <h2 className="text-lg font-bold text-slate-700 dark:text-slate-300">Hypothesis Comparison Engine</h2>
      </div>

      <form onSubmit={handleCompare} className="flex gap-4 items-center bg-white dark:bg-slate-900 p-6 rounded-sm border border-slate-200 dark:border-slate-800">
        <div className="flex-1 space-y-2">
          <label className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold">Hypothesis A</label>
          <Input 
            value={queryA}
            onChange={(e) => setQueryA(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200"
          />
        </div>
        <div className="text-slate-500 dark:text-slate-400 font-bold px-2 mt-6">VS</div>
        <div className="flex-1 space-y-2">
          <label className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold">Hypothesis B</label>
          <Input 
            value={queryB}
            onChange={(e) => setQueryB(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200"
          />
        </div>
        <Button type="submit" disabled={isLoading} className="bg-cyan-700 dark:bg-emerald-500 hover:bg-cyan-600 dark:bg-emerald-400 text-white mt-6 px-8">
          {isLoading ? "Running..." : "Test Both"}
        </Button>
      </form>

      {!resultA && !isLoading && (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 mt-20">
          <Scale className="w-16 h-16 mb-4 text-slate-800 dark:text-slate-200" />
          <p className="max-w-md text-center">Compare two drugs, biomarkers, or pathways side-by-side to evaluate which has a stronger foundation of evidence.</p>
        </div>
      )}

      {isLoading && (
        <div className="flex gap-6 mt-8 animate-pulse">
          <div className="flex-1 h-[500px] bg-white dark:bg-slate-900 rounded-sm"></div>
          <div className="flex-1 h-[500px] bg-white dark:bg-slate-900 rounded-sm"></div>
        </div>
      )}

      {resultA && resultB && !isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Column A */}
          <div className="space-y-6">
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 border-t-4 border-t-cyan-600 dark:emerald-400">
              <CardHeader>
                <CardTitle className="text-slate-800 dark:text-slate-200 text-base font-semibold">{queryA}</CardTitle>
                <CardDescription>Average Stability: <span className="font-bold text-cyan-600 dark:text-emerald-400">{getAvgStability(resultA).toFixed(1)}/100</span></CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-4">{resultA.summary}</p>
                {resultA.next_experiment && (
                   <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                      <span className="text-cyan-600 dark:text-emerald-400 font-semibold block mb-1">Recommended Next Step:</span>
                      {resultA.next_experiment.description || resultA.next_experiment}
                   </div>
                )}
              </CardContent>
            </Card>

            <div>
              <h3 className="text-sm font-medium text-cyan-600 dark:text-emerald-400 mb-3 uppercase tracking-wider">Top Evidence</h3>
              <div className="space-y-3">
                {resultA.supporting_evidence?.slice(0, 2).map((claim: any, idx: number) => (
                  <StabilityCard key={idx} claim={claim} index={idx} />
                ))}
              </div>
            </div>
          </div>

          {/* Column B */}
          <div className="space-y-6">
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 border-t-4 border-t-blue-500">
              <CardHeader>
                <CardTitle className="text-slate-800 dark:text-slate-200 text-base font-semibold">{queryB}</CardTitle>
                <CardDescription>Average Stability: <span className="font-bold text-blue-600 dark:text-blue-400">{getAvgStability(resultB).toFixed(1)}/100</span></CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-4">{resultB.summary}</p>
                {resultB.next_experiment && (
                   <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                      <span className="text-blue-600 dark:text-blue-400 font-semibold block mb-1">Recommended Next Step:</span>
                      {resultB.next_experiment.description || resultB.next_experiment}
                   </div>
                )}
              </CardContent>
            </Card>

            <div>
              <h3 className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-3 uppercase tracking-wider">Top Evidence</h3>
              <div className="space-y-3">
                {resultB.supporting_evidence?.slice(0, 2).map((claim: any, idx: number) => (
                  <StabilityCard key={idx} claim={claim} index={idx} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
