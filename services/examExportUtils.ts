import { jsPDF } from 'jspdf';
import { Exam, Question, Participant } from '../types';

/**
 * Constants for Layout
 */
const MARGIN_TOP = 25; // mm
const MARGIN_BOTTOM = 25; // mm
const MARGIN_LEFT = 20; // mm
const MARGIN_RIGHT = 20; // mm
const PAGE_HEIGHT = 297; // A4 height mm
const PAGE_WIDTH = 210; // A4 width mm
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;

// Helper to check Y position and add page if needed
const checkPageBreak = (doc: jsPDF, currentY: number, requiredSpace: number): number => {
  if (currentY + requiredSpace > PAGE_HEIGHT - MARGIN_BOTTOM) {
    doc.addPage();
    return MARGIN_TOP;
  }
  return currentY;
};

/**
 * 1. Generate Cover Sheet (Capa do Caderno de Prova)
 */
export const generateCoverPDF = (doc: jsPDF, exam: Exam, participant: Participant) => {
  doc.setFont('times', 'bold');
  doc.setFontSize(18);
  
  // Header Logo / Title Area
  doc.text("SMSA/PBH", PAGE_WIDTH / 2, 40, { align: 'center' });
  doc.setFontSize(14);
  doc.text("Gestão Acadêmica dos Programas de Residência", PAGE_WIDTH / 2, 50, { align: 'center' });

  // Divider
  doc.setLineWidth(0.5);
  doc.line(MARGIN_LEFT, 60, PAGE_WIDTH - MARGIN_RIGHT, 60);

  // Exam Title
  doc.setFontSize(24);
  doc.text(exam.title.toUpperCase(), PAGE_WIDTH / 2, 90, { align: 'center' });

  // Participant Box
  doc.setDrawColor(0);
  doc.rect(MARGIN_LEFT, 120, CONTENT_WIDTH, 80);

  doc.setFontSize(12);
  doc.text("CANDIDATO:", MARGIN_LEFT + 5, 135);
  doc.setFontSize(16);
  doc.text(participant.name.toUpperCase(), MARGIN_LEFT + 5, 145);

  doc.setFontSize(12);
  doc.text("PRINCIPAL ID:", MARGIN_LEFT + 5, 165);
  doc.setFontSize(14);
  doc.setFont('times', 'normal'); // Monospace-ish look for ID
  doc.text(participant.principalId, MARGIN_LEFT + 5, 175);

  doc.setFont('times', 'bold');
  doc.text("DATA:", MARGIN_LEFT + 120, 165);
  doc.text(new Date(exam.date).toLocaleDateString('pt-BR'), MARGIN_LEFT + 120, 175);
  
  // Instructions
  doc.setFontSize(10);
  doc.setFont('times', 'italic');
  doc.text("Instruções: Confira seus dados acima. A prova contém questões de múltipla escolha.", PAGE_WIDTH / 2, 220, { align: 'center' });
  doc.text("Utilize caneta esferográfica azul ou preta.", PAGE_WIDTH / 2, 225, { align: 'center' });
};

/**
 * 2. Generate Exam Body (Template de Prova)
 * Strict A4 margins, Times New Roman, No footer.
 */
export const generateExamBodyPDF = (doc: jsPDF, exam: Exam, questions: Question[]) => {
  doc.addPage();
  let y = MARGIN_TOP;

  // Small Header on first page of questions
  doc.setFont('times', 'bold');
  doc.setFontSize(12);
  doc.text(`${exam.title} - CADERNO DE QUESTÕES`, MARGIN_LEFT, y);
  y += 15;

  doc.setFont('times', 'normal');
  doc.setFontSize(11);

  questions.forEach((q, index) => {
    // Estimate height
    const splitText = doc.splitTextToSize(`${index + 1}. ${q.text}`, CONTENT_WIDTH);
    const textHeight = splitText.length * 5; // approx 5mm per line
    const optionsHeight = 25; // 4 lines + spacing
    const totalBlockHeight = textHeight + optionsHeight + 10; // + padding

    y = checkPageBreak(doc, y, totalBlockHeight);

    // Render Question Text
    doc.text(splitText, MARGIN_LEFT, y);
    y += textHeight + 2;

    // Render Options
    const opts = ['A', 'B', 'C', 'D'] as const;
    opts.forEach((opt) => {
      const optText = doc.splitTextToSize(`${opt}) ${q.alternatives[opt]}`, CONTENT_WIDTH - 10);
      const optH = optText.length * 5;
      y = checkPageBreak(doc, y, optH);
      doc.text(optText, MARGIN_LEFT + 5, y);
      y += optH + 1;
    });

    y += 6; // Spacing between questions
  });

  // NO FOOTER strictly enforced.
};

/**
 * 3. Generate Answer Sheet (Gabarito - Ultra Compact)
 * Must fit on ONE PAGE.
 * Strict specs:
 * 20-40 qs: Margin 15mm, Font 12/10pt, Bubble 8mm
 * 41-60 qs: Margin 10mm, Font 10/8pt, Bubble 6mm
 * 61+ qs: Margin 7mm, Font 8/7pt, Bubble 4mm
 */
export const generateAnswerSheetPDF = (doc: jsPDF, exam: Exam, participant: Participant, questions: Question[]) => {
  doc.addPage();
  const qCount = questions.length;

  // Determine Density Mode
  let mode: 'NORMAL' | 'COMPACT' | 'EXTRA_COMPACT' = 'NORMAL';
  if (qCount > 60) mode = 'EXTRA_COMPACT';
  else if (qCount > 40) mode = 'COMPACT';

  // Config based on strict specs
  const config = {
    NORMAL: { 
      margin: 15, 
      headerFont: 12, 
      contentFont: 10, 
      bubbleDiameter: 8, 
      bubbleSpacing: 2, 
      cellHeight: 12, // Needs enough for 8mm bubble + spacing
      headerHeight: 25 
    },
    COMPACT: { 
      margin: 10, 
      headerFont: 10, 
      contentFont: 8, 
      bubbleDiameter: 6, 
      bubbleSpacing: 1.5, 
      cellHeight: 9, 
      headerHeight: 18 
    },
    EXTRA_COMPACT: { 
      margin: 7, 
      headerFont: 8, 
      contentFont: 7, 
      bubbleDiameter: 4, 
      bubbleSpacing: 1, 
      cellHeight: 6, 
      headerHeight: 12 
    }
  }[mode];

  const contentWidth = PAGE_WIDTH - (config.margin * 2);

  // Header
  let y = config.margin;
  doc.setFont('times', 'bold');
  doc.setFontSize(config.headerFont + 2); // Title slightly larger
  doc.text("FOLHA DE RESPOSTAS", PAGE_WIDTH / 2, y + 5, { align: 'center' });
  y += config.headerHeight;
  
  doc.setFontSize(config.headerFont);
  doc.text(`Participante: ${participant.name}`, config.margin, y);
  doc.text(`ID: ${participant.principalId}`, PAGE_WIDTH - config.margin - 40, y);
  y += 5;
  doc.text(`Prova: ${exam.title}`, config.margin, y);
  y += 5;

  // Line
  doc.setLineWidth(0.3);
  doc.line(config.margin, y, PAGE_WIDTH - config.margin, y);
  y += 5;

  // Calculation for columns
  // Available height for bubbles
  const availableHeight = PAGE_HEIGHT - y - config.margin;
  const maxRowsPerCol = Math.floor(availableHeight / config.cellHeight);
  const numCols = Math.ceil(qCount / maxRowsPerCol);
  
  const colWidth = contentWidth / numCols;
  const bubbleRadius = config.bubbleDiameter / 2;

  doc.setFontSize(config.contentFont);

  for (let i = 0; i < qCount; i++) {
    const colIndex = Math.floor(i / maxRowsPerCol);
    const rowIndex = i % maxRowsPerCol;

    const xBase = config.margin + (colIndex * colWidth);
    const yBase = y + (rowIndex * config.cellHeight);

    // Question Number
    // Vertically center text
    doc.text(`${i + 1}.`, xBase, yBase + (config.cellHeight/2) + 1);

    // Bubbles
    ['A', 'B', 'C', 'D'].forEach((opt, idx) => {
      // Calculate X pos: xBase + number_width + (idx * (diameter + spacing))
      const numberWidth = 8; // approx
      const bX = xBase + numberWidth + bubbleRadius + (idx * (config.bubbleDiameter + config.bubbleSpacing));
      const bY = yBase + (config.cellHeight/2) - 1;
      
      doc.circle(bX, bY, bubbleRadius, 'S'); // S = Stroke
      
      // Center letter in bubble (tiny font)
      doc.setFontSize(config.contentFont - 2);
      doc.text(opt, bX, bY + (bubbleRadius/2.5), { align: 'center' }); // Optical center adjustment
      doc.setFontSize(config.contentFont);
    });
  }

  // NO FOOTER strictly enforced.
};

/**
 * Main Export Function (Full Package)
 */
export const generateExamPackage = (exam: Exam, participants: Participant[], questions: Question[]) => {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  participants.forEach((p, idx) => {
    if (idx > 0) doc.addPage(); // New sheet for new participant package
    
    // 1. Cover
    generateCoverPDF(doc, exam, p);
    
    // 2. Body
    generateExamBodyPDF(doc, exam, questions);
    
    // 3. Answer Sheet
    generateAnswerSheetPDF(doc, exam, p, questions);
  });

  doc.save(`Prova_${exam.title.replace(/\s+/g, '_')}_${participants.length}_Participantes.pdf`);
};

/**
 * Export Function (Answer Sheets Only - Consolidated)
 */
export const generateAnswerSheetsOnly = (exam: Exam, participants: Participant[], questions: Question[]) => {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  
  // Remove the default blank first page because generateAnswerSheetPDF adds a page immediately
  doc.deletePage(1);

  participants.forEach((p) => {
    // Reuses the exact same layout logic
    generateAnswerSheetPDF(doc, exam, p, questions);
  });

  doc.save(`Gabaritos_${exam.title.replace(/\s+/g, '_')}_${participants.length}_Participantes.pdf`);
};