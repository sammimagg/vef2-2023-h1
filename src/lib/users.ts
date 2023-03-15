import bcrypt from 'bcrypt';
import { User } from '../types.js';
import { query } from './db.js';

export async function comparePasswords(password: string, hash: string) {
  try {
    return await bcrypt.compare(password, hash);
  } catch (e) {
    console.error('Gat ekki borið saman lykilorð', e);
  }

  return false;
}

export async function findByUsername(user: User) {
  const q = 'SELECT * FROM users WHERE username = $1';

  const result = await query(q, [user.username]);

  if (result?.rowCount === 1) {
    return result.rows[0];
  }

  return false;
}

export async function findById(id: number) {
  const q = 'SELECT * FROM users WHERE id = $1';

  try {
    const result = await query(q, [id]);

    if (result.rowCount === 1) {
      return result.rows[0];
    }
  } catch (e) {
    console.error('Gat ekki fundið notanda eftir id');
  }

  return null;
}

export async function createUser(user : User) {
  // Geymum hashað password!
  const hashedPassword = await bcrypt.hash(user.password, 11);


  const q = `
    INSERT INTO
      users (name, username, password)
    VALUES ($1, $2, $3)
    RETURNING *
  `;

  const result = await query(q, [user.name, user.username, hashedPassword]);

  if (result?.rowCount === 1) {
    return result.rows[0];
  }

  return null;
}
