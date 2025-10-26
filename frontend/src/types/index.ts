export interface Professor {
  id: number;
  name: string;
  email: string;
  department: string;
}

export interface Subject {
  id: number;
  name: string;
  code: string;
  description?: string;
  professor_id: number;
  created_at: string;
}

export interface Assignment {
  id: number;
  title: string;
  description: string;
  due_date: string;
  max_points: number;
  professor_id: number;
  subject_id: number;
  subject?: Subject;
  created_at: string;
  average_score?: number;
  is_graded?: boolean;
}

export interface ChatMessage {
  id: number;
  text: string;
  isUser: boolean;
}

export interface Stats {
  totalAssignments: number;
  totalSubmissions: number;
  averageScore: number;
  gradedAssignments: number;
}

export interface Grade {
  student_name: string;
  percentage: number;
  feedback: string;
  submission_id: number;
}
