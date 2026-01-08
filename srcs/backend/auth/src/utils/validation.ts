// password validation utilities

// password requirements:
// - at least 8 characters
// - at least 1 uppercase letter
// - at least 1 lowercase letter
// - at least 1 number
// - at least 1 special character

export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
}

// validates password meets all security requirements
export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];
  
  if (!password || password.length < 8) {
    errors.push("password must be at least 8 characters");
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push("password must contain at least 1 uppercase letter");
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push("password must contain at least 1 lowercase letter");
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push("password must contain at least 1 number");
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password)) {
    errors.push("password must contain at least 1 special character (!@#$%^&*()_+-=[]{}|;':\",./<>?`~)");
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// returns user-friendly password requirements message
export function getPasswordRequirements(): string {
  return "password must be at least 8 characters and contain: 1 uppercase letter, 1 lowercase letter, 1 number, 1 special character";
}
