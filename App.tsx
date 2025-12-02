import React from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { 
  Users, 
  ClipboardList, 
  Clock, 
  GraduationCap, 
  FileText, 
  Calendar, 
  BookOpen, 
  Menu, 
  LogOut, 
  Search,
  Bell,
  ChevronDown,
  LayoutDashboard
} from 'lucide-react';

// Components
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/dashboard/Dashboard';
import TimeTracker from './components/time-tracking/TimeTracker';
import ParticipantManager from './components/management/ParticipantManager';
import ExamManager from './components/management/ExamManager';
import ExamApplication from './components/exams/ExamApplication';
import UserManager from './components/management/UserManager';
import ProgramManager from './components/management/ProgramManager';
import YearManager from './components/management/YearManager';
import ClassManager from './components/management/ClassManager';
import Reports from './components/reports/Reports';

const PrivateRoute: React.FC<{ children: React.ReactNode; roles?: string[] }> = ({ children, roles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) return <div className="flex h-screen items-center justify-center bg-slate-50 text-slate-500">Carregando sistema...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (roles && user && !roles.includes(user.role)) return <Navigate to="/" />;

  return <>{children}</>;
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [profileOpen, setProfileOpen] = React.useState(false);

  const isAdmin = user?.role === 'ADMIN';

  const navItems = isAdmin ? [
    { label: 'Visão Geral', path: '/', icon: <LayoutDashboard size={20} /> },
    { label: 'Relatórios', path: '/reports', icon: <ClipboardList size={20} /> },
    { label: 'Participantes', path: '/participants', icon: <Users size={20} /> },
    { label: 'Provas', path: '/exams', icon: <BookOpen size={20} /> },
    { label: 'Aplicação', path: '/exam-app', icon: <FileText size={20} /> },
    { label: 'Programas', path: '/programs', icon: <GraduationCap size={20} /> },
    { label: 'Turmas', path: '/classes', icon: <Users size={20} /> },
    { label: 'Anos Letivos', path: '/years', icon: <Calendar size={20} /> },
    { label: 'Usuários', path: '/users', icon: <Users size={20} /> },
  ] : [
    { label: 'Meu Ponto', path: '/', icon: <Clock size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={`
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 
        fixed md:relative z-30 w-64 h-full bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out shadow-xl
      `}>
        {/* Brand */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-900">
          <div className="flex items-center gap-2 font-bold text-white text-lg tracking-tight">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">S</div>
            <span>SMSA/PBH</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
          <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Menu Principal</p>
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <a 
                key={item.path} 
                href={`#${item.path}`}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                    : 'hover:bg-slate-800 hover:text-white'
                  }
                `}
                onClick={() => setMobileOpen(false)}
              >
                {item.icon}
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>

        {/* User Footer (Mobile/Sidebar only) */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
           <div className="flex items-center gap-3">
             <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold text-sm">
               {user?.name.charAt(0)}
             </div>
             <div className="flex-1 overflow-hidden">
               <p className="text-sm font-medium text-white truncate">{user?.name}</p>
               <p className="text-xs text-slate-500 truncate capitalize">{user?.role?.toLowerCase()}</p>
             </div>
           </div>
        </div>
      </aside>

      {/* Main Layout */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 z-20 shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setMobileOpen(!mobileOpen)} 
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              <Menu size={20} />
            </button>
            <h2 className="text-lg font-semibold text-slate-800 hidden md:block">
              {navItems.find(i => i.path === location.pathname)?.label || 'Gestão Acadêmica'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Search (Mock) */}
            <div className="hidden md:flex items-center bg-slate-100 rounded-full px-4 py-1.5 border border-transparent focus-within:border-blue-300 focus-within:bg-white transition-all w-64">
              <Search size={16} className="text-slate-400" />
              <input 
                type="text" 
                placeholder="Buscar..." 
                className="bg-transparent border-none outline-none text-sm ml-2 w-full text-slate-600 placeholder:text-slate-400" 
              />
            </div>

            {/* Notifications (Mock) */}
            <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full hover:bg-slate-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold border border-blue-200">
                  {user?.name.charAt(0)}
                </div>
                <ChevronDown size={14} className="text-slate-500" />
              </button>

              {profileOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setProfileOpen(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-slate-100 py-1 z-20 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-sm font-medium text-slate-800 truncate">{user?.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                    </div>
                    <button 
                      onClick={logout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut size={16} /> Sair do Sistema
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Content Scrollable Area */}
        <main className="flex-1 overflow-auto bg-slate-50 p-4 md:p-8 relative">
           {children}
        </main>
      </div>
      
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-20 md:hidden backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        ></div>
      )}
    </div>
  );
};

const AppRoutes = () => {
  const { user } = useAuth();
  
  return (
    <Routes>
      <Route path="/login" element={<LoginScreen />} />
      
      {/* Admin Routes */}
      <Route path="/" element={
        <PrivateRoute>
          <Layout>
            {user?.role === 'ADMIN' ? <Dashboard /> : <TimeTracker />}
          </Layout>
        </PrivateRoute>
      } />

      <Route path="/participants" element={<PrivateRoute roles={['ADMIN']}><Layout><ParticipantManager /></Layout></PrivateRoute>} />
      <Route path="/exams" element={<PrivateRoute roles={['ADMIN']}><Layout><ExamManager /></Layout></PrivateRoute>} />
      <Route path="/exam-app" element={<PrivateRoute roles={['ADMIN']}><Layout><ExamApplication /></Layout></PrivateRoute>} />
      <Route path="/users" element={<PrivateRoute roles={['ADMIN']}><Layout><UserManager /></Layout></PrivateRoute>} />
      <Route path="/programs" element={<PrivateRoute roles={['ADMIN']}><Layout><ProgramManager /></Layout></PrivateRoute>} />
      <Route path="/years" element={<PrivateRoute roles={['ADMIN']}><Layout><YearManager /></Layout></PrivateRoute>} />
      <Route path="/classes" element={<PrivateRoute roles={['ADMIN']}><Layout><ClassManager /></Layout></PrivateRoute>} />
      <Route path="/reports" element={<PrivateRoute roles={['ADMIN']}><Layout><Reports /></Layout></PrivateRoute>} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </AuthProvider>
  );
};

export default App;