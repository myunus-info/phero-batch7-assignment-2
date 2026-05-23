import bcrypt from 'bcryptjs';
import { pool } from './../../db/index';

import jwt, { type JwtPayload } from 'jsonwebtoken';
import config from '../../config';

const registerUserIntoDB = async (payload: {
  name: string;
  email: string;
  password: string;
  role: 'contributor' | 'maintainer';
}) => {
  const { name, email, password, role } = payload;

  const user = await pool.query(`SELECT * FROM auth WHERE email = $1`, [email]);

  if (user.rows.length) throw new Error('The user already exists!');

  const hashedPassword = await bcrypt.hash(password, config.bcrypt_salt_rounds as number);

  const result = await pool.query(
    `INSERT INTO auth (name, email, password, role) VALUES ($1, $2, $3, COALESCE($4, 'contributor')) RETURNING *`,
    [name, email, hashedPassword, role],
  );

  delete result.rows[0].password;

  return result;
};

const loginUserIntoDB = async (payload: { email: string; password: string }) => {
  const { email, password } = payload;

  const userData = await pool.query(
    `
    SELECT * FROM auth WHERE email=$1
    `,
    [email],
  );

  if (userData.rows.length === 0) throw new Error('Invalid Credentials!');

  const user = userData?.rows[0];
  const isPasswordPatched = await bcrypt.compare(password, user.password);

  if (!isPasswordPatched) throw new Error('Invalid Credentials!');

  const jwtpayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const token = jwt.sign(jwtpayload, config.jwtSecret as string, {
    expiresIn: '1d',
  });

  return { token, user };
};

export const authService = {
  registerUserIntoDB,
  loginUserIntoDB,
};
