export const validatePhoneNumber = (phone: string): string | null => {
  if (!phone) return null;
  // Expected format: +265 followed by 9 digits
  const regex = /^\+265\d{9}$/;
  if (!regex.test(phone)) {
    return "Phone number must be +265 followed by exactly 9 digits";
  }
  return null;
};

export const validateNationalID = (id: string): string | null => {
  if (!id) return null;
  const regex = /^[A-Z0-9]{8}$/;
  if (!regex.test(id)) return "National ID must be exactly 8 characters (uppercase letters/digits)";
  return null;
};

export const validateEmploymentNumber = (num: string): string | null => {
  if (!num) return null;
  if (!/^\d+$/.test(num)) return "Must contain only numbers";
  if (num.length > 8) return "Maximum of 8 digits allowed";
  return null;
};

export const validateDOB = (dob: string): string | null => {
  if (!dob || dob === '--') return null;
  const birthDate = new Date(dob);
  const today = new Date();
  if (isNaN(birthDate.getTime())) return "Invalid date format";
  
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  
  if (age < 16) return "HSA must be at least 16 years old";
  if (age > 80) return "HSA age exceeds the maximum limit (80 years)";
  return null;
};

export const validateYearAppointed = (dateStr: string, dob: string): string | null => {
  if (!dateStr || !dob) return null;
  const birthDate = new Date(dob);
  const appointedDate = new Date(dateStr);
  if (isNaN(appointedDate.getTime())) return null;
  
  const minAppointedDate = new Date(birthDate);
  minAppointedDate.setFullYear(birthDate.getFullYear() + 16);
  
  if (appointedDate < minAppointedDate) return "Appointment date must be at least 16 years after birth";
  if (appointedDate > new Date()) return "Appointment date cannot be in the future";
  return null;
};

export const validatePositiveNumber = (val: number | string, label: string): string | null => {
  if (val === undefined || val === '') return null;
  const num = Number(val);
  if (isNaN(num) || num <= 0) return `${label} must be a positive number greater than zero`;
  return null;
};

export const validateWorkPlanDate = (dateStr: string, planMonth: string, planYear: string): string | null => {
  if (!dateStr || !planMonth || !planYear) return null;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "Invalid date";
  
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dateMonthIndex = date.getMonth();
  const planMonthIndex = months.indexOf(planMonth);
  const dateYear = date.getFullYear().toString();
  
  if (dateYear !== planYear) return `Year must be ${planYear}`;
  if (dateMonthIndex !== planMonthIndex) return `Must be in ${planMonth}`;
  
  return null;
};

export const validateDateRange = (start: string, end: string): string | null => {
  if (!start || !end) return null;
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (endDate < startDate) return "End date cannot be before start date";
  return null;
};

export const validatePasswordComplexity = (password: string): string | null => {
  if (password.length < 8) return "Password must be at least 8 characters long";
  if (!/[a-zA-Z]/.test(password)) return "Password must contain at least one letter";
  if (!/\d/.test(password)) return "Password must contain at least one number";
  return null;
};

export const validatePasswordsMatch = (p1: string, p2: string): string | null => {
  if (p1 !== p2) return "Passwords do not match";
  return null;
};
