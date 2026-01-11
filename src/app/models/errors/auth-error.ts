/**
 * Custom error class for authentication-related errors
 */
export class AuthenticationError extends Error {
  constructor(message: string = 'User not authenticated') {
    super(message);
    this.name = 'AuthenticationError';
    
    // Maintain proper stack trace for where the error was thrown (only available in V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AuthenticationError);
    }
  }
}
