import React, { useState, useEffect } from 'react';
import { cn } from '../lib/utils';
import { ShieldCheck, Info, HelpCircle, ImageIcon, Loader2, Download } from 'lucide-react';
import { generateAssetsImage } from '../lib/gemini';

export function ResultRenderer({ 
  data, 
  onNavigateToTool,
  onSaveClient 
}: { 
  data: any, 
  onNavigateToTool?: (id: string, input: string) => void,
  onSaveClient?: (data: any) => void
}) {
  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/50 backdrop-blur-md rounded-xl shadow-xl shadow-slate-200/50 border border-white/60 overflow-hidden">
         <div className="p-4 border-b border-white/40 flex justify-between items-center bg-white/40">
            <h3 className="text-sm font-semibold text-slate-700 uppercase">{data.summary || 'Análisis Completado'}</h3>
            {data.confidence && (
              <span className={cn(
                "px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider border shrink-0",
                data.confidence === 'high' ? "bg-emerald-100 text-emerald-700 border-none" :
                data.confidence === 'medium' ? "bg-amber-100 text-amber-700 border-none" :
                "bg-red-100 text-red-700 border-none"
              )}>
                CONFIDENCE: {data.confidence}
              </span>
            )}
         </div>
         {data.warnings && data.warnings.length > 0 && (
           <div className="p-4 bg-amber-50 border-b border-amber-100 text-amber-800 text-xs">
             <span className="font-semibold block mb-1">Puntos a tener en cuenta:</span>
             <ul className="list-disc pl-5 space-y-0.5">
               {data.warnings.map((w: string, i: number) => <li key={i}>{w}</li>)}
             </ul>
           </div>
         )}
         
         <div className="p-0">
           <GenericResults intent={data.intent} results={data.results} onNavigateToTool={onNavigateToTool} />
         </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  if (!status) return null;
  const isVerified = status === 'verified';
  const isInferred = status === 'inferred';
  
  return (
    <span className={cn(
      "px-2 py-0.5 text-[10px] font-bold rounded-md uppercase",
      isVerified ? "bg-emerald-100 text-emerald-700" :
      isInferred ? "bg-amber-100 text-amber-700" :
      "bg-slate-100 text-slate-500"
    )}>
      {status}
    </span>
  )
}


function GenericResults({ intent, results, onNavigateToTool }: { intent: string, results: any[], onNavigateToTool?: (id: string, input: string) => void }) {
  if (!results || results.length === 0) return <div className="p-6 text-center text-slate-500 text-sm">No se encontraron resultados.</div>;

  return (
    <div className="divide-y divide-white/40">
      {results.map((item, idx) => (
        <div key={idx} className="p-6 hover:bg-white/40 transition-colors">
          <div className="flex flex-col space-y-4">
             {Object.entries(item).map(([key, val]) => {
               if(typeof val === 'string' || typeof val === 'number') {
                 if (key === 'html_code') {
                   return (
                     <div key={key} className="mt-4 col-span-full">
                       <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase mb-2 block">
                         VISTA PREVIA HTML
                       </span>
                       <div className="border border-white/60 rounded-lg overflow-hidden bg-white/50 backdrop-blur-sm">
                         <iframe 
                           srcDoc={val as string} 
                           className="w-full h-96 border-none"
                           title="HTML Preview"
                         />
                       </div>
                       <details className="mt-2 text-xs">
                         <summary className="cursor-pointer text-slate-500 font-medium hover:text-slate-700">Ver código HTML</summary>
                         <pre className="mt-2 p-3 bg-slate-900 text-slate-300 font-mono text-[10px] rounded-lg overflow-x-auto max-h-64 whitespace-pre-wrap">
                           {val}
                         </pre>
                       </details>
                     </div>
                   );
                 }

                 return (
                   <div key={key}>
                     <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase mb-1 block">
                       {key.replace(/_/g, ' ')}
                     </span>
                     <div className={cn(
                        "text-slate-800 whitespace-pre-wrap",
                        ['name', 'idea', 'slogan', 'concept', 'title', 'headline'].includes(key) ? "font-semibold text-base" : "text-sm leading-relaxed"
                     )}>
                       {val}
                     </div>
                   </div>
                 )
               } else if (Array.isArray(val)) {
                 return (
                   <div key={key}>
                     <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase mb-1.5 block">
                       {key.replace(/_/g, ' ')}
                     </span>
                     <div className="flex flex-wrap gap-1.5">
                       {val.map((v: any, i: number) => {
                         if (typeof v === 'string') {
                           return (
                             <span key={i} className="px-2 py-0.5 text-xs bg-slate-100 text-slate-600 rounded">
                               {v}
                             </span>
                           )
                         } else {
                           return (
                             <div key={i} className="w-full mt-1 p-3 bg-slate-900 rounded-lg text-xs hover:bg-slate-800 transition-colors">
                               <pre className="whitespace-pre-wrap font-mono text-emerald-400">{JSON.stringify(v, null, 2).replace(/[{}"]/g, '')}</pre>
                             </div>
                           )
                         }
                       })}
                     </div>
                   </div>
                 )
               }
               return null;
             })}
             
             {(intent === 'logo_generator' || intent === 'banner_generator') && (
               <ImageGeneratorWidget 
                 prompt={intent === 'logo_generator' ? item.concept || item.prompt_for_image_model : item.visual_direction || item.headline}
                 intent={intent} 
               />
             )}
          </div>
        </div>
      ))}
    </div>
  )
}

function ImageGeneratorWidget({ prompt, intent }: { prompt: string, intent: string }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const fullPrompt = intent === 'logo_generator' 
        ? `A minimalist, professional logo design based on this concept: ${prompt}. Vector art style, flat design, clean white background, high quality.`
        : intent === 'banner_generator'
        ? `A professional marketing banner design without text. Visual direction: ${prompt}. High quality, polished, modern marketing style, 16:9.`
        : prompt;

      const url = await generateAssetsImage(fullPrompt);
      if (url) {
        setImageUrl(url);
      } else {
        setError("No se pudo generar la imagen.");
      }
    } catch (err: any) {
      setError(err.message || "Error al solicitar la imagen.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!imageUrl) return;
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `${intent}-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (!prompt) return null;

  return (
    <div className="mt-4 p-4 border border-slate-100 rounded-lg bg-slate-50 flex flex-col items-center justify-center space-y-4">
      {imageUrl ? (
        <div className="relative group rounded-md overflow-hidden shadow-sm">
          <img src={imageUrl} alt="Generado por IA" className="max-w-full h-auto object-contain max-h-96" referrerPolicy="no-referrer" />
          <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/60 to-transparent flex justify-end gap-2">
             <button onClick={handleDownload} disabled={loading} className="text-xs flex items-center gap-1 text-white bg-black/40 hover:bg-black/60 px-2 py-1 rounded disabled:opacity-50">
               <Download className="w-3 h-3" /> Descargar
             </button>
             <button onClick={handleGenerate} disabled={loading} className="text-xs text-white bg-black/40 hover:bg-black/60 px-2 py-1 rounded disabled:opacity-50">Regenerar</button>
          </div>
        </div>
      ) : loading ? (
        <div className="py-8 flex flex-col items-center text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <span className="text-sm">Generando imagen con Gemini...</span>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 py-4">
          <ImageIcon className="w-8 h-8 text-slate-300" />
          <p className="text-sm text-slate-500 font-medium text-center max-w-sm">Genera un concepto visual de esta idea.</p>
          <button 
            onClick={handleGenerate}
            className="px-4 py-1.5 mt-1 bg-slate-800 text-white rounded-md text-sm font-medium hover:bg-slate-700 transition-colors shadow-sm"
          >
            Generar Imagen Visual
          </button>
        </div>
      )}
      {error && <div className="text-xs text-red-500 font-medium">{error}</div>}
    </div>
  );
}
