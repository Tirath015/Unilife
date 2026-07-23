export function isCollegeEmail(email) {
  return /^[^\s@]+@[^\s@]+\.(edu|ca|com|org)$/i.test(email);
}

export function getPasswordErrors(password) {
  const errors = [];

  if (!password || password.length < 8) {
    errors.push("Password must be at least 8 characters.");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must include at least one uppercase letter.");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must include at least one lowercase letter.");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Password must include at least one number.");
  }

  if (!/[!@#$%^&*]/.test(password)) {
    errors.push("Password must include at least one special character.");
  }

  return errors;
}

export function validatePassword(password) {
  return getPasswordErrors(password).length === 0;
}