import { pool } from '../../db';

import { IssuePayload, IssueFilter, UpdateIssuePayload, IssueRow, ReporterRow } from '../../types';

const createIssue = async (payload: IssuePayload) => {
  const { title, description, type, reporter_id, status } = payload;

  const result = await pool.query(
    `INSERT INTO issues (title, description, type, reporter_id, status)
     VALUES ($1, $2, $3, $4, COALESCE($5, 'in_progress'))
     RETURNING *`,
    [title, description, type, reporter_id, status],
  );

  return result.rows[0];
};

const getAllIssues = async (filter: IssueFilter) => {
  const conditions: string[] = [];
  const values: Array<string> = [];
  let idx = 1;
  let order = 'ORDER BY issues.created_at DESC';

  if (filter.type) {
    const normalizedType = filter.type === 'feature_request' ? 'feature_request' : 'bug';
    if (['bug', 'feature_request'].includes(normalizedType)) {
      conditions.push(`issues.type = $${idx}`);
      values.push(normalizedType);
      idx += 1;
    }
  }

  if (filter.status && ['open', 'in_progress', 'resolved'].includes(filter.status)) {
    conditions.push(`issues.status = $${idx}`);
    values.push(filter.status);
    idx += 1;
  }

  if (filter.sort === 'oldest') {
    order = 'ORDER BY issues.created_at ASC';
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const issueResult = await pool.query<IssueRow>(
    `SELECT issues.* FROM issues ${where} ${order}`,
    values,
  );

  const issues = issueResult.rows;
  if (!issues.length) return [];

  const reporterIds = Array.from(new Set(issues.map(issue => issue.reporter_id)));
  const reporterResult = await pool.query<ReporterRow>(
    `SELECT id, name, role FROM auth WHERE id = ANY($1::int[])`,
    [reporterIds],
  );

  const reporterMap = reporterResult.rows.reduce<Record<number, ReporterRow>>((acc, reporter) => {
    acc[reporter.id] = reporter;
    return acc;
  }, {});

  return issues.map(issue => ({
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter: reporterMap[issue.reporter_id] ?? {
      id: issue.reporter_id,
      name: 'Unknown',
      role: 'unknown',
    },
    created_at: issue.created_at,
    updated_at: issue.updated_at,
  }));
};

const getIssueById = async (issue_id: number) => {
  const issueResult = await pool.query<IssueRow>(`SELECT * FROM issues WHERE id = $1`, [issue_id]);

  if (issueResult.rows.length === 0) return null;

  const issue = issueResult.rows[0];
  const reporterResult = await pool.query<ReporterRow>(
    `SELECT id, name, role FROM auth WHERE id = $1`,
    [issue.reporter_id],
  );

  const reporter = reporterResult.rows[0] ?? {
    id: issue.reporter_id,
    name: 'Unknown',
    role: 'unknown',
  };

  return {
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter,
    created_at: issue.created_at,
    updated_at: issue.updated_at,
  };
};

const updateIssue = async (payload: UpdateIssuePayload) => {
  const { issue_id, title, description, type, status, reporter_id, user_role } = payload;

  const issueResult = await pool.query<IssueRow>(`SELECT * FROM issues WHERE id = $1`, [issue_id]);
  if (issueResult.rows.length === 0) return null;

  const issue = issueResult.rows[0];

  if (issue.reporter_id !== reporter_id) {
    throw new Error('Forbidden: contributors can only update their own issues');
  }

  if (issue.status !== 'open') {
    throw new Error('Forbidden: contributors can only update issues when status is open');
  }

  const fields: string[] = [];
  const values: Array<string> = [];
  let idx = 1;

  if (title) {
    fields.push(`title = $${idx}`);
    values.push(title);
    idx += 1;
  }
  if (description) {
    fields.push(`description = $${idx}`);
    values.push(description);
    idx += 1;
  }
  if (type) {
    if (!['bug', 'feature_request'].includes(type)) {
      throw new Error('Invalid issue type');
    }
    fields.push(`type = $${idx}`);
    values.push(type);
    idx += 1;
  }
  if (status) {
    if (!['open', 'in_progress', 'resolved'].includes(status)) {
      throw new Error('Invalid issue status');
    }
    fields.push(`status = $${idx}`);
    values.push(status);
    idx += 1;
  }

  if (!fields.length) return issue;

  const result = await pool.query<IssueRow>(
    `UPDATE issues SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${idx} RETURNING *`,
    [...values, issue_id],
  );

  return result.rows[0];
};

const deleteIssue = async (issue_id: number) => {
  await pool.query(`DELETE FROM issues WHERE id = $1`, [issue_id]);
};

export const issueService = {
  createIssue,
  getAllIssues,
  getIssueById,
  updateIssue,
  deleteIssue,
};
