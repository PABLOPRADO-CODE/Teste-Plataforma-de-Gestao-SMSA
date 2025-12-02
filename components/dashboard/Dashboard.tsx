import React, { useEffect, useState } from 'react';
import { getParticipants, getExams, getPrograms, getClasses } from '../../services/storage';
import { Users, BookOpen, AlertCircle, TrendingUp, GraduationCap, ArrowRight, Filter, FileText, Settings, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ClassGroup } from '../../types';
import { useAuth } from '../../context/AuthContext';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ 
    participants: 0, 
    exams: 0, 
    programs: 0,
    capacity: 1000 // Default global limit
  });
  
  const [classes, setClasses] = useState<ClassGroup[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');

  useEffect(() => {
    refreshStats();
  }, [selectedClassId]);

  const refreshStats = () => {
    const allParticipants = getParticipants();
    const allExams = getExams();
    const allPrograms = getPrograms();
    const allClasses = getClasses();

    setClasses(allClasses);

    let filteredParticipants = allParticipants;
    let currentCapacity = 1000;

    if (selectedClassId) {
      // Filter participants by class
      filteredParticipants = allParticipants.filter(p => p.classGroupId === selectedClassId);
      
      // Find class capacity
      const selectedClass = allClasses.find(c => c.id === selectedClassId);
      currentCapacity = selectedClass?.maxStudents || 1000;
    }

    setStats({
      participants: filteredParticipants.length,
      exams: allExams.length,
      programs: allPrograms.length,
      capacity: currentCapacity
    });
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
        <p className="text-slate-500">Bem-vindo, {user?.name.toUpperCase()}! Visão geral do sistema de gestão.</p>
      </div>

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-slate-50 to-white border border-slate-200 rounded-2xl p-8 shadow-sm relative overflow-hidden">
         <div className="absolute top-0 left-0 w-1 h-full bg-blue-600"></div>
         <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2 text-blue-700 font-bold mb-1">
                 <TrendingUp size={20} />
                 <span className="uppercase text-xs tracking-wider">Sistema de Gestão e Relatórios</span>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">
                Gerencie participantes, provas e usuários através dos módulos dedicados. Use o módulo de Aplicação de Prova para gerar documentos personalizados. Acesse o módulo de relatórios para exportar dados em PDF, CSV e XLSX.
              </p>
            </div>
         </div>
      </div>

      {/* Toolbar & Stats Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-4">
        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          Estatísticas do Sistema
        </h3>

        {/* Class Filter */}
        <div className="flex items-center gap-3 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm transition-all focus-within:ring-2 focus-within:ring-blue-100">
          <div className="text-slate-400">
            <Filter size={16} />
          </div>
          <div className="flex flex-col">
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-0.5">Filtrar Contexto</span>
             <select 
               className="bg-transparent text-sm font-semibold text-slate-700 outline-none cursor-pointer min-w-[180px]"
               value={selectedClassId}
               onChange={(e) => setSelectedClassId(e.target.value)}
             >
               <option value="">Todas as Turmas (Global)</option>
               {classes.map(c => (
                 <option key={c.id} value={c.id}>{c.name}</option>
               ))}
             </select>
          </div>
        </div>
      </div>
      
      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Card 1: Participants */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-blue-300 transition-all group relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
             <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
               <Users size={22} />
             </div>
             {selectedClassId && <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">TURMA ATIVA</span>}
          </div>
          <div>
            <p className="text-3xl font-bold text-slate-800 mb-1">{stats.participants}</p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
               {selectedClassId ? 'Alunos Matriculados' : 'Candidatos Registrados'}
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-50">
             <div className="flex justify-between text-xs mb-1">
               <span className="text-slate-400">Capacidade</span>
               <span className="font-bold text-slate-600">{Math.round((stats.participants/stats.capacity)*100)}%</span>
             </div>
             <div className="w-full bg-slate-100 rounded-full h-1.5">
               <div 
                 className={`h-1.5 rounded-full transition-all duration-500 ${stats.participants > stats.capacity ? 'bg-red-500' : 'bg-blue-500'}`} 
                 style={{ width: `${Math.min((stats.participants/stats.capacity)*100, 100)}%` }}
               ></div>
             </div>
          </div>
        </div>

        {/* Card 2: Exams */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-indigo-300 transition-all group">
          <div className="flex justify-between items-start mb-4">
             <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
               <BookOpen size={22} />
             </div>
             <div className="p-1 bg-indigo-50 rounded-full text-indigo-400 hover:text-indigo-600 cursor-pointer">
                <ArrowRight size={14} />
             </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-slate-800 mb-1">{stats.exams}</p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Provas Cadastradas</p>
          </div>
        </div>

        {/* Card 3: Users */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-purple-300 transition-all group">
          <div className="flex justify-between items-start mb-4">
             <div className="p-3 bg-purple-50 text-purple-600 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-colors">
               <Shield size={22} />
             </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-slate-800 mb-1">1</p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Usuários do Sistema</p>
          </div>
        </div>

        {/* Card 4: Results (Placeholder) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-orange-300 transition-all group">
          <div className="flex justify-between items-start mb-4">
             <div className="p-3 bg-orange-50 text-orange-600 rounded-lg group-hover:bg-orange-600 group-hover:text-white transition-colors">
               <FileText size={22} />
             </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-slate-800 mb-1">0</p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Avaliações Processadas</p>
          </div>
        </div>
      </div>

      <h3 className="text-xl font-bold text-slate-800 pt-4">Módulos de Gerenciamento</h3>

      {/* Main Action Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Module 1: Participants */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-all">
          <div className="flex items-start gap-4 mb-4">
             <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
               <Users size={28} />
             </div>
             <div>
               <h4 className="text-lg font-bold text-slate-800">Gerenciar Participantes</h4>
               <p className="text-sm text-slate-500 mt-1">Cadastre, edite e gerencie participantes das provas</p>
             </div>
          </div>
          <Link to="/participants" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 mt-2">
            Acessar Participantes <ArrowRight size={16} />
          </Link>
        </div>

        {/* Module 2: Exams */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-all">
          <div className="flex items-start gap-4 mb-4">
             <div className="p-3 bg-blue-100 text-blue-700 rounded-xl">
               <FileText size={28} />
             </div>
             <div>
               <h4 className="text-lg font-bold text-slate-800">Gerenciar Provas</h4>
               <p className="text-sm text-slate-500 mt-1">Crie, edite e organize as provas e questões</p>
             </div>
          </div>
          <Link to="/exams" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 mt-2">
            Acessar Provas <ArrowRight size={16} />
          </Link>
        </div>

        {/* Module 3: Users */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-all">
          <div className="flex items-start gap-4 mb-4">
             <div className="p-3 bg-purple-100 text-purple-700 rounded-xl">
               <FileText size={28} />
             </div>
             <div>
               <h4 className="text-lg font-bold text-slate-800">Gerenciar Usuários</h4>
               <p className="text-sm text-slate-500 mt-1">Administre usuários e permissões do sistema</p>
             </div>
          </div>
          <Link to="/users" className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 mt-2">
            Acessar Usuários
          </Link>
        </div>

        {/* Module 4: Exam App */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-all">
          <div className="flex items-start gap-4 mb-4">
             <div className="p-3 bg-teal-100 text-teal-700 rounded-xl">
               <FileText size={28} />
             </div>
             <div>
               <h4 className="text-lg font-bold text-slate-800">Aplicação de Prova</h4>
               <p className="text-sm text-slate-500 mt-1">Gere documentos personalizados de provas e folhas de resposta</p>
             </div>
          </div>
          <Link to="/exam-app" className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 mt-2">
            Acessar Aplicação
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;