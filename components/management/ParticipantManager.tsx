
import React, { useState, useEffect, useMemo } from 'react';
import { getParticipants, createParticipant, deleteParticipant, getClasses } from '../../services/storage';
import { Participant, ClassGroup } from '../../types';
import { Plus, Trash2, Search, ArrowUp, ArrowDown, Users, Filter } from 'lucide-react';

const ParticipantManager: React.FC = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [classes, setClasses] = useState<ClassGroup[]>([]);
  const [filter, setFilter] = useState('');
  const [selectedClassId, setSelectedClassId] = useState(''); // New Class Filter State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Participant>>({});
  const [error, setError] = useState('');

  // Sorting State
  const [sortConfig, setSortConfig] = useState<{ key: keyof Participant | 'className'; direction: 'asc' | 'desc' } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setParticipants(getParticipants());
    setClasses(getClasses());
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      createParticipant(formData);
      setIsModalOpen(false);
      setFormData({});
      loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Remover participante?")) {
      deleteParticipant(id);
      loadData();
    }
  };

  const handleSort = (key: keyof Participant | 'className') => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const processedParticipants = useMemo(() => {
    return participants.map(p => ({
      ...p,
      className: classes.find(c => c.id === p.classGroupId)?.name || ''
    }));
  }, [participants, classes]);

  const filteredAndSortedParticipants = useMemo(() => {
    let data = [...processedParticipants];

    // 1. Class Filter (Strict ID match)
    if (selectedClassId) {
      data = data.filter(p => p.classGroupId === selectedClassId);
    }

    // 2. Text Filter (Fuzzy search)
    if (filter) {
      const lowerFilter = filter.toLowerCase();
      data = data.filter(p => 
        p.name.toLowerCase().includes(lowerFilter) || 
        p.email.toLowerCase().includes(lowerFilter) ||
        p.registrationNumber.toLowerCase().includes(lowerFilter) ||
        p.course.toLowerCase().includes(lowerFilter) ||
        p.principalId.toLowerCase().includes(lowerFilter) ||
        p.className.toLowerCase().includes(lowerFilter)
      );
    }

    if (sortConfig) {
      data.sort((a, b) => {
        const aValue = a[sortConfig.key] || '';
        const bValue = b[sortConfig.key] || '';

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return data;
  }, [processedParticipants, filter, selectedClassId, sortConfig]);

  const renderSortIcon = (key: keyof Participant | 'className') => {
    if (sortConfig?.key === key) {
      return sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
    }
    return null;
  };

  // Helper to get counts for the visual counter
  const getContextCount = () => {
    if (selectedClassId) {
      const count = participants.filter(p => p.classGroupId === selectedClassId).length;
      const className = classes.find(c => c.id === selectedClassId)?.name || 'Turma Selecionada';
      return { label: className, count };
    }
    return { label: 'Total Geral', count: participants.length };
  };

  const contextStats = getContextCount();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Participantes</h2>
          {/* Visual Counter */}
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-slate-500">Listando:</span>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${selectedClassId ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
              <Users size={12} />
              {contextStats.label}: {contextStats.count}
            </span>
          </div>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50 shadow-sm"
          disabled={participants.length >= 1000}
        >
          <Plus size={18} /> Novo Participante
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        {/* Class Filter Dropdown */}
        <div className="bg-white p-3 rounded shadow-sm border border-slate-200 flex items-center gap-2 min-w-[220px]">
           <Filter size={18} className="text-slate-400" />
           <div className="flex flex-col w-full">
             <label className="text-[10px] uppercase font-bold text-slate-400 leading-none">Filtrar por Turma</label>
             <select 
                className="bg-transparent outline-none text-sm font-semibold text-slate-700 w-full cursor-pointer mt-0.5"
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
             >
               <option value="">Todas as Turmas</option>
               {classes.map(c => (
                 <option key={c.id} value={c.id}>{c.name}</option>
               ))}
             </select>
           </div>
        </div>

        {/* Text Search */}
        <div className="flex-1 bg-white p-3 rounded shadow-sm border border-slate-200 flex items-center gap-2">
          <Search className="text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por nome, email, registro, ID..." 
            className="flex-1 outline-none text-slate-700 placeholder:text-slate-400 text-sm"
            value={filter}
            onChange={e => setFilter(e.target.value)}
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
          />
        </div>
      </div>

      <div className="bg-white rounded shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th 
                className="p-4 text-left cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-1 text-xs font-bold text-slate-500 uppercase tracking-wider">Nome {renderSortIcon('name')}</div>
              </th>
              <th 
                className="p-4 text-left cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => handleSort('principalId')}
              >
                <div className="flex items-center gap-1 text-xs font-bold text-slate-500 uppercase tracking-wider">Principal ID {renderSortIcon('principalId')}</div>
              </th>
              <th 
                className="p-4 text-left cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => handleSort('course')}
              >
                <div className="flex items-center gap-1 text-xs font-bold text-slate-500 uppercase tracking-wider">Curso {renderSortIcon('course')}</div>
              </th>
              <th className="p-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredAndSortedParticipants.map(p => (
              <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-bold text-slate-800 text-sm">{p.name}</span>
                      {p.className && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 uppercase tracking-wide">
                          {p.className}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500">{p.email}</span>
                    <span className="text-xs text-slate-400">Reg: {p.registrationNumber}</span>
                  </div>
                </td>
                <td className="p-4 font-mono text-xs text-slate-600">{p.principalId}</td>
                <td className="p-4 text-sm text-slate-600">
                  {p.course}
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => handleDelete(p.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {filteredAndSortedParticipants.length === 0 && (
              <tr>
                <td colSpan={4} className="p-12 text-center text-slate-400 flex flex-col items-center justify-center">
                  <Search size={48} className="mb-4 opacity-20" />
                  <p>Nenhum participante encontrado.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 text-right font-medium">
          Exibindo {filteredAndSortedParticipants.length} registros
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold mb-1 text-slate-800">Novo Participante</h3>
            <p className="text-sm text-slate-500 mb-6">Preencha os dados do novo aluno/candidato.</p>
            
            {error && <div className="mb-4 text-red-600 bg-red-50 p-3 rounded-lg text-sm border border-red-100 flex items-center gap-2"><Trash2 size={14}/> {error}</div>}
            
            <form onSubmit={handleCreate} className="space-y-4" autoComplete="off">
              <input 
                placeholder="Nome Completo" required 
                className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                onChange={e => setFormData({...formData, name: e.target.value})}
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
              />
              <input 
                placeholder="Email Institucional" type="email" required 
                className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                onChange={e => setFormData({...formData, email: e.target.value})}
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
              />
              <div className="grid grid-cols-2 gap-4">
                <input 
                  placeholder="Nº Registro" required 
                  className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  onChange={e => setFormData({...formData, registrationNumber: e.target.value})}
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck="false"
                />
                <input 
                  placeholder="Curso/Programa" required 
                  className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  onChange={e => setFormData({...formData, course: e.target.value})}
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck="false"
                />
              </div>
              
              <div className="space-y-1">
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Turma (Opcional)</label>
                 <select 
                    className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                    onChange={e => setFormData({...formData, classGroupId: e.target.value})}
                    value={formData.classGroupId || ''}
                 >
                    <option value="">Nenhuma Turma Selecionada</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                 </select>
              </div>
              
              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 mt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors">Cancelar</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm shadow-blue-200 transition-all">Salvar Registro</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParticipantManager;
