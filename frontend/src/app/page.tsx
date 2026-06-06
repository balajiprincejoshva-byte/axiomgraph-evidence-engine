"use client";

import { useState, useEffect } from "react";
import { SplashScreen } from "@/components/SplashScreen";
import { Search, Activity, Network, FileText, Download, Target, Microscope, TestTube2, AlertTriangle, ShieldAlert, ExternalLink, Scale, Bookmark, Skull } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { StabilityCard } from "@/components/StabilityCard";
import { ContradictionRadar } from "@/components/ContradictionRadar";
import { GraphExplorer } from "@/components/GraphExplorer";

import { EvidenceTimeline } from "@/components/EvidenceTimeline";
import { CompareView } from "@/components/CompareView";
import { SavedInvestigations } from "@/components/SavedInvestigations";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function TelemetryMatrix() {
  const [splashDone, setSplashDone] = useState(false);
  const [query, setQuery] = useState("Osimertinib suppresses EGFR");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [activeView, setActiveView] = useState("hub"); 
  const [activeTab, setActiveTab] = useState("breakdown");
  const [methodologyFilter, setMethodologyFilter] = useState("all");
  const [isCounterfactual, setIsCounterfactual] = useState(false);
  const [time, setTime] = useState("");

  useEffect(() => {
    setTime(new Date().toLocaleTimeString());
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    
    setIsLoading(true);
    setActiveView("hub");
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${API_URL}/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setResult(data);
      if (data.documents) {
        setDocuments(data.documents);
      }
      toast.success("Hypothesis pressure test complete");
    } catch (err) {
      toast.error("Failed to connect to AxiomGraph engine.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    if (!result) return;
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${API_URL}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      
      const blob = new Blob([data.markdown], { type: 'text/markdown' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `axiomgraph_report_${Date.now()}.md`;
      a.click();
      toast.success("Report downloaded");
    } catch (err) {
      toast.error("Export failed");
    }
  };

  const handleSaveInvestigation = () => {
    if (!result) return;
    try {
      const stored = localStorage.getItem("axiomgraph_saves");
      const saves = stored ? JSON.parse(stored) : [];
      
      // Prevent duplicates
      if (saves.find((s: any) => s.query === query)) {
        toast.info("This investigation is already saved.");
        return;
      }

      const newSave = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        query: query,
        summary: result.summary,
        supportCount: result.supporting_evidence?.length || 0,
        opposeCount: result.opposing_evidence?.length || 0
      };

      saves.push(newSave);
      localStorage.setItem("axiomgraph_saves", JSON.stringify(saves));
      toast.success("Investigation saved to Bookmarks!");
    } catch (e) {
      toast.error("Failed to save investigation.");
    }
  };

  const loadFullGraph = async () => {
    setActiveView("graph");
    if (!result || !result.graph || !result.graph.nodes || result.graph.nodes.length === 0) {
      setIsLoading(true);
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const res = await fetch(`${API_URL}/graph/subgraph`);
        const data = await res.json();
        setResult((prev: any) => ({
          top_claims: [],
          supporting_evidence: [],
          opposing_evidence: [],
          contradictions: [],
          gaps: [],
          ...prev,
          summary: prev?.summary || "Loaded entire knowledge base graph.",
          graph: data
        }));
      } catch(err) {
        toast.error("Failed to load global graph.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <>
      {!splashDone && <SplashScreen onComplete={() => setSplashDone(true)} />}
      <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h1 className="text-lg font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
            <Microscope className="w-6 h-6 text-cyan-600 dark:text-emerald-400" />
            AxiomGraph
          </h1>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-widest font-bold">TELEMETRY ENGINE</p>
        </div>
        <nav className="flex-1 p-4 space-y-2 text-sm font-medium">
          <Button 
            variant="ghost" 
            onClick={() => setActiveView("hub")}
            className={`w-full justify-start rounded-none border-l-2 text-xs ${activeView === 'hub' ? 'bg-cyan-50 dark:bg-emerald-950/20 border-cyan-600 dark:border-emerald-400 text-cyan-800 dark:text-emerald-300' : 'border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:bg-slate-800 hover:text-slate-900 dark:text-slate-50'}`}
          >
            <Target className="w-4 h-4 mr-2 shrink-0" />
            <span className="truncate">Initialize Sequence Analysis</span>
          </Button>
          <Button 
            variant="ghost" 
            onClick={loadFullGraph}
            className={`w-full justify-start rounded-none border-l-2 ${activeView === 'graph' ? 'bg-cyan-50 dark:bg-emerald-950/20 border-cyan-600 dark:border-emerald-400 text-cyan-800 dark:text-emerald-300' : 'border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:bg-slate-800 hover:text-slate-900 dark:text-slate-50'}`}
          >
            <Network className="w-4 h-4 mr-2" />
            Causal Walker
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => setActiveView("compare")}
            className={`w-full justify-start rounded-none border-l-2 ${activeView === 'compare' ? 'bg-cyan-50 dark:bg-emerald-950/20 border-cyan-600 dark:border-emerald-400 text-cyan-800 dark:text-emerald-300' : 'border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:bg-slate-800 hover:text-slate-900 dark:text-slate-50'}`}
          >
            <Scale className="w-4 h-4 mr-2" />
            Compare Mode
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => setActiveView("documents")}
            className={`w-full justify-start rounded-none border-l-2 ${activeView === 'documents' ? 'bg-cyan-50 dark:bg-emerald-950/20 border-cyan-600 dark:border-emerald-400 text-cyan-800 dark:text-emerald-300' : 'border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:bg-slate-800 hover:text-slate-900 dark:text-slate-50'}`}
          >
            <FileText className="w-4 h-4 mr-2" />
            Source Library
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => setActiveView("saved")}
            className={`w-full justify-start rounded-none border-l-2 ${activeView === 'saved' ? 'bg-cyan-50 dark:bg-emerald-950/20 border-cyan-600 dark:border-emerald-400 text-cyan-800 dark:text-emerald-300' : 'border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:bg-slate-800 hover:text-slate-900 dark:text-slate-50'}`}
          >
            <Bookmark className="w-4 h-4 mr-2" />
            Bookmarks
          </Button>
        </nav>
        <div className="p-4 pb-12 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          Engine: Deterministic FTS<br />
          Stability Algorithm: V2
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Telemetry Bar */}
        <div className="h-8 bg-slate-900 text-slate-300 text-[10px] uppercase tracking-widest font-mono flex items-center justify-between px-4">
          <div className="flex gap-6">
            <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-cyan-500 dark:bg-emerald-500"></div> SEQUENCE RUN: ACTIVE</span>
            <span>LATENCY: 12ms</span>
            <span>BUFFER STATUS: 94.2%</span>
          </div>
          <div className="flex gap-4">
            <span className="tabular-nums">SYS_TIME: {time || "00:00:00"}</span>
            <span>ID: AX-9021</span>
          </div>
        </div>

        {/* Topbar / Hypothesis Input */}
        <header className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
          <form onSubmit={handleSearch} className="flex-1 max-w-3xl flex gap-2">
            <Input 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter a scientific hypothesis..."
              className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-cyan-600 dark:emerald-400 text-slate-800 dark:text-slate-200 h-12 text-base font-semibold"
            />
            <Button type="submit" disabled={isLoading} className="bg-cyan-700 dark:bg-emerald-500 hover:bg-cyan-600 dark:bg-emerald-400 text-white h-12 px-6">
              {isLoading ? "Running..." : "Test"}
            </Button>
          </form>
          {result && (
            <div className="flex gap-2 ml-4">
              <Button variant="outline" onClick={handleSaveInvestigation} className="border-cyan-200 dark:border-emerald-900/50 text-cyan-600 dark:text-emerald-400 hover:bg-cyan-50 dark:bg-emerald-950/20">
                <Bookmark className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button variant="outline" onClick={handleExport} className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          )}
          <div className="ml-4">
             <ThemeToggle />
          </div>
        </header>

        {/* Telemetry Matrix & Assay Overview */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeView === "documents" && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-600 dark:text-emerald-400" /> Source Library
              </h2>
              {documents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {documents.map((doc, idx) => (
                    <Card key={idx} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:border-slate-700 transition-colors">
                      <CardHeader className="pb-2">
                        <div className="w-fit mb-2 text-[10px] uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 px-2 py-0.5 rounded">
                          {doc.source_type?.replace("_", " ")}
                        </div>
                        <CardTitle className="text-base text-slate-800 dark:text-slate-200 line-clamp-2">{doc.title}</CardTitle>
                        <CardDescription className="text-slate-600 dark:text-slate-400 text-xs">
                          {doc.authors} • {doc.publication_year || doc.publication_date}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">{doc.abstract}</p>
                      </CardContent>
                      <div className="px-6 pb-4 pt-2 mt-auto">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full text-cyan-600 dark:text-emerald-400 hover:text-emerald-300 hover:bg-cyan-600 dark:bg-emerald-400/10 justify-center"
                          onClick={() => {
                            if (doc.url) {
                              window.open(doc.url, '_blank');
                            } else {
                              toast.info("This is a simulated demo document. In a production environment, this would link to PubMed or the publisher's website.");
                            }
                          }}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Official Source
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 mt-32 animate-pulse">
                  Loading library...
                </div>
              )}
            </div>
          )}

          {activeView === "graph" && (
             <div className="h-full flex flex-col space-y-4 min-h-[600px]">
                <h2 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">Causal Knowledge Graph</h2>
                {isLoading ? (
                  <div className="w-full h-[600px] bg-white dark:bg-slate-900 rounded-sm animate-pulse"></div>
                ) : (
                  result?.graph && result.graph.nodes && result.graph.nodes.length > 0 ? <GraphExplorer data={result.graph} /> : <div className="p-12 text-center text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 rounded-sm bg-slate-50 dark:bg-slate-950">No graph data available.</div>
                )}
             </div>
          )}

          {activeView === "compare" && <CompareView />}

          {activeView === "saved" && (
            <SavedInvestigations onLoadSaved={(q) => {
               setQuery(q);
               handleSearch();
            }} />
          )}

          {activeView === "hub" && !result && !isLoading && (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 mt-32">
              <Target className="w-16 h-16 mb-4 text-slate-800 dark:text-slate-200" />
              <h2 className="text-xl font-bold uppercase tracking-tight font-medium text-slate-600 dark:text-slate-400">Initialize Sequence Analysis a Hypothesis</h2>
              <p className="mt-2 text-md max-w-lg text-center text-slate-500 dark:text-slate-400">
                Input a claim. AxiomGraph will retrieve the strongest supporting and opposing evidence, map structural contradictions, and recommend the next optimal experiment.
              </p>
            </div>
          )}

          {activeView === "hub" && isLoading && (
            <div className="space-y-4">
              <div className="h-32 bg-white dark:bg-slate-900 rounded-sm animate-pulse"></div>
              <div className="flex gap-4">
                <div className="w-1/2 h-96 bg-white dark:bg-slate-900 rounded-sm animate-pulse"></div>
                <div className="w-1/2 h-96 bg-white dark:bg-slate-900 rounded-sm animate-pulse"></div>
              </div>
            </div>
          )}

          {activeView === "hub" && result && !isLoading && (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 mb-6">
                <TabsTrigger value="breakdown">Evidence Breakdown</TabsTrigger>
                <TabsTrigger value="graph">Subgraph</TabsTrigger>
              </TabsList>
              
              <TabsContent value="breakdown" className="space-y-6 mt-0">
                
                {/* Top Level Summary & Next Experiment */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Hypothesis Pressure Survival Score & Consensus Meter */}
                  <Card className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 col-span-1 lg:col-span-3 relative overflow-hidden">
                    {isCounterfactual && (
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 dark:rose-400 via-indigo-600 dark:purple-400 to-red-600 dark:rose-400 animate-pulse"></div>
                    )}
                    <CardContent className="p-6 flex flex-col md:flex-row items-center gap-8">
                      {/* Survival Score Circle */}
                      <div className="flex flex-col items-center justify-center shrink-0 relative">
                        <div className={`relative w-32 h-32 rounded-full border-4 ${isCounterfactual ? 'border-red-200 dark:border-rose-900/50 bg-red-50 dark:bg-rose-950/20' : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950'} flex items-center justify-center transition-colors duration-500`}>
                          {(() => {
                            // Counterfactual Testing: Remove the #1 supporting paper
                            let supportPool = result.supporting_evidence || [];
                            if (isCounterfactual && supportPool.length > 0) {
                              supportPool = supportPool.slice(1); // remove top support
                            }
                            
                            const supportCount = supportPool.length;
                            const opposeCount = result.opposing_evidence?.length || 0;
                            const totalSupportScore = supportPool.reduce((acc: number, c: any) => acc + (c.stability_score || 0), 0) || 0;
                            const avgSupport = supportCount > 0 ? totalSupportScore / supportCount : 0;
                            const penalty = (opposeCount * 5) + ((result.uncertainty_factors?.length || 0) * 10) + (isCounterfactual ? 20 : 0);
                            const survivalScore = Math.max(0, Math.min(100, Math.round(avgSupport - penalty)));
                            
                            const color = survivalScore >= 70 ? "text-cyan-600 dark:text-emerald-400" : survivalScore >= 40 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-rose-400";
                            
                            return (
                              <div className="text-center">
                                <div className={`text-4xl font-bold ${color} transition-all duration-500`}>{survivalScore}</div>
                                <div className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 mt-1">Survival</div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                      
                      <div className="flex-1 w-full space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">Pressure Survival Score</h3>
                            {isCounterfactual ? (
                              <p className="text-sm text-red-600 dark:text-rose-400 leading-relaxed max-w-3xl font-medium animate-pulse">
                                COUNTERFACTUAL MODE: Keystone paper removed. Simulating structural collapse...
                              </p>
                            ) : (
                              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl">{result.summary}</p>
                            )}
                          </div>
                          
                          <Button 
                            variant={isCounterfactual ? "destructive" : "outline"}
                            size="sm"
                            onClick={() => setIsCounterfactual(!isCounterfactual)}
                            className={isCounterfactual ? "animate-pulse" : "border-indigo-200 dark:border-purple-900/40 text-indigo-600 dark:text-purple-400 hover:bg-indigo-50 dark:bg-purple-950/10"}
                          >
                            <Skull className="w-4 h-4 mr-2" />
                            {isCounterfactual ? "Restore Paradigm" : "Simulate Collapse"}
                          </Button>
                        </div>
                        
                        {/* Claim Consensus Meter */}
                        <div className="space-y-2 max-w-xl">
                          <div className="flex justify-between text-xs font-medium uppercase tracking-wider">
                            <span className="text-cyan-600 dark:text-emerald-400">Support</span>
                            <span className="text-slate-500 dark:text-slate-400">Uncertainty</span>
                            <span className="text-red-600 dark:text-rose-400">Opposition</span>
                          </div>
                          {(() => {
                            let supportPool = result.supporting_evidence || [];
                            if (isCounterfactual && supportPool.length > 0) {
                              supportPool = supportPool.slice(1);
                            }
                            
                            const supportCount = supportPool.length;
                            const opposeCount = result.opposing_evidence?.length || 0;
                            const total = supportCount + opposeCount || 1; // prevent div by zero
                            
                            // Visual percentages (leaving 20% hardcoded for uncertainty space if gaps exist)
                            const hasGaps = result.gaps?.length > 0 || isCounterfactual;
                            const uncertaintyWidth = hasGaps ? (isCounterfactual ? 40 : 20) : 5;
                            const remainingWidth = 100 - uncertaintyWidth;
                            
                            const supportWidth = Math.max(5, Math.round((supportCount / total) * remainingWidth));
                            const opposeWidth = remainingWidth - supportWidth;
                            
                            return (
                              <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full flex overflow-hidden">
                                <div className="h-full bg-cyan-600 dark:bg-emerald-400 transition-all duration-1000" style={{ width: `${supportWidth}%` }}></div>
                                <div className="h-full bg-slate-300 dark:bg-slate-600 transition-all duration-1000" style={{ width: `${uncertaintyWidth}%` }}></div>
                                <div className="h-full bg-red-600 dark:bg-rose-400 transition-all duration-1000" style={{ width: `${opposeWidth}%` }}></div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {result.plausibility && (
                    <Card className={`bg-white dark:bg-slate-900 ${result.plausibility.rating === 'High' ? 'border-blue-100 dark:border-blue-900/50' : 'border-slate-200 dark:border-slate-800'}`}>
                      <CardHeader className="pb-2">
                        <CardTitle className={`text-base flex items-center gap-2 ${result.plausibility.rating === 'High' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400'}`}>
                          <Activity className="w-5 h-5" /> Biological Plausibility
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{result.plausibility.reason}</p>
                      </CardContent>
                    </Card>
                  )}
                  
                  {result.uncertainty_factors && result.uncertainty_factors.length > 0 ? (
                    <Card className="bg-amber-50 dark:bg-amber-950/10 border-amber-200 dark:border-amber-900/50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-amber-600 dark:text-amber-400 flex items-center gap-2 text-base">
                          <AlertTriangle className="w-5 h-5" /> Uncertainty Factors
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                          {result.uncertainty_factors.map((factor: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-amber-600 dark:text-amber-400 mt-1">•</span> {factor}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="bg-cyan-50 dark:bg-emerald-900/20 border-cyan-100 dark:border-emerald-900/50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-cyan-600 dark:text-emerald-400 flex items-center gap-2 text-base">
                          <ShieldAlert className="w-5 h-5" /> Confidence High
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-slate-700 dark:text-slate-300 text-sm">No major uncertainty factors detected in the evidence graph.</p>
                      </CardContent>
                    </Card>
                  )}

                  {result.next_experiment && (
                    <Card className="bg-cyan-50 dark:bg-emerald-900/20 border-cyan-100 dark:border-emerald-900/50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-cyan-600 dark:text-emerald-400 flex items-center gap-2 text-base capitalize">
                          <TestTube2 className="w-5 h-5" /> Recommended {result.next_experiment.type || "Experiment"}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-slate-700 dark:text-slate-300 text-sm">{result.next_experiment.description || result.next_experiment}</p>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Fragility & Falsification */}
                <div className="grid grid-cols-1 gap-4 mt-2 mb-6">
                  {result.fragility_warning && (
                    <div className="p-4 rounded-sm bg-red-50 dark:bg-rose-900/20 border border-red-200 dark:border-rose-900/50 flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-600 dark:text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-bold text-red-600 dark:text-rose-400 uppercase tracking-wider mb-1">High Fragility Detected</h4>
                        <p className="text-sm text-slate-700 dark:text-slate-300">{result.fragility_warning}</p>
                      </div>
                    </div>
                  )}
                  {result.falsification_condition && (
                    <div className="p-4 rounded-sm bg-indigo-50 dark:bg-purple-900/20 border border-indigo-200 dark:border-purple-900/40 flex items-start gap-3">
                      <Skull className="w-5 h-5 text-indigo-600 dark:text-purple-400 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-bold text-indigo-600 dark:text-purple-400 uppercase tracking-wider mb-1">What Would Falsify This?</h4>
                        <p className="text-sm text-slate-700 dark:text-slate-300">{result.falsification_condition}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Evidence Drift Timeline */}
                <div className="w-full">
                  <EvidenceTimeline 
                    supporting_evidence={result.supporting_evidence || []} 
                    opposing_evidence={result.opposing_evidence || []} 
                  />
                </div>

                {/* Main Evidence Grid with Methodology Lens */}
                <div className="space-y-6">
                  {/* Methodology Filters */}
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                    <h2 className="text-base font-semibold text-slate-700 dark:text-slate-300">Evidence Library</h2>
                    <div className="flex gap-2">
                      <Button 
                        variant={methodologyFilter === "all" ? "default" : "outline"} 
                        size="sm" 
                        onClick={() => setMethodologyFilter("all")}
                        className={methodologyFilter === "all" ? "bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:bg-slate-600" : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-700 dark:text-slate-300"}
                      >
                        All Data
                      </Button>
                      <Button 
                        variant={methodologyFilter === "clinical_trial" ? "default" : "outline"} 
                        size="sm" 
                        onClick={() => setMethodologyFilter("clinical_trial")}
                        className={methodologyFilter === "clinical_trial" ? "bg-cyan-100 dark:bg-emerald-900/50 text-cyan-600 dark:text-emerald-400 hover:bg-emerald-800/50" : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-700 dark:text-slate-300"}
                      >
                        Clinical Only
                      </Button>
                      <Button 
                        variant={methodologyFilter === "in_vivo" ? "default" : "outline"} 
                        size="sm" 
                        onClick={() => setMethodologyFilter("in_vivo")}
                        className={methodologyFilter === "in_vivo" ? "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 hover:bg-blue-800/50" : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-700 dark:text-slate-300"}
                      >
                        In Vivo
                      </Button>
                      <Button 
                        variant={methodologyFilter === "in_vitro" ? "default" : "outline"} 
                        size="sm" 
                        onClick={() => setMethodologyFilter("in_vitro")}
                        className={methodologyFilter === "in_vitro" ? "bg-indigo-200 dark:bg-purple-900/40 text-indigo-600 dark:text-purple-400 hover:bg-purple-800/50" : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-700 dark:text-slate-300"}
                      >
                        In Vitro
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* LEFT: Support & Gaps */}
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-base font-semibold text-cyan-600 dark:text-emerald-400 mb-4 flex items-center gap-2">
                           Strongest Support ({result.supporting_evidence?.filter((c:any) => methodologyFilter === "all" || c.methodology === methodologyFilter).length || 0})
                        </h3>
                        <div className="space-y-3">
                          {result.supporting_evidence
                            ?.filter((c:any) => methodologyFilter === "all" || c.methodology === methodologyFilter)
                            .map((claim: any, index: number) => (
                            <StabilityCard key={claim.id} claim={claim} index={index} />
                          ))}
                          {(!result.supporting_evidence || result.supporting_evidence.filter((c:any) => methodologyFilter === "all" || c.methodology === methodologyFilter).length === 0) && (
                            <div className="p-6 text-center text-slate-500 dark:text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-sm">
                              No supporting evidence found for this methodology.
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {result.gaps?.length > 0 && (
                        <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-900/50">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-amber-600 dark:text-amber-400 flex items-center gap-2 text-sm uppercase tracking-wider">
                              <ShieldAlert className="w-4 h-4" /> Structural Fragility
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {result.gaps.map((g: any, i: number) => (
                              <div key={i} className="text-sm text-slate-700 dark:text-slate-300 border-l-2 border-amber-700 pl-3">
                                {g.description}
                              </div>
                            ))}
                          </CardContent>
                        </Card>
                      )}
                    </div>

                    {/* RIGHT: Opposition & Contradictions */}
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-base font-semibold text-red-600 dark:text-rose-400 mb-4 flex items-center gap-2">
                          Strongest Opposition ({result.opposing_evidence?.filter((c:any) => methodologyFilter === "all" || c.methodology === methodologyFilter).length || 0})
                        </h3>
                        <div className="space-y-3">
                          {result.opposing_evidence
                            ?.filter((c:any) => methodologyFilter === "all" || c.methodology === methodologyFilter)
                            .map((claim: any, index: number) => (
                            <StabilityCard key={claim.id} claim={claim} index={index} />
                          ))}
                          {(!result.opposing_evidence || result.opposing_evidence.filter((c:any) => methodologyFilter === "all" || c.methodology === methodologyFilter).length === 0) && (
                            <div className="p-6 text-center text-slate-500 dark:text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-sm">
                              No opposing evidence found for this methodology.
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <ContradictionRadar contradictions={result.contradictions} />
                    </div>
                  </div>
                </div>
                
              </TabsContent>

              <TabsContent value="graph" className="mt-0">
                 {result.graph && result.graph.nodes && result.graph.nodes.length > 0 ? (
                    <div className="min-h-[600px] w-full border border-slate-200 dark:border-slate-800 rounded-sm overflow-hidden">
                      <GraphExplorer data={result.graph} />
                    </div>
                 ) : (
                    <div className="p-12 text-center text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 rounded-sm bg-slate-50 dark:bg-slate-950">
                      No graph data available for this query.
                    </div>
                 )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>
    </div>
    </>
  );
}
