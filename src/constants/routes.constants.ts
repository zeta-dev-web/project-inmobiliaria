export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
} as const;

export const PUBLIC_ROUTES = [ROUTES.LOGIN] as const;
