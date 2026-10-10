with open('src/components/Navbar.tsx', 'r') as f:
    content = f.read()

# Replace border-slate-800 with border-white/10
content = content.replace(
    'border-t border-slate-800 my-1 pt-2 flex flex-col gap-2',
    'border-t border-white/10 my-1 pt-2.5 flex flex-col gap-2'
)

# Replace Language button class
content = content.replace(
    'className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-900/70 border border-white/5 text-slate-200 hover:bg-slate-800 transition-colors"',
    'className="w-full flex items-center justify-between p-3.5 rounded-2xl liquid-glass-menu-item text-slate-100 hover:text-white"'
)

# Replace Language drawer class
content = content.replace(
    'className="w-full grid grid-cols-2 gap-1.5 p-2 rounded-2xl bg-slate-950 border border-purple-500/20 text-xs text-slate-100 max-h-48 overflow-y-auto"',
    'className="w-full grid grid-cols-2 gap-1.5 p-2 rounded-2xl liquid-glass-card border border-purple-500/30 text-xs text-slate-100 max-h-48 overflow-y-auto"'
)

# Replace WhatsApp link class
content = content.replace(
    'className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-900/70 border border-white/5 text-slate-200 hover:bg-slate-800 transition-colors"',
    'className="flex items-center gap-3.5 p-3.5 rounded-2xl liquid-glass-menu-item text-slate-100 hover:text-white"'
)

# Replace Theme button class
content = content.replace(
    'className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-900/70 border border-white/5 text-slate-200 hover:bg-slate-800 transition-colors"',
    'className="flex items-center gap-3.5 p-3.5 rounded-2xl liquid-glass-menu-item text-slate-100 hover:text-white"'
)

# Replace Logout button class
content = content.replace(
    'className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 font-bold transition-colors mt-1"',
    'className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-200 hover:bg-rose-500/30 font-bold transition-colors mt-1"'
)

# Replace Login button class
content = content.replace(
    'className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-gradient-to-r from-rose-600 to-purple-600 text-white font-bold transition-all shadow-lg mt-1"',
    'className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white font-bold transition-all shadow-lg border border-white/20 mt-1"'
)

with open('src/components/Navbar.tsx', 'w') as f:
    f.write(content)

print("UPDATED_SUCCESSFULLY")
