export const USER_ROLE = {
  contributor: 'contributor',
  maintainer: 'maintainer',
} as const;

export type ROLES = 'contributor' | 'maintainer';

export type IssuePayload = {
  title: string;
  description: string;
  type: 'bug' | 'feature_request';
  reporter_id: number;
  status: 'open' | 'in_progress' | 'resolved';
};

export type IssueFilter = {
  sort?: string;
  type?: string;
  status?: string;
};

export type UpdateIssuePayload = {
  issue_id: number;
  title?: string;
  description?: string;
  type?: 'bug' | 'feature_request';
  status?: 'open' | 'in_progress' | 'resolved';
  reporter_id: number;
  user_role: string;
};

export type IssueRow = {
  id: number;
  title: string;
  description: string;
  type: string;
  status: string;
  reporter_id: number;
  created_at: string;
  updated_at: string;
};

export type ReporterRow = {
  id: number;
  name: string;
  role: string;
};
