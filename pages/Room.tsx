
import React, { useState, useRef } from 'react';
import { useApp } from '../App';
import { ThemeType, TrainingExample } from '../types';
import { Plus, Trash2, FileText, BrainCircuit, Loader2, Sparkles, Info, CheckCircle2 } from 'lucide-react';
import { analyzeWinningStrategy } from '../services/geminiService';

const Room: React.FC = () => {
  const { profile, trainingData, addTrainingExample, removeTrainingExample, playSound } = useApp();
  const [scriptContent, setScriptContent] = useState("");
  const [title, setTitle] = useState("");
  const [fileName, setFileName] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      playSound();
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (ev) => setScriptContent(ev.target?.result as string);
      reader.readAsText(file);
    }
  };

  const handleMemorize = async () => {
    if (!scriptContent || !title) return;
    setIsAnalyzing(true);
    playSound();

    try {
      // AI analyzes the strategy automatically
      const aiNotes = await analyzeWinningStrategy(title, scriptContent, profile.preferredModel);

      const newExample: TrainingExample = {
        id: Date.now().toString(),
        title,
        notes: aiNotes,
        scriptExcerpt: scriptContent.substring(0, 2000),
        dateAdded: Date.now()
      };

      addTrainingExample(newExample);
      
      // Reset UI
      setTitle("");
      setScriptContent("");
      setFileName("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getThemeAccent = () => {
    if (profile.theme === ThemeType.GLASS) return "text-purple-300";
    if (profile.theme === ThemeType.YOUTUBE) return "text-red-600";
    if (profile.theme === ThemeType.DARK) return "text-blue-400";
    return "text-teal-600";
  };

  const getCardClass = () => {
    if (profile.theme === ThemeType.GLASS) return "glass-panel bg-white/5 border border-purple-500/20";
    if (profile.theme === ThemeType.DARK) return "bg-[#0a0a0a] border border-white/5";
    return "bg-white border border-slate-100 shadow-sm";
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex items-center gap-4">
        <div className={`p-4 rounded-3xl ${profile.theme === ThemeType.GLASS ? 'bg-purple-500/10' : 'bg-current/5'}`}>
            <BrainCircuit size={36} className={getThemeAccent()} />
        </div>
        <div>
            <h1 className="text-3xl font-bold">The Room</h1>
            <p className="opacity-70 text-sm">Upload winners. The AI will extract their DNA.</p>
        </div>
      </header>

      {/* Persistence Info */}
      <div className={`flex items-center gap-3 p-4 rounded-2xl text-xs opacity-60 border border-current/10 ${getCardClass()}`}>
          <Info size={16} className="flex-shrink-0 text-blue-400" />
          <p>Your "Memory Bank" is saved to this browser. It stays here even if you close the tab or restart the studio.</p>
      </div>

      {/* Input Section */}
      <section className={`p-6 rounded-3xl ${getCardClass()}`}>
        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Sparkles size={18} className={getThemeAccent()}/>
            Teaching Phase
        </h2>
        
        <div className="space-y-5">
          {/* File Upload */}
          <div 
            onClick={() => !isAnalyzing && fileInputRef.current?.click()}
            className={`p-5 border-2 border-dashed rounded-2xl cursor-pointer flex items-center justify-between transition-all ${isAnalyzing ? 'opacity-30 cursor-wait' : 'hover:border-current/60'} ${fileName ? 'border-green-500 bg-green-500/5' : 'border-current/20'}`}
          >
            <div className="flex items-center gap-3">
                <FileText size={20} className="opacity-40"/>
                <span className="text-sm font-mono truncate max-w-[180px]">{fileName || "Winner Script (.txt)"}</span>
            </div>
            {!fileName && <span className="text-[10px] font-bold uppercase px-3 py-1.5 rounded-lg bg-current/10">Browse</span>}
            {fileName && <CheckCircle2 size={18} className="text-green-500" />}
            <input type="file" ref={fileInputRef} className="hidden" accept=".txt" onChange={handleFileUpload} disabled={isAnalyzing} />
          </div>

          {/* Title Input */}
          <div>
            <label className="text-[10px] uppercase tracking-[0.2em] opacity-40 font-bold mb-2 block">The Title That Worked</label>
            <input 
              type="text" 
              placeholder="e.g. He Built This in 24 Hours..."
              value={title}
              disabled={isAnalyzing}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full p-4 rounded-2xl outline-none transition-all ${isAnalyzing ? 'opacity-50' : ''} ${profile.theme === ThemeType.GLASS ? 'bg-black/40 border border-purple-500/20 focus:border-purple-500' : 'bg-gray-100 text-black border border-transparent focus:bg-white focus:border-gray-300'}`}
            />
          </div>

          <button 
            onClick={handleMemorize}
            disabled={!scriptContent || !title || isAnalyzing}
            className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl ${!scriptContent || !title || isAnalyzing ? 'opacity-30 cursor-not-allowed bg-gray-600' : (profile.theme === ThemeType.YOUTUBE ? 'bg-red-600 text-white shadow-red-900/20' : 'bg-slate-800 text-white shadow-black/20')}`}
          >
            {isAnalyzing ? <Loader2 className="animate-spin" size={20} /> : <BrainCircuit size={20} />}
            {isAnalyzing ? "Extracting Strategy DNA..." : "Memorize Success"}
          </button>
        </div>
      </section>

      {/* Memory Bank List */}
      <section className="pb-12">
        <h3 className="text-sm font-bold uppercase tracking-widest opacity-40 mb-4 px-2">Knowledge Base</h3>
        
        {trainingData.length === 0 ? (
            <div className="text-center py-20 opacity-20 border-2 border-dashed border-current/10 rounded-3xl">
                <BrainCircuit size={40} className="mx-auto mb-3" />
                <p className="text-sm font-bold uppercase tracking-widest">Brain is Empty</p>
            </div>
        ) : (
            <div className="grid gap-4">
                {trainingData.map((item) => (
                    <div key={item.id} className={`p-5 rounded-3xl transition-all group border ${getCardClass()} border-white/5`}>
                        <div className="flex justify-between items-start">
                            <h4 className="font-bold text-lg pr-8">{item.title}</h4>
                            <button 
                              onClick={() => { playSound(); removeTrainingExample(item.id); }}
                              className="p-2 opacity-0 group-hover:opacity-100 text-red-500 hover:bg-red-500/10 rounded-full transition-all flex-shrink-0"
                            >
                               <Trash2 size={16} />
                            </button>
                        </div>
                        
                        <div className="mt-4 flex items-start gap-3 p-3 rounded-2xl bg-current/[0.03] border border-current/[0.05]">
                            <Sparkles size={14} className={`mt-0.5 flex-shrink-0 ${getThemeAccent()}`} />
                            <p className="text-xs italic opacity-70 leading-relaxed">
                                <span className="font-bold uppercase tracking-tighter not-italic mr-1 opacity-40">AI ANALYSIS:</span>
                                {item.notes}
                            </p>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-current/5 flex justify-between items-center text-[10px] opacity-30 font-bold">
                            <span className="flex items-center gap-1 uppercase tracking-wider">
                                <FileText size={10}/> Script Analyzed
                            </span>
                            <span>{new Date(item.dateAdded).toLocaleDateString()}</span>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </section>
    </div>
  );
};

export default Room;
