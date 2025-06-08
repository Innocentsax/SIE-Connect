export interface User {
  id: number;
  name: string | null;
  email: string;
  role: 'FOUNDER' | 'FUNDER' | 'ECOSYSTEM_BUILDER' | 'ADMIN';
  profileCompleted: boolean | null;
  onboardingCompleted: boolean | null;
  company: string | null;
  sector: string | null;
  location: string | null;
  interests: string | null;
  experience: string | null;
  stage: string | null;
  investmentRange: string | null;
  socialEnterpriseFlag: boolean | null;
  foundedYear: number | null;
  employeeCount: number | null;
  createdAt: Date | null;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: 'FOUNDER' | 'FUNDER' | 'ECOSYSTEM_BUILDER';
}

export interface Startup {
  id: number;
  name: string;
  sector: string | null;
  location: string | null;
  description: string | null;
  stage: string | null;
  website: string | null;
  employeeCount: number | null;
  foundedYear: number | null;
  socialEnterpriseFlag: boolean | null;
  ownerUserId: number | null;
  createdAt: Date | null;
}

export interface Opportunity {
  id: number;
  type: string;
  title: string;
  link: string | null;
  sector: string | null;
  location: string | null;
  description: string | null;
  provider: string | null;
  criteria: string | null;
  deadline: Date | null;
  amount: string | null;
  creatorUserId: number | null;
  createdAt: Date | null;
}

export interface SearchResult {
  startups: Startup[];
  opportunities: Opportunity[];
  total: number;
}

export interface Application {
  id: number;
  opportunityId: number;
  userId: number;
  status: string;
  submittedAt: Date | null;
  reviewedAt: Date | null;
  feedback: string | null;
}

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  Search: undefined;
  Discovery: undefined;
  Profile: undefined;
  Applications: undefined;
  StartupDetail: { id: number };
  OpportunityDetail: { id: number };
};