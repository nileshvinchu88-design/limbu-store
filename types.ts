export interface SnackItem {
  name: string;
  qty: number;
  buyingPricePerUnit: number; // Cost price per unit
  pricePerUnit: number;       // Selling price per unit
}

export interface DailyRecord {
  id: string;
  date: string; // ISO String YYYY-MM-DD
  
  // Sales Metrics
  lemonadeGlassQty: number;
  lemonadeRatePerGlass: number;
  
  // Inventory & Costs
  lemonsUsedQty: number;
  lemonPricePerUnit: number;
  
  iceUsedKg: number;
  icePricePerKg: number;
  
  sugarUsedKg: number;
  sugarPricePerKg: number;
  
  // Snacks
  snacks: SnackItem[];
  
  // Calculated Financials
  totalRevenue: number;
  totalCost: number;         // Now includes Snack Costs
  netProfit: number;
}

export enum ViewState {
  ENTRY = 'ENTRY',
  DASHBOARD = 'DASHBOARD',
  HISTORY = 'HISTORY'
}

export const SNACK_TYPES = [
  "Balaji Wafers",
  "Gutkha",
  "Tambaku Pudi",
  "Chocolates"
];