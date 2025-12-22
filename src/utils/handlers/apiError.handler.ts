import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import httpStatus from 'http-status';

export class ApiError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }
}

export function handleApiError(error: unknown) {
  console.error('API Error:', error);

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        message: 'Validation error',
        errors: error.errors,
      },
      { status: httpStatus.BAD_REQUEST }
    );
  }

  if (error instanceof ApiError) {
    return NextResponse.json(
      { message: error.message },
      { status: error.statusCode }
    );
  }

  if (error instanceof Error) {
    return NextResponse.json(
      { message: error.message },
      { status: httpStatus.INTERNAL_SERVER_ERROR }
    );
  }

  return NextResponse.json(
    { message: 'Internal server error' },
    { status: httpStatus.INTERNAL_SERVER_ERROR }
  );
}