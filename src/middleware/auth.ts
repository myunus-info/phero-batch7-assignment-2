import type { NextFunction, Request, Response } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import config from '../config';
import { pool } from '../db';
import type { ROLES } from '../types';

const auth = (...roles: ROLES[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    console.log(roles);
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

      // console.log(token);
      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized access!!',
        });
      }

      const decoded = jwt.verify(token as string, config.jwtSecret as string) as JwtPayload;

      const userData = await pool.query(
        `
     SELECT * FROM auth WHERE email=$1   
        `,
        [decoded.email],
      );

      const user = userData.rows[0];

      // console.log(user);
      if (userData.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found!',
        });
      }

      if (roles.length && !roles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden!!, This user has no access!',
        });
      }

      req.user = decoded;

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default auth;
