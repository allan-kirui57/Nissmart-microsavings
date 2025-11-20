import { v4 as uuidv4 } from 'uuid';

export function generateId(): string {
  return uuidv4();
}

export function formatResponse(
  status: string,
  data: any,
  message: string = ''
): object {
  return {
    status,
    message,
    data,
    timestamp: new Date().toISOString()
  };
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
