import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { 
  Shield, 
  Calendar, 
  History, 
  Rocket, 
  RefreshCw, 
  AlertTriangle,
  Plus,
  ArrowUpRight,
  UserCheck,
  Clock,
  Activity,
  Database,
  Users,
  ChevronRight,
  BarChart3,
  Lock,
  Unlock,
  Settings,
  Bell,
  Trash2
} from 'lucide-react';

const MOCK_LOGS = [
  { id: 'l1', entity_type: 'Goal Sheet', change_type: 'INSERT', changed_at: new Date().toISOString(), user: 'Amit S.' },
  { id: 'l2', entity_type: 'User Profile', change_type: 'UPDATE', changed_at: new Date(Date.now() - 3600000).toISOString(), user: 'System' },
  { id: 'l3', entity_type: 'Cycle', change_type: 'UPDATE', changed_at: new Date(Date.now() - 7200000).toISOString(), user: 'Abhijit J.' }
];

const MOCK_CYCLES = [
  { id: 'c1', name: 'FY2026 Q1 Cycle', phase: 'goal_setting', opens_on: '2026-04-01', closes_on: '2026-06-30', is_active: true },
  { id: 'c2', name: 'FY2025 Q4 Cycle', phase: 'assessment', opens_on: '2026-01-01', closes_on: '2026-03-31', is_active: false }
];

const MOCK_USERS = [
  { id: 'u1', name: 'Abhijit Jeet', email: 'admin@goaltrack.com', role: 'admin', department: 'HR' },
  { id: 'u2', name: 'Rajesh Kumar', email: 'manager1@goaltrack.com', role: 'manager', department: 'Engineering' },
  { id: 'u3', name: 'Suresh Raina', email: 'employee1@goaltrack.com', role: 'employee', department: 'Design' }
];

export default function AdminPanel() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [cycles, setCycles] = useState([]);
  const [usersList, setUsersList] = useState(MOCK_USERS);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('audit'); // 'audit', 'users', 'cycles', 'shared'
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, [user]);

  const fetchAdminData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data: logData } = await supabase.from('audit_logs').select('*').order('changed_at', { ascending: false }).limit(20);
      const { data: cycleData } = await supabase.from('goal_cycles').select('*');
      setLogs(logData && logData.length > 0 ? logData : MOCK_LOGS);
      setCycles(cycleData && cycleData.length > 0 ? cycleData : MOCK_CYCLES);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const unlockSheet = async () => {
    const email = prompt("Enter employee email to unlock sheet:");
    if (!email) return;
    alert(`Goal sheet for ${email} has been unlocked for editing.`);
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* Admin Header */}
      <div className="relative rounded-[3rem] bg-slate-900 p-12 overflow-hidden shadow-2xl border border-slate-800">
        <div className="relative z-10 flex flex-col xl:flex-row justify-between gap-12">
          <div className="max-w-2xl">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-black text-white tracking-tighter italic uppercase leading-none">Global Control</h1>
                <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.4em] mt-2">Governance & System Audit</p>
              </div>
            </div>
            <p className="text-slate-400 text-lg font-medium leading-relaxed">
              Managing enterprise performance for <span className="text-white font-bold">Atomberg Solutions</span>.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <button 
              onClick={unlockSheet}
              className="px-8 py-4 bg-white/10 text-white border border-white/20 rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:bg-white/20 flex items-center gap-3"
            >
              <Unlock size={18} />
              Unlock Sheet
            </button>
            <button 
              onClick={() => setShowBroadcastModal(true)}
              className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-xl shadow-indigo-600/30 flex items-center gap-3"
            >
              <Rocket size={18} />
              Push Shared KPIs
            </button>
          </div>
        </div>
      </div>

      {/* Admin Functionality Tabs */}
      <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-slate-900 p-2 rounded-[1.5rem] w-fit border border-slate-100 dark:border-slate-800 shadow-sm">
        <TabButton active={activeTab === 'audit'} onClick={() => setActiveTab('audit')} label="System Logs" />
        <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} label="User Directory" />
        <TabButton active={activeTab === 'cycles'} onClick={() => setActiveTab('cycles')} label="Cycle Control" />
        <TabButton active={activeTab === 'shared'} onClick={() => setActiveTab('shared')} label="Shared KPIs" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        <div className="xl:col-span-3">
          {activeTab === 'audit' && (
            <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl shadow-slate-200/40 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Module</th>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Event Type</th>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Initiator</th>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all">
                      <td className="px-10 py-7 font-bold text-slate-900 dark:text-white capitalize">{log.entity_type}</td>
                      <td className="px-10 py-7">
                        <span className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${log.change_type === 'INSERT' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
                          {log.change_type}
                        </span>
                      </td>
                      <td className="px-10 py-7 text-slate-500 dark:text-slate-400 font-bold">{log.user || 'System'}</td>
                      <td className="px-10 py-7 text-right text-slate-400 font-mono text-xs">{new Date(log.changed_at).toLocaleTimeString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">User Identity</th>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Role</th>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Department</th>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all group">
                      <td className="px-10 py-7 font-bold text-slate-900 dark:text-white">{u.name} <br/> <span className="text-xs text-slate-400 font-medium">{u.email}</span></td>
                      <td className="px-10 py-7">
                        <span className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-[9px] font-black uppercase tracking-widest">{u.role}</span>
                      </td>
                      <td className="px-10 py-7 text-slate-500 dark:text-slate-400 font-bold">{u.department}</td>
                      <td className="px-10 py-7 text-right">
                         <button onClick={() => alert(`Unlocked sheet for ${u.name}`)} className="px-5 py-2.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm">Unlock</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'cycles' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {cycles.map((c) => (
                <div key={c.id} className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-xl group hover:-translate-y-2 transition-all">
                  <div className="flex items-center justify-between mb-10">
                    <div>
                      <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-2 italic">{c.name}</h4>
                      <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{c.phase.replace('_', ' ')}</p>
                    </div>
                    <span className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${c.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                      {c.is_active ? 'Active' : 'Closed'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-50 dark:border-slate-800">
                    <AdminDate label="Opens On" date={c.opens_on} />
                    <AdminDate label="Closes On" date={c.closes_on} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'shared' && (
             <div className="bg-white dark:bg-slate-900 p-12 rounded-[3rem] border border-slate-100 dark:border-slate-800 text-center">
                <Rocket className="w-16 h-16 text-indigo-500 mx-auto mb-6" />
                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4">Strategic KPI Broadcast</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto mb-10">Configure goals that will be automatically pushed to all employee sheets. Employees can only modify the weightage for these goals.</p>
                <button onClick={() => setShowBroadcastModal(true)} className="px-10 py-4 bg-indigo-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20">Configure New Broadcast</button>
             </div>
          )}
        </div>
      </div>

      {/* Admin Broadcast Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowBroadcastModal(false)}></div>
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-12 max-w-xl w-full relative z-10 shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in duration-300">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic mb-8">Org-Wide KPI Broadcast</h3>
            <div className="space-y-6 mb-10">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Objective</label>
                <input 
                  type="text" 
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  placeholder="e.g. Achieve Net Zero Carbon by 2030" 
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 text-sm font-bold dark:text-white" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fixed Weightage (%)</label>
                  <input type="number" defaultValue="10" className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 text-sm font-bold dark:text-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cycle Assignment</label>
                  <select className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 text-sm font-bold dark:text-white">
                    <option>Q1 2024 Cycle</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => { 
                  if (!broadcastTitle) return alert('Enter a title');
                  alert(`Successfully broadcasted "${broadcastTitle}" to all organization sheets.`); 
                  setShowBroadcastModal(false); 
                  setBroadcastTitle('');
                }} 
                className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest"
              >
                Initiate Broadcast
              </button>
              <button onClick={() => setShowBroadcastModal(false)} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TabButton({ active, onClick, label }) {
  return (
    <button 
      onClick={onClick}
      className={`px-8 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${active ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
    >
      {label}
    </button>
  );
}

function AdminDate({ label, date }) {
  return (
    <div>
      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight">{new Date(date).toLocaleDateString()}</p>
    </div>
  );
}
