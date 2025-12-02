import React, { useState, useEffect } from 'react';
import { getExams, getParticipants, getQuestions } from '../../services/storage';
import { generateExamPackage, generateAnswerSheetsOnly } from '../../services/examExportUtils';
import { Exam, Participant, Question } from '../../types';
import { Printer, Search, Users as UsersIcon, CheckSquare, FileCheck } from 'lucide-react';

const ExamApplication: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  
  const [selectedExamId, setSelectedExamId] = useState('');
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingGabaritos, setIsGeneratingGabaritos] = useState(false);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    setExams(getExams());
    setParticipants(getParticipants());
    setQuestions(getQuestions());
  }, []);

  const handleGenerate = async () => {
    if (!selectedExamId || selectedParticipantIds.length === 0) return;
    setIsGenerating(true);

    // Give UI time to update
    setTimeout(() => {
      try {
        const exam = exams.find(e => e.id === selectedExamId)!;
        const examQuestions = questions.filter(q => exam.questionIds.includes(q.id));
        const selectedParticipants = participants.filter(p => selectedParticipantIds.includes(p.id));

        // Use the util to generate the PDF
        generateExamPackage(exam, selectedParticipants, examQuestions);

      } catch (error) {
        console.error(error);
        alert("Erro ao gerar documentos.");
      } finally {
        setIsGenerating(false);
      }
    }, 500);
  };

  const handleGenerateGabaritos = async () => {
    if (!selectedExamId || selectedParticipantIds.length === 0) return;
    setIsGeneratingGabaritos(true);

    setTimeout(() => {
      try {
        const exam = exams.find(e => e.id === selectedExamId)!;
        const examQuestions = questions.filter(q => exam.questionIds.includes(q.id));
        const selectedParticipants = participants.filter(p => selectedParticipantIds.includes(p.id));

        generateAnswerSheetsOnly(exam, selectedParticipants, examQuestions);

      } catch (error) {
        console.error(error);
        alert("Erro ao gerar gabaritos.");
      } finally {
        setIsGeneratingGabaritos(false);
      }
    }, 500);
  };

  const filteredParticipants = participants.filter(p => 
    p.name.toLowerCase().includes(filter.toLowerCase()) || 
    p.registrationNumber.toLowerCase().includes(filter.toLowerCase()) || 
    p.principalId.toLowerCase().includes(filter.toLowerCase())
  );

  // Check if all filtered participants are currently selected
  const filteredIds = filteredParticipants.map(p => p.id);
  const isAllSelected = filteredParticipants.length > 0 && filteredIds.every(id => selectedParticipantIds.includes(id));

  const toggleAllFilteredParticipants = () => {
      if (isAllSelected) {
          // Unselect all currently filtered
          setSelectedParticipantIds(prev => prev.filter(id => !filteredIds.includes(id)));
      } else {
          // Select all currently filtered
          const newIds = [...selectedParticipantIds];
          filteredIds.forEach(id => {
              if (!newIds.includes(id)) newIds.push(id);
          });
          setSelectedParticipantIds(newIds);
      }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Aplicação de Prova (Impressão)</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Config */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded shadow">
             <label className="block font-bold mb-2">1. Selecionar Prova</label>
             <select 
               className="w-full border p-2 rounded"
               value={selectedExamId}
               onChange={e => setSelectedExamId(e.target.value)}
             >
               <option value="">Selecione...</option>
               {exams.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
             </select>
          </div>

          <div className="bg-white p-6 rounded shadow">
             <label className="block font-bold mb-4">3. Ações</label>
             
             <div className="space-y-3">
               <button 
                 onClick={handleGenerate}
                 disabled={!selectedExamId || selectedParticipantIds.length === 0 || isGenerating}
                 className={`w-full py-3 rounded font-bold flex items-center justify-center gap-2 ${
                   !selectedExamId || selectedParticipantIds.length === 0 
                   ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                   : 'bg-indigo-600 text-white hover:bg-indigo-700'
                 }`}
               >
                 {isGenerating ? 'Processando...' : <><Printer size={20} /> Gerar Pacote Completo</>}
               </button>

               <button 
                 onClick={handleGenerateGabaritos}
                 disabled={!selectedExamId || selectedParticipantIds.length === 0 || isGeneratingGabaritos}
                 className={`w-full py-3 rounded font-bold flex items-center justify-center gap-2 border-2 transition-colors ${
                   !selectedExamId || selectedParticipantIds.length === 0 
                   ? 'border-gray-300 text-gray-400 cursor-not-allowed'
                   : 'border-slate-800 text-slate-800 hover:bg-slate-50'
                 }`}
               >
                 {isGeneratingGabaritos ? 'Gerando Gabaritos...' : <><FileCheck size={20} /> Exportar Apenas Gabaritos</>}
               </button>
             </div>

             <div className="mt-4 text-xs text-gray-500 space-y-2">
               <p><strong>Pacote Completo:</strong> Gera Capa + Caderno de Questões + Folha de Respostas para cada aluno.</p>
               <p><strong>Apenas Gabaritos:</strong> Gera um único PDF contendo apenas as Folhas de Respostas de todos os selecionados (1 por página).</p>
             </div>
          </div>
        </div>

        {/* Right Col: Participants */}
        <div className="lg:col-span-2 bg-white p-6 rounded shadow h-[600px] flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <label className="font-bold">2. Selecionar Participantes ({selectedParticipantIds.length})</label>
          </div>

          {/* Search Bar */}
          <div className="flex items-center gap-2 bg-gray-50 p-2 rounded border mb-3">
             <Search size={18} className="text-gray-400" />
             <input 
               type="text" 
               placeholder="Buscar por nome, registro ou ID..." 
               className="bg-transparent outline-none flex-1 text-sm"
               value={filter}
               onChange={e => setFilter(e.target.value)}
             />
          </div>

          {/* Select All Checkbox */}
          <div className={`flex items-center gap-3 mb-3 p-3 rounded-lg border transition-colors ${isAllSelected ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
            <input 
              type="checkbox" 
              id="selectAll"
              checked={isAllSelected}
              onChange={toggleAllFilteredParticipants}
              disabled={filteredParticipants.length === 0}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="selectAll" className="flex-1 cursor-pointer select-none font-medium text-sm text-slate-700">
               {isAllSelected ? 'Desmarcar todos os listados' : 'Selecionar todos os listados'} 
               <span className="ml-1 text-slate-500 font-normal">({filteredParticipants.length})</span>
            </label>
          </div>
          
          <div className="flex-1 overflow-y-auto border rounded">
            {participants.length === 0 && <div className="p-4 text-center text-gray-500">Nenhum participante cadastrado.</div>}
            {filteredParticipants.length === 0 && participants.length > 0 && <div className="p-4 text-center text-gray-500">Nenhum participante encontrado para a busca.</div>}
            
            {filteredParticipants.map(p => (
              <div key={p.id} className="flex items-center gap-3 p-3 border-b hover:bg-gray-50 transition-colors">
                <input 
                  type="checkbox"
                  checked={selectedParticipantIds.includes(p.id)}
                  onChange={() => {
                    if (selectedParticipantIds.includes(p.id)) {
                      setSelectedParticipantIds(prev => prev.filter(id => id !== p.id));
                    } else {
                      setSelectedParticipantIds(prev => [...prev, p.id]);
                    }
                  }}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                />
                <div className="cursor-pointer flex-1" onClick={() => {
                    if (selectedParticipantIds.includes(p.id)) {
                      setSelectedParticipantIds(prev => prev.filter(id => id !== p.id));
                    } else {
                      setSelectedParticipantIds(prev => [...prev, p.id]);
                    }
                }}>
                  <p className="font-bold text-sm text-slate-700">{p.name}</p>
                  <p className="text-xs text-gray-500">ID: <span className="font-mono">{p.principalId}</span> | Reg: {p.registrationNumber}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamApplication;