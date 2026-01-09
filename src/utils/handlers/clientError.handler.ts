import { AxiosError } from 'axios';
import { toast } from 'sonner';

export interface ClientError {
  message: string;
  status?: number;
  errors?: unknown[];
}

export function handleClientError(error: unknown): ClientError {
  console.error('Client Error:', error);

  if (error instanceof AxiosError) {
    const message = error.response?.data?.message || error.message;
    const status = error.response?.status;
    const errors = error.response?.data?.errors;

    toast.error(message);

    return {
      message,
      status,
      errors,
    };
  }

  if (error instanceof Error) {
    toast.error(error.message);
    return {
      message: error.message,
    };
  }

  const defaultMessage = 'An unexpected error occurred';
  toast.error(defaultMessage);

  return {
    message: defaultMessage,
  };
}
