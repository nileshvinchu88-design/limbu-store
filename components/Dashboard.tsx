import React, { useMemo, useState } from 'react';
import { DailyRecord } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getBusinessInsights } from '../services/geminiService';
import { Sparkles, TrendingUp, DollarSign, Loader2, Wallet, PiggyBank, Cookie } from 'lucide-react';

interface DashboardProps {
  records: DailyRecord[];
}

const Dashboard: React.FC<DashboardProps> = ({ records }) => {
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [insight, setInsight] = useState<string>("");
  const [loadingInsight, setLoadingInsight] = useState<boolean>(false);

  // Filter records by month
  const monthlyData = useMemo(() => {
    return records
      .filter(r => r.date.startsWith(selectedMonth))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(r => ({
        date: new Date(r.date).getDate(), // Just the day number
        fullDate: r.date,
        Revenue: r.totalRevenue,
        Profit: r.netProfit || 0,
        Cost: r.totalCost || 0,
        LemonadeQty: r.lemonadeGlassQty
      }));
  }, [records, selectedMonth]);

  // Aggregate Snack Data
  const snackPerformance = useMemo(() => {
    const monthRecords = records.filter(r => r.date.startsWith(selectedMonth));
    const aggregation: Record<string, { qty: number, revenue: number, cost: number, profit: number }> = {};

    monthRecords.forEach(record => {
      record.snacks.forEach(snack => {
        if (!aggregation[snack.name]) {
          aggregation[snack.name] = { qty: 0, revenue: 0, cost: 0, profit: 0 };
        }
        const buyingPrice = snack.buyingPricePerUnit || 0; // fallback
        const revenue = snack.qty * snack.pricePerUnit;
        const cost = snack.qty * buyingPrice;
        
        aggregation[snack.name].qty += snack.qty;
        aggregation[snack.name].revenue += revenue;
        aggregation[snack.name].cost += cost;
        aggregation[snack.name].profit += (revenue - cost);
      });
    });

    return Object.entries(aggregation).map(([name, data]) => ({ name, ...data }));
  }, [records, selectedMonth]);

  const totalMonthlyRevenue = monthlyData.reduce((acc, curr) => acc + curr.Revenue, 0);
  const totalMonthlyProfit = monthlyData.reduce((acc, curr) => acc + curr.Profit, 0);
  const totalMonthlyCost = monthlyData.reduce((acc, curr) => acc + curr.Cost, 0);

  const fetchInsight = async () => {
    setLoadingInsight(true);
    const result = await getBusinessInsights(records.filter(r => r.date.startsWith(selectedMonth)));
    setInsight(result);
    setLoadingInsight(false);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      
      {/* Controls */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
           <TrendingUp className="text-yellow-600" /> Financial Dashboard
        </h2>
        <input 
          type="month" 
          value={selectedMonth} 
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="border border-gray-300 rounded-lg p-2 text-sm"
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
           <div className="flex justify-between items-start">
              <div>
                <p className="text-green-800 font-medium mb-1 text-sm">Net Sales</p>
                <h3 className="text-3xl font-bold text-green-900">₹{totalMonthlyRevenue.toLocaleString()}</h3>
              </div>
              <DollarSign className="w-8 h-8 text-green-400" />
           </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border border-red-200">
           <div className="flex justify-between items-start">
              <div>
                <p className="text-red-800 font-medium mb-1 text-sm">Total Expense</p>
                <p className="text-xs text-red-600 mb-1">(Inventory + Snacks Cost)</p>
                <h3 className="text-3xl font-bold text-red-900">₹{totalMonthlyCost.toLocaleString()}</h3>
              </div>
              <Wallet className="w-8 h-8 text-red-400" />
           </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl border border-yellow-200">
           <div className="flex justify-between items-start">
              <div>
                <p className="text-yellow-800 font-medium mb-1 text-sm">Net Profit</p>
                <h3 className="text-3xl font-bold text-yellow-900">₹{totalMonthlyProfit.toLocaleString()}</h3>
              </div>
              <PiggyBank className="w-8 h-8 text-yellow-500" />
           </div>
        </div>
      </div>

      {/* Charts */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 h-96">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Net Sales vs Profit Analysis</h3>
        {monthlyData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="date" label={{ value: 'Day', position: 'insideBottom', offset: -5 }} tick={{fill: '#9ca3af'}} />
              <YAxis tick={{fill: '#9ca3af'}} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: number, name: string) => [`₹${value}`, name]}
                labelFormatter={(label) => `Day ${label}`}
              />
              <Legend verticalAlign="top" height={36}/>
              <Bar dataKey="Revenue" fill="#9ca3af" radius={[4, 4, 0, 0]} name="Net Sales" />
              <Bar dataKey="Profit" fill="#16a34a" radius={[4, 4, 0, 0]} name="Net Profit" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">
            No data for selected month.
          </div>
        )}
      </div>
      
      {/* Snack Performance Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
         <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
            <Cookie className="w-5 h-5 text-yellow-700" />
            <h3 className="text-lg font-semibold text-gray-800">Snack Performance ({selectedMonth})</h3>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-100 text-gray-700 uppercase font-semibold text-xs">
                <tr>
                   <th className="px-6 py-3">Item</th>
                   <th className="px-6 py-3 text-right">Qty Sold</th>
                   <th className="px-6 py-3 text-right">Revenue</th>
                   <th className="px-6 py-3 text-right">Cost</th>
                   <th className="px-6 py-3 text-right">Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                 {snackPerformance.length > 0 ? (
                    snackPerformance.map((item) => (
                       <tr key={item.name} className="hover:bg-gray-50">
                          <td className="px-6 py-3 font-medium text-gray-800">{item.name}</td>
                          <td className="px-6 py-3 text-right text-gray-600">{item.qty}</td>
                          <td className="px-6 py-3 text-right text-green-600 font-medium">₹{item.revenue}</td>
                          <td className="px-6 py-3 text-right text-red-500">₹{item.cost}</td>
                          <td className="px-6 py-3 text-right font-bold text-gray-900">₹{item.profit}</td>
                       </tr>
                    ))
                 ) : (
                    <tr>
                       <td colSpan={5} className="px-6 py-4 text-center text-gray-400">No snack sales recorded this month.</td>
                    </tr>
                 )}
              </tbody>
            </table>
         </div>
      </div>

      {/* AI Insights Section */}
      <div className="bg-purple-50 p-6 rounded-xl border border-purple-200 relative overflow-hidden">
        <div className="flex justify-between items-center mb-4 relative z-10">
          <h3 className="text-lg font-semibold text-purple-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" /> AI Business Advisor
          </h3>
          <button 
            onClick={fetchInsight}
            disabled={loadingInsight || monthlyData.length === 0}
            className="text-sm bg-purple-600 text-white px-3 py-1.5 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-all"
          >
            {loadingInsight ? <Loader2 className="w-4 h-4 animate-spin" /> : "Analyze Profitability"}
          </button>
        </div>
        
        <div className="relative z-10 text-purple-800 text-sm leading-relaxed whitespace-pre-line bg-white/50 p-4 rounded-lg">
          {insight ? insight : (monthlyData.length === 0 ? "Add data to get insights." : "Click 'Analyze Profitability' to get actionable business tips powered by Gemini.")}
        </div>
      </div>

    </div>
  );
};

export default Dashboard;