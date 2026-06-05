"use client";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Beaker, ShieldAlert, BookOpen, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

export function EvidenceCard({ claim, index }: { claim: any, index: number }) {
  const getSourceIcon = (type: string) => {
    switch(type) {
      case "research_paper": return <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case "clinical_trial": return <Beaker className="w-4 h-4 text-cyan-600 dark:text-emerald-400" />;
      case "safety_report": return <ShieldAlert className="w-4 h-4 text-red-600 dark:text-rose-400" />;
      default: return <FileText className="w-4 h-4 text-slate-600 dark:text-slate-400" />;
    }
  };

  const getConfidenceColor = (conf: number) => {
    if (conf >= 0.8) return "bg-cyan-600 dark:bg-emerald-400/10 text-cyan-600 dark:text-emerald-400 border-cyan-600 dark:border-emerald-400/20";
    if (conf >= 0.5) return "bg-amber-600 dark:bg-amber-400/10 text-amber-600 dark:text-amber-400 border-amber-600 dark:border-amber-400/20";
    return "bg-red-600 dark:bg-rose-400/10 text-red-600 dark:text-rose-400 border-red-600 dark:border-rose-400/20";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 backdrop-blur-sm overflow-hidden hover:border-slate-300 dark:border-slate-700 transition-colors">
        <CardHeader className="pb-2 border-b border-slate-200 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-950 flex flex-row items-start justify-between">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-base font-semibold text-slate-800 dark:text-slate-200">
              {claim.text}
            </CardTitle>
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 mt-1">
              {getSourceIcon(claim.document_type)}
              <span className="font-medium text-slate-700 dark:text-slate-300">{claim.document_title}</span>
            </div>
          </div>
          <Badge variant="outline" className={getConfidenceColor(claim.confidence)}>
            Conf: {Math.round(claim.confidence * 100)}%
          </Badge>
        </CardHeader>
        <CardContent className="pt-4 pb-4">
          <div className="relative pl-4 border-l-2 border-slate-300 dark:border-slate-700">
            <p className="text-sm text-slate-700 dark:text-slate-300 italic">
              "{claim.extracted_quote}"
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-4">
            {claim.polarity === "negative" && (
              <Badge variant="secondary" className="bg-red-50 dark:bg-rose-950/20/30 text-red-600 dark:text-rose-400 border-red-200 dark:border-rose-900/50">
                <AlertTriangle className="w-3 h-3 mr-1" /> Negative Polarity
              </Badge>
            )}
            <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:bg-slate-700">
              Strength: {claim.evidence_strength}
            </Badge>
            <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:bg-slate-700">
              {claim.claim_type.replace("_", " ")}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
