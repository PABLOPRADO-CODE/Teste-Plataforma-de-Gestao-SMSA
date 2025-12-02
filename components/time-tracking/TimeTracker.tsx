
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { addTimeRecord, getTimeRecords } from '../../services/storage';
import { TimeRecord } from '../../types';
import { Clock, MapPin, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';

const TimeTracker: React.FC = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState<TimeRecord[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = () => {
    if (!user) return;
    const all = getTimeRecords();
    const today = new Date().setHours(0,0,0,0);
    // Filter for today
    const mine = all.filter(r => r.participantId === user.principalId && r.timestamp >= today).sort((a,b) => a.timestamp - b.timestamp);
    setRecords(mine);
  };

  const handleRegister = () => {
    setError('');
    setSuccess('');
    try {
      if (!user) return;
      addTimeRecord(user.principalId);
      setSuccess('Ponto registrado com sucesso!');
      loadRecords();
      // Reset to last page to show new record if necessary, or keep current. 
      // Usually users want to see the latest, but strict pagination keeps position.
    } catch (err: any) {
      setError(err.message);
    }
  };

  const nextType = records.length % 2 === 0 ? 'ENTRADA' : 'SAIDA';
  const isSunday = new Date().getDay() === 0;

  // Pagination Logic
  const totalPages = Math.ceil(records.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentRecords = records.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Registro de Ponto Eletrônico</h2>
          <p className="text-slate-500">Olá, {user?.name}</p>
        </div>

        {isSunday ? (
           <div className="bg-red-50 text-red-700 p-4 rounded flex items-center gap-3">
             <AlertTriangle />
             <span>O registro de ponto não é permitido aos domingos.</span>
           </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="text-6xl font-mono font-bold text-slate-700 mb-4">
              {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </div>
            
            <button
              onClick={handleRegister}
              disabled={records.length >= 6} // Hard limit from backend rules still visually applies
              className={`w-full md:w-64 py-4 rounded-xl text-xl font-bold text-white shadow-lg transition transform active:scale-95 flex items-center justify-center gap-3
                ${records.length >= 6 ? 'bg-gray-400 cursor-not-allowed' : 
                  nextType === 'ENTRADA' ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-600 hover:bg-orange-700'}
              `}
            >
              <Clock size={24} />
              Registrar {nextType}
            </button>

            {records.length >= 6 && <p className="mt-2 text-red-500 font-medium">Limite diário atingido.</p>}
            
            {error && <p className="mt-4 text-red-600 bg-red-50 p-2 rounded w-full text-center">{error}</p>}
            {success && <p className="mt-4 text-green-600 bg-green-50 p-2 rounded w-full text-center">{success}</p>}
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <h3 className="font-bold mb-4 flex justify-between">
          <span>Histórico de Hoje</span>
          <span className="text-sm font-normal text-slate-500">{records.length} registros</span>
        </h3>
        
        {records.length === 0 ? (
          <p className="text-gray-400 text-center py-4">Nenhum registro hoje.</p>
        ) : (
          <>
            <div className="space-y-3">
              {currentRecords.map((rec, i) => (
                <div key={rec.id} className="flex justify-between items-center p-3 bg-gray-50 rounded border-l-4 border-slate-300">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${rec.type === 'ENTRADA' ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                    <span className="font-bold text-slate-700">{rec.type}</span>
                  </div>
                  <div className="font-mono text-slate-600">
                    {new Date(rec.timestamp).toLocaleTimeString('pt-BR')}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-6 pt-4 border-t border-slate-100">
                <button 
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed text-slate-600"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="text-sm font-medium text-slate-600">
                  Página {currentPage} de {totalPages}
                </span>
                <button 
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed text-slate-600"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TimeTracker;
