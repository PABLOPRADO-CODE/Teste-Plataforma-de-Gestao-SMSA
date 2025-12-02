export type Role = 'ADMIN' | 'ALUNO' | 'GUEST';

export interface User {
  id: string;
  email: string;
  role: Role;
  name: string;
  principalId: string; // Auto-generated
  createdAt: number;
}

export interface Program {
  id: string;
  name: string;
  description: string;
  duration: number; // in years
  specializationArea: string;
  createdAt: number;
  updatedAt: number;
  status: 'active' | 'inactive';
}

export interface AcademicYear {
  id: string;
  year: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive';
  createdAt: number;
  updatedAt: number;
}

export interface ClassGroup { // Turma
  id: string;
  name: string;
  programId: string;
  yearId: string;
  maxStudents: number;
  status: 'active' | 'inactive';
  createdAt: number;
  updatedAt: number;
}

export interface Participant {
  id: string;
  name: string;
  email: string;
  registrationNumber: string; // Numero de registro
  course: string;
  principalId: string;
  classGroupId: string | null; // Optional link to Turma
  createdAt: number;
}

export interface Question {
  id: string;
  text: string; // Enunciado
  alternatives: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  tags?: string[];
}

export interface Exam {
  id: string;
  title: string;
  date: string;
  questionIds: string[]; // Linked questions
  createdAt: number;
}

export interface TimeRecord {
  id: string;
  participantId: string; // Link to user principalId or specific participant ID
  timestamp: number;
  type: 'ENTRADA' | 'SAIDA';
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, role: Role) => Promise<void>;
  logout: () => void;
  register: (data: Partial<Participant>) => Promise<void>;
}
