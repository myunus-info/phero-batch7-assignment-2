import dotenv from 'dotenv';
import path from 'path';
dotenv.config({
  path: path.join(process.cwd(), '.env'),
});

const config = {
  connection_string: process.env.DATABASE_CONNECTION_STRING as string,
  port: process.env.PORT,
  bcrypt_salt_rounds: Number(process.env.BCRYPT_SALT_ROUNDS),
  jwtSecret: process.env.JWT_SECRET,
};

export default config;
