import React from 'react';
import { DailyRecord } from '../types';
import { Trash2, Edit2 } from 'lucide-react';

interface HistoryListProps {
  records: DailyRecord[];
  onDelete: (id: string) => void;
  onEdit: (record: DailyRecord) => void;
}

const HistoryList: React.FC<HistoryListProps> = ({ records, onDelete, onEdit }) => {
  // Sort by date descending
  const sortedRecords = [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (sortedRecords.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
        <p className="text-gray-400">No records found. Start adding daily entries.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-gray-900 uppercase font-semibold">
            <tr>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Sales Breakdown</th>
              <th className="px-6 py-4">Expenses (Cost)</th>
              <th className="px-6 py-4">Financials</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sortedRecords.map((record) => (
              <tr key={record.id} className="hover:bg-yellow-50/50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap align-top">
                  {new Date(record.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 align-top">
                   <div className="mb-1"><strong>Limbu:</strong> {record.lemonadeGlassQty} @ ₹{record.lemonadeRatePerGlass}</div>
                   <div className="text-xs text-gray-500">
                     {record.snacks.length > 0 ? record.snacks.map((s, i) => (
                       <span key={i} className="mr-2">
                         {s.name} x{s.qty}
                       </span>
                     )) : <span>No Snacks</span>}
                   </div>
                </td>
                <td className="px-6 py-4 text-xs align-top">
                  <div className="flex flex-col gap-1">
                    <span>🍋 {record.lemonsUsedQty} pcs (₹{record.lemonPricePerUnit || '?'})</span>
                    <span>🧊 {record.iceUsedKg} kg (₹{record.icePricePerKg || '?'})</span>
                    {record.sugarUsedKg ? <span>🍬 {record.sugarUsedKg} kg (₹{record.sugarPricePerKg})</span> : null}
                    <div className="font-bold text-red-500 mt-1 border-t border-gray-200 pt-1">
                      Total Cost: ₹{record.totalCost || 0}
                      <span className="text-[10px] text-gray-400 block font-normal">(Incl. Snack Purchase)</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 align-top">
                  <div className="flex flex-col">
                    <span className="text-gray-500 text-xs">Net Sales: ₹{record.totalRevenue}</span>
                    <span className="text-xl font-bold text-green-600">
                      ₹{record.netProfit !== undefined ? record.netProfit : (record.totalRevenue - (record.totalCost || 0))}
                    </span>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider">Net Profit</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right align-top">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => onEdit(record)}
                      className="p-1.5 hover:bg-blue-50 text-blue-600 rounded transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => {
                        if(confirm('Are you sure you want to delete this record?')) onDelete(record.id)
                      }}
                      className="p-1.5 hover:bg-red-50 text-red-600 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HistoryList;