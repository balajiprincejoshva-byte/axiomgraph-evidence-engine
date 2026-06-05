import os
import glob
import re

files = glob.glob("frontend/src/**/*.tsx", recursive=True)

for file_path in files:
    with open(file_path, 'r') as f:
        content = f.read()

    # Find patterns like prefix-color dark:color
    # e.g. text-blue-600 dark:blue-400 -> text-blue-600 dark:text-blue-400
    # e.g. bg-amber-50 dark:amber-950/10 -> bg-amber-50 dark:bg-amber-950/10
    
    # We will just write a regex that catches `(bg|text|border)-(\w+-\d+(?:/\d+)?) dark:(\w+-\d+(?:/\d+)?)`
    # and fixes the missing prefix.
    
    pattern = r'(bg|text|border)-([a-z]+-\d+(?:/\d+)?) dark:(?!bg|text|border)([a-z]+-\d+(?:/\d+)?)'
    
    def replacer(match):
        prefix = match.group(1)
        orig_color = match.group(2)
        dark_color = match.group(3)
        return f"{prefix}-{orig_color} dark:{prefix}-{dark_color}"

    new_content = re.sub(pattern, replacer, content)

    # Also there might be cases where the dark: color was something like emerald-400
    pattern2 = r'(bg|text|border)-([a-z]+-\d+(?:/\d+)?) dark:(?!bg|text|border)([a-z]+-[a-z]+-\d+(?:/\d+)?)'
    
    def replacer2(match):
        prefix = match.group(1)
        orig_color = match.group(2)
        dark_color = match.group(3)
        return f"{prefix}-{orig_color} dark:{prefix}-{dark_color}"

    new_content = re.sub(pattern, replacer, new_content)
    
    with open(file_path, 'w') as f:
        f.write(new_content)

print("Fixed classes!")
