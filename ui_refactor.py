import os
import glob
import re

replacements = [
    # Backgrounds
    (r'bg-slate-950', 'bg-slate-50'),
    (r'bg-slate-900/50', 'bg-white'),
    (r'bg-slate-900/80', 'bg-white'),
    (r'bg-slate-900/30', 'bg-slate-50'),
    (r'bg-slate-900', 'bg-white'),
    (r'bg-slate-800', 'bg-slate-100'),
    (r'bg-slate-700', 'bg-slate-200'),
    (r'bg-slate-600', 'bg-slate-300'),
    
    # Borders
    (r'border-slate-800', 'border-slate-200'),
    (r'border-slate-700', 'border-slate-300'),
    
    # Text
    (r'text-slate-50', 'text-slate-900'),
    (r'text-slate-200', 'text-slate-800'),
    (r'text-slate-300', 'text-slate-700'),
    (r'text-slate-400', 'text-slate-600'),
    
    # Colors: Emerald to Cyan/Green
    (r'emerald-400', 'cyan-600'),
    (r'emerald-500', 'cyan-600'),
    (r'emerald-600', 'cyan-700'),
    (r'emerald-900/50', 'cyan-100'),
    (r'emerald-900', 'cyan-200'),
    (r'emerald-950/10', 'cyan-50'),
    (r'emerald-950/20', 'cyan-50'),
    (r'emerald-950', 'cyan-50'),
    
    # Colors: Rose to Crimson
    (r'rose-400', 'red-600'),
    (r'rose-500', 'red-600'),
    (r'rose-900/50', 'red-200'),
    (r'rose-900', 'red-200'),
    (r'rose-950/20', 'red-50'),
    (r'rose-950', 'red-50'),

    # Colors: Amber to Deep Amber
    (r'amber-400', 'amber-600'),
    (r'amber-500', 'amber-600'),
    (r'amber-900/50', 'amber-200'),
    (r'amber-900', 'amber-200'),
    (r'amber-950/10', 'amber-50'),
    (r'amber-950', 'amber-50'),

    # Colors: Purple to Indigo
    (r'purple-400', 'indigo-600'),
    (r'purple-500', 'indigo-600'),
    (r'purple-900/40', 'indigo-200'),
    (r'purple-900/50', 'indigo-200'),
    (r'purple-900', 'indigo-200'),
    (r'purple-950/10', 'indigo-50'),
    (r'purple-950', 'indigo-50'),

    # Colors: Blue
    (r'blue-400', 'blue-600'),
    (r'blue-900/50', 'blue-100'),
    
    # Structural styling
    (r'rounded-2xl', 'rounded-sm'),
    (r'rounded-xl', 'rounded-sm'),
    (r'rounded-lg', 'rounded-sm'),
    (r'shadow-lg', 'shadow-none border'),
    (r'shadow-md', 'shadow-none border'),
    
    # Typography density
    (r'text-lg', 'text-base font-semibold'),
    (r'text-xl', 'text-lg font-bold'),
    (r'text-2xl', 'text-xl font-bold uppercase tracking-tight'),
    
    # Specific Text Replacements
    (r'Pressure Test', 'Initialize Sequence Analysis'),
    (r'Judgment Engine', 'TELEMETRY ENGINE'),
    (r'System Judgment', 'Assay Overview'),
    (r'Dashboard Content', 'Telemetry Matrix & Assay Overview'),
    (r'Dashboard', 'Telemetry Matrix'),
]

files = glob.glob("frontend/src/**/*.tsx", recursive=True)
for file_path in files:
    with open(file_path, 'r') as f:
        content = f.read()
        
    for pattern, repl in replacements:
        content = re.sub(pattern, repl, content)
        
    with open(file_path, 'w') as f:
        f.write(content)
        
print("Refactoring complete.")
