import { GoogleGenAI } from "@google/genai";
import { DailyRecord } from "../types";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getBusinessInsights = async (records: DailyRecord[]): Promise<string> => {
  try {
    // We only send the last 30 records to save tokens and keep context relevant
    const recentRecords = records
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 30);

    const dataContext = JSON.stringify(recentRecords);

    const prompt = `
      You are a business consultant for a small Indian street stall selling 'Limbu Sarbat' (Lemonade) and Snacks.
      
      Here is the daily financial data (JSON) including Sales, Costs (Lemon, Ice, Sugar, Snack Buying Prices), and Profit:
      ${dataContext}

      Please provide a brief, actionable analysis in 3 bullet points:
      1. Profitability: Are margins healthy? (Total Revenue vs Total Cost).
      2. Snack Performance: Which snacks have good margins (Selling Price - Buying Price) and should be pushed?
      3. Growth Tip: How can we increase the Net Profit based on this data?

      Keep the tone encouraging and simple. Use Indian currency symbol ₹.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Unable to generate insights at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error connecting to AI advisor. Please check your connection.";
  }
};