import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import httpStatus from 'http-status';
import logger from '@/src/utils/logger';

export class ApiError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }
}

export function handleApiError(error: unknown) {
  logger.error('API Error occurred', {
    error: error instanceof Error ? error.message : 'Unknown error',
    stack: error instanceof Error ? error.stack : undefined,
    timestamp: new Date().toISOString(),
  });

  if (error instanceof ZodError) {
    logger.warn('Validation error', {
      errors: error.issues,
      timestamp: new Date().toISOString(),
    });
    
    return NextResponse.json(
      {
        message: 'Validation error',
        errors: error.issues,
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

// Alias para compatibilidad
export const apiErrorHandler = handleApiError;