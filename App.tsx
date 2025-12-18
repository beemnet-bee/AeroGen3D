import React, { useState, useEffect, useRef } from 'react';
import Scene from './components/Turbine3D';
import Dashboard from './components/Dashboard';
import Controls from './components/Controls';
import { WeatherState, TurbineStats, SimulationHistoryPoint } from './types';

// Constants for physics simulation
const CUT_IN_SPEED = 3.5; // m/s
const RATED_SPEED = 12; // m/s
const STORM_LIMIT = 30; // m/s (Auto-feather trigger)
const MAX_POWER = 2000; // kW
const MAX_RPM = 45; 

const App: React.FC = () => {
  // State
  const [weather, setWeather] = useState<WeatherState>({
    windSpeed: 8,
    windDirection: 0,
    turbulence: 0.1,
    temperature: 20,
    bladePitch: 0,
    timeOfDay: 'day',
    description: "Manual Control Active"
  });

  const [stats, setStats] = useState<TurbineStats>({
    rpm: 0,
    powerOutput: 0,
    efficiency: 0,
    totalEnergy: 0,
    isFeathered: false
  });

  const [history, setHistory] = useState<SimulationHistoryPoint[]>([]);
  const [systemStatus, setSystemStatus] = useState<string>("Systems Nominal.");
  
  // Use a ref for weather to access latest state inside interval without resetting it
  const weatherRef = useRef(weather);

  useEffect(() => {
    weatherRef.current = weather;
  }, [weather]);

  // Physics Loop
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prevStats => {
        const { windSpeed, turbulence, bladePitch } = weatherRef.current;
        let targetRpm = 0;
        let power = 0;
        let eff = 0;
        let isFeathered = false;

        // Auto-Feathering Logic (Safety)
        let effectivePitch = bladePitch;
        if (windSpeed > STORM_LIMIT) {
             effectivePitch = 90; // Force feather
             isFeathered = true;
        }

        // Pitch Factor: 0 deg = 1.0 (Full efficiency), 90 deg = 0.0 (No lift/Stop)
        // Using Cosine approximation
        const pitchRad = (effectivePitch * Math.PI) / 180;
        const pitchFactor = Math.max(0, Math.cos(pitchRad));

        // Physics model
        if (windSpeed < CUT_IN_SPEED) {
          targetRpm = 0;
          power = 0;
        } else {
          // Power curve approximation
          if (windSpeed >= RATED_SPEED) {
             // Rated region
             power = MAX_POWER;
             targetRpm = MAX_RPM;
             eff = 45; 
          } else {
             // Partial load region
             const ratio = (windSpeed - CUT_IN_SPEED) / (RATED_SPEED - CUT_IN_SPEED);
             power = MAX_POWER * Math.pow(ratio, 3);
             targetRpm = MAX_RPM * ratio;
             eff = 30 + (15 * ratio);
          }
        }

        // Apply Pitch Factor (Reduces both Power and RPM capability)
        power *= pitchFactor;
        targetRpm *= pitchFactor;
        
        // If feathered, kill efficiency stat
        if (effectivePitch > 45) {
            eff = 0;
        }

        // Add turbulence noise
        if (targetRpm > 0) {
            const noise = (Math.random() - 0.5) * turbulence * 200; 
            power = Math.max(0, Math.min(MAX_POWER * 1.1, power + noise));
        }
        
        // Inertia simulation
        const inertiaFactor = 0.08; 
        const newRpm = prevStats.rpm + (targetRpm - prevStats.rpm) * inertiaFactor;

        return {
          rpm: newRpm,
          powerOutput: power,
          efficiency: eff,
          totalEnergy: prevStats.totalEnergy + (power / 3600 / 20),
          isFeathered
        };
      });

    }, 50); 

    return () => clearInterval(interval);
  }, []); 

  // History Update (1Hz)
  useEffect(() => {
    const timer = setInterval(() => {
      setHistory(prev => {
        const newPoint = {
          time: new Date().toLocaleTimeString(),
          power: Math.floor(stats.powerOutput),
          windSpeed: weatherRef.current.windSpeed 
        };
        const newHistory = [...prev, newPoint];
        if (newHistory.length > 30) newHistory.shift();
        return newHistory;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [stats.powerOutput]);

  // System Monitor Logic (Deterministic, replaces AI)
  useEffect(() => {
     const statusInterval = setInterval(() => {
        const { windSpeed, bladePitch } = weatherRef.current;
        
        if (windSpeed > STORM_LIMIT) {
            setSystemStatus("CRITICAL WARNING: Storm winds detected. Automatic safety feathering engaged. Turbine halted.");
        } else if (windSpeed > 20) {
             setSystemStatus("CAUTION: High wind speeds. Monitor vibration levels.");
        } else if (bladePitch > 10) {
             setSystemStatus(`Manual pitch adjustment active (${bladePitch}°). Efficiency reduced.`);
        } else if (windSpeed < CUT_IN_SPEED) {
             setSystemStatus("Awaiting cut-in wind speed...");
        } else if (windSpeed >= RATED_SPEED) {
             setSystemStatus("Operating at rated capacity. Optimal power generation.");
        } else {
             setSystemStatus("Optimal operation conditions. Tracking wind vector.");
        }
     }, 1000);
     return () => clearInterval(statusInterval);
  }, []);


  // Calculate visualization pitch (smooth transition if auto-feathered)
  // If auto-feathered, visual pitch should animate to 90
  const visualPitch = stats.isFeathered ? 90 : weather.bladePitch;

  return (
    <div className="relative w-full h-screen bg-slate-900 overflow-hidden">
      {/* 3D Layer */}
      <div className="absolute inset-0 z-0">
         <Scene rpm={stats.rpm} pitch={visualPitch} weather={weather} />
      </div>

      {/* UI Layer */}
      <div className="absolute inset-0 z-10 pointer-events-none">
         <Dashboard 
            weather={weather} 
            stats={stats} 
            history={history} 
            systemStatus={systemStatus} 
         />
         <Controls 
            weather={weather} 
            setWeather={setWeather} 
         />
      </div>
    </div>
  );
};

export default App;
