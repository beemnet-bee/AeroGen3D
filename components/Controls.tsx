import React, { useState } from 'react';
import { Sliders, Sun, Moon, CloudSun, Sunset, RotateCw, ChevronUp, ChevronDown } from 'lucide-react';
import { WeatherState } from '../types';

interface ControlsProps {
  weather: WeatherState;
  setWeather: (w: WeatherState) => void;
}

const Controls: React.FC<ControlsProps> = ({ weather, setWeather }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleManualChange = (key: keyof WeatherState, value: number | string) => {
    setWeather({ 
        ...weather, 
        [key]: value,
        description: "Manual Configuration"
    });
  };

  const timeOptions: { value: WeatherState['timeOfDay']; icon: React.ReactNode; label: string }[] = [
    { value: 'sunrise', icon: <CloudSun className="w-4 h-4" />, label: 'Sunrise' },
    { value: 'day', icon: <Sun className="w-4 h-4" />, label: 'Day' },
    { value: 'sunset', icon: <Sunset className="w-4 h-4" />, label: 'Sunset' },
    { value: 'night', icon: <Moon className="w-4 h-4" />, label: 'Night' },
  ];

  return (
    <div className="absolute bottom-4 left-4 right-4 md:right-auto md:bottom-auto md:top-24 md:left-6 w-auto md:w-80 pointer-events-auto flex flex-col gap-2 transition-all duration-300">
      
      {/* Header / Toggle Button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="bg-slate-900/90 backdrop-blur-md rounded-xl p-3 border border-slate-700 flex items-center justify-between shadow-lg hover:bg-slate-800 transition-colors w-full text-left"
      >
        <h2 className="text-white font-semibold flex items-center gap-2">
           <Sliders className="w-5 h-5 text-cyan-400" /> Control Panel
        </h2>
        {isCollapsed ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
      </button>

      {/* Control Body */}
      {!isCollapsed && (
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-xl p-5 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300 max-h-[70vh] overflow-y-auto">
          
            <div className="space-y-6">
               {/* Time of Day */}
               <div>
                  <label className="block text-slate-400 text-xs font-bold uppercase mb-2">Time of Day</label>
                  <div className="grid grid-cols-4 gap-2">
                      {timeOptions.map((opt) => (
                          <button
                              key={opt.value}
                              onClick={() => handleManualChange('timeOfDay', opt.value)}
                              className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all ${weather.timeOfDay === opt.value ? 'bg-cyan-600 text-white ring-2 ring-cyan-400' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                          >
                              {opt.icon}
                              <span className="text-[10px] mt-1 font-medium">{opt.label}</span>
                          </button>
                      ))}
                  </div>
               </div>

               {/* Blade Pitch Control */}
               <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                  <div className="flex justify-between mb-1">
                    <label className="text-slate-300 text-xs font-bold uppercase flex items-center gap-2">
                       <RotateCw className="w-3 h-3 text-red-400" /> Blade Pitch
                    </label>
                    <span className="text-red-400 text-xs font-bold">{weather.bladePitch}°</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="90" 
                    step="1"
                    value={weather.bladePitch}
                    onChange={(e) => handleManualChange('bladePitch', parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-500"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                      0° = Max Power, 90° = Feathered (Stop)
                  </p>
               </div>

               {/* Wind Speed Slider */}
               <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-slate-400 text-xs font-bold uppercase">Wind Speed</label>
                    <span className="text-cyan-400 text-xs font-bold">{weather.windSpeed} m/s</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="45" 
                    step="0.5"
                    value={weather.windSpeed}
                    onChange={(e) => handleManualChange('windSpeed', parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
               </div>

               {/* Direction Slider */}
               <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-slate-400 text-xs font-bold uppercase">Direction (Yaw)</label>
                    <span className="text-green-400 text-xs font-bold">{weather.windDirection}°</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="360" 
                    value={weather.windDirection}
                    onChange={(e) => handleManualChange('windDirection', parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                  />
               </div>
               
               {/* Turbulence Slider */}
               <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-slate-400 text-xs font-bold uppercase">Turbulence</label>
                    <span className="text-purple-400 text-xs font-bold">{(weather.turbulence * 100).toFixed(0)}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.05"
                    value={weather.turbulence}
                    onChange={(e) => handleManualChange('turbulence', parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
               </div>

               {/* Temperature Slider */}
               <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-slate-400 text-xs font-bold uppercase">Temperature</label>
                    <span className="text-orange-400 text-xs font-bold">{weather.temperature}°C</span>
                  </div>
                  <input 
                    type="range" 
                    min="-20" 
                    max="50" 
                    step="1"
                    value={weather.temperature}
                    onChange={(e) => handleManualChange('temperature', parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                  />
               </div>
            </div>
          
        </div>
      )}
    </div>
  );
};

export default Controls;