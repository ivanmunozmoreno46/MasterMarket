import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ToolView } from './components/ToolView';
import { SavedClientsView } from './components/SavedClientsView';
import { tools } from './config/tools';
import { Menu, X, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [activeToolId, setActiveToolId] = useState(tools[0].id);
  const [toolInputs, setToolInputs] = useState<Record<string, string>>({});
  const [currentView, setCurrentView] = useState<'tool' | 'saved_clients'>('tool');
  const [savedClients, setSavedClients] = useState<any[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('market_ai_clients');
    if (saved) {
      try {
        setSavedClients(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const activeTool = tools.find(t => t.id === activeToolId) || tools[0];

  const handleNavigateToTool = (toolId: string, input: string) => {
    setCurrentView('tool');
    setToolInputs(prev => ({...prev, [toolId]: input}));
    setActiveToolId(toolId);
  };

  const handleSelectTool = (toolId: string) => {
    setCurrentView('tool');
    setActiveToolId(toolId);
  };

  const handleSaveClient = (clientData: any) => {
    const newClient = { ...clientData, id: Date.now().toString() };
    const updated = [newClient, ...savedClients];
    setSavedClients(updated);
    localStorage.setItem('market_ai_clients', JSON.stringify(updated));
    alert('Cliente guardado en la base de datos temporal.');
  };

  const handleUpdateClient = (id: string, newClientData: any) => {
    const updated = savedClients.map(c => c.id === id ? { ...newClientData, id } : c);
    setSavedClients(updated);
    localStorage.setItem('market_ai_clients', JSON.stringify(updated));
  };

  const handleDeleteClient = (id: string) => {
    const updated = savedClients.filter(c => c.id !== id);
    setSavedClients(updated);
    localStorage.setItem('market_ai_clients', JSON.stringify(updated));
  };

  return (
    <div className="flex h-screen bg-transparent overflow-hidden font-sans text-slate-800">
      {/* Mobile/Overlay Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <div className="fixed inset-0 z-50 flex">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/50" 
              onClick={() => setIsSidebarOpen(false)}
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative z-50 h-full flex"
            >
              <Sidebar 
                activeToolId={currentView === 'tool' ? activeToolId : undefined} 
                onSelectTool={(id) => { handleSelectTool(id); setIsSidebarOpen(false); }} 
                currentView={currentView}
                onSelectView={(v) => { setCurrentView(v); setIsSidebarOpen(false); }}
              />
              <button 
                 className="absolute top-4 -right-12 p-2 text-white bg-slate-800 rounded-full hover:bg-slate-700 transition-colors"
                 onClick={() => setIsSidebarOpen(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col h-screen overflow-y-auto w-full relative z-0">
        <header className="h-16 bg-white/40 backdrop-blur-md border-b border-white/40 shadow-sm px-4 sm:px-8 flex items-center justify-between shrink-0 sticky top-0 z-10">
          <div className="flex items-center gap-2 sm:gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 hover:bg-slate-100 rounded-md text-slate-600 transition-colors"
            >
               <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2 mr-2">
              <ShoppingBag className="w-5 h-5 text-indigo-600 sm:hidden" />
              <span className="font-bold text-indigo-600 sm:hidden">MasterMarket</span>
            </div>
            <div className="flex items-center gap-0 sm:gap-2">
              <span className="text-slate-400 hidden sm:inline">MasterMarket</span>
              <span className="text-slate-300 hidden sm:inline">/</span>
              <span className="font-medium text-slate-700 max-w-[150px] sm:max-w-none truncate">
                {currentView === 'tool' ? activeTool.name : 'Gestión de Clientes'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded-full border border-green-200 uppercase tracking-widest">
              Ready
            </div>
            <button className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
            </button>
          </div>
        </header>
        <div className="flex-1 p-8">
          <div className="max-w-5xl mx-auto">
            {currentView === 'tool' ? (
              <ToolView 
                key={activeTool.id} 
                tool={activeTool} 
                initialInput={toolInputs[activeTool.id]} 
                onNavigateToTool={handleNavigateToTool} 
                onSaveClient={handleSaveClient}
                savedClients={savedClients}
              />
            ) : (
              <SavedClientsView 
                clients={savedClients} 
                onDelete={handleDeleteClient} 
                onUpdate={handleUpdateClient}
                onAdd={handleSaveClient}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
