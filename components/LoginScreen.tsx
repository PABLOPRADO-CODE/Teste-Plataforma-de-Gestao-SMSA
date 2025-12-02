import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { createParticipant } from '../services/storage';

const LoginScreen: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Login State
  const [email, setEmail] = useState('');

  // Register State
  const [regData, setRegData] = useState({
    name: '',
    email: '',
    registrationNumber: '',
    course: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const role = email.includes('admin') ? 'ADMIN' : 'ALUNO';
      await login(email, role);
      navigate('/');
    } catch (err: any) {
      setError(err.message || "Falha no login");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    try {
      const part = createParticipant(regData);
      setSuccessMsg(`Cadastro realizado! Principal ID: ${part.principalId}.`);
      setTimeout(() => setMode('LOGIN'), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 p-8 text-center">
           <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-lg text-white font-bold text-xl mb-4">S</div>
           <h1 className="text-2xl font-bold text-white">SMSA/PBH</h1>
           <p className="text-blue-200 text-sm">Sistema de Gestão Acadêmica</p>
        </div>

        <div className="p-8">
          {error && <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-200 rounded text-sm flex items-center gap-2">⚠️ {error}</div>}
          {successMsg && <div className="mb-4 p-3 bg-green-50 text-green-700 border border-green-200 rounded text-sm font-medium">✅ {successMsg}</div>}

          {/* Tabs */}
          <div className="flex border-b border-slate-200 mb-6">
            <button 
              className={`flex-1 pb-3 text-sm font-medium transition-colors ${mode === 'LOGIN' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
              onClick={() => setMode('LOGIN')}
            >
              Acesso
            </button>
            <button 
              className={`flex-1 pb-3 text-sm font-medium transition-colors ${mode === 'REGISTER' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
              onClick={() => setMode('REGISTER')}
            >
              Novo Cadastro
            </button>
          </div>

          {mode === 'LOGIN' ? (
            <form onSubmit={handleLogin} className="space-y-5" autoComplete="off">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Email Institucional</label>
                <input 
                  type="email" 
                  required 
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="ex: admin@smsa.pbh.gov.br"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck="false"
                />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30">
                Entrar no Sistema
              </button>
              <p className="text-center text-xs text-slate-400 mt-4">
                Acesso seguro via Internet Identity
              </p>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4" autoComplete="off">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Nome Completo</label>
                <input 
                  type="text" required 
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={regData.name} onChange={e => setRegData({...regData, name: e.target.value})}
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck="false"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Email</label>
                <input 
                  type="email" required 
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={regData.email} onChange={e => setRegData({...regData, email: e.target.value})}
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck="false"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Registro (CRM/Coren)</label>
                <input 
                  type="text" required 
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={regData.registrationNumber} onChange={e => setRegData({...regData, registrationNumber: e.target.value})}
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck="false"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Programa</label>
                <input 
                  type="text" required 
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={regData.course} onChange={e => setRegData({...regData, course: e.target.value})}
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck="false"
                />
              </div>
              <button type="submit" className="w-full bg-emerald-600 text-white py-2.5 rounded-lg font-medium hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/30">
                Confirmar Cadastro
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;