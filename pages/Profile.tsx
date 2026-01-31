
import React, { useRef } from 'react';
import { useApp } from '../App';
import { ThemeType, ChannelPreset, SoundType } from '../types';
import { Download, Upload, Trash, Palette, UserCircle, Monitor, Moon, Sun, PlaySquare, Camera, Layers, Zap, ToggleLeft, ToggleRight, Volume2, VolumeX } from 'lucide-react';

const Profile: React.FC = () => {
  const { profile, setProfile, clearData, importData, trainingData, generationHistory, studioHistory, playSound } = useApp();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  const handleThemeChange = (theme: ThemeType) => {
    playSound();
    setProfile({ ...profile, theme });
  };

  const handlePresetChange = (preset: ChannelPreset) => {
    playSound();
    setProfile({ ...profile, preset });
  };

  const toggleMotionBlur = () => {
    playSound();
    setProfile({ ...profile, motionBlur: !profile.motionBlur });
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, name: e.target.value });
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setProfile({ ...profile, avatar: ev.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSoundTypeChange = (type: SoundType) => {
    setProfile({ ...profile, soundType: type });
    // Small delay to allow state to update before playing example
    setTimeout(() => {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const now = ctx.currentTime;
        
        osc.connect(gain);
        gain.connect(ctx.destination);

        if (type === SoundType.CLICK) {
             osc.type = 'square';
             osc.frequency.setValueAtTime(150, now);
             osc.frequency.exponentialRampToValueAtTime(40, now + 0.05);
             gain.gain.setValueAtTime(profile.soundVolume * 0.5, now);
             gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
             osc.start(now); osc.stop(now + 0.05);
        } else if (type === SoundType.POP) {
             osc.type = 'sine';
             osc.frequency.setValueAtTime(400, now);
             osc.frequency.linearRampToValueAtTime(100, now + 0.1);
             gain.gain.setValueAtTime(profile.soundVolume * 0.8, now);
             gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
             osc.start(now); osc.stop(now + 0.1);
        } else {
             osc.type = 'sine';
             osc.frequency.setValueAtTime(1200, now);
             osc.frequency.exponentialRampToValueAtTime(600, now + 0.15);
             gain.gain.setValueAtTime(profile.soundVolume * 0.3, now);
             gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
             osc.start(now); osc.stop(now + 0.2);
        }
    }, 50);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, soundVolume: parseFloat(e.target.value) });
  };

  const handleExport = () => {
    playSound();
    // Include generation history and studio history in the export for a full backup
    const exportData = { profile, trainingData, studioHistory, generationHistory };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `recapAI_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImportClick = () => {
    importInputRef.current?.click();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const content = ev.target?.result as string;
        if (content) {
          const success = importData(content);
          if (success) {
            alert("Brain Transplant Successful. Your data has been synced.");
          } else {
            alert("Failed to import data. Invalid file format.");
          }
        }
      };
      reader.readAsText(file);
    }
    // Reset input
    if (importInputRef.current) importInputRef.current.value = "";
  };

  const themes = [
    { id: ThemeType.LIGHT, name: 'Light', icon: <Sun size={20} />, color: 'bg-slate-100 text-slate-900' },
    { id: ThemeType.DARK, name: 'Dark', icon: <Moon size={20} />, color: 'bg-slate-900 text-slate-400 border border-slate-700' },
    { id: ThemeType.GLASS, name: 'Premium Glass', icon: <Monitor size={20} />, color: 'bg-[#1a0b2e] text-purple-200 border border-purple-500/30 shadow-lg' },
    { id: ThemeType.YOUTUBE, name: 'YouTube', icon: <PlaySquare size={20} />, color: 'bg-[#ffffff] text-[#ff0000] border-2 border-[#ff0000]/10' },
  ];

  const getCardClass = () => {
    if (profile.theme === ThemeType.GLASS) return "glass-panel bg-black/20 border border-purple-500/20";
    if (profile.theme === ThemeType.DARK) return "bg-[#0f0f0f] border border-white/5";
    return "bg-white shadow-sm border border-slate-100";
  };

  const getAccent = () => {
    if (profile.theme === ThemeType.GLASS) return "text-purple-400 accent-purple-500";
    if (profile.theme === ThemeType.YOUTUBE) return "text-red-600 accent-red-600";
    return "text-teal-600 accent-teal-600";
  }

  return (
    <div className="space-y-8 animate-fade-in pb-8">
      <h1 className="text-3xl font-bold">Settings</h1>

      {/* User Info */}
      <section className={`p-6 rounded-3xl transition-all duration-300 ${getCardClass()}`}>
        <div className="flex items-center gap-6">
            <div 
              className="relative group cursor-pointer btn-click-effect rounded-full"
              onClick={() => avatarInputRef.current?.click()}
            >
                {profile.avatar ? (
                    <img src={profile.avatar} alt="Profile" className="w-20 h-20 rounded-full object-cover border-2 border-current shadow-lg" />
                ) : (
                    <UserCircle size={80} className="opacity-80" />
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera size={24} className="text-white" />
                </div>
                <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload}/>
            </div>
            
            <div className="w-full">
                <label className="text-xs uppercase tracking-wider opacity-50 font-bold mb-1 block">Creator Name</label>
                <input 
                    type="text" 
                    value={profile.name}
                    onChange={handleNameChange}
                    className={`w-full bg-transparent text-2xl font-bold border-b-2 focus:outline-none py-1 transition-colors ${profile.theme === ThemeType.GLASS ? 'border-white/20 focus:border-purple-400' : 'border-gray-200 focus:border-blue-500'}`}
                />
            </div>
        </div>
      </section>

      {/* Visual Preferences */}
      <section>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 opacity-90">
            <Palette size={18} /> Visual Experience
        </h2>
        
        {/* Themes */}
        <div className="grid grid-cols-2 gap-4 mb-6">
            {themes.map((t) => (
                <button
                    key={t.id}
                    onClick={() => handleThemeChange(t.id)}
                    className={`btn-click-effect p-4 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all duration-300 ${t.color} ${profile.theme === t.id ? 'ring-2 ring-offset-2 ring-offset-transparent ring-current scale-[1.02] shadow-xl font-bold' : 'opacity-60 hover:opacity-100 hover:scale-[1.02]'}`}
                >
                    {t.icon}
                    <span className="text-sm">{t.name}</span>
                </button>
            ))}
        </div>

        {/* Motion Blur Toggle */}
        <div className={`p-4 rounded-2xl flex justify-between items-center ${getCardClass()}`}>
           <div className="flex items-center gap-3">
              <Zap size={20} className="text-yellow-500" />
              <div>
                <h3 className="font-bold text-sm">Motion Blur & Fluidity</h3>
                <p className="text-xs opacity-50">Enable premium motion effects</p>
              </div>
           </div>
           <button onClick={toggleMotionBlur} className="btn-click-effect opacity-80 hover:opacity-100 transition-opacity text-current">
              {profile.motionBlur ? <ToggleRight size={40} className="text-green-500"/> : <ToggleLeft size={40} className="opacity-50"/>}
           </button>
        </div>
      </section>

      {/* Sound Settings */}
      <section>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 opacity-90">
            <Volume2 size={18} /> Audio Experience
        </h2>
        <div className={`p-6 rounded-3xl space-y-6 ${getCardClass()}`}>
            
            {/* Volume Slider */}
            <div>
               <div className="flex justify-between items-center mb-2">
                 <label className="text-xs font-bold uppercase tracking-wider opacity-70">Effect Volume</label>
                 <span className="text-xs font-mono opacity-60">{Math.round(profile.soundVolume * 100)}%</span>
               </div>
               <div className="flex items-center gap-3">
                  <VolumeX size={16} className="opacity-40" />
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.01" 
                    value={profile.soundVolume} 
                    onChange={handleVolumeChange}
                    className={`w-full h-2 rounded-lg appearance-none cursor-pointer bg-current opacity-20 ${getAccent()}`} 
                  />
                  <Volume2 size={16} className="opacity-80" />
               </div>
            </div>

            {/* Sound Type Selection */}
            <div>
               <label className="text-xs font-bold uppercase tracking-wider opacity-70 mb-3 block">Sound Pack</label>
               <div className="grid grid-cols-3 gap-3">
                  {[
                    { type: SoundType.GLASSY, label: 'Default' },
                    { type: SoundType.CLICK, label: 'Click' },
                    { type: SoundType.POP, label: 'Pop' },
                  ].map((s) => (
                    <button
                      key={s.type}
                      onClick={() => handleSoundTypeChange(s.type)}
                      className={`btn-click-effect py-3 rounded-xl text-sm font-medium transition-all border ${
                        profile.soundType === s.type 
                          ? 'border-current bg-current/10 font-bold' 
                          : 'border-transparent opacity-50 hover:opacity-100 hover:bg-current/5'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
               </div>
            </div>
        </div>
      </section>

      {/* Presets */}
      <section>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 opacity-90">
            <Layers size={18} /> Content Strategy
        </h2>
        <div className={`p-4 rounded-3xl grid grid-cols-2 md:grid-cols-3 gap-3 ${getCardClass()}`}>
            {Object.values(ChannelPreset).map((preset) => (
                 <button
                 key={preset}
                 onClick={() => handlePresetChange(preset)}
                 className={`btn-click-effect p-3 rounded-xl text-xs font-bold transition-all border ${
                     profile.preset === preset 
                        ? (profile.theme === ThemeType.GLASS ? 'bg-purple-600 text-white border-purple-400 shadow-glow' : (profile.theme === ThemeType.YOUTUBE ? 'bg-[#ff0000] text-white border-[#ff0000]' : 'bg-blue-600 text-white border-blue-600'))
                        : 'border-transparent opacity-60 hover:opacity-100 hover:bg-current/5'
                 }`}
             >
                 {preset}
             </button>
            ))}
        </div>
      </section>

      {/* Data Management */}
      <section className={`p-6 rounded-3xl ${getCardClass()}`}>
         <h2 className="text-lg font-semibold mb-4 opacity-90">Data Control</h2>
         <div className="space-y-3">
             <div className="grid grid-cols-2 gap-3">
                <button 
                    onClick={handleExport}
                    className={`btn-click-effect w-full py-3 rounded-xl flex items-center justify-center gap-2 transition-colors ${profile.theme === ThemeType.GLASS ? 'bg-white/10 hover:bg-white/20 border border-white/10' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}`}
                >
                    <Download size={18} /> Export Brain
                </button>
                
                <button 
                    onClick={handleImportClick}
                    className={`btn-click-effect w-full py-3 rounded-xl flex items-center justify-center gap-2 transition-colors ${profile.theme === ThemeType.GLASS ? 'bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-300' : 'bg-green-100 hover:bg-green-200 text-green-800'}`}
                >
                    <Upload size={18} /> Import Brain
                </button>
                <input 
                    type="file" 
                    ref={importInputRef} 
                    className="hidden" 
                    accept=".json" 
                    onChange={handleImportFile}
                />
             </div>
             
             <button 
                onClick={() => {
                    playSound();
                    if(confirm("Are you sure? This wipes all training data.")) clearData();
                }}
                className="btn-click-effect w-full py-3 rounded-xl flex items-center justify-center gap-2 text-red-500 hover:bg-red-500/10 transition-colors border border-transparent hover:border-red-500/20"
             >
                <Trash size={18} /> Factory Reset
             </button>
         </div>
      </section>
    </div>
  );
};

export default Profile;
