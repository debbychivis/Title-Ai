
import React, { useRef } from 'react';
import { useApp } from '../App';
import { ThemeType, StudioItem, ModelType } from '../types';
import RecencySlider from '../components/RecencySlider';
import { Upload, Image as ImageIcon, Loader2, Copy, TrendingUp, Check, Cpu, Zap, Brain, Sparkles, Lightbulb, MessageSquare, ArrowLeft, RefreshCcw } from 'lucide-react';
import { generateTitles } from '../services/geminiService';

const Home: React.FC = () => {
  const { profile, setProfile, trainingData, studioHistory, addToStudio, addToGenerationHistory, playSound, homeState, setHomeState } = useApp();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgInputRef = useRef<HTMLInputElement>(null);

  // Handlers
  const handleScriptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      playSound();
      const reader = new FileReader();
      reader.onload = (ev) => {
        setHomeState(prev => ({
            ...prev,
            scriptFile: file,
            scriptContent: ev.target?.result as string
        }));
      };
      reader.readAsText(file);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      playSound();
      const reader = new FileReader();
      reader.onload = (ev) => {
          setHomeState(prev => ({
              ...prev,
              thumbnail: ev.target?.result as string
          }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    playSound();
    if (!homeState.scriptContent) {
      setHomeState(prev => ({ ...prev, error: "Please upload a script file first." }));
      return;
    }
    
    setHomeState(prev => ({ ...prev, loading: true, error: null, results: [], trackedIndices: [] }));

    try {
      const generated = await generateTitles({
        scriptContent: homeState.scriptContent,
        thumbnailBase64: homeState.thumbnail,
        subscribers: homeState.subscribers,
        recency: homeState.recency,
        trainingData,
        preset: profile.preset,
        studioHistory, 
        model: profile.preferredModel,
        count: homeState.titleCount,
        userGuidance: homeState.guidance
      });
      
      setHomeState(prev => ({ ...prev, results: generated }));
      
      // Save to History
      addToGenerationHistory({
        id: Date.now().toString(),
        timestamp: Date.now(),
        scriptExcerpt: homeState.scriptContent.substring(0, 100) + '...',
        titles: generated,
        preset: profile.preset
      });

    } catch (err) {
        setHomeState(prev => ({ ...prev, error: "Failed to generate titles. Please try again." }));
    } finally {
        setHomeState(prev => ({ ...prev, loading: false }));
    }
  };

  const handleTrackTitle = (title: string, idx: number) => {
    playSound();
    const item: StudioItem = {
      id: Date.now().toString() + idx,
      title: title,
      generatedDate: Date.now(),
      scriptExcerpt: homeState.scriptContent.substring(0, 200),
      stats: { views: 0, ctr: 0, impressions: 0 } 
    };
    addToStudio(item);
    setHomeState(prev => ({ ...prev, trackedIndices: [...prev.trackedIndices, idx] }));
  };

  const handleCountChange = (val: number) => {
    if (val < 1) val = 1;
    if (val > 5) val = 5;
    setHomeState(prev => ({ ...prev, titleCount: val }));
  };

  const clearResults = () => {
      playSound();
      setHomeState(prev => ({ ...prev, results: [] }));
  };

  const getCardClass = () => {
    if (profile.theme === ThemeType.GLASS) return "glass-panel bg-black/20 border border-purple-500/20 text-purple-50";
    if (profile.theme === ThemeType.DARK) return "bg-[#0f0f0f] border border-white/5";
    return "bg-white shadow-lg border border-slate-100";
  };

  const getPrimaryButtonClass = () => {
    if (profile.theme === ThemeType.YOUTUBE) return "bg-[#cc0000] hover:bg-[#990000] text-white";
    if (profile.theme === ThemeType.GLASS) return "bg-gradient-to-r from-purple-700 to-indigo-600 hover:brightness-110 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] border border-purple-400/20";
    if (profile.theme === ThemeType.DARK) return "bg-blue-700 hover:bg-blue-600 text-white";
    return "bg-teal-600 hover:bg-teal-700 text-white";
  };

  const hasResults = homeState.results.length > 0;

  // ------------------------------------------
  // RESULTS VIEW
  // ------------------------------------------
  if (hasResults) {
    return (
      <div className="animate-fade-in min-h-full pb-12">
        <header className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold flex items-center gap-2">
                <Brain size={24} className={profile.theme === ThemeType.YOUTUBE ? 'text-red-600' : 'text-purple-400'} />
                Architect's Blueprints
            </h2>
            <div className="flex gap-2">
                 <button 
                  onClick={clearResults}
                  className="btn-click-effect flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold opacity-70 hover:opacity-100 border border-current/20 bg-current/5 transition-all"
                >
                    <ArrowLeft size={16} /> Refine Inputs
                </button>
            </div>
        </header>

        <div className="grid gap-6">
            {homeState.results.map((res, idx) => (
              <div key={idx} className={`relative p-8 rounded-3xl border transition-all hover:shadow-2xl group ${getCardClass()} overflow-hidden animate-slide-in-right`} style={{animationDelay: `${idx * 100}ms`}}>
                {/* Score Indicator */}
                <div className="absolute top-0 right-0 p-5">
                     <div className={`text-[10px] font-bold px-3 py-1.5 rounded-full border ${res.score > 85 ? 'bg-green-500/10 border-green-500/30 text-green-500' : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500'}`}>
                        {res.score}% MATCH
                    </div>
                </div>

                <h3 className="text-2xl font-bold leading-snug mb-5 pr-20 group-hover:text-current transition-colors">{res.title}</h3>
                
                {/* Detailed Reasoning / Synthesis Breakdown */}
                <div className="mb-8 p-5 rounded-2xl bg-current/[0.03] border border-current/[0.05] relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-500 to-transparent opacity-50"></div>
                    <div className="flex items-start gap-4">
                        <Lightbulb size={20} className="mt-1 flex-shrink-0 text-yellow-500" />
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-tighter opacity-40 mb-1 block">Strategic Synthesis</span>
                            <p className="text-sm opacity-80 leading-relaxed italic">{res.reasoning}</p>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => { playSound(); navigator.clipboard.writeText(res.title); }}
                    className="btn-click-effect flex items-center text-sm font-bold gap-2 opacity-70 hover:opacity-100 transition-opacity py-3 px-6 rounded-xl bg-current/5 border border-transparent hover:border-current/10"
                  >
                    <Copy size={16} /> Copy
                  </button>

                  <button 
                    onClick={() => handleTrackTitle(res.title, idx)}
                    disabled={homeState.trackedIndices.includes(idx)}
                    className={`btn-click-effect flex items-center text-sm font-bold gap-2 transition-all py-3 px-6 rounded-xl border ${
                      homeState.trackedIndices.includes(idx) 
                        ? 'bg-green-500/10 border-green-500 text-green-500' 
                        : 'opacity-70 hover:opacity-100 border-current/20 hover:bg-current/10'
                    }`}
                  >
                     {homeState.trackedIndices.includes(idx) ? <Check size={16} /> : <TrendingUp size={16} />}
                     {homeState.trackedIndices.includes(idx) ? 'Tracked' : 'Track for Studio'}
                  </button>
                </div>
              </div>
            ))}
        </div>

        <div className="mt-8 text-center">
            <button 
                onClick={handleGenerate}
                disabled={homeState.loading}
                className="btn-click-effect inline-flex items-center gap-2 text-sm font-bold opacity-50 hover:opacity-100 transition-opacity"
            >
                <RefreshCcw size={14} className={homeState.loading ? 'animate-spin' : ''}/> 
                {homeState.loading ? 'Regenerating...' : 'Regenerate with same settings'}
            </button>
        </div>
      </div>
    );
  }

  // ------------------------------------------
  // INPUT VIEW (DEFAULT)
  // ------------------------------------------
  return (
    <div className="space-y-8 pb-8 animate-fade-in">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            {profile.avatar && <img src={profile.avatar} alt="av" className="w-10 h-10 rounded-full object-cover border-2 border-current" />}
            <span>{profile.name}.</span>
          </h1>
          <div className="flex items-center gap-2 opacity-70">
            <span className={`text-xs font-bold px-2 py-0.5 rounded border border-current uppercase tracking-wider`}>{profile.preset} Strategy</span>
            <p className="text-sm">Engineered for your next hit.</p>
          </div>
        </div>
      </header>

      {/* Input Section */}
      <section className={`p-6 rounded-3xl transition-all duration-300 ${getCardClass()}`}>
        <div className="space-y-6">
          
          {/* Model Selection */}
          <div className="flex flex-col md:flex-row gap-4">
             <div className="flex-1">
               <label className="block text-sm font-medium mb-2 opacity-90">Thinking Mode</label>
               <div className="grid grid-cols-3 gap-2">
                 {[
                   { id: ModelType.STANDARD, label: 'Fast', icon: <Zap size={16}/> },
                   { id: ModelType.PRO, label: 'Deep', icon: <Brain size={16}/> },
                   { id: ModelType.LITE, label: 'Lite', icon: <Cpu size={16}/> },
                 ].map((m) => (
                   <button
                    key={m.id}
                    onClick={() => { playSound(); setProfile({...profile, preferredModel: m.id}); }}
                    className={`btn-click-effect p-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 border transition-all ${
                      profile.preferredModel === m.id 
                      ? (profile.theme === ThemeType.GLASS ? 'bg-purple-600 text-white border-purple-400' : (profile.theme === ThemeType.YOUTUBE ? 'bg-red-600 text-white' : 'bg-slate-700 text-white')) 
                      : 'border-current/20 opacity-60 hover:opacity-100 hover:bg-current/5'
                    }`}
                   >
                     {m.icon}
                     {m.label}
                   </button>
                 ))}
               </div>
             </div>
             
             <div className="w-full md:w-1/3">
               <label className="block text-sm font-medium mb-2 opacity-90">Count</label>
               <input 
                 type="number"
                 min="1"
                 max="5"
                 value={homeState.titleCount}
                 onChange={(e) => handleCountChange(parseInt(e.target.value))}
                 className={`w-full p-3 rounded-xl outline-none transition-all font-mono text-center font-bold text-lg ${profile.theme === ThemeType.GLASS ? 'bg-black/40 border border-purple-500/30' : 'bg-gray-100 border border-gray-200'}`}
               />
             </div>
          </div>

          <hr className="border-current opacity-10" />
          
          {/* Script Upload */}
          <div>
            <label className="block text-sm font-medium mb-2 opacity-90">Raw Script</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`btn-click-effect border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${homeState.scriptFile ? 'border-green-500 bg-green-500/10' : 'border-current opacity-40 hover:opacity-100'}`}
            >
              <Upload size={24} className="mb-2" />
              <span className="text-sm text-center font-mono">
                {homeState.scriptFile ? homeState.scriptFile.name : "Select Script for Analysis"}
              </span>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".txt" 
              onChange={handleScriptUpload} 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2 opacity-90">Subscribers</label>
              <input 
                type="number" 
                value={homeState.subscribers} 
                onChange={(e) => setHomeState(prev => ({ ...prev, subscribers: parseInt(e.target.value) }))}
                className={`w-full p-3 rounded-xl outline-none focus:ring-2 transition-all font-mono ${profile.theme === ThemeType.GLASS ? 'bg-black/40 border border-purple-500/30 focus:ring-purple-500' : 'bg-gray-50 text-black focus:ring-teal-500 border border-gray-200'}`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 opacity-90">Visual Hook</label>
              <div 
                onClick={() => imgInputRef.current?.click()}
                className={`btn-click-effect h-[52px] w-full rounded-xl flex items-center px-4 cursor-pointer transition-all border ${homeState.thumbnail ? 'border-green-500 bg-green-500/10' : 'border-current opacity-40 hover:opacity-80'}`}
              >
                 <ImageIcon size={20} className="mr-3 opacity-70" />
                 <span className="text-sm truncate font-mono">{homeState.thumbnail ? "Visual Loaded" : "Upload Thumbnail"}</span>
              </div>
              <input 
                type="file" 
                ref={imgInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleImageUpload} 
              />
            </div>
          </div>

          <RecencySlider 
            value={homeState.recency} 
            onChange={(val) => setHomeState(prev => ({ ...prev, recency: val }))} 
          />

          {/* New Architect Guidance Box */}
          <div className="pt-2">
            <label className="text-sm font-medium mb-2 opacity-90 flex items-center gap-2">
                 <MessageSquare size={14} className="text-purple-400" /> 
                 Architect Guidance <span className="text-[10px] opacity-50 uppercase tracking-widest">(Optional)</span>
            </label>
            <textarea
                value={homeState.guidance}
                onChange={(e) => setHomeState(prev => ({...prev, guidance: e.target.value}))}
                placeholder="Talk to the AI: 'Focus on the plot twist', 'Make it mysterious', 'Use a question format'..."
                className={`w-full p-4 rounded-2xl outline-none transition-all text-sm min-h-[80px] resize-none ${profile.theme === ThemeType.GLASS ? 'bg-black/40 border border-purple-500/30 focus:border-purple-500' : 'bg-gray-50 text-black focus:ring-teal-500 border border-gray-200'}`}
            />
          </div>

          {homeState.error && <p className="text-red-500 text-sm text-center animate-pulse">{homeState.error}</p>}

          <button 
            onClick={handleGenerate}
            disabled={homeState.loading}
            className={`btn-click-effect w-full py-4 rounded-2xl font-bold text-lg shadow-xl transform transition-all hover:scale-[1.01] active:scale-[0.98] flex justify-center items-center gap-2 ${getPrimaryButtonClass()} ${homeState.loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {homeState.loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
            {homeState.loading ? "Synthesizing Strategy..." : "Architect Titles"}
          </button>

        </div>
      </section>
    </div>
  );
};

export default Home;
