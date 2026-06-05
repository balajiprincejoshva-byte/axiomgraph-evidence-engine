"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertOctagon, GitMerge, Zap } from "lucide-react";
import { motion } from "framer-motion";

export function ContradictionRadar({ contradictions }: { contradictions: any[] }) {
  if (!contradictions || contradictions.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
        <AlertOctagon className="w-5 h-5 text-red-600 dark:text-rose-400" />
        Contradiction Radar
      </h3>
      <div className="grid gap-4">
        {contradictions.map((con, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.15 }}
          >
            <Card className="border-red-200 dark:border-rose-900/50 bg-red-50 dark:bg-rose-950/20/10 backdrop-blur-md relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-red-600 dark:bg-rose-400" />
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  {con.conflict_type === "Methodological Divergence" ? (
                    <GitMerge className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  ) : (
                    <Zap className="w-4 h-4 text-red-600 dark:text-rose-400" />
                  )}
                  <CardTitle className="text-sm font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    {con.conflict_type}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                  {con.description}
                </p>
                <div className="mt-3 text-xs text-red-600 dark:text-rose-400/80 bg-red-50 dark:bg-rose-950/20/30 inline-block px-2 py-1 rounded border border-red-200 dark:border-rose-900/50/30">
                  Target Relation: {con.claim_type}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
