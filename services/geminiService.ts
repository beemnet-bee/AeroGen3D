import { GoogleGenAI, Type, Schema } from "@google/genai";
import { WeatherState } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateWeatherScenario = async (prompt: string): Promise<WeatherState> => {
  const model = "gemini-2.5-flash";
  
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      windSpeed: { type: Type.NUMBER, description: "Wind speed in meters per second (0-35)" },
      windDirection: { type: Type.NUMBER, description: "Wind direction in degrees (0-360)" },
      turbulence: { type: Type.NUMBER, description: "Turbulence factor (0.0 to 1.0)" },
      temperature: { type: Type.NUMBER, description: "Ambient temperature in Celsius (-20 to 50)" },
      timeOfDay: { type: Type.STRING, enum: ["day", "night", "sunset", "sunrise"], description: "Visual time of day" },
      description: { type: Type.STRING, description: "A short, creative description of the weather conditions" }
    },
    required: ["windSpeed", "windDirection", "turbulence", "temperature", "timeOfDay", "description"]
  };

  try {
    const result = await ai.models.generateContent({
      model,
      contents: `Generate a realistic weather scenario for a wind turbine simulation based on this request: "${prompt}". 
      Ensure physics are plausible (e.g., hurricanes have high speed).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        systemInstruction: "You are an expert meteorologist and physics engine controller.",
      }
    });

    const text = result.text;
    if (!text) throw new Error("No response from AI");
    
    const data = JSON.parse(text);
    return { ...data, bladePitch: 0 } as WeatherState;
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Fallback safe default
    return {
      windSpeed: 10,
      windDirection: 0,
      turbulence: 0.1,
      temperature: 20,
      bladePitch: 0,
      timeOfDay: 'day',
      description: "Fallback: Moderate breeze (AI Error)"
    };
  }
};

export const analyzeEfficiency = async (stats: { windSpeed: number, power: number, rpm: number }): Promise<string> => {
  const model = "gemini-2.5-flash";
  try {
    const result = await ai.models.generateContent({
      model,
      contents: `Analyze these wind turbine stats: Wind Speed: ${stats.windSpeed}m/s, Power: ${stats.power}kW, RPM: ${stats.rpm}. 
      The turbine is a generic 2MW model. Provide a 1-sentence quick insight on efficiency or safety.`,
    });
    return result.text || "Analysis unavailable.";
  } catch (e) {
    return "AI Analysis unavailable.";
  }
};