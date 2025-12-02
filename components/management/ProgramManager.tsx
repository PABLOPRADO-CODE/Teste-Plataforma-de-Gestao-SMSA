import React, { useState, useEffect, useMemo } from 'react';
import { getPrograms, saveProgram, deleteProgram } from '../../services/storage';
import { Program } from '../../types';
import { Trash2, Edit, Plus, Search, ArrowUp, ArrowDown, Filter } from 'lucide-react';

const ProgramManager: React.FC = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Program>>({});

  // Filter & Sort State
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Program; direction: 'asc' | 'desc' } | null>(null);

  useEffect(() => {
    refresh();
  }, []);

  const refresh = () => setPrograms(getPrograms());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveProgram({ ...formData, id: editingId || undefined });
    setIsModalOpen(false);
    refresh();
  };

  const openNew = () => {
    setEditingId(null);
    setFormData({ duration: 1, status: 'active' });
    setIsModalOpen(true);
  };

  const openEdit = (p: Program) => {
    setEditingId(p.id);
    setFormData(p);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Excluir Programa?")) {
      deleteProgram(id);
      refresh();
    }
  };

  const handleSort = (key: keyof Program) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSortedPrograms = useMemo(() => {
    let data = [...programs];

    // Status Filter
    if (statusFilter !== 'all') {
      data = data.filter(p => p.status === statusFilter);
    }

    // Text Filter
    if (filter) {
      const lowerFilter = filter.toLowerCase();
      data = data.filter(p => 
        p.name.toLowerCase().includes(lowerFilter) ||
        p.specializationArea.toLowerCase().includes(lowerFilter)
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
  }, [programs, filter, statusFilter, sortConfig]);

  const renderSortIcon = (key: keyof Program) => {
    if (sortConfig?.key === key) {
      return sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Programas de Residência</h2>
        <button onClick={openNew} className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700">
          <Plus size={18} /> Novo Programa
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        {/* Text Search */}
        <div className="flex-1 bg-white p-4 rounded shadow flex items-center gap-2">
          <Search className="text-gray-400" />
          <input 
            type="text" 
            placeholder="Buscar por nome ou área..." 
            className="flex-1 outline-none text-slate-700 placeholder:text-slate-400"
            value={filter}
            onChange={e => setFilter(e.target.value)}
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
          />
        </div>

        {/* Status Filter */}
        <div className="bg-white p-4 rounded shadow flex items-center gap-2 min-w-[200px]">
          <Filter className="text-gray-400" size={18} />
          <select 
            className="flex-1 outline-none text-slate-700 bg-transparent cursor-pointer"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
          >
            <option value="all">Todos os Status</option>
            <option value="active">Apenas Ativos</option>
            <option value="inactive">Apenas Inativos</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 text-left cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('name')}>
                <div className="flex items-center gap-1">Nome {renderSortIcon('name')}</div>
              </th>
              <th className="p-4 text-left cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('specializationArea')}>
                <div className="flex items-center gap-1">Área {renderSortIcon('specializationArea')}</div>
              </th>
              <th className="p-4 text-left cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('duration')}>
                <div className="flex items-center gap-1">Duração {renderSortIcon('duration')}</div>
              </th>
              <th className="p-4 text-left cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('status')}>
                <div className="flex items-center gap-1">Status {renderSortIcon('status')}</div>
              </th>
              <th className="p-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedPrograms.map(p => (
              <tr key={p.id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-medium">{p.name}</td>
                <td className="p-4">{p.specializationArea}</td>
                <td className="p-4">{p.duration} Anos</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs ${p.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {p.status === 'active' ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="p-4 text-right flex justify-end gap-2">
                  <button onClick={() => openEdit(p)} className="text-blue-500 hover:text-blue-700"><Edit size={18}/></button>
                  <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-red-700"><Trash2 size={18}/></button>
                </td>
              </tr>
            ))}
            {filteredAndSortedPrograms.length === 0 && (
              <tr><td colSpan={5} className="p-6 text-center text-gray-500">Nenhum programa encontrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">{editingId ? 'Editar Programa' : 'Novo Programa'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
              <input 
                placeholder="Nome do Programa" required 
                className="w-full border p-2 rounded"
                value={formData.name || ''}
                onChange={e => setFormData({...formData, name: e.target.value})}
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
              />
              <input 
                placeholder="Área de Especialização" required 
                className="w-full border p-2 rounded"
                value={formData.specializationArea || ''}
                onChange={e => setFormData({...formData, specializationArea: e.target.value})}
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
              />
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-xs text-gray-500">Duração (Anos)</label>
                  <input 
                    type="number" min="1" max="5" required 
                    className="w-full border p-2 rounded"
                    value={formData.duration || 1}
                    onChange={e => setFormData({...formData, duration: Number(e.target.value)})}
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-500">Status</label>
                  <select 
                    className="w-full border p-2 rounded"
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value as any})}
                  >
                    <option value="active">Ativo</option>
                    <option value="inactive">Inativo</option>
                  </select>
                </div>
              </div>
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
export default ProgramManager;