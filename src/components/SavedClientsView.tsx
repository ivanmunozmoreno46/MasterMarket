import React, { useState, useRef } from 'react';
import { Trash2, Database, Plus, X, Edit2, Check, Download, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Papa from 'papaparse';

export function SavedClientsView({ clients, onDelete, onUpdate, onAdd }: { clients: any[], onDelete: (id: string) => void, onUpdate: (id: string, data: any) => void, onAdd?: (data: any) => void }) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newClient, setNewClient] = useState({
    name: '',
    industry: '',
    website: '',
    email: '',
    location: ''
  });

  const [editFormData, setEditFormData] = useState({
    name: '',
    industry: '',
    website: '',
    email: '',
    location: ''
  });

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAdd) return;
    
    // Construct the object exactly how the schema would emit it
    const clientData = {
      name: { value: newClient.name },
      industry: { value: newClient.industry },
      website: { value: newClient.website },
      email: { value: newClient.email },
      location: { value: newClient.location }
    };
    
    onAdd(clientData);
    setIsAdding(false);
    setNewClient({ name: '', industry: '', website: '', email: '', location: '' });
  };

  const startEditing = (client: any) => {
    setEditingId(client.id);
    setEditFormData({
      name: client.name?.value || '',
      industry: client.industry?.value || '',
      website: client.website?.value || '',
      email: client.email?.value || '',
      location: client.location?.value || ''
    });
  };

  const saveEdit = (id: string) => {
    const updatedData = {
      name: { value: editFormData.name },
      industry: { value: editFormData.industry },
      website: { value: editFormData.website },
      email: { value: editFormData.email },
      location: { value: editFormData.location }
    };
    onUpdate(id, updatedData);
    setEditingId(null);
  };

  const handleExport = () => {
    const dataToExport = clients.map(client => ({
      Nombre: client.name?.value || '',
      Industria: client.industry?.value || '',
      Website: client.website?.value || '',
      Email: client.email?.value || '',
      Ubicación: client.location?.value || ''
    }));

    const csv = Papa.unparse(dataToExport);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', `clientes_exportados_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onAdd) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        results.data.forEach((row: any) => {
          const importedClient = {
            name: { value: row.Nombre || row.Name || row.name || '' },
            industry: { value: row.Industria || row.Industry || row.industry || '' },
            website: { value: row.Website || row.website || row.url || '' },
            email: { value: row.Email || row.email || '' },
            location: { value: row.Ubicación || row.Location || row.location || '' }
          };
          
          if (importedClient.name.value) {
            onAdd(importedClient);
          }
        });
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-100 rounded flex items-center justify-center">
              <Database className="w-5 h-5 text-indigo-600" />
            </div>
            Gestión de Clientes
          </h1>
          <p className="text-slate-500 text-sm">Base de datos temporal de tus clientes prospectados conservada en el navegador.</p>
        </div>
        
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <input 
            type="file" 
            accept=".csv" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleImport}
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white text-slate-600 font-semibold rounded-lg border border-slate-200 hover:bg-slate-50 transition-all shadow-sm"
          >
            <Upload className="w-4 h-4" /> Importar
          </button>
          <button 
            onClick={handleExport}
            disabled={clients.length === 0}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white text-slate-600 font-semibold rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 transition-all shadow-sm"
          >
            <Download className="w-4 h-4" /> Exportar
          </button>
          {onAdd && (
            <button 
              onClick={() => setIsAdding(!isAdding)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm"
            >
              {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {isAdding ? 'Cancelar' : 'Añadir Cliente'}
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.form 
            initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
            animate={{ opacity: 1, height: 'auto', overflow: 'visible' }}
            exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            onSubmit={handleManualAdd} 
            className="bg-white/60 backdrop-blur-md p-6 rounded-xl border border-white/60 shadow-xl shadow-slate-200/50 space-y-4"
          >
            <h3 className="text-lg font-bold text-slate-800">Nuevo Cliente Manual</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600 uppercase">Nombre</label>
                <input required value={newClient.name} onChange={e => setNewClient({...newClient, name: e.target.value})} className="w-full p-2 bg-white/50 border border-white/50 shadow-inner rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-sm" placeholder="Ej. Acme Corp" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600 uppercase">Industria</label>
                <input value={newClient.industry} onChange={e => setNewClient({...newClient, industry: e.target.value})} className="w-full p-2 bg-white/50 border border-white/50 shadow-inner rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-sm" placeholder="Ej. Software" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600 uppercase">Sitio Web</label>
                <input type="url" value={newClient.website} onChange={e => setNewClient({...newClient, website: e.target.value})} className="w-full p-2 bg-white/50 border border-white/50 shadow-inner rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-sm" placeholder="Ej. https://acme.com" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600 uppercase">Email</label>
                <input type="email" value={newClient.email} onChange={e => setNewClient({...newClient, email: e.target.value})} className="w-full p-2 bg-white/50 border border-white/50 shadow-inner rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-sm" placeholder="Ej. contacto@acme.com" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-semibold text-slate-600 uppercase">Ubicación</label>
                <input value={newClient.location} onChange={e => setNewClient({...newClient, location: e.target.value})} className="w-full p-2 bg-white/50 border border-white/50 shadow-inner rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-sm" placeholder="Ej. Madrid, España" />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">
                Guardar Cliente
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {clients.length === 0 ? (
        <div className="p-8 text-center bg-white/50 backdrop-blur-md rounded-xl shadow-xl shadow-slate-200/50 border border-white/60 text-slate-500">
          No hay clientes guardados todavía. Haz clic en "Añadir Cliente" para empezar tu base de datos.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {clients.map(client => (
            <div key={client.id} className="bg-white/60 backdrop-blur-md p-6 rounded-xl border border-white/60 shadow-xl shadow-slate-200/50 relative group flex flex-col hover:bg-white/80 transition-all">
              {editingId === client.id ? (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Nombre</label>
                    <input 
                      value={editFormData.name} 
                      onChange={e => setEditFormData({...editFormData, name: e.target.value})}
                      className="w-full p-1.5 bg-white border border-slate-200 rounded text-sm focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Industria</label>
                    <input 
                      value={editFormData.industry} 
                      onChange={e => setEditFormData({...editFormData, industry: e.target.value})}
                      className="w-full p-1.5 bg-white border border-slate-200 rounded text-sm focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Web</label>
                    <input 
                      value={editFormData.website} 
                      onChange={e => setEditFormData({...editFormData, website: e.target.value})}
                      className="w-full p-1.5 bg-white border border-slate-200 rounded text-sm focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Email</label>
                    <input 
                      value={editFormData.email} 
                      onChange={e => setEditFormData({...editFormData, email: e.target.value})}
                      className="w-full p-1.5 bg-white border border-slate-200 rounded text-sm focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Ubicación</label>
                    <input 
                      value={editFormData.location} 
                      onChange={e => setEditFormData({...editFormData, location: e.target.value})}
                      className="w-full p-1.5 bg-white border border-slate-200 rounded text-sm focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button 
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1 text-xs font-semibold text-slate-500 hover:text-slate-700"
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={() => saveEdit(client.id)}
                      className="flex items-center gap-1 px-3 py-1 text-xs font-semibold bg-emerald-500 text-white rounded hover:bg-emerald-600 transition-colors shadow-sm"
                    >
                      <Check className="w-3 h-3" /> Guardar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="absolute top-4 right-4 flex gap-1 transition-all">
                    <button 
                      onClick={() => startEditing(client)}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                      title="Editar cliente"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => onDelete(client.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                      title="Eliminar cliente"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-800 pr-20">{client.name?.value || 'Sin nombre'}</h3>
                  <p className="text-sm font-medium text-blue-600 mb-4">{client.industry?.value || 'Industria desconocida'}</p>
                  
                  <div className="space-y-2 text-sm text-slate-600 flex-1">
                    {client.website?.value && <p className="truncate" title={client.website.value}><strong>Web:</strong> {client.website.value}</p>}
                    {client.email?.value && <p className="truncate" title={client.email.value}><strong>Email:</strong> {client.email.value}</p>}
                    {client.location?.value && <p className="truncate" title={client.location.value}><strong>Ubicación:</strong> {client.location.value}</p>}
                  </div>

                  <details className="mt-4 pt-4 border-t border-slate-100 text-xs">
                    <summary className="cursor-pointer text-slate-500 font-medium hover:text-slate-700">Explorar JSON (Datos completos)</summary>
                    <pre className="mt-3 p-3 bg-slate-900 text-emerald-400 font-mono rounded-lg overflow-x-auto max-h-48 text-[10px]">
                      {JSON.stringify(client, null, 2)}
                    </pre>
                  </details>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
