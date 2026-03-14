import bcrypt from 'bcryptjs';

//function to hash password
export const hashPassword = async (password) => {
  const saltRounds = 10;
  const hash = await bcrypt.hash(password, saltRounds);
  return hash;
}

//function to verify a password against a hash
export const verifyPassword = async (password, hash) => {
  const match = await bcrypt.compare(password, hash);
  return match; //true if password matches hash
}

