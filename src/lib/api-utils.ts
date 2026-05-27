// Common TypeScript types and utilities for API handlers

export interface ApiError {
  error: string;
  status?: number;
}

export interface MongoDocument {
  _id?: string;
  __v?: number;
}

export function handleMongoError(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes("duplicate key")) {
      return "This record already exists";
    }
    if (error.message.includes("validation failed")) {
      return "Invalid data provided";
    }
    return error.message;
  }
  return "An unexpected error occurred";
}

export function cleanMongoDoc(
  doc: Record<string, unknown>,
): Record<string, unknown> {
  const { _id, __v, ...rest } = doc;
  return rest;
}
