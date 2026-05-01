import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

export const hashPassword = async (password) => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

export const validatePasswordStrength = (password) => {
  const errors = [];

  if (password.length < 8) {
    errors.push("At least 8 characters");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("At least one lowercase letter");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("At least one uppercase letter");
  }
  if (!/\d/.test(password)) {
    errors.push("At least one number");
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("At least one special character");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
