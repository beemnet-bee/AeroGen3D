import React from 'react';
import { 
  Wind, 
  RotateCw, 
  Zap, 
  Thermometer, 
  Activity,
  Cpu
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { WeatherState, TurbineStats, SimulationHistoryPoint } from '../types';

interface DashboardProps {
  weather: WeatherState;
  stats: TurbineStats;
  history: SimulationHistoryPoint[];
  systemStatus: string;
}

const StatCard: React.FC<{ 
    label: string; 
    value: string | number; 
    unit: string; 
    icon: React.ReactNode; 
    color: string 
}> = ({ label, value, unit, icon, color }) => (
  <div className={`bg-slate-800/80 backdrop-blur-md border border-slate-700 rounded-xl p-4 flex items-center justify-between shadow-lg transform hover:scale-105 transition-transform duration-200`}>
    <div>
      <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{label}</p>
      <div className="flex items-baseline mt-1 space-x-1">
        <h3 className="text-2xl font-bold text-white">{value}</h3>
        <span className="text-sm text-slate-400">{unit}</span>
      </div>
    </div>
    <div className={`p-3 rounded-full ${color} bg-opacity-20`}>
      {React.cloneElement(icon as React.ReactElement, { className: `w-6 h-6 ${color.replace('bg-', 'text-')}` })}
    </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ weather, stats, history, systemStatus }) => {
  return (
    <div className="absolute inset-0 pointer-events-none p-4 md:p-6 flex flex-col justify-between overflow-hidden">
      
      {/* Top Bar: Header & Weather Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center pointer-events-auto gap-4">
        <div>
           <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 tracking-tight">
            AeroGen <span className="font-light text-white">Simulator</span>
          </h1>
          <p className="text-slate-400 text-sm flex items-center gap-2 mt-1">
            <span className={`w-2 h-2 rounded-full ${stats.rpm > 0.5 ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></span>
            System Status: {stats.rpm > 0.5 ? 'GENERATING' : stats.isFeathered ? 'SAFETY STOP' : 'IDLE'}
          </p>
        </div>

        <div className="bg-slate-900/90 backdrop-blur-md rounded-full px-6 py-2 border border-slate-700 shadow-xl flex items-center gap-6">
           <div className="flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-semibold">{weather.temperature}°C</span>
           </div>
           <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-semibold">{(weather.turbulence * 100).toFixed(0)}% Turb</span>
           </div>
           <div className="flex items-center gap-2">
              <div className="w-4 h-4 flex items-center justify-center">
                 {weather.timeOfDay === 'day' ? '☀️' : weather.timeOfDay === 'night' ? '🌙' : '🌅'}
              </div>
              <span className="text-sm font-semibold capitalize">{weather.timeOfDay}</span>
           </div>
        </div>
      </div>

      {/* Middle Right: Live Chart */}
      <div className="absolute right-6 top-24 bottom-96 w-80 pointer-events-auto hidden md:flex flex-col gap-4">
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-xl p-4 shadow-xl flex-1 min-h-[200px]">
          <h3 className="text-slate-300 font-semibold mb-4 text-sm flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" /> Power Output History (kW)
          </h3>
          <div className="w-full h-[calc(100%-2rem)]">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={history}>
                  <defs>
                    <linearGradient id="colorPower" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#eab308" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="time" hide />
                  <YAxis stroke="#94a3b8" fontSize={10} tickFormatter={(val) => `${val}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                    itemStyle={{ color: '#eab308' }}
                  />
                  <Area type="monotone" dataKey="power" stroke="#eab308" fillOpacity={1} fill="url(#colorPower)" isAnimationActive={false} />
               </AreaChart>
             </ResponsiveContainer>
          </div>
        </div>
        
        {/* System Monitor Box */}
        <div className={`backdrop-blur-md border rounded-xl p-4 shadow-xl transition-colors duration-300 ${stats.isFeathered ? 'bg-red-900/80 border-red-500' : 'bg-slate-900/80 border-slate-700'}`}>
             <h3 className={`font-semibold mb-2 text-xs uppercase flex items-center gap-2 ${stats.isFeathered ? 'text-white' : 'text-slate-300'}`}>
                <Cpu className="w-4 h-4" /> System Monitor
             </h3>
             <p className={`text-sm leading-relaxed font-light ${stats.isFeathered ? 'text-white font-bold' : 'text-slate-300'}`}>
                {systemStatus}
             </p>
        </div>
      </div>

      {/* Bottom: Main Stats & Controls Placeholder */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pointer-events-auto mt-auto">
         <StatCard 
            label="Wind Speed" 
            value={weather.windSpeed} 
            unit="m/s" 
            icon={<Wind />} 
            color="bg-cyan-500" 
         />
         <StatCard 
            label="Rotor Speed" 
            value={stats.rpm.toFixed(1)} 
            unit="RPM" 
            icon={<RotateCw />} 
            color="bg-green-500" 
         />
         <StatCard 
            label="Active Power" 
            value={Math.floor(stats.powerOutput)} 
            unit="kW" 
            icon={<Zap />} 
            color="bg-yellow-500" 
         />
         <StatCard 
            label="Efficiency" 
            value={stats.efficiency.toFixed(1)} 
            unit="%" 
            icon={<Activity />} 
            color="bg-purple-500" 
         />
      </div>

    </div>
  );
};

export default Dashboard;
