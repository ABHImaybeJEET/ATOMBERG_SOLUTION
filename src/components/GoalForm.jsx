import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, 
  Trash2, 
  Save, 
  Send, 
  Info,
  Target,
  FileText,
  Percent,
  Calendar,
  Zap,
  RotateCcw,
  AlertCircle
} from 'lucide-react';

const THRUST_AREAS = [
  "Operational Excellence",
  "Product Innovation",
  "Process Transformation",
  "People & Culture",
  "Customer Success"
];

const UOMS = [
  { value: 'Numeric', icon: <Zap size={14} /> },
  { value: 'Percentage', icon: <Percent size={14} /> },
  { value: 'Timeline', icon: <Calendar size={14} /> },
  { value: 'Zero-based', icon: <FileText size={14} /> }
];

export default function GoalForm({ cycleId, existingGoals, onGoalAdded }) {
  const { user } = useAuth();
  const [goals, setGoals] = useState(existingGoals.length > 0 ? existingGoals : [{
    thrust_area: '',
    title: '',
    description: '',
    uom: 'Numeric',
    target: '',
    weightage: 20
  }]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);

  const addGoal = () => {
    if (goals.length >= 8) return;
    setGoals([...goals, { thrust_area: '', title: '', description: '', uom: 'Numeric', target: '', weightage: 0 }]);
  };

  const removeGoal = (index) => {
    if (goals.length === 1) {
       alert("At least one goal is required.");
       return;
    }
    setGoals(goals.filter((_, i) => i !== index));
  };

  const updateGoal = (index, field, value) => {
    const newGoals = [...goals];
    newGoals[index][field] = value;
    setGoals(newGoals);
  };

  const resetForm = () => {
    if (confirm("Reset all changes? Unsaved data will be lost.")) {
      setGoals(existingGoals.length > 0 ? existingGoals : [{
        thrust_area: '',
        title: '',
        description: '',
        uom: 'Numeric',
        target: '',
        weightage: 20
      }]);
    }
  };

  const validate = (status) => {
    const newErrors = [];
    const totalWeight = goals.reduce((sum, g) => sum + Number(g.weightage), 0);
    
    if (status === 'submitted' && totalWeight !== 100) {
      newErrors.push(`Total weightage must be exactly 100%. Current: ${totalWeight}%`);
    }

    goals.forEach((g, i) => {
      if (!g.title || !g.thrust_area || !g.target) {
        newErrors.push(`Goal #${i+1} is missing required fields.`);
      }
      if (status === 'submitted' && g.weightage < 10) {
        newErrors.push(`Goal #${i+1} weightage is below 10%.`);
      }
    });

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (status = 'draft') => {
    if (!validate(status)) return;

    try {
      setLoading(true);
      let sheetId;
      const { data: existingSheet } = await supabase.from('goal_sheets')
        .select('id')
        .eq('employee_id', user.id)
        .eq('cycle_id', cycleId)
        .maybeSingle();

      if (existingSheet) {
        sheetId = existingSheet.id;
        await supabase.from('goal_sheets').update({ status, submitted_at: status === 'submitted' ? new Date() : null }).eq('id', sheetId);
      } else {
        const { data: newSheet } = await supabase.from('goal_sheets').insert({
          employee_id: user.id,
          cycle_id: cycleId,
          status,
          manager_id: 'manager-1'
        }).select().single();
        sheetId = newSheet.id;
      }

      await supabase.from('goals').delete().eq('sheet_id', sheetId);
      await supabase.from('goals').insert(goals.map(g => ({ ...g, sheet_id: sheetId })));

      alert(status === 'submitted' ? "Goal sheet submitted successfully!" : "Draft saved!");
      onGoalAdded();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const totalWeightage = goals.reduce((sum, g) => sum + (Number(g.weightage) || 0), 0);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl shadow-indigo-500/5 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden">
      <div className="p-10 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter italic">GOAL CONFIGURATION</h2>
            <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black mt-1 uppercase tracking-[0.3em]">Phase 1: Defining your performance roadmap</p>
          </div>
          <div className="flex items-center gap-4">
            <div className={`px-8 py-4 rounded-2xl flex flex-col items-end justify-center transition-all ${totalWeightage === 100 ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 border border-emerald-100' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 border border-amber-100'}`}>
              <span className="text-3xl font-black leading-none tracking-tighter">{totalWeightage}%</span>
              <span className="text-[9px] font-black uppercase tracking-widest mt-1 opacity-60">Cumulative Weight</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-10 space-y-10">
        {errors.length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 p-6 rounded-3xl space-y-2">
            <div className="flex items-center gap-2 text-red-600 mb-2">
               <AlertCircle size={18} />
               <span className="text-xs font-black uppercase tracking-widest">Validation Errors</span>
            </div>
            {errors.map((err, i) => (
              <p key={i} className="text-xs font-bold text-red-500 flex items-center gap-2">
                <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                {err}
              </p>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 gap-10">
          {goals.map((goal, index) => (
            <div key={index} className="relative bg-slate-50/50 dark:bg-slate-800/20 rounded-[2.5rem] p-10 border border-slate-100 dark:border-slate-800 transition-all hover:border-indigo-200 dark:hover:border-indigo-900/50 group">
              <div className="absolute -top-4 -left-4 w-10 h-10 bg-indigo-600 text-white rounded-xl shadow-lg flex items-center justify-center font-black text-xs z-10">
                0{index + 1}
              </div>
              
              <button 
                onClick={() => removeGoal(index)}
                className="absolute -top-4 -right-4 w-10 h-10 bg-white dark:bg-slate-900 text-slate-400 hover:text-red-500 rounded-full shadow-lg border border-slate-100 dark:border-slate-800 flex items-center justify-center transition-all hover:rotate-90"
              >
                <Trash2 size={18} />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                <div className="md:col-span-4">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 block">Strategy Alignment</label>
                  <select 
                    value={goal.thrust_area}
                    onChange={(e) => updateGoal(index, 'thrust_area', e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none transition-all dark:text-white appearance-none cursor-pointer"
                  >
                    <option value="">Select Thrust Area</option>
                    {THRUST_AREAS.map(area => <option key={area} value={area}>{area}</option>)}
                  </select>
                </div>

                <div className="md:col-span-8">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 block">Goal Heading {goal.is_shared && '(READ-ONLY)'}</label>
                  <input 
                    type="text"
                    value={goal.title}
                    readOnly={goal.is_shared}
                    onChange={(e) => updateGoal(index, 'title', e.target.value)}
                    placeholder="Briefly describe the outcome..."
                    className={`w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none transition-all dark:text-white ${goal.is_shared ? 'bg-slate-50/50 cursor-not-allowed opacity-60' : ''}`}
                  />
                </div>

                <div className="md:col-span-12">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 block">Detailed Objective & Success Criteria</label>
                  <textarea 
                    value={goal.description}
                    readOnly={goal.is_shared}
                    onChange={(e) => updateGoal(index, 'description', e.target.value)}
                    placeholder="Detail the metrics, milestones, and how success will be measured..."
                    rows={3}
                    className={`w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-indigo-600 outline-none transition-all dark:text-white leading-relaxed ${goal.is_shared ? 'bg-slate-50/50 cursor-not-allowed opacity-70' : ''}`}
                  />
                </div>

                <div className="md:col-span-4">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 block">Unit of Measure</label>
                  <div className="grid grid-cols-2 gap-2">
                    {UOMS.map(u => (
                      <button
                        key={u.value}
                        type="button"
                        disabled={goal.is_shared}
                        onClick={() => updateGoal(index, 'uom', u.value)}
                        className={`flex items-center gap-2 px-3 py-3 rounded-xl text-[10px] font-black transition-all ${goal.is_shared ? 'opacity-50 cursor-not-allowed' : ''} ${goal.uom === u.value ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white dark:bg-slate-900 text-slate-500 border border-slate-100 dark:border-slate-800 hover:bg-slate-50'}`}
                      >
                        {u.icon}
                        {u.value}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-4">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 block">Target Threshold</label>
                  <input 
                    type="text"
                    value={goal.target}
                    readOnly={goal.is_shared}
                    onChange={(e) => updateGoal(index, 'target', e.target.value)}
                    placeholder="e.g. 5M Revenue, 100% SLA"
                    className={`w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-4 text-sm font-black focus:ring-2 focus:ring-indigo-600 outline-none transition-all dark:text-white ${goal.is_shared ? 'bg-slate-50/50 cursor-not-allowed opacity-70' : ''}`}
                  />
                </div>

                <div className="md:col-span-4">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 block text-right">Strategic Weight ({goal.weightage}%)</label>
                  <div className="flex flex-col gap-4 mt-2">
                    <input 
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={goal.weightage}
                      onChange={(e) => updateGoal(index, 'weightage', Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <div className="flex justify-between text-[8px] font-black text-slate-400 uppercase tracking-widest px-1">
                       <span>Low</span>
                       <span>Medium</span>
                       <span>High Impact</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button 
          onClick={addGoal}
          disabled={goals.length >= 8}
          className="w-full py-10 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem] text-slate-400 hover:border-indigo-400 hover:text-indigo-600 transition-all flex flex-col items-center justify-center gap-3 group bg-slate-50/20 dark:bg-slate-900/10 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
            <Plus size={32} />
          </div>
          <span className="font-black text-[10px] uppercase tracking-[0.3em]">Attach Strategic Goal ({goals.length}/8)</span>
        </button>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-12 border-t border-slate-100 dark:border-slate-800">
          <button 
            type="button"
            onClick={resetForm}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-black text-[10px] uppercase tracking-widest transition-all"
          >
            <RotateCcw size={14} />
            Reset Changes
          </button>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button 
              disabled={loading}
              onClick={() => handleSubmit('draft')}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-4.5 rounded-2xl font-black text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all uppercase tracking-widest"
            >
              <Save size={18} />
              Save Progress
            </button>
            <button 
              disabled={loading}
              onClick={() => handleSubmit('submitted')}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-10 py-4.5 rounded-2xl font-black text-xs text-white bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-600/30 transition-all disabled:opacity-50 uppercase tracking-widest"
            >
              <Send size={18} />
              {loading ? 'Processing...' : 'Submit Roadmap'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
