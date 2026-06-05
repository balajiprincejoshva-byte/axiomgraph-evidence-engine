"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Beaker, ShieldAlert, BookOpen, AlertTriangle, Fingerprint, Activity, ExternalLink, Target } from "lucide-react";
import { motion } from "framer-motion";

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export function StabilityCard({ claim, index }: { claim: any, index: number }) {
  const getSourceIcon = (type: string) => {
    switch(type) {
      case "research_paper": return <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case "clinical_trial": return <Activity className="w-4 h-4 text-cyan-600 dark:text-emerald-400" />;
      case "meta_analysis": return <BookOpen className="w-4 h-4 text-indigo-600 dark:text-purple-400" />;
      case "case_report": return <Fingerprint className="w-4 h-4 text-orange-400" />;
      case "safety_report": return <ShieldAlert className="w-4 h-4 text-red-600 dark:text-rose-400" />;
      default: return <FileText className="w-4 h-4 text-slate-600 dark:text-slate-400" />;
    }
  };

  const score = claim.stability_score || 0;
  
  const getStabilityColor = (score: number) => {
    if (score >= 80) return "bg-cyan-600 dark:bg-emerald-400/10 text-cyan-600 dark:text-emerald-400 border-cyan-600 dark:border-emerald-400/20";
    if (score >= 50) return "bg-amber-600 dark:bg-amber-400/10 text-amber-600 dark:text-amber-400 border-amber-600 dark:border-amber-400/20";
    return "bg-red-600 dark:bg-rose-400/10 text-red-600 dark:text-rose-400 border-red-600 dark:border-rose-400/20";
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Sheet>
        <SheetTrigger asChild>
          <div className="cursor-pointer">
            <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 backdrop-blur-sm overflow-hidden hover:border-slate-300 dark:border-slate-700 transition-colors">
              <CardHeader className="pb-2 border-b border-slate-200 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-950 flex flex-row items-start justify-between">
                <div className="flex flex-col gap-1 pr-4">
                  <CardTitle className="text-base font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                    {claim.text}
                  </CardTitle>
                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 mt-1">
                    {getSourceIcon(claim.document_type)}
                    <span className="font-medium text-slate-700 dark:text-slate-300 line-clamp-1">
                      {claim.document_title} ({claim.publication_year})
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <Badge variant="outline" className={getStabilityColor(score)}>
                    Stability: {score.toFixed(1)}
                  </Badge>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 tracking-wider uppercase">Gravity Map</span>
                </div>
              </CardHeader>
              <CardContent className="pt-4 pb-4">
                <div className="relative pl-4 border-l-2 border-slate-300 dark:border-slate-700 mb-4">
                  <p className="text-sm text-slate-700 dark:text-slate-300 italic line-clamp-2">
                    "{claim.extracted_quote}"
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-2 text-xs">
                  <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700">
                    {claim.document_type?.replace("_", " ")}
                  </Badge>
                  {claim.polarity === "negative" && (
                    <Badge variant="secondary" className="bg-red-50 dark:bg-rose-950/20/30 text-red-600 dark:text-rose-400 border-red-200 dark:border-rose-900/50">
                      <AlertTriangle className="w-3 h-3 mr-1" /> Opposing Vector
                    </Badge>
                  )}
                  {claim.polarity === "positive" && (
                    <Badge variant="secondary" className="bg-cyan-50 dark:bg-emerald-950/20/30 text-cyan-600 dark:text-emerald-400 border-cyan-100 dark:border-emerald-900/50">
                      Supporting Vector
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </SheetTrigger>
        <SheetContent className="w-[400px] sm:w-[540px] bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-xl font-bold uppercase tracking-tight text-slate-100 flex items-center gap-2">
              <Fingerprint className="w-6 h-6 text-cyan-600 dark:text-emerald-400" />
              Claim Lineage
            </SheetTitle>
            <SheetDescription className="text-slate-600 dark:text-slate-400">
              Forensic audit trail for the extracted evidence.
            </SheetDescription>
          </SheetHeader>
          
          <div className="space-y-6">
            {/* The Extracted Claim */}
            <div>
              <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Assay Overview</h4>
              <div className="p-4 rounded-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <p className="text-slate-800 dark:text-slate-200 font-medium">{claim.text}</p>
                <div className="flex items-center gap-3 mt-3 text-xs text-slate-600 dark:text-slate-400">
                  <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> Score: {score.toFixed(1)}/100</span>
                  <span className="flex items-center gap-1"><Target className="w-3 h-3" /> Relation: {claim.relation}</span>
                </div>
              </div>
            </div>

            {/* Source Sentence Highlight */}
            <div>
              <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Original Extracted Sentence</h4>
              <div className="p-4 rounded-sm bg-cyan-50 dark:bg-emerald-950/20 border border-cyan-200 dark:border-emerald-900/50/30">
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic border-l-2 border-cyan-600 dark:border-emerald-400 pl-3">
                  "{claim.extracted_quote}"
                </p>
              </div>
            </div>

            {/* Document Metadata */}
            <div>
              <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Source Document</h4>
              <div className="p-4 rounded-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{claim.document_title}</p>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <div><span className="text-slate-500 dark:text-slate-400">Year:</span> {claim.publication_year}</div>
                  <div><span className="text-slate-500 dark:text-slate-400">Type:</span> <span className="capitalize">{claim.document_type?.replace("_", " ")}</span></div>
                  <div className="col-span-2"><span className="text-slate-500 dark:text-slate-400">Methodology:</span> <span className="capitalize">{claim.methodology?.replace("_", " ")}</span></div>
                </div>
                {claim.url && (
                  <a href={claim.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-300 mt-2">
                    <ExternalLink className="w-3 h-3" /> View Official Source
                  </a>
                )}
              </div>
            </div>

            {/* Stability Reasoning Breakdown */}
            <div>
              <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Stability Breakdown</h4>
              <div className="space-y-3">
                {claim.stability_breakdown?.contributors && claim.stability_breakdown.contributors.length > 0 && (
                  <div className="p-3 rounded-sm bg-cyan-50 dark:bg-emerald-950/20 border border-cyan-200 dark:border-emerald-900/50/30">
                    <h5 className="text-[10px] uppercase font-bold text-cyan-600 dark:text-emerald-400 mb-2 tracking-wider">Contributors</h5>
                    <ul className="space-y-1">
                      {claim.stability_breakdown.contributors.map((c: string, i: number) => (
                        <li key={i} className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
                          <span className="text-cyan-600 dark:text-emerald-400 mt-1">+</span> {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {claim.stability_breakdown?.penalties && claim.stability_breakdown.penalties.length > 0 && (
                  <div className="p-3 rounded-sm bg-red-50 dark:bg-rose-950/20/10 border border-red-200 dark:border-rose-900/50/30">
                    <h5 className="text-[10px] uppercase font-bold text-red-600 dark:text-rose-400 mb-2 tracking-wider">Penalties</h5>
                    <ul className="space-y-1">
                      {claim.stability_breakdown.penalties.map((p: string, i: number) => (
                        <li key={i} className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
                          <span className="text-red-600 dark:text-rose-400 mt-1">-</span> {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

          </div>
        </SheetContent>
      </Sheet>
    </motion.div>
  );
}
