export type SuccessEnvelope<T> = {
  data: T;
  next_cursor?: string | null;
};

export type ErrorEnvelope = {
  error: {
    code: 400 | 404 | 422 | 500;
    message: string;
    details?: unknown;
  };
};

export function ok<T>(data: T, nextCursor?: string | null): SuccessEnvelope<T> {
  return { data, next_cursor: nextCursor ?? null };
}

export function badRequest(message: string, details?: unknown): ErrorEnvelope {
  return { error: { code: 400, message, details } };
}

export function notFound(message = 'Not found'): ErrorEnvelope {
  return { error: { code: 404, message } };
}

export function unprocessable(message: string, details?: unknown): ErrorEnvelope {
  return { error: { code: 422, message, details } };
}

export function serverError(message = 'Internal Server Error', details?: unknown): ErrorEnvelope {
  return { error: { code: 500, message, details } };
}
