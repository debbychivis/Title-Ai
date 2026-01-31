
import React, { useState } from 'react';
import { useApp } from '../App';
import { ThemeType } from '../types';
import { BarChart2, Edit3, Eye, MousePointer, Save, LayoutDashboard, Menu, X, History as HistoryIcon, Clock } from 'lucide-react';

const Studio: React.FC = () => {
  const { profile, studioHistory, updateStudioStats, generationHistory, playSound } = useApp();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showHistoryOverlay, setShowHistoryOverlay] = useState(false);
  
  // Temporary state for editing
  const [editStats, setEditStats] = useState({ views: 0, ctr: 0, impressions: 0 });

  const startEditing = (item: any) => {
    playSound();
    setEditingId(item.id);
    setEditStats(item.stats || { views: 0, ctr: 0, impressions: 0 });
  };

  const saveStats = (id: string) => {
    playSound();
    updateStudioStats(id, editStats);
    setEditingId(null);
  };

  const getCardClass = () => {
    if (profile.theme === ThemeType.GLASS) return "glass-panel bg-white/5 border border-purple-500/20";
    if (profile.theme === ThemeType.DARK) return "bg-gray-900 border border-gray-800";
    return "bg-white border border-slate-100 shadow-sm";
  };

  const getAccentColor = () => {
    if (profile.theme === ThemeType.YOUTUBE) return "text-red-600";
    if (profile.theme === ThemeType.GLASS) return "text-purple-400";
    return "text-teal-600";
  };

  // Overlay styles
  const getOverlayClass = () => {
    if (profile.theme === ThemeType.GLASS) return "bg-black/90 backdrop-blur-xl text-purple-50";
    if (profile.theme === ThemeType.DARK) return "bg-black/95 text-gray-200";
    return "bg-white text-gray-900";
  };

  return (
    <div className="space-y-8 animate-fade-in relative">
      <header className="flex items-center justify-between">
         <div className="flex items-center gap-4">
             <div className={`p-3 rounded-full bg-opacity-10 ${getAccentColor().replace('text', 'bg')}`}>
                <LayoutDashboard size={32} className={getAccentColor()} />
             </div>
             <div>
                <h1 className="text-3xl font-bold">The Studio</h1>
                <p className="opacity-70">Feedback loop: Teach the AI what actually worked.</p>
             </div>
         </div>
         
         <button 
           onClick={() => { playSound(); setShowMenu(true); }}
           className="p-2 rounded-full hover:bg-current/10 transition-colors"
         >
           <Menu size={24} />
         </button>
      </header>

      {/* Main Studio Content (Tracked Stats) */}
      <section>
        <div className="grid grid-cols-1 gap-4">
            {studioHistory.length === 0 ? (
                <div className={`p-10 text-center rounded-2xl border-2 border-dashed ${profile.theme === ThemeType.GLASS ? 'border-white/10' : 'border-gray-300'}`}>
                    <p className="opacity-50">No titles tracked yet.</p>
                    <p className="text-sm opacity-40 mt-2">Generate titles in Home and click "Track Performance" to add them here.</p>
                </div>
            ) : (
                studioHistory.map((item) => (
                    <div key={item.id} className={`p-5 rounded-2xl transition-all ${getCardClass()}`}>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-bold leading-tight">{item.title}</h3>
                                <p className="text-xs opacity-50 mt-1">{new Date(item.generatedDate).toLocaleDateString()}</p>
                            </div>
                            {editingId !== item.id && (
                                <button 
                                    onClick={() => startEditing(item)}
                                    className="p-2 rounded-full hover:bg-gray-500/10 opacity-60 hover:opacity-100"
                                >
                                    <Edit3 size={18} />
                                </button>
                            )}
                        </div>

                        {editingId === item.id ? (
                            <div className="grid grid-cols-3 gap-4 animate-fade-in bg-black/10 p-4 rounded-xl">
                                <div>
                                    <label className="text-xs uppercase font-bold opacity-50 block mb-1">Views</label>
                                    <input 
                                        type="number" 
                                        className="w-full bg-transparent border-b border-current p-1 font-mono"
                                        value={editStats.views}
                                        onChange={e => setEditStats({...editStats, views: parseInt(e.target.value)})}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs uppercase font-bold opacity-50 block mb-1">CTR %</label>
                                    <input 
                                        type="number" step="0.1"
                                        className="w-full bg-transparent border-b border-current p-1 font-mono"
                                        value={editStats.ctr}
                                        onChange={e => setEditStats({...editStats, ctr: parseFloat(e.target.value)})}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs uppercase font-bold opacity-50 block mb-1">Impressions</label>
                                    <input 
                                        type="number" 
                                        className="w-full bg-transparent border-b border-current p-1 font-mono"
                                        value={editStats.impressions}
                                        onChange={e => setEditStats({...editStats, impressions: parseInt(e.target.value)})}
                                    />
                                </div>
                                <div className="col-span-3 flex justify-end mt-2">
                                    <button 
                                        onClick={() => saveStats(item.id)}
                                        className={`px-4 py-2 rounded-lg text-sm font-bold text-white ${profile.theme === ThemeType.YOUTUBE ? 'bg-red-600' : 'bg-green-600'}`}
                                    >
                                        <Save size={14} className="inline mr-1"/> Save Data
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex gap-6 opacity-80">
                                <div className="flex items-center gap-2">
                                    <Eye size={16} className={item.stats?.views ? 'text-green-500' : 'opacity-30'} />
                                    <span className="font-mono font-bold">{item.stats?.views?.toLocaleString() || 0}</span>
                                    <span className="text-xs opacity-50">Views</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MousePointer size={16} className={item.stats?.ctr ? 'text-blue-500' : 'opacity-30'} />
                                    <span className="font-mono font-bold">{item.stats?.ctr || 0}%</span>
                                    <span className="text-xs opacity-50">CTR</span>
                                </div>
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
      </section>

      {/* Slide-in Menu (Right Side) */}
      {showMenu && (
        <div className="fixed inset-0 z-[60] flex justify-end">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowMenu(false)}
            ></div>

            {/* Menu Content */}
            <div className={`relative w-64 h-full p-6 shadow-2xl animate-slide-in-right ${getOverlayClass()}`}>
                <div className="flex justify-between items-center mb-8">
                    <span className="font-bold text-lg">Studio Menu</span>
                    <button onClick={() => setShowMenu(false)}><X size={24} /></button>
                </div>
                
                <div className="space-y-4">
                    <button 
                        onClick={() => { playSound(); setShowHistoryOverlay(true); setShowMenu(false); }}
                        className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-current/10 transition-colors"
                    >
                        <HistoryIcon size={20} />
                        <span className="font-medium">Generation History</span>
                    </button>
                    {/* Placeholder for future studio links */}
                </div>
            </div>
        </div>
      )}

      {/* Private Layout Overlay for History */}
      {showHistoryOverlay && (
        <div className={`fixed inset-0 z-[70] overflow-y-auto animate-fade-in ${getOverlayClass()}`}>
            <div className="max-w-3xl mx-auto p-6 min-h-screen">
                <header className="flex items-center justify-between mb-8 sticky top-0 py-4 bg-inherit/95 backdrop-blur-md z-10 border-b border-current/10">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setShowHistoryOverlay(false)} className="hover:opacity-70 transition-opacity">
                            <X size={24} />
                        </button>
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <HistoryIcon className="opacity-60"/> Private History
                        </h2>
                    </div>
                    <span className="text-sm opacity-50">{generationHistory.length} Sessions</span>
                </header>

                <div className="space-y-8 pb-20">
                    {generationHistory.length === 0 ? (
                        <div className="text-center opacity-40 py-20">
                            <Clock size={48} className="mx-auto mb-4"/>
                            <p>No generation history found.</p>
                        </div>
                    ) : (
                        generationHistory.map((session) => (
                            <div key={session.id} className="border-b border-current/10 pb-6">
                                <div className="flex justify-between items-start mb-3 opacity-60 text-sm">
                                    <span>{new Date(session.timestamp).toLocaleString()}</span>
                                    <span className="uppercase tracking-wider text-xs border border-current rounded px-2">{session.preset}</span>
                                </div>
                                <p className="text-xs opacity-50 mb-4 font-mono truncate">{session.scriptExcerpt}</p>
                                
                                <div className="space-y-3">
                                    {session.titles.map((t, idx) => (
                                        <div key={idx} className={`p-3 rounded-lg flex justify-between items-center ${profile.theme === ThemeType.GLASS ? 'bg-white/5' : 'bg-current/5'}`}>
                                            <span className="font-medium">{t.title}</span>
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${t.score > 80 ? 'text-green-500 bg-green-500/10' : 'text-yellow-500 bg-yellow-500/10'}`}>{t.score}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default Studio;
