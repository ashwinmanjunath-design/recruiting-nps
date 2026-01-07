import { CandidateStatus } from '../enums';

export interface Candidate {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: string;
  country?: string;
  region?: string;
  source?: string;
  interviewStage?: string;
  status: CandidateStatus;
  appliedAt: string;
  srCandidateId?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface Job {
  id: string;
  title: string;
  department?: string;
  location?: string;
  srJobId?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CandidateJob {
  id: string;
  candidateId: string;
  jobId: string;
  appliedAt: string;
  stage?: string;
  status?: string;
}

