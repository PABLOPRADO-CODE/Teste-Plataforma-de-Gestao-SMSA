import React, { useState, useEffect, useMemo } from 'react';
import { getClasses, saveClass, deleteClass, getPrograms, getYears } from '../../services/storage';
import { ClassGroup, Program, AcademicYear } from '../../types';
import { Trash2, Edit, Plus, Search, ArrowUp, ArrowDown } from 'lucide-react';

const ClassManager: React.FC = () => {
  const [classes, setClasses] = useState<ClassGroup[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [years, setYears] = useState<AcademicYear[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<ClassGroup>>({});
  const [error, setError] = useState('');

  // Filter & Sort State
  const [filter, setFilter] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  useEffect(() => { refresh(); }, []);
  const refresh = () => {
    setClasses(getClasses());
    setPrograms(getPrograms());
    setYears(getYears());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      saveClass(formData);
      setIsModalOpen(false);
      setFormData({});
      refresh();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const processedClasses = useMemo(() => {
    return classes.map(c => ({
      ...c,
      programName: programs.find(p => p.id === c.programId)?.name || 'N/A',
      yearValue: years.find(y => y.id === c.yearId)?.year?.toString() || 'N/A'
    }));
  }, [classes, programs, years]);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSortedClasses = useMemo(() => {
    let data = [...processedClasses];

    if (filter) {
      const lowerFilter = filter.toLowerCase();
      data = data.filter(c => 
        c.name.toLowerCase().includes(lowerFilter) ||
        c.programName.toLowerCase().includes(lowerFilter) ||
        c.yearValue.toLowerCase().includes(lowerFilter)
      );
    }

    if (sortConfig) {
      data.sort((a, b) => {
        // @ts-ignore - dynamic access to properties
        const aValue = a[sortConfig.key] || '';
        // @ts-ignore
        const bValue = b[sortConfig.key] || '';

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return data;
  }, [processedClasses, filter, sortConfig]);

  const renderSortIcon = (key: string) => {
    if (sortConfig?.key === key) {
      return sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Turmas</h2>
        <button onClick={() => { setFormData({status: 'active', maxStudents: 20}); setIsModalOpen(true); }} className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700">
          <Plus size={18} /> Nova Turma
        </button>
      </div>

      <div className="bg-white p-4 rounded shadow flex items-center gap-2">
        <Search className="text-gray-400" />
        <input 
          type="text" 
          placeholder="Buscar por nome, programa ou ano..." 
          className="flex-1 outline-none text-slate-700 placeholder:text-slate-400"
          value={filter}
          onChange={e => setFilter(e.target.value)}
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
        />
      </div>

      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 text-left cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('name')}>
                <div className="flex items-center gap-1">Nome {renderSortIcon('name')}</div>
              </th>
              <th className="p-4 text-left cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('programName')}>
                <div className="flex items-center gap-1">Programa {renderSortIcon('programName')}</div>
              </th>
              <th className="p-4 text-left cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('yearValue')}>
                <div className="flex items-center gap-1">Ano {renderSortIcon('yearValue')}</div>
              </th>
              <th className="p-4 text-left cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('maxStudents')}>
                <div className="flex items-center gap-1">Vagas {renderSortIcon('maxStudents')}</div>
              </th>
              <th className="p-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedClasses.map(c => (
              <tr key={c.id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-medium">{c.name}</td>
                <td className="p-4">{c.programName}</td>
                <td className="p-4">{c.yearValue}</td>
                <td className="p-4">{c.maxStudents}</td>
                <td className="p-4 text-right">
                  <button onClick={() => { deleteClass(c.id); refresh(); }} className="text-red-500"><Trash2 size={18}/></button>
                </td>
              </tr>
            ))}
            {filteredAndSortedClasses.length === 0 && (
              <tr><td colSpan={5} className="p-6 text-center text-gray-500">Nenhuma turma encontrada.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Nova Turma</h3>
            {error && <p className="text-red-500 mb-2">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
              <input required placeholder="Nome da Turma" className="w-full border p-2 rounded"
                 value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} 
                 autoComplete="off" autoCorrect="off" spellCheck="false" />
              
              <select required className="w-full border p-2 rounded" value={formData.programId || ''} onChange={e => setFormData({...formData, programId: e.target.value})}>
                  <option value="">Selecione o Programa</option>
                  {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>

              <select required className="w-full border p-2 rounded" value={formData.yearId || ''} onChange={e => setFormData({...formData, yearId: e.target.value})}>
                  <option value="">Selecione o Ano Letivo</option>
                  {years.map(y => <option key={y.id} value={y.id}>{y.year}</option>)}
              </select>

              <input type="number" required placeholder="Máximo de Alunos" className="w-full border p-2 rounded"
                 value={formData.maxStudents} onChange={e => setFormData({...formData, maxStudents: Number(e.target.value)})} />
              
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default ClassManager;