export type Role = "super_admin" | "school_coordinator" | "volunteer" | "jury" | "event_coordinator";

export type Domain =
  | "IoT & Smart Cities"
  | "AI / Generative AI"
  | "Climate & Environmental Intelligence"
  | "Disaster Prediction & Response"
  | "Cybersecurity"
  | "Healthcare Technology"
  | "Open Innovation";

export interface User {
  id: string;
  username: string;
  email: string;
  role: Role;
  target_domain?: string | null;
  school?: School | string | null;
  isApproved?: boolean;
}

export interface School {
  _id: string;
  name: string;
  code: string;
  address: string;
  district: string;
  state: string;
  pincode: string;
  principalName: string;
  inChargeName: string;
  coordinatorEmail: string;
  coordinatorMobile: string;
  teachersCount: number;
  teacherNames: string[];
  emergencyContact: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Event {
  _id: string;
  title: string;
  description?: string;
  date: string;
  venue: string;
  status: "active" | "locked" | "archived";
  registrationDeadline: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Student {
  _id: string;
  name: string;
  gender: "Male" | "Female" | "Other";
  dob: string;
  class: string;
  section: string;
  school: School | string;
  event: Event | string;
  principalName: string;
  inChargeName: string;
  teacherName: string;
  emergencyContact: string;
  phone: string;
  category: "Visitor" | "Project Presenter";
  registrationNumber: string;
  teamName?: string;
  ticketGenerated: boolean;
  checkedIn: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Project {
  _id: string;
  projectId: string;
  title: string;
  abstract: string;
  domain: Domain;
  teamName: string;
  members: Student[] | string[];
  guideTeacher: string;
  requiredEquipment?: string;
  description?: string;
  stallNumber?: string | null;
  status: "Registered" | "Checked In" | "Evaluated" | "Winner";
  event: Event | string;
  score: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Evaluation {
  _id: string;
  project: Project | string;
  jury: User | string;
  innovation: number;
  technicalKnowledge: number;
  presentation: number;
  practicalImplementation: number;
  socialImpact: number;
  totalMarks: number;
  remarks?: string;
  isLocked: boolean;
  scores?: { criterionId: string; marks: number }[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AuditLog {
  _id: string;
  actor?: User | null;
  actorUsername?: string;
  action: string;
  details: any;
  ipAddress?: string;
  createdAt: string;
}

export const domains: Domain[] = [
  "AI / Generative AI",
  "Cybersecurity",
  "IoT & Smart Cities",
  "Disaster Prediction & Response",
  "Healthcare Technology",
  "Climate & Environmental Intelligence",
  "Open Innovation",
];

export const EVALUATION_MAX_POINTS = {
  innovation: 25,
  technicalKnowledge: 20,
  presentation: 20,
  practicalImplementation: 20,
  socialImpact: 15,
};
