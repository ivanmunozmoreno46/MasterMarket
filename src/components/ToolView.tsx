import React, { useState } from 'react';
import { ToolConfig } from '../config/tools';
import { runAITool } from '../lib/gemini';
import { ResultRenderer } from './ResultRenderer';
import { Loader2, Sparkles, AlertCircle, Database, PlusCircle } from 'lucide-react';
import { cn } from '../lib/utils';

export function ToolView({ 
  tool, 
  initialInput = '', 
  onNavigateToTool,
  onSaveClient,
  savedClients = []
}: { 
  tool: ToolConfig;
  initialInput?: string;
  onNavigateToTool: (toolId: string, input: string) => void;
  onSaveClient?: (data: any) => void;
  savedClients?: any[];
}) {
  const [inputVal, setInputVal] = useState(initialInput);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Reset state on tool change
  React.useEffect(() => {
    setInputVal(initialInput);
    setResult(null);
    setError(null);
  }, [tool.id, initialInput]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    
    setLoading(true);
    setError(null);
    try {
      const res = await runAITool(tool.id, inputVal);
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Se produjo un error durante la generación.');
    } finally {
      setLoading(false);
    }
  };

  const handleInsertClient = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const clientId = e.target.value;
    if (!clientId) return;
    
    const client = savedClients.find(c => c.id === clientId);
    if (client) {
      const details = [
        `Cliente: ${client.name?.value || 'N/A'}`,
        `Web: ${client.website?.value || 'N/A'}`,
        `Industria: ${client.industry?.value || 'N/A'}`,
        `Descripción: ${client.description?.value || 'N/A'}`,
        `Ubicación: ${client.location?.value || 'N/A'}`
      ].filter(Boolean).join('\n');
      
      setInputVal(prev => prev ? `${prev}\n\nDatos de contexto:\n${details}` : `Datos de contexto:\n${details}`);
    }
    
    // Reset select
    e.target.value = "";
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
            <tool.icon className="w-5 h-5 text-blue-600" />
          </div>
          {tool.name}
        </h1>
        <p className="text-slate-500 text-sm">{tool.description}</p>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="bg-white/50 backdrop-blur-md rounded-xl shadow-xl shadow-slate-200/50 border border-white/60 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-white/40 flex justify-between items-center bg-white/40">
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">{tool.inputs[0].label}</h3>
          
          {savedClients.length > 0 && (
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-slate-400" />
              <select 
                onChange={handleInsertClient}
                className="text-xs bg-white border border-slate-200 text-slate-600 rounded p-1 outline-none focus:border-blue-500"
                defaultValue=""
              >
                <option value="" disabled>Insertar cliente guardado...</option>
                {savedClients.map(c => (
                  <option key={c.id} value={c.id}>{c.name?.value || c.website?.value || 'Cliente sin nombre'}</option>
                ))}
              </select>
            </div>
          )}
        </div>
        <div className="p-6 space-y-4">
          <textarea
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            className="w-full min-h-[120px] p-4 bg-white/50 border border-white/50 shadow-inner rounded-lg focus:bg-white/80 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all resize-y text-sm text-slate-700 placeholder:text-slate-400"
            placeholder={tool.inputs[0].placeholder}
          />
          
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2">
            <span className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Powered by Gemini
            </span>
            <button
              type="submit"
              disabled={loading || !inputVal.trim()}
              className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all shadow-sm"
            >
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {loading ? 'Procesando...' : 'Generar'}
            </button>
          </div>
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-700 rounded-lg text-xs mt-4 flex items-start gap-2">
               <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
               <div className="font-medium">{error}</div>
            </div>
          )}
        </div>
      </form>

      {/* Results */}
      {result && (
         <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
           <ResultRenderer data={result} onNavigateToTool={onNavigateToTool} onSaveClient={onSaveClient} />
         </div>
      )}
    </div>
  );
}
