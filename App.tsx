
import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import { Home as HomeIcon, Box, User, BarChart2 } from 'lucide-react';
import { ThemeType, UserProfile, TrainingExample, ChannelPreset, StudioItem, SoundType, ModelType, GenerationHistorySession, HomeState, RecencyLevel } from './types';

// Pages
import HomePage from './pages/Home';
import RoomPage from './pages/Room';
import ProfilePage from './pages/Profile';
import StudioPage from './pages/Studio';

// --- Contexts ---

interface AppStateContextType {
  profile: UserProfile;
  setProfile: (p: UserProfile) => void;
  trainingData: TrainingExample[];
  addTrainingExample: (ex: TrainingExample) => void;
  removeTrainingExample: (id: string) => void;
  studioHistory: StudioItem[];
  addToStudio: (item: StudioItem) => void;
  updateStudioStats: (id: string, stats: { views: number, ctr: number, impressions: number }) => void;
  generationHistory: GenerationHistorySession[];
  addToGenerationHistory: (session: GenerationHistorySession) => void;
  clearData: () => void;
  importData: (jsonString: string) => boolean; // New Import Function
  playSound: () => void;
  // Home Persistence
  homeState: HomeState;
  setHomeState: React.Dispatch<React.SetStateAction<HomeState>>;
}

const AppContext = createContext<AppStateContextType | null>(null);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};

// --- Main App Component ---

const App: React.FC = () => {
  // -- State --
  const [activeTab, setActiveTab] = useState<'home' | 'room' | 'studio' | 'profile'>('home');
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');
  
  // Persisted Profile
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('recapAI_profile');
    return saved ? JSON.parse(saved) : { 
      name: 'Creator', 
      theme: ThemeType.DARK, 
      preset: ChannelPreset.MOVIE_RECAP,
      motionBlur: true,
      soundType: SoundType.GLASSY,
      soundVolume: 0.5,
      preferredModel: ModelType.STANDARD
    };
  });

  // Persisted Training Data
  const [trainingData, setTrainingData] = useState<TrainingExample[]>(() => {
    const saved = localStorage.getItem('recapAI_training');
    return saved ? JSON.parse(saved) : [];
  });

  // Persisted Studio History (Tracked items with stats)
  const [studioHistory, setStudioHistory] = useState<StudioItem[]>(() => {
    const saved = localStorage.getItem('recapAI_studio');
    return saved ? JSON.parse(saved) : [];
  });

  // Persisted Generation History (All generations)
  const [generationHistory, setGenerationHistory] = useState<GenerationHistorySession[]>(() => {
    const saved = localStorage.getItem('recapAI_history');
    return saved ? JSON.parse(saved) : [];
  });

  // Home Page State (Lifted for persistence)
  const [homeState, setHomeState] = useState<HomeState>({
    scriptFile: null,
    scriptContent: "",
    subscribers: 1000,
    recency: RecencyLevel.RECENT_ENOUGH,
    thumbnail: null,
    titleCount: 5,
    loading: false,
    results: [],
    error: null,
    trackedIndices: [],
    guidance: ""
  });

  // -- Audio --
  const audioContextRef = useRef<AudioContext | null>(null);

  const playSound = () => {
    if (profile.soundVolume === 0) return;

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      const volume = profile.soundVolume;

      switch (profile.soundType) {
        case SoundType.CLICK:
          // Sharp mechanical click
          osc.type = 'square';
          osc.frequency.setValueAtTime(150, now);
          osc.frequency.exponentialRampToValueAtTime(40, now + 0.05);
          
          gain.gain.setValueAtTime(volume * 0.5, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
          
          osc.start(now);
          osc.stop(now + 0.05);
          break;

        case SoundType.POP:
          // Soft bubble pop
          osc.type = 'sine';
          osc.frequency.setValueAtTime(400, now);
          osc.frequency.linearRampToValueAtTime(100, now + 0.1);
          
          gain.gain.setValueAtTime(volume * 0.8, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
          
          osc.start(now);
          osc.stop(now + 0.1);
          break;

        case SoundType.GLASSY:
        default:
          // Premium Glassy Ping (High pitched sine with reverb-like decay)
          osc.type = 'sine';
          osc.frequency.setValueAtTime(1200, now);
          osc.frequency.exponentialRampToValueAtTime(600, now + 0.15);
          
          gain.gain.setValueAtTime(volume * 0.3, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
          
          osc.start(now);
          osc.stop(now + 0.2);
          break;
      }

    } catch (e) {
      console.error("Audio playback error", e);
    }
  };

  // -- Effects --
  useEffect(() => {
    localStorage.setItem('recapAI_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('recapAI_training', JSON.stringify(trainingData));
  }, [trainingData]);

  useEffect(() => {
    localStorage.setItem('recapAI_studio', JSON.stringify(studioHistory));
  }, [studioHistory]);

  useEffect(() => {
    localStorage.setItem('recapAI_history', JSON.stringify(generationHistory));
  }, [generationHistory]);

  // -- Swipe Handling --
  const touchStart = useRef<number>(0);
  const touchEnd = useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEnd.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStart.current || !touchEnd.current) return;
    
    const distance = touchStart.current - touchEnd.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    const tabs: ('home' | 'room' | 'studio' | 'profile')[] = ['home', 'room', 'studio', 'profile'];
    const currentIndex = tabs.indexOf(activeTab);

    if (isLeftSwipe && currentIndex < tabs.length - 1) {
      setSlideDirection('right'); // Content moves left, appearing from right
      changeTab(tabs[currentIndex + 1]);
    }
    
    if (isRightSwipe && currentIndex > 0) {
      setSlideDirection('left'); // Content moves right, appearing from left
      changeTab(tabs[currentIndex - 1]);
    }
    
    // Reset
    touchStart.current = 0;
    touchEnd.current = 0;
  };

  const changeTab = (tab: 'home' | 'room' | 'studio' | 'profile') => {
    const tabs = ['home', 'room', 'studio', 'profile'];
    const oldIdx = tabs.indexOf(activeTab);
    const newIdx = tabs.indexOf(tab);
    
    setSlideDirection(newIdx > oldIdx ? 'right' : 'left');
    setActiveTab(tab);
    playSound();
  };

  // -- Actions --
  const addTrainingExample = (ex: TrainingExample) => {
    setTrainingData(prev => [ex, ...prev]);
  };

  const removeTrainingExample = (id: string) => {
    setTrainingData(prev => prev.filter(item => item.id !== id));
  };

  const addToStudio = (item: StudioItem) => {
    setStudioHistory(prev => [item, ...prev]);
  };

  const updateStudioStats = (id: string, stats: { views: number, ctr: number, impressions: number }) => {
    setStudioHistory(prev => prev.map(item => 
      item.id === id ? { ...item, stats } : item
    ));
  };

  const addToGenerationHistory = (session: GenerationHistorySession) => {
    setGenerationHistory(prev => [session, ...prev]);
  };

  const clearData = () => {
    setTrainingData([]);
    setStudioHistory([]);
    setGenerationHistory([]);
    setProfile({ 
      name: 'Creator', 
      theme: ThemeType.LIGHT, 
      preset: ChannelPreset.MOVIE_RECAP, 
      motionBlur: true,
      soundType: SoundType.GLASSY,
      soundVolume: 0.5,
      preferredModel: ModelType.STANDARD
    }); 
    // Reset home state as well
    setHomeState({
      scriptFile: null,
      scriptContent: "",
      subscribers: 1000,
      recency: RecencyLevel.RECENT_ENOUGH,
      thumbnail: null,
      titleCount: 5,
      loading: false,
      results: [],
      error: null,
      trackedIndices: [],
      guidance: ""
    });

    localStorage.removeItem('recapAI_training');
    localStorage.removeItem('recapAI_profile');
    localStorage.removeItem('recapAI_studio');
    localStorage.removeItem('recapAI_history');
  };

  // Implementation of Data Import
  const importData = (jsonString: string) => {
    try {
      const data = JSON.parse(jsonString);
      
      // Basic validation and selective update
      if (data.profile) setProfile(data.profile);
      if (data.trainingData && Array.isArray(data.trainingData)) setTrainingData(data.trainingData);
      if (data.studioHistory && Array.isArray(data.studioHistory)) setStudioHistory(data.studioHistory);
      // Optional: Import history if it exists in the file, though we might want to keep that local to device
      // For a "Universal" feel, let's sync it.
      if (data.generationHistory && Array.isArray(data.generationHistory)) setGenerationHistory(data.generationHistory);
      
      playSound();
      return true;
    } catch (e) {
      console.error("Failed to import brain:", e);
      return false;
    }
  };

  // -- Theme Logic --
  const getThemeClasses = () => {
    switch (profile.theme) {
      case ThemeType.LIGHT:
        return "bg-slate-50 text-slate-900";
      case ThemeType.DARK:
        return "bg-[#050505] text-slate-300"; // Darker
      case ThemeType.GLASS:
        // Updated Premium Dark Glass
        return "bg-[#05010a] text-purple-50 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-[#1a0b2e] via-[#05010a] to-black";
      case ThemeType.YOUTUBE:
        // Distinct YouTube Mode
        return "bg-[#ffffff] text-[#030303]";
      default:
        return "bg-slate-50";
    }
  };

  const getNavClasses = () => {
    if (profile.theme === ThemeType.GLASS) return "bg-black/60 backdrop-blur-xl border-t border-purple-500/20 text-purple-200/50 shadow-[0_-10px_40px_-15px_rgba(120,0,255,0.2)]";
    if (profile.theme === ThemeType.YOUTUBE) return "bg-white border-t border-gray-200 text-[#606060] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]";
    if (profile.theme === ThemeType.DARK) return "bg-[#0a0a0a]/90 backdrop-blur-md border-t border-white/10 text-slate-500";
    return "bg-white border-t border-slate-200 text-slate-400";
  };

  const getActiveNavColor = () => {
    if (profile.theme === ThemeType.YOUTUBE) return "text-[#ff0000]";
    if (profile.theme === ThemeType.GLASS) return "text-purple-300 drop-shadow-[0_0_12px_rgba(192,132,252,0.8)]";
    if (profile.theme === ThemeType.DARK) return "text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]";
    return "text-teal-600";
  };

  return (
    <AppContext.Provider value={{ 
      profile, setProfile, 
      trainingData, addTrainingExample, removeTrainingExample,
      studioHistory, addToStudio, updateStudioStats,
      generationHistory, addToGenerationHistory,
      homeState, setHomeState,
      clearData, importData, playSound
    }}>
      <div className={`min-h-screen transition-colors duration-500 ease-in-out flex flex-col overflow-hidden ${getThemeClasses()} ${profile.motionBlur ? 'motion-blur-active' : ''}`}>
        
        {/* Main Content Area with Swipe Wrapper */}
        <main 
          className="flex-1 relative w-full max-w-4xl mx-auto h-[calc(100vh-80px)] overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Animated Container */}
          <div 
            key={activeTab} 
            className={`absolute inset-0 p-4 md:p-6 pb-24 overflow-y-auto overflow-x-hidden ${
              slideDirection === 'right' ? 'animate-slide-in-right' : 'animate-slide-in-left'
            }`}
          >
            {activeTab === 'home' && <HomePage />}
            {activeTab === 'room' && <RoomPage />}
            {activeTab === 'studio' && <StudioPage />}
            {activeTab === 'profile' && <ProfilePage />}
          </div>
        </main>

        {/* Sticky Navigation */}
        <nav className={`fixed bottom-0 left-0 right-0 px-2 py-3 md:px-6 md:py-4 flex justify-around items-center z-50 ${getNavClasses()}`}>
          <button 
            onClick={() => changeTab('home')}
            className={`btn-click-effect flex flex-col items-center gap-1 w-16 transition-all ${activeTab === 'home' ? getActiveNavColor() : 'hover:opacity-80'}`}
          >
            <HomeIcon size={24} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
            <span className="text-[10px] font-semibold tracking-wide">Home</span>
          </button>

          <button 
            onClick={() => changeTab('room')}
            className={`btn-click-effect flex flex-col items-center gap-1 w-16 transition-all ${activeTab === 'room' ? getActiveNavColor() : 'hover:opacity-80'}`}
          >
            <Box size={24} strokeWidth={activeTab === 'room' ? 2.5 : 2} />
            <span className="text-[10px] font-semibold tracking-wide">Room</span>
          </button>

          <button 
            onClick={() => changeTab('studio')}
            className={`btn-click-effect flex flex-col items-center gap-1 w-16 transition-all ${activeTab === 'studio' ? getActiveNavColor() : 'hover:opacity-80'}`}
          >
            <BarChart2 size={24} strokeWidth={activeTab === 'studio' ? 2.5 : 2} />
            <span className="text-[10px] font-semibold tracking-wide">Studio</span>
          </button>

          <button 
            onClick={() => changeTab('profile')}
            className={`btn-click-effect flex flex-col items-center gap-1 w-16 transition-all ${activeTab === 'profile' ? getActiveNavColor() : 'hover:opacity-80'}`}
          >
            <User size={24} strokeWidth={activeTab === 'profile' ? 2.5 : 2} />
            <span className="text-[10px] font-semibold tracking-wide">Profile</span>
          </button>
        </nav>
      </div>
    </AppContext.Provider>
  );
};

export default App;
