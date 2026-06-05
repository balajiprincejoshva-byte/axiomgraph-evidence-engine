"use client";

import { useEffect, useState } from "react";
import { Microscope } from "lucide-react";

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<"enter" | "hold" | "exit">("enter");
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("INITIALIZING TELEMETRY MATRIX...");

  const statusMessages = [
    "INITIALIZING TELEMETRY MATRIX...",
    "LOADING EVIDENCE ENGINE...",
    "CONNECTING TO PUBMED CORPUS...",
    "CALIBRATING STABILITY ALGORITHMS...",
    "SYSTEM READY",
  ];

  useEffect(() => {
    // Progress bar animation
    let prog = 0;
    const progressInterval = setInterval(() => {
      prog += 1;
      setProgress(prog);
      if (prog >= 100) clearInterval(progressInterval);
    }, 20); // 2 seconds total

    // Status text cycling
    let msgIdx = 0;
    const msgInterval = setInterval(() => {
      msgIdx++;
      if (msgIdx < statusMessages.length) {
        setStatusText(statusMessages[msgIdx]);
      } else {
        clearInterval(msgInterval);
      }
    }, 400);

    // Phase transitions
    const holdTimer = setTimeout(() => setPhase("hold"), 100);
    const exitTimer = setTimeout(() => setPhase("exit"), 2400);
    const doneTimer = setTimeout(() => onComplete(), 2900);

    return () => {
      clearInterval(progressInterval);
      clearInterval(msgInterval);
      clearTimeout(holdTimer);
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{
        backgroundColor: "#020817",
        opacity: phase === "exit" ? 0 : 1,
        transition: phase === "exit" ? "opacity 0.5s ease-out" : "opacity 0.3s ease-in",
        pointerEvents: phase === "exit" ? "none" : "all",
      }}
    >
      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,163,196,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(0,163,196,0.4) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Corner brackets */}
      <div className="absolute top-8 left-8 w-10 h-10 border-t-2 border-l-2 border-cyan-500/60" />
      <div className="absolute top-8 right-8 w-10 h-10 border-t-2 border-r-2 border-cyan-500/60" />
      <div className="absolute bottom-8 left-8 w-10 h-10 border-b-2 border-l-2 border-cyan-500/60" />
      <div className="absolute bottom-8 right-8 w-10 h-10 border-b-2 border-r-2 border-cyan-500/60" />

      {/* System ID top-left */}
      <div className="absolute top-10 left-16 font-mono text-xs text-cyan-700 tracking-widest">
        SYS::AX-9021
      </div>
      <div className="absolute top-10 right-16 font-mono text-xs text-cyan-700 tracking-widest">
        BUILD::V8.0.0
      </div>

      {/* Main content */}
      <div
        className="relative z-10 flex flex-col items-center gap-6"
        style={{
          transform: phase === "enter" ? "scale(0.95) translateY(10px)" : "scale(1) translateY(0)",
          transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        {/* Microscope icon with pulse ring */}
        <div className="relative flex items-center justify-center">
          {/* Outer pulse ring */}
          <div
            className="absolute w-28 h-28 rounded-full border border-cyan-500/30"
            style={{ animation: "ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite" }}
          />
          {/* Inner ring */}
          <div className="absolute w-20 h-20 rounded-full border border-cyan-500/50" />
          {/* Icon container */}
          <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/60 flex items-center justify-center">
            <Microscope
              className="w-8 h-8 text-cyan-400"
              style={{ animation: "pulse 2s ease-in-out infinite" }}
            />
          </div>
        </div>

        {/* Brand text */}
        <div className="text-center">
          <h1
            className="text-4xl font-bold tracking-tight text-white font-mono"
            style={{ letterSpacing: "0.08em" }}
          >
            Axiom<span className="text-cyan-400">Graph</span>
          </h1>
          <p className="mt-1 text-xs font-mono tracking-[0.35em] text-cyan-600 uppercase">
            Telemetry Engine
          </p>
        </div>

        {/* Divider line */}
        <div className="w-64 h-px bg-gradient-to-r from-transparent via-cyan-500/60 to-transparent" />

        {/* Progress bar */}
        <div className="w-64 flex flex-col gap-2">
          <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-600 to-emerald-500 rounded-full"
              style={{
                width: `${progress}%`,
                transition: "width 0.05s linear",
                boxShadow: "0 0 8px rgba(0, 163, 196, 0.8)",
              }}
            />
          </div>
          <div className="flex justify-between items-center">
            <span
              className="text-[10px] font-mono text-cyan-600 tracking-widest"
              style={{ minWidth: "280px" }}
            >
              {statusText}
            </span>
            <span className="text-[10px] font-mono text-slate-500">
              {progress}%
            </span>
          </div>
        </div>

        {/* Scanning dots */}
        <div className="flex gap-2 items-center">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-cyan-500"
              style={{
                animation: `pulse 1.2s ease-in-out ${i * 0.15}s infinite`,
                opacity: 0.4,
              }}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes ping {
          75%, 100% {
            transform: scale(1.8);
            opacity: 0;
          }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
