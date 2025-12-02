import React, { useState, useEffect, useMemo } from 'react';
import { getYears, saveYear, deleteYear } from '../../services/storage';
import { AcademicYear } from '../../types';
import { Trash2, Edit, Plus, Search, ArrowUp, ArrowDown } from 'lucide-react';

const YearManager: React.FC = () => {
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<AcademicYear>>({});
  const [error, setError] = useState('');

  // Filter & Sort State
  const [filter, setFilter] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof AcademicYear; direction: 'asc' | 'desc' } | null>(null);

  useEffect(() => { refresh(); }, []);
  const refresh = () => setYears(getYears());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      saveYear({ ...formData, id: editingId || undefined });
      setIsModalOpen(false);
      refresh();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const openNew = () => {
    setEditingId(null);
    setFormData({ year: new Date().getFullYear(), status: 'active' });
    setIsModalOpen(true);
  };

  const handleSort = (key: keyof AcademicYear) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSortedYears = useMemo(() => {
    let data = [...years];

    // Filter
    if (filter) {
      const lowerFilter = filter.toLowerCase();
      data = data.filter(y => 
        y.year.toString().includes(lowerFilter) ||
        y.status.toLowerCase().includes(lowerFilter)
      );
    }

    // Sort
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
  }, [years, filter, sortConfig]);

  const renderSortIcon = (key: keyof AcademicYear) => {
    if (sortConfig?.key === key) {
      return sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Anos Letivos</h2>
        <button onClick={openNew} className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700">
          <Plus size={18} /> Novo Ano Letivo
        </button>
      </div>

      <div className="bg-white p-4 rounded shadow flex items-center gap-2">
        <Search className="text-gray-400" />
        <input 
          type="text" 
          placeholder="Buscar por ano ou status..." 
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
              <th className="p-4 text-left cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('year')}>
                <div className="flex items-center gap-1">Ano {renderSortIcon('year')}</div>
              </th>
              <th className="p-4 text-left cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('startDate')}>
                <div className="flex items-center gap-1">Início {renderSortIcon('startDate')}</div>
              </th>
              <th className="p-4 text-left cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('endDate')}>
                <div className="flex items-center gap-1">Fim {renderSortIcon('endDate')}</div>
              </th>
              <th className="p-4 text-left cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('status')}>
                <div className="flex items-center gap-1">Status {renderSortIcon('status')}</div>
              </th>
              <th className="p-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedYears.map(y => (
              <tr key={y.id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-bold">{y.year}</td>
                <td className="p-4">{new Date(y.startDate).toLocaleDateString()}</td>
                <td className="p-4">{new Date(y.endDate).toLocaleDateString()}</td>
                <td className="p-4">{y.status}</td>
                <td className="p-4 text-right">
                  <button onClick={() => { deleteYear(y.id); refresh(); }} className="text-red-500"><Trash2 size={18}/></button>
                </td>
              </tr>
            ))}
            {filteredAndSortedYears.length === 0 && (
              <tr><td colSpan={5} className="p-6 text-center text-gray-500">Nenhum ano letivo encontrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Gerenciar Ano Letivo</h3>
            {error && <p className="text-red-500 mb-2">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="number" required placeholder="Ano (ex: 2024)" className="w-full border p-2 rounded"
                value={formData.year} onChange={e => setFormData({...formData, year: Number(e.target.value)})} />
              <div className="flex gap-2">
                <div className="flex-1">
                   <label className="text-xs text-gray-500">Início</label>
                   <input type="date" required className="w-full border p-2 rounded"
                     value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
                </div>
                <div className="flex-1">
                   <label className="text-xs text-gray-500">Fim</label>
                   <input type="date" required className="w-full border p-2 rounded"
                     value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
                </div>
              </div>
              <select className="w-full border p-2 rounded" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}>
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
              </select>
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
export default YearManager;