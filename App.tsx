import React, { useState, useEffect } from 'react';
import { ViewState, DailyRecord } from './types';
import EntryForm from './components/EntryForm';
import Dashboard from './components/Dashboard';
import HistoryList from './components/HistoryList';
import { getRecords, saveRecord, deleteRecord } from './services/storageService';
import { LayoutDashboard, PlusCircle, History, Store } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>(ViewState.ENTRY);
  const [records, setRecords] = useState<DailyRecord[]>([]);
  const [editingRecord, setEditingRecord] = useState<DailyRecord | null>(null);

  // Load records on mount
  useEffect(() => {
    setRecords(getRecords());
  }, []);

  const handleSave = (record: DailyRecord) => {
    saveRecord(record);
    setRecords(getRecords()); // Refresh state
    setEditingRecord(null);
    if (editingRecord) {
        setView(ViewState.HISTORY);
    }
  };

  const handleDelete = (id: string) => {
    deleteRecord(id);
    setRecords(getRecords());
  };

  const handleEdit = (record: DailyRecord) => {
    setEditingRecord(record);
    setView(ViewState.ENTRY);
  };

  const renderContent = () => {
    switch (view) {
      case ViewState.ENTRY:
        return <EntryForm onSave={handleSave} existingRecord={editingRecord} />;
      case ViewState.DASHBOARD:
        return <Dashboard records={records} />;
      case ViewState.HISTORY:
        return <HistoryList records={records} onDelete={handleDelete} onEdit={handleEdit} />;
      default:
        return <Dashboard records={records} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#fcf9e8] text-gray-800">
      {/* Header */}
      <header className="bg-yellow-400 shadow-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-white p-2 rounded-full shadow-inner">
               <Store className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
               <h1 className="text-xl font-bold text-yellow-900 leading-tight">LimbuTrack</h1>
               <p className="text-xs text-yellow-800 font-medium">Daily Stall MIS</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {renderContent()}
      </main>

      {/* Bottom Navigation (Mobile First) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe-area shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40">
        <div className="max-w-md mx-auto flex justify-around">
          <button 
            onClick={() => { setView(ViewState.ENTRY); setEditingRecord(null); }}
            className={`flex flex-col items-center p-3 w-full transition-colors ${view === ViewState.ENTRY ? 'text-yellow-600 bg-yellow-50' : 'text-gray-400 hover:text-yellow-500'}`}
          >
            <PlusCircle className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Entry</span>
          </button>
          
          <button 
            onClick={() => setView(ViewState.DASHBOARD)}
            className={`flex flex-col items-center p-3 w-full transition-colors ${view === ViewState.DASHBOARD ? 'text-yellow-600 bg-yellow-50' : 'text-gray-400 hover:text-yellow-500'}`}
          >
            <LayoutDashboard className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Dashboard</span>
          </button>
          
          <button 
            onClick={() => setView(ViewState.HISTORY)}
            className={`flex flex-col items-center p-3 w-full transition-colors ${view === ViewState.HISTORY ? 'text-yellow-600 bg-yellow-50' : 'text-gray-400 hover:text-yellow-500'}`}
          >
            <History className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">History</span>
          </button>
        </div>
      </nav>
      {/* Spacer for bottom nav */}
      <div className="h-20"></div>
    </div>
  );
};

export default App;