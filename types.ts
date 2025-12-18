export interface WeatherState {
  windSpeed: number; // m/s
  windDirection: number; // degrees
  turbulence: number; // 0-1 factor
  temperature: number; // Celsius
  bladePitch: number; // degrees (0 = optimal, 90 = feathered)
  timeOfDay: 'day' | 'night' | 'sunset' | 'sunrise';
  description: string;
}

export interface TurbineStats {
  rpm: number;
  powerOutput: number; // kW
  efficiency: number; // %
  totalEnergy: number; // kWh
  isFeathered?: boolean;
}

export interface SimulationHistoryPoint {
  time: string;
  power: number;
  windSpeed: number;
}
