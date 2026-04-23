export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly title: string,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(404, message, 'Not Found');
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed') {
    super(400, message, 'Validation Error');
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(401, message, 'Unauthorized');
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(403, message, 'Forbidden');
  }
}
