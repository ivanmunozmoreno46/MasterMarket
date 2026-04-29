import React from 'react';
import { tools } from '../config/tools';
import { ShoppingBag, Database } from 'lucide-react';
import { cn } from '../lib/utils';

export function Sidebar({ 
  activeToolId, 
  onSelectTool,
  currentView = 'tool',
  onSelectView,
}: { 
  activeToolId?: string; 
  onSelectTool: (id: string) => void; 
  currentView?: 'tool' | 'saved_clients';
  onSelectView?: (view: 'tool' | 'saved_clients') => void;
}) {
  return (
    <aside className="w-64 bg-slate-900/70 backdrop-blur-xl text-slate-300 flex flex-col h-screen flex-shrink-0 border-r border-white/10 shadow-2xl">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center text-white font-bold shadow-none">
           <ShoppingBag className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold tracking-tight text-white italic">MasterMarket</span>
      </div>
      
      <nav className="flex-1 overflow-y-auto px-4 space-y-4 mt-2">
        <div className="space-y-1">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-3">
             Base de Datos
          </div>
          <button
            onClick={() => onSelectView?.('saved_clients')}
            className={cn(
              "w-full flex items-center gap-3 py-2 px-3 rounded-md text-sm font-medium transition-colors cursor-pointer text-left",
              currentView === 'saved_clients' 
                ? "bg-white/10 text-white shadow-sm" 
                : "hover:bg-white/5 hover:text-white opacity-90 text-slate-200"
            )}
          >
            <Database className={cn("w-5 h-5", currentView === 'saved_clients' ? "opacity-80" : "opacity-60")} />
            Gestión de Clientes
          </button>
        </div>

        <div className="space-y-1">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-3 mt-4">
             Herramientas
          </div>
          {tools.map((tool) => {
            const isActive = currentView === 'tool' && activeToolId === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => onSelectTool(tool.id)}
                className={cn(
                  "w-full flex items-center gap-3 py-2 px-3 rounded-md text-sm font-medium transition-colors cursor-pointer text-left",
                  isActive 
                    ? "bg-white/10 text-white shadow-sm" 
                    : "hover:bg-white/5 hover:text-white opacity-90 text-slate-200"
                )}
              >
                <tool.icon className={cn("w-5 h-5", isActive ? "opacity-80" : "opacity-60")} />
                {tool.name}
              </button>
            )
          })}
        </div>
      </nav>
      
      <div className="p-4 mt-auto border-t border-slate-800">
         <div className="bg-blue-600/10 border border-blue-500/20 rounded-lg p-3">
            <h4 className="text-xs text-blue-400 font-semibold mb-1 uppercase">AI ENGINE</h4>
            <div className="w-full bg-slate-700 h-1 rounded-full mb-2">
              <div className="bg-blue-500 h-1 rounded-full w-[100%]"></div>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-400">
               <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
               Connected to Gemini
            </div>
         </div>
      </div>
    </aside>
  );
}
