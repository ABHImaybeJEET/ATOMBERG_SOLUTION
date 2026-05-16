import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import GoalForm from '../components/GoalForm';
import Analytics from '../components/Analytics';
import { 
  Target, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  BarChart3,
  ChevronRight,
  Plus,
  RefreshCw,
  Zap,
  LayoutDashboard,
  Trophy,
  ArrowRight
} from 'lucide-react';

const MOCK_GOALS = [
  { id: 'm1', thrust_area: 'Product Innovation', title: 'Launch GoalTrack v2.0', description: 'Complete the enterprise UI overhaul with dark mode support.', uom: 'Timeline', target: 'June 30', weightage: 30, status: 'approved' },
  { id: 'm2', thrust_area: 'Operational Excellence', title: 'Optimize Build Pipeline', description: 'Reduce Vite build times by 40% using specialized caching.', uom: 'Percentage', target: '40%', weightage: 20, status: 'approved' },
  { id: 'm3', thrust_area: 'Customer Success', title: 'Client Onboarding', description: 'Successfully transition 5 major accounts to the new portal.', uom: 'Numeric', target: '5 Accounts', weightage: 50, status: 'approved' }
];

export default function Dashboard() {
  const { user } = useAuth();
  const [activeCycle, setActiveCycle] = useState(null);
  const [goalSheet, setGoalSheet] = useState(null);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [view, setView] = useState('overview'); // 'overview' or 'tracking'

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;
    try {
      if (!refreshing) setLoading(true);
      
      const { data: cycle } = await supabase.from('goal_cycles').select('*').eq('is_active', true).single();
      setActiveCycle(cycle || { name: 'FY2026 Q1 Cycle', id: 'c1' });

      const { data: sheet } = await supabase.from('goal_sheets')
        .select('*')
        .eq('employee_id', user.id)
        .eq('cycle_id', (cycle || {id: 'c1'}).id)
        .maybeSingle();
      
      setGoalSheet(sheet);

      if (sheet) {
        const { data: goalData } = await supabase.from('goals')
          .select('*')
          .eq('sheet_id', sheet.id);
        setGoals(goalData && goalData.length > 0 ? goalData : MOCK_GOALS);
      } else {
        setGoals(MOCK_GOALS);
      }
    } catch (err) {
      console.error(err);
      setGoals(MOCK_GOALS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  if (loading && !refreshing) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-slate-400 font-black text-xs uppercase tracking-widest animate-pulse">Initializing Portal...</p>
    </div>
  );

  const totalWeightage = goals.reduce((sum, g) => sum + (Number(g.weightage) || 0), 0);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* Employee Greeting Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase">
            My Workspace
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg font-medium flex items-center gap-2">
            Performance Track: <span className="text-indigo-600 dark:text-indigo-400 font-black">{activeCycle?.name}</span>
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-[1.25rem] border border-slate-100 dark:border-slate-800 shadow-sm">
            <NavButton active={view === 'overview'} onClick={() => setView('overview')} label="Objectives" />
            <NavButton active={view === 'tracking'} onClick={() => setView('tracking')} label="Track Progress" />
          </div>
          <button 
            onClick={handleRefresh}
            className={`p-4 bg-white dark:bg-slate-900 text-slate-400 hover:text-indigo-600 rounded-2xl border border-slate-100 dark:border-slate-800 transition-all ${refreshing ? 'animate-spin text-indigo-600' : ''}`}
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      {/* High-Impact KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <KPIItem title="Active Goals" value={goals.length} sub="Strategic Objectives" icon={<Target className="text-indigo-500" />} />
        <KPIItem title="Total Weight" value={`${totalWeightage}%`} sub="Targeting 100%" icon={<BarChart3 className="text-emerald-500" />} highlight={totalWeightage !== 100} />
        <KPIItem title="Sheet Status" value={goalSheet?.status || 'Active'} sub="Workflow Stage" icon={<Clock className="text-amber-500" />} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
        <div className="xl:col-span-2 space-y-10">
          {view === 'overview' ? (
            (!goalSheet || goalSheet.status === 'draft' || goalSheet.status === 'returned') ? (
              <GoalForm 
                cycleId={activeCycle?.id} 
                existingGoals={goals} 
                onGoalAdded={fetchDashboardData} 
              />
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl shadow-slate-200/40 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden">
                <div className="p-10 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex flex-col md:flex-row justify-between items-center gap-6">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Locked Roadmap</h2>
                    <p className="text-[10px] text-slate-400 font-black mt-2 uppercase tracking-[0.3em]">Approved Objectives for {activeCycle?.name}</p>
                  </div>
                  <div className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest border ${goalSheet.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
                    {goalSheet.status || 'Active'}
                  </div>
                </div>
                <div className="divide-y divide-slate-50 dark:divide-slate-800">
                  {goals.map((g, i) => (
                    <div key={i} className="p-10 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all group">
                      <div className="flex justify-between items-start mb-6">
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{g.thrust_area}</span>
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight group-hover:translate-x-1 transition-transform">{g.title}</h3>
                        </div>
                        <div className="text-right">
                          <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{g.weightage}%</p>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-2">Weight</p>
                        </div>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm max-w-2xl font-medium">{g.description}</p>
                      
                      <div className="mt-8 flex flex-wrap gap-4">
                        <ObjectiveBadge label="UoM" value={g.uom} />
                        <ObjectiveBadge label="Target" value={g.target} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          ) : (
            <EmployeeAchievement goals={goals} goalSheet={goalSheet} onUpdate={fetchDashboardData} />
          )}
        </div>

        {/* Sidebar Insights */}
        <div className="space-y-10">
          <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl border border-slate-800 relative overflow-hidden group">
            <h3 className="text-xl font-black mb-10 flex items-center gap-3 tracking-tighter uppercase relative z-10 italic">
              <Trophy className="w-5 h-5 text-indigo-400" />
              Impact Feed
            </h3>
            <div className="space-y-8 relative z-10">
              <InsightRow title="Strategic Alignment" value="Excellent" color="text-emerald-400" />
              <InsightRow title="Quarter Completion" value="84%" color="text-indigo-400" />
              <InsightRow title="Peer Recognition" value="+12" color="text-amber-400" />
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600 rounded-full blur-[100px] opacity-10 -mr-20 -mt-20 group-hover:opacity-20 transition-opacity"></div>
          </div>
          
          <Analytics />
        </div>
      </div>
    </div>
  );
}

function NavButton({ active, onClick, label }) {
  return (
    <button 
      onClick={onClick}
      className={`px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
    >
      {label}
    </button>
  );
}

function EmployeeAchievement({ goals, goalSheet, onUpdate }) {
  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
      <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl">
         <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/40 rounded-2xl flex items-center justify-center text-indigo-600">
               <TrendingUp size={24} />
            </div>
            <div>
               <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">Achievement Reporting</h3>
               <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-2">Self-Assessment Window</p>
            </div>
         </div>
         
         <div className="space-y-6">
            {goals.map((g) => (
              <div key={g.id} className="p-8 bg-slate-50 dark:bg-slate-800/30 rounded-[2rem] border border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row items-center gap-8">
                <div className="flex-1 w-full">
                   <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-1">{g.thrust_area}</p>
                   <p className="font-bold text-slate-900 dark:text-white leading-tight">{g.title}</p>
                   <p className="text-[10px] text-slate-400 mt-2 font-bold italic">Target: {g.target}</p>
                </div>
                <div className="w-full lg:w-48">
                   <input 
                     type="text" 
                     id={`achivement-${g.id}`}
                     placeholder="Actual Result" 
                     className="w-full bg-white dark:bg-slate-900 border-none rounded-xl px-5 py-3 text-sm font-black outline-none focus:ring-2 focus:ring-indigo-600 dark:text-white transition-all shadow-sm" 
                   />
                </div>
                <button 
                  onClick={() => {
                    const input = document.getElementById(`achivement-${g.id}`);
                    if (!input.value) return alert('Please enter your achievement value.');
                    alert(`Achievement logged for "${g.title}": ${input.value}`);
                    input.value = '';
                  }}
                  className="w-12 h-12 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center text-slate-300 hover:text-indigo-600 transition-all shadow-sm"
                >
                   <ArrowRight size={20} />
                </button>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
}

function KPIItem({ title, value, sub, icon, highlight }) {
  return (
    <div className={`bg-white dark:bg-slate-900 p-10 rounded-[3rem] border-2 shadow-xl shadow-slate-200/50 dark:shadow-none transition-all flex items-center justify-between group ${highlight ? 'border-amber-400 animate-pulse' : 'border-slate-100 dark:border-slate-800'}`}>
       <div>
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{title}</p>
         <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{value}</p>
         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2">{sub}</p>
       </div>
       <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-[1.5rem] flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
          {icon}
       </div>
    </div>
  );
}

function ObjectiveBadge({ label, value }) {
  return (
    <div className="px-5 py-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/50 shadow-sm">
      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block leading-none mb-1.5">{label}</span>
      <span className="text-sm font-black text-slate-700 dark:text-slate-200">{value}</span>
    </div>
  );
}

function InsightRow({ title, value, color }) {
  return (
    <div className="flex items-center justify-between group cursor-default">
       <span className="text-xs font-bold text-slate-400 group-hover:text-slate-200 transition-colors">{title}</span>
       <span className={`text-xs font-black uppercase tracking-widest ${color}`}>{value}</span>
    </div>
  );
}
