import { User, Participant, Program, AcademicYear, ClassGroup, Question, Exam, TimeRecord } from '../types';

// Keys
const KEYS = {
  USERS: 'smsa_users',
  PARTICIPANTS: 'smsa_participants',
  PROGRAMS: 'smsa_programs',
  YEARS: 'smsa_years',
  CLASSES: 'smsa_classes',
  QUESTIONS: 'smsa_questions',
  EXAMS: 'smsa_exams',
  TIME_RECORDS: 'smsa_time_records',
};

// Helpers
const get = <T>(key: string): T[] => {
  try {
    const data = localStorage.getItem(key);
    // Ensure we always return an array, even if JSON.parse returns null/undefined
    const parsed = data ? JSON.parse(data) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error(`Error parsing ${key}`, e);
    return [];
  }
};

const set = <T>(key: string, data: T[]) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving ${key}`, e);
  }
};

const generateId = () => Math.random().toString(36).substring(2, 11);
const generatePrincipalId = () => `pid-${Math.random().toString(36).substring(2, 8)}-${Date.now().toString().slice(-4)}`;

// --- USERS (Admin Limit Logic) ---
export const getUsers = () => get<User>(KEYS.USERS);

export const createUser = (userData: Partial<User>): User => {
  const users = getUsers();
  
  if (userData.role === 'ADMIN') {
    const adminCount = users.filter(u => u.role === 'ADMIN').length;
    if (adminCount >= 20) {
      throw new Error("Limite de 20 administradores atingido. Não é possível criar novo administrador.");
    }
  }

  const existing = users.find(u => u.email === userData.email);
  if (existing) throw new Error("Email já cadastrado.");

  const newUser: User = {
    id: generateId(),
    email: userData.email || '',
    name: userData.name || 'Usuário',
    role: userData.role || 'GUEST',
    principalId: generatePrincipalId(),
    createdAt: Date.now(),
  };

  users.push(newUser);
  set(KEYS.USERS, users);
  return newUser;
};

export const updateUser = (id: string, data: Partial<User>) => {
  const list = getUsers();
  const idx = list.findIndex(u => u.id === id);
  if (idx === -1) throw new Error("Usuário não encontrado");
  
  // Prevent changing role to ADMIN if limit reached (unless already admin)
  if (data.role === 'ADMIN' && list[idx].role !== 'ADMIN') {
      const adminCount = list.filter(u => u.role === 'ADMIN').length;
      if (adminCount >= 20) throw new Error("Limite de 20 administradores atingido.");
  }

  list[idx] = { ...list[idx], ...data };
  set(KEYS.USERS, list);
  return list[idx];
};

export const deleteUser = (id: string) => {
    const list = getUsers();
    set(KEYS.USERS, list.filter(u => u.id !== id));
};

// --- PARTICIPANTS (Limit 1000) ---
export const getParticipants = () => get<Participant>(KEYS.PARTICIPANTS);

export const createParticipant = (data: Partial<Participant>): Participant => {
  const participants = getParticipants();
  
  if (participants.length >= 1000) {
    throw new Error("Limite de 1000 participantes atingido.");
  }

  const existing = participants.find(p => p.email === data.email || p.registrationNumber === data.registrationNumber);
  if (existing) throw new Error("Participante já existe (email ou registro duplicado).");

  const newPart: Participant = {
    id: generateId(),
    name: data.name!,
    email: data.email!,
    registrationNumber: data.registrationNumber!,
    course: data.course!,
    classGroupId: data.classGroupId || null,
    principalId: generatePrincipalId(),
    createdAt: Date.now(),
  };

  // Auto-create a user login for this participant
  const users = getUsers();
  const userUser: User = {
    id: generateId(),
    email: newPart.email,
    name: newPart.name,
    role: 'ALUNO',
    principalId: newPart.principalId,
    createdAt: Date.now()
  };
  users.push(userUser);
  set(KEYS.USERS, users);

  participants.push(newPart);
  set(KEYS.PARTICIPANTS, participants);
  return newPart;
};

export const updateParticipant = (id: string, data: Partial<Participant>) => {
    const list = getParticipants();
    const idx = list.findIndex(i => i.id === id);
    if (idx === -1) throw new Error("Participante não encontrado");
    list[idx] = { ...list[idx], ...data };
    set(KEYS.PARTICIPANTS, list);
    return list[idx];
};

export const deleteParticipant = (id: string) => {
    const list = getParticipants();
    set(KEYS.PARTICIPANTS, list.filter(i => i.id !== id));
};

// --- PROGRAMS ---
export const getPrograms = () => get<Program>(KEYS.PROGRAMS);
export const saveProgram = (data: Partial<Program>) => {
  const list = getPrograms();
  if (data.id) {
    const idx = list.findIndex(p => p.id === data.id);
    if (idx > -1) {
      list[idx] = { ...list[idx], ...data, updatedAt: Date.now() };
      set(KEYS.PROGRAMS, list);
      return list[idx];
    }
  }
  const newItem: Program = {
    id: generateId(),
    name: data.name!,
    description: data.description || '',
    duration: data.duration || 1,
    specializationArea: data.specializationArea || '',
    status: data.status || 'active',
    createdAt: Date.now(),
    updatedAt: Date.now()
  } as Program;
  list.push(newItem);
  set(KEYS.PROGRAMS, list);
  return newItem;
};
export const deleteProgram = (id: string) => set(KEYS.PROGRAMS, getPrograms().filter(p => p.id !== id));

// --- YEARS ---
export const getYears = () => get<AcademicYear>(KEYS.YEARS);
export const saveYear = (data: Partial<AcademicYear>) => {
  const list = getYears();
  if(data.id) {
      const idx = list.findIndex(y => y.id === data.id);
      if(idx > -1) {
          list[idx] = {...list[idx], ...data, updatedAt: Date.now()};
          set(KEYS.YEARS, list);
          return list[idx];
      }
  }
  const exists = list.find(y => y.year === data.year);
  if(exists) throw new Error("Ano letivo já cadastrado");

  const newItem: AcademicYear = {
      id: generateId(),
      year: data.year!,
      startDate: data.startDate!,
      endDate: data.endDate!,
      status: data.status || 'active',
      createdAt: Date.now(),
      updatedAt: Date.now()
  } as AcademicYear;
  list.push(newItem);
  set(KEYS.YEARS, list);
  return newItem;
};
export const deleteYear = (id: string) => set(KEYS.YEARS, getYears().filter(y => y.id !== id));

// --- CLASSES (TURMAS) ---
export const getClasses = () => get<ClassGroup>(KEYS.CLASSES);
export const saveClass = (data: Partial<ClassGroup>) => {
  const list = getClasses();
  if(data.id) {
    const idx = list.findIndex(c => c.id === data.id);
    if(idx > -1) {
        list[idx] = {...list[idx], ...data, updatedAt: Date.now()};
        set(KEYS.CLASSES, list);
        return list[idx];
    }
  }
  // Check duplicates (Program + Year + Name)
  const exists = list.find(c => c.programId === data.programId && c.yearId === data.yearId && c.name === data.name);
  if (exists) throw new Error("Turma duplicada para este programa e ano.");

  const newItem: ClassGroup = {
      id: generateId(),
      name: data.name!,
      programId: data.programId!,
      yearId: data.yearId!,
      maxStudents: data.maxStudents || 20,
      status: data.status || 'active',
      createdAt: Date.now(),
      updatedAt: Date.now()
  } as ClassGroup;
  list.push(newItem);
  set(KEYS.CLASSES, list);
  return newItem;
};
export const deleteClass = (id: string) => set(KEYS.CLASSES, getClasses().filter(c => c.id !== id));

// --- QUESTIONS ---
export const getQuestions = () => get<Question>(KEYS.QUESTIONS);
export const saveQuestion = (q: Partial<Question>) => {
    const list = getQuestions();
    const newItem: Question = {
        id: generateId(),
        text: q.text!,
        alternatives: q.alternatives!,
        correctAnswer: q.correctAnswer!,
        tags: q.tags || []
    };
    list.push(newItem);
    set(KEYS.QUESTIONS, list);
    return newItem;
};
export const saveQuestionsBatch = (qs: Partial<Question>[]) => {
    const list = getQuestions();
    const newItems = qs.map(q => ({
        id: generateId(),
        text: q.text!,
        alternatives: q.alternatives!,
        correctAnswer: q.correctAnswer!,
        tags: q.tags || []
    }));
    list.push(...newItems);
    set(KEYS.QUESTIONS, list);
    return newItems;
};

// --- EXAMS ---
export const getExams = () => get<Exam>(KEYS.EXAMS);
export const saveExam = (data: Partial<Exam>) => {
    const list = getExams();
    if(data.id) {
        const idx = list.findIndex(e => e.id === data.id);
        if (idx > -1) {
            list[idx] = {...list[idx], ...data};
            set(KEYS.EXAMS, list);
            return list[idx];
        }
    }
    const newItem: Exam = {
        id: generateId(),
        title: data.title!,
        date: data.date!,
        questionIds: data.questionIds || [],
        createdAt: Date.now()
    };
    list.push(newItem);
    set(KEYS.EXAMS, list);
    return newItem;
};
export const deleteExam = (id: string) => set(KEYS.EXAMS, getExams().filter(e => e.id !== id));

// --- TIME RECORDS (PONTO) ---
export const getTimeRecords = () => get<TimeRecord>(KEYS.TIME_RECORDS);
export const addTimeRecord = (participantPrincipalId: string): TimeRecord => {
    const records = getTimeRecords();
    const today = new Date();
    const startOfDay = new Date(today.setHours(0,0,0,0)).getTime();
    
    // Filter records for this user for today
    const userTodayRecords = records.filter(r => 
        r.participantId === participantPrincipalId && 
        r.timestamp >= startOfDay
    ).sort((a,b) => a.timestamp - b.timestamp);

    // Rule: Mon-Sat only
    const dayOfWeek = new Date().getDay(); // 0 = Sun, 6 = Sat
    if (dayOfWeek === 0) {
        throw new Error("Registro de ponto não permitido aos domingos.");
    }

    // Rule: Max 6 per day
    if (userTodayRecords.length >= 6) {
        throw new Error("Limite de 6 registros diários atingido.");
    }

    // Determine type: Alternating
    let type: 'ENTRADA' | 'SAIDA' = 'ENTRADA';
    if (userTodayRecords.length > 0) {
        const lastRecord = userTodayRecords[userTodayRecords.length - 1];
        type = lastRecord.type === 'ENTRADA' ? 'SAIDA' : 'ENTRADA';
    }

    // Debounce check (prevent double click)
    if (userTodayRecords.length > 0) {
        const lastTime = userTodayRecords[userTodayRecords.length - 1].timestamp;
        if (Date.now() - lastTime < 60000) { // 1 minute
            throw new Error("Aguarde 1 minuto entre registros.");
        }
    }

    const newRecord: TimeRecord = {
        id: generateId(),
        participantId: participantPrincipalId,
        timestamp: Date.now(),
        type
    };

    records.push(newRecord);
    set(KEYS.TIME_RECORDS, records);
    return newRecord;
};

// Initialize Mock Data Safely
try {
  // Only init if window is defined (client-side)
  if (typeof window !== 'undefined' && getUsers().length === 0) {
      createUser({ email: 'admin@smsa.pbh.gov.br', role: 'ADMIN', name: 'Administrador Padrão' });
  }
} catch (e) {
  console.error("Failed to initialize default user", e);
}