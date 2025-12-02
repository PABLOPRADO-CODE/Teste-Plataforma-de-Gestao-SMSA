import React from 'react';
import { getParticipants, getTimeRecords, getExams } from '../../services/storage';
import { Download, FileJson, FileSpreadsheet, FileText } from 'lucide-react';
import * as XLSX from 'xlsx';

const Reports: React.FC = () => {

  const exportData = (data: any[], type: 'participants' | 'time' | 'exams', format: 'json' | 'csv' | 'xlsx') => {
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `relatorio_${type}_${dateStr}`;

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.json`;
      a.click();
    } else {
      // Prepare Sheet
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Dados");

      // Export
      if (format === 'csv') {
        XLSX.writeFile(wb, `${filename}.csv`, { bookType: 'csv' });
      } else {
        XLSX.writeFile(wb, `${filename}.xlsx`, { bookType: 'xlsx' });
      }
    }
  };

  const handleExport = (type: 'participants' | 'time' | 'exams', format: 'json' | 'csv' | 'xlsx') => {
    let data: any[] = [];
    switch (type) {
      case 'participants': 
        data = getParticipants(); 
        break;
      case 'time': 
        data = getTimeRecords(); 
        break;
      case 'exams': 
        data = getExams(); 
        break;
    }
    
    if (data.length === 0) {
      alert("Não há dados para exportar neste relatório.");
      return;
    }

    exportData(data, type, format);
  };

  const ReportCard = ({ title, description, type, icon }: { title: string, description: string, type: 'participants' | 'time' | 'exams', icon: React.ReactNode }) => (
    <div className="bg-white border border-slate-200 p-6 rounded-xl hover:shadow-md transition-shadow flex flex-col items-center text-center">
      <div className="p-3 bg-slate-100 rounded-full text-slate-600 mb-4">
        {icon}
      </div>
      <h3 className="font-bold text-lg text-slate-800 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 mb-6 flex-1">{description}</p>
      
      <div className="w-full space-y-2">
        <button 
          onClick={() => handleExport(type, 'xlsx')} 
          className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors"
        >
           <FileSpreadsheet size={16} /> Excel (.xlsx)
        </button>
        <button 
          onClick={() => handleExport(type, 'csv')} 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors"
        >
           <FileText size={16} /> CSV (.csv)
        </button>
        <button 
          onClick={() => handleExport(type, 'json')} 
          className="w-full bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors"
        >
           <FileJson size={16} /> JSON (.json)
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Relatórios e Exportação</h2>
        <p className="text-slate-500">Exporte os dados administrativos e operacionais do sistema.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ReportCard 
            title="Participantes" 
            description="Dados cadastrais completos de todos os participantes registrados, incluindo turmas e identificadores."
            type="participants"
            icon={<Download size={24} />}
          />

          <ReportCard 
            title="Registros de Ponto" 
            description="Histórico detalhado de entradas e saídas de todos os alunos, com timestamps precisos."
            type="time"
            icon={<Download size={24} />}
          />

          <ReportCard 
            title="Provas Criadas" 
            description="Relatório de todas as provas cadastradas no sistema, incluindo datas e quantidade de questões."
            type="exams"
            icon={<Download size={24} />}
          />
      </div>
    </div>
  );
};
export default Reports;