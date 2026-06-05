"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bookmark, Clock, Trash2, Play } from "lucide-react";
import { toast } from "sonner";

export function SavedInvestigations({ onLoadSaved }: { onLoadSaved: (query: string) => void }) {
  const [saves, setSaves] = useState<any[]>([]);

  useEffect(() => {
    loadSaves();
  }, []);

  const loadSaves = () => {
    try {
      const stored = localStorage.getItem("axiomgraph_saves");
      if (stored) {
        setSaves(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const deleteSave = (id: string) => {
    const updated = saves.filter(s => s.id !== id);
    localStorage.setItem("axiomgraph_saves", JSON.stringify(updated));
    setSaves(updated);
    toast.success("Investigation removed");
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Bookmark className="w-6 h-6 text-cyan-600 dark:text-emerald-400" />
        <h2 className="text-lg font-bold text-slate-700 dark:text-slate-300">Saved Investigations</h2>
      </div>

      {saves.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 mt-20 border border-dashed border-slate-200 dark:border-slate-800 rounded-sm bg-white dark:bg-slate-900/20 p-12">
          <Bookmark className="w-12 h-12 mb-4 text-slate-800 dark:text-slate-200" />
          <p className="max-w-md text-center">You haven't saved any hypothesis tests yet. Run a pressure test and click "Save" to bookmark it here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {saves.map((save) => (
            <Card key={save.id} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:border-slate-700 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-slate-800 dark:text-slate-200 text-base font-semibold">{save.query}</CardTitle>
                  <Button variant="ghost" size="icon" onClick={() => deleteSave(save.id)} className="h-6 w-6 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:text-rose-400 hover:bg-red-50 dark:bg-rose-950/20/30">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <CardDescription className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
                  <Clock className="w-3 h-3" /> {new Date(save.timestamp).toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-4">{save.summary}</p>
                <div className="flex justify-between items-center border-t border-slate-200 dark:border-slate-800/50 pt-4">
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    <span className="text-cyan-600 dark:text-emerald-400">{save.supportCount} Support</span> • <span className="text-red-600 dark:text-rose-400">{save.opposeCount} Oppose</span>
                  </div>
                  <Button size="sm" className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:bg-slate-700 text-cyan-600 dark:text-emerald-400" onClick={() => onLoadSaved(save.query)}>
                    <Play className="w-3 h-3 mr-1" /> Re-run Test
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
