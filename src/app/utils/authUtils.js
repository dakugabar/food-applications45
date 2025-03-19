import bcrypt from 'bcryptjs';

// Hash the password
export async function hashPassword(password) {
  return await bcrypt.hash(password, 12);
}
