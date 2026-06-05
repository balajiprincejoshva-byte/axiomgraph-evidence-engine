import os
import glob
import re

replacements = [
    # Backgrounds
    (r'(?<!dark:)bg-slate-50\b', 'bg-slate-50 dark:bg-slate-950'),
    (r'(?<!dark:)bg-white\b', 'bg-white dark:bg-slate-900'),
    (r'(?<!dark:)bg-slate-100\b', 'bg-slate-100 dark:bg-slate-800'),
    (r'(?<!dark:)bg-slate-200\b', 'bg-slate-200 dark:bg-slate-700'),
    (r'(?<!dark:)bg-slate-300\b', 'bg-slate-300 dark:bg-slate-600'),
    
    # Borders
    (r'(?<!dark:)border-slate-200\b', 'border-slate-200 dark:border-slate-800'),
    (r'(?<!dark:)border-slate-300\b', 'border-slate-300 dark:border-slate-700'),
    
    # Text
    (r'(?<!dark:)text-slate-900\b', 'text-slate-900 dark:text-slate-50'),
    (r'(?<!dark:)text-slate-800\b', 'text-slate-800 dark:text-slate-200'),
    (r'(?<!dark:)text-slate-700\b', 'text-slate-700 dark:text-slate-300'),
    (r'(?<!dark:)text-slate-600\b', 'text-slate-600 dark:text-slate-400'),
    (r'(?<!dark:)text-slate-500\b', 'text-slate-500 dark:text-slate-400'),
    
    # Cyan -> Emerald (Accent mapping)
    (r'(?<!dark:)cyan-600\b', 'cyan-600 dark:emerald-400'),
    (r'(?<!dark:)cyan-700\b', 'cyan-700 dark:emerald-500'),
    (r'(?<!dark:)cyan-800\b', 'cyan-800 dark:emerald-300'),
    (r'(?<!dark:)cyan-500\b', 'cyan-500 dark:emerald-500'),
    (r'(?<!dark:)cyan-100\b', 'cyan-100 dark:emerald-900/50'),
    (r'(?<!dark:)cyan-50\b', 'cyan-50 dark:emerald-950/20'),
    (r'(?<!dark:)cyan-200\b', 'cyan-200 dark:emerald-900/50'),
    (r'(?<!dark:)cyan-200/30\b', 'cyan-200/30 dark:emerald-900/30'),
    
    # Red -> Rose
    (r'(?<!dark:)red-600\b', 'red-600 dark:rose-400'),
    (r'(?<!dark:)red-200\b', 'red-200 dark:rose-900/50'),
    (r'(?<!dark:)red-200/30\b', 'red-200/30 dark:rose-900/30'),
    (r'(?<!dark:)red-50\b', 'red-50 dark:rose-950/20'),
    (r'(?<!dark:)red-50/30\b', 'red-50/30 dark:rose-950/30'),
    (r'(?<!dark:)red-50/10\b', 'red-50/10 dark:rose-950/10'),

    # Amber
    (r'(?<!dark:)amber-600\b', 'amber-600 dark:amber-400'),
    (r'(?<!dark:)amber-200\b', 'amber-200 dark:amber-900/50'),
    (r'(?<!dark:)amber-50\b', 'amber-50 dark:amber-950/10'),

    # Indigo -> Purple
    (r'(?<!dark:)indigo-600\b', 'indigo-600 dark:purple-400'),
    (r'(?<!dark:)indigo-200\b', 'indigo-200 dark:purple-900/40'),
    (r'(?<!dark:)indigo-50\b', 'indigo-50 dark:purple-950/10'),

    # Blue
    (r'(?<!dark:)blue-600\b', 'blue-600 dark:blue-400'),
    (r'(?<!dark:)blue-100\b', 'blue-100 dark:blue-900/50'),
    
    # Specific missing mappings from previous changes
    (r'(?<!dark:)bg-cyan-600/10\b', 'bg-cyan-600/10 dark:bg-emerald-400/10'),
    (r'(?<!dark:)bg-amber-600/10\b', 'bg-amber-600/10 dark:bg-amber-400/10'),
    (r'(?<!dark:)bg-red-600/10\b', 'bg-red-600/10 dark:bg-rose-400/10'),
    (r'(?<!dark:)border-cyan-600/20\b', 'border-cyan-600/20 dark:border-emerald-400/20'),
    (r'(?<!dark:)border-amber-600/20\b', 'border-amber-600/20 dark:border-amber-400/20'),
    (r'(?<!dark:)border-red-600/20\b', 'border-red-600/20 dark:border-rose-400/20'),
    (r'(?<!dark:)border-cyan-200/30\b', 'border-cyan-200/30 dark:border-emerald-800/30'),
]

files = glob.glob("frontend/src/**/*.tsx", recursive=True)
for file_path in files:
    with open(file_path, 'r') as f:
        content = f.read()
        
    for pattern, repl in replacements:
        content = re.sub(pattern, repl, content)
        
    with open(file_path, 'w') as f:
        f.write(content)
        
print("Theme refactoring complete.")
