export interface CohortDefinition {
  id: string;
  name: string;
  description?: string;
  filters: any;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CohortMembership {
  id: string;
  cohortId: string;
  candidateId: string;
  addedAt: string;
}

export interface CohortMetrics {
  cohortId: string;
  cohortName: string;
  totalMembers: number;
  totalResponses: number;
  npsScore: number;
  promoters: number;
  passives: number;
  detractors: number;
  responseRate: number;
  avgTimeDays: number;
}

