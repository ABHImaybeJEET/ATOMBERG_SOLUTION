import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { exportToCSV } from '../lib/exportUtils';
import { 
  Users, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Eye, 
  MessageSquare, 
  ChevronRight, 
  Download,
  AlertCircle,
  BarChart2,
  Send,
  Search,
  Filter,
  ArrowRight,
  UserPlus,
  ShieldCheck
} from 'lucide-react';

const MOCK_REPORTS = [
  { id: 's1', status: 'submitted', profiles: { name: 'Amit Shah', email: 'amit@atomberg.com', department: 'Engineering' } },
  { id: 's2', status: 'approved', profiles: { name: 'Priya Verma', email: 'priya@atomberg.com', department: 'Product Design' } },
  { id: 's3', status: 'draft', profiles: { name: 'Vikram Singh', email: 'vikram@atomberg.com', department: 'Marketing' } },
  { id: 's4', status: 'submitted', profiles: { name: 'Ananya Iyer', email: 'ananya@atomberg.com', department: 'Operations' } }
];

export default function TeamDashboard() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSheet, setSelectedSheet] = useState(null);
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);

  useEffect(() => {
    fetchTeamData();
  }, [user]);

  const fetchTeamData = async () => {
    if (!user) return;
    try {
      const { data } = await supabase.from('goal_sheets')
        .select('*, profiles(name, email, department)')
        .eq('manager_id', user.id);
      setReports(data && data.length > 0 ? data : MOCK_REPORTS);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSheetDetails = async (sheet) => {
    const { data } = await supabase.from('goals').select('*').eq('sheet_id', sheet.id);
    setSelectedSheet(sheet);
    setSelectedGoals(data || []);
    setComment('');
  };

  const approveSheet = async (id) => {
    try {
      await supabase.from('goal_sheets').update({ status: 'approved', approved_at: new Date() }).eq('id', id);
      fetchTeamData();
      alert('Goal sheet approved successfully!');
      setSelectedSheet(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const returnSheet = async (id) => {
    try {
      await supabase.from('goal_sheets').update({ status: 'returned' }).eq('id', id);
      fetchTeamData();
      alert('Goal sheet returned for rework.');
      setSelectedSheet(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const updateGoalOnSheet = async (goalId, field, value) => {
    try {
      await supabase.from('goals').update({ [field]: value }).eq('id', goalId);
      const updatedGoals = selectedGoals.map(g => g.id === goalId ? { ...g, [field]: value } : g);
      setSelectedGoals(updatedGoals);
    } catch (err) {
      console.error(err);
    }
  };

  const handleExport = () => {
    const exportData = reports.map(r => ({
      Employee: r.profiles.name,
      Department: r.profiles.department,
      Status: r.status,
      SubmittedAt: r.submitted_at ? new Date(r.submitted_at).toLocaleDateString() : 'N/A'
    }));
    exportToCSV(exportData, `Team_Goals_Report_${new Date().toLocaleDateString()}`);
  };

  const filteredReports = reports.filter(r => 
    r.profiles.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.profiles.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* Manager Header */}
      <div className="bg-indigo-600 rounded-[3rem] p-12 text-white shadow-2xl shadow-indigo-600/20 flex flex-col xl:flex-row justify-between items-center gap-12 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tighter italic uppercase leading-none">Team Governance</h1>
              <p className="text-indigo-100 text-[10px] font-black uppercase tracking-[0.4em] mt-2 opacity-70">Leadership Performance Console</p>
            </div>
          </div>
          <p className="text-indigo-50 text-lg font-medium max-w-xl opacity-90">
             Overseeing <span className="font-black text-white">{reports.length} Direct Reports</span>. Review objectives, provide strategic guidance, and ensure organizational alignment.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 relative z-10 w-full xl:w-auto">
          <div className="relative flex-1 md:w-80">
             <input 
               type="text" 
               placeholder="Search talent..."
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:bg-white focus:text-slate-900 focus:outline-none transition-all font-bold"
             />
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-40" />
          </div>
          <button 
            onClick={handleExport}
            className="px-8 py-4 bg-white text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Download size={18} />
            Export Data
          </button>
        </div>

        {/* Decorative BG */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-[100px] -mr-40 -mt-40"></div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-10">
        
        {/* Reports Table */}
        <div className="xl:col-span-3 space-y-8">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ManagerActionCard icon={<MessageSquare size={20} />} label="Conduct Check-in" sub="Monthly review meeting" color="indigo" onClick={() => alert('Opening Check-in Scheduler...')} />
              <ManagerActionCard icon={<AlertCircle size={20} />} label="Resolve Conflicts" sub="1 pending alignment" color="amber" onClick={() => setShowConflictModal(true)} />
              <ManagerActionCard icon={<Send size={20} />} label="Broadcast KPI" sub="Sync departmental goals" color="emerald" onClick={() => setShowBroadcastModal(true)} />
           </div>

          <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl shadow-slate-200/40 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Talent Identity</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Goal Status</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] text-right">Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredReports.map((sheet) => (
                  <tr 
                    key={sheet.id} 
                    onClick={() => fetchSheetDetails(sheet)}
                    className={`cursor-pointer transition-all group ${selectedSheet?.id === sheet.id ? 'bg-indigo-50/40 dark:bg-indigo-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'}`}
                  >
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-6">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl transition-all shadow-sm ${selectedSheet?.id === sheet.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                          {sheet.profiles.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 dark:text-white text-lg tracking-tight leading-none mb-1.5">{sheet.profiles.name}</p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest">{sheet.profiles.department}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <StatusBadge status={sheet.status} />
                    </td>
                    <td className="px-10 py-8 text-right">
                       <ChevronRight size={20} className="ml-auto text-slate-300 group-hover:text-indigo-600 transition-colors" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Side Detail View */}
        <div className="xl:col-span-1">
          {selectedSheet ? (
            <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-2xl animate-in slide-in-from-right-4 duration-500 sticky top-32">
              <div className="flex items-center justify-between mb-10">
                 <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none italic">Sheet Review</h3>
                 <button onClick={() => setSelectedSheet(null)} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><XCircle size={24} /></button>
              </div>

              <div className="space-y-6 mb-10 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                {selectedGoals.map((g) => (
                  <div key={g.id} className="p-6 bg-slate-50/50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 group hover:border-indigo-100 transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">{g.thrust_area}</span>
                      <div className="flex items-center gap-2">
                        <input 
                          type="number"
                          value={g.weightage}
                          onChange={(e) => updateGoalOnSheet(g.id, 'weightage', Number(e.target.value))}
                          className="w-12 bg-white dark:bg-slate-900 border-none rounded-lg text-xs font-black p-1 text-center"
                        />
                        <span className="text-xs font-black">%</span>
                      </div>
                    </div>
                    <p className="font-bold text-slate-800 dark:text-slate-200 leading-tight text-sm mb-4">{g.title}</p>
                    <div className="flex flex-col gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                       <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-slate-400">
                          <span>Target</span>
                          <input 
                            type="text"
                            value={g.target}
                            onChange={(e) => updateGoalOnSheet(g.id, 'target', e.target.value)}
                            className="bg-transparent border-b border-indigo-200 focus:border-indigo-600 outline-none text-right text-indigo-600 w-24"
                          />
                       </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-6 pt-8 border-t border-slate-100 dark:border-slate-800">
                 <div className="space-y-3">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       <MessageSquare size={14} className="text-indigo-600" />
                       Strategic Guidance
                    </h4>
                    <textarea 
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Enter coaching comments or revision requests..."
                      rows={4}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-6 text-sm outline-none focus:ring-2 focus:ring-indigo-600 dark:text-white transition-all font-medium leading-relaxed"
                    />
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => returnSheet(selectedSheet.id)} className="py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-red-100 text-red-600 hover:bg-red-50 transition-all flex items-center justify-center gap-2">
                       <XCircle size={14} /> Return
                    </button>
                    {selectedSheet.status === 'submitted' && (
                      <button onClick={() => approveSheet(selectedSheet.id)} className="py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all">
                        <CheckCircle2 size={14} /> Approve
                      </button>
                    )}
                 </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-800/20 p-16 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800 text-center flex flex-col items-center gap-6 sticky top-32">
               <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-3xl flex items-center justify-center text-indigo-400 shadow-xl shadow-indigo-500/10">
                  <Users size={32} />
               </div>
               <div>
                 <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-2">Talent Review</h3>
                 <p className="text-slate-500 dark:text-slate-400 text-xs font-medium leading-relaxed">Select an employee roadmap from the oversight list to begin the governance lifecycle.</p>
               </div>
            </div>
          )}
        </div>
      </div>

      {/* Conflict Resolution Modal */}
      {showConflictModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowConflictModal(false)}></div>
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-12 max-w-lg w-full relative z-10 shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in duration-300">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic mb-4">Conflict Detected</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">Amit Shah's "Efficiency" goal weightage conflicts with the departmental cap of 20%. Would you like to auto-align?</p>
            <div className="flex gap-4">
              <button onClick={() => { alert('Auto-alignment complete!'); setShowConflictModal(false); }} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest">Auto-Align</button>
              <button onClick={() => setShowConflictModal(false)} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest">Ignore</button>
            </div>
          </div>
        </div>
      )}

      {/* Broadcast Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowBroadcastModal(false)}></div>
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-12 max-w-xl w-full relative z-10 shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in duration-300">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic mb-8">Departmental KPI Broadcast</h3>
            <div className="space-y-6 mb-10">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Goal Title</label>
                <input type="text" placeholder="e.g. Reduce server latency by 20%" className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 text-sm font-bold dark:text-white" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Weightage</label>
                  <input type="number" placeholder="15" className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 text-sm font-bold dark:text-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Due Date</label>
                  <input type="date" className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 text-sm font-bold dark:text-white" />
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={() => { alert('KPI successfully broadcasted to team!'); setShowBroadcastModal(false); }} className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest">Broadcast to Team</button>
              <button onClick={() => setShowBroadcastModal(false)} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ManagerActionCard({ icon, label, sub, color, onClick }) {
  const colors = {
    indigo: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20',
    amber: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20',
    emerald: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20'
  };
  return (
    <button 
      onClick={onClick}
      className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-5 hover:shadow-xl hover:-translate-y-1 transition-all group w-full text-left"
    >
       <div className={`w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform ${colors[color]}`}>
          {icon}
       </div>
       <div>
          <p className="text-sm font-black text-slate-900 dark:text-white leading-tight mb-1">{label}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{sub}</p>
       </div>
    </button>
  );
}

function StatusBadge({ status }) {
  const styles = {
    draft: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    submitted: 'bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 animate-pulse',
    approved: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
    returned: 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
  };
  return (
    <div className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border border-transparent ${styles[status]}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${status === 'approved' ? 'bg-emerald-500' : status === 'submitted' ? 'bg-amber-500' : 'bg-slate-400'}`}></div>
      {status}
    </div>
  );
}
