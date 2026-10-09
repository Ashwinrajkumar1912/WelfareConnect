export type SchemeCategory =
  | 'healthcare'
  | 'education'
  | 'housing'
  | 'food'
  | 'employment'
  | 'financial'
  | 'disability'
  | 'senior'
  | 'women'
  | 'agriculture';

export type Scheme = {
  id: string;
  title: string;
  category: SchemeCategory;
  description: string;
  eligibility: string;
  benefit_amount: number | null;
  benefit_unit: string | null;
  eligibility_criteria: string[];
  documents_required: string[];
  application_url: string | null;
  contact_info: string | null;
  created_at: string;
};

export type ApplicationStatus = 'interested' | 'applied' | 'under_review' | 'approved' | 'rejected' | 'disbursed';

export type UserScheme = {
  id: string;
  user_id: string;
  scheme_id: string;
  status: ApplicationStatus;
  amount_received: number | null;
  application_date: string | null;
  approval_date: string | null;
  next_action_date: string | null;
  next_action: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  scheme?: Scheme;
};

export type Reminder = {
  id: string;
  user_id: string;
  user_scheme_id: string | null;
  title: string;
  description: string | null;
  due_date: string;
  completed: boolean;
  created_at: string;
};

export const STATUS_META: Record<
  ApplicationStatus,
  { label: string; color: string; bg: string; step: number }
> = {
  interested: { label: 'Interested', color: '#6366f1', bg: '#eef2ff', step: 0 },
  applied: { label: 'Applied', color: '#0ea5e9', bg: '#e0f2fe', step: 1 },
  under_review: { label: 'Under Review', color: '#f59e0b', bg: '#fef3c7', step: 2 },
  approved: { label: 'Approved', color: '#16a34a', bg: '#dcfce7', step: 3 },
  disbursed: { label: 'Disbursed', color: '#059669', bg: '#d1fae5', step: 4 },
  rejected: { label: 'Rejected', color: '#dc2626', bg: '#fee2e2', step: -1 },
};

export const CATEGORY_META: Record<SchemeCategory, { label: string; icon: string }> = {
  healthcare: { label: 'Healthcare', icon: 'heart-pulse' },
  education: { label: 'Education', icon: 'graduation-cap' },
  housing: { label: 'Housing', icon: 'home' },
  food: { label: 'Food', icon: 'utensils' },
  employment: { label: 'Employment', icon: 'briefcase' },
  financial: { label: 'Financial', icon: 'wallet' },
  disability: { label: 'Disability', icon: 'accessibility' },
  senior: { label: 'Senior', icon: 'users-round' },
  women: { label: 'Women & Child', icon: 'baby' },
  agriculture: { label: 'Agriculture', icon: 'sprout' },
};

export const STATUS_ORDER: ApplicationStatus[] = [
  'interested',
  'applied',
  'under_review',
  'approved',
  'disbursed',
];
