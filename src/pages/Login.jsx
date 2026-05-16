import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Target, Lock, User, Briefcase, Shield, ArrowRight, Eye, EyeOff, Info } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const { user, login } = useAuth();

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch (err) {
      alert(err.message);
    }
  };

  const selectRole = (roleEmail, rolePass) => {
    setEmail(roleEmail);
    setPassword(rolePass);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 transition-colors duration-500">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl shadow-indigo-500/10 dark:shadow-none overflow-hidden border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in duration-700">
        
        {/* Left Side: Role Selector & Branding */}
        <div className="bg-indigo-600 p-12 lg:p-16 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-16">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md shadow-lg">
                <Target className="w-7 h-7" />
              </div>
              <span className="text-3xl font-black tracking-tighter">GoalTrack</span>
            </div>
            
            <div className="mb-16">
              <h2 className="text-5xl font-black mb-6 leading-[1.1] tracking-tight">Enterprise <br/>Performance <br/>Simulated</h2>
              <p className="text-indigo-100 opacity-70 font-medium text-lg max-w-sm">Experience the portal lifecycle by selecting a role below. Each role has a unique interface and specialized capabilities.</p>
            </div>
            
            <div className="space-y-4">
              <RoleButton 
                icon={<User />} 
                title="Employee Profile" 
                desc="Create sheets, define KPIs, track progress"
                onClick={() => selectRole('employee1@goaltrack.com', 'Emp@123')}
                active={email === 'employee1@goaltrack.com'}
              />
              <RoleButton 
                icon={<Briefcase />} 
                title="Manager Portal" 
                desc="Review team goals, provide coaching, approve"
                onClick={() => selectRole('manager1@goaltrack.com', 'Manager@123')}
                active={email === 'manager1@goaltrack.com'}
              />
              <RoleButton 
                icon={<Shield />} 
                title="Admin Console" 
                desc="Global settings, audit logs, system health"
                onClick={() => selectRole('admin@goaltrack.com', 'Admin@123')}
                active={email === 'admin@goaltrack.com'}
              />
            </div>
          </div>

          {/* Background Decorations */}
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-400 rounded-full blur-[100px] opacity-20"></div>
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-[100px] -mr-40 -mt-40"></div>
        </div>

        {/* Right Side: Login Form */}
        <div className="p-12 lg:p-20 flex flex-col justify-center bg-white dark:bg-slate-900">
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-amber-100 dark:border-amber-900/30">
              <Info size={14} />
              Interactive Prototype Mode
            </div>
            <h3 className="text-4xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">Access Portal</h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">Enter credentials or select a role on the left.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Email Identity</label>
              <div className="relative">
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-14 pr-4 py-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-800 border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none dark:text-white font-bold text-lg shadow-sm"
                  placeholder="name@company.com"
                />
                <User className="w-6 h-6 text-slate-400 absolute left-5 top-1/2 -translate-y-1/2" />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Secure Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-14 pr-14 py-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-800 border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none dark:text-white font-bold text-lg shadow-sm"
                  placeholder="••••••••"
                />
                <Lock className="w-6 h-6 text-slate-400 absolute left-5 top-1/2 -translate-y-1/2" />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors p-2"
                >
                  {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between py-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center">
                  <input 
                    type="checkbox" 
                    checked={rememberMe} 
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-5 h-5 rounded-lg border-slate-300 text-indigo-600 focus:ring-indigo-500 bg-slate-50" 
                  />
                </div>
                <span className="text-sm font-bold text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">Keep me signed in</span>
              </label>
            </div>

            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 rounded-[1.5rem] transition-all shadow-2xl shadow-indigo-600/30 flex items-center justify-center gap-3 group text-lg">
              Launch Dashboard
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          {/* Prototype Credentials Box */}
          <div className="mt-12 p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-slate-100 dark:border-slate-800">
            <h4 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest mb-4 flex items-center gap-2">
              <Shield size={14} className="text-indigo-600" />
              Demo Credentials
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CredentialItem label="Email" value={email || "Select a role ⬅️"} />
              <CredentialItem label="Password" value={password || "••••••••"} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CredentialItem({ label, value }) {
  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{value}</p>
    </div>
  );
}

function RoleButton({ icon, title, desc, onClick, active }) {
  return (
    <button 
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-5 p-6 rounded-[1.5rem] transition-all text-left border-2 ${active ? 'bg-white text-indigo-900 border-white shadow-2xl scale-[1.05] z-20' : 'bg-white/5 text-white border-white/10 hover:bg-white/10'}`}
    >
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all ${active ? 'bg-indigo-100 text-indigo-600 shadow-inner' : 'bg-white/10 text-white'}`}>
        {React.cloneElement(icon, { size: 28 })}
      </div>
      <div className="flex-1 overflow-hidden">
        <p className="font-black text-lg leading-tight truncate">{title}</p>
        <p className={`text-xs mt-1 font-medium opacity-70 leading-relaxed ${active ? 'text-indigo-800' : 'text-indigo-100'}`}>{desc}</p>
      </div>
    </button>
  );
}
