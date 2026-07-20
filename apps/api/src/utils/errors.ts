// Domain-specific error class.
// statusCode is read by the Fastify error handler to set the HTTP response code.
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function notFound(code: string, message: string): AppError {
  return new AppError(404, code, message);
}

export function conflict(code: string, message: string): AppError {
  return new AppError(409, code, message);
}

export function badRequest(code: string, message: string): AppError {
  return new AppError(400, code, message);
}
