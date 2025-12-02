
import React, { useState, useEffect, useMemo } from 'react';
import { getUsers, createUser, updateUser, deleteUser } from '../../services/storage';
import { User, Role } from '../../types';
import { Trash2, Edit, Plus, ShieldAlert, Search, ArrowUp, ArrowDown } from 'lucide-react';

const UserManager: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<Partial<User>>({ role: 'GUEST' });
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState(''); // State for email validation
  
  // Filter & Sort State
  const [filter, setFilter] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof User; direction: 'asc' | 'desc' } | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    setUsers(getUsers());
  };

  const adminCount = users.filter(u => u.role === 'ADMIN').length;
  const adminLimitReached = adminCount >= 20;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailError) return; // Prevent submission if email is invalid

    setError('');
    try {
      if (editingUser) {
        updateUser(editingUser.id, formData);
      } else {
        createUser(formData);
      }
      setIsModalOpen(false);
      setEditingUser(null);
      setFormData({ role: 'GUEST' });
      setEmailError('');
      loadUsers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role
    });
    setEmailError('');
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Remover usuário?")) {
      deleteUser(id);
      loadUsers();
    }
  };

  const openNew = () => {
    setEditingUser(null);
    setFormData({ role: 'GUEST', name: '', email: '' });
    setEmailError('');
    setIsModalOpen(true);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData({ ...formData, email: val });

    // Basic email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (val && !emailRegex.test(val)) {
      setEmailError('Por favor, insira um endereço de email válido.');
    } else {
      setEmailError('');
    }
  };

  const handleSort = (key: keyof User) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSortedUsers = useMemo(() => {
    let data = [...users];

    // Filter
    if (filter) {
      const lowerFilter = filter.toLowerCase();
      data = data.filter(u => 
        u.name.toLowerCase().includes(lowerFilter) ||
        u.email.toLowerCase().includes(lowerFilter) ||
        u.principalId.toLowerCase().includes(lowerFilter) ||
        u.role.toLowerCase().includes(lowerFilter)
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
  }, [users, filter, sortConfig]);

  const renderSortIcon = (key: keyof User) => {
    if (sortConfig?.key === key) {
      return sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Gerenciamento de Usuários</h2>
        <div className="flex items-center gap-4">
            <div className={`px-3 py-1 rounded-full text-sm font-bold border ${adminLimitReached ? 'bg-red-100 text-red-700 border-red-300' : 'bg-green-100 text-green-700 border-green-300'}`}>
                Administradores: {adminCount}/20
            </div>
            <button 
                onClick={openNew}
                className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700"
            >
                <Plus size={18} /> Novo Usuário
            </button>
        </div>
      </div>

      {adminLimitReached && (
          <div className="bg-red-50 border border-red-200 p-4 rounded flex items-center gap-3 text-red-700">
              <ShieldAlert />
              <p>O limite de 20 administradores foi atingido. Você não pode criar novos administradores ou promover usuários.</p>
          </div>
      )}

      <div className="bg-white p-4 rounded shadow flex items-center gap-2">
        <Search className="text-gray-400" />
        <input 
          type="text" 
          placeholder="Buscar por nome, email ou ID..." 
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
              <th className="p-4 text-left cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('email')}>
                <div className="flex items-center gap-1">Email {renderSortIcon('email')}</div>
              </th>
              <th className="p-4 text-left cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('principalId')}>
                <div className="flex items-center gap-1">Principal ID {renderSortIcon('principalId')}</div>
              </th>
              <th className="p-4 text-left cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('role')}>
                <div className="flex items-center gap-1">Perfil {renderSortIcon('role')}</div>
              </th>
              <th className="p-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedUsers.map(u => (
              <tr key={u.id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-bold">{u.name}</td>
                <td className="p-4">{u.email}</td>
                <td className="p-4 font-mono text-xs">{u.principalId}</td>
                <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                        {u.role}
                    </span>
                </td>
                <td className="p-4 text-right flex justify-end gap-2">
                  <button onClick={() => handleEdit(u)} className="text-blue-500 hover:text-blue-700">
                    <Edit size={18} />
                  </button>
                  <button onClick={() => handleDelete(u.id)} className="text-red-500 hover:text-red-700">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {filteredAndSortedUsers.length === 0 && (
              <tr><td colSpan={5} className="p-6 text-center text-gray-500">Nenhum usuário encontrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">{editingUser ? 'Editar Usuário' : 'Novo Usuário'}</h3>
            {error && <div className="mb-4 text-red-600 bg-red-50 p-2 text-sm">{error}</div>}
            
            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
              <div>
                  <label className="block text-sm font-medium">Nome</label>
                  <input 
                    required 
                    className="w-full border p-2 rounded"
                    value={formData.name || ''}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck="false"
                  />
              </div>
              <div>
                  <label className="block text-sm font-medium">Email</label>
                  <input 
                    required type="email"
                    className={`w-full border p-2 rounded ${emailError ? 'border-red-500 focus:ring-red-500' : ''}`}
                    value={formData.email || ''}
                    onChange={handleEmailChange}
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck="false"
                  />
                  {emailError && (
                    <p className="text-red-500 text-xs mt-1">{emailError}</p>
                  )}
              </div>
              <div>
                  <label className="block text-sm font-medium">Perfil</label>
                  <select 
                    className="w-full border p-2 rounded"
                    value={formData.role}
                    onChange={e => setFormData({...formData, role: e.target.value as Role})}
                  >
                      <option value="GUEST">GUEST</option>
                      <option value="ALUNO">ALUNO</option>
                      <option value="ADMIN" disabled={adminLimitReached && (!editingUser || editingUser.role !== 'ADMIN')}>
                          ADMIN {adminLimitReached ? '(Limite Atingido)' : ''}
                      </option>
                  </select>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600">Cancelar</button>
                <button 
                  type="submit" 
                  disabled={!!emailError}
                  className={`px-4 py-2 rounded text-white ${emailError ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default UserManager;
