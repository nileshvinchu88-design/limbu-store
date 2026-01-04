import React, { useState, useEffect } from 'react';
import { DailyRecord, SNACK_TYPES, SnackItem } from '../types';
import { Plus, Save } from 'lucide-react';

interface EntryFormProps {
  onSave: (record: DailyRecord) => void;
  existingRecord?: DailyRecord | null;
}

const EntryForm: React.FC<EntryFormProps> = ({ onSave, existingRecord }) => {
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  // Lemonade Sales
  const [lemonadeQty, setLemonadeQty] = useState<number>(0);
  const [lemonadeRate, setLemonadeRate] = useState<number>(20);
  
  // Inventory Inputs
  const [lemonsUsed, setLemonsUsed] = useState<number>(0);
  const [lemonPrice, setLemonPrice] = useState<number>(5); 

  const [iceUsed, setIceUsed] = useState<number>(0);
  const [icePrice, setIcePrice] = useState<number>(20); 

  const [sugarUsed, setSugarUsed] = useState<number>(0);
  const [sugarPrice, setSugarPrice] = useState<number>(40); 

  // Snacks State
  const [snacks, setSnacks] = useState<SnackItem[]>(
    SNACK_TYPES.map(name => ({ name, qty: 0, buyingPricePerUnit: 0, pricePerUnit: 10 }))
  );

  useEffect(() => {
    if (existingRecord) {
      setDate(existingRecord.date);
      setLemonadeQty(existingRecord.lemonadeGlassQty);
      setLemonadeRate(existingRecord.lemonadeRatePerGlass);
      
      setLemonsUsed(existingRecord.lemonsUsedQty);
      setLemonPrice(existingRecord.lemonPricePerUnit || 5);
      
      setIceUsed(existingRecord.iceUsedKg);
      setIcePrice(existingRecord.icePricePerKg || 20);

      setSugarUsed(existingRecord.sugarUsedKg || 0);
      setSugarPrice(existingRecord.sugarPricePerKg || 40);
      
      const mergedSnacks = SNACK_TYPES.map(type => {
        const found = existingRecord.snacks.find(s => s.name === type);
        // Default buying price to slightly less than selling if not found, or 0
        return found 
          ? { ...found, buyingPricePerUnit: found.buyingPricePerUnit ?? 0 } 
          : { name: type, qty: 0, buyingPricePerUnit: 5, pricePerUnit: 10 };
      });
      setSnacks(mergedSnacks);
    }
  }, [existingRecord]);

  const handleSnackChange = (index: number, field: keyof SnackItem, value: number) => {
    const newSnacks = [...snacks];
    // @ts-ignore
    newSnacks[index][field] = value;
    setSnacks(newSnacks);
  };

  const calculateFinancials = () => {
    // Revenue
    const limbuRevenue = lemonadeQty * lemonadeRate;
    const snacksRevenue = snacks.reduce((acc, s) => acc + (s.qty * s.pricePerUnit), 0);
    const totalRevenue = limbuRevenue + snacksRevenue;

    // Costs
    const lemonCost = lemonsUsed * lemonPrice;
    const iceCost = iceUsed * icePrice;
    const sugarCost = sugarUsed * sugarPrice;
    const snacksCost = snacks.reduce((acc, s) => acc + (s.qty * s.buyingPricePerUnit), 0);
    
    const totalCost = lemonCost + iceCost + sugarCost + snacksCost;

    return {
      totalRevenue,
      totalCost,
      netProfit: totalRevenue - totalCost
    };
  };

  const { totalRevenue, totalCost, netProfit } = calculateFinancials();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const record: DailyRecord = {
      id: existingRecord?.id || crypto.randomUUID(),
      date,
      lemonadeGlassQty: lemonadeQty,
      lemonadeRatePerGlass: lemonadeRate,
      
      lemonsUsedQty: lemonsUsed,
      lemonPricePerUnit: lemonPrice,
      
      iceUsedKg: iceUsed,
      icePricePerKg: icePrice,
      
      sugarUsedKg: sugarUsed,
      sugarPricePerKg: sugarPrice,
      
      snacks: snacks.filter(s => s.qty > 0),
      
      totalRevenue,
      totalCost,
      netProfit
    };
    onSave(record);
    if (!existingRecord) {
       // Reset fields
       setLemonadeQty(0);
       setLemonsUsed(0);
       setIceUsed(0);
       setSugarUsed(0);
       setSnacks(SNACK_TYPES.map(name => ({ name, qty: 0, buyingPricePerUnit: 5, pricePerUnit: 10 })));
       alert("Entry Saved Successfully!");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-xl p-6 max-w-2xl mx-auto border border-yellow-200">
      <h2 className="text-2xl font-bold text-yellow-700 mb-6 flex items-center gap-2">
        <Plus className="w-6 h-6" /> Daily Entry
      </h2>

      {/* Date */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
        <input 
          type="date" 
          value={date} 
          onChange={(e) => setDate(e.target.value)}
          className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-yellow-500 focus:border-yellow-500 p-2 border"
          required
        />
      </div>

      {/* Lemonade Sales */}
      <div className="bg-yellow-50 p-4 rounded-lg mb-6 border border-yellow-100">
        <h3 className="text-lg font-semibold text-yellow-800 mb-4 border-b border-yellow-200 pb-2">🍋 Limbu Sarbat Sales</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Sold Qty (Glasses)</label>
            <input 
              type="number" min="0" 
              value={lemonadeQty} 
              onChange={(e) => setLemonadeQty(Number(e.target.value))}
              className="w-full border-gray-300 rounded-md p-2 border focus:ring-yellow-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Price Per Glass (₹)</label>
            <input 
              type="number" min="0" 
              value={lemonadeRate} 
              onChange={(e) => setLemonadeRate(Number(e.target.value))}
              className="w-full border-gray-300 rounded-md p-2 border focus:ring-yellow-500"
            />
          </div>
        </div>
      </div>

      {/* Inventory & Costs */}
      <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-100">
        <h3 className="text-lg font-semibold text-blue-800 mb-4 border-b border-blue-200 pb-2">📦 Inventory Used & Cost</h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-6">
          {/* Lemons */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-600">Lemons Used (Qty)</label>
            <input 
              type="number" min="0" 
              value={lemonsUsed} 
              onChange={(e) => setLemonsUsed(Number(e.target.value))}
              className="w-full border-gray-300 rounded-md p-2 border focus:ring-blue-500"
              placeholder="Qty"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-600">Lemon Price (₹/pc)</label>
            <input 
              type="number" min="0" 
              value={lemonPrice} 
              onChange={(e) => setLemonPrice(Number(e.target.value))}
              className="w-full border-gray-300 rounded-md p-2 border focus:ring-blue-500"
              placeholder="₹ Rate"
            />
          </div>

          {/* Ice */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-600">Ice Used (Kg)</label>
            <input 
              type="number" min="0" 
              value={iceUsed} 
              onChange={(e) => setIceUsed(Number(e.target.value))}
              className="w-full border-gray-300 rounded-md p-2 border focus:ring-blue-500"
              placeholder="Kg"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-600">Ice Price (₹/kg)</label>
            <input 
              type="number" min="0" 
              value={icePrice} 
              onChange={(e) => setIcePrice(Number(e.target.value))}
              className="w-full border-gray-300 rounded-md p-2 border focus:ring-blue-500"
              placeholder="₹ Rate"
            />
          </div>

          {/* Sugar */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-600">Sugar Used (Kg)</label>
            <input 
              type="number" min="0" step="0.1"
              value={sugarUsed} 
              onChange={(e) => setSugarUsed(Number(e.target.value))}
              className="w-full border-gray-300 rounded-md p-2 border focus:ring-blue-500"
              placeholder="Kg"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-600">Sugar Price (₹/kg)</label>
            <input 
              type="number" min="0" 
              value={sugarPrice} 
              onChange={(e) => setSugarPrice(Number(e.target.value))}
              className="w-full border-gray-300 rounded-md p-2 border focus:ring-blue-500"
              placeholder="₹ Rate"
            />
          </div>
        </div>
      </div>

      {/* Snacks Section */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b border-gray-200 pb-2">🍪 Snacks</h3>
        <div className="space-y-4">
          {snacks.map((snack, idx) => (
            <div key={snack.name} className="flex flex-col gap-2 pb-3 border-b border-gray-100 last:border-0">
              <span className="font-medium text-gray-700 text-sm">{snack.name}</span>
              <div className="flex gap-2">
                 <div className="w-16">
                    <label className="text-[10px] text-gray-500 block">Qty</label>
                    <input 
                      type="number" min="0"
                      value={snack.qty} 
                      onChange={(e) => handleSnackChange(idx, 'qty', Number(e.target.value))}
                      className="w-full border-gray-300 rounded-md p-1.5 border text-sm"
                    />
                 </div>
                 <div className="flex-1">
                    <label className="text-[10px] text-gray-500 block">Buy Price (₹)</label>
                    <input 
                      type="number" min="0"
                      value={snack.buyingPricePerUnit} 
                      onChange={(e) => handleSnackChange(idx, 'buyingPricePerUnit', Number(e.target.value))}
                      className="w-full border-gray-300 rounded-md p-1.5 border text-sm bg-red-50 focus:ring-red-500"
                      placeholder="Cost"
                    />
                 </div>
                 <div className="flex-1">
                    <label className="text-[10px] text-gray-500 block">Sell Price (₹)</label>
                    <input 
                      type="number" min="0"
                      value={snack.pricePerUnit} 
                      onChange={(e) => handleSnackChange(idx, 'pricePerUnit', Number(e.target.value))}
                      className="w-full border-gray-300 rounded-md p-1.5 border text-sm bg-green-50 focus:ring-green-500"
                      placeholder="Sell"
                    />
                 </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Footer */}
      <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 space-y-2 mb-6">
          <div className="flex justify-between text-sm">
             <span className="text-gray-600">Net Sales:</span>
             <span className="font-semibold text-gray-800">₹{totalRevenue}</span>
          </div>
          <div className="flex justify-between text-sm">
             <span className="text-gray-600">Total Cost (Materials + Snacks):</span>
             <span className="font-semibold text-red-600">- ₹{totalCost}</span>
          </div>
          <div className="flex justify-between text-lg pt-2 border-t border-yellow-200">
             <span className="font-bold text-yellow-900">Net Profit:</span>
             <span className={`font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>₹{netProfit}</span>
          </div>
      </div>

      <button 
        type="submit" 
        className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-3 rounded-xl font-semibold shadow-md transition-colors flex justify-center items-center gap-2"
      >
        <Save className="w-5 h-5" />
        Save Daily Record
      </button>
    </form>
  );
};

export default EntryForm;