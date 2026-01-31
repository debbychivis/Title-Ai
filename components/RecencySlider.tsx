
import React from 'react';
import { RecencyLevel, ThemeType, ChannelPreset } from '../types';
import { useApp } from '../App';

interface Props {
  value: RecencyLevel;
  onChange: (val: RecencyLevel) => void;
}

const RecencySlider: React.FC<Props> = ({ value, onChange }) => {
  const { profile, playSound } = useApp();
  
  // Dynamic Labels Logic
  const getLabels = () => {
    if (profile.preset === ChannelPreset.MOVIE_RECAP) {
      return ["Very Recent", "Recent Enough", "Not Recent", "Old Movie"];
    }
    if ([ChannelPreset.TECH, ChannelPreset.GAMING, ChannelPreset.VLOG].includes(profile.preset)) {
      return ["Trending Now", "This Week", "This Month", "Evergreen"];
    }
    if (profile.preset === ChannelPreset.TUTORIAL || profile.preset === ChannelPreset.COOKING) {
      return ["New Method", "Modern Std", "Established", "Classic"];
    }
    return ["Fresh", "Recent", "Older", "Vintage"];
  };

  const labels = getLabels();

  const getTrackColor = () => {
    if (profile.theme === ThemeType.YOUTUBE) return "bg-[#ff0000]";
    if (profile.theme === ThemeType.GLASS) return "bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]";
    if (profile.theme === ThemeType.DARK) return "bg-blue-600";
    return "bg-teal-500";
  };

  const handleInput = (val: number) => {
    if (val !== value) playSound();
    onChange(val as RecencyLevel);
  };

  return (
    <div className="w-full py-4 select-none">
      <div className="flex justify-between items-end mb-4">
        <label className="text-sm font-medium opacity-80">
           {profile.preset === ChannelPreset.MOVIE_RECAP ? 'Movie Release Date' : 'Topic Freshness'}
        </label>
        <span className={`text-xs font-bold px-2 py-1 rounded ${profile.theme === ThemeType.GLASS ? 'bg-purple-500/20 text-purple-300' : 'bg-gray-200 text-gray-700'}`}>
          {labels[value]}
        </span>
      </div>
      
      <div className="relative h-3 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
         {/* Animated Track */}
        <div 
          className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ease-out ${getTrackColor()}`}
          style={{ width: `${(value / 3) * 100}%` }}
        />
        
        <input 
          type="range" 
          min="0" 
          max="3" 
          step="1" 
          value={value} 
          onChange={(e) => handleInput(parseInt(e.target.value))}
          className="absolute top-[-10px] left-0 w-full h-8 opacity-0 cursor-pointer z-20"
        />

        {/* Tick Marks */}
        <div className="absolute top-0 left-0 w-full h-full flex justify-between items-center px-[2px] pointer-events-none z-10">
          {[0, 1, 2, 3].map((step) => (
            <div 
              key={step} 
              className={`w-1 h-1 rounded-full transition-all duration-300 ${step <= value ? 'bg-white opacity-100 scale-125' : 'bg-black opacity-20'}`}
            />
          ))}
        </div>
      </div>
      
      <div className="flex justify-between mt-3 px-1">
        {labels.map((label, idx) => (
          <span 
            key={idx} 
            className={`text-[10px] uppercase tracking-wider transition-all duration-300 cursor-pointer hover:opacity-100 ${value === idx ? 'font-bold opacity-100 scale-110' : 'opacity-40'}`}
            onClick={() => handleInput(idx)}
          >
            {label.split(' ')[0]}
          </span>
        ))}
      </div>
    </div>
  );
};

export default RecencySlider;