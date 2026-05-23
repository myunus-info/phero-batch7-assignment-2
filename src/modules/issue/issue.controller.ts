import type { Request, Response } from 'express';
import { issueService } from './issue.service';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';

const createIssue = async (req: Request, res: Response) => {
  const reporter_id = Number(req.user?.id);
  const { title, description, type, status = 'in_progress' } = req.body;

  if (!reporter_id) {
    return sendResponse(res, {
      statusCode: httpStatus.UNAUTHORIZED,
      success: false,
      message: 'Invalid or missing user identity',
    });
  }

  if (!title || !description || !type) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: 'Title, description, and type are required',
    });
  }

  const issue = await issueService.createIssue({
    title,
    description,
    type,
    reporter_id,
    status,
  });

  return sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Issue created successfully',
    data: {
      id: issue.id,
      title: issue.title,
      description: issue.description,
      type: issue.type,
      status: issue.status,
      reporter_id: issue.reporter_id,
      created_at: issue.created_at,
      updated_at: issue.updated_at,
    },
  });
};

const getAllIssues = async (req: Request, res: Response) => {
  const { sort, type, status } = req.query;

  const issues = await issueService.getAllIssues({
    sort: typeof sort === 'string' ? sort : undefined,
    type: typeof type === 'string' ? type : undefined,
    status: typeof status === 'string' ? status : undefined,
  });

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Issues retrieved successfully',
    data: issues,
  });
};

const getIssueById = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: 'Invalid issue id',
    });
  }

  const issue = await issueService.getIssueById(id);
  if (!issue) {
    return sendResponse(res, {
      statusCode: httpStatus.NOT_FOUND,
      success: false,
      message: 'Issue not found',
    });
  }

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Issue retrieved successfully',
    data: issue,
  });
};

const updateIssue = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const reporter_id = Number(req.user?.id);
  const role = req.user?.role as string;
  const { title, description, type, status } = req.body;

  if (Number.isNaN(id)) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: 'Invalid issue id',
    });
  }

  if (!title && !description && !type && !status) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: 'At least one field must be provided to update',
    });
  }

  const issue = await issueService.updateIssue({
    issue_id: id,
    title,
    description,
    type,
    status,
    reporter_id,
    user_role: role,
  });

  if (!issue) {
    return sendResponse(res, {
      statusCode: httpStatus.NOT_FOUND,
      success: false,
      message: 'Issue not found',
    });
  }

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Issue updated successfully',
    data: issue,
  });
};

const deleteIssue = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: 'Invalid issue id',
    });
  }

  await issueService.deleteIssue(id);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Issue deleted successfully',
  });
};

export const issueController = {
  createIssue,
  getAllIssues,
  getIssueById,
  updateIssue,
  deleteIssue,
};
