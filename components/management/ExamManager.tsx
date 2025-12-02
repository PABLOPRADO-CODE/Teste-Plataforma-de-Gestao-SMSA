
import React, { useState, useEffect, useMemo } from 'react';
import { getExams, saveExam, deleteExam, getQuestions, saveQuestionsBatch } from '../../services/storage';
import { Exam, Question } from '../../types';
import { Plus, Trash2, FileText, Upload, Save, Check, Search, ArrowUp, ArrowDown } from 'lucide-react';

const ExamManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'LIST' | 'CREATE' | 'BANK'>('LIST');
  const [exams, setExams] = useState<Exam[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  
  // Create State
  const [newExamTitle, setNewExamTitle] = useState('');
  const [newExamDate, setNewExamDate] = useState('');
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [createQuestionFilter, setCreateQuestionFilter] = useState('');

  // Bank Import State
  const [importText, setImportText] = useState('');
  const [parsedQuestions, setParsedQuestions] = useState<Partial<Question>[]>([]);
  const [importStatus, setImportStatus] = useState('');
  const [bankQuestionFilter, setBankQuestionFilter] = useState('');

  // Filter & Sort State (for List Tab)
  const [filter, setFilter] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Exam | 'questionCount'; direction: 'asc' | 'desc' } | null>(null);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setExams(getExams());
    setQuestions(getQuestions());
  };

  const handleSort = (key: keyof Exam | 'questionCount') => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSortedExams = useMemo(() => {
    let data = exams.map(e => ({ ...e, questionCount: e.questionIds.length }));

    if (filter) {
      const lowerFilter = filter.toLowerCase();
      data = data.filter(e => 
        e.title.toLowerCase().includes(lowerFilter) ||
        new Date(e.date).toLocaleDateString().includes(lowerFilter)
      );
    }

    if (sortConfig) {
      data.sort((a, b) => {
        // @ts-ignore
        const aValue = a[sortConfig.key] || '';
        // @ts-ignore
        const bValue = b[sortConfig.key] || '';

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return data;
  }, [exams, filter, sortConfig]);

  const renderSortIcon = (key: keyof Exam | 'questionCount') => {
    if (sortConfig?.key === key) {
      return sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
    }
    return null;
  };

  // --- BANK IMPORT LOGIC ---
  const parseQuestions = () => {
    // Regex logic to parse standard format
    // 1. Enunciado...
    // A) ...
    // B) ...
    // Resposta: A
    
    const blocks = importText.split(/\n\s*\n/); // Split by double newline
    const parsed: Partial<Question>[] = [];

    blocks.forEach(block => {
      const lines = block.split('\n').map(l => l.trim()).filter(l => l);
      if (lines.length < 5) return; // Need at least text + 4 opts

      const answerLineIdx = lines.findIndex(l => l.toLowerCase().startsWith('resposta:'));
      if (answerLineIdx === -1) return;

      const answerChar = lines[answerLineIdx].split(':')[1]?.trim()?.toUpperCase();
      if (!answerChar || !['A','B','C','D'].includes(answerChar)) return;

      const optsStart = lines.findIndex(l => l.startsWith('A)'));
      if (optsStart === -1) return;

      const text = lines.slice(0, optsStart).join(' ');
      const optA = lines.find(l => l.startsWith('A)'))?.substring(2).trim() || '';
      const optB = lines.find(l => l.startsWith('B)'))?.substring(2).trim() || '';
      const optC = lines.find(l => l.startsWith('C)'))?.substring(2).trim() || '';
      const optD = lines.find(l => l.startsWith('D)'))?.substring(2).trim() || '';

      if (text && optA && optB && optC && optD) {
        parsed.push({
          text,
          alternatives: { A: optA, B: optB, C: optC, D: optD },
          correctAnswer: answerChar as any
        });
      }
    });

    setParsedQuestions(parsed);
    setImportStatus(`${parsed.length} questões identificadas.`);
  };

  const saveImportedQuestions = () => {
    if (parsedQuestions.length === 0) return;
    saveQuestionsBatch(parsedQuestions);
    setParsedQuestions([]);
    setImportText('');
    setImportStatus('Questões salvas no banco com sucesso!');
    refreshData();
    setTimeout(() => setImportStatus(''), 3000);
  };

  // --- EXAM CREATE LOGIC ---
  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedQuestionIds.length === 0) {
      alert("Selecione ao menos uma questão.");
      return;
    }
    saveExam({
      title: newExamTitle,
      date: newExamDate,
      questionIds: selectedQuestionIds
    });
    setNewExamTitle('');
    setNewExamDate('');
    setSelectedQuestionIds([]);
    setActiveTab('LIST');
    refreshData();
  };

  // Filter questions helpers
  const filterQuestion = (q: Question, filterText: string) => {
    if (!filterText) return true;
    const lower = filterText.toLowerCase();
    return (
      q.text.toLowerCase().includes(lower) ||
      q.alternatives.A.toLowerCase().includes(lower) ||
      q.alternatives.B.toLowerCase().includes(lower) ||
      q.alternatives.C.toLowerCase().includes(lower) ||
      q.alternatives.D.toLowerCase().includes(lower) ||
      q.correctAnswer.toLowerCase().includes(lower)
    );
  };

  const filteredBankQuestions = questions.filter(q => filterQuestion(q, bankQuestionFilter));
  const filteredCreateQuestions = questions.filter(q => filterQuestion(q, createQuestionFilter));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Gerenciamento de Provas</h2>
        <div className="space-x-2">
          <button onClick={() => setActiveTab('LIST')} className={`px-4 py-2 rounded ${activeTab === 'LIST' ? 'bg-blue-600 text-white' : 'bg-white'}`}>Listar Provas</button>
          <button onClick={() => setActiveTab('CREATE')} className={`px-4 py-2 rounded ${activeTab === 'CREATE' ? 'bg-blue-600 text-white' : 'bg-white'}`}>Criar Prova</button>
          <button onClick={() => setActiveTab('BANK')} className={`px-4 py-2 rounded ${activeTab === 'BANK' ? 'bg-blue-600 text-white' : 'bg-white'}`}>Banco de Questões</button>
        </div>
      </div>

      {activeTab === 'LIST' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded shadow flex items-center gap-2">
            <Search className="text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar por título ou data..." 
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
                  <th className="p-4 text-left cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('title')}>
                    <div className="flex items-center gap-1">Título {renderSortIcon('title')}</div>
                  </th>
                  <th className="p-4 text-left cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('date')}>
                    <div className="flex items-center gap-1">Data {renderSortIcon('date')}</div>
                  </th>
                  <th className="p-4 text-left cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('questionCount')}>
                    <div className="flex items-center gap-1">Questões {renderSortIcon('questionCount')}</div>
                  </th>
                  <th className="p-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedExams.map(exam => (
                  <tr key={exam.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-medium">{exam.title}</td>
                    <td className="p-4">{new Date(exam.date).toLocaleDateString()}</td>
                    <td className="p-4">{exam.questionCount}</td>
                    <td className="p-4 text-right">
                      <button onClick={() => { deleteExam(exam.id); refreshData(); }} className="text-red-500 hover:text-red-700">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredAndSortedExams.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-gray-500">Nenhuma prova encontrada.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'BANK' && (
        <div className="space-y-4">
          {/* Global Search for Bank */}
          <div className="bg-white p-4 rounded shadow flex items-center gap-2">
            <Search className="text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar questões por enunciado, alternativas ou resposta correta..." 
              className="flex-1 outline-none text-slate-700 placeholder:text-slate-400"
              value={bankQuestionFilter}
              onChange={e => setBankQuestionFilter(e.target.value)}
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded shadow">
              <h3 className="font-bold mb-4 flex items-center gap-2"><Upload size={20} /> Importar TXT</h3>
              <p className="text-sm text-gray-500 mb-2">Cole o conteúdo do arquivo TXT. Formato: Enunciado, Alternativas A-D, Resposta: X.</p>
              <textarea 
                className="w-full h-64 border p-2 rounded text-xs font-mono" 
                value={importText}
                onChange={e => setImportText(e.target.value)}
                placeholder={`1. Qual a capital do Brasil?
A) Rio de Janeiro
B) Brasília
C) São Paulo
D) Belo Horizonte
Resposta: B`}
                spellCheck="false"
                autoComplete="off"
                autoCorrect="off"
              ></textarea>
              <div className="mt-4 flex gap-2">
                <button onClick={parseQuestions} className="bg-gray-600 text-white px-4 py-2 rounded">Analisar</button>
                <button onClick={saveImportedQuestions} disabled={parsedQuestions.length === 0} className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2">
                  <Save size={18} /> Salvar no Banco
                </button>
              </div>
              {importStatus && <p className="mt-2 text-sm font-bold text-blue-600">{importStatus}</p>}
            </div>

            <div className="bg-white p-6 rounded shadow h-[500px] flex flex-col">
              <h3 className="font-bold mb-4">Questões no Banco ({questions.length})</h3>
              
              {/* List */}
              <div className="flex-1 overflow-y-auto">
                <ul className="space-y-4">
                  {filteredBankQuestions.map((q, i) => (
                    <li key={q.id} className="text-sm border-b pb-2">
                      <p className="font-bold text-slate-700">{i+1}. {q.text.substring(0, 100)}...</p>
                      <p className="text-xs text-green-600">Resposta: {q.correctAnswer}</p>
                    </li>
                  ))}
                  {filteredBankQuestions.length === 0 && <p className="text-gray-500 text-sm">Nenhuma questão encontrada.</p>}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'CREATE' && (
        <form onSubmit={handleCreateExam} className="bg-white p-6 rounded shadow space-y-4" autoComplete="off">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Título da Prova</label>
              <input 
                type="text" required value={newExamTitle} 
                onChange={e => setNewExamTitle(e.target.value)} 
                className="w-full border p-2 rounded" 
                autoComplete="off" autoCorrect="off" spellCheck="false"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Data</label>
              <input type="date" required value={newExamDate} onChange={e => setNewExamDate(e.target.value)} className="w-full border p-2 rounded" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Selecionar Questões do Banco ({selectedQuestionIds.length} selecionadas)</label>
            
            <div className="flex items-center gap-2 bg-gray-50 p-2 rounded border mb-2">
               <Search size={16} className="text-gray-400" />
               <input 
                 type="text" 
                 placeholder="Filtrar questões..." 
                 className="bg-transparent outline-none flex-1 text-sm"
                 value={createQuestionFilter}
                 onChange={e => setCreateQuestionFilter(e.target.value)}
                 autoComplete="off"
                 autoCorrect="off"
                 spellCheck="false"
               />
            </div>

            <div className="border rounded h-64 overflow-y-auto p-2 space-y-2">
               {questions.length === 0 && <p className="text-gray-500 text-center mt-10">O banco de questões está vazio.</p>}
               {filteredCreateQuestions.length === 0 && questions.length > 0 && <p className="text-gray-500 text-center mt-2">Nenhuma questão encontrada.</p>}
               
               {filteredCreateQuestions.map(q => (
                 <div key={q.id} className="flex items-start gap-2 p-2 hover:bg-gray-50 border-b cursor-pointer" onClick={() => {
                    if(selectedQuestionIds.includes(q.id)) setSelectedQuestionIds(prev => prev.filter(id => id !== q.id));
                    else setSelectedQuestionIds(prev => [...prev, q.id]);
                 }}>
                   <input 
                     type="checkbox" 
                     className="mt-1 cursor-pointer"
                     checked={selectedQuestionIds.includes(q.id)}
                     onChange={() => {}} // Handled by div click
                     readOnly
                   />
                   <div className="text-sm select-none">
                     <p className="font-medium">{q.text}</p>
                   </div>
                 </div>
               ))}
            </div>
          </div>

          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">Criar Prova</button>
        </form>
      )}
    </div>
  );
};

export default ExamManager;
