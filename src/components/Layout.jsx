import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  LayoutDashboard, 
  Target, 
  Users, 
  LogOut, 
  Settings, 
  Sun, 
  Moon, 
  Bell,
  Search,
  Plus,
  AlertCircle
} from 'lucide-react';

export default function Layout() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-500">
      
      {/* Premium Top Navigation */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          <div className="flex items-center gap-10">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:rotate-12 transition-transform">
                <Target className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-black tracking-tighter dark:text-white">GoalTrack</span>
              <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] border border-amber-100 dark:border-amber-900/30 ml-2">
                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></div>
                Prototype
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              <HeaderLink to="/dashboard" icon={<LayoutDashboard size={18} />} label="My Goals" active={location.pathname === '/dashboard'} />
              {(user.role === 'manager' || user.role === 'admin') && (
                <HeaderLink to="/team" icon={<Users size={18} />} label="Team Oversight" active={location.pathname === '/team'} />
              )}
              {user.role === 'admin' && (
                <HeaderLink to="/admin" icon={<Settings size={18} />} label="Admin Console" active={location.pathname === '/admin'} />
              )}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group/notif">
              <button className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative">
                <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
              </button>
              
              <div className="absolute right-0 top-full pt-2 opacity-0 group-hover/notif:opacity-100 pointer-events-none group-hover/notif:pointer-events-auto transition-all translate-y-2 group-hover/notif:translate-y-0 z-50">
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl rounded-[2rem] p-6 w-80">
                   <div className="flex items-center justify-between mb-6">
                      <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Alerts Center</h4>
                      <span className="text-[10px] font-black text-indigo-600 uppercase">2 New</span>
                   </div>
                   <div className="space-y-4">
                      <NotificationItem 
                        icon={<Target className="text-indigo-500" />} 
                        title="Goal Sheet Submitted" 
                        time="2m ago" 
                        desc="Amit Shah submitted Q1 objectives." 
                      />
                      <NotificationItem 
                        icon={<AlertCircle className="text-amber-500" />} 
                        title="Cycle Closing Soon" 
                        time="1h ago" 
                        desc="Q1 goal setting locks in 48 hours." 
                      />
                   </div>
                   <button className="w-full mt-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors border-t border-slate-50 dark:border-slate-800 pt-4">
                      View All Activity
                   </button>
                </div>
              </div>
            </div>

            <button 
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              {isDark ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-indigo-600" />}
            </button>

            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-2"></div>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-slate-900 dark:text-white leading-none">{user.name}</p>
                <div className="flex items-center justify-end gap-1.5 mt-1">
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                    user.role === 'admin' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400' :
                    user.role === 'manager' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400' :
                    'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                  }`}>
                    {user.role}
                  </span>
                </div>
              </div>
              <div className="group relative">
                <button className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black shadow-lg shadow-indigo-600/20">
                  {user.name.charAt(0).toUpperCase()}
                </button>
                <div className="absolute right-0 top-full pt-2 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all">
                  <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl rounded-2xl p-2 w-48">
                    <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors font-bold text-sm">
                      <LogOut size={18} />
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Page Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10">
        <Outlet />
      </main>
    </div>
  );
}

function NotificationItem({ icon, title, time, desc }) {
  return (
    <div className="flex gap-4 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer group">
      <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0 group-hover:bg-white dark:group-hover:bg-slate-700 transition-colors">
        {icon}
      </div>
      <div>
        <div className="flex items-center justify-between gap-2 mb-0.5">
           <p className="text-[11px] font-black text-slate-900 dark:text-white leading-none">{title}</p>
           <span className="text-[8px] font-bold text-slate-400 uppercase">{time}</span>
        </div>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight line-clamp-2">{desc}</p>
      </div>
    </div>
  );
}

function HeaderLink({ to, icon, label, active }) {
  return (
    <Link 
      to={to} 
      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all font-bold text-sm ${
        active 
          ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' 
          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}
